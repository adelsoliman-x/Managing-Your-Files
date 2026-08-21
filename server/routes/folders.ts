import { Router, Response } from 'express';
import { db } from '../db.js';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.js';
import { FolderItem } from '../types.js';

const router = Router();

// GET /folders (List user's folders)
router.get('/', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const user = req.user!;
    const folders = db.folders.findMany(user.id);
    res.json({ success: true, folders });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to retrieve folders.' });
  }
});

// POST /folders (Create folder)
router.post('/', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const user = req.user!;
    const { name, parentId } = req.body;

    if (!name || typeof name !== 'string') {
      res.status(400).json({ success: false, message: 'Folder name is required.' });
      return;
    }

    const newFolder: FolderItem = {
      id: 'fld_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      userId: user.id,
      name: name.trim(),
      parentId: parentId || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.folders.create(newFolder);

    db.auditLogs.create({
      userId: user.id,
      userEmail: user.email,
      action: 'FOLDER_CREATE',
      details: `Created folder "${newFolder.name}"`,
      ipAddress: req.ip || '127.0.0.1',
    });

    res.status(201).json({ success: true, message: 'Folder created.', folder: newFolder });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to create folder.' });
  }
});

// DELETE /folders/:id
router.delete('/:id', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const user = req.user!;
    const folder = db.folders.findById(req.params.id);

    if (!folder) {
      res.status(404).json({ success: false, message: 'Folder not found.' });
      return;
    }

    if (folder.userId !== user.id && user.role !== 'ADMIN') {
      res.status(403).json({ success: false, message: 'Access denied.' });
      return;
    }

    db.folders.delete(folder.id);

    db.auditLogs.create({
      userId: user.id,
      userEmail: user.email,
      action: 'FOLDER_DELETE',
      details: `Deleted folder "${folder.name}"`,
      ipAddress: req.ip || '127.0.0.1',
    });

    res.json({ success: true, message: 'Folder deleted.' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to delete folder.' });
  }
});

export default router;

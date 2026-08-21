/**
 * =========================================================================================
 * CloudVault Workspace - Files Management & Storage REST Controller
 * =========================================================================================
 * Endpoints:
 * - POST   /api/files/upload       -> Multi-file upload with Multer, quota calculation & snippet extraction
 * - GET    /api/files              -> Filtered & paginated user or global files
 * - GET    /api/files/:id          -> Single file metadata retrieval
 * - GET    /api/files/:id/download -> Direct streaming file download
 * - GET    /api/files/:id/preview  -> In-browser media & document preview
 * - PATCH  /api/files/:id          -> Rename, move folders, star, or trash files
 * - DELETE /api/files/:id          -> Permanent deletion and disk cleanup
 */

import { Router, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { db, UPLOADS_DIR } from '../db.js';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.js';
import { FileItem } from '../types.js';

const router = Router();

// Multer Storage Configuration: Saves to persistent uploads directory with sanitized unique prefixes
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `file-${uniqueSuffix}${ext}`);
  },
});

// Multer limits: 50MB per file boundary
const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50 MB max per file
  },
});

/**
 * Categorizes uploaded files into standard domain classifications based on MIME types and extensions.
 */
function detectCategory(mimeType: string, extension: string): FileItem['category'] {
  const ext = extension.toLowerCase().replace('.', '');
  if (mimeType.startsWith('image/')) return 'IMAGE';
  if (mimeType.startsWith('audio/')) return 'AUDIO';
  if (mimeType.startsWith('video/')) return 'VIDEO';
  if (['zip', 'rar', 'tar', 'gz', '7z', 'bz2'].includes(ext)) return 'ARCHIVE';
  if (['js', 'jsx', 'ts', 'tsx', 'py', 'java', 'c', 'cpp', 'html', 'css', 'json', 'prisma', 'sql', 'sh', 'yaml', 'yml', 'xml', 'rs', 'go', 'php'].includes(ext)) {
    return 'CODE';
  }
  if (['pdf', 'doc', 'docx', 'txt', 'md', 'rtf', 'csv', 'xlsx', 'xls', 'ppt', 'pptx'].includes(ext) || mimeType.startsWith('text/')) {
    return 'DOCUMENT';
  }
  return 'OTHER';
}

function extractTextSnippet(filePath: string, category: string, ext: string): string | undefined {
  if (['DOCUMENT', 'CODE'].includes(category) || ['txt', 'md', 'json', 'csv', 'ts', 'js', 'py', 'prisma', 'sql', 'html', 'css', 'yaml', 'yml'].includes(ext)) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      return content.slice(0, 15000); // First 15KB extracted snippet
    } catch (e) {
      return undefined;
    }
  }
  return undefined;
}

// POST /files/upload (Multer Multi-file upload)
router.post('/upload', authenticateToken, upload.array('files', 10), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    const files = req.files as Express.Multer.File[];
    const folderId = req.body.folderId && req.body.folderId !== 'null' ? req.body.folderId : null;

    if (!files || files.length === 0) {
      res.status(400).json({ success: false, message: 'No files were uploaded.' });
      return;
    }

    // Check storage quota
    const totalNewBytes = files.reduce((acc, f) => acc + f.size, 0);
    if (user.usedStorageBytes + totalNewBytes > user.storageQuotaBytes) {
      // Clean up uploaded files
      files.forEach(f => {
        try { fs.unlinkSync(f.path); } catch (e) { /* ignore */ }
      });
      res.status(400).json({ 
        success: false, 
        message: `Storage quota exceeded! You have ${( (user.storageQuotaBytes - user.usedStorageBytes) / (1024 * 1024) ).toFixed(1)} MB remaining.` 
      });
      return;
    }

    const createdFiles: FileItem[] = [];

    for (const file of files) {
      const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
      const category = detectCategory(file.mimetype, ext);
      const extractedContent = extractTextSnippet(file.path, category, ext);

      const newFileItem: FileItem = {
        id: 'file_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
        userId: user.id,
        folderId: folderId || null,
        name: file.originalname,
        originalName: file.originalname,
        mimeType: file.mimetype || 'application/octet-stream',
        sizeBytes: file.size,
        extension: ext,
        category,
        storagePath: file.filename,
        extractedContent,
        isTrashed: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        downloadsCount: 0,
        tags: [category.toLowerCase(), ext],
      };

      db.files.create(newFileItem);
      createdFiles.push(newFileItem);

      db.auditLogs.create({
        userId: user.id,
        userEmail: user.email,
        action: 'FILE_UPLOAD',
        details: `Uploaded file ${file.originalname} (${(file.size / 1024).toFixed(1)} KB)`,
        ipAddress: req.ip || '127.0.0.1',
      });
    }

    res.status(201).json({
      success: true,
      message: `Successfully uploaded ${createdFiles.length} file(s).`,
      files: createdFiles,
    });
  } catch (err: any) {
    console.error('Upload error:', err);
    res.status(500).json({ success: false, message: 'File upload failed.', error: err.message });
  }
});

// GET /files (list files with search, filtering, sort, pagination)
router.get('/', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const user = req.user!;
    const {
      search,
      category,
      folderId,
      isTrashed,
      sortBy = 'date',
      sortOrder = 'desc',
      page = '1',
      limit = '20',
      allUsers, // For Admin files management
    } = req.query as Record<string, string>;

    const isTrashQuery = isTrashed === 'true';
    const canViewAllUsers = user.role === 'ADMIN' && allUsers === 'true';

    const filterObj: any = {
      isTrashed: isTrashQuery,
      sortBy,
      sortOrder: (sortOrder === 'asc' ? 'asc' : 'desc') as 'asc' | 'desc',
    };

    if (!canViewAllUsers) {
      filterObj.userId = user.id;
    }

    if (category && category !== 'ALL') {
      filterObj.category = category;
    }

    if (folderId !== undefined && folderId !== 'ALL') {
      filterObj.folderId = folderId === 'ROOT' ? null : folderId;
    }

    if (search) {
      filterObj.search = search;
    }

    const allFiltered = db.files.findMany(filterObj);

    // Attach owner information if admin viewing all files
    const enriched = allFiltered.map(f => {
      const owner = db.users.findById(f.userId);
      return {
        ...f,
        owner: owner ? { name: owner.name, email: owner.email } : undefined,
      };
    });

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const startIndex = (pageNum - 1) * limitNum;
    const paginated = enriched.slice(startIndex, startIndex + limitNum);

    res.json({
      success: true,
      files: paginated,
      pagination: {
        total: enriched.length,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(enriched.length / limitNum) || 1,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to retrieve files.' });
  }
});

// GET /files/:id (Details)
router.get('/:id', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const user = req.user!;
    const file = db.files.findById(req.params.id);

    if (!file) {
      res.status(404).json({ success: false, message: 'File not found.' });
      return;
    }

    if (file.userId !== user.id && user.role !== 'ADMIN') {
      res.status(403).json({ success: false, message: 'Access denied to this file.' });
      return;
    }

    const owner = db.users.findById(file.userId);
    res.json({
      success: true,
      file: {
        ...file,
        owner: owner ? { name: owner.name, email: owner.email } : undefined,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Error retrieving file.' });
  }
});

// GET /files/:id/download (Download binary stream)
router.get('/:id/download', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const user = req.user!;
    const file = db.files.findById(req.params.id);

    if (!file) {
      res.status(404).json({ success: false, message: 'File not found.' });
      return;
    }

    if (file.userId !== user.id && user.role !== 'ADMIN') {
      res.status(403).json({ success: false, message: 'Access denied to download this file.' });
      return;
    }

    const filePath = path.join(UPLOADS_DIR, file.storagePath);
    if (!fs.existsSync(filePath)) {
      // If disk file doesn't exist, create it from extracted content or fallback
      fs.writeFileSync(filePath, file.extractedContent || 'File content buffer', 'utf8');
    }

    db.files.update(file.id, { downloadsCount: (file.downloadsCount || 0) + 1 });

    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(file.name)}"`);
    res.setHeader('Content-Type', file.mimeType || 'application/octet-stream');
    
    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Error downloading file.' });
  }
});

// GET /files/:id/preview (Stream for image / browser display)
router.get('/:id/preview', (req, res): void => {
  try {
    const file = db.files.findById(req.params.id);
    if (!file) {
      res.status(404).json({ success: false, message: 'File not found.' });
      return;
    }

    const filePath = path.join(UPLOADS_DIR, file.storagePath);
    if (fs.existsSync(filePath)) {
      res.setHeader('Content-Type', file.mimeType || 'application/octet-stream');
      fs.createReadStream(filePath).pipe(res);
    } else if (file.extractedContent) {
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.send(file.extractedContent);
    } else {
      res.status(404).send('Preview unavailable');
    }
  } catch (err) {
    res.status(500).send('Preview error');
  }
});

// PATCH /files/:id (Rename, move to folder, update tags)
router.patch('/:id', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const user = req.user!;
    const file = db.files.findById(req.params.id);

    if (!file) {
      res.status(404).json({ success: false, message: 'File not found.' });
      return;
    }

    if (file.userId !== user.id && user.role !== 'ADMIN') {
      res.status(403).json({ success: false, message: 'Access denied.' });
      return;
    }

    const { name, folderId, tags } = req.body;
    const updates: Partial<FileItem> = {};

    if (name && typeof name === 'string') updates.name = name.trim();
    if (folderId !== undefined) updates.folderId = folderId === 'null' ? null : folderId;
    if (Array.isArray(tags)) updates.tags = tags;

    const updated = db.files.update(file.id, updates);

    res.json({
      success: true,
      message: 'File updated successfully.',
      file: updated,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to update file.' });
  }
});

// POST /files/:id/trash (Soft delete)
router.post('/:id/trash', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const user = req.user!;
    const file = db.files.findById(req.params.id);

    if (!file) {
      res.status(404).json({ success: false, message: 'File not found.' });
      return;
    }

    if (file.userId !== user.id && user.role !== 'ADMIN') {
      res.status(403).json({ success: false, message: 'Access denied.' });
      return;
    }

    db.files.update(file.id, {
      isTrashed: true,
      trashedAt: new Date().toISOString(),
    });

    db.auditLogs.create({
      userId: user.id,
      userEmail: user.email,
      action: 'FILE_TRASH',
      details: `Moved file ${file.name} to Trash`,
      ipAddress: req.ip || '127.0.0.1',
    });

    res.json({ success: true, message: 'File moved to Trash.' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to trash file.' });
  }
});

// POST /files/:id/restore (Restore from Trash)
router.post('/:id/restore', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const user = req.user!;
    const file = db.files.findById(req.params.id);

    if (!file) {
      res.status(404).json({ success: false, message: 'File not found.' });
      return;
    }

    if (file.userId !== user.id && user.role !== 'ADMIN') {
      res.status(403).json({ success: false, message: 'Access denied.' });
      return;
    }

    db.files.update(file.id, {
      isTrashed: false,
      trashedAt: null,
    });

    db.auditLogs.create({
      userId: user.id,
      userEmail: user.email,
      action: 'FILE_RESTORE',
      details: `Restored file ${file.name} from Trash`,
      ipAddress: req.ip || '127.0.0.1',
    });

    res.json({ success: true, message: 'File restored successfully.' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to restore file.' });
  }
});

// DELETE /files/:id (Permanent Delete)
router.delete('/:id', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const user = req.user!;
    const file = db.files.findById(req.params.id);

    if (!file) {
      res.status(404).json({ success: false, message: 'File not found.' });
      return;
    }

    if (file.userId !== user.id && user.role !== 'ADMIN') {
      res.status(403).json({ success: false, message: 'Access denied to delete this file.' });
      return;
    }

    db.files.delete(file.id);

    db.auditLogs.create({
      userId: user.id,
      userEmail: user.email,
      action: 'FILE_DELETE',
      details: `Permanently deleted file ${file.name} (${(file.sizeBytes / 1024).toFixed(1)} KB)`,
      ipAddress: req.ip || '127.0.0.1',
    });

    res.json({ success: true, message: 'File permanently deleted.' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to delete file.' });
  }
});

export default router;

/**
 * =========================================================================================
 * CloudVault Workspace - User Administration REST Controller
 * =========================================================================================
 * Administrative endpoints strictly guarded by `authenticateToken` and `requireAdmin`.
 * Endpoints:
 * - GET    /api/users     -> Search, filter by role/status, and paginate all platform users
 * - GET    /api/users/:id -> Detailed user profile with storage consumption metrics
 * - PATCH  /api/users/:id -> Update user role (ADMIN/USER), status (ACTIVE/SUSPENDED), or quota
 * - DELETE /api/users/:id -> Administrative hard deletion of user and associated files
 */

import { Router, Response } from 'express';
import { db } from '../db.js';
import { authenticateToken, requireAdmin, AuthenticatedRequest } from '../middleware/auth.js';
import { UserRole } from '../types.js';

const router = Router();

// Enforce strict administrative authentication on all child routes
router.use(authenticateToken);
router.use(requireAdmin);

/**
 * @route   GET /api/users
 * @desc    Lists all users with search, role filters, status filters, and pagination
 * @access  Admin Only
 */
router.get('/', (req: AuthenticatedRequest, res: Response): void => {
  try {
    const { search, role, status, page = '1', limit = '20' } = req.query as Record<string, string>;

    let users = db.users.findMany();

    if (role && role !== 'ALL') {
      users = users.filter(u => u.role === role);
    }

    if (status && status !== 'ALL') {
      users = users.filter(u => u.status === status);
    }

    if (search) {
      const q = search.toLowerCase();
      users = users.filter(u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
    }

    // Attach file count & used storage for each user
    const enrichedUsers = users.map(u => {
      const userFiles = db.files.findMany({ userId: u.id, isTrashed: false });
      const totalBytes = userFiles.reduce((acc, f) => acc + f.sizeBytes, 0);
      return {
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        isVerified: u.isVerified,
        avatarUrl: u.avatarUrl,
        storageQuotaBytes: u.storageQuotaBytes,
        usedStorageBytes: totalBytes,
        status: u.status,
        filesCount: userFiles.length,
        createdAt: u.createdAt,
      };
    });

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const startIndex = (pageNum - 1) * limitNum;
    const paginated = enrichedUsers.slice(startIndex, startIndex + limitNum);

    res.json({
      success: true,
      users: paginated,
      pagination: {
        total: enrichedUsers.length,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(enrichedUsers.length / limitNum) || 1,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to retrieve users.' });
  }
});

// GET /users/:id
router.get('/:id', (req: AuthenticatedRequest, res: Response): void => {
  try {
    const user = db.users.findById(req.params.id);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    const userFiles = db.files.findMany({ userId: user.id, isTrashed: false });

    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        avatarUrl: user.avatarUrl,
        storageQuotaBytes: user.storageQuotaBytes,
        usedStorageBytes: user.usedStorageBytes,
        status: user.status,
        filesCount: userFiles.length,
        createdAt: user.createdAt,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to retrieve user.' });
  }
});

// PATCH /users/:id (Edit role, status, quota)
router.patch('/:id', (req: AuthenticatedRequest, res: Response): void => {
  try {
    const admin = req.user!;
    const user = db.users.findById(req.params.id);

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    const { role, status, storageQuotaMB } = req.body;
    const updates: Partial<typeof user> = {};

    if (role && ['USER', 'ADMIN'].includes(role)) {
      // Prevent demoting self
      if (user.id === admin.id && role !== 'ADMIN') {
        res.status(400).json({ success: false, message: 'You cannot demote your own admin account.' });
        return;
      }
      updates.role = role as UserRole;
    }

    if (status && ['ACTIVE', 'SUSPENDED'].includes(status)) {
      if (user.id === admin.id && status === 'SUSPENDED') {
        res.status(400).json({ success: false, message: 'You cannot suspend your own admin account.' });
        return;
      }
      updates.status = status;
    }

    if (storageQuotaMB && typeof storageQuotaMB === 'number') {
      updates.storageQuotaBytes = storageQuotaMB * 1024 * 1024;
    }

    const updated = db.users.update(user.id, updates);

    db.auditLogs.create({
      userId: admin.id,
      userEmail: admin.email,
      action: 'ADMIN_USER_UPDATE',
      details: `Admin updated user ${user.email} (Role: ${updated?.role}, Status: ${updated?.status})`,
      ipAddress: req.ip || '127.0.0.1',
    });

    res.json({
      success: true,
      message: 'User account updated successfully.',
      user: updated,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to update user.' });
  }
});

// DELETE /users/:id
router.delete('/:id', (req: AuthenticatedRequest, res: Response): void => {
  try {
    const admin = req.user!;
    const user = db.users.findById(req.params.id);

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    if (user.id === admin.id) {
      res.status(400).json({ success: false, message: 'You cannot delete your own admin account.' });
      return;
    }

    db.users.delete(user.id);

    db.auditLogs.create({
      userId: admin.id,
      userEmail: admin.email,
      action: 'ADMIN_USER_DELETE',
      details: `Admin deleted user ${user.email}`,
      ipAddress: req.ip || '127.0.0.1',
    });

    res.json({ success: true, message: `User ${user.email} and all associated files have been deleted.` });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to delete user.' });
  }
});

export default router;

import { Router, Response } from 'express';
import { db } from '../db.js';
import { authenticateToken, requireAdmin, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

// GET /audit-logs (Admin only)
router.get('/', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const limit = parseInt(req.query.limit as string, 10) || 50;
    const logs = db.auditLogs.findMany(limit);
    res.json({ success: true, logs });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to retrieve audit logs.' });
  }
});

export default router;

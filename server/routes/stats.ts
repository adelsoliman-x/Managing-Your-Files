/**
 * =========================================================================================
 * CloudVault Workspace - Analytics & Statistics REST Controller
 * =========================================================================================
 * Endpoints:
 * - GET    /api/stats/user  -> User-specific quota utilization, file category breakdown & upload history
 * - GET    /api/stats/admin -> Platform-wide metrics, system storage consumption, and growth trends
 */

import { Router, Response } from 'express';
import { db } from '../db.js';
import { authenticateToken, requireAdmin, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

/**
 * @route   GET /api/stats/user
 * @desc    Computes analytics and visualization charts data for the authenticated user
 * @access  Private (Authenticated)
 */
router.get('/user', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const user = req.user!;
    const userFiles = db.files.findMany({ userId: user.id, isTrashed: false });
    const trashedFiles = db.files.findMany({ userId: user.id, isTrashed: true });

    const totalFiles = userFiles.length;
    const totalStorageBytes = userFiles.reduce((acc, f) => acc + f.sizeBytes, 0);

    // Category breakdown
    const categoriesMap: Record<string, { count: number; bytes: number; color: string }> = {
      DOCUMENT: { count: 0, bytes: 0, color: '#3B82F6' },
      IMAGE: { count: 0, bytes: 0, color: '#10B981' },
      CODE: { count: 0, bytes: 0, color: '#F59E0B' },
      AUDIO: { count: 0, bytes: 0, color: '#8B5CF6' },
      VIDEO: { count: 0, bytes: 0, color: '#EC4899' },
      ARCHIVE: { count: 0, bytes: 0, color: '#6366F1' },
      OTHER: { count: 0, bytes: 0, color: '#9CA3AF' },
    };

    userFiles.forEach(file => {
      const cat = file.category || 'OTHER';
      if (!categoriesMap[cat]) {
        categoriesMap[cat] = { count: 0, bytes: 0, color: '#9CA3AF' };
      }
      categoriesMap[cat].count += 1;
      categoriesMap[cat].bytes += file.sizeBytes;
    });

    const categoryStats = Object.keys(categoriesMap).map(category => ({
      category,
      count: categoriesMap[category].count,
      bytes: categoriesMap[category].bytes,
      formattedSize: (categoriesMap[category].bytes / (1024 * 1024)).toFixed(2) + ' MB',
      color: categoriesMap[category].color,
    }));

    // Upload History (past 7 days or months)
    const historyMap: Record<string, { count: number; bytes: number }> = {};
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateKey = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      historyMap[dateKey] = { count: 0, bytes: 0 };
    }

    userFiles.forEach(file => {
      const fDate = new Date(file.createdAt);
      const dateKey = fDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (historyMap[dateKey]) {
        historyMap[dateKey].count += 1;
        historyMap[dateKey].bytes += file.sizeBytes;
      }
    });

    const uploadHistory = Object.keys(historyMap).map(date => ({
      date,
      files: historyMap[date].count,
      mb: parseFloat((historyMap[date].bytes / (1024 * 1024)).toFixed(2)),
    }));

    // Recent 5 uploads
    const recentFiles = [...userFiles]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);

    res.json({
      success: true,
      stats: {
        totalFiles,
        trashedCount: trashedFiles.length,
        usedStorageBytes: totalStorageBytes,
        storageQuotaBytes: user.storageQuotaBytes,
        storageUsedPercent: Math.min(100, Math.round((totalStorageBytes / user.storageQuotaBytes) * 100)),
        categoryStats,
        uploadHistory,
        recentFiles,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to compute user statistics.' });
  }
});

// GET /stats/admin (Overall system metrics for Admin Dashboard)
router.get('/admin', authenticateToken, requireAdmin, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const allUsers = db.users.findMany();
    const allFiles = db.files.findMany({ isTrashed: false });
    const allTrashedFiles = db.files.findMany({ isTrashed: true });

    const totalUsers = allUsers.length;
    const activeUsers = allUsers.filter(u => u.status === 'ACTIVE').length;
    const verifiedUsers = allUsers.filter(u => u.isVerified).length;
    const adminCount = allUsers.filter(u => u.role === 'ADMIN').length;

    const totalFiles = allFiles.length;
    const totalStorageBytes = allFiles.reduce((acc, f) => acc + f.sizeBytes, 0);

    // Most uploaded file types (extensions)
    const extMap: Record<string, number> = {};
    allFiles.forEach(f => {
      const ext = (f.extension || 'unknown').toUpperCase();
      extMap[ext] = (extMap[ext] || 0) + 1;
    });

    const topFileTypes = Object.entries(extMap)
      .map(([extension, count]) => ({ extension, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Categories aggregate
    const categoriesMap: Record<string, { count: number; bytes: number }> = {};
    allFiles.forEach(f => {
      const cat = f.category || 'OTHER';
      if (!categoriesMap[cat]) categoriesMap[cat] = { count: 0, bytes: 0 };
      categoriesMap[cat].count += 1;
      categoriesMap[cat].bytes += f.sizeBytes;
    });

    const categoryStats = Object.keys(categoriesMap).map(category => ({
      category,
      count: categoriesMap[category].count,
      bytes: categoriesMap[category].bytes,
      mb: parseFloat((categoriesMap[category].bytes / (1024 * 1024)).toFixed(2)),
    }));

    // Recent 10 uploads across all users
    const recentUploads = [...allFiles]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10)
      .map(f => {
        const owner = allUsers.find(u => u.id === f.userId);
        return {
          ...f,
          owner: owner ? { name: owner.name, email: owner.email } : undefined,
        };
      });

    res.json({
      success: true,
      stats: {
        totalUsers,
        activeUsers,
        verifiedUsers,
        adminCount,
        totalFiles,
        trashedFilesCount: allTrashedFiles.length,
        totalStorageBytes,
        formattedTotalStorage: (totalStorageBytes / (1024 * 1024)).toFixed(2) + ' MB',
        topFileTypes,
        categoryStats,
        recentUploads,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to compute admin statistics.' });
  }
});

export default router;

export type UserRole = 'USER' | 'ADMIN';
export type UserStatus = 'ACTIVE' | 'SUSPENDED';
export type FileCategory = 'IMAGE' | 'DOCUMENT' | 'AUDIO' | 'VIDEO' | 'ARCHIVE' | 'CODE' | 'OTHER';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isVerified: boolean;
  avatarUrl?: string;
  storageQuotaBytes: number;
  usedStorageBytes: number;
  status?: UserStatus;
  filesCount?: number;
  createdAt?: string;
}

export interface FileItem {
  id: string;
  userId: string;
  folderId?: string | null;
  name: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  extension: string;
  category: FileCategory;
  storagePath: string;
  extractedContent?: string;
  isTrashed: boolean;
  trashedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  downloadsCount: number;
  tags: string[];
  owner?: {
    name: string;
    email: string;
  };
}

export interface FolderItem {
  id: string;
  userId: string;
  name: string;
  parentId?: string | null;
  createdAt: string;
  updatedAt: string;
  filesCount?: number;
}

export interface CategoryStat {
  category: string;
  count: number;
  bytes: number;
  formattedSize: string;
  color: string;
}

export interface UploadHistoryPoint {
  date: string;
  files: number;
  mb: number;
}

export interface UserStats {
  totalFiles: number;
  trashedCount: number;
  usedStorageBytes: number;
  storageQuotaBytes: number;
  storageUsedPercent: number;
  categoryStats: CategoryStat[];
  uploadHistory: UploadHistoryPoint[];
  recentFiles: FileItem[];
}

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  verifiedUsers: number;
  adminCount: number;
  totalFiles: number;
  trashedFilesCount: number;
  totalStorageBytes: number;
  formattedTotalStorage: string;
  topFileTypes: { extension: string; count: number }[];
  categoryStats: { category: string; count: number; bytes: number; mb: number }[];
  recentUploads: FileItem[];
}

export interface AuditLog {
  id: string;
  userId?: string;
  userEmail?: string;
  action: string;
  details: string;
  ipAddress?: string;
  timestamp: string;
}

export type ActiveTab =
  | 'landing'
  | 'my-files'
  | 'trash'
  | 'user-analytics'
  | 'admin-dashboard'
  | 'admin-users'
  | 'admin-files'
  | 'audit-logs'
  | 'deliverables';

export type UserRole = 'USER' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  isVerified: boolean;
  avatarUrl?: string;
  storageQuotaBytes: number; // e.g. 500MB (524288000)
  usedStorageBytes: number;
  status: 'ACTIVE' | 'SUSPENDED';
  createdAt: string;
  updatedAt: string;
}

export interface VerificationCode {
  id: string;
  email: string;
  code: string; // 6 digits
  type: 'EMAIL_VERIFICATION' | 'PASSWORD_RESET';
  expiresAt: string;
  createdAt: string;
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
  category: 'IMAGE' | 'DOCUMENT' | 'AUDIO' | 'VIDEO' | 'ARCHIVE' | 'CODE' | 'OTHER';
  storagePath: string;
  extractedContent?: string;
  isTrashed: boolean;
  trashedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  downloadsCount: number;
  tags: string[];
}

export interface FolderItem {
  id: string;
  userId: string;
  name: string;
  parentId?: string | null;
  createdAt: string;
  updatedAt: string;
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

export interface AuthJWTPayload {
  userId: string;
  email: string;
  role: UserRole;
}

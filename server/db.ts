import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { User, VerificationCode, FileItem, FolderItem, AuditLog } from './types.js';

interface DatabaseData {
  users: User[];
  verificationCodes: VerificationCode[];
  files: FileItem[];
  folders: FolderItem[];
  auditLogs: AuditLog[];
}

const DATA_DIR = path.join(process.cwd(), '.data');
const DB_FILE = path.join(DATA_DIR, 'db.json');
export const UPLOADS_DIR = path.join(process.cwd(), 'uploads');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

let dbData: DatabaseData = {
  users: [],
  verificationCodes: [],
  files: [],
  folders: [],
  auditLogs: [],
};

function saveDb() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(dbData, null, 2), 'utf8');
  } catch (err) {
    console.error('Failed to save database to disk:', err);
  }
}

function loadDb() {
  if (fs.existsSync(DB_FILE)) {
    try {
      const raw = fs.readFileSync(DB_FILE, 'utf8');
      dbData = JSON.parse(raw);
    } catch (err) {
      console.error('Failed to load database, initializing defaults:', err);
      initDefaults();
    }
  } else {
    initDefaults();
  }
}

function initDefaults() {
  const adminSalt = bcrypt.genSaltSync(10);
  const adminHash = bcrypt.hashSync(process.env.ADMIN_PASSWORD || 'Admin123', adminSalt);
  
  const userSalt = bcrypt.genSaltSync(10);
  const userHash = bcrypt.hashSync('Password123!', userSalt);

  const adminUser: User = {
    id: 'usr_admin_001',
    name: process.env.ADMIN_NAME || 'System Administrator',
    email: process.env.ADMIN_EMAIL || 'admin@example.com',
    passwordHash: adminHash,
    role: 'ADMIN',
    isVerified: true,
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    storageQuotaBytes: 2 * 1024 * 1024 * 1024, // 2 GB
    usedStorageBytes: 15420000,
    status: 'ACTIVE',
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const sampleUser: User = {
    id: 'usr_adel_002',
    name: 'Adel Atwan',
    email: 'adel.s.atwan@gmail.com',
    passwordHash: userHash,
    role: 'USER',
    isVerified: true,
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    storageQuotaBytes: 500 * 1024 * 1024, // 500 MB
    usedStorageBytes: 8740000,
    status: 'ACTIVE',
    createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const defaultFolders: FolderItem[] = [
    {
      id: 'fld_projects_01',
      userId: sampleUser.id,
      name: 'Work Projects',
      createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    },
    {
      id: 'fld_docs_02',
      userId: sampleUser.id,
      name: 'Legal Documents',
      createdAt: new Date(Date.now() - 8 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 8 * 86400000).toISOString(),
    },
  ];

  // Seed some sample files for Adel
  const sampleFiles: FileItem[] = [
    {
      id: 'file_spec_01',
      userId: sampleUser.id,
      folderId: defaultFolders[0].id,
      name: 'System_Architecture_Spec.md',
      originalName: 'System_Architecture_Spec.md',
      mimeType: 'text/markdown',
      sizeBytes: 12840,
      extension: 'md',
      category: 'DOCUMENT',
      storagePath: 'sample_spec.md',
      extractedContent: '# System Architecture Specification\n\n## Overview\nCloudVault is an enterprise-grade cloud file storage and workspace platform.\n\n## Key Modules\n- JWT Authentication & RBAC\n- Multer Stream Buffering\n- Automated Metadata & Syntax Inspection\n- Storage Analytics Engine',
      isTrashed: false,
      createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
      downloadsCount: 14,
      tags: ['architecture', 'specs', 'v1'],
    },
    {
      id: 'file_code_02',
      userId: sampleUser.id,
      folderId: defaultFolders[0].id,
      name: 'PrismaSchema_Backup.prisma',
      originalName: 'PrismaSchema_Backup.prisma',
      mimeType: 'text/plain',
      sizeBytes: 4320,
      extension: 'prisma',
      category: 'CODE',
      storagePath: 'sample_prisma.prisma',
      extractedContent: `datasource db {\n  provider = "postgresql"\n  url      = env("DATABASE_URL")\n}\n\ngenerator client {\n  provider = "prisma-client-js"\n}\n\nmodel User {\n  id            String   @id @default(uuid())\n  email         String   @unique\n  name          String\n  passwordHash  String\n  role          Role     @default(USER)\n  isVerified    Boolean  @default(false)\n  files         File[]\n  createdAt     DateTime @default(now())\n}`,
      isTrashed: false,
      createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
      downloadsCount: 8,
      tags: ['database', 'prisma', 'schema'],
    },
    {
      id: 'file_img_03',
      userId: sampleUser.id,
      folderId: null,
      name: 'Dashboard_Mockup_Final.png',
      originalName: 'Dashboard_Mockup_Final.png',
      mimeType: 'image/png',
      sizeBytes: 2450000,
      extension: 'png',
      category: 'IMAGE',
      storagePath: 'sample_dashboard.png',
      extractedContent: 'Image Dimensions: 1920x1080 px | Format: PNG | Color Space: sRGB',
      isTrashed: false,
      createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
      downloadsCount: 22,
      tags: ['ui', 'mockup', 'design'],
    },
    {
      id: 'file_trashed_04',
      userId: sampleUser.id,
      folderId: null,
      name: 'Old_Notes_2025.txt',
      originalName: 'Old_Notes_2025.txt',
      mimeType: 'text/plain',
      sizeBytes: 2150,
      extension: 'txt',
      category: 'DOCUMENT',
      storagePath: 'sample_notes.txt',
      extractedContent: 'Meeting notes from preliminary technical discussion.\n- Checked Next.js App router compatibility.\n- Verified Multer file size threshold.',
      isTrashed: true,
      trashedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
      createdAt: new Date(Date.now() - 8 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
      downloadsCount: 1,
      tags: ['archive'],
    },
  ];

  // Write sample file contents to disk so download & preview work seamlessly
  try {
    fs.writeFileSync(path.join(UPLOADS_DIR, 'sample_spec.md'), sampleFiles[0].extractedContent || '');
    fs.writeFileSync(path.join(UPLOADS_DIR, 'sample_prisma.prisma'), sampleFiles[1].extractedContent || '');
    fs.writeFileSync(path.join(UPLOADS_DIR, 'sample_notes.txt'), sampleFiles[3].extractedContent || '');
    // Small dummy binary or transparent 1x1 png for mockup placeholder
    const samplePngBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');
    fs.writeFileSync(path.join(UPLOADS_DIR, 'sample_dashboard.png'), samplePngBuffer);
  } catch (err) {
    console.error('Error writing sample files to disk:', err);
  }

  const initialLogs: AuditLog[] = [
    {
      id: 'log_01',
      userId: adminUser.id,
      userEmail: adminUser.email,
      action: 'SYSTEM_INIT',
      details: 'System database initialized with default Admin account',
      ipAddress: '127.0.0.1',
      timestamp: new Date(Date.now() - 30 * 86400000).toISOString(),
    },
    {
      id: 'log_02',
      userId: sampleUser.id,
      userEmail: sampleUser.email,
      action: 'USER_REGISTER',
      details: 'User account registered and email verified',
      ipAddress: '192.168.1.45',
      timestamp: new Date(Date.now() - 14 * 86400000).toISOString(),
    },
    {
      id: 'log_03',
      userId: sampleUser.id,
      userEmail: sampleUser.email,
      action: 'FILE_UPLOAD',
      details: 'Uploaded System_Architecture_Spec.md (12.8 KB)',
      ipAddress: '192.168.1.45',
      timestamp: new Date(Date.now() - 5 * 86400000).toISOString(),
    },
  ];

  dbData = {
    users: [adminUser, sampleUser],
    verificationCodes: [],
    files: sampleFiles,
    folders: defaultFolders,
    auditLogs: initialLogs,
  };

  saveDb();
}

loadDb();

export const db = {
  // Users
  users: {
    findMany: () => [...dbData.users],
    findById: (id: string) => dbData.users.find(u => u.id === id) || null,
    findByEmail: (email: string) => dbData.users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null,
    create: (user: User) => {
      dbData.users.push(user);
      saveDb();
      return user;
    },
    update: (id: string, updates: Partial<User>) => {
      const idx = dbData.users.findIndex(u => u.id === id);
      if (idx === -1) return null;
      dbData.users[idx] = { ...dbData.users[idx], ...updates, updatedAt: new Date().toISOString() };
      saveDb();
      return dbData.users[idx];
    },
    delete: (id: string) => {
      const idx = dbData.users.findIndex(u => u.id === id);
      if (idx === -1) return false;
      // also delete user's files and folders
      dbData.files = dbData.files.filter(f => f.userId !== id);
      dbData.folders = dbData.folders.filter(f => f.userId !== id);
      dbData.users.splice(idx, 1);
      saveDb();
      return true;
    },
  },

  // Verification Codes
  verificationCodes: {
    create: (code: VerificationCode) => {
      // Remove any existing codes for this email
      dbData.verificationCodes = dbData.verificationCodes.filter(c => c.email !== code.email);
      dbData.verificationCodes.push(code);
      saveDb();
      return code;
    },
    findLatest: (email: string, type: 'EMAIL_VERIFICATION' | 'PASSWORD_RESET') => {
      return dbData.verificationCodes
        .filter(c => c.email.toLowerCase() === email.toLowerCase() && c.type === type)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0] || null;
    },
    delete: (id: string) => {
      dbData.verificationCodes = dbData.verificationCodes.filter(c => c.id !== id);
      saveDb();
    }
  },

  // Files
  files: {
    findMany: (filter?: {
      userId?: string;
      isTrashed?: boolean;
      category?: string;
      folderId?: string | null;
      search?: string;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    }) => {
      let result = [...dbData.files];
      if (filter) {
        if (filter.userId) {
          result = result.filter(f => f.userId === filter.userId);
        }
        if (typeof filter.isTrashed === 'boolean') {
          result = result.filter(f => f.isTrashed === filter.isTrashed);
        }
        if (filter.category && filter.category !== 'ALL') {
          result = result.filter(f => f.category.toUpperCase() === filter.category?.toUpperCase());
        }
        if (filter.folderId !== undefined) {
          result = result.filter(f => f.folderId === filter.folderId);
        }
        if (filter.search) {
          const q = filter.search.toLowerCase();
          result = result.filter(f => 
            f.name.toLowerCase().includes(q) || 
            f.tags.some(t => t.toLowerCase().includes(q)) ||
            (f.extractedContent && f.extractedContent.toLowerCase().includes(q))
          );
        }
        if (filter.sortBy) {
          const order = filter.sortOrder === 'desc' ? -1 : 1;
          result.sort((a, b) => {
            if (filter.sortBy === 'name') return a.name.localeCompare(b.name) * order;
            if (filter.sortBy === 'size') return (a.sizeBytes - b.sizeBytes) * order;
            if (filter.sortBy === 'type') return a.extension.localeCompare(b.extension) * order;
            if (filter.sortBy === 'date') return (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * order;
            return 0;
          });
        } else {
          // Default latest first
          result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        }
      }
      return result;
    },
    findById: (id: string) => dbData.files.find(f => f.id === id) || null,
    create: (file: FileItem) => {
      dbData.files.push(file);
      // update user's usedStorageBytes
      const user = dbData.users.find(u => u.id === file.userId);
      if (user) {
        user.usedStorageBytes += file.sizeBytes;
      }
      saveDb();
      return file;
    },
    update: (id: string, updates: Partial<FileItem>) => {
      const idx = dbData.files.findIndex(f => f.id === id);
      if (idx === -1) return null;
      dbData.files[idx] = { ...dbData.files[idx], ...updates, updatedAt: new Date().toISOString() };
      saveDb();
      return dbData.files[idx];
    },
    delete: (id: string) => {
      const idx = dbData.files.findIndex(f => f.id === id);
      if (idx === -1) return false;
      const file = dbData.files[idx];
      // update user usedStorageBytes
      const user = dbData.users.find(u => u.id === file.userId);
      if (user) {
        user.usedStorageBytes = Math.max(0, user.usedStorageBytes - file.sizeBytes);
      }
      // Remove disk file if exists
      const filePath = path.join(UPLOADS_DIR, file.storagePath);
      if (fs.existsSync(filePath)) {
        try { fs.unlinkSync(filePath); } catch (e) { /* ignore */ }
      }
      dbData.files.splice(idx, 1);
      saveDb();
      return true;
    },
  },

  // Folders
  folders: {
    findMany: (userId: string) => dbData.folders.filter(f => f.userId === userId),
    findById: (id: string) => dbData.folders.find(f => f.id === id) || null,
    create: (folder: FolderItem) => {
      dbData.folders.push(folder);
      saveDb();
      return folder;
    },
    delete: (id: string) => {
      const idx = dbData.folders.findIndex(f => f.id === id);
      if (idx === -1) return false;
      // unassign files from this folder
      dbData.files.forEach(f => {
        if (f.folderId === id) f.folderId = null;
      });
      dbData.folders.splice(idx, 1);
      saveDb();
      return true;
    },
  },

  // Audit Logs
  auditLogs: {
    findMany: (limit = 50) => [...dbData.auditLogs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, limit),
    create: (log: Omit<AuditLog, 'id' | 'timestamp'>) => {
      const newLog: AuditLog = {
        id: 'log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
        ...log,
        timestamp: new Date().toISOString(),
      };
      dbData.auditLogs.unshift(newLog);
      if (dbData.auditLogs.length > 500) {
        dbData.auditLogs = dbData.auditLogs.slice(0, 500);
      }
      saveDb();
      return newLog;
    }
  }
};

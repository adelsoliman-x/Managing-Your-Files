import axios from 'axios';
import { User, FileItem, FolderItem, UserStats, AdminStats, AuditLog } from '../types';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle unauthorized 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If unauthorized, clean invalid token if present
      const isAuthEndpoint = error.config.url?.includes('/auth/login') || error.config.url?.includes('/auth/register');
      if (!isAuthEndpoint) {
        // Only remove if it was an expired token on a protected route
        // localStorage.removeItem('auth_token');
      }
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  register: (data: { name: string; email: string; password: string }) =>
    api.post<{ success: boolean; token: string; otpCode?: string; user: User; message: string }>('/auth/register', data),

  login: (data: { email: string; password: string }) =>
    api.post<{ success: boolean; token: string; user: User; message: string }>('/auth/login', data),

  verifyEmail: (data: { email: string; code: string }) =>
    api.post<{ success: boolean; user: User; message: string }>('/auth/verify-email', data),

  resendCode: (data: { email: string }) =>
    api.post<{ success: boolean; otpCode?: string; message: string }>('/auth/resend-code', data),

  getProfile: () =>
    api.get<{ success: boolean; user: User }>('/auth/profile'),

  updateProfile: (data: { name?: string; avatarUrl?: string }) =>
    api.patch<{ success: boolean; user: User; message: string }>('/auth/profile', data),

  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.post<{ success: boolean; message: string }>('/auth/change-password', data),
};

export const filesApi = {
  getFiles: (params?: {
    search?: string;
    category?: string;
    folderId?: string;
    isTrashed?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
    allUsers?: boolean;
  }) =>
    api.get<{
      success: boolean;
      files: FileItem[];
      pagination: { total: number; page: number; limit: number; totalPages: number };
    }>('/files', { params }),

  getFile: (id: string) =>
    api.get<{ success: boolean; file: FileItem }>(`/files/${id}`),

  uploadFiles: (formData: FormData, onProgress?: (percent: number) => void) =>
    api.post<{ success: boolean; files: FileItem[]; message: string }>('/files/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onProgress) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percent);
        }
      },
    }),

  updateFile: (id: string, data: { name?: string; folderId?: string | null; tags?: string[] }) =>
    api.patch<{ success: boolean; file: FileItem; message: string }>(`/files/${id}`, data),

  moveToTrash: (id: string) =>
    api.post<{ success: boolean; message: string }>(`/files/${id}/trash`),

  trashFile: (id: string) =>
    api.post<{ success: boolean; message: string }>(`/files/${id}/trash`),

  getTrash: () =>
    api.get<{
      success: boolean;
      files: FileItem[];
      pagination: { total: number; page: number; limit: number; totalPages: number };
    }>('/files', { params: { isTrashed: true } }),

  restoreFile: (id: string) =>
    api.post<{ success: boolean; message: string }>(`/files/${id}/restore`),

  deleteFile: (id: string) =>
    api.delete<{ success: boolean; message: string }>(`/files/${id}`),

  downloadUrl: (id: string) => `/api/files/${id}/download`,
  previewUrl: (id: string) => `/api/files/${id}/preview`,
};

export const foldersApi = {
  getFolders: () =>
    api.get<{ success: boolean; folders: FolderItem[] }>('/folders'),

  createFolder: (data: { name: string; parentId?: string | null }) =>
    api.post<{ success: boolean; folder: FolderItem; message: string }>('/folders', data),

  deleteFolder: (id: string) =>
    api.delete<{ success: boolean; message: string }>(`/folders/${id}`),
};

export const usersApi = {
  getUsers: (params?: { search?: string; role?: string; status?: string; page?: number; limit?: number }) =>
    api.get<{
      success: boolean;
      users: User[];
      pagination: { total: number; page: number; limit: number; totalPages: number };
    }>('/users', { params }),

  getUser: (id: string) =>
    api.get<{ success: boolean; user: User }>(`/users/${id}`),

  updateUser: (id: string, data: { role?: string; status?: string; storageQuotaMB?: number }) =>
    api.patch<{ success: boolean; user: User; message: string }>(`/users/${id}`, data),

  deleteUser: (id: string) =>
    api.delete<{ success: boolean; message: string }>(`/users/${id}`),
};

export const statsApi = {
  getUserStats: () =>
    api.get<{ success: boolean; stats: UserStats }>('/stats/user'),

  getAdminStats: () =>
    api.get<{ success: boolean; stats: AdminStats }>('/stats/admin'),
};

export const auditApi = {
  getLogs: (limit = 50) =>
    api.get<{ success: boolean; logs: AuditLog[] }>('/audit-logs', { params: { limit } }),
};

export const codeExportApi = {
  getDeliverables: () =>
    api.get<{
      success: boolean;
      deliverables: {
        prismaSchema: string;
        backendServerTs: string;
        backendPackageJson: string;
        frontendPackageJson: string;
        dockerCompose: string;
        readme: string;
      };
    }>('/code-export/files'),
};

export default api;

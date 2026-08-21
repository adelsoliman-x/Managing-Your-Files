import React, { useEffect, useState } from 'react';
import {
  FileSpreadsheet,
  Search,
  Download,
  Trash2,
  Eye,
  RefreshCw,
  Filter,
} from 'lucide-react';
import { filesApi } from '../../services/api';
import { FileItem } from '../../types';
import { useToast } from '../common/Toast';
import { useAuth } from '../../context/AuthContext';

export const AdminFilesView: React.FC<{ onSelectFile: (file: FileItem) => void }> = ({ onSelectFile }) => {
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { success, error } = useToast();

  const [files, setFiles] = useState<FileItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  const fetchGlobalFiles = async () => {
    if (!isAuthenticated || user?.role !== 'ADMIN') {
      setFiles([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const res = await filesApi.getFiles({
        allUsers: true,
        search: search || undefined,
        category: categoryFilter !== 'ALL' ? categoryFilter : undefined,
        limit: 100,
      });
      if (res.data.success) {
        setFiles(res.data.files);
      }
    } catch (err: any) {
      if (err.response?.status !== 401 && err.response?.status !== 403) {
        console.error('Failed to fetch system files', err);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthLoading) {
      fetchGlobalFiles();
    }
  }, [categoryFilter, isAuthenticated, isAuthLoading, user?.role]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchGlobalFiles();
  };

  const handleDeletePermanent = async (file: FileItem) => {
    const confirmed = window.confirm(`Admin action: Permanently delete file "${file.name}" owned by ${file.owner?.name}?`);
    if (!confirmed) return;

    try {
      const res = await filesApi.deleteFile(file.id);
      if (res.data.success) {
        success('File deleted permanently.');
        fetchGlobalFiles();
      }
    } catch (err) {
      error('Failed to delete file.');
    }
  };

  const handleDownload = (file: FileItem) => {
    const url = filesApi.downloadUrl(file.id);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100">Global File Repository</h2>
          <p className="text-xs text-slate-400 mt-1">
            Audit, inspect, download, or moderate all files uploaded across every tenant on the platform.
          </p>
        </div>
        <button
          onClick={fetchGlobalFiles}
          className="self-start sm:self-auto px-3.5 py-1.5 bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5 text-indigo-400" />
          Refresh Files
        </button>
      </div>

      {/* Search & Category Filter */}
      <div className="p-4 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search across all files & content..."
            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs sm:text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </form>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="ALL" className="bg-slate-900 text-slate-200">All Categories</option>
            <option value="DOCUMENT" className="bg-slate-900 text-slate-200">Documents</option>
            <option value="IMAGE" className="bg-slate-900 text-slate-200">Images</option>
            <option value="CODE" className="bg-slate-900 text-slate-200">Code & Scripts</option>
            <option value="AUDIO" className="bg-slate-900 text-slate-200">Audio</option>
            <option value="VIDEO" className="bg-slate-900 text-slate-200">Video</option>
            <option value="ARCHIVE" className="bg-slate-900 text-slate-200">Archives</option>
          </select>
        </div>
      </div>

      {/* Global Files Table */}
      <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-20 flex justify-center">
            <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin" />
          </div>
        ) : files.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-xs">No files found matching criteria.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead>
                <tr className="border-b border-white/10 text-slate-400 uppercase text-[10px] font-bold bg-white/5">
                  <th className="py-3 px-4">File Name</th>
                  <th className="py-3 px-4">Owner</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Size</th>
                  <th className="py-3 px-4">Uploaded</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {files.map((file) => (
                  <tr
                    key={file.id}
                    className="hover:bg-white/5 transition-colors cursor-pointer"
                    onClick={() => onSelectFile(file)}
                  >
                    <td className="py-3 px-4 font-semibold text-slate-100 max-w-xs truncate">
                      {file.name}
                    </td>
                    <td className="py-3 px-4 text-indigo-400 font-medium">
                      {file.owner?.name || 'Unknown'} ({file.owner?.email})
                    </td>
                    <td className="py-3 px-4 text-slate-400 capitalize">{file.category.toLowerCase()}</td>
                    <td className="py-3 px-4 font-mono text-slate-300">
                      {(file.sizeBytes / 1024).toFixed(1)} KB
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {new Date(file.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onSelectFile(file)}
                          className="p-1.5 text-slate-400 hover:text-slate-100 rounded-lg hover:bg-white/10 transition-colors"
                          title="Inspect Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDownload(file)}
                          className="p-1.5 text-slate-400 hover:text-indigo-400 rounded-lg hover:bg-white/10 transition-colors"
                          title="Download"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeletePermanent(file)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-white/10 transition-colors"
                          title="Permanent Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

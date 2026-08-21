import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  Grid,
  List,
  UploadCloud,
  FolderPlus,
  Trash2,
  Filter,
  ArrowUpDown,
  FileQuestion,
  RotateCcw,
  CheckCircle2,
  Folder,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import { FileItem, FolderItem, FileCategory } from '../../types';
import { filesApi } from '../../services/api';
import { FileCard } from './FileCard';
import { FileTableRow } from './FileTableRow';
import { useToast } from '../common/Toast';
import { useAuth } from '../../context/AuthContext';

interface FileExplorerViewProps {
  isTrashMode?: boolean;
  selectedFolderId: string | null;
  setSelectedFolderId: (id: string | null) => void;
  folders: FolderItem[];
  onOpenUpload: () => void;
  onOpenNewFolder: () => void;
  onSelectFile: (file: FileItem) => void;
}

export const FileExplorerView: React.FC<FileExplorerViewProps> = ({
  isTrashMode = false,
  selectedFolderId,
  setSelectedFolderId,
  folders,
  onOpenUpload,
  onOpenNewFolder,
  onSelectFile,
}) => {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { success, error } = useToast();

  const [files, setFiles] = useState<FileItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const fetchFiles = async () => {
    if (!isAuthenticated) {
      setFiles([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      if (isTrashMode) {
        const res = await filesApi.getTrash();
        if (res.data.success) {
          setFiles(res.data.files);
        }
      } else {
        const res = await filesApi.getFiles({
          folderId: selectedFolderId || undefined,
          search: searchQuery || undefined,
          category: selectedCategory !== 'ALL' ? selectedCategory : undefined,
          sortBy,
          sortOrder,
        });
        if (res.data.success) {
          setFiles(res.data.files);
        }
      }
    } catch (err: any) {
      if (err.response?.status !== 401) {
        console.error('Error loading files:', err);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthLoading) {
      fetchFiles();
    }
  }, [isAuthenticated, isAuthLoading, isTrashMode, selectedFolderId, selectedCategory, sortBy, sortOrder]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchFiles();
  };

  const handleTrashFile = async (id: string) => {
    try {
      const res = await filesApi.trashFile(id);
      if (res.data.success) {
        success('File moved to trash.');
        fetchFiles();
      }
    } catch (err) {
      error('Failed to move file to trash.');
    }
  };

  const handleRestoreFile = async (id: string) => {
    try {
      const res = await filesApi.restoreFile(id);
      if (res.data.success) {
        success('File restored successfully.');
        fetchFiles();
      }
    } catch (err) {
      error('Failed to restore file.');
    }
  };

  const handleDeletePermanent = async (id: string) => {
    const confirmed = window.confirm('Are you sure you want to permanently delete this file? This action cannot be undone.');
    if (!confirmed) return;

    try {
      const res = await filesApi.deleteFile(id);
      if (res.data.success) {
        success('File permanently deleted.');
        fetchFiles();
      }
    } catch (err) {
      error('Failed to delete file.');
    }
  };

  const currentFolder = folders.find((f) => f.id === selectedFolderId);

  const categories: { label: string; value: string }[] = [
    { label: 'All Files', value: 'ALL' },
    { label: 'Documents', value: 'DOCUMENT' },
    { label: 'Images', value: 'IMAGE' },
    { label: 'Code & Dev', value: 'CODE' },
    { label: 'Audio', value: 'AUDIO' },
    { label: 'Video', value: 'VIDEO' },
    { label: 'Archives', value: 'ARCHIVE' },
  ];

  return (
    <div className="space-y-5">
      {/* Top Breadcrumb & Action Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-300">
          <button
            onClick={() => setSelectedFolderId(null)}
            className={`hover:text-indigo-400 transition-colors ${
              !selectedFolderId && !isTrashMode ? 'text-indigo-400 font-bold' : 'text-slate-400'
            }`}
          >
            {isTrashMode ? 'Trash Bin' : 'My Files'}
          </button>

          {currentFolder && (
            <>
              <ChevronRight className="w-4 h-4 text-slate-500" />
              <div className="flex items-center gap-1.5 text-indigo-400 font-bold">
                <Folder className="w-4 h-4 text-amber-400" />
                <span>{currentFolder.name}</span>
              </div>
            </>
          )}
        </div>

        {/* Action Buttons */}
        {!isTrashMode && (
          <div className="flex items-center gap-2">
            <button
              id="explorer-new-folder-btn"
              onClick={onOpenNewFolder}
              className="px-3.5 py-2 bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <FolderPlus className="w-4 h-4 text-amber-400" />
              <span>New Folder</span>
            </button>

            <button
              id="explorer-upload-files-btn"
              onClick={onOpenUpload}
              className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-indigo-500/25 transition-all cursor-pointer"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Upload Files</span>
            </button>
          </div>
        )}
      </div>

      {/* Search, Filter, Sort, View Controls Bar */}
      <div className="p-4 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            id="explorer-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by file name or extension..."
            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-200 placeholder:text-slate-500"
          />
        </form>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-between md:justify-end">
          {/* Sort By Dropdown */}
          <div className="flex items-center gap-1.5">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              id="explorer-sort-by"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-xs bg-white/5 border border-white/10 rounded-xl px-2.5 py-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="createdAt" className="bg-slate-900 text-slate-200">Date Uploaded</option>
              <option value="name" className="bg-slate-900 text-slate-200">Name</option>
              <option value="sizeBytes" className="bg-slate-900 text-slate-200">File Size</option>
              <option value="downloadsCount" className="bg-slate-900 text-slate-200">Downloads</option>
            </select>

            <button
              onClick={() => setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
              className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold text-slate-300"
              title={`Sorting ${sortOrder === 'asc' ? 'Ascending' : 'Descending'}`}
            >
              {sortOrder === 'asc' ? '↑ Asc' : '↓ Desc'}
            </button>
          </div>

          {/* View Mode Grid/List Toggle */}
          <div className="flex items-center bg-white/5 p-1 rounded-xl border border-white/10">
            <button
              id="explorer-view-grid"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'grid'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              id="explorer-view-list"
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'list'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Category Pills Bar (when not in Trash) */}
      {!isTrashMode && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat.value
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                  : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200 border border-white/10'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      )}

      {/* Files Display Area */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 space-y-3">
          <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin" />
          <p className="text-xs text-slate-400">Loading files...</p>
        </div>
      ) : files.length === 0 ? (
        <div className="p-12 text-center bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-sm flex flex-col items-center justify-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-slate-400 border border-white/10">
            <FileQuestion className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-sm font-bold text-slate-200">
            {isTrashMode ? 'Trash Bin is Empty' : 'No files found'}
          </h3>
          <p className="text-xs text-slate-400 max-w-sm">
            {isTrashMode
              ? 'Deleted files will show up here. You can restore or delete them permanently.'
              : 'Upload documents, code, media, or create folders to get started.'}
          </p>
          {!isTrashMode && (
            <button
              onClick={onOpenUpload}
              className="px-4 py-2 bg-indigo-500 text-white rounded-xl text-xs font-semibold hover:bg-indigo-600 shadow-lg shadow-indigo-500/25 transition-all mt-2"
            >
              Upload First File
            </button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          <AnimatePresence>
            {files.map((file) => (
              <motion.div
                key={file.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.15 }}
              >
                <FileCard
                  file={file}
                  onSelect={onSelectFile}
                  onTrash={handleTrashFile}
                  onRestore={handleRestoreFile}
                  onDeletePermanent={handleDeletePermanent}
                  isTrashMode={isTrashMode}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead>
                <tr className="border-b border-white/10 text-slate-400 uppercase text-[10px] font-bold bg-white/5">
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4 hidden sm:table-cell">Category</th>
                  <th className="py-3 px-4">Size</th>
                  <th className="py-3 px-4 hidden md:table-cell">Uploaded Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {files.map((file) => (
                  <FileTableRow
                    key={file.id}
                    file={file}
                    onSelect={onSelectFile}
                    onTrash={handleTrashFile}
                    onRestore={handleRestoreFile}
                    onDeletePermanent={handleDeletePermanent}
                    isTrashMode={isTrashMode}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

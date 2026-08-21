import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  X,
  Download,
  Trash2,
  Tag,
  Calendar,
  HardDrive,
  FileText,
  Image as ImageIcon,
  Code,
  Music,
  Video,
  Archive,
  Check,
  Edit2,
  Folder,
  Eye,
  Sparkles,
} from 'lucide-react';
import { FileItem, FolderItem } from '../../types';
import { filesApi } from '../../services/api';
import { useToast } from '../common/Toast';

interface FileDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  file: FileItem | null;
  folders: FolderItem[];
  onFileUpdated: () => void;
  onFileTrashed: () => void;
}

export const FileDetailsModal: React.FC<FileDetailsModalProps> = ({
  isOpen,
  onClose,
  file,
  folders,
  onFileUpdated,
  onFileTrashed,
}) => {
  const { success, error } = useToast();

  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [newTagInput, setNewTagInput] = useState('');
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);

  React.useEffect(() => {
    if (file) {
      setEditedName(file.name);
      setSelectedFolderId(file.folderId || null);
    }
  }, [file]);

  if (!isOpen || !file) return null;

  const handleSaveName = async () => {
    if (!editedName.trim()) return;
    try {
      const res = await filesApi.updateFile(file.id, { name: editedName.trim() });
      if (res.data.success) {
        success('File name updated.');
        setIsEditingName(false);
        onFileUpdated();
      }
    } catch (err: any) {
      error('Failed to rename file.');
    }
  };

  const handleFolderChange = async (folderId: string | null) => {
    setSelectedFolderId(folderId);
    try {
      const res = await filesApi.updateFile(file.id, { folderId });
      if (res.data.success) {
        success('File moved successfully.');
        onFileUpdated();
      }
    } catch (err: any) {
      error('Failed to move file.');
    }
  };

  const handleAddTag = async (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newTagInput.trim()) {
      e.preventDefault();
      const tag = newTagInput.trim().toLowerCase();
      if (file.tags.includes(tag)) {
        setNewTagInput('');
        return;
      }
      const updatedTags = [...file.tags, tag];
      try {
        const res = await filesApi.updateFile(file.id, { tags: updatedTags });
        if (res.data.success) {
          success(`Tag "${tag}" added.`);
          setNewTagInput('');
          onFileUpdated();
        }
      } catch (err) {
        error('Failed to add tag.');
      }
    }
  };

  const handleRemoveTag = async (tagToRemove: string) => {
    const updatedTags = file.tags.filter((t) => t !== tagToRemove);
    try {
      const res = await filesApi.updateFile(file.id, { tags: updatedTags });
      if (res.data.success) {
        onFileUpdated();
      }
    } catch (err) {
      error('Failed to remove tag.');
    }
  };

  const handleDownload = () => {
    const url = filesApi.downloadUrl(file.id);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    success(`Downloading ${file.name}...`);
  };

  const getCategoryIcon = (category: FileItem['category']) => {
    switch (category) {
      case 'IMAGE':
        return <ImageIcon className="w-5 h-5 text-emerald-500" />;
      case 'DOCUMENT':
        return <FileText className="w-5 h-5 text-blue-500" />;
      case 'CODE':
        return <Code className="w-5 h-5 text-amber-500" />;
      case 'AUDIO':
        return <Music className="w-5 h-5 text-purple-500" />;
      case 'VIDEO':
        return <Video className="w-5 h-5 text-rose-500" />;
      case 'ARCHIVE':
        return <Archive className="w-5 h-5 text-indigo-500" />;
      default:
        return <FileText className="w-5 h-5 text-slate-500" />;
    }
  };

  const formattedSize =
    file.sizeBytes > 1024 * 1024
      ? (file.sizeBytes / (1024 * 1024)).toFixed(2) + ' MB'
      : (file.sizeBytes / 1024).toFixed(1) + ' KB';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-3xl bg-slate-900/90 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-3 truncate pr-4">
            <div className="p-2.5 bg-white/10 border border-white/10 rounded-xl shrink-0">
              {getCategoryIcon(file.category)}
            </div>
            <div className="truncate">
              {isEditingName ? (
                <div className="flex items-center gap-2">
                  <input
                    id="edit-file-name-input"
                    type="text"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    className="px-2.5 py-1 text-sm bg-white/5 border border-indigo-500 rounded-lg text-white"
                  />
                  <button
                    onClick={handleSaveName}
                    className="p-1 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setIsEditingName(false)}
                    className="p-1 bg-white/10 rounded-lg text-slate-300"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-100 truncate">
                    {file.name}
                  </h3>
                  <button
                    onClick={() => setIsEditingName(true)}
                    className="text-slate-400 hover:text-indigo-400 transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
              <p className="text-xs text-slate-400">
                {file.category} • {file.extension.toUpperCase()} • {formattedSize}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="file-details-download-btn"
              onClick={handleDownload}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-indigo-500/25 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-white/5 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Visual Preview Box */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 overflow-hidden">
            <div className="flex items-center justify-between mb-3 text-xs font-semibold text-slate-300">
              <span className="flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-indigo-400" />
                Live Preview & Extracted Content
              </span>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 bg-white/10 text-slate-300 rounded border border-white/10">
                {file.mimeType}
              </span>
            </div>

            {/* Image Preview */}
            {file.category === 'IMAGE' ? (
              <div className="flex flex-col items-center justify-center py-4 bg-black/40 rounded-xl border border-white/10">
                <img
                  src={filesApi.previewUrl(file.id)}
                  alt={file.name}
                  className="max-h-72 max-w-full object-contain rounded-lg shadow-sm"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
            ) : file.category === 'AUDIO' ? (
              <div className="py-6 flex flex-col items-center justify-center">
                <audio controls className="w-full max-w-md">
                  <source src={filesApi.previewUrl(file.id)} type={file.mimeType} />
                  Your browser does not support the audio element.
                </audio>
              </div>
            ) : file.category === 'VIDEO' ? (
              <div className="py-2 flex justify-center">
                <video controls className="max-h-72 rounded-lg w-full max-w-md">
                  <source src={filesApi.previewUrl(file.id)} type={file.mimeType} />
                  Your browser does not support the video element.
                </video>
              </div>
            ) : file.extractedContent ? (
              /* Text / Code Syntax Preview */
              <div className="relative">
                <pre className="p-4 bg-slate-950/80 text-slate-200 border border-white/10 rounded-xl text-xs font-mono overflow-x-auto max-h-64 leading-relaxed whitespace-pre-wrap selection:bg-indigo-600">
                  {file.extractedContent}
                </pre>
              </div>
            ) : (
              <div className="py-8 text-center text-slate-400 text-xs flex flex-col items-center gap-2">
                <FileText className="w-8 h-8 text-slate-600" />
                <p>Binary or non-text preview. You can download the file directly.</p>
              </div>
            )}
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-3 bg-white/5 rounded-xl border border-white/10">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">File Size</span>
              <p className="text-xs font-semibold text-slate-200 mt-0.5">
                {formattedSize} ({file.sizeBytes.toLocaleString()} bytes)
              </p>
            </div>

            <div className="p-3 bg-white/5 rounded-xl border border-white/10">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Uploaded On</span>
              <p className="text-xs font-semibold text-slate-200 mt-0.5">
                {new Date(file.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
            </div>

            <div className="p-3 bg-white/5 rounded-xl border border-white/10">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Downloads</span>
              <p className="text-xs font-semibold text-slate-200 mt-0.5">
                {file.downloadsCount || 0} times
              </p>
            </div>

            <div className="p-3 bg-white/5 rounded-xl border border-white/10">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Category</span>
              <p className="text-xs font-semibold text-slate-200 mt-0.5 capitalize">
                {file.category.toLowerCase()}
              </p>
            </div>
          </div>

          {/* Folder Destination & Owner (if admin) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3.5 bg-white/5 rounded-xl border border-white/10">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 mb-2">
                <Folder className="w-3.5 h-3.5 text-amber-400" />
                <span>Move to Folder:</span>
              </label>
              <select
                value={selectedFolderId || ''}
                onChange={(e) => handleFolderChange(e.target.value ? e.target.value : null)}
                className="w-full text-xs bg-slate-800 border border-white/10 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="">Root (No folder)</option>
                {folders.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>

            {file.owner && (
              <div className="p-3.5 bg-indigo-500/10 rounded-xl border border-indigo-500/30">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300">
                  Uploaded By (Admin View)
                </span>
                <p className="text-xs font-bold text-white mt-1">
                  {file.owner.name}
                </p>
                <p className="text-[11px] text-slate-400">{file.owner.email}</p>
              </div>
            )}
          </div>

          {/* Tags Manager */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-indigo-400" />
              <span>Tags (Press Enter to add)</span>
            </label>
            <div className="flex flex-wrap items-center gap-1.5 p-2 bg-white/5 rounded-xl border border-white/10">
              {file.tags.map((t) => (
                <span
                  key={t}
                  className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-md text-xs font-medium flex items-center gap-1"
                >
                  #{t}
                  <button
                    onClick={() => handleRemoveTag(t)}
                    className="hover:text-rose-400 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              <input
                id="file-add-tag-input"
                type="text"
                value={newTagInput}
                onChange={(e) => setNewTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder="Add tag..."
                className="text-xs bg-transparent border-none focus:outline-none text-slate-200 placeholder:text-slate-500 px-1 py-0.5 min-w-[80px]"
              />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

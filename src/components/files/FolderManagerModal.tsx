import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, FolderPlus, Trash2, Folder } from 'lucide-react';
import { FolderItem } from '../../types';
import { foldersApi } from '../../services/api';
import { useToast } from '../common/Toast';

interface FolderManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  folders: FolderItem[];
  onFolderCreated: () => void;
  onFolderDeleted: () => void;
}

export const FolderManagerModal: React.FC<FolderManagerModalProps> = ({
  isOpen,
  onClose,
  folders,
  onFolderCreated,
  onFolderDeleted,
}) => {
  const { success, error } = useToast();
  const [folderName, setFolderName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!folderName.trim()) {
      error('Folder name is required.');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await foldersApi.createFolder({ name: folderName.trim() });
      if (res.data.success) {
        success(`Folder "${res.data.folder.name}" created!`);
        setFolderName('');
        onFolderCreated();
      }
    } catch (err: any) {
      error('Failed to create folder.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteFolder = async (id: string, name: string) => {
    try {
      const res = await foldersApi.deleteFolder(id);
      if (res.data.success) {
        success(`Folder "${name}" deleted.`);
        onFolderDeleted();
      }
    } catch (err) {
      error('Failed to delete folder.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md bg-slate-900/90 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-xl">
              <FolderPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">Folder Management</h3>
              <p className="text-xs text-slate-400">Organize your files into categorized directories</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Create new folder input */}
          <form onSubmit={handleCreateFolder} className="space-y-3">
            <label className="block text-xs font-semibold text-slate-300">
              New Folder Name
            </label>
            <div className="flex gap-2">
              <input
                id="create-folder-name-input"
                type="text"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                placeholder="e.g. Invoices 2026, Client Designs..."
                className="flex-1 px-3.5 py-2 text-xs bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-200 placeholder:text-slate-500"
              />
              <button
                id="create-folder-submit-btn"
                type="submit"
                disabled={isSubmitting || !folderName.trim()}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold disabled:opacity-50 transition-colors shadow-lg shadow-indigo-500/25 shrink-0"
              >
                Create
              </button>
            </div>
          </form>

          {/* Existing folders list */}
          <div className="space-y-2 pt-2 border-t border-white/10">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Existing Folders ({folders.length})
            </h4>

            <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
              {folders.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-2">No folders created yet.</p>
              ) : (
                folders.map((f) => (
                  <div
                    key={f.id}
                    className="flex items-center justify-between p-2.5 bg-white/5 rounded-xl border border-white/10 text-xs"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Folder className="w-4 h-4 text-amber-400 shrink-0" />
                      <span className="font-semibold text-slate-200 truncate">
                        {f.name}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDeleteFolder(f.id, f.name)}
                      className="text-slate-400 hover:text-rose-400 p-1 transition-colors"
                      title="Delete folder"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

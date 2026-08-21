import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UploadCloud, X, File, CheckCircle2, AlertCircle, RefreshCw, Folder } from 'lucide-react';
import confetti from 'canvas-confetti';
import { filesApi } from '../../services/api';
import { useToast } from '../common/Toast';
import { FolderItem } from '../../types';

interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  folders: FolderItem[];
  currentFolderId: string | null;
  onUploadSuccess: () => void;
}

export const FileUploadModal: React.FC<FileUploadModalProps> = ({
  isOpen,
  onClose,
  folders,
  currentFolderId,
  onUploadSuccess,
}) => {
  const { success, error } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFiles, setSelectedFiles] = useState<globalThis.File[]>([]);
  const [targetFolderId, setTargetFolderId] = useState<string | null>(currentFolderId);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);

  if (!isOpen) return null;

  const handleFilesAdded = (incoming: FileList | null) => {
    if (!incoming) return;
    const array = Array.from(incoming);
    // Limit 10 files per batch
    const combined = [...selectedFiles, ...array].slice(0, 10);
    setSelectedFiles(combined);
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFilesAdded(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleUploadSubmit = async () => {
    if (selectedFiles.length === 0) {
      error('Please select at least one file to upload.');
      return;
    }

    const formData = new FormData();
    selectedFiles.forEach((file) => {
      formData.append('files', file);
    });
    if (targetFolderId) {
      formData.append('folderId', targetFolderId);
    }

    setIsUploading(true);
    setUploadProgress(10);

    try {
      const res = await filesApi.uploadFiles(formData, (percent) => {
        setUploadProgress(percent);
      });

      if (res.data.success) {
        try {
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.6 },
          });
        } catch (e) { /* ignore */ }

        success(res.data.message || 'Files uploaded successfully!');
        setSelectedFiles([]);
        setUploadProgress(0);
        onUploadSuccess();
        onClose();
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Upload failed. Please check storage limits.';
      error(msg);
    } finally {
      setIsUploading(false);
    }
  };

  const totalBytes = selectedFiles.reduce((acc, f) => acc + f.size, 0);
  const formattedTotalSize = (totalBytes / (1024 * 1024)).toFixed(2);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-xl bg-slate-900/90 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded-xl">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">Upload Files</h3>
              <p className="text-xs text-slate-400">
                Drag and drop files or browse from your device
              </p>
            </div>
          </div>
          <button
            id="upload-modal-close"
            onClick={onClose}
            disabled={isUploading}
            className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-5">
          {/* Target Folder Selector */}
          <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Folder className="w-4 h-4 text-amber-400" />
              <span>Destination Folder:</span>
            </label>
            <select
              id="upload-folder-select"
              value={targetFolderId || ''}
              onChange={(e) => setTargetFolderId(e.target.value ? e.target.value : null)}
              className="text-xs font-medium bg-slate-800 border border-white/10 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="">Root (No folder)</option>
              {folders.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>

          {/* Drag & Drop Target Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center ${
              isDragging
                ? 'border-indigo-500 bg-indigo-500/10 scale-[1.01]'
                : 'border-white/15 hover:border-indigo-500/50 hover:bg-white/5'
            }`}
          >
            <input
              ref={fileInputRef}
              id="upload-file-input"
              type="file"
              multiple
              className="hidden"
              onChange={(e) => handleFilesAdded(e.target.files)}
            />
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mb-3 shadow-md">
              <UploadCloud className="w-7 h-7" />
            </div>
            <h4 className="text-sm font-bold text-slate-200 mb-1">
              Choose files or drag & drop here
            </h4>
            <p className="text-xs text-slate-400 max-w-sm mb-3">
              Supports Documents, Code, Images, Audio, Video, Archives (up to 50 MB each)
            </p>
            <span className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-500/25 transition-colors">
              Browse Files
            </span>
          </div>

          {/* Selected Files Queue */}
          {selectedFiles.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-300 px-1">
                <span>Selected ({selectedFiles.length})</span>
                <span>Total: {formattedTotalSize} MB</span>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                <AnimatePresence>
                  {selectedFiles.map((file, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="flex items-center justify-between p-2.5 bg-white/5 border border-white/10 rounded-xl text-xs"
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <File className="w-4 h-4 text-indigo-400 shrink-0" />
                        <span className="font-medium text-slate-200 truncate">
                          {file.name}
                        </span>
                        <span className="text-slate-400 shrink-0">
                          ({(file.size / 1024).toFixed(1)} KB)
                        </span>
                      </div>
                      <button
                        onClick={() => removeFile(idx)}
                        disabled={isUploading}
                        className="text-slate-400 hover:text-rose-400 p-1 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}

          {/* Upload Progress Bar */}
          {isUploading && (
            <div className="p-4 bg-indigo-500/10 rounded-xl border border-indigo-500/30 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-indigo-200">
                <span className="flex items-center gap-1.5">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                  Uploading & Extracting Metadata...
                </span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 transition-all duration-300 rounded-full shadow-sm"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2.5 px-6 py-4 border-t border-white/10 bg-white/5">
          <button
            onClick={onClose}
            disabled={isUploading}
            className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-white/5 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            id="upload-confirm-btn"
            onClick={handleUploadSubmit}
            disabled={isUploading || selectedFiles.length === 0}
            className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-xl shadow-lg shadow-indigo-500/25 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            {isUploading ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Start Upload ({selectedFiles.length})</span>
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

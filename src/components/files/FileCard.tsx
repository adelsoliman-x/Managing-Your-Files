import React from 'react';
import {
  FileText,
  Image as ImageIcon,
  Code,
  Music,
  Video,
  Archive,
  Download,
  Trash2,
  MoreVertical,
  Eye,
  RotateCcw,
  Tag,
} from 'lucide-react';
import { FileItem } from '../../types';
import { filesApi } from '../../services/api';

interface FileCardProps {
  file: FileItem;
  onSelect: (file: FileItem) => void;
  onTrash: (id: string) => void;
  onRestore?: (id: string) => void;
  onDeletePermanent?: (id: string) => void;
  isTrashMode?: boolean;
}

export const FileCard: React.FC<FileCardProps> = ({
  file,
  onSelect,
  onTrash,
  onRestore,
  onDeletePermanent,
  isTrashMode = false,
}) => {
  const getCategoryIcon = (category: FileItem['category']) => {
    switch (category) {
      case 'IMAGE':
        return <ImageIcon className="w-8 h-8 text-emerald-500" />;
      case 'DOCUMENT':
        return <FileText className="w-8 h-8 text-blue-500" />;
      case 'CODE':
        return <Code className="w-8 h-8 text-amber-500" />;
      case 'AUDIO':
        return <Music className="w-8 h-8 text-purple-500" />;
      case 'VIDEO':
        return <Video className="w-8 h-8 text-rose-500" />;
      case 'ARCHIVE':
        return <Archive className="w-8 h-8 text-indigo-500" />;
      default:
        return <FileText className="w-8 h-8 text-slate-500" />;
    }
  };

  const formattedSize =
    file.sizeBytes > 1024 * 1024
      ? (file.sizeBytes / (1024 * 1024)).toFixed(2) + ' MB'
      : (file.sizeBytes / 1024).toFixed(1) + ' KB';

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = filesApi.downloadUrl(file.id);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div
      id={`file-card-${file.id}`}
      onClick={() => onSelect(file)}
      className="group relative bg-white/5 backdrop-blur-md border border-white/10 hover:border-indigo-500/50 hover:bg-white/10 rounded-2xl p-4 shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 transition-all cursor-pointer flex flex-col justify-between"
    >
      {/* Top Preview/Icon area */}
      <div className="relative w-full h-32 rounded-xl bg-black/20 border border-white/5 flex items-center justify-center overflow-hidden mb-3">
        {file.category === 'IMAGE' ? (
          <img
            src={filesApi.previewUrl(file.id)}
            alt={file.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        ) : (
          <div className="flex flex-col items-center gap-1.5 p-2 text-center">
            {getCategoryIcon(file.category)}
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-300 bg-white/10 px-2 py-0.5 rounded-full border border-white/10">
              .{file.extension}
            </span>
          </div>
        )}

        {/* Hover Quick Action Buttons */}
        <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[4px]">
          {!isTrashMode ? (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(file);
                }}
                className="p-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl hover:scale-110 shadow-md transition-transform"
                title="Inspect Details"
              >
                <Eye className="w-4 h-4" />
              </button>
              <button
                onClick={handleDownload}
                className="p-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl hover:scale-110 shadow-md shadow-indigo-500/30 transition-transform"
                title="Download File"
              >
                <Download className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onTrash(file.id);
                }}
                className="p-2 bg-rose-500/80 hover:bg-rose-600 text-white rounded-xl hover:scale-110 shadow-md shadow-rose-500/30 transition-transform"
                title="Move to Trash"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              {onRestore && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRestore(file.id);
                  }}
                  className="p-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl hover:scale-110 shadow-md transition-transform"
                  title="Restore File"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}
              {onDeletePermanent && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeletePermanent(file.id);
                  }}
                  className="p-2 bg-rose-500/80 hover:bg-rose-600 text-white rounded-xl hover:scale-110 shadow-md transition-transform"
                  title="Delete Permanently"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* File Info */}
      <div>
        <h4 className="text-xs font-bold text-slate-100 truncate mb-1" title={file.name}>
          {file.name}
        </h4>
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span>{formattedSize}</span>
          <span>
            {new Date(file.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            })}
          </span>
        </div>

        {/* Tags */}
        {file.tags && file.tags.length > 0 && (
          <div className="flex items-center gap-1 mt-2 overflow-hidden">
            {file.tags.slice(0, 2).map((t) => (
              <span
                key={t}
                className="px-1.5 py-0.5 bg-white/5 border border-white/10 text-slate-300 rounded text-[9px] font-medium truncate"
              >
                #{t}
              </span>
            ))}
            {file.tags.length > 2 && (
              <span className="text-[9px] text-slate-400">+{file.tags.length - 2}</span>
            )}
          </div>
        )}

        {/* Owner details for admin views */}
        {file.owner && (
          <div className="mt-2 pt-2 border-t border-white/10 text-[10px] text-indigo-400 truncate">
            By: {file.owner.name}
          </div>
        )}
      </div>
    </div>
  );
};

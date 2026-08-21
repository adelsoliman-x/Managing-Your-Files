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
  Eye,
  RotateCcw,
} from 'lucide-react';
import { FileItem } from '../../types';
import { filesApi } from '../../services/api';

interface FileTableRowProps {
  file: FileItem;
  onSelect: (file: FileItem) => void;
  onTrash: (id: string) => void;
  onRestore?: (id: string) => void;
  onDeletePermanent?: (id: string) => void;
  isTrashMode?: boolean;
}

export const FileTableRow: React.FC<FileTableRowProps> = ({
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
        return <ImageIcon className="w-4 h-4 text-emerald-500" />;
      case 'DOCUMENT':
        return <FileText className="w-4 h-4 text-blue-500" />;
      case 'CODE':
        return <Code className="w-4 h-4 text-amber-500" />;
      case 'AUDIO':
        return <Music className="w-4 h-4 text-purple-500" />;
      case 'VIDEO':
        return <Video className="w-4 h-4 text-rose-500" />;
      case 'ARCHIVE':
        return <Archive className="w-4 h-4 text-indigo-500" />;
      default:
        return <FileText className="w-4 h-4 text-slate-500" />;
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
    <tr
      id={`file-row-${file.id}`}
      onClick={() => onSelect(file)}
      className="border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors text-xs text-slate-300"
    >
      {/* Name and Icon */}
      <td className="py-3 px-4">
        <div className="flex items-center gap-2.5 max-w-xs md:max-w-md truncate">
          <div className="p-1.5 bg-white/5 border border-white/10 rounded-lg shrink-0">
            {getCategoryIcon(file.category)}
          </div>
          <span className="font-semibold text-slate-100 truncate" title={file.name}>
            {file.name}
          </span>
        </div>
      </td>

      {/* Category */}
      <td className="py-3 px-4 hidden sm:table-cell text-slate-400 capitalize">
        {file.category.toLowerCase()}
      </td>

      {/* Size */}
      <td className="py-3 px-4 text-slate-300 font-mono">
        {formattedSize}
      </td>

      {/* Date */}
      <td className="py-3 px-4 hidden md:table-cell text-slate-400">
        {new Date(file.createdAt).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })}
      </td>

      {/* Owner (Admin view) */}
      {file.owner && (
        <td className="py-3 px-4 hidden lg:table-cell text-indigo-400 font-medium">
          {file.owner.name}
        </td>
      )}

      {/* Action Buttons */}
      <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-end gap-1.5">
          {!isTrashMode ? (
            <>
              <button
                onClick={() => onSelect(file)}
                className="p-1.5 text-slate-400 hover:text-slate-100 rounded-lg hover:bg-white/10 transition-colors"
                title="Preview"
              >
                <Eye className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleDownload}
                className="p-1.5 text-slate-400 hover:text-indigo-400 rounded-lg hover:bg-white/10 transition-colors"
                title="Download"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onTrash(file.id)}
                className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-white/10 transition-colors"
                title="Move to Trash"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </>
          ) : (
            <>
              {onRestore && (
                <button
                  onClick={() => onRestore(file.id)}
                  className="p-1.5 text-emerald-400 hover:bg-emerald-500/20 rounded-lg transition-colors"
                  title="Restore"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}
              {onDeletePermanent && (
                <button
                  onClick={() => onDeletePermanent(file.id)}
                  className="p-1.5 text-rose-400 hover:bg-rose-500/20 rounded-lg transition-colors"
                  title="Delete Permanently"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </>
          )}
        </div>
      </td>
    </tr>
  );
};

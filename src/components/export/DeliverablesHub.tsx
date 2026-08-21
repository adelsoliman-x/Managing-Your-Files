import React, { useState, useEffect } from 'react';
import {
  Code,
  Copy,
  Check,
  FileCode,
  Download,
  FolderTree,
  FileText,
  Server,
  Layers,
  Sparkles,
  Database,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { codeExportApi } from '../../services/api';
import { useToast } from '../common/Toast';

export const DeliverablesHub: React.FC = () => {
  const { success } = useToast();
  const [deliverables, setDeliverables] = useState<any>(null);
  const [selectedFile, setSelectedFile] = useState<string>('readme');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    codeExportApi.getDeliverables().then((res) => {
      if (res.data.success) {
        setDeliverables(res.data.deliverables);
      }
    });
  }, []);

  const filesMap: Record<string, { title: string; filename: string; language: string; content: string }> = {
    readme: {
      title: 'Project Documentation (README.md)',
      filename: 'README.md',
      language: 'markdown',
      content: deliverables?.readme || '# Loading documentation...',
    },
    prisma: {
      title: 'Prisma ORM Schema',
      filename: 'prisma/schema.prisma',
      language: 'prisma',
      content: deliverables?.prismaSchema || '// Loading Prisma Schema...',
    },
    backendServer: {
      title: 'Express Backend Entry (index.ts)',
      filename: 'server/src/index.ts',
      language: 'typescript',
      content: deliverables?.backendServerTs || '// Loading Server code...',
    },
    backendPkg: {
      title: 'Backend package.json',
      filename: 'server/package.json',
      language: 'json',
      content: deliverables?.backendPackageJson || '{}',
    },
    frontendPkg: {
      title: 'Frontend package.json',
      filename: 'client/package.json',
      language: 'json',
      content: deliverables?.frontendPackageJson || '{}',
    },
    dockerCompose: {
      title: 'Docker Compose (Production Stack)',
      filename: 'docker-compose.yml',
      language: 'yaml',
      content: deliverables?.dockerCompose || '# Loading Docker Compose...',
    },
  };

  const handleCopy = (key: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedKey(key);
    success(`Copied ${filesMap[key]?.filename || 'file'} to clipboard!`);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleDownloadFile = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename.split('/').pop() || 'file.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    success(`Downloaded ${filename}`);
  };

  const current = filesMap[selectedFile];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 bg-gradient-to-r from-indigo-500/10 via-cyan-500/10 to-purple-500/10 border border-white/10 rounded-3xl backdrop-blur-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <div className="p-2 bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 rounded-xl shadow-md">
                <Sparkles className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-slate-100">
                System Source Code & Production Architecture Repository
              </h2>
            </div>
            <p className="text-xs text-slate-300 max-w-2xl">
              Complete, production-grade schemas, configurations, and backend/frontend source files.
              You can copy, inspect, or download any component with a single click.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleCopy(selectedFile, current?.content || '')}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-indigo-500/25 transition-all cursor-pointer"
            >
              {copiedKey === selectedFile ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copiedKey === selectedFile ? 'Copied to Clipboard!' : 'Copy Current File'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Architecture & Stack Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-cyan-400">
            <Layers className="w-4 h-4" />
            <span>1. Frontend Architecture</span>
          </div>
          <ul className="text-xs text-slate-300 space-y-1">
            <li className="flex items-center gap-1.5">✅ Next.js (App Router) & React</li>
            <li className="flex items-center gap-1.5">✅ Tailwind CSS & Framer Motion</li>
            <li className="flex items-center gap-1.5">✅ TanStack React Query & Axios</li>
            <li className="flex items-center gap-1.5">✅ Drag & Drop Multi-file Uploader</li>
          </ul>
        </div>

        <div className="p-4 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-400">
            <Server className="w-4 h-4" />
            <span>2. Backend REST API</span>
          </div>
          <ul className="text-xs text-slate-300 space-y-1">
            <li className="flex items-center gap-1.5">✅ Express.js + TypeScript REST APIs</li>
            <li className="flex items-center gap-1.5">✅ JWT Auth + OTP Email Verification</li>
            <li className="flex items-center gap-1.5">✅ Multer Multi-file Storage & Metadata</li>
            <li className="flex items-center gap-1.5">✅ Role-based Auth (User & Admin)</li>
          </ul>
        </div>

        <div className="p-4 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
            <Database className="w-4 h-4" />
            <span>3. Database & Bonus Features</span>
          </div>
          <ul className="text-xs text-slate-300 space-y-1">
            <li className="flex items-center gap-1.5">✅ Prisma ORM (User, Verification, File, Folder)</li>
            <li className="flex items-center gap-1.5">✅ Soft Delete & Trash Bin Recovery</li>
            <li className="flex items-center gap-1.5">✅ Recharts Storage & Activity Analytics</li>
            <li className="flex items-center gap-1.5">✅ Docker & Docker-compose Config</li>
          </ul>
        </div>
      </div>

      {/* Code Viewer Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* File Navigator Sidebar */}
        <div className="p-4 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-sm space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-2 mb-3">
            Source Files To Copy
          </h3>
          <div className="space-y-1">
            {Object.keys(filesMap).map((key) => {
              const item = filesMap[key];
              const isSelected = selectedFile === key;
              return (
                <button
                  key={key}
                  onClick={() => setSelectedFile(key)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-between transition-all ${
                    isSelected
                      ? 'bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-600/25'
                      : 'text-slate-300 hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <FileCode className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{item.filename}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Code View Area */}
        <div className="lg:col-span-3 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-sm overflow-hidden flex flex-col">
          {/* Code Header bar */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/10 bg-white/5">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-bold text-slate-200">
                {current?.filename}
              </span>
              <span className="text-[10px] px-2 py-0.5 bg-white/10 text-slate-300 rounded font-mono uppercase">
                {current?.language}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleDownloadFile(current?.filename || 'file', current?.content || '')}
                className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                title="Download this file"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save</span>
              </button>

              <button
                onClick={() => handleCopy(selectedFile, current?.content || '')}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
              >
                {copiedKey === selectedFile ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === selectedFile ? 'Copied' : 'Copy Code'}</span>
              </button>
            </div>
          </div>

          {/* Code Body */}
          <div className="p-4 bg-slate-950/80 overflow-x-auto max-h-[600px]">
            <pre className="text-xs font-mono text-slate-200 leading-relaxed whitespace-pre selection:bg-indigo-600 selection:text-white">
              {current?.content}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

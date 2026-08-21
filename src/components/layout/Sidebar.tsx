import React from 'react';
import {
  Home,
  Files,
  Trash2,
  PieChart,
  Shield,
  Users,
  HardDrive,
  Activity,
  Code,
  FolderTree,
  FileSpreadsheet,
  Layers,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ActiveTab, FolderItem } from '../../types';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  folders: FolderItem[];
  selectedFolderId: string | null;
  setSelectedFolderId: (id: string | null) => void;
  onOpenNewFolderModal: () => void;
  isOpenMobile: boolean;
  setIsOpenMobile: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  folders,
  selectedFolderId,
  setSelectedFolderId,
  onOpenNewFolderModal,
  isOpenMobile,
  setIsOpenMobile,
}) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const usedMB = user ? (user.usedStorageBytes / (1024 * 1024)).toFixed(1) : '0';
  const totalMB = user ? (user.storageQuotaBytes / (1024 * 1024)).toFixed(0) : '500';
  const percentUsed = user
    ? Math.min(100, Math.round((user.usedStorageBytes / user.storageQuotaBytes) * 100))
    : 0;

  const handleTabClick = (tab: ActiveTab) => {
    setActiveTab(tab);
    if (tab === 'my-files') {
      setSelectedFolderId(null);
    }
    setIsOpenMobile(false);
  };

  const navItemClass = (isActive: boolean) =>
    `w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
      isActive
        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
        : 'text-slate-400 hover:text-slate-100 hover:bg-white/5'
    }`;

  const content = (
    <aside className="w-64 flex flex-col h-full bg-slate-900/60 backdrop-blur-2xl border-r border-white/10 p-4 select-none text-slate-300">
      {/* Primary Navigation */}
      <div className="space-y-6 flex-1 overflow-y-auto pr-1">
        {/* Main Section */}
        <div>
          <div className="px-3 mb-2 text-[10px] font-bold tracking-wider uppercase text-slate-500">
            Overview & Workspace
          </div>
          <div className="space-y-1">
            <button
              id="sidebar-landing-page"
              onClick={() => handleTabClick('landing')}
              className={navItemClass(activeTab === 'landing')}
            >
              <Home className="w-4 h-4 shrink-0 text-cyan-400" />
              <span>Landing Page</span>
            </button>

            <button
              id="sidebar-my-files"
              onClick={() => handleTabClick('my-files')}
              className={navItemClass(activeTab === 'my-files' && selectedFolderId === null)}
            >
              <Files className="w-4 h-4 shrink-0" />
              <span>My Files</span>
            </button>

            <button
              id="sidebar-trash"
              onClick={() => handleTabClick('trash')}
              className={navItemClass(activeTab === 'trash')}
            >
              <Trash2 className="w-4 h-4 shrink-0" />
              <span>Trash Bin</span>
            </button>

            <button
              id="sidebar-user-analytics"
              onClick={() => handleTabClick('user-analytics')}
              className={navItemClass(activeTab === 'user-analytics')}
            >
              <PieChart className="w-4 h-4 shrink-0" />
              <span>Storage & Analytics</span>
            </button>
          </div>
        </div>

        {/* Folders subsection */}
        <div>
          <div className="px-3 mb-2 flex items-center justify-between">
            <span className="text-[10px] font-bold tracking-wider uppercase text-slate-500">
              Folders ({folders.length})
            </span>
            <button
              id="sidebar-new-folder-btn"
              onClick={onOpenNewFolderModal}
              className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              + New
            </button>
          </div>
          <div className="space-y-1">
            {folders.length === 0 ? (
              <p className="px-3 py-1.5 text-xs text-slate-500 italic">No custom folders</p>
            ) : (
              folders.map((folder) => {
                const isSelected = activeTab === 'my-files' && selectedFolderId === folder.id;
                return (
                  <button
                    key={folder.id}
                    id={`sidebar-folder-${folder.id}`}
                    onClick={() => {
                      setActiveTab('my-files');
                      setSelectedFolderId(folder.id);
                      setIsOpenMobile(false);
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
                      isSelected
                        ? 'bg-white/10 text-white font-semibold border border-white/10'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <FolderTree className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span className="truncate">{folder.name}</span>
                    </div>
                    <ChevronRight className="w-3 h-3 opacity-40 shrink-0" />
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Admin Section (Only for ADMIN role) */}
        {isAdmin && (
          <div>
            <div className="px-3 mb-2 flex items-center gap-1.5 text-[10px] font-bold tracking-wider uppercase text-indigo-400">
              <Shield className="w-3 h-3" />
              <span>Admin Management</span>
            </div>
            <div className="space-y-1">
              <button
                id="sidebar-admin-dashboard"
                onClick={() => handleTabClick('admin-dashboard')}
                className={navItemClass(activeTab === 'admin-dashboard')}
              >
                <Layers className="w-4 h-4 shrink-0" />
                <span>Admin Dashboard</span>
              </button>

              <button
                id="sidebar-admin-users"
                onClick={() => handleTabClick('admin-users')}
                className={navItemClass(activeTab === 'admin-users')}
              >
                <Users className="w-4 h-4 shrink-0" />
                <span>User Management</span>
              </button>

              <button
                id="sidebar-admin-files"
                onClick={() => handleTabClick('admin-files')}
                className={navItemClass(activeTab === 'admin-files')}
              >
                <FileSpreadsheet className="w-4 h-4 shrink-0" />
                <span>Global Files Explorer</span>
              </button>

              <button
                id="sidebar-audit-logs"
                onClick={() => handleTabClick('audit-logs')}
                className={navItemClass(activeTab === 'audit-logs')}
              >
                <Activity className="w-4 h-4 shrink-0" />
                <span>Security Audit Logs</span>
              </button>
            </div>
          </div>
        )}

        {/* Assessment Deliverables Hub */}
        <div>
          <div className="px-3 mb-2 text-[10px] font-bold tracking-wider uppercase text-amber-400">
            Assessment Submission
          </div>
          <button
            id="sidebar-deliverables-hub"
            onClick={() => handleTabClick('deliverables')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'deliverables'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-lg shadow-amber-500/10'
                : 'text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20'
            }`}
          >
            <Code className="w-4 h-4 shrink-0" />
            <span>Deliverables & Code Hub</span>
          </button>
        </div>
      </div>

      {/* Bottom Storage Info Widget */}
      <div className="mt-4 pt-4 border-t border-white/10">
        <div className="p-3.5 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-200">
            <span className="flex items-center gap-1.5">
              <HardDrive className="w-3.5 h-3.5 text-indigo-400" />
              Storage Used
            </span>
            <span>{percentUsed}%</span>
          </div>
          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden mb-2">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                percentUsed > 85 ? 'bg-rose-500' : percentUsed > 60 ? 'bg-amber-500' : 'bg-indigo-500'
              }`}
              style={{ width: `${percentUsed}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-400">
            {usedMB} MB of {totalMB} MB quota
          </p>
        </div>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:block shrink-0">{content}</div>

      {/* Mobile Drawer */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-40 md:hidden flex">
          <div
            onClick={() => setIsOpenMobile(false)}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
          />
          <div className="relative z-50 w-72 max-w-[85vw] h-full shadow-2xl">
            {content}
          </div>
        </div>
      )}
    </>
  );
};

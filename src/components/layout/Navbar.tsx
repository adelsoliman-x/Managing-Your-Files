import React from 'react';
import {
  FolderArchive,
  Upload,
  Search,
  Moon,
  Sun,
  LogOut,
  User as UserIcon,
  ShieldCheck,
  Code2,
  HardDrive,
  Menu,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { ActiveTab } from '../../types';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onOpenUpload: () => void;
  onOpenProfile: () => void;
  isDarkMode?: boolean;
  setIsDarkMode?: (val: boolean | ((prev: boolean) => boolean)) => void;
  onToggleSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
  onOpenUpload,
  onOpenProfile,
  onToggleSidebar,
}) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const usedMB = user ? (user.usedStorageBytes / (1024 * 1024)).toFixed(1) : '0';
  const totalMB = user ? (user.storageQuotaBytes / (1024 * 1024)).toFixed(0) : '500';
  const percentUsed = user
    ? Math.min(100, Math.round((user.usedStorageBytes / user.storageQuotaBytes) * 100))
    : 0;

  return (
    <header className="sticky top-0 z-30 w-full bg-white/5 backdrop-blur-2xl border-b border-white/10 text-slate-100 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand & Mobile Sidebar Toggle */}
        <div className="flex items-center gap-3">
          <button
            id="mobile-sidebar-toggle"
            onClick={onToggleSidebar}
            className="md:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div
            onClick={() => setActiveTab('landing')}
            className="flex items-center gap-3 cursor-pointer group"
            title="Go to Home / Landing Page"
          >
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
              <FolderArchive className="w-5 h-5" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-base font-bold tracking-tight text-slate-100 leading-tight">
                CloudVault
              </h1>
              <p className="text-[10px] font-semibold text-indigo-400 uppercase tracking-widest">
                Enterprise Workspace
              </p>
            </div>
          </div>
        </div>

        {/* Center: Search input */}
        <div className="flex-1 max-w-md hidden md:block">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              id="navbar-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search files, extensions, tags, or content..."
              className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-200 placeholder:text-slate-500 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-200"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Right Action buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Theme Toggle Button (Dark / Light) */}
          <button
            id="navbar-theme-toggle-btn"
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-amber-300 transition-colors cursor-pointer"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-600" />
            )}
          </button>

          {/* Quick Deliverables / Code Exporter shortcut */}
          <button
            id="navbar-deliverables-btn"
            onClick={() => setActiveTab('deliverables')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'deliverables'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-lg shadow-amber-500/10'
                : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
            }`}
            title="View Deliverables, Prisma Schema & Standalone Project Files"
          >
            <Code2 className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden lg:inline">Assessment Deliverables</span>
            <span className="lg:hidden">Code</span>
          </button>

          {/* Quick Upload Button */}
          <button
            id="navbar-upload-btn"
            onClick={onOpenUpload}
            className="px-3.5 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-indigo-500/25 transition-all cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload</span>
          </button>

          {/* User Profile dropdown / trigger */}
          {user && (
            <div className="flex items-center gap-2 pl-2 border-l border-white/10">
              <button
                id="navbar-profile-btn"
                onClick={onOpenProfile}
                className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-white/5 transition-colors"
                title="Manage Profile"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-500 p-0.5 shrink-0">
                  <img
                    src={user.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
                    alt={user.name}
                    className="w-full h-full rounded-full object-cover bg-slate-900"
                  />
                </div>
                <div className="hidden xl:block text-left">
                  <div className="flex items-center gap-1">
                    <p className="text-xs font-semibold text-slate-200 leading-tight">
                      {user.name}
                    </p>
                    {user.role === 'ADMIN' && (
                      <ShieldCheck className="w-3 h-3 text-indigo-400" />
                    )}
                  </div>
                  <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-tight">
                    {user.role === 'ADMIN' ? 'Administrator' : `${usedMB}/${totalMB} MB`}
                  </p>
                </div>
              </button>

              <button
                id="navbar-logout-btn"
                onClick={logout}
                className="p-2 text-slate-400 hover:text-rose-400 hover:bg-white/5 rounded-xl transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

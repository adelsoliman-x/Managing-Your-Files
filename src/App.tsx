import React, { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './components/common/Toast';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { AuthModal } from './components/auth/AuthModal';
import { ProfileModal } from './components/profile/ProfileModal';
import { FileUploadModal } from './components/files/FileUploadModal';
import { FileDetailsModal } from './components/files/FileDetailsModal';
import { FolderManagerModal } from './components/files/FolderManagerModal';
import { FileExplorerView } from './components/files/FileExplorerView';
import { UserStatsView } from './components/dashboard/UserStatsView';
import { AdminDashboardView } from './components/admin/AdminDashboardView';
import { AdminUsersView } from './components/admin/AdminUsersView';
import { AdminFilesView } from './components/admin/AdminFilesView';
import { AuditLogsView } from './components/admin/AuditLogsView';
import { DeliverablesHub } from './components/export/DeliverablesHub';
import { LandingPage } from './components/landing/LandingPage';
import { foldersApi } from './services/api';
import { ActiveTab, FileItem, FolderItem } from './types';
import { Files, UploadCloud, ShieldAlert, Sparkles, FolderPlus } from 'lucide-react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 2, // 2 mins
    },
  },
});

const MainLayout: React.FC = () => {
  const { user, isAuthenticated } = useAuth();

  // Navigation State
  const [activeTab, setActiveTab] = useState<ActiveTab>('my-files');
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarMobileOpen, setIsSidebarMobileOpen] = useState(false);

  // Modals
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [selectedFileForModal, setSelectedFileForModal] = useState<FileItem | null>(null);

  // Load Folders
  const loadFolders = async () => {
    if (!isAuthenticated) {
      setFolders([]);
      return;
    }
    try {
      const res = await foldersApi.getFolders();
      if (res.data.success) {
        setFolders(res.data.folders);
      }
    } catch (err) {
      console.error('Error fetching folders:', err);
    }
  };

  useEffect(() => {
    loadFolders();
  }, [isAuthenticated]);

  // If not logged in, prompt Auth Modal or show Guest Welcome view
  const handleOpenUpload = () => {
    if (!isAuthenticated) {
      setIsAuthModalOpen(true);
      return;
    }
    setIsUploadModalOpen(true);
  };

  const handleOpenNewFolder = () => {
    if (!isAuthenticated) {
      setIsAuthModalOpen(true);
      return;
    }
    setIsFolderModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0f172a] text-slate-100 antialiased font-sans relative overflow-hidden selection:bg-indigo-500 selection:text-white">
      {/* Ambient Frosted Glow Orbs */}
      <div className="fixed -top-28 -left-28 w-96 h-96 bg-indigo-600/25 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="fixed -bottom-28 -right-28 w-96 h-96 bg-cyan-600/20 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="fixed top-1/2 left-1/3 w-80 h-80 bg-purple-600/15 rounded-full blur-[140px] pointer-events-none z-0" />

      {/* Top Fixed Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onOpenUpload={handleOpenUpload}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        isDarkMode={true}
        setIsDarkMode={() => {}}
        onToggleSidebar={() => setIsSidebarMobileOpen((prev) => !prev)}
      />

      {/* Main Body with Sidebar + View */}
      <div className="flex-1 flex overflow-hidden relative z-10">
        {/* Left Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          folders={folders}
          selectedFolderId={selectedFolderId}
          setSelectedFolderId={setSelectedFolderId}
          onOpenNewFolderModal={handleOpenNewFolder}
          isOpenMobile={isSidebarMobileOpen}
          setIsOpenMobile={setIsSidebarMobileOpen}
        />

        {/* Dynamic Main Content View */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* If user is not authenticated and on internal tabs, show welcome banner */}
            {!isAuthenticated && activeTab !== 'landing' && (
              <div className="p-6 bg-white/5 backdrop-blur-xl border border-white/10 text-white rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
                <div className="absolute -top-12 -right-12 w-48 h-48 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />
                <div className="space-y-2 text-center md:text-left relative z-10">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 border border-white/10 backdrop-blur-md rounded-full text-xs font-semibold text-indigo-300">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>CloudVault Enterprise Platform</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                    Welcome to CloudVault Workspace
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
                    Secure file explorer with JWT authentication, OTP verification,
                    drag-and-drop uploads, metadata extraction, live previews, and analytics.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 shrink-0 relative z-10">
                  <button
                    id="guest-login-btn"
                    onClick={() => setIsAuthModalOpen(true)}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-500/25 transition-all cursor-pointer"
                  >
                    Sign In / Register
                  </button>
                  <button
                    id="guest-deliverables-btn"
                    onClick={() => setActiveTab('deliverables')}
                    className="px-5 py-2.5 bg-white/10 hover:bg-white/15 text-slate-200 border border-white/10 font-semibold text-xs rounded-xl transition-all cursor-pointer"
                  >
                    Architecture & Schemas
                  </button>
                </div>
              </div>
            )}

            {/* View Switcher based on Active Tab */}
            {activeTab === 'landing' && (
              <LandingPage
                onEnterApp={() => setActiveTab('my-files')}
                onOpenAuth={() => setIsAuthModalOpen(true)}
                setActiveTab={setActiveTab}
              />
            )}

            {activeTab === 'my-files' && (
              <FileExplorerView
                isTrashMode={false}
                selectedFolderId={selectedFolderId}
                setSelectedFolderId={setSelectedFolderId}
                folders={folders}
                onOpenUpload={handleOpenUpload}
                onOpenNewFolder={handleOpenNewFolder}
                onSelectFile={(file) => setSelectedFileForModal(file)}
              />
            )}

            {activeTab === 'trash' && (
              <FileExplorerView
                isTrashMode={true}
                selectedFolderId={null}
                setSelectedFolderId={() => {}}
                folders={[]}
                onOpenUpload={handleOpenUpload}
                onOpenNewFolder={handleOpenNewFolder}
                onSelectFile={(file) => setSelectedFileForModal(file)}
              />
            )}

            {activeTab === 'user-analytics' && <UserStatsView />}

            {activeTab === 'admin-dashboard' && (
              <AdminDashboardView onSelectFile={(file) => setSelectedFileForModal(file)} />
            )}

            {activeTab === 'admin-users' && <AdminUsersView />}

            {activeTab === 'admin-files' && (
              <AdminFilesView onSelectFile={(file) => setSelectedFileForModal(file)} />
            )}

            {activeTab === 'audit-logs' && <AuditLogsView />}

            {activeTab === 'deliverables' && <DeliverablesHub />}
          </div>
        </main>
      </div>

      {/* Global Modals */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />

      <ProfileModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} />

      <FileUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        folders={folders}
        currentFolderId={selectedFolderId}
        onUploadSuccess={() => {
          // Trigger file list refresh or folder reload
          loadFolders();
        }}
      />

      <FolderManagerModal
        isOpen={isFolderModalOpen}
        onClose={() => setIsFolderModalOpen(false)}
        folders={folders}
        onFolderCreated={loadFolders}
        onFolderDeleted={loadFolders}
      />

      <FileDetailsModal
        isOpen={!!selectedFileForModal}
        onClose={() => setSelectedFileForModal(null)}
        file={selectedFileForModal}
        folders={folders}
        onFileUpdated={() => {
          setSelectedFileForModal(null);
        }}
        onFileTrashed={() => {
          setSelectedFileForModal(null);
        }}
      />
    </div>
  );
};

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <AuthProvider>
          <MainLayout />
        </AuthProvider>
      </ToastProvider>
    </QueryClientProvider>
  );
}

import React, { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPie,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import {
  Users,
  HardDrive,
  Files,
  ShieldCheck,
  RefreshCw,
  Clock,
  ArrowUpRight,
} from 'lucide-react';
import { statsApi, filesApi } from '../../services/api';
import { AdminStats, FileItem } from '../../types';
import { useAuth } from '../../context/AuthContext';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#6366F1'];

export const AdminDashboardView: React.FC<{ onSelectFile: (file: FileItem) => void }> = ({ onSelectFile }) => {
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAdminStats = async () => {
    if (!isAuthenticated || user?.role !== 'ADMIN') {
      setStats(null);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const res = await statsApi.getAdminStats();
      if (res.data.success) {
        setStats(res.data.stats);
      }
    } catch (err: any) {
      if (err.response?.status !== 401 && err.response?.status !== 403) {
        console.error('Failed to load admin stats', err);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthLoading) {
      fetchAdminStats();
    }
  }, [isAuthenticated, isAuthLoading, user?.role]);

  if (isAuthLoading || (isLoading && isAuthenticated && user?.role === 'ADMIN')) {
    return (
      <div className="flex items-center justify-center py-20">
        <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'ADMIN' || !stats) {
    return (
      <div className="p-8 text-center bg-white/5 rounded-3xl border border-white/10 space-y-4">
        <ShieldCheck className="w-12 h-12 text-amber-400 mx-auto" />
        <h3 className="text-lg font-bold text-slate-100">Administrator Privileges Required</h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          You need an Administrator account to view system-wide storage analytics, manage all users, and audit platform activity.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-100">Administrator Overview</h2>
            <span className="px-2.5 py-0.5 bg-indigo-500/20 text-indigo-300 text-[10px] font-bold rounded-full border border-indigo-500/30">
              Admin Exclusive
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Global system analytics across all accounts, server storage, and user distributions.
          </p>
        </div>
        <button
          onClick={fetchAdminStats}
          className="self-start sm:self-auto px-3.5 py-1.5 bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5 text-indigo-400" />
          Refresh Metrics
        </button>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-sm flex items-center gap-3.5">
          <div className="p-3 bg-white/10 border border-white/10 text-indigo-400 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-medium text-slate-400">Total Users</span>
            <h3 className="text-xl font-bold text-slate-100 mt-0.5">{stats.totalUsers}</h3>
            <span className="text-[10px] text-emerald-400 font-semibold">
              {stats.activeUsers} active ({stats.verifiedUsers} verified)
            </span>
          </div>
        </div>

        <div className="p-4 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-sm flex items-center gap-3.5">
          <div className="p-3 bg-white/10 border border-white/10 text-cyan-400 rounded-xl">
            <Files className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-medium text-slate-400">All System Files</span>
            <h3 className="text-xl font-bold text-slate-100 mt-0.5">{stats.totalFiles}</h3>
            <span className="text-[10px] text-slate-400">{stats.trashedFilesCount} in trash bin</span>
          </div>
        </div>

        <div className="p-4 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-sm flex items-center gap-3.5">
          <div className="p-3 bg-white/10 border border-white/10 text-emerald-400 rounded-xl">
            <HardDrive className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-medium text-slate-400">Total Storage Pool</span>
            <h3 className="text-xl font-bold text-slate-100 mt-0.5">{stats.formattedTotalStorage}</h3>
            <span className="text-[10px] text-slate-400">Disk payload</span>
          </div>
        </div>

        <div className="p-4 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-sm flex items-center gap-3.5">
          <div className="p-3 bg-white/10 border border-white/10 text-amber-400 rounded-xl">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-medium text-slate-400">Admin Accounts</span>
            <h3 className="text-xl font-bold text-slate-100 mt-0.5">{stats.adminCount}</h3>
            <span className="text-[10px] text-indigo-400 font-semibold">Full Privileges</span>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Uploaded Extensions */}
        <div className="p-5 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-100">Top Uploaded File Formats</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.topFileTypes}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff" opacity={0.1} />
                <XAxis dataKey="extension" tick={{ fontSize: 11, fill: '#94A3B8' }} stroke="#475569" />
                <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} stroke="#475569" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    color: '#F8FAFC',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" fill="#6366F1" radius={[6, 6, 0, 0]} name="Files Count" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Aggregate Distribution */}
        <div className="p-5 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-100">Storage Breakdown by Category (MB)</h3>
          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPie>
                <Pie
                  data={stats.categoryStats}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="mb"
                  nameKey="category"
                >
                  {stats.categoryStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="transparent" />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    color: '#F8FAFC',
                    fontSize: '12px',
                  }}
                />
                <Legend />
              </RechartsPie>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Uploads Across All Users */}
      <div className="p-5 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-400" />
            Recent Global Uploads
          </h3>
          <span className="text-xs text-slate-400">Across entire system</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead>
              <tr className="border-b border-white/10 text-slate-400 uppercase text-[10px] font-bold bg-white/5">
                <th className="py-2.5 px-3">File Name</th>
                <th className="py-2.5 px-3">Uploaded By</th>
                <th className="py-2.5 px-3">Size</th>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {stats.recentUploads.map((file) => (
                <tr
                  key={file.id}
                  className="hover:bg-white/5 transition-colors"
                >
                  <td className="py-2.5 px-3 font-semibold text-slate-100 truncate max-w-xs">
                    {file.name}
                  </td>
                  <td className="py-2.5 px-3 text-indigo-400 font-medium">
                    {file.owner?.name || 'Unknown'}
                  </td>
                  <td className="py-2.5 px-3 text-slate-400 font-mono">
                    {(file.sizeBytes / 1024).toFixed(1)} KB
                  </td>
                  <td className="py-2.5 px-3 text-slate-400">
                    {new Date(file.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <button
                      onClick={() => onSelectFile(file)}
                      className="px-2.5 py-1 text-[11px] bg-white/5 hover:bg-indigo-600 hover:text-white text-slate-200 border border-white/10 rounded-lg font-semibold transition-colors inline-flex items-center gap-1"
                    >
                      <span>Inspect</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

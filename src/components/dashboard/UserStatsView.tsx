import React, { useEffect, useState } from 'react';
import {
  PieChart as RechartsPie,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar,
  Legend,
} from 'recharts';
import { HardDrive, Files, Trash2, TrendingUp, Sparkles, RefreshCw, Layers } from 'lucide-react';
import { statsApi } from '../../services/api';
import { UserStats } from '../../types';
import { useAuth } from '../../context/AuthContext';

export const UserStatsView: React.FC = () => {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = async () => {
    if (!isAuthenticated) {
      setStats(null);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const res = await statsApi.getUserStats();
      if (res.data.success) {
        setStats(res.data.stats);
      }
    } catch (err: any) {
      if (err.response?.status !== 401) {
        console.error('Failed to fetch user stats', err);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthLoading) {
      fetchStats();
    }
  }, [isAuthenticated, isAuthLoading]);

  if (isAuthLoading || (isLoading && isAuthenticated)) {
    return (
      <div className="flex items-center justify-center py-20">
        <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || !stats) {
    return (
      <div className="p-8 text-center bg-white/5 rounded-3xl border border-white/10 space-y-4">
        <HardDrive className="w-12 h-12 text-indigo-400 mx-auto" />
        <h3 className="text-lg font-bold text-slate-100">Sign in to view storage analytics</h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          Analytics provide real-time metrics on your files, storage quota breakdown, upload frequency, and category distributions.
        </p>
      </div>
    );
  }

  const usedMB = (stats.usedStorageBytes / (1024 * 1024)).toFixed(1);
  const totalMB = (stats.storageQuotaBytes / (1024 * 1024)).toFixed(0);

  const pieData = stats.categoryStats.filter((c) => c.count > 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100">Storage & Usage Analytics</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time breakdown of your uploaded files, storage distribution, and upload velocity.
          </p>
        </div>
        <button
          onClick={fetchStats}
          className="self-start sm:self-auto px-3.5 py-1.5 bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5 text-indigo-400" />
          Refresh Stats
        </button>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-sm flex items-center gap-3.5">
          <div className="p-3 bg-white/10 border border-white/10 text-indigo-400 rounded-xl">
            <Files className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-medium text-slate-400">Total Uploaded Files</span>
            <h3 className="text-xl font-bold text-slate-100 mt-0.5">{stats.totalFiles}</h3>
          </div>
        </div>

        <div className="p-4 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-sm flex items-center gap-3.5">
          <div className="p-3 bg-white/10 border border-white/10 text-emerald-400 rounded-xl">
            <HardDrive className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-medium text-slate-400">Storage Consumption</span>
            <h3 className="text-xl font-bold text-slate-100 mt-0.5">
              {usedMB} <span className="text-xs font-normal text-slate-400">/ {totalMB} MB</span>
            </h3>
          </div>
        </div>

        <div className="p-4 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-sm flex items-center gap-3.5">
          <div className="p-3 bg-white/10 border border-white/10 text-amber-400 rounded-xl">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-medium text-slate-400">Storage Used</span>
            <h3 className="text-xl font-bold text-slate-100 mt-0.5">{stats.storageUsedPercent}%</h3>
          </div>
        </div>

        <div className="p-4 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-sm flex items-center gap-3.5">
          <div className="p-3 bg-white/10 border border-white/10 text-rose-400 rounded-xl">
            <Trash2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-medium text-slate-400">Items in Trash</span>
            <h3 className="text-xl font-bold text-slate-100 mt-0.5">{stats.trashedCount}</h3>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Timeline (Area Chart) */}
        <div className="p-5 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-100">Upload Activity Timeline</h3>
            <span className="text-xs text-slate-400">Past 7 Days</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.uploadHistory}>
                <defs>
                  <linearGradient id="uploadGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff" opacity={0.1} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94A3B8' }} stroke="#475569" />
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
                <Area type="monotone" dataKey="files" stroke="#6366F1" strokeWidth={2.5} fillOpacity={1} fill="url(#uploadGradient)" name="Files Uploaded" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown (Pie Chart) */}
        <div className="p-5 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-100">File Types & Categories</h3>
            <span className="text-xs text-slate-400">Distribution</span>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            {pieData.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No files uploaded yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPie>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="count"
                    nameKey="category"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
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
            )}
          </div>
        </div>
      </div>

      {/* Category Breakdown Table */}
      <div className="p-5 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-sm space-y-3">
        <h3 className="text-sm font-bold text-slate-100">Category Storage Details</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {stats.categoryStats.map((cat) => (
            <div key={cat.category} className="p-3 bg-white/5 rounded-xl border border-white/10">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                <span className="text-xs font-semibold text-slate-300 capitalize">{cat.category.toLowerCase()}</span>
              </div>
              <p className="text-sm font-bold text-slate-100">{cat.count} files</p>
              <p className="text-[10px] text-slate-400">{cat.formattedSize}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

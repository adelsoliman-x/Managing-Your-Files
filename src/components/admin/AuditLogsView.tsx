import React, { useEffect, useState } from 'react';
import { Activity, ShieldCheck, Clock, RefreshCw, Key, FileUp, Trash2, UserCheck } from 'lucide-react';
import { auditApi } from '../../services/api';
import { AuditLog } from '../../types';
import { useAuth } from '../../context/AuthContext';

export const AuditLogsView: React.FC = () => {
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLogs = async () => {
    if (!isAuthenticated || user?.role !== 'ADMIN') {
      setLogs([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const res = await auditApi.getLogs(100);
      if (res.data.success) {
        setLogs(res.data.logs);
      }
    } catch (err: any) {
      if (err.response?.status !== 401 && err.response?.status !== 403) {
        console.error('Failed to load audit logs', err);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthLoading) {
      fetchLogs();
    }
  }, [isAuthenticated, isAuthLoading, user?.role]);

  const getActionBadge = (action: string) => {
    if (action.includes('LOGIN') || action.includes('AUTH')) {
      return (
        <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded-lg text-[10px] font-bold flex items-center gap-1">
          <Key className="w-3 h-3" />
          {action}
        </span>
      );
    }
    if (action.includes('UPLOAD') || action.includes('FILE')) {
      return (
        <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-lg text-[10px] font-bold flex items-center gap-1">
          <FileUp className="w-3 h-3" />
          {action}
        </span>
      );
    }
    if (action.includes('DELETE') || action.includes('TRASH')) {
      return (
        <span className="px-2 py-0.5 bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-lg text-[10px] font-bold flex items-center gap-1">
          <Trash2 className="w-3 h-3" />
          {action}
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-lg text-[10px] font-bold flex items-center gap-1">
        <UserCheck className="w-3 h-3" />
        {action}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100">Security & System Audit Logs</h2>
          <p className="text-xs text-slate-400 mt-1">
            Immutable log of all user authentication events, file uploads, role changes, and data purges.
          </p>
        </div>
        <button
          onClick={fetchLogs}
          className="self-start sm:self-auto px-3.5 py-1.5 bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5 text-indigo-400" />
          Refresh Logs
        </button>
      </div>

      {/* Logs Container */}
      <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-20 flex justify-center">
            <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin" />
          </div>
        ) : logs.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-xs">No audit logs recorded yet.</div>
        ) : (
          <div className="divide-y divide-white/5 max-h-[650px] overflow-y-auto">
            {logs.map((log) => (
              <div key={log.id} className="p-4 hover:bg-white/5 transition-colors flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-white/10 border border-white/10 rounded-xl mt-0.5">
                    <Activity className="w-4 h-4 text-indigo-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      {getActionBadge(log.action)}
                      <span className="text-xs font-bold text-slate-100">
                        {log.userEmail || 'System Event'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300">{log.details}</p>
                    {log.ipAddress && (
                      <span className="text-[10px] text-slate-400 font-mono mt-1 inline-block">
                        IP: {log.ipAddress}
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-right text-[11px] text-slate-400 shrink-0 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-indigo-400" />
                  {new Date(log.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  })}
                  <span className="hidden sm:inline"> • {new Date(log.timestamp).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

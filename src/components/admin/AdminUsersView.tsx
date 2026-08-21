import React, { useEffect, useState } from 'react';
import {
  Users,
  Search,
  ShieldCheck,
  User as UserIcon,
  Shield,
  Trash2,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Edit2,
  HardDrive,
} from 'lucide-react';
import { usersApi } from '../../services/api';
import { User, UserRole, UserStatus } from '../../types';
import { useToast } from '../common/Toast';
import { useAuth } from '../../context/AuthContext';

export const AdminUsersView: React.FC = () => {
  const { user: currentAdmin, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { success, error } = useToast();

  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Edit user modal
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editRole, setEditRole] = useState<UserRole>('USER');
  const [editStatus, setEditStatus] = useState<UserStatus>('ACTIVE');
  const [editQuotaMB, setEditQuotaMB] = useState(500);

  const fetchUsers = async () => {
    if (!isAuthenticated || currentAdmin?.role !== 'ADMIN') {
      setUsers([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const res = await usersApi.getUsers({
        search: search || undefined,
        role: roleFilter !== 'ALL' ? roleFilter : undefined,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
      });
      if (res.data.success) {
        setUsers(res.data.users);
      }
    } catch (err: any) {
      if (err.response?.status !== 401 && err.response?.status !== 403) {
        console.error('Failed to fetch users', err);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthLoading) {
      fetchUsers();
    }
  }, [roleFilter, statusFilter, isAuthenticated, isAuthLoading, currentAdmin?.role]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    setEditRole(user.role);
    setEditStatus(user.status || 'ACTIVE');
    setEditQuotaMB(Math.round(user.storageQuotaBytes / (1024 * 1024)));
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    try {
      const res = await usersApi.updateUser(editingUser.id, {
        role: editRole,
        status: editStatus,
        storageQuotaMB: editQuotaMB,
      });
      if (res.data.success) {
        success(`User ${editingUser.email} updated.`);
        setEditingUser(null);
        fetchUsers();
      }
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to update user.');
    }
  };

  const handleDeleteUser = async (user: User) => {
    if (user.id === currentAdmin?.id) {
      error('You cannot delete your own admin account.');
      return;
    }
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete user "${user.name}" (${user.email}) and all their uploaded files?`
    );
    if (!confirmed) return;

    try {
      const res = await usersApi.deleteUser(user.id);
      if (res.data.success) {
        success(res.data.message || 'User deleted successfully.');
        fetchUsers();
      }
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to delete user.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100">User Accounts Management</h2>
          <p className="text-xs text-slate-400 mt-1">
            Control user permissions, role elevation (Admin/User), account status, and storage quotas.
          </p>
        </div>
        <button
          onClick={fetchUsers}
          className="self-start sm:self-auto px-3.5 py-1.5 bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5 text-indigo-400" />
          Refresh List
        </button>
      </div>

      {/* Search & Filters */}
      <div className="p-4 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            id="admin-search-users-input"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs sm:text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </form>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            id="admin-filter-role"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="text-xs bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="ALL" className="bg-slate-900 text-slate-200">All Roles</option>
            <option value="USER" className="bg-slate-900 text-slate-200">Standard Users</option>
            <option value="ADMIN" className="bg-slate-900 text-slate-200">Administrators</option>
          </select>

          <select
            id="admin-filter-status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="ALL" className="bg-slate-900 text-slate-200">All Statuses</option>
            <option value="ACTIVE" className="bg-slate-900 text-slate-200">Active</option>
            <option value="SUSPENDED" className="bg-slate-900 text-slate-200">Suspended</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-20 flex justify-center">
            <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin" />
          </div>
        ) : users.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-xs">No users matched your criteria.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead>
                <tr className="border-b border-white/10 text-slate-400 uppercase text-[10px] font-bold bg-white/5">
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Files</th>
                  <th className="py-3 px-4">Storage Usage</th>
                  <th className="py-3 px-4">Created</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {users.map((u) => {
                  const usedMB = (u.usedStorageBytes / (1024 * 1024)).toFixed(1);
                  const quotaMB = (u.storageQuotaBytes / (1024 * 1024)).toFixed(0);
                  const isCurrent = u.id === currentAdmin?.id;

                  return (
                    <tr
                      key={u.id}
                      className="hover:bg-white/5 transition-colors"
                    >
                      {/* Name & Email */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={u.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${u.name}`}
                            alt={u.name}
                            className="w-8 h-8 rounded-full border border-white/10 object-cover"
                          />
                          <div>
                            <div className="flex items-center gap-1.5 font-bold text-slate-100">
                              <span>{u.name}</span>
                              {isCurrent && (
                                <span className="text-[10px] text-indigo-400 font-semibold">(You)</span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-400">{u.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="py-3 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            u.role === 'ADMIN'
                              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                              : 'bg-white/10 text-slate-300'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold ${
                            u.status === 'ACTIVE'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          }`}
                        >
                          {u.status === 'ACTIVE' ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                          {u.status || 'ACTIVE'}
                        </span>
                      </td>

                      {/* Files Count */}
                      <td className="py-3 px-4 font-semibold text-slate-200">
                        {u.filesCount || 0}
                      </td>

                      {/* Storage */}
                      <td className="py-3 px-4 text-slate-300 font-mono">
                        {usedMB} / {quotaMB} MB
                      </td>

                      {/* Created */}
                      <td className="py-3 px-4 text-slate-400">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(u)}
                            className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-white/10 rounded-lg transition-colors"
                            title="Edit Role & Quota"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          {!isCurrent && (
                            <button
                              onClick={() => handleDeleteUser(u)}
                              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-white/10 rounded-lg transition-colors"
                              title="Delete Account"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
          <div className="w-full max-w-md bg-slate-900/90 backdrop-blur-2xl border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4 text-slate-100">
            <h3 className="text-base font-bold text-slate-100">
              Edit Account: {editingUser.name}
            </h3>
            <p className="text-xs text-slate-400">{editingUser.email}</p>

            <form onSubmit={handleSaveUser} className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Role Authorization
                </label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 text-xs bg-white/5 border border-white/10 text-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="USER" className="bg-slate-900 text-slate-200">Standard User (USER)</option>
                  <option value="ADMIN" className="bg-slate-900 text-slate-200">System Administrator (ADMIN)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Account Status
                </label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as UserStatus)}
                  className="w-full px-3 py-2 text-xs bg-white/5 border border-white/10 text-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="ACTIVE" className="bg-slate-900 text-slate-200">Active</option>
                  <option value="SUSPENDED" className="bg-slate-900 text-slate-200">Suspended (Blocked from logging in)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Storage Quota (MB)
                </label>
                <input
                  type="number"
                  min={50}
                  max={10000}
                  value={editQuotaMB}
                  onChange={(e) => setEditQuotaMB(parseInt(e.target.value, 10) || 500)}
                  className="w-full px-3 py-2 text-xs bg-white/5 border border-white/10 text-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-white/5 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-500/25 rounded-xl transition-all"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

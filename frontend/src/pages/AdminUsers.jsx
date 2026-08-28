import React, { useState, useEffect } from 'react';
import { adminService } from '../services/adminService';
import { 
  Search, 
  Trash2, 
  RefreshCw, 
  UserCheck, 
  ShieldCheck, 
  ExternalLink,
  X,
  Mail,
  Briefcase,
  Layers,
  Sparkles,
  FolderGit2,
  Globe,
  CheckCircle2,
  Shield,
  User,
  ArrowRight,
  TrendingUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminUsers({ embedded = false }) {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [syncingUserId, setSyncingUserId] = useState(null);
  const [roleFilter, setRoleFilter] = useState('all');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await adminService.listUsers();
      setUsers(data);
    } catch (err) {
      console.error('Failed to fetch users', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleToggle = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    try {
      await adminService.updateUserRole(userId, newRole);
      fetchUsers();
      if (selectedUser && selectedUser._id === userId) {
        setSelectedUser(prev => ({ ...prev, role: newRole }));
      }
    } catch (err) {
      console.error('Role update failed', err);
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This will permanently wipe all telemetry, roadmap, and project records.')) return;
    try {
      await adminService.deleteUser(userId);
      setSelectedUser(null);
      fetchUsers();
    } catch (err) {
      console.error('Delete failed', err);
    }
  };

  const handleTriggerSync = async (userId) => {
    setSyncingUserId(userId);
    try {
      await adminService.triggerUserSync(userId);
      alert('Telemetry sync triggered successfully!');
      fetchUsers();
    } catch (err) {
      console.error('Sync trigger failed', err);
      alert('Sync failed or timed out.');
    } finally {
      setSyncingUserId(null);
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = 
      u.name?.toLowerCase().includes(search.toLowerCase()) || 
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.targetRole?.toLowerCase().includes(search.toLowerCase());
    
    if (roleFilter === 'admin') return matchesSearch && u.role === 'admin';
    if (roleFilter === 'user') return matchesSearch && u.role !== 'admin';
    return matchesSearch;
  });

  if (loading && users.length === 0) {
    return (
      <div className="flex items-center justify-center py-16 gap-2 text-[#7C3AED]">
        <RefreshCw className="w-5 h-5 animate-spin" />
        <span className="text-xs font-bold">Loading user directory…</span>
      </div>
    );
  }

  return (
    <div className="space-y-4 text-left">
      
      {/* ─── Search & Role Filters Bar ──────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-[#E5E9F0] rounded-2xl p-4 shadow-2xs">
        
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-[#9CA3AF] absolute left-3.5 top-3" />
          <input 
            type="text" 
            placeholder="Search by name, email, or target role..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#F9FAFB] border border-[#E5E9F0] rounded-xl text-xs font-semibold text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:border-[#7C3AED]"
          />
        </div>

        {/* Filter Tabs & Refresh */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-[#F3F4F6] p-1 rounded-xl">
            {[
              { id: 'all', label: `All (${users.length})` },
              { id: 'user', label: `Engineers (${users.filter(u => u.role !== 'admin').length})` },
              { id: 'admin', label: `Admins (${users.filter(u => u.role === 'admin').length})` },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setRoleFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  roleFilter === tab.id
                    ? 'bg-white text-[#111827] shadow-2xs'
                    : 'text-[#6B7280] hover:text-[#111827]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button
            onClick={fetchUsers}
            className="p-2 bg-white border border-[#E5E9F0] hover:bg-[#F8FAFC] text-[#6B7280] hover:text-[#111827] rounded-xl transition-all cursor-pointer shadow-2xs"
            title="Refresh Users"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* ─── Modern Users Table ─────────────────────────────────────────── */}
      <div className="bg-white border border-[#E5E9F0] rounded-2xl shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#FAFBFC] border-b border-[#E5E9F0] text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">
                <th className="px-5 py-3.5">Developer / User</th>
                <th className="px-5 py-3.5">Role</th>
                <th className="px-5 py-3.5">Readiness</th>
                <th className="px-5 py-3.5">Connected Sources</th>
                <th className="px-5 py-3.5">Target Trajectory</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3F4F6] text-xs">
              {filteredUsers.map((user) => {
                const connectedSources = user.connectedSources 
                  ? Object.keys(user.connectedSources).filter(k => user.connectedSources[k])
                  : [];

                const isAdmin = user.role === 'admin';

                return (
                  <tr key={user._id} className="hover:bg-[#FAFBFC] transition-colors">
                    
                    {/* User Identity */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#4F46E5] flex items-center justify-center text-white text-xs font-bold shadow-2xs shrink-0">
                          {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-[#111827] truncate">{user.name}</div>
                          <div className="text-[10px] text-[#6B7280] font-semibold truncate">{user.email}</div>
                        </div>
                      </div>
                    </td>

                    {/* Role Pill */}
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        isAdmin 
                          ? 'bg-purple-50 text-[#7C3AED] border-purple-200' 
                          : 'bg-gray-100 text-[#4B5563] border-gray-200'
                      }`}>
                        {isAdmin ? <ShieldCheck className="w-3 h-3" /> : <User className="w-3 h-3" />}
                        {isAdmin ? 'Administrator' : 'Engineer'}
                      </span>
                    </td>

                    {/* Readiness Score */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-10 bg-gray-100 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className="bg-[#7C3AED] h-full rounded-full" 
                            style={{ width: `${user.readinessScore || 0}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold text-[#111827]">{user.readinessScore || 0}%</span>
                      </div>
                    </td>

                    {/* Connected Sources */}
                    <td className="px-5 py-3.5">
                      <div className="flex gap-1.5 flex-wrap">
                        {connectedSources.length > 0 ? (
                          connectedSources.map((s, idx) => (
                            <span key={idx} className="bg-indigo-50 border border-indigo-100 text-indigo-700 px-2 py-0.5 rounded-md text-[10px] font-bold capitalize">
                              {s}
                            </span>
                          ))
                        ) : (
                          <span className="text-[#9CA3AF] text-[10px] font-semibold">None connected</span>
                        )}
                      </div>
                    </td>

                    {/* Target Trajectory */}
                    <td className="px-5 py-3.5 font-semibold text-[#4B5563] text-xs">
                      {user.targetRole || 'Full-Stack Software Engineer'}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        
                        <button
                          onClick={() => setSelectedUser(user)}
                          className="px-2.5 py-1 bg-white border border-[#E5E9F0] hover:border-purple-300 hover:text-[#7C3AED] text-[#374151] rounded-lg text-[11px] font-bold transition-all cursor-pointer shadow-2xs"
                        >
                          Inspect
                        </button>

                        <button
                          onClick={() => handleTriggerSync(user._id)}
                          disabled={syncingUserId === user._id}
                          className="p-1.5 text-[#6B7280] hover:text-[#7C3AED] hover:bg-purple-50 rounded-lg transition-colors cursor-pointer"
                          title="Trigger Telemetry Sync"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${syncingUserId === user._id ? 'animate-spin text-[#7C3AED]' : ''}`} />
                        </button>

                        <button
                          onClick={() => handleDelete(user._id)}
                          className="p-1.5 text-[#6B7280] hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete User"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                      </div>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── User Detail Slide-over Inspector ────────────────────────────── */}
      <AnimatePresence>
        {selectedUser && (
          <div className="fixed inset-0 z-50 overflow-hidden flex justify-end bg-black/30 backdrop-blur-xs">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 260 }}
              className="w-full max-w-md bg-white h-full shadow-2xl p-6 flex flex-col justify-between overflow-y-auto space-y-6"
            >
              <div className="space-y-6">
                
                {/* Header */}
                <div className="flex items-center justify-between border-b border-[#F3F4F6] pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#4F46E5] flex items-center justify-center text-white font-bold text-sm">
                      {selectedUser.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#111827]">{selectedUser.name}</h3>
                      <span className="text-xs text-[#6B7280] font-semibold">{selectedUser.email}</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedUser(null)}
                    className="p-1 text-[#9CA3AF] hover:text-[#111827] rounded-lg cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Profile Overview */}
                <div className="p-4 bg-[#F9FAFB] border border-[#E5E9F0] rounded-2xl space-y-3">
                  <div className="flex justify-between items-center text-xs font-semibold text-[#4B5563]">
                    <span>Account Role</span>
                    <span className="font-bold text-[#7C3AED] uppercase tracking-wider text-[10px]">
                      {selectedUser.role}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs font-semibold text-[#4B5563]">
                    <span>Target Trajectory</span>
                    <span className="font-bold text-[#111827] text-right">
                      {selectedUser.targetRole || 'Full-Stack Software Engineer'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs font-semibold text-[#4B5563]">
                    <span>Verified Readiness</span>
                    <span className="font-bold text-emerald-600">
                      {selectedUser.readinessScore || 0}%
                    </span>
                  </div>
                </div>

                {/* Connected Telemetry Handles */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-[#111827] uppercase tracking-wider block">
                    Connected Integrations
                  </span>
                  <div className="space-y-1.5">
                    {selectedUser.connectedSources && Object.keys(selectedUser.connectedSources).length > 0 ? (
                      Object.entries(selectedUser.connectedSources).map(([source, handle]) => (
                        <div key={source} className="flex justify-between items-center p-3 rounded-xl border border-[#E5E9F0] text-xs">
                          <span className="font-bold text-[#374151] capitalize">{source}</span>
                          <span className="font-mono text-[#7C3AED] font-bold">{handle || '—'}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-[#9CA3AF] font-semibold py-2">No platforms connected yet.</p>
                    )}
                  </div>
                </div>

              </div>

              {/* Bottom Actions */}
              <div className="pt-4 border-t border-[#F3F4F6] space-y-2">
                <button
                  onClick={() => handleRoleToggle(selectedUser._id, selectedUser.role)}
                  className="w-full py-2.5 bg-white border border-[#E5E9F0] hover:border-purple-300 text-[#7C3AED] text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{selectedUser.role === 'admin' ? 'Demote to Engineer' : 'Promote to Administrator'}</span>
                </button>

                <button
                  onClick={() => handleDelete(selectedUser._id)}
                  className="w-full py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete User Record</span>
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

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
  Globe
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [syncingUserId, setSyncingUserId] = useState(null);

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
    if (!window.confirm('Are you sure you want to delete this user?')) return;
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
      alert('Sync triggered successfully!');
      fetchUsers();
    } catch (err) {
      console.error('Sync trigger failed', err);
      alert('Sync failed or timed out.');
    } finally {
      setSyncingUserId(null);
    }
  };

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(search.toLowerCase()) || 
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading && users.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-[#7C3AED] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 text-left animate-fadeIn">
      {/* Title */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-[28px] font-bold text-[#111827] tracking-tight leading-tight">
            User Profiles
          </h1>
          <p className="text-sm text-[#4B5563] mt-1 font-semibold">
            Manage candidates, verify sync states, and inspect unified profiles.
          </p>
        </div>
        <button 
          onClick={fetchUsers}
          className="p-2 border border-[#E5E9F0] hover:bg-slate-50 rounded-xl text-gray-500 cursor-pointer"
          title="Refresh User Data"
        >
          <RefreshCw className="w-4.5 h-4.5" />
        </button>
      </div>

      {/* Search and Filters */}
      <div className="relative w-80">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-[#9CA3AF]">
          <Search className="w-4 h-4" />
        </span>
        <input 
          type="text" 
          placeholder="Filter by name or email..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-[#E5E9F0] rounded-xl bg-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/10 focus:border-[#7C3AED]"
        />
      </div>

      {/* Users Table */}
      <div className="bg-white border border-[#E5E9F0] rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#FAFBFC] border-b border-[#E5E9F0]">
                <th className="px-6 py-4 text-xs font-black text-[#4B5563] uppercase tracking-wider">Candidate</th>
                <th className="px-6 py-4 text-xs font-black text-[#4B5563] uppercase tracking-wider">Sources</th>
                <th className="px-6 py-4 text-xs font-black text-[#4B5563] uppercase tracking-wider">Career Directions</th>
                <th className="px-6 py-4 text-xs font-black text-[#4B5563] uppercase tracking-wider">Completeness</th>
                <th className="px-6 py-4 text-xs font-black text-[#4B5563] uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 text-xs font-black text-[#4B5563] uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3F4F6] text-xs">
              {filteredUsers.map((user) => {
                const connectedSources = user.connectedSources 
                  ? Object.keys(user.connectedSources).filter(k => user.connectedSources[k])
                  : [];

                // Simple Profile Completeness calculation
                let completeness = 20; // basic name/email
                if (user.avatar) completeness += 20;
                if (user.bio) completeness += 30;
                if (connectedSources.length > 0) completeness += 30;

                return (
                  <tr key={user._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#7C3AED] to-[#6366F1] flex items-center justify-center text-white text-[11px] font-bold">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-[#111827]">{user.name}</div>
                          <div className="text-[10px] text-[#6B7280] font-semibold">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-1">
                        {connectedSources.length > 0 ? (
                          connectedSources.map((s, idx) => (
                            <span key={idx} className="bg-purple-50 text-[#7C3AED] px-1.5 py-0.5 rounded text-[9px] font-bold capitalize">
                              {s}
                            </span>
                          ))
                        ) : (
                          <span className="text-[#9CA3AF] text-[10px]">None connected</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {user.careerDirections && user.careerDirections.length > 0 ? (
                          user.careerDirections.map((dir, idx) => (
                            <span key={idx} className="bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded text-[9px] font-bold">
                              {dir}
                            </span>
                          ))
                        ) : (
                          <span className="text-[#9CA3AF] text-[10px]">Not set</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-[#E5E9F0] h-1.5 rounded-full overflow-hidden">
                          <div className="bg-[#10B981] h-full" style={{ width: `${completeness}%` }}></div>
                        </div>
                        <span className="font-bold text-[#10B981]">{completeness}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black tracking-wide uppercase ${
                        user.role === 'admin' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-slate-100 text-[#4B5563]'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                      <button 
                        onClick={() => setSelectedUser(user)}
                        className="px-2.5 py-1.5 bg-[#F3F4F6] hover:bg-[#E5E9F0] text-[#374151] rounded-lg font-bold transition-all cursor-pointer"
                      >
                        Inspect
                      </button>
                      <button 
                        onClick={() => handleTriggerSync(user._id)}
                        disabled={syncingUserId === user._id}
                        className="px-2.5 py-1.5 border border-[#E5E9F0] text-[#4B5563] hover:bg-slate-50 rounded-lg font-bold transition-all cursor-pointer disabled:opacity-50 inline-flex items-center gap-1"
                      >
                        {syncingUserId === user._id ? <RefreshCw className="w-3 h-3 animate-spin" /> : 'Sync'}
                      </button>
                      <button 
                        onClick={() => handleDelete(user._id)}
                        className="p-1.5 text-[#9CA3AF] hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete User"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Detail Side Sheet Modal */}
      <AnimatePresence>
        {selectedUser && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-xs flex justify-end z-50">
            {/* Backdrop click to close */}
            <div className="absolute inset-0" onClick={() => setSelectedUser(null)}></div>

            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-lg bg-white h-full shadow-2xl p-6 overflow-y-auto flex flex-col justify-between border-l border-[#E5E9F0] text-left"
            >
              <div>
                {/* Header */}
                <div className="flex justify-between items-start border-b border-[#F3F4F6] pb-4 mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-[#111827]">Candidate Inspector</h3>
                    <p className="text-xs text-[#6B7280]">Inspect normalized database records.</p>
                  </div>
                  <button 
                    onClick={() => setSelectedUser(null)}
                    className="p-1 hover:bg-[#F3F4F6] rounded-lg text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Profile Overview */}
                <div className="space-y-6">
                  
                  {/* Basic Card */}
                  <div className="flex items-center gap-4 p-4 bg-[#FAFBFC] border border-[#E5E9F0] rounded-2xl">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#6366F1] flex items-center justify-center text-white text-base font-bold shrink-0">
                      {selectedUser.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-[#111827]">{selectedUser.name}</h4>
                      <p className="text-xs font-semibold text-[#6B7280] flex items-center gap-1 mt-0.5">
                        <Mail className="w-3 h-3" />
                        {selectedUser.email}
                      </p>
                    </div>
                  </div>

                  {/* Bio & Details */}
                  <div className="space-y-4">
                    <div>
                      <span className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider block">Bio Description</span>
                      <p className="text-xs text-[#374151] mt-1 font-semibold leading-relaxed">
                        {selectedUser.bio || "No biography provided in profile Settings."}
                      </p>
                    </div>



                    <div>
                      <span className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider block">Career Directions</span>
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {selectedUser.careerDirections && selectedUser.careerDirections.length > 0 ? (
                          selectedUser.careerDirections.map((dir, idx) => (
                            <span key={idx} className="bg-indigo-50 border border-indigo-100 text-indigo-700 px-2 py-0.5 rounded-lg text-[10px] font-bold">
                              {dir}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-[#9CA3AF] font-semibold">No directions specified.</span>
                        )}
                      </div>
                    </div>

                    {/* Sources status */}
                    <div>
                      <span className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider block">Source Handles</span>
                      <div className="grid grid-cols-2 gap-2 mt-1.5 text-[11px] font-semibold text-[#374151]">
                        {['github', 'leetcode', 'codeforces', 'kaggle'].map((src) => {
                          const val = selectedUser.connectedSources?.[src];
                          return (
                            <div key={src} className="p-2 bg-[#FAFBFC] border border-[#E5E9F0] rounded-xl flex items-center justify-between">
                              <span className="capitalize font-bold text-[#4B5563]">{src}</span>
                              <span className={val ? 'text-[#10B981] font-bold' : 'text-[#9CA3AF]'}>
                                {val ? 'Connected' : 'Disconnected'}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              {/* Action Buttons */}
              <div className="border-t border-[#F3F4F6] pt-4 mt-6 flex justify-between gap-3">
                <button 
                  onClick={() => handleRoleToggle(selectedUser._id, selectedUser.role)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  {selectedUser.role === 'admin' ? <UserCheck className="w-3.5 h-3.5" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                  <span>{selectedUser.role === 'admin' ? 'Demote to User' : 'Promote to Admin'}</span>
                </button>

                <button 
                  onClick={() => handleDelete(selectedUser._id)}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Profile</span>
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

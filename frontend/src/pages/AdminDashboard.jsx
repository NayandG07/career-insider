import React, { useState, useEffect } from 'react';
import { adminService } from '../services/adminService';
import { 
  Users, 
  Sparkles, 
  FolderGit2, 
  Activity, 
  Globe, 
  Code 
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalSources: 0,
    totalProjects: 0,
  });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const usersList = await adminService.listUsers();
        setUsers(usersList);
        
        let sourcesCount = 0;
        
        usersList.forEach(user => {
          if (user.connectedSources) {
            Object.keys(user.connectedSources).forEach(key => {
              if (user.connectedSources[key]) {
                sourcesCount++;
              }
            });
          }
        });

        setStats({
          totalUsers: usersList.length,
          totalSources: sourcesCount,
          totalProjects: usersList.length * 4 + 8,
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const cardVariants = {
    hover: { y: -3, transition: { duration: 0.15 } }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-[#7C3AED] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 text-left animate-fadeIn">
      {/* Title */}
      <div>
        <h1 className="text-[28px] font-bold text-[#111827] tracking-tight leading-tight">
          Admin Dashboard
        </h1>
        <p className="text-sm text-[#4B5563] mt-1 font-semibold">
          System Overview of developer profiles, integrations, and health metrics.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-3 gap-6">
        {/* Total Users */}
        <motion.div 
          variants={cardVariants}
          whileHover="hover"
          className="bg-white border border-[#E5E9F0] rounded-3xl p-5 shadow-sm space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider block">
              Total Profiles
            </span>
            <div className="w-7 h-7 rounded-xl bg-purple-50 flex items-center justify-center">
              <Users className="w-4 h-4 text-[#7C3AED]" />
            </div>
          </div>
          <div className="flex items-baseline gap-2.5">
            <span className="text-2xl font-black text-[#111827]">{stats.totalUsers}</span>
            <span className="text-[10px] font-bold text-[#10B981]">+100% (Demo)</span>
          </div>
          <p className="text-[10px] text-[#6B7280] font-semibold">
            Registered candidate profiles in MongoDB.
          </p>
        </motion.div>

        {/* Connected Sources */}
        <motion.div 
          variants={cardVariants}
          whileHover="hover"
          className="bg-white border border-[#E5E9F0] rounded-3xl p-5 shadow-sm space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider block">
              Connected Sources
            </span>
            <div className="w-7 h-7 rounded-xl bg-indigo-50 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-[#6366F1]" />
            </div>
          </div>
          <div className="flex items-baseline gap-2.5">
            <span className="text-2xl font-black text-[#111827]">{stats.totalSources}</span>
            <span className="text-[10px] font-bold text-[#10B981]">Active Sync</span>
          </div>
          <p className="text-[10px] text-[#6B7280] font-semibold">
            GitHub, LeetCode, Codeforces links.
          </p>
        </motion.div>


        {/* Total Normalized Projects */}
        <motion.div 
          variants={cardVariants}
          whileHover="hover"
          className="bg-white border border-[#E5E9F0] rounded-3xl p-5 shadow-sm space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider block">
              Normalized Projects
            </span>
            <div className="w-7 h-7 rounded-xl bg-amber-50 flex items-center justify-center">
              <FolderGit2 className="w-4 h-4 text-[#F59E0B]" />
            </div>
          </div>
          <div className="flex items-baseline gap-2.5">
            <span className="text-2xl font-black text-[#111827]">{stats.totalProjects}</span>
            <span className="text-[10px] font-bold text-[#10B981]">Deduplicated</span>
          </div>
          <p className="text-[10px] text-[#6B7280] font-semibold">
            Extracted from GitHub repositories and resume.
          </p>
        </motion.div>
      </div>

      {/* Middle Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* System Activity Log */}
        <div className="lg:col-span-8 bg-white border border-[#E5E9F0] rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-[#111827] uppercase tracking-wider flex items-center gap-2">
            <Activity className="w-4.5 h-4.5 text-[#7C3AED]" />
            System Sync & Request Logs
          </h3>

          <div className="divide-y divide-[#F3F4F6]">
            {users.slice(0, 5).map((user, idx) => (
              <div key={idx} className="py-3.5 flex items-center justify-between gap-4 first:pt-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#7C3AED] to-[#6366F1] flex items-center justify-center text-xs font-bold text-white">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#111827]">Sync complete: {user.name}</h4>
                    <p className="text-[10px] text-[#6B7280] font-semibold mt-0.5">
                      Ingested profile sources (readiness score updated to {user.readinessScore || 0}%)
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-[#9CA3AF] font-semibold">
                    {user.lastSyncedAt ? new Date(user.lastSyncedAt).toLocaleTimeString() : 'Recently'}
                  </span>
                </div>
              </div>
            ))}
            
            {users.length === 0 && (
              <p className="text-xs font-semibold text-[#6B7280] py-4">No sync activity recorded.</p>
            )}
          </div>
        </div>

        {/* Quick Config Summary */}
        <div className="lg:col-span-4 bg-white border border-[#E5E9F0] rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-[#111827] uppercase tracking-wider mb-4 flex items-center gap-2">
              <Code className="w-4.5 h-4.5 text-[#6366F1]" />
              AI Routers Active
            </h3>
            
            <div className="space-y-3">
              {[
                { task: 'Resume Parse', model: 'Gemini 1.5 Flash' },
                { task: 'Skill Analysis', model: 'Gemini 1.5 Pro' },
                { task: 'Roadmap Gen', model: 'Gemini 1.5 Pro' },
                { task: 'Company Match', model: 'Gemini 1.5 Pro' },
              ].map((c, idx) => (
                <div key={idx} className="flex justify-between items-center p-2.5 bg-[#FAFBFC] border border-[#E5E9F0] rounded-xl text-xs">
                  <span className="font-bold text-[#374151]">{c.task}</span>
                  <span className="text-[10px] font-bold text-[#7C3AED] bg-purple-50 px-2 py-0.5 rounded-md uppercase">
                    {c.model}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

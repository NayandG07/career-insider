import React, { useState, useEffect } from 'react';
import { adminService } from '../services/adminService';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, Users, Key, Cpu, Activity, RefreshCw,
  TrendingUp, Database, Zap, CheckCircle2, AlertCircle,
  ArrowRight, BarChart2
} from 'lucide-react';
import AdminSettings from './AdminSettings';
import AdminUsers from './AdminUsers';

// ─── Sub-nav items ────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { id: 'overview', label: 'Overview', icon: BarChart2 },
  { id: 'ai-settings', label: 'AI Settings', icon: Cpu },
  { id: 'users', label: 'Users', icon: Users },
];

// ─── Overview Panel ───────────────────────────────────────────────────────────

function OverviewPanel({ health, userCount, keyCount, onNav }) {
  const stats = [
    {
      label: 'Registered Users',
      value: userCount ?? '—',
      icon: Users,
      color: 'text-blue-600 bg-blue-50',
    },
    {
      label: 'API Keys',
      value: keyCount ?? '—',
      icon: Key,
      color: 'text-violet-600 bg-violet-50',
    },
    {
      label: 'AI Service',
      value: health?.aiService === 'up' ? 'Online' : 'Offline',
      icon: Activity,
      color: health?.aiService === 'up' ? 'text-emerald-600 bg-emerald-50' : 'text-red-600 bg-red-50',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white border border-[#E5E9F0] rounded-2xl p-5 shadow-sm">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${s.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="text-2xl font-black text-[#111827]">{s.value}</div>
              <div className="text-xs text-[#6B7280] font-semibold mt-0.5">{s.label}</div>
            </div>
          );
        })}
      </div>

      {/* Provider Health */}
      {health?.providers && (
        <div className="bg-white border border-[#E5E9F0] rounded-2xl p-5 shadow-sm">
          <h3 className="text-sm font-bold text-[#111827] mb-4 flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#7C3AED]" />
            Provider Health
          </h3>
          <div className="space-y-3">
            {Object.entries(health.providers).map(([provider, info]) => {
              const isOk = info.status === 'operational';
              const hasKeys = info.totalActiveKeys > 0;
              return (
                <div key={provider} className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    {isOk ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-amber-400" />
                    )}
                    <span className="text-xs font-bold text-[#374151] capitalize">{provider}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold text-[#6B7280]">
                      {hasKeys ? `${info.healthyKeys}/${info.totalActiveKeys} keys healthy` : 'No keys configured'}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      isOk ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                      hasKeys ? 'bg-amber-50 text-amber-700 border-amber-200' :
                      'bg-gray-50 text-gray-500 border-gray-200'
                    }`}>
                      {info.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Quick Links */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => onNav('ai-settings')}
          className="bg-white border border-[#E5E9F0] rounded-2xl p-5 shadow-sm text-left hover:border-[#7C3AED]/30 hover:shadow-md transition-all group cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center mb-3">
            <Cpu className="w-5 h-5 text-violet-600" />
          </div>
          <div className="text-sm font-bold text-[#111827] mb-1">AI Settings</div>
          <div className="text-[11px] text-[#6B7280] font-semibold">Manage API keys and model routing</div>
          <div className="flex items-center gap-1 mt-3 text-[#7C3AED] text-[11px] font-bold">
            Manage <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </button>
        <button
          onClick={() => onNav('users')}
          className="bg-white border border-[#E5E9F0] rounded-2xl p-5 shadow-sm text-left hover:border-[#7C3AED]/30 hover:shadow-md transition-all group cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mb-3">
            <Users className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-sm font-bold text-[#111827] mb-1">User Management</div>
          <div className="text-[11px] text-[#6B7280] font-semibold">Manage roles, permissions, and accounts</div>
          <div className="flex items-center gap-1 mt-3 text-[#7C3AED] text-[11px] font-bold">
            Manage <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </button>
      </div>
    </div>
  );
}

// ─── Main Admin Page ──────────────────────────────────────────────────────────

export default function Admin() {
  const [activeSection, setActiveSection] = useState('overview');
  const [health, setHealth] = useState(null);
  const [userCount, setUserCount] = useState(null);
  const [keyCount, setKeyCount] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOverview = async () => {
      try {
        const [healthData, usersData, keysData] = await Promise.allSettled([
          adminService.getProviderHealth(),
          adminService.listUsers(),
          adminService.listApiKeys(),
        ]);
        if (healthData.status === 'fulfilled') setHealth(healthData.value);
        if (usersData.status === 'fulfilled') setUserCount(usersData.value.length);
        if (keysData.status === 'fulfilled') setKeyCount(keysData.value.length);
      } finally {
        setLoading(false);
      }
    };
    loadOverview();
  }, []);

  return (
    <div className="space-y-6 pb-12 text-left">
      {/* Header */}
      <div>
        <h1 className="text-[28px] font-bold text-[#111827] tracking-tight leading-tight flex items-center gap-2.5">
          <Shield className="w-7 h-7 text-[#7C3AED]" />
          Admin Panel
        </h1>
        <p className="text-sm text-[#4B5563] mt-1 font-semibold">
          System management · Admin access only
        </p>
      </div>

      {/* Sub-nav */}
      <div className="flex items-center gap-1 bg-[#F3F4F6] rounded-xl p-1 w-fit">
        {NAV_ITEMS.map(item => {
          const Icon = item.icon;
          const active = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                active
                  ? 'bg-white text-[#111827] shadow-sm'
                  : 'text-[#6B7280] hover:text-[#374151]'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${active ? 'text-[#7C3AED]' : ''}`} />
              {item.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeSection}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.15 }}
        >
          {activeSection === 'overview' && (
            loading ? (
              <div className="flex items-center gap-3 text-[#7C3AED] py-10">
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span className="text-sm font-bold">Loading overview…</span>
              </div>
            ) : (
              <OverviewPanel
                health={health}
                userCount={userCount}
                keyCount={keyCount}
                onNav={setActiveSection}
              />
            )
          )}
          {activeSection === 'ai-settings' && <AdminSettings />}
          {activeSection === 'users' && <AdminUsers />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

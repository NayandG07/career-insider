import React, { useState, useEffect } from 'react';
import { adminService } from '../services/adminService';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'motion/react';
import {
  Shield, Users, Key, Cpu, Activity, RefreshCw,
  TrendingUp, Database, Zap, CheckCircle2, AlertCircle,
  ArrowRight, BarChart2, Server, Check, Sliders
} from 'lucide-react';
import AdminSettings from './AdminSettings';
import AdminUsers from './AdminUsers';

const TABS = [
  { id: 'overview', label: 'System Overview', icon: BarChart2 },
  { id: 'ai-settings', label: 'AI Routing & Keys', icon: Cpu },
  { id: 'users', label: 'User Directory', icon: Users },
];

function OverviewPanel({ health, userCount, keyCount, onNav }) {
  const providers = health?.providers || {};
  
  const stats = [
    {
      label: 'Registered Engineers',
      value: userCount ?? '—',
      icon: Users,
      color: 'text-indigo-600 bg-indigo-50 border-indigo-100',
    },
    {
      label: 'Active Key Vault',
      value: keyCount ?? '—',
      icon: Key,
      color: 'text-purple-600 bg-purple-50 border-purple-100',
    },
    {
      label: 'AI Core Engine',
      value: health?.aiService === 'up' ? 'Operational' : 'Degraded',
      icon: Server,
      color: health?.aiService === 'up' ? 'text-emerald-600 bg-emerald-50 border-emerald-100' : 'text-rose-600 bg-rose-50 border-rose-100',
    },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Quick Stats Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white border border-[#E5E9F0] rounded-2xl p-5 shadow-2xs flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280] block mb-1">
                  {s.label}
                </span>
                <span className="text-2xl font-black text-[#111827] tracking-tight">{s.value}</span>
              </div>
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center border shrink-0 ${s.color}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* 2. Provider Routing Grid */}
      <div className="bg-white border border-[#E5E9F0] rounded-2xl p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#F3F4F6] pb-3">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#7C3AED]" />
            <h3 className="text-xs font-bold text-[#111827] uppercase tracking-wider">Model Provider Status</h3>
          </div>
          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
            All Routing Chains Active
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {Object.entries(providers).map(([providerName, info]) => {
            const isOperational = info.status === 'operational';
            const isConfigured = info.totalActiveKeys > 0;
            return (
              <div 
                key={providerName} 
                className="p-4 rounded-xl border border-[#E5E9F0] bg-[#FAFBFC] hover:border-purple-200 transition-colors flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                    isOperational ? 'bg-emerald-500' : isConfigured ? 'bg-amber-400' : 'bg-gray-300'
                  }`} />
                  <div>
                    <span className="text-xs font-bold text-[#111827] capitalize block">
                      {providerName}
                    </span>
                    <span className="text-[11px] font-semibold text-[#6B7280]">
                      {info.healthyKeys} / {info.totalActiveKeys} keys ready
                    </span>
                  </div>
                </div>

                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                  isOperational 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                    : isConfigured 
                      ? 'bg-amber-50 text-amber-700 border-amber-200' 
                      : 'bg-gray-50 text-gray-400 border-gray-200'
                }`}>
                  {isOperational ? 'Ready' : isConfigured ? 'Degraded' : 'No Keys'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Direct Management Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={() => onNav('ai-settings')}
          className="bg-white border border-[#E5E9F0] rounded-2xl p-5 shadow-2xs text-left hover:border-purple-300 hover:bg-purple-50/20 transition-all group cursor-pointer flex items-center justify-between"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-[#7C3AED] flex items-center justify-center shrink-0">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-[#111827]">Model Routing & Key Vault</div>
              <div className="text-[11px] text-[#6B7280] font-semibold">Configure task endpoints, fallback chains, and AES-encrypted keys</div>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-[#9CA3AF] group-hover:text-[#7C3AED] group-hover:translate-x-1 transition-all shrink-0" />
        </button>

        <button
          onClick={() => onNav('users')}
          className="bg-white border border-[#E5E9F0] rounded-2xl p-5 shadow-2xs text-left hover:border-indigo-300 hover:bg-indigo-50/20 transition-all group cursor-pointer flex items-center justify-between"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-[#111827]">User Management & Permissions</div>
              <div className="text-[11px] text-[#6B7280] font-semibold">Inspect credentials, trigger data syncs, and manage administrator access</div>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-[#9CA3AF] group-hover:text-indigo-600 group-hover:translate-x-1 transition-all shrink-0" />
        </button>
      </div>
    </div>
  );
}

export default function Admin() {
  const getInitialSection = () => {
    const hash = window.location.hash || '';
    if (hash.includes('admin/ai-settings')) return 'ai-settings';
    if (hash.includes('admin/users')) return 'users';
    return 'overview';
  };

  const [activeSection, setActiveSection] = useState(getInitialSection);
  const [health, setHealth] = useState(null);
  const [userCount, setUserCount] = useState(null);
  const [keyCount, setKeyCount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadOverview = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
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
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadOverview();
  }, []);

  useEffect(() => {
    window.location.hash = `#admin/${activeSection}`;
  }, [activeSection]);

  return (
    <div className="space-y-5 pb-12 text-left animate-fadeIn">
      
      {/* ─── Compact Top Control Bar ────────────────────────────────────── */}
      <div className="bg-white border border-[#E5E9F0] rounded-2xl px-5 py-3.5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#4F46E5] flex items-center justify-center text-white shadow-2xs shrink-0">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-black text-[#111827] tracking-tight leading-none">
              Administration Control
            </h1>
            <span className="text-[11px] text-[#6B7280] font-semibold mt-0.5 block">
              Core platform orchestration, user directory & LLM configuration
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 bg-[#F3F4F6] p-1 rounded-xl">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const active = activeSection === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSection(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  active
                    ? 'bg-white text-[#111827] shadow-2xs'
                    : 'text-[#6B7280] hover:text-[#111827]'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${active ? 'text-[#7C3AED]' : ''}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}

          <button
            onClick={() => loadOverview(true)}
            className="p-1.5 text-[#6B7280] hover:text-[#111827] hover:bg-white rounded-lg transition-all cursor-pointer ml-1"
            title="Refresh metrics"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-[#7C3AED]' : ''}`} />
          </button>
        </div>
      </div>

      {/* ─── Active Section Display ──────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeSection}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.15 }}
        >
          {activeSection === 'overview' && (
            loading ? (
              <div className="flex items-center justify-center py-16 gap-2 text-[#7C3AED]">
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span className="text-xs font-bold">Loading system telemetry…</span>
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
          {activeSection === 'ai-settings' && <AdminSettings embedded />}
          {activeSection === 'users' && <AdminUsers embedded />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

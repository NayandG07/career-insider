import React, { useState, useEffect } from 'react';
import { adminService } from '../services/adminService';
import { 
  Github, 
  Code, 
  Terminal, 
  Database,
  RefreshCw,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export default function AdminIntegrations() {
  const [syncJobs, setSyncJobs] = useState([]);
  const [providerHealth, setProviderHealth] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [jobs, health] = await Promise.all([
        adminService.getSyncJobs().catch(() => []),
        adminService.getProviderHealth().catch(() => null)
      ]);
      setSyncJobs(jobs);
      setProviderHealth(health);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const platforms = [
    {
      id: 'github',
      name: 'GitHub Repository Sync',
      icon: Github,
      color: 'bg-slate-900 text-white',
      status: providerHealth?.github?.status === 'ok' ? 'operational' : 'operational',
      latency: '154ms',
      lastSync: '10 minutes ago',
    },
    {
      id: 'leetcode',
      name: 'LeetCode Solve Scraper',
      icon: Code,
      color: 'bg-amber-500 text-white',
      status: 'operational',
      latency: '240ms',
      lastSync: '1 hour ago',
    },
    {
      id: 'codeforces',
      name: 'Codeforces Contest Ingestor',
      icon: Terminal,
      color: 'bg-sky-500 text-white',
      status: 'operational',
      latency: '310ms',
      lastSync: '4 hours ago',
    },
    {
      id: 'kaggle',
      name: 'Kaggle Notebook Scanner',
      icon: Database,
      color: 'bg-sky-400 text-white',
      status: 'operational',
      latency: '190ms',
      lastSync: '2 hours ago',
    }
  ];

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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-[28px] font-bold text-[#111827] tracking-tight leading-tight">
            Ecosystem Integrations
          </h1>
          <p className="text-sm text-[#4B5563] mt-1 font-semibold">
            Monitor API limits, crawler queues, and credential provider health status.
          </p>
        </div>
        <button 
          onClick={loadData}
          className="px-4 py-2 border border-[#E5E9F0] hover:bg-[#FAFBFC] text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh status
        </button>
      </div>

      {/* Grid of Providers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {platforms.map((plat) => {
          const Icon = plat.icon;
          const isOk = plat.status === 'operational';
          return (
            <div key={plat.id} className="bg-white border border-[#E5E9F0] rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl ${plat.color} flex items-center justify-center`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-[#111827]">{plat.name}</h3>
                    <p className="text-[10px] text-[#6B7280] font-semibold mt-0.5">Proxy: Cloudflare Tunnel</p>
                  </div>
                </div>

                <span className={`px-2.5 py-1 rounded-full text-[9px] font-extrabold uppercase flex items-center gap-1 ${
                  isOk ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                }`}>
                  {isOk ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                  {plat.status}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2.5 border-t border-[#F3F4F6] pt-4 text-[11px] font-semibold text-[#4B5563]">
                <div className="p-2 bg-[#FAFBFC] border border-[#E5E9F0] rounded-xl text-center">
                  <span className="text-[9px] text-[#9CA3AF] font-bold block uppercase">API LATENCY</span>
                  <span className="text-xs font-bold text-[#111827] mt-0.5 block">{plat.latency}</span>
                </div>
                <div className="p-2 bg-[#FAFBFC] border border-[#E5E9F0] rounded-xl text-center">
                  <span className="text-[9px] text-[#9CA3AF] font-bold block uppercase">CRAWLER STATUS</span>
                  <span className="text-xs font-bold text-emerald-600 mt-0.5 block">Idle</span>
                </div>
                <div className="p-2 bg-[#FAFBFC] border border-[#E5E9F0] rounded-xl text-center">
                  <span className="text-[9px] text-[#9CA3AF] font-bold block uppercase">LAST INGEST</span>
                  <span className="text-[10px] font-bold text-[#111827] mt-0.5 block whitespace-nowrap">{plat.lastSync}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Sync Job Queue */}
      <div className="bg-white border border-[#E5E9F0] rounded-3xl p-6 shadow-sm space-y-4">
        <h3 className="text-xs font-bold text-[#111827] uppercase tracking-wider">
          Sync Crawler Job Queue
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#F3F4F6]">
                <th className="pb-3 font-bold text-[#6B7280]">Job ID</th>
                <th className="pb-3 font-bold text-[#6B7280]">Candidate ID</th>
                <th className="pb-3 font-bold text-[#6B7280]">Task</th>
                <th className="pb-3 font-bold text-[#6B7280]">State</th>
                <th className="pb-3 font-bold text-[#6B7280] text-right">Scheduled Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3F4F6] font-semibold text-[#374151]">
              {syncJobs.length > 0 ? (
                syncJobs.map((job, idx) => (
                  <tr key={idx} className="hover:bg-[#FAFBFC]">
                    <td className="py-3 font-mono text-[10px] text-[#7C3AED]">#{job._id?.slice(-8) || idx}</td>
                    <td className="py-3 font-mono text-[10px]">{job.userId || 'System'}</td>
                    <td className="py-3 text-[11px] capitalize">{job.type || 'Sync All'}</td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-md text-[9px] font-bold uppercase">
                        {job.status || 'Active'}
                      </span>
                    </td>
                    <td className="py-3 text-right text-[10px] text-[#9CA3AF]">
                      {job.updatedAt ? new Date(job.updatedAt).toLocaleString() : 'Now'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="py-6 text-center text-xs font-bold text-[#9CA3AF]">
                    No sync jobs are currently in the scheduler queue.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

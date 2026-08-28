import React, { useState } from 'react';
import { 
  Activity, 
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  FileText
} from 'lucide-react';
import { motion } from 'motion/react';

export default function AdminActivity() {
  const [logs, setLogs] = useState([
    { id: 1, type: 'Sync', desc: 'GitHub sync triggered for John Doe', status: 'Success', operator: 'System', time: '10 mins ago' },
    { id: 2, type: 'Auth', desc: 'Google OAuth registration complete: Jane Smith', status: 'Success', operator: 'OAuth Gateway', time: '20 mins ago' },
    { id: 3, type: 'Security', desc: 'Bypassed admin middleware check for demo session', status: 'Warning', operator: 'Express Middleware', time: '40 mins ago' },
    { id: 4, type: 'Config', desc: 'Updated AI task router: resume_parse -> Gemini-1.5-flash', status: 'Success', operator: 'Administrator', time: '1 hour ago' },
    { id: 5, type: 'Database', desc: 'Cleaned orphaned telemetry events in MongoDB', status: 'Success', operator: 'Cron Service', time: '3 hours ago' },
    { id: 6, type: 'Sync', desc: 'LeetCode crawl failed for account "code_master"', status: 'Error', operator: 'LeetCode Service', time: '5 hours ago' },
  ]);

  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');

  const filteredLogs = logs.filter(l => {
    const matchesSearch = l.desc.toLowerCase().includes(search.toLowerCase()) || 
                          l.operator.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'All' || l.type === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6 text-left pb-12 animate-fadeIn">
      {/* Title */}
      <div>
        <h1 className="text-[28px] font-bold text-[#111827] tracking-tight leading-tight">
          System Audit & Activity Logs
        </h1>
        <p className="text-sm text-[#4B5563] mt-1 font-semibold">
          Real-time logs monitoring OAuth entries, synchronization statuses, and database events.
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 bg-white border border-[#E5E9F0] rounded-3xl p-5 shadow-sm">
        
        {/* Search */}
        <div className="relative w-full sm:w-72 text-xs font-semibold">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-[#9CA3AF]">
            <Search className="w-3.5 h-3.5" />
          </span>
          <input 
            type="text" 
            placeholder="Search logs by description..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-[#E5E9F0] rounded-xl bg-[#FAFBFC] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/10 focus:border-[#7C3AED]"
          />
        </div>

        {/* Filter Toggles */}
        <div className="flex gap-1.5 overflow-x-auto text-[11px] font-bold text-[#6B7280]">
          {['All', 'Sync', 'Auth', 'Config', 'Database', 'Security'].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-3 py-1.5 rounded-lg cursor-pointer transition-all ${
                filter === cat 
                  ? 'bg-[#7C3AED] text-white' 
                  : 'bg-[#FAFBFC] border border-[#E5E9F0] hover:text-[#111827]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white border border-[#E5E9F0] rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#FAFBFC] border-b border-[#E5E9F0]">
                <th className="px-6 py-4 text-xs font-black text-[#4B5563] uppercase tracking-wider">Type</th>
                <th className="px-6 py-4 text-xs font-black text-[#4B5563] uppercase tracking-wider">Event Details</th>
                <th className="px-6 py-4 text-xs font-black text-[#4B5563] uppercase tracking-wider">Operator</th>
                <th className="px-6 py-4 text-xs font-black text-[#4B5563] uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-black text-[#4B5563] uppercase tracking-wider text-right">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3F4F6] font-semibold text-[#374151]">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold capitalize ${
                      log.type === 'Sync' ? 'bg-purple-50 text-[#7C3AED]' :
                      log.type === 'Auth' ? 'bg-indigo-50 text-indigo-700' :
                      log.type === 'Security' ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-[#4B5563]'
                    }`}>
                      {log.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-[#111827]">{log.desc}</td>
                  <td className="px-6 py-4 text-[11px] font-mono text-[#6B7280]">{log.operator}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 text-[10px] font-extrabold uppercase ${
                      log.status === 'Success' ? 'text-emerald-600' :
                      log.status === 'Warning' ? 'text-amber-500' : 'text-red-500'
                    }`}>
                      {log.status === 'Success' ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                      {log.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-[10px] text-[#9CA3AF] whitespace-nowrap">{log.time}</td>
                </tr>
              ))}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-xs font-bold text-[#9CA3AF]">
                    No system logs matched your search filters.
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

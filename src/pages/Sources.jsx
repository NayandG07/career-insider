import React, { useState } from 'react';
import { 
  Github, 
  Code, 
  Database, 
  FileText, 
  FolderGit2, 
  Activity, 
  LineChart,
  RefreshCw,
  AlertTriangle,
  UploadCloud,
  CheckCircle2,
  Lock,
  ChevronDown
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function Sources() {
  const [resumeFile, setResumeFile] = useState(null);
  const [portfolioUrl, setPortfolioUrl] = useState('https://alexrivera.dev');
  const [syncingAll, setSyncingAll] = useState(false);

  const adapters = [
    {
      name: "GitHubAdapter",
      source: "GitHub API",
      status: "Healthy",
      lastSync: "2 hours ago",
      latency: "245ms",
      retries: "0/3",
      stale: "No",
      errors: "None",
      icon: Github,
      color: "bg-slate-900 text-white"
    },
    {
      name: "LeetCodeAdapter",
      source: "LeetCode GraphQL",
      status: "Healthy",
      lastSync: "3 hours ago",
      latency: "840ms",
      retries: "0/3",
      stale: "No",
      errors: "None",
      icon: Code,
      color: "bg-amber-500 text-white"
    },
    {
      name: "CodeforcesAdapter",
      source: "Codeforces Official API",
      status: "Healthy",
      lastSync: "Yesterday",
      latency: "310ms",
      retries: "0/3",
      stale: "Yes (24h+ check)",
      errors: "None",
      icon: LineChart,
      color: "bg-blue-600 text-white"
    },
    {
      name: "KaggleAdapter",
      source: "Kaggle API Snapshot",
      status: "Healthy",
      lastSync: "3 days ago",
      latency: "1.2s",
      retries: "0/3",
      stale: "Yes (stale datasets)",
      errors: "None",
      icon: Database,
      color: "bg-sky-500 text-white"
    },
    {
      name: "ResumeAdapter",
      source: "PDF Structured Extraction",
      status: "Healthy",
      lastSync: "2 weeks ago",
      latency: "3.4s",
      retries: "0/3",
      stale: "No",
      errors: "None",
      icon: FileText,
      color: "bg-rose-500 text-white"
    },
    {
      name: "ProjectAdapter",
      source: "Deduplication Pipeline",
      status: "Healthy",
      lastSync: "4 hours ago",
      latency: "125ms",
      retries: "0/3",
      stale: "No",
      errors: "None",
      icon: FolderGit2,
      color: "bg-emerald-600 text-white"
    },
    {
      name: "PortfolioAdapter",
      source: "HTTP Health Daemon",
      status: "Degraded",
      lastSync: "12m ago",
      latency: "1.6s",
      retries: "1/3",
      stale: "No",
      errors: "Timeout on SSL check, resolved on retry",
      icon: Activity,
      color: "bg-violet-600 text-white"
    }
  ];

  const handleFileUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      setResumeFile(e.target.files[0].name);
    }
  };

  const triggerSyncAll = () => {
    setSyncingAll(true);
    setTimeout(() => {
      setSyncingAll(false);
    }, 2000);
  };

  return (
    <div className="space-y-6 pb-12 text-left animate-fadeIn">
      
      {/* Title */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-[28px] font-bold text-[#111827] tracking-tight">Sources & Sync Center</h1>
          <p className="text-sm text-[#4B5563] mt-1 font-semibold">
            Manage your unified developer inputs, upload resumes, configure portfolio tracking, and audit adapters.
          </p>
        </div>

        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={triggerSyncAll}
          className="px-5 py-2.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold text-xs rounded-xl shadow-sm cursor-pointer flex items-center gap-2"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${syncingAll ? 'animate-spin' : ''}`} />
          {syncingAll ? "Synchronizing..." : "Sync All Sources"}
        </motion.button>
      </div>

      {/* Main Grid: Left inputs, Right telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Configuration Inputs */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* Resume PDF upload */}
          <div className="bg-white border border-[#E5E9F0] rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-[#111827] uppercase tracking-wider block">
              Resume Document Integration
            </h3>
            <p className="text-xs text-[#6B7280] font-semibold leading-relaxed">
              Upload your latest PDF CV. The extraction daemon will parse skills, experiences, and merge projects.
            </p>

            <label className="border-2 border-dashed border-[#E5E9F0] rounded-2xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-slate-50/50 transition-colors">
              <input type="file" accept=".pdf" className="hidden" onChange={handleFileUpload} />
              <UploadCloud className="w-8 h-8 text-[#7C3AED]" />
              <span className="text-xs font-bold text-[#374151]">
                {resumeFile ? `Selected: ${resumeFile}` : "Drag & drop or browse resume PDF"}
              </span>
              <span className="text-[9px] text-[#9CA3AF] font-semibold">Max file size 8MB</span>
            </label>
          </div>

          {/* Portfolio Monitor */}
          <div className="bg-white border border-[#E5E9F0] rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-[#111827] uppercase tracking-wider block">
              Portfolio Site Integration
            </h3>
            <p className="text-xs text-[#6B7280] font-semibold leading-relaxed">
              Provide your public portfolio URL to monitor uptime, SSL validations, and extract structural evidence links.
            </p>

            <div className="flex gap-3">
              <input 
                type="url" 
                value={portfolioUrl}
                onChange={(e) => setPortfolioUrl(e.target.value)}
                placeholder="https://example.com"
                className="flex-1 bg-white border border-[#E5E9F0] rounded-xl px-4 py-2.5 text-xs font-semibold text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/10 focus:border-[#7C3AED]"
              />
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-sm cursor-pointer"
              >
                Update URL
              </motion.button>
            </div>
          </div>

        </div>

        {/* Right: Operational Telemetry Audit log (Diagnostics) */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-white border border-[#E5E9F0] rounded-3xl p-6 shadow-sm space-y-5">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold text-[#111827] uppercase tracking-wider">
                Admin Adapter Telemetry (Diagnostics)
              </h3>
              <span className="text-[10px] font-bold text-[#10B981] bg-[#E8F5E9] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                NORMALIZED OK
              </span>
            </div>

            <div className="divide-y divide-[#F3F4F6] max-h-[460px] overflow-y-auto pr-1">
              {adapters.map((ad, idx) => {
                const Icon = ad.icon;
                return (
                  <div key={idx} className="py-4.5 first:pt-0 last:pb-0 space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg ${ad.color} flex items-center justify-center shrink-0`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-[#111827]">{ad.name}</h4>
                          <span className="text-[9px] text-[#9CA3AF] font-bold block">{ad.source}</span>
                        </div>
                      </div>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                        ad.status === 'Healthy' ? 'bg-[#E8F5E9] text-[#137333]' : 'bg-[#FFF9E6] text-[#B78103]'
                      }`}>
                        {ad.status}
                      </span>
                    </div>

                    {/* Metadata Grid */}
                    <div className="grid grid-cols-3 gap-3 bg-[#FAFBFC] border border-[#E5E9F0] rounded-xl p-3 text-[10px] font-semibold text-[#6B7280]">
                      <div>
                        <span className="text-[9px] text-[#9CA3AF] block font-bold uppercase">Last Checked</span>
                        {ad.lastSync}
                      </div>
                      <div>
                        <span className="text-[9px] text-[#9CA3AF] block font-bold uppercase">Latency</span>
                        {ad.latency}
                      </div>
                      <div>
                        <span className="text-[9px] text-[#9CA3AF] block font-bold uppercase">Retry Count</span>
                        {ad.retries}
                      </div>
                    </div>

                    {ad.status !== 'Healthy' && (
                      <div className="bg-amber-50 text-amber-800 rounded-xl p-3 text-[10px] font-semibold flex gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold">Errors:</span> {ad.errors}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}

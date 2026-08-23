import React from 'react';
import { 
  Activity, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  Server,
  AlertTriangle,
  ChevronRight,
  TrendingUp
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function PortfolioHealth() {
  const healthStats = [
    { label: "Availability Uptime", value: "99.98%", sub: "Checked periodically by daemon", icon: Server, color: "text-[#10B981] bg-emerald-50" },
    { label: "Response Latency", value: "164 ms", sub: "Average latency: 182ms", icon: Clock, color: "text-[#6366F1] bg-indigo-50" },
    { label: "SSL Certificate", value: "Valid", sub: "Expires in 282 days", icon: ShieldCheck, color: "text-purple-600 bg-purple-50" }
  ];

  // Visual Uptime blocks representing 24 hourly checks (all green, one degraded orange)
  const hourlyChecks = Array.from({ length: 24 }, (_, i) => ({
    hour: `${i}:00`,
    status: i === 18 ? 'degraded' : 'healthy'
  }));

  const incidents = [
    {
      time: "Aug 23, 2026 8:42 PM",
      type: "SSL Check Timeout",
      desc: "Uptime monitor: SSL check timed out on initial request. Resolved in 1.6s on automatic retry.",
      status: "Resolved"
    },
    {
      time: "Aug 20, 2026 2:10 AM",
      type: "Uptime Verification",
      desc: "SSL certificate validated successfully. Let's Encrypt authority confirmed.",
      status: "Info"
    }
  ];

  return (
    <div className="space-y-6 pb-12 text-left animate-fadeIn">
      
      {/* Title */}
      <div>
        <h1 className="text-[28px] font-bold text-[#111827] tracking-tight">Portfolio Health Monitor</h1>
        <p className="text-sm text-[#4B5563] mt-1 font-semibold">
          Platform daemon continuously tracks your portfolio site availability. Using cached status results for instantaneous loads.
        </p>
      </div>

      {/* Main Status Banner */}
      <motion.div 
        whileHover={{ y: -2 }}
        className="bg-white border border-[#E5E9F0] rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6"
      >
        <div className="flex items-center gap-4.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#10B981] flex items-center justify-center shrink-0 animate-pulse">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-[#111827]">Portfolio: Healthy</h2>
              <span className="text-[9px] font-bold text-white bg-[#10B981] px-2 py-0.5 rounded uppercase tracking-wider">
                Active
              </span>
            </div>
            <p className="text-xs text-[#6B7280] font-semibold leading-relaxed">
              Target: <a href="https://alexrivera.dev" target="_blank" rel="noreferrer" className="text-[#6366F1] hover:underline font-bold">https://alexrivera.dev</a> • HTTP 200 OK • Checked 2m ago
            </p>
          </div>
        </div>

        <div className="text-right shrink-0">
          <span className="text-[10px] text-[#9CA3AF] font-bold uppercase block">Latest latency</span>
          <span className="text-2xl font-black text-[#111827]">164ms</span>
        </div>
      </motion.div>

      {/* Core Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {healthStats.map((st, idx) => {
          const Icon = st.icon;
          return (
            <motion.div 
              key={idx}
              whileHover={{ y: -2 }}
              className="bg-white border border-[#E5E9F0] rounded-3xl p-5 shadow-sm space-y-3"
            >
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider block">
                  {st.label}
                </span>
                <div className={`w-8 h-8 rounded-lg ${st.color} flex items-center justify-center shrink-0`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div>
                <span className="text-xl font-black text-[#111827]">{st.value}</span>
                <span className="text-[10px] text-[#6B7280] font-semibold block mt-0.5">{st.sub}</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Hourly Availability Grid (Visual timeline) */}
      <div className="bg-white border border-[#E5E9F0] rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xs font-bold text-[#111827] uppercase tracking-wider">
            24-Hour Availability Timeline checks
          </h3>
          <span className="text-[10px] font-bold text-[#9CA3AF]">
            100% Operational (Uptime verified)
          </span>
        </div>

        {/* Timeline blocks */}
        <div className="flex flex-wrap gap-2.5 justify-between py-2">
          {hourlyChecks.map((check, idx) => (
            <motion.div 
              key={idx}
              whileHover={{ scale: 1.15 }}
              className={`w-full flex-1 min-w-[12px] h-8 rounded-md transition-all shadow-sm ${
                check.status === 'healthy' 
                  ? 'bg-emerald-500 hover:bg-emerald-600' 
                  : 'bg-amber-500 hover:bg-amber-600'
              }`}
              title={`Hour ${check.hour}: ${check.status === 'healthy' ? 'HTTP 200 (Healthy)' : 'Degraded SSL retry (Healthy)'}`}
            ></motion.div>
          ))}
        </div>

        <div className="flex justify-between text-[9px] text-[#9CA3AF] font-bold pt-1 border-t border-[#F3F4F6]">
          <span>24 Hours Ago</span>
          <span>Checked Live 2m Ago</span>
        </div>
      </div>

      {/* Incident Logs */}
      <div className="bg-white border border-[#E5E9F0] rounded-3xl p-6 shadow-sm space-y-5">
        <h3 className="text-xs font-bold text-[#111827] uppercase tracking-wider">
          Incidents & Performance Logs
        </h3>

        <div className="divide-y divide-[#F3F4F6]">
          {incidents.map((inc, idx) => (
            <div key={idx} className="py-4.5 first:pt-0 last:pb-0 flex items-start gap-4 text-left">
              {inc.status === 'Resolved' ? (
                <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1 flex-1">
                <div className="flex justify-between items-baseline gap-2 flex-wrap">
                  <h4 className="text-xs font-bold text-[#111827]">{inc.type}</h4>
                  <span className="text-[10px] text-[#9CA3AF] font-bold">{inc.time}</span>
                </div>
                <p className="text-[11px] text-[#6B7280] font-semibold leading-relaxed">
                  {inc.desc}
                </p>
              </div>

              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                inc.status === 'Resolved' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'
              }`}>
                {inc.status}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

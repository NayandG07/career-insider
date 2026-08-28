import React, { useState } from 'react';
import { 
  Sparkles, 
  Compass, 
  CheckCircle2, 
  Briefcase, 
  Star, 
  ChevronRight,
  Send,
  MessageSquareCode
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Recommendations() {
  const [selectedRoles, setSelectedRoles] = useState(['Backend Engineer']);
  const [selectedMatchId, setSelectedMatchId] = useState('stripe');

  // AI Mentor state
  const [messages, setMessages] = useState([
    { id: 1, sender: 'mentor', text: "Hi Alex! Based on your selected role target (Backend Engineer), I've parsed your sharding metrics from GitHub and LeetCode. Stripe and Linear represent your strongest matches." }
  ]);
  const [chatVal, setChatVal] = useState('');

  const rolesOptions = [
    "Backend Engineer",
    "Data Scientist",
    "ML / AI Engineer",
    "Frontend Engineer"
  ];

  const matchedTargets = [
    {
      id: 'stripe',
      role: "Senior Backend / Infra Engineer",
      company: "Stripe",
      compatibility: 94,
      gaps: ["Distributed Cache Tuning (P1)", "Terraform HCL Integration"],
      coreEvidence: "Validated via 8 GitHub repos & LeetCode DP records."
    },
    {
      id: 'linear',
      role: "Staff distributed Database Engineer",
      company: "Linear",
      compatibility: 89,
      gaps: ["Local Sync latency queries"],
      coreEvidence: "Validated via Client Sync projects & Resume timelines."
    },
    {
      id: 'netflix',
      role: "ML Platform Infra Engineer",
      company: "Netflix",
      compatibility: 76,
      gaps: ["Kubernetes Clusters setup (P1)"],
      coreEvidence: "Validated via GitHub Repositories & Python backend pipelines."
    }
  ];

  const handleRoleToggle = (role) => {
    if (selectedRoles.includes(role)) {
      setSelectedRoles(prev => prev.filter(r => r !== role));
    } else {
      setSelectedRoles(prev => [...prev, role]);
    }
  };

  const handleSendChat = () => {
    if (!chatVal.trim()) return;
    const userMsg = { id: Date.now(), sender: 'user', text: chatVal };
    setMessages(prev => [...prev, userMsg]);
    setChatVal('');
    
    setTimeout(() => {
      const responseMsg = {
        id: Date.now() + 1,
        sender: 'mentor',
        text: "Analyzing your profile evidence against Stripe's architecture requirements... Recommendation: focus on completing 2 Kubernetes containerization tasks to close the DevOps gap."
      };
      setMessages(prev => [...prev, responseMsg]);
    }, 1000);
  };

  const activeTarget = matchedTargets.find(t => t.id === selectedMatchId) || matchedTargets[0];

  return (
    <div className="space-y-6 pb-12 text-left animate-fadeIn">
      
      {/* Title */}
      <div>
        <h1 className="text-[28px] font-bold text-[#111827] tracking-tight">Contextual Recommendations</h1>
        <p className="text-sm text-[#4B5563] mt-1 font-semibold">
          Select target career directions. CareerOS context engine maps your unified profile and analyzes compatibility.
        </p>
      </div>

      {/* Role Targets Selector */}
      <div className="bg-white border border-[#E5E9F0] rounded-3xl p-6 shadow-sm space-y-4">
        <span className="block text-[10px] font-bold text-[#6B7280] tracking-wider uppercase">
          Target Career Roles (Select Multiple - Optional)
        </span>

        <div className="flex flex-wrap gap-2.5">
          {rolesOptions.map((role) => {
            const isSelected = selectedRoles.includes(role);
            return (
              <motion.button
                key={role}
                onClick={() => handleRoleToggle(role)}
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.97 }}
                className={`px-4 py-2 border rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  isSelected 
                    ? 'bg-[#7C3AED] border-[#7C3AED] text-white' 
                    : 'bg-white border-[#E5E9F0] text-[#4B5563] hover:bg-[#FAFBFC]'
                }`}
              >
                {role}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Main Splits: Matches Left, AI Mentor Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Contextual Targets & Core Evidence */}
        <div className="lg:col-span-7 space-y-6">
          <h3 className="text-xs font-bold text-[#111827] uppercase tracking-wider">
            Compatibility Targets
          </h3>

          <div className="space-y-4">
            {matchedTargets.map((target) => {
              const isSelected = target.id === selectedMatchId;
              return (
                <motion.div
                  key={target.id}
                  onClick={() => setSelectedMatchId(target.id)}
                  whileHover={{ x: 2 }}
                  className={`bg-white border rounded-3xl p-5 shadow-sm hover:shadow-md cursor-pointer transition-all flex flex-col gap-4 ${
                    isSelected ? 'border-[#7C3AED] ring-2 ring-[#7C3AED]/5' : 'border-[#E5E9F0]'
                  }`}
                >
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h4 className="text-sm font-bold text-[#111827] leading-tight">
                        {target.role} at {target.company}
                      </h4>
                      <span className="text-[10px] text-[#9CA3AF] font-bold block mt-0.5">
                        {target.coreEvidence}
                      </span>
                    </div>

                    <span className="text-base font-black text-[#7C3AED] shrink-0">
                      {target.compatibility}% Match
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {target.gaps.map((gap, gIdx) => (
                      <span 
                        key={gIdx} 
                        className="text-[9px] px-2 py-0.5 rounded bg-amber-50 text-amber-800 font-bold border border-amber-100"
                      >
                        {gap}
                      </span>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Optional AI Guidance Console */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-[#E5E9F0] rounded-3xl p-6 shadow-sm flex flex-col justify-between h-[420px]">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#F3F4F6]">
              <div className="flex items-center gap-2">
                <MessageSquareCode className="w-4 h-4 text-[#7C3AED]" />
                <span className="text-xs font-bold text-[#111827] uppercase tracking-wider">
                  AI Context Assistant
                </span>
              </div>
              <span className="text-[9px] text-[#9CA3AF] font-bold uppercase">Optional Layer</span>
            </div>

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
              {messages.map((msg, mIdx) => (
                <div key={mIdx} className="space-y-1 text-left">
                  <span className="text-[9px] text-[#9CA3AF] font-bold block uppercase">
                    {msg.sender === 'mentor' ? 'AI Mentor' : 'Alex Rivera'}
                  </span>
                  <p className={`text-[11px] font-semibold p-3 rounded-2xl rounded-tl-none leading-relaxed ${
                    msg.sender === 'mentor' ? 'bg-[#F3F4F6] text-[#374151]' : 'bg-[#EEF2FF] text-[#1E1B4B]'
                  }`}>
                    {msg.text}
                  </p>
                </div>
              ))}
            </div>

            {/* Chat Input */}
            <div className="flex gap-2 border-t border-[#F3F4F6] pt-3">
              <input 
                type="text" 
                placeholder="Ask AI Mentor about these gaps..."
                value={chatVal}
                onChange={(e) => setChatVal(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
                className="flex-1 bg-white border border-[#E5E9F0] rounded-xl px-4 py-2 text-xs font-semibold text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/10 focus:border-[#7C3AED]"
              />
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSendChat}
                className="w-9 h-9 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-xl flex items-center justify-center shadow-md shadow-purple-100 transition-colors shrink-0 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5 fill-white/10" />
              </motion.button>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}

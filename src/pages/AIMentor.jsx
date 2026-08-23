import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Send, 
  Paperclip, 
  Mic, 
  ArrowUpRight,
  Download,
  Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AIMentor() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'mentor',
      name: 'CareerOS Mentor',
      time: '10:30 AM',
      text: "Hi Alex! I've analyzed your recent LeetCode data on Dynamic Programming and your new 'Distributed Cache' system design document. Your overall readiness is looking very competitive."
    },
    {
      id: 2,
      sender: 'user',
      name: 'Alex Rivera',
      time: '10:32 AM',
      text: "Awesome. Do I have realistic odds at getting an offer from Stripe right now? What are my critical gaps?"
    },
    {
      id: 3,
      sender: 'mentor',
      name: 'CareerOS Mentor',
      time: '10:33 AM',
      text: "You have a 94% compatibility match! Your core frontend competence is top-tier. Your primary gap is in complex distributed sharding structures which Stripe evaluates heavily in their Architecture Round. Shall we customize a mock test for this?"
    }
  ]);

  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = (text) => {
    if (!text.trim()) return;
    
    // Add user message
    const userMsg = {
      id: Date.now(),
      sender: 'user',
      name: 'Alex Rivera',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: text
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInputVal('');
    
    // Simulate mentor typing response
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const mentorMsg = {
        id: Date.now() + 1,
        sender: 'mentor',
        name: 'CareerOS Mentor',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: "I've generated a specific 3-question architecture mock session focused on Distributed Sharding Gaps. You can initiate it directly from your telemetry checklist."
      };
      setMessages(prev => [...prev, mentorMsg]);
    }, 1500);
  };

  const suggestionChips = [
    "Run mock system architecture test",
    "Identify my secondary skill gaps",
    "Compare compensation structures for Stripe"
  ];

  const telemetryContext = [
    { label: "Target Position", val: "Staff Infra Architect" },
    { label: "Active Match Target", val: "Stripe (94% Compatibility)" },
    { label: "Primary Skill Gap", val: "Distributed Sharding" },
    { label: "LeetCode Prep Target", val: "Dynamic Programming" }
  ];

  return (
    <div className="space-y-6 pb-12 text-left">
      
      {/* Title Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-bold text-[#111827] tracking-tight leading-tight">
            Conversational AI Career Mentor
          </h1>
          <p className="text-sm text-[#4B5563] mt-1 font-semibold">
            CareerOS AI engine is actively mapping your developer credentials.
          </p>
        </div>
      </div>

      {/* Main Grid split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Chat Area */}
        <div className="lg:col-span-8 bg-white border border-[#E5E9F0] rounded-3xl flex flex-col justify-between overflow-hidden shadow-sm h-[680px]">
          
          {/* Chat Header */}
          <div className="px-6 py-4 border-b border-[#E5E9F0] flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#7C3AED] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#111827] leading-tight">CareerOS AI Mentor</h3>
                <span className="text-[11px] text-[#6B7280] font-semibold mt-0.5 block">
                  System Design & Compensation Specialist
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-bold text-[#10B981] bg-emerald-50/50 px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span>
              ONLINE
            </div>
          </div>

          {/* Messages Logs */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white">
            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <motion.div 
                  key={msg.id} 
                  initial={{ opacity: 0, scale: 0.97, y: 12 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 350, damping: 25 }}
                  className="space-y-2"
                >
                  {/* Message Meta Info */}
                  <div className="flex items-center gap-2">
                    {msg.sender === 'mentor' && (
                      <div className="w-6 h-6 rounded-full bg-[#7C3AED] flex items-center justify-center">
                        <Sparkles className="w-3 h-3 text-white" />
                      </div>
                    )}
                    <span className="text-xs font-bold text-[#111827]">{msg.name}</span>
                    <span className="text-[10px] text-[#9CA3AF] font-semibold">{msg.time}</span>
                  </div>

                  {/* Message Bubble */}
                  <div className={`p-4 rounded-2xl max-w-[90%] text-xs font-semibold leading-relaxed ${
                    msg.sender === 'user' 
                      ? 'bg-[#EEF2FF] text-[#1E1B4B] rounded-tl-none ml-auto md:ml-0'
                      : 'bg-[#F3F4F6] text-[#374151] rounded-tl-none'
                  }`}>
                    {msg.text}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {isTyping && (
              <motion.div 
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-2"
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-[#7C3AED] flex items-center justify-center">
                    <Sparkles className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-xs font-bold text-[#111827]">CareerOS Mentor</span>
                </div>
                <div className="bg-[#F3F4F6] text-[#374151] p-4 rounded-2xl rounded-tl-none w-16 flex justify-center">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-[#7C3AED] rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-[#7C3AED] rounded-full animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-1.5 h-1.5 bg-[#7C3AED] rounded-full animate-bounce [animation-delay:0.4s]"></span>
                  </div>
                </div>
              </motion.div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Suggestions Chips & Input Bar */}
          <div className="p-6 border-t border-[#E5E9F0] bg-white space-y-4">
            
            {/* Suggestion Chips */}
            <div className="flex flex-wrap gap-2.5">
              {suggestionChips.map((chip, idx) => (
                <motion.button
                  key={idx}
                  onClick={() => handleSendMessage(chip)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-4 py-2 border border-[#E5E9F0] bg-white text-[#6366F1] hover:bg-[#F8FAFC] transition-colors rounded-xl text-xs font-semibold shadow-sm cursor-pointer text-left"
                >
                  {chip}
                </motion.button>
              ))}
            </div>

            {/* Input Form */}
            <div className="flex items-center gap-3">
              {/* Attachment Button */}
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-10 h-10 border border-[#E5E9F0] rounded-xl flex items-center justify-center text-[#4B5563] hover:bg-[#FAFBFC] transition-colors cursor-pointer shrink-0"
              >
                <Paperclip className="w-4 h-4" />
              </motion.button>

              {/* TextInput Field */}
              <div className="relative flex-1">
                <input 
                  type="text" 
                  placeholder="Ask anything about your roadmap, skill prep, or salary negotiation..."
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(inputVal)}
                  className="w-full pl-4 pr-11 py-3 border border-[#E5E9F0] rounded-xl bg-white text-xs font-semibold text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/10 focus:border-[#7C3AED] placeholder-[#9CA3AF]"
                />
                {/* Mic Icon */}
                <button className="absolute right-3.5 top-3.5 text-[#9CA3AF] hover:text-[#4B5563] cursor-pointer">
                  <Mic className="w-4.5 h-4.5" />
                </button>
              </div>

              {/* Send Button */}
              <motion.button 
                onClick={() => handleSendMessage(inputVal)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-10 h-10 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-xl flex items-center justify-center shadow-md shadow-purple-100 transition-colors shrink-0 cursor-pointer"
              >
                <Send className="w-4 h-4 fill-white/10" />
              </motion.button>
            </div>

          </div>

        </div>

        {/* Right Column: Context Reference Card */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Active Context Telemetry */}
          <motion.div 
            whileHover={{ y: -3, transition: { duration: 0.15 } }}
            className="bg-white border border-[#E5E9F0] rounded-3xl p-6.5 shadow-sm space-y-5"
          >
            <h3 className="text-xs font-bold text-[#111827] uppercase tracking-wider block border-b border-[#F3F4F6] pb-3">
              Active Context Telemetry
            </h3>

            <div className="space-y-4">
              {telemetryContext.map((tele, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs font-semibold text-[#4B5563] gap-4">
                  <span>{tele.label}</span>
                  <span className="text-[#6366F1] font-bold text-[10px] text-right shrink-0">
                    {tele.val}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Practice Challenge Card */}
          <motion.div 
            whileHover={{ y: -3, transition: { duration: 0.15 } }}
            className="bg-white border border-[#E5E9F0] rounded-3xl p-6.5 shadow-sm space-y-4"
          >
            <h3 className="text-xs font-bold text-[#111827] uppercase tracking-wider block border-b border-[#F3F4F6] pb-3">
              Custom Practice Challenge
            </h3>
            
            <p className="text-[11px] text-[#6B7280] font-semibold leading-relaxed">
              Solve Stripe's benchmark system sharding questions under simulated timed constraints.
            </p>

            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-2.5 bg-white border border-[#6366F1] text-[#6366F1] hover:bg-indigo-50/20 font-bold text-xs rounded-xl shadow-sm transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Launch Timed Simulator
            </motion.button>
          </motion.div>

        </div>

      </div>

    </div>
  );
}

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Sparkles, 
  Send, 
  Plus, 
  Compass, 
  BrainCircuit, 
  Layers, 
  Briefcase, 
  X, 
  Bot, 
  Check, 
  Copy, 
  RefreshCw, 
  Lightbulb, 
  Tag 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AIMentor() {
  const { 
    conversation, 
    addMentorMessage, 
    userData, 
    companies, 
    skills, 
    roadmap, 
    projects, 
    fetchRoadmap, 
    fetchSkillProfile 
  } = useApp();

  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activeTags, setActiveTags] = useState([]);
  const [showTagMenu, setShowTagMenu] = useState(false);
  const [copiedMsgId, setCopiedMsgId] = useState(null);
  const [sessionId, setSessionId] = useState(() => `session-${Date.now()}`);

  const chatEndRef = useRef(null);
  const tagMenuRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-fetch fresh roadmap and skills if not yet loaded
  useEffect(() => {
    if (!roadmap && fetchRoadmap) fetchRoadmap();
    if (!skills && fetchSkillProfile) fetchSkillProfile();
  }, []);

  // Close tag menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (tagMenuRef.current && !tagMenuRef.current.contains(e.target)) {
        setShowTagMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Format messages
  const displayMessages = useMemo(() => {
    const defaultWelcome = {
      id: 'welcome-0',
      sender: 'mentor',
      name: 'CareerOS AI Mentor',
      time: 'Just now',
      taggedContext: null,
      text: `Hi ${userData?.name || 'there'}! I'm your AI Career Mentor.\n\nClick the **"+"** button beside the input to tag your **Career Roadmap** or **Skill Intelligence** data. Once tagged, I have full context of your milestones, readiness scores, and verified skill levels so we can discuss your career path, interview prep, and project architecture.`
    };

    if (!conversation || conversation.length === 0) {
      return [defaultWelcome];
    }

    return [
      defaultWelcome,
      ...conversation.map((m, idx) => ({
        id: `msg-${idx + 1}`,
        sender: m.sender === 'user' ? 'user' : 'mentor',
        name: m.sender === 'user' ? (userData?.name || 'You') : 'CareerOS AI Mentor',
        time: m.timestamp ? new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now',
        text: m.text,
        taggedContext: m.taggedContext || null,
      }))
    ];
  }, [conversation, userData]);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [displayMessages, isTyping]);

  // Available taggable modules from user's live profile
  const taggableModules = useMemo(() => [
    {
      id: 'tag-roadmap-full',
      title: 'Career Roadmap',
      subtitle: roadmap?.targetRoles?.length ? `${roadmap.targetRoles.join(', ')} • ${roadmap.milestones?.length || 0} Milestones` : 'Live Career Milestones & Plan Velocity',
      icon: Compass,
      color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      badge: 'Roadmap',
      getData: () => ({
        targetRoles: roadmap?.targetRoles || ['Full-Stack Software Engineer'],
        weeklyHours: roadmap?.weeklyHours || 10,
        estimatedTotalWeeks: roadmap?.estimatedTotalWeeks,
        estimatedTotalHours: roadmap?.estimatedTotalHours,
        milestones: (roadmap?.milestones || []).map((m, i) => ({
          number: m.milestoneNumber || i + 1,
          title: m.title,
          description: m.description,
          hours: m.estimatedHours,
          subtasks: (m.subtasks || []).map(s => typeof s === 'string' ? s : s.title),
          completed: m.completed || false
        }))
      })
    },
    {
      id: 'tag-skills-full',
      title: 'Skill Intelligence',
      subtitle: skills?.readinessScore ? `${skills.readinessScore}% Readiness • ${skills.skills?.length || 0} Tracked Skills` : 'Verified Skills & Gap Analysis',
      icon: BrainCircuit,
      color: 'bg-purple-50 text-purple-700 border-purple-200',
      badge: 'Skills',
      getData: () => ({
        readinessScore: skills?.readinessScore || 50,
        categories: (skills?.categories || []).map(c => ({ name: c.name, score: c.score, level: c.level, skills: c.skills })),
        topSkills: (skills?.skills || []).slice(0, 15).map(s => ({ name: s.name, level: s.level, strength: s.evidenceStrength, category: s.category })),
        gapAnalysis: (skills?.gapAnalysis || []).map(g => ({ name: g.name, priority: g.priority, recommendation: g.recommendation }))
      })
    },
    {
      id: 'tag-projects-full',
      title: 'Showcase Projects',
      subtitle: `${projects?.length || 0} Projects • Tech Stacks & Repositories`,
      icon: Layers,
      color: 'bg-sky-50 text-sky-700 border-sky-200',
      badge: 'Projects',
      getData: () => (projects || []).map(p => ({
        title: p.title,
        technologies: p.technologies || [],
        repositoryUrl: p.repositoryUrl,
        liveUrl: p.liveUrl
      }))
    },
    {
      id: 'tag-companies-full',
      title: 'Target Companies',
      subtitle: `${companies?.length || 0} Matches • Role Compatibility`,
      icon: Briefcase,
      color: 'bg-teal-50 text-teal-700 border-teal-200',
      badge: 'Companies',
      getData: () => (companies || []).slice(0, 5).map(c => ({
        name: c.name,
        role: c.role,
        matchScore: c.matchScore
      }))
    }
  ], [roadmap, skills, projects, companies]);

  // Dynamic Prompt Suggestions based on tagged data
  const quickPrompts = useMemo(() => {
    const list = [];
    const hasRoadmapTagged = activeTags.some(t => t.id === 'tag-roadmap-full');
    const hasSkillsTagged = activeTags.some(t => t.id === 'tag-skills-full');

    if (hasRoadmapTagged) {
      list.push("How should I plan my next roadmap milestone for maximum recruiter impact?");
      list.push("Can you break down the hardest subtasks in my active milestone?");
    } else if (hasSkillsTagged) {
      list.push("What are my biggest skill gaps and how do I fix them in 2 weeks?");
      list.push("How can I highlight my top verified skills in technical interviews?");
    } else {
      list.push("Analyze my overall career readiness and recommend my next big step.");
      list.push("How should I balance project development and algorithm practice?");
    }
    return list.slice(0, 2);
  }, [activeTags]);

  const handleToggleTag = (tag) => {
    if (activeTags.some(t => t.id === tag.id)) {
      setActiveTags(activeTags.filter(t => t.id !== tag.id));
    } else {
      setActiveTags([...activeTags, tag]);
    }
    setShowTagMenu(false);
  };

  const handleRemoveTag = (tagId) => {
    setActiveTags(activeTags.filter(t => t.id !== tagId));
  };

  const handleSendMessage = async (textToSend = inputVal) => {
    const cleanText = textToSend.trim();
    if (!cleanText || isTyping) return;

    setInputVal('');

    // Package current tagged context
    const taggedPayload = activeTags.length > 0 
      ? activeTags.reduce((acc, t) => {
          acc[t.title] = t.getData();
          return acc;
        }, {})
      : null;

    setIsTyping(true);
    try {
      await addMentorMessage(cleanText, sessionId, taggedPayload, 'general');
    } catch (err) {
      console.error('Mentor chat error:', err);
    } finally {
      setIsTyping(false);
    }
  };

  const handleCopyMessage = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgId(id);
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  const handleNewSession = () => {
    setSessionId(`session-${Date.now()}`);
    setActiveTags([]);
    if (inputRef.current) inputRef.current.focus();
  };

  // Simple Markdown renderer
  const renderFormattedMarkdown = (text) => {
    if (!text) return null;
    const lines = text.split('\n');

    return lines.map((line, lIdx) => {
      if (line.startsWith('### ')) {
        return <h4 key={lIdx} className="text-xs sm:text-sm font-bold text-[#111827] mt-2.5 mb-1 flex items-center gap-1.5">{line.replace('### ', '')}</h4>;
      }
      if (line.startsWith('## ')) {
        return <h3 key={lIdx} className="text-sm font-black text-[#111827] mt-3 mb-1">{line.replace('## ', '')}</h3>;
      }
      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        const itemContent = line.trim().replace(/^[-*]\s+/, '');
        return (
          <div key={lIdx} className="flex items-start gap-2 my-1 text-xs font-semibold text-[#374151] leading-relaxed">
            <span className="w-1.5 h-1.5 rounded-full bg-[#7C3AED] mt-1.5 shrink-0" />
            <span>{renderInlineFormatting(itemContent)}</span>
          </div>
        );
      }
      if (/^\d+\.\s+/.test(line.trim())) {
        const num = line.trim().match(/^\d+/)?.[0];
        const itemContent = line.trim().replace(/^\d+\.\s+/, '');
        return (
          <div key={lIdx} className="flex items-start gap-2 my-1 text-xs font-semibold text-[#374151] leading-relaxed">
            <span className="px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 text-[10px] font-bold shrink-0">{num}</span>
            <span>{renderInlineFormatting(itemContent)}</span>
          </div>
        );
      }
      if (line.trim().startsWith('```')) {
        return null;
      }
      if (!line.trim()) {
        return <div key={lIdx} className="h-1.5" />;
      }
      return (
        <p key={lIdx} className="text-xs sm:text-[13px] font-semibold text-[#374151] leading-relaxed my-0.5">
          {renderInlineFormatting(line)}
        </p>
      );
    });
  };

  const renderInlineFormatting = (str) => {
    const parts = str.split(/(\*\*.*?\*\*|`.*?`)/g);
    return parts.map((part, pIdx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={pIdx} className="font-bold text-[#111827]">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return <code key={pIdx} className="px-1.5 py-0.5 rounded bg-purple-50 text-[#7C3AED] font-mono text-[11px] font-bold">{part.slice(1, -1)}</code>;
      }
      return part;
    });
  };

  return (
    <div className="h-[calc(100vh-112px)] flex flex-col overflow-hidden text-left -mb-6">
      
      {/* ─── Top Compact Bar ─────────────────────────────────────────────── */}
      <div className="bg-white border border-[#E5E9F0] rounded-2xl px-5 py-3 shadow-2xs flex items-center justify-between gap-4 shrink-0 mb-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#6366F1] flex items-center justify-center text-white shadow-2xs shrink-0">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-black text-[#111827] tracking-tight leading-none">
                CareerOS AI Mentor
              </h1>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Context Ready
              </span>
            </div>
            <p className="text-[11px] text-[#6B7280] font-semibold mt-0.5">
              Click <span className="text-[#7C3AED] font-bold">+</span> to tag your Career Roadmap or Skill Intelligence for contextual career coaching.
            </p>
          </div>
        </div>

        <button
          onClick={handleNewSession}
          className="px-3 py-1.5 bg-white border border-[#E5E9F0] hover:bg-[#F8FAFC] text-[#374151] text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs shrink-0"
          title="Start new conversation"
        >
          <RefreshCw className="w-3.5 h-3.5 text-[#6B7280]" />
          <span>New Chat</span>
        </button>
      </div>

      {/* ─── Full-Width Single Page Chat Workspace (Zero Outer Scroll) ───── */}
      <div className="flex-1 bg-white border border-[#E5E9F0] rounded-2xl flex flex-col overflow-hidden shadow-2xs min-h-0">
        
        {/* Scrollable Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-white">
          <AnimatePresence initial={false}>
            {displayMessages.map((msg) => {
              const isUser = msg.sender === 'user';
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.15 }}
                  className="space-y-1.5 group max-w-4xl mx-auto"
                >
                  {/* Header Meta */}
                  <div className={`flex items-center gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
                    {!isUser && (
                      <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-[#7C3AED] to-[#6366F1] flex items-center justify-center text-white shadow-2xs shrink-0">
                        <Sparkles className="w-2.5 h-2.5" />
                      </div>
                    )}
                    <span className="text-[11px] font-bold text-[#111827]">{msg.name}</span>
                    <span className="text-[10px] font-semibold text-[#9CA3AF]">{msg.time}</span>
                  </div>

                  {/* Attached Context Badges if User message */}
                  {isUser && msg.taggedContext && (
                    <div className="flex justify-end gap-1.5 flex-wrap">
                      {Object.keys(msg.taggedContext).map((keyName, kIdx) => (
                        <span key={kIdx} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-50 border border-purple-200 text-[#7C3AED] text-[10px] font-bold">
                          <Tag className="w-2.5 h-2.5" />
                          @{keyName} Tagged
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Message Bubble */}
                  <div className={`flex items-start gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
                    <div className={`p-4 sm:p-5 rounded-2xl max-w-[94%] sm:max-w-[85%] text-xs leading-relaxed shadow-2xs ${
                      isUser
                        ? 'bg-[#6366F1] text-white rounded-tr-none'
                        : 'bg-[#F9FAFB] text-[#374151] border border-[#E5E9F0] rounded-tl-none'
                    }`}>
                      {isUser ? (
                        <p className="font-semibold text-xs sm:text-[13px] leading-relaxed whitespace-pre-wrap">
                          {msg.text}
                        </p>
                      ) : (
                        <div className="space-y-1">
                          {renderFormattedMarkdown(msg.text)}
                        </div>
                      )}
                    </div>

                    {!isUser && (
                      <button
                        onClick={() => handleCopyMessage(msg.id, msg.text)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 text-[#9CA3AF] hover:text-[#7C3AED] hover:bg-purple-50 rounded-lg cursor-pointer shrink-0 mt-1"
                        title="Copy response"
                      >
                        {copiedMsgId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Typing indicator */}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-1.5 max-w-4xl mx-auto"
            >
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-full bg-[#7C3AED] flex items-center justify-center text-white shrink-0">
                  <Sparkles className="w-2.5 h-2.5" />
                </div>
                <span className="text-[11px] font-bold text-[#111827]">CareerOS AI Mentor</span>
              </div>
              <div className="bg-[#F9FAFB] border border-[#E5E9F0] p-3 rounded-2xl rounded-tl-none w-16 flex items-center justify-center">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-[#7C3AED] rounded-full animate-bounce" />
                  <span className="w-1.5 h-1.5 bg-[#7C3AED] rounded-full animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 bg-[#7C3AED] rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            </motion.div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* ─── Bottom Pinned Tagging & Typing Input Area ─────────────────── */}
        <div className="p-3 sm:p-4 border-t border-[#E5E9F0] bg-[#FAFBFC] space-y-2.5 shrink-0">
          <div className="max-w-4xl mx-auto space-y-2.5">
            
            {/* Quick Prompt Pill Triggers */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF] shrink-0 flex items-center gap-1">
                <Lightbulb className="w-3 h-3 text-amber-500" /> Suggestion:
              </span>
              {quickPrompts.map((promptText, pIdx) => (
                <button
                  key={pIdx}
                  onClick={() => handleSendMessage(promptText)}
                  className="px-2.5 py-1 bg-white border border-[#E5E9F0] hover:border-purple-300 hover:text-[#7C3AED] hover:bg-purple-50/40 rounded-xl text-[11px] font-semibold text-[#4B5563] truncate transition-all cursor-pointer shrink-0 shadow-2xs"
                >
                  {promptText}
                </button>
              ))}
            </div>

            {/* Active Tagged Badges Tray */}
            {activeTags.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap p-1.5 rounded-xl bg-white border border-purple-100 shadow-2xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#7C3AED] flex items-center gap-1 shrink-0 ml-1">
                  <Tag className="w-2.5 h-2.5" /> Tagged Context:
                </span>
                {activeTags.map((tag) => (
                  <span
                    key={tag.id}
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-bold border ${tag.color}`}
                  >
                    <tag.icon className="w-3 h-3 shrink-0" />
                    <span>{tag.title}</span>
                    <button
                      onClick={() => handleRemoveTag(tag.id)}
                      className="hover:bg-black/10 rounded-full p-0.5 cursor-pointer ml-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                <button
                  onClick={() => setActiveTags([])}
                  className="text-[10px] font-bold text-[#9CA3AF] hover:text-red-600 ml-auto mr-1 cursor-pointer"
                >
                  Clear
                </button>
              </div>
            )}

            {/* Main Input Form with "+" Tag Menu */}
            <div className="flex items-center gap-2 relative z-30">
              
              {/* The "+" Button to Tag Pages / Modules */}
              <div className="relative" ref={tagMenuRef}>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowTagMenu((prev) => !prev);
                  }}
                  className={`w-11 h-11 rounded-xl flex items-center justify-center text-xs font-bold transition-all cursor-pointer shrink-0 shadow-2xs border ${
                    showTagMenu || activeTags.length > 0
                      ? 'bg-[#7C3AED] text-white border-[#7C3AED]'
                      : 'bg-white border-[#E5E9F0] text-[#4B5563] hover:border-purple-300 hover:text-[#7C3AED]'
                  }`}
                  title="Click '+' to tag Career Roadmap or Skill Intelligence"
                >
                  <Plus className="w-5 h-5 pointer-events-none" />
                </button>

                {/* Tag Selection Popover Menu */}
                {showTagMenu && (
                  <div
                    className="absolute bottom-full mb-3 left-0 w-80 sm:w-96 bg-white border border-[#E5E9F0] rounded-2xl shadow-2xl z-50 p-3.5 space-y-2.5"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-between border-b border-[#F3F4F6] pb-2">
                      <div className="flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5 text-[#7C3AED]" />
                        <span className="text-xs font-bold text-[#111827]">Attach Verified Page Context</span>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => setShowTagMenu(false)} 
                        className="text-[#9CA3AF] hover:text-[#111827] cursor-pointer p-0.5"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="space-y-1.5 max-h-72 overflow-y-auto pr-0.5">
                      {taggableModules.map((mod) => {
                        const Icon = mod.icon;
                        const isTagged = activeTags.some(t => t.id === mod.id);
                        return (
                          <button
                            key={mod.id}
                            type="button"
                            onClick={() => handleToggleTag(mod)}
                            className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-center justify-between gap-2.5 group cursor-pointer ${
                              isTagged
                                ? 'border-[#7C3AED] bg-purple-50/60'
                                : 'border-[#E5E9F0] hover:border-purple-200 hover:bg-[#F9FAFB]'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${mod.color}`}>
                                <Icon className="w-4 h-4" />
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-xs font-bold text-[#111827]">{mod.title}</span>
                                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-gray-100 text-[#4B5563]">
                                    {mod.badge}
                                  </span>
                                </div>
                                <span className="text-[10px] text-[#6B7280] font-semibold truncate block">
                                  {mod.subtitle}
                                </span>
                              </div>
                            </div>
                            {isTagged ? (
                              <Check className="w-4 h-4 text-[#7C3AED] shrink-0" />
                            ) : (
                              <Plus className="w-4 h-4 text-[#9CA3AF] group-hover:text-[#7C3AED] shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* TextInput Field */}
              <input
                ref={inputRef}
                type="text"
                placeholder={activeTags.length > 0 ? `Ask about tagged ${activeTags.map(t => t.title).join(' & ')}...` : 'Ask your AI mentor (or click "+" to tag Roadmap / Skills)...'}
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                className="flex-1 px-4 py-3 bg-white border border-[#E5E9F0] rounded-xl text-xs sm:text-[13px] font-semibold text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-purple-100 shadow-2xs"
              />

              {/* Send Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={!inputVal.trim() || isTyping}
                onClick={() => handleSendMessage()}
                className="w-11 h-11 bg-[#7C3AED] hover:bg-[#6D28D9] disabled:opacity-50 text-white rounded-xl flex items-center justify-center shadow-md shadow-purple-100 transition-all shrink-0 cursor-pointer"
                title="Send message"
              >
                <Send className="w-4 h-4 fill-white/20" />
              </motion.button>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}

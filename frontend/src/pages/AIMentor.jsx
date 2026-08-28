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
  Check,
  Copy,
  RefreshCw,
  Lightbulb,
  Tag,
  RotateCcw,
  SlidersHorizontal
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function AIMentor() {
  const {
    conversation = [],
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

  const [showQuickActions, setShowQuickActions] = useState(false);

  const chatEndRef = useRef(null);
  const tagMenuRef = useRef(null);
  const quickActionsRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-fetch fresh roadmap and skills if not yet loaded
  useEffect(() => {
    if (!roadmap && fetchRoadmap) fetchRoadmap();
    if (!skills && fetchSkillProfile) fetchSkillProfile();
  }, []);

  // Close tag menu & quick actions menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (tagMenuRef.current && !tagMenuRef.current.contains(e.target)) {
        setShowTagMenu(false);
      }
      if (quickActionsRef.current && !quickActionsRef.current.contains(e.target)) {
        setShowQuickActions(false);
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
      text: `Hi ${userData?.name || 'there'}! I'm your AI Career Mentor.\n\nClick the **"+"** button beside the input to tag your **Career Roadmap**, **Skill Intelligence**, or **Projects** for contextual guidance. Once tagged, I have full context of your milestones, verified skill levels, and goals.`
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
    return list.slice(0, 4);
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
    <div className="h-[calc(100vh-112px)] flex flex-col justify-between max-w-4xl mx-auto space-y-4 animate-fadeIn text-left relative">

      {/* ─── Rightmost Vertically Centered Quick Action Menu ───────────── */}
      <div className="fixed right-4 sm:right-6 top-1/2 -translate-y-1/2 z-40 flex items-center gap-3" ref={quickActionsRef}>

        {/* Smooth Popover Card (Expands to the left of Button) */}
        <AnimatePresence>
          {showQuickActions && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, x: 15 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.9, x: 15 }}
              transition={{ type: 'spring', stiffness: 350, damping: 26 }}
              className="w-64 bg-white border border-[#E5E9F0] rounded-3xl shadow-2xl p-3.5 space-y-2 shrink-0"
            >
              <div className="flex items-center justify-between border-b border-[#F3F4F6] pb-2 px-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#9CA3AF]">More Actions</span>
                <button
                  onClick={() => setShowQuickActions(false)}
                  className="text-[#9CA3AF] hover:text-[#111827] cursor-pointer p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-1">
                {/* Action 1: New Chat */}
                <button
                  onClick={() => {
                    handleNewSession();
                    setShowQuickActions(false);
                  }}
                  className="w-full text-left p-2.5 rounded-2xl hover:bg-purple-50/60 border border-transparent hover:border-purple-200 transition-all flex items-center gap-3 group cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-xl bg-purple-50 text-[#7C3AED] group-hover:bg-[#7C3AED] group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
                    <RotateCcw className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#111827] block leading-tight">New Chat</span>
                    <span className="text-[10px] text-[#6B7280] font-semibold">Start fresh conversation</span>
                  </div>
                </button>

                {/* Action 2: Attach Context */}
                <button
                  onClick={() => {
                    setShowTagMenu(true);
                    setShowQuickActions(false);
                  }}
                  className="w-full text-left p-2.5 rounded-2xl hover:bg-indigo-50/60 border border-transparent hover:border-indigo-200 transition-all flex items-center gap-3 group cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
                    <Tag className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#111827] block leading-tight">Attach Context</span>
                    <span className="text-[10px] text-[#6B7280] font-semibold">Roadmap, Skills, Projects</span>
                  </div>
                </button>

                {/* Action 3: Clear Tags (if active) */}
                {activeTags.length > 0 && (
                  <button
                    onClick={() => {
                      setActiveTags([]);
                      setShowQuickActions(false);
                    }}
                    className="w-full text-left p-2.5 rounded-2xl hover:bg-rose-50/60 border border-transparent hover:border-rose-200 transition-all flex items-center gap-3 group cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 group-hover:bg-rose-600 group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
                      <X className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-rose-700 block leading-tight">Clear Attached Context</span>
                      <span className="text-[10px] text-rose-500 font-semibold">{activeTags.length} active tag(s)</span>
                    </div>
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Collapsed Trigger Button (On the right) */}
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={() => setShowQuickActions((prev) => !prev)}
          className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all cursor-pointer shadow-lg shadow-purple-500/10 border shrink-0 ${showQuickActions
              ? 'bg-[#7C3AED] text-white border-[#7C3AED] ring-4 ring-purple-100'
              : 'bg-white text-[#7C3AED] border-[#E5E9F0] hover:border-purple-300 hover:bg-purple-50/50'
            }`}
          title="Quick Actions Menu"
        >
          <SlidersHorizontal className="w-5 h-5 pointer-events-none" />
        </motion.button>

      </div>

      {/* ─── Scrollable Messages Stream ─────────────────────────────────── */}

      {/* ─── 2. Scrollable Messages Stream ─────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 no-scrollbar min-h-0 py-2">
        <AnimatePresence initial={false}>
          {displayMessages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.15 }}
                className="space-y-1.5 group"
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
                      <span key={kIdx} className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-50 border border-purple-200 text-[#7C3AED] text-[10px] font-bold shadow-3xs">
                        <Tag className="w-2.5 h-2.5" />
                        @{keyName} Tagged
                      </span>
                    ))}
                  </div>
                )}

                {/* Message Bubble */}
                <div className={`flex items-start gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
                  <div className={`p-4 sm:p-5 rounded-3xl max-w-[94%] sm:max-w-[85%] text-xs leading-relaxed shadow-xs ${isUser
                      ? 'bg-[#7C3AED] text-white rounded-tr-md font-semibold text-xs sm:text-[13px]'
                      : 'bg-white text-[#374151] border border-[#E5E9F0] rounded-tl-md'
                    }`}>
                    {isUser ? (
                      <p className="leading-relaxed whitespace-pre-wrap">
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
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 text-[#9CA3AF] hover:text-[#7C3AED] hover:bg-white border border-transparent hover:border-[#E5E9F0] rounded-lg cursor-pointer shrink-0 mt-1 shadow-3xs"
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
            className="space-y-1.5"
          >
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-full bg-[#7C3AED] flex items-center justify-center text-white shrink-0">
                <Sparkles className="w-2.5 h-2.5" />
              </div>
              <span className="text-[11px] font-bold text-[#111827]">CareerOS AI Mentor</span>
            </div>
            <div className="bg-white border border-[#E5E9F0] p-3 rounded-2xl rounded-tl-none w-16 flex items-center justify-center shadow-xs">
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

      {/* ─── 3. Floating Bottom Input Bar & Tagging ─────────────────────── */}
      <div className="shrink-0 pt-2 space-y-2 relative z-30">

        {/* Quick Prompt Pill Triggers */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-0.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF] shrink-0 flex items-center gap-1">
            <Lightbulb className="w-3 h-3 text-amber-500" /> Suggestion:
          </span>
          {quickPrompts.map((promptText, pIdx) => (
            <button
              key={pIdx}
              onClick={() => handleSendMessage(promptText)}
              className="px-2.5 py-1 bg-white border border-[#E5E9F0] hover:border-purple-300 hover:text-[#7C3AED] hover:bg-purple-50/40 rounded-xl text-[11px] font-semibold text-[#4B5563] truncate transition-all cursor-pointer shrink-0 shadow-3xs"
            >
              {promptText}
            </button>
          ))}
        </div>

        {/* Active Tagged Badges Tray */}
        {activeTags.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap p-2 rounded-2xl bg-white border border-purple-200 shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#7C3AED] flex items-center gap-1 shrink-0 ml-1">
              <Tag className="w-3 h-3" /> Attached Context:
            </span>
            {activeTags.map((tag) => (
              <span
                key={tag.id}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold border shadow-3xs ${tag.color}`}
              >
                <tag.icon className="w-3.5 h-3.5 shrink-0" />
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
              Clear All
            </button>
          </div>
        )}

        {/* Input Bar Container */}
        <div className="bg-white border border-[#E5E9F0] rounded-2xl p-1.5 shadow-md shadow-purple-500/5 flex items-center gap-2 relative">

          {/* The "+" Button to Tag Pages / Modules */}
          <div className="relative" ref={tagMenuRef}>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowTagMenu((prev) => !prev);
              }}
              className={`w-11 h-11 rounded-xl flex items-center justify-center text-xs font-bold transition-all cursor-pointer shrink-0 border ${showTagMenu || activeTags.length > 0
                  ? 'bg-[#7C3AED] text-white border-[#7C3AED] shadow-sm shadow-purple-200'
                  : 'bg-[#FAFBFC] border-[#E5E9F0] text-[#4B5563] hover:border-purple-300 hover:text-[#7C3AED] hover:bg-white'
                }`}
              title="Click '+' to tag Career Roadmap, Skill Intelligence, or Projects"
            >
              <Plus className="w-5 h-5 pointer-events-none" />
            </button>

            {/* Tag Selection Popover Menu */}
            {showTagMenu && (
              <div
                className="absolute bottom-full mb-3 left-0 w-80 sm:w-96 bg-white border border-[#E5E9F0] rounded-3xl shadow-2xl z-50 p-4 space-y-3"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between border-b border-[#F3F4F6] pb-2.5">
                  <div className="flex items-center gap-1.5">
                    <Tag className="w-4 h-4 text-[#7C3AED]" />
                    <span className="text-xs font-bold text-[#111827]">Attach Context to Mentor</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowTagMenu(false)}
                    className="text-[#9CA3AF] hover:text-[#111827] cursor-pointer p-0.5"
                  >
                    <X className="w-4 h-4" />
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
                        className={`w-full text-left p-3 rounded-2xl border transition-all flex items-center justify-between gap-2.5 group cursor-pointer ${isTagged
                            ? 'border-[#7C3AED] bg-purple-50/60 shadow-3xs'
                            : 'border-[#E5E9F0] hover:border-purple-200 hover:bg-[#FAFBFC]'
                          }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${mod.color}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-[#111827]">{mod.title}</span>
                              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-gray-100 text-[#4B5563]">
                                {mod.badge}
                              </span>
                            </div>
                            <span className="text-[10px] text-[#6B7280] font-semibold truncate block mt-0.5">
                              {mod.subtitle}
                            </span>
                          </div>
                        </div>
                        {isTagged ? (
                          <div className="w-6 h-6 rounded-full bg-[#7C3AED] text-white flex items-center justify-center shrink-0">
                            <Check className="w-3.5 h-3.5" />
                          </div>
                        ) : (
                          <div className="w-6 h-6 rounded-full border border-gray-200 text-gray-400 group-hover:border-[#7C3AED] group-hover:text-[#7C3AED] flex items-center justify-center shrink-0">
                            <Plus className="w-3.5 h-3.5" />
                          </div>
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
            className="flex-1 px-3 py-2.5 bg-transparent border-0 text-xs sm:text-[13px] font-semibold text-[#111827] placeholder-[#9CA3AF] focus:outline-none"
          />

          {/* Send Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={!inputVal.trim() || isTyping}
            onClick={() => handleSendMessage()}
            className="w-10 h-10 bg-[#7C3AED] hover:bg-[#6D28D9] disabled:opacity-30 text-white rounded-xl flex items-center justify-center shadow-md shadow-purple-200 transition-all shrink-0 cursor-pointer disabled:cursor-not-allowed"
            title="Send message"
          >
            <Send className="w-4 h-4 fill-white/20" />
          </motion.button>
        </div>

      </div>

    </div>
  );
}

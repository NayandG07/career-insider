import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  ArrowRight, 
  Code, 
  Github, 
  Database, 
  Terminal, 
  Globe 
} from 'lucide-react';

function Typewriter({ phrases, speed = 80, delay = 2000 }) {
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let timer;
    const phrase = phrases[currentPhraseIndex];

    if (isDeleting) {
      timer = setTimeout(() => {
        setCurrentText((prev) => prev.slice(0, -1));
      }, speed / 2);
    } else {
      timer = setTimeout(() => {
        setCurrentText(phrase.slice(0, currentText.length + 1));
      }, speed);
    }

    if (!isDeleting && currentText === phrase) {
      timer = setTimeout(() => setIsDeleting(true), delay);
    } else if (isDeleting && currentText === '') {
      setIsDeleting(false);
      setCurrentPhraseIndex((prev) => (prev + 1) % phrases.length);
    }

    return () => clearTimeout(timer);
  }, [currentText, isDeleting, currentPhraseIndex, phrases, speed, delay]);

  return (
    <span className="inline-block relative">
      {currentText}
      <span className="ml-1 inline-block w-[3px] h-[0.85em] bg-[#6366F1] animate-pulse align-middle" />
    </span>
  );
}

const TYPEWRITER_PHRASES = ['in one single place.', 'synced in real-time.', 'verified at source.', 'ready to showcase.'];

function LandingNavbar({ setAuthView }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-white/85 backdrop-blur-md border-b border-[#E5E9F0]/80 shadow-sm' 
        : 'bg-transparent border-b border-transparent'
    }`}>
      <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between w-full">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#6366F1] flex items-center justify-center shadow-lg shadow-purple-500/20">
            <Terminal className="w-4.5 h-4.5 text-white" />
          </div>
          <span className="text-lg font-black tracking-tight text-[#111827]">CareerOS</span>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setAuthView('login')}
            className="text-xs font-bold text-[#4B5563] hover:text-[#111827] transition-colors cursor-pointer"
          >
            Sign In
          </button>
        </div>
      </nav>
    </div>
  );
}

export default function Landing({ setAuthView }) {
  const scrollToProblem = () => {
    const element = document.getElementById('problem-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 25 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  return (
    <div className="min-h-screen bg-[#F6F8FC] font-sans text-[#111827] relative selection:bg-[#7C3AED]/20">
      
      <LandingNavbar setAuthView={setAuthView} />

      <>
        
        {/* Background Decor (Hardware Accelerated Glows without heavy blur filters) */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[radial-gradient(ellipse_at_center,rgba(124,58,237,0.06)_0%,rgba(99,102,241,0.03)_45%,transparent_70%)] rounded-full -z-10 translate-x-1/3 -translate-y-1/3 pointer-events-none transform-gpu"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.06)_0%,rgba(52,211,153,0.03)_45%,transparent_70%)] rounded-full -z-10 -translate-x-1/3 translate-y-1/3 pointer-events-none transform-gpu"></div>

        {/* Full Screen Hero Section */}
        <div className="min-h-screen flex flex-col justify-between relative w-full pt-28">
          <div className="h-0 shrink-0"></div>

          {/* 2. Hero Section */}
          <motion.section 
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="max-w-7xl mx-auto px-6 py-8 relative z-10 text-center flex-grow flex items-center justify-center w-full -mt-16"
          >
            <div className="max-w-4xl mx-auto space-y-6">
              <motion.div 
                variants={itemVariants}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#E5E9F0] shadow-sm"
              >
                <span className="w-2 h-2 rounded-full bg-[#7C3AED] animate-pulse"></span>
                <span className="text-xs font-bold text-[#4B5563] tracking-wide uppercase">Unified Developer Profile</span>
              </motion.div>

              <motion.h1 
                variants={itemVariants}
                className="text-5xl md:text-6xl font-black tracking-tight leading-[1.1] text-[#111827]"
              >
                Your entire engineering identity <br/>
                <span className="inline-block min-h-[110px] sm:min-h-[60px] md:min-h-[72px] text-transparent bg-clip-text bg-gradient-to-r from-[#7C3AED] to-[#6366F1] w-full">
                  <Typewriter phrases={TYPEWRITER_PHRASES} />
                </span>
              </motion.h1>

              <motion.p 
                variants={itemVariants}
                className="text-base md:text-lg text-[#4B5563] font-medium leading-relaxed max-w-2xl mx-auto"
              >
                Everything you have built, solved, learned and published should be visible together. Connect your GitHub, LeetCode, Codeforces, Kaggle, and resume into a single, cohesive developer profile.
              </motion.p>

              <motion.div 
                variants={itemVariants}
                className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
              >
                <button 
                  onClick={() => setAuthView('signup')}
                  className="w-full sm:w-auto px-8 py-4 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-sm font-bold rounded-2xl shadow-xl shadow-purple-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  Create Your Account
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button 
                  onClick={scrollToProblem}
                  className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-[#F9FAFB] text-[#111827] border border-[#E5E9F0] text-sm font-bold rounded-2xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  Learn More
                </button>
              </motion.div>
            </div>
          </motion.section>

          {/* Scroll Down Indicator */}
          <div className="pb-8 text-center animate-bounce z-10 shrink-0">
            <span className="text-xs font-bold text-[#6B7280]">Scroll to explore</span>
          </div>
        </div>

        {/* 3. The Problem Section */}
        <motion.section 
          id="problem-section"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="max-w-7xl mx-auto px-6 py-28 border-t border-[#E5E9F0]"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center text-left">
            <div className="lg:col-span-5 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-200/60 shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider">The Problem</span>
              </div>
              <h2 className="text-4xl lg:text-5xl font-black text-[#111827] tracking-tight leading-tight">
                Your developer footprints are <span className="text-red-500">scattered</span> everywhere.
              </h2>
              <p className="text-base text-[#4B5563] leading-relaxed font-medium">
                Recruiters and hiring managers have to open 6 different browser tabs to evaluate your capabilities. Your commits are on GitHub, algorithmic ranks are on LeetCode, ML competitions on Kaggle, and your projects are on a hosted domain. It is impossible to present a unified picture of your expertise.
              </p>
              
              <div className="space-y-4 pt-4 border-t border-[#E5E9F0]">
                <div className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-red-600">!</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#111827]">Higher Cognitive Load</h4>
                    <p className="text-xs text-[#6B7280] font-medium mt-0.5">Hiring teams spend less than 30 seconds jumping between your scattered pages, missing key achievements.</p>
                  </div>
                </div>
                
                <div className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-red-600">?</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#111827]">No Cross-Platform Insights</h4>
                    <p className="text-xs text-[#6B7280] font-medium mt-0.5">Your algorithmic skill sets can't be cross-referenced with your production contributions easily.</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Visual illustration of tab chaos */}
            <div className="lg:col-span-7 relative">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(124,58,237,0.06)_0%,transparent_70%)] rounded-[32px] -z-10 pointer-events-none transform-gpu"></div>
              <div className="bg-white border border-[#E5E9F0] rounded-[32px] p-6 shadow-xl relative overflow-hidden">
                {/* Simulated browser frame */}
                <div className="flex items-center gap-1.5 pb-4 border-b border-[#F3F4F6]">
                  <span className="w-3 h-3 rounded-full bg-red-400"></span>
                  <span className="w-3 h-3 rounded-full bg-yellow-400"></span>
                  <span className="w-3 h-3 rounded-full bg-green-400"></span>
                  <span className="text-[10px] text-[#9CA3AF] font-bold ml-4">Browser Tab Overload (6+ Open Tabs)</span>
                </div>
                
                {/* Floating Scattered Profile Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 relative">
                  {/* Card 1: Github */}
                  <div className="border border-red-100 bg-red-50/30 rounded-2xl p-4 relative group hover:border-red-200 transition-all">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-slate-900 flex items-center justify-center text-white">
                          <Github className="w-4.5 h-4.5" />
                        </div>
                        <span className="text-xs font-bold text-[#374151]">GitHub Profile</span>
                      </div>
                      <span className="px-2 py-0.5 text-[8px] font-bold rounded-full bg-red-100 text-red-600">Tab #1</span>
                    </div>
                    <div className="space-y-1.5">
                      <div className="h-2 w-3/4 bg-red-200/50 rounded"></div>
                      <div className="h-2 w-1/2 bg-red-200/50 rounded"></div>
                      <div className="text-[10px] text-red-500 font-bold mt-2 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                        34 Repositories (Not cross-linked)
                      </div>
                    </div>
                  </div>

                  {/* Card 2: Leetcode */}
                  <div className="border border-red-100 bg-red-50/30 rounded-2xl p-4 relative group hover:border-red-200 transition-all">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-amber-500 flex items-center justify-center text-white">
                          <Code className="w-4.5 h-4.5" />
                        </div>
                        <span className="text-xs font-bold text-[#374151]">LeetCode</span>
                      </div>
                      <span className="px-2 py-0.5 text-[8px] font-bold rounded-full bg-red-100 text-red-600">Tab #2</span>
                    </div>
                    <div className="space-y-1.5">
                      <div className="h-2 w-2/3 bg-red-200/50 rounded"></div>
                      <div className="h-2 w-1/3 bg-red-200/50 rounded"></div>
                      <div className="text-[10px] text-red-500 font-bold mt-2 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                        Top 5% (Isolated rank metrics)
                      </div>
                    </div>
                  </div>

                  {/* Card 3: Kaggle */}
                  <div className="border border-red-100 bg-red-50/30 rounded-2xl p-4 relative group hover:border-red-200 transition-all">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-sky-400 flex items-center justify-center text-white">
                          <Database className="w-4.5 h-4.5" />
                        </div>
                        <span className="text-xs font-bold text-[#374151]">Kaggle</span>
                      </div>
                      <span className="px-2 py-0.5 text-[8px] font-bold rounded-full bg-red-100 text-red-600">Tab #3</span>
                    </div>
                    <div className="space-y-1.5">
                      <div className="h-2 w-5/6 bg-red-200/50 rounded"></div>
                      <div className="h-2 w-1/2 bg-red-200/50 rounded"></div>
                      <div className="text-[10px] text-red-500 font-bold mt-2 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                        2 Notebooks (Hidden from managers)
                      </div>
                    </div>
                  </div>

                  {/* Card 4: Resume */}
                  <div className="border border-red-100 bg-red-50/30 rounded-2xl p-4 relative group hover:border-red-200 transition-all">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-gray-500 flex items-center justify-center text-white">
                          <Globe className="w-4.5 h-4.5" />
                        </div>
                        <span className="text-xs font-bold text-[#374151]">Static PDF Resume</span>
                      </div>
                      <span className="px-2 py-0.5 text-[8px] font-bold rounded-full bg-red-100 text-red-600">Tab #4</span>
                    </div>
                    <div className="space-y-1.5">
                      <div className="h-2 w-4/5 bg-red-200/50 rounded"></div>
                      <div className="h-2 w-3/5 bg-red-200/50 rounded"></div>
                      <div className="text-[10px] text-red-500 font-bold mt-2 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                        Outdated project links (404 errors)
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* 4. The Solution / How It Works */}
        <motion.section 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="max-w-7xl mx-auto px-6 py-28 border-t border-[#E5E9F0] text-center space-y-16"
        >
          <div className="max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200/60 shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
              <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">How it works</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-black text-[#111827] tracking-tight">Three steps to a unified developer identity.</h2>
            <p className="text-sm text-[#4B5563] font-medium max-w-xl mx-auto">
              Our automated crawlers sync your engineering contributions directly, formatting everything into an interactive resume.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left relative">
            <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-200 via-indigo-200 to-emerald-200 -translate-y-12 -z-10"></div>
            
            {[
              { 
                step: '01', 
                title: 'Connect Accounts', 
                desc: 'Securely link handles for GitHub, LeetCode, Codeforces, and Kaggle.',
                color: 'from-purple-500 to-indigo-500',
                shadowColor: 'rgba(124, 58, 237, 0.15)'
              },
              { 
                step: '02', 
                title: 'Normalize Data', 
                desc: 'Our sync crawlers normalize commits, solves, and notebooks.',
                color: 'from-indigo-500 to-blue-500',
                shadowColor: 'rgba(99, 102, 241, 0.15)'
              },
              { 
                step: '03', 
                title: 'Present Profile', 
                desc: 'Export or share one unified, high-integrity dashboard page.',
                color: 'from-emerald-500 to-teal-500',
                shadowColor: 'rgba(16, 185, 129, 0.15)'
              },
            ].map((item, idx) => (
              <div 
                key={idx} 
                className="bg-white border border-[#E5E9F0] rounded-[28px] p-8 shadow-md hover:shadow-xl transition-all duration-300 relative group flex flex-col justify-between h-[240px] hover:-translate-y-1"
              >
                <div>
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white text-lg font-black shadow-lg`} style={{ boxShadow: `0 8px 20px ${item.shadowColor}` }}>
                    {item.step}
                  </div>
                  <h3 className="text-base font-bold text-[#111827] mt-6 group-hover:text-[#7C3AED] transition-colors">{item.title}</h3>
                  <p className="text-xs text-[#6B7280] font-semibold leading-relaxed mt-2">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* 5. Supported Sources */}
        <motion.section 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="max-w-7xl mx-auto px-6 py-28 border-t border-[#E5E9F0] text-center space-y-16"
        >
          <div className="max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/60 shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Integrations</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-black text-[#111827] tracking-tight">Full ecosystem support.</h2>
            <p className="text-sm text-[#4B5563] font-medium max-w-lg mx-auto">
              Sync credentials and automatically build dynamic widgets for every source you link.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { 
                name: 'GitHub Repos', 
                icon: Github, 
                color: 'bg-slate-900 text-white',
                desc: 'Pull contributions, repositories, stars, and language distribution metrics.',
                stats: 'Real-time Webhooks' 
              },
              { 
                name: 'LeetCode Solves', 
                icon: Code, 
                color: 'bg-amber-500 text-white',
                desc: 'Track global ranks, difficulties solved, and monthly streak counts.',
                stats: 'API Sync' 
              },
              { 
                name: 'Codeforces Rank', 
                icon: Terminal, 
                color: 'bg-sky-500 text-white',
                desc: 'Display contest ratings, performance graphs, and contest histories.',
                stats: 'Crawler Sync' 
              },
              { 
                name: 'Kaggle Notebooks', 
                icon: Database, 
                color: 'bg-sky-400 text-white',
                desc: 'Normalize notebooks, dataset contributions, and competition rankings.',
                stats: 'GraphQL API' 
              }
            ].map((src, idx) => {
              const Icon = src.icon;
              return (
                <div 
                  key={idx} 
                  className="flex flex-col justify-between p-6 rounded-[28px] border border-[#E5E9F0] bg-white text-left hover:border-[#7C3AED] hover:shadow-lg transition-all duration-300 group hover:-translate-y-1"
                >
                  <div>
                    <div className={`w-10 h-10 rounded-xl ${src.color} flex items-center justify-center shadow-md mb-6`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-sm font-bold text-[#111827] group-hover:text-[#7C3AED] transition-colors">{src.name}</h3>
                    <p className="text-[11px] text-[#6B7280] font-semibold leading-relaxed mt-2">{src.desc}</p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-[#F3F4F6] flex justify-between items-center">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">{src.stats}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.section>

        {/* 6. CTA (Call to Action) */}
        <motion.section 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="max-w-7xl mx-auto px-6 py-28 border-t border-[#E5E9F0] text-center"
        >
          <div className="bg-gradient-to-br from-[#7C3AED] to-[#6366F1] text-white rounded-[40px] p-12 md:p-16 shadow-2xl relative overflow-hidden max-w-5xl mx-auto group">
            {/* Overlay grid and glow effect */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none"></div>
            <div className="absolute -top-24 -right-24 w-72 h-72 bg-[radial-gradient(circle,rgba(255,255,255,0.15)_0%,transparent_70%)] rounded-full transition-all duration-700 pointer-events-none transform-gpu"></div>
            <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-[radial-gradient(circle,rgba(99,102,241,0.35)_0%,transparent_70%)] rounded-full transition-all duration-700 pointer-events-none transform-gpu"></div>

            <div className="relative z-10 max-w-2xl mx-auto space-y-6">
              <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">Ready to showcase your true potential?</h2>
              <p className="text-sm font-medium text-purple-100 leading-relaxed max-w-lg mx-auto">
                Create your account in 30 seconds. Link your first platform source, normalize your projects, and share your verification link instantly.
              </p>
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
                <button 
                  onClick={() => setAuthView('signup')}
                  className="w-full sm:w-auto px-8 py-4 bg-white text-[#7C3AED] hover:text-[#6D28D9] font-bold text-sm rounded-2xl shadow-xl transition-all cursor-pointer"
                >
                  Get Started Free
                </button>
                <button 
                  onClick={() => setAuthView('login')}
                  className="w-full sm:w-auto px-8 py-4 bg-transparent border border-white/30 text-white hover:bg-white/10 font-bold text-sm rounded-2xl shadow-sm transition-all cursor-pointer"
                >
                  Explore Dashboard Demo
                </button>
              </div>
            </div>
          </div>
        </motion.section>

        {/* 7. Footer */}
        <motion.footer 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-7xl mx-auto px-6 py-8 border-t border-[#E5E9F0] text-center relative z-10 text-xs text-[#9CA3AF] font-semibold flex flex-col sm:flex-row justify-between items-center gap-4"
        >
          <span>© 2026 CareerOS Unified Developer Profile Platform. Built for presentation.</span>
          <div className="flex gap-4">
            <span className="hover:text-[#4B5563] cursor-pointer">Terms of Service</span>
            <span className="hover:text-[#4B5563] cursor-pointer">Privacy Policy</span>
          </div>
        </motion.footer>

      </>
    </div>
  );
}

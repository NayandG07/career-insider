import React, { useState, useEffect } from 'react';
import { motion, useScroll, useMotionValueEvent } from 'motion/react';
import { 
  ArrowRight, 
  Code, 
  Github, 
  Terminal, 
  Globe,
  FolderGit2,
  FileText,
  CheckCircle2,
  Layers,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  TrendingUp,
  Activity,
  Menu,
  X
} from 'lucide-react';

function Typewriter({ phrases, speed = 70, delay = 2200 }) {
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
      <span className="ml-1 inline-block w-[2.5px] h-[0.85em] bg-[#7C3AED] animate-pulse align-middle" />
    </span>
  );
}

const TYPEWRITER_PHRASES = [
  'in one unified profile.',
  'synced in real time.',
  'verified from source.',
  'ready to showcase.'
];

function LandingNavbar({ setAuthView }) {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useMotionValueEvent(scrollY, 'change', (latest) => {
    setScrolled(latest > 20);
  });

  const scrollToSection = (id) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 pointer-events-none p-3 sm:p-4 flex justify-center">
      <motion.div 
        layout
        transition={{ type: 'spring', stiffness: 320, damping: 28 }}
        className={`pointer-events-auto transition-colors duration-300 border ${
          scrolled 
            ? 'w-full max-w-5xl rounded-full bg-white/95 backdrop-blur-md border-[#E2E8F0] shadow-md py-2.5 px-5 sm:px-6' 
            : 'w-full max-w-[1400px] rounded-full bg-transparent border-transparent shadow-none py-3 px-6 sm:px-10'
        } flex items-center justify-between`}
      >
        
        {/* Left: Brand Identity with Squircle Icon Badge */}
        <div 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="flex items-center gap-2.5 cursor-pointer group select-none shrink-0"
        >
          <div className="w-8 h-8 rounded-xl bg-[#1E293B] flex items-center justify-center text-white shadow-xs group-hover:bg-[#7C3AED] transition-colors">
            <Activity className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm sm:text-base font-black tracking-tight text-[#111827]">
            Career<span className="text-[#7C3AED]">OS</span>
          </span>
        </div>

        {/* Center: Navigation Links in Clean Uppercase Typography */}
        <nav className="hidden md:flex items-center gap-8 text-[11px] font-extrabold uppercase tracking-widest text-[#64748B]">
          <button 
            onClick={() => scrollToSection('features')}
            className="hover:text-[#1E293B] transition-colors cursor-pointer"
          >
            SOURCES
          </button>
          <button 
            onClick={() => scrollToSection('methodology')}
            className="hover:text-[#1E293B] transition-colors cursor-pointer"
          >
            HOW IT WORKS
          </button>
          <button 
            onClick={() => scrollToSection('about')}
            className="hover:text-[#1E293B] transition-colors cursor-pointer"
          >
            ABOUT
          </button>
        </nav>

        {/* Right: Action CTA Button */}
        <div className="hidden sm:flex items-center gap-3 shrink-0">
          <button
            onClick={() => setAuthView?.('signup')}
            className="px-4 py-2 bg-[#1E293B] hover:bg-[#0F172A] text-white text-xs font-bold rounded-full transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
          >
            <span>Get Started</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="sm:hidden p-1.5 text-gray-700 hover:text-gray-900 rounded-lg"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </motion.div>

      {/* Mobile Dropdown Drawer */}
      {mobileMenuOpen && (
        <div className="sm:hidden mt-2 max-w-5xl mx-auto rounded-2xl bg-white border border-[#E2E8F0] shadow-lg p-4 space-y-3 pointer-events-auto text-xs font-bold text-[#475569]">
          <button 
            onClick={() => scrollToSection('features')}
            className="block w-full text-left py-2 px-3 rounded-lg hover:bg-slate-50 uppercase tracking-wider text-[11px]"
          >
            SOURCES
          </button>
          <button 
            onClick={() => scrollToSection('methodology')}
            className="block w-full text-left py-2 px-3 rounded-lg hover:bg-slate-50 uppercase tracking-wider text-[11px]"
          >
            HOW IT WORKS
          </button>
          <button 
            onClick={() => scrollToSection('about')}
            className="block w-full text-left py-2 px-3 rounded-lg hover:bg-slate-50 uppercase tracking-wider text-[11px]"
          >
            ABOUT
          </button>
          <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
            <button
              onClick={() => { setMobileMenuOpen(false); setAuthView?.('signup'); }}
              className="w-full py-2.5 bg-[#1E293B] text-white font-bold rounded-full text-center flex items-center justify-center gap-1.5"
            >
              <span>Get Started</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

export default function Landing({ setAuthView }) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-[#111827] relative selection:bg-purple-100 selection:text-[#7C3AED] overflow-hidden flex flex-col justify-between">
      
      <LandingNavbar setAuthView={setAuthView} />

      {/* Subtle Background Glows (contained & lightweight) */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-[radial-gradient(ellipse_at_center,rgba(124,58,237,0.04)_0%,transparent_70%)] rounded-full -z-10 pointer-events-none transform-gpu" />
      <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.03)_0%,transparent_70%)] rounded-full -z-10 pointer-events-none transform-gpu" />

      <main className="flex-1 w-full">
        
        {/* 1. HERO SECTION (Full First Screen View) */}
        <section className="min-h-screen flex flex-col justify-center items-center relative pt-16 pb-8">
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="max-w-6xl mx-auto px-6 text-center my-auto w-full"
          >
            <div className="max-w-4xl mx-auto space-y-6">
              
              <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#E5E9F0] shadow-xs">
                <span className="w-2 h-2 rounded-full bg-[#7C3AED]" />
                <span className="text-xs font-semibold text-[#4B5563]">Unified Developer Profile</span>
              </motion.div>

              <motion.h1 
                variants={itemVariants}
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[1.15] text-[#111827]"
              >
                <span className="inline-block sm:whitespace-nowrap">Your entire engineering identity</span> <br />
                <span className="block text-[#7C3AED] min-h-[1.25em] mt-1 sm:mt-2">
                  <Typewriter phrases={TYPEWRITER_PHRASES} />
                </span>
              </motion.h1>

              <motion.p 
                variants={itemVariants}
                className="text-base sm:text-lg text-[#4B5563] font-normal leading-relaxed max-w-2xl mx-auto"
              >
                Bring your GitHub repositories, LeetCode solves, Codeforces contest rankings, and project portfolio into a single, cohesive developer profile.
              </motion.p>

              <motion.div 
                variants={itemVariants}
                className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2"
              >
                <button 
                  onClick={() => setAuthView('signup')}
                  className="w-full sm:w-auto px-7 py-3.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-sm font-semibold rounded-xl shadow-md shadow-purple-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
                >
                  Create Your Account
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => {
                    const el = document.getElementById('methodology') || document.getElementById('features');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="w-full sm:w-auto px-6 py-3.5 bg-white hover:bg-slate-50 text-[#374151] border border-[#E5E9F0] text-sm font-semibold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
                >
                  Learn More
                </button>
              </motion.div>

              <motion.p variants={itemVariants} className="text-xs text-[#9CA3AF] font-medium pt-1">
                No credit card required • Connect your handles in seconds
              </motion.p>

            </div>
          </motion.div>
        </section>

        {/* 2. THE PROBLEM (WHY IT MATTERS) */}
        <section id="methodology" className="py-16 md:py-24 border-t border-[#E5E9F0]/80 bg-white scroll-mt-24">
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              
              <div className="lg:col-span-5 space-y-5">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200/80">
                  <span className="text-[11px] font-semibold text-slate-700 uppercase tracking-wide">The Challenge</span>
                </div>
                
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#111827] tracking-tight leading-tight">
                  Your developer proof is scattered across too many links.
                </h2>
                
                <p className="text-sm sm:text-base text-[#4B5563] leading-relaxed">
                  Evaluating a developer shouldn't require opening half a dozen browser tabs. When your code lives on GitHub, problem solving on LeetCode, contest ratings on Codeforces, and web demos across different hosts, key achievements get missed.
                </p>

                <div className="pt-2 space-y-3">
                  <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/60">
                    <div className="w-5 h-5 rounded-md bg-purple-100 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-[#7C3AED]">1</span>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#111827]">Fragmented Profiles</h4>
                      <p className="text-xs text-[#6B7280] mt-0.5">Recruiters rarely spend the time to navigate 5 separate URLs to assemble your skill story.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/60">
                    <div className="w-5 h-5 rounded-md bg-purple-100 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-[#7C3AED]">2</span>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#111827]">No Unified Skill Picture</h4>
                      <p className="text-xs text-[#6B7280] mt-0.5">Algorithmic strength and production code commits remain isolated rather than reinforcing each other.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Visual Demonstration: Scattered vs Unified */}
              <div className="lg:col-span-7">
                <div className="bg-[#F8FAFC] border border-[#E5E9F0] rounded-2xl p-5 sm:p-6 shadow-xs">
                  
                  <div className="flex items-center justify-between pb-4 border-b border-[#E5E9F0]">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                      <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                      <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                    </div>
                    <span className="text-xs font-semibold text-[#6B7280]">CareerOS Unified Aggregator</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-5">
                    
                    <div className="bg-white border border-[#E5E9F0] rounded-xl p-4 shadow-xs">
                      <div className="flex items-center gap-2.5 mb-2.5">
                        <div className="w-7 h-7 rounded-lg bg-slate-900 flex items-center justify-center text-white">
                          <Github className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[#111827]">GitHub</p>
                          <p className="text-[10px] text-[#6B7280]">Repos, commits & languages</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-[11px] font-medium pt-2 border-t border-slate-100 text-[#4B5563]">
                        <span>Tracked repositories</span>
                        <span className="font-bold text-[#111827]">Synced</span>
                      </div>
                    </div>

                    <div className="bg-white border border-[#E5E9F0] rounded-xl p-4 shadow-xs">
                      <div className="flex items-center gap-2.5 mb-2.5">
                        <div className="w-7 h-7 rounded-lg bg-amber-500 flex items-center justify-center text-white">
                          <Code className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[#111827]">LeetCode</p>
                          <p className="text-[10px] text-[#6B7280]">Problem breakdown & ranking</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-[11px] font-medium pt-2 border-t border-slate-100 text-[#4B5563]">
                        <span>Solves by difficulty</span>
                        <span className="font-bold text-[#111827]">Synced</span>
                      </div>
                    </div>

                    <div className="bg-white border border-[#E5E9F0] rounded-xl p-4 shadow-xs">
                      <div className="flex items-center gap-2.5 mb-2.5">
                        <div className="w-7 h-7 rounded-lg bg-sky-500 flex items-center justify-center text-white">
                          <Terminal className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[#111827]">Codeforces</p>
                          <p className="text-[10px] text-[#6B7280]">Contest ratings & tier</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-[11px] font-medium pt-2 border-t border-slate-100 text-[#4B5563]">
                        <span>Contest history</span>
                        <span className="font-bold text-[#111827]">Synced</span>
                      </div>
                    </div>

                    <div className="bg-white border border-[#E5E9F0] rounded-xl p-4 shadow-xs">
                      <div className="flex items-center gap-2.5 mb-2.5">
                        <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
                          <FolderGit2 className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[#111827]">Projects & Resume</p>
                          <p className="text-[10px] text-[#6B7280]">Featured builds & skills</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-[11px] font-medium pt-2 border-t border-slate-100 text-[#4B5563]">
                        <span>Interactive showcase</span>
                        <span className="font-bold text-[#111827]">Ready</span>
                      </div>
                    </div>

                  </div>

                  <div className="mt-4 p-3 rounded-xl bg-purple-50/70 border border-purple-100/80 flex items-center justify-between text-xs text-[#7C3AED] font-semibold">
                    <span className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#7C3AED]" />
                      All sources normalized into one shareable profile
                    </span>
                    <span className="font-bold text-[11px] bg-white px-2.5 py-1 rounded-md border border-purple-200">1 Clean URL</span>
                  </div>

                </div>
              </div>

            </div>
          </div>
        </section>

        {/* 3. SUPPORTED SOURCES / PLATFORMS */}
        <section id="features" className="py-16 md:py-24 border-t border-[#E5E9F0]/80 scroll-mt-24">
          <div className="max-w-6xl mx-auto px-6 space-y-12">
            
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 border border-purple-100">
                <span className="text-[11px] font-semibold text-[#7C3AED] uppercase tracking-wide">Supported Sources</span>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#111827] tracking-tight">
                Connect the platforms you build and solve on.
              </h2>
              <p className="text-sm sm:text-base text-[#4B5563]">
                Link your handles once and let CareerOS organize your achievements automatically.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              
              <div className="p-5 rounded-2xl border border-[#E5E9F0] bg-white hover:border-purple-200 hover:shadow-sm transition-all duration-200 flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center mb-4">
                    <Github className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-[#111827]">GitHub</h3>
                  <p className="text-xs text-[#6B7280] mt-1.5 leading-relaxed">
                    Pulls your public repositories, star counts, commit activity, and dominant programming languages.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-slate-500">
                  <span>API Integration</span>
                  <span className="text-emerald-600 font-bold">Auto-sync</span>
                </div>
              </div>

              <div className="p-5 rounded-2xl border border-[#E5E9F0] bg-white hover:border-purple-200 hover:shadow-sm transition-all duration-200 flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center mb-4">
                    <Code className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-[#111827]">LeetCode</h3>
                  <p className="text-xs text-[#6B7280] mt-1.5 leading-relaxed">
                    Tracks solved problem counts by difficulty (Easy, Medium, Hard), acceptance rate, and profile ranking.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-slate-500">
                  <span>GraphQL Sync</span>
                  <span className="text-emerald-600 font-bold">Auto-sync</span>
                </div>
              </div>

              <div className="p-5 rounded-2xl border border-[#E5E9F0] bg-white hover:border-purple-200 hover:shadow-sm transition-all duration-200 flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-sky-500 text-white flex items-center justify-center mb-4">
                    <Terminal className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-[#111827]">Codeforces</h3>
                  <p className="text-xs text-[#6B7280] mt-1.5 leading-relaxed">
                    Fetches contest rating history, max rank title, and competitive problem solve statistics.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-slate-500">
                  <span>Official API</span>
                  <span className="text-emerald-600 font-bold">Auto-sync</span>
                </div>
              </div>

              <div className="p-5 rounded-2xl border border-[#E5E9F0] bg-white hover:border-purple-200 hover:shadow-sm transition-all duration-200 flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center mb-4">
                    <FolderGit2 className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-[#111827]">Projects & Resume</h3>
                  <p className="text-xs text-[#6B7280] mt-1.5 leading-relaxed">
                    Showcase key full-stack projects, architecture notes, tech stacks, and extracted resume skills.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-slate-500">
                  <span>Custom Hub</span>
                  <span className="text-emerald-600 font-bold">Showcase</span>
                </div>
              </div>

            </div>

          </div>
        </section>

        {/* 4. HOW IT WORKS (SIMPLE 3-STEP PIPELINE) */}
        <section className="py-16 md:py-24 border-t border-[#E5E9F0]/80 bg-white">
          <div className="max-w-6xl mx-auto px-6 space-y-12">
            
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200/80">
                <span className="text-[11px] font-semibold text-slate-700 uppercase tracking-wide">How It Works</span>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#111827] tracking-tight">
                From scattered profiles to a unified presence.
              </h2>
              <p className="text-sm sm:text-base text-[#4B5563]">
                Simple steps to organize your technical footprint.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <div className="p-6 rounded-2xl border border-[#E5E9F0] bg-[#F8FAFC] space-y-4">
                <div className="w-8 h-8 rounded-lg bg-white border border-[#E5E9F0] flex items-center justify-center font-bold text-xs text-[#7C3AED] shadow-xs">
                  01
                </div>
                <h3 className="text-base font-bold text-[#111827]">Connect Handles</h3>
                <p className="text-xs text-[#6B7280] leading-relaxed">
                  Enter your handles for GitHub, LeetCode, and Codeforces in Settings. No complex setup or oauth loops required.
                </p>
              </div>

              <div className="p-6 rounded-2xl border border-[#E5E9F0] bg-[#F8FAFC] space-y-4">
                <div className="w-8 h-8 rounded-lg bg-white border border-[#E5E9F0] flex items-center justify-center font-bold text-xs text-[#7C3AED] shadow-xs">
                  02
                </div>
                <h3 className="text-base font-bold text-[#111827]">Aggregate & Verify</h3>
                <p className="text-xs text-[#6B7280] leading-relaxed">
                  CareerOS fetches your verified statistics, summarizes your core languages, and organizes your project list.
                </p>
              </div>

              <div className="p-6 rounded-2xl border border-[#E5E9F0] bg-[#F8FAFC] space-y-4">
                <div className="w-8 h-8 rounded-lg bg-white border border-[#E5E9F0] flex items-center justify-center font-bold text-xs text-[#7C3AED] shadow-xs">
                  03
                </div>
                <h3 className="text-base font-bold text-[#111827]">Share & Explore</h3>
                <p className="text-xs text-[#6B7280] leading-relaxed">
                  Export or share your unified developer profile, review skill breakdowns, and explore matching companies.
                </p>
              </div>

            </div>

          </div>
        </section>

        {/* 5. CALL TO ACTION */}
        <section className="py-16 md:py-24 border-t border-[#E5E9F0]/80">
          <div className="max-w-6xl mx-auto px-6">
            <div className="bg-[#7C3AED] text-white rounded-3xl p-8 sm:p-12 text-center shadow-lg relative overflow-hidden">
              <div className="max-w-xl mx-auto space-y-5 relative z-10">
                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                  Ready to unify your developer story?
                </h2>
                <p className="text-sm sm:text-base text-purple-100 leading-relaxed">
                  Connect your accounts in under two minutes and showcase everything you have built in one clean link.
                </p>
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button 
                    onClick={() => setAuthView('signup')}
                    className="w-full sm:w-auto px-7 py-3.5 bg-white text-[#7C3AED] hover:bg-slate-50 font-bold text-sm rounded-xl shadow-md transition-all cursor-pointer active:scale-[0.98]"
                  >
                    Get Started Free
                  </button>
                  <button 
                    onClick={() => setAuthView('login')}
                    className="w-full sm:w-auto px-6 py-3.5 bg-[#6D28D9] hover:bg-[#5B21B6] text-white font-semibold text-sm rounded-xl transition-all cursor-pointer active:scale-[0.98]"
                  >
                    Sign In
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* 6. FOOTER */}
      <footer id="about" className="w-full border-t border-[#E5E9F0] bg-white scroll-mt-24">
        <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-[#6B7280]">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-purple-100 flex items-center justify-center text-[#7C3AED]">
              <Terminal className="w-3 h-3" />
            </div>
            <span className="font-semibold text-[#111827]">CareerOS</span>
            <span className="text-[#9CA3AF]">•</span>
            <span>Unified Developer Profile Platform</span>
          </div>
          <p className="text-xs text-[#9CA3AF]">
            © {new Date().getFullYear()} CareerOS. Built for presentation.
          </p>
        </div>
      </footer>

    </div>
  );
}


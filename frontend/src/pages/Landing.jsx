import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Code, Target, CheckCircle2, Shield, Brain } from 'lucide-react';

export default function Landing({ setAuthView }) {
  return (
    <div className="min-h-screen bg-[#F6F8FC] font-sans text-[#111827] overflow-x-hidden relative selection:bg-[#7C3AED]/20">
      
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-bl from-[#7C3AED]/5 via-[#6366F1]/5 to-transparent rounded-full blur-[100px] -z-10 translate-x-1/3 -translate-y-1/3 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-[#10B981]/5 via-[#34D399]/5 to-transparent rounded-full blur-[80px] -z-10 -translate-x-1/3 translate-y-1/3 pointer-events-none"></div>

      {/* Navbar */}
      <nav className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#6366F1] flex items-center justify-center shadow-lg shadow-purple-500/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-black tracking-tight text-[#111827]">CareerOS</span>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setAuthView('login')}
            className="text-sm font-bold text-[#4B5563] hover:text-[#111827] transition-colors"
          >
            Sign In
          </button>
          <button 
            onClick={() => setAuthView('signup')}
            className="px-5 py-2.5 bg-[#111827] hover:bg-[#1F2937] text-white text-sm font-bold rounded-xl shadow-md transition-all flex items-center gap-2"
          >
            Get Started
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 pt-24 pb-32 relative z-10">
        <div className="text-center max-w-4xl mx-auto space-y-8">
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#E5E9F0] shadow-sm"
          >
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></span>
            <span className="text-xs font-bold text-[#4B5563] tracking-wide uppercase">AI-Powered Career OS 2.0</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-6xl md:text-7xl font-black tracking-tight leading-[1.1] text-[#111827]"
          >
            Engineer your career <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7C3AED] to-[#6366F1]">
              with precision AI.
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-[#4B5563] font-medium leading-relaxed max-w-2xl mx-auto"
          >
            Connect your GitHub and LeetCode. Let our neural engine map your skills, generate highly targeted learning roadmaps, and instantly match you with tier-1 tech companies.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
          >
            <button 
              onClick={() => setAuthView('signup')}
              className="w-full sm:w-auto px-8 py-4 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-base font-bold rounded-2xl shadow-xl shadow-purple-500/20 transition-all flex items-center justify-center gap-2"
            >
              Start Free Trial
              <ArrowRight className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setAuthView('login')}
              className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-[#F9FAFB] text-[#111827] border border-[#E5E9F0] text-base font-bold rounded-2xl shadow-sm transition-all flex items-center justify-center gap-2"
            >
              <Code className="w-5 h-5 text-[#6366F1]" />
              View Demo Dashboard
            </button>
          </motion.div>
        </div>

        {/* Feature Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.7 }}
          className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          <div className="bg-white p-8 rounded-3xl border border-[#E5E9F0] shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center mb-6">
              <Brain className="w-6 h-6 text-[#7C3AED]" />
            </div>
            <h3 className="text-xl font-bold text-[#111827] mb-3">AI Skill Intelligence</h3>
            <p className="text-sm text-[#4B5563] font-medium leading-relaxed">
              We ingest your commits, pull requests, and algorithm submissions to continuously update a precise matrix of your engineering capabilities.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-[#E5E9F0] shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-emerald-100/50 to-transparent rounded-bl-full"></div>
            <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6 relative z-10">
              <Target className="w-6 h-6 text-[#10B981]" />
            </div>
            <h3 className="text-xl font-bold text-[#111827] mb-3 relative z-10">Dynamic Roadmaps</h3>
            <p className="text-sm text-[#4B5563] font-medium leading-relaxed relative z-10">
              Pick your target role. Our AI analyzes the delta between your current skills and the role requirements, building a step-by-step curriculum.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-[#E5E9F0] shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6">
              <Shield className="w-6 h-6 text-[#6366F1]" />
            </div>
            <h3 className="text-xl font-bold text-[#111827] mb-3">Company Matching</h3>
            <p className="text-sm text-[#4B5563] font-medium leading-relaxed">
              We cross-reference your skill vectors with active hiring profiles at tier-1 tech companies to prioritize your strongest opportunities.
            </p>
          </div>
        </motion.div>
      </main>

    </div>
  );
}

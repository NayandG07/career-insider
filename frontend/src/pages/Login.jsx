import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, ArrowRight, ArrowLeft, Mail, Lock, User, Github, Sparkles, Shield, Share2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';

export default function Login({ view, setAuthView }) {
  const { login, register } = useApp();
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const isLogin = view === 'login';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
        showToast('Signed in successfully.', 'success');
      } else {
        if (!name) {
          showToast('Please enter your full name.', 'error');
          setLoading(false);
          return;
        }
        await register(name, email, password);
        showToast('Account created successfully.', 'success');
      }
    } catch (err) {
      console.error(err);
      const serverMsg = err.response?.data?.error;
      if (isLogin) {
        showToast(serverMsg || 'Invalid email or password.', 'error');
      } else {
        showToast(serverMsg || 'Unable to create your account. Please try again.', 'error');
      }
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F8FC] flex flex-col lg:flex-row relative overflow-hidden font-sans">

      {/* Left Side: Brand & Value Prop Showcase (visible on desktop) */}
      <div className="hidden lg:flex lg:w-[45%] bg-[#0F172A] relative overflow-hidden p-16 flex-col justify-between text-white shrink-0 border-r border-[#1E293B]">
        {/* Ambient grid overlay & glows */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none"></div>
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-gradient-to-tr from-[#7C3AED]/20 to-transparent rounded-full blur-[100px] pointer-events-none -z-10"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-gradient-to-tr from-[#6366F1]/10 to-transparent rounded-full blur-[120px] pointer-events-none -z-10"></div>

        {/* Logo Brand */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#6366F1] flex items-center justify-center shadow-lg shadow-purple-500/30">
            <Terminal className="w-4.5 h-4.5 text-white" />
          </div>
          <span className="text-lg font-black tracking-tight text-white">CareerOS</span>
        </div>

        {/* Content */}
        <div className="space-y-8 my-auto relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50/10 border border-indigo-500/30 shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
            <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider">Developer Identity</span>
          </div>
          <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-white">
            Your entire engineering identity <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">in one single place.</span>
          </h1>
          <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-sm">
            Connect profiles across GitHub, LeetCode, Kaggle, and personal websites into a high-integrity developer page.
          </p>

          <div className="space-y-4 pt-6">
            {[
              {
                title: 'Zero Manual Entry',
                desc: 'Sync and format commits, solving metrics, and project logs automatically.',
                icon: Sparkles,
                gradient: 'from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/30'
              },
              {
                title: 'API Verified',
                desc: 'All platform ranks and stats are fetched and verified directly from source.',
                icon: Shield,
                gradient: 'from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30'
              },
              {
                title: 'Beautiful Page Share',
                desc: 'Export a professional, high-integrity dashboard page instantly.',
                icon: Share2,
                gradient: 'from-blue-500/20 to-indigo-500/20 text-blue-400 border-blue-500/30'
              }
            ].map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <motion.div
                  key={idx}
                  whileHover={{ y: -2, backgroundColor: 'rgba(30, 41, 59, 0.6)' }}
                  className="bg-[#1E293B]/40 border border-[#334155]/40 rounded-2xl p-4 flex gap-4 items-start shadow-sm transition-all duration-300"
                >
                  <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${feat.gradient} border flex items-center justify-center shrink-0`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-100">{feat.title}</h4>
                    <p className="text-[11px] text-slate-400 leading-relaxed mt-1">{feat.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="text-[10px] text-slate-500 relative z-10 font-bold uppercase tracking-wider">
          © 2026 CareerOS Platform. Built for Developers.
        </div>
      </div>

      {/* Right Side: Centered Forms Container */}
      <div className="flex-grow flex items-center justify-center p-8 relative overflow-y-auto min-h-screen">

        {/* Glow Element for Mobile */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-[#7C3AED]/5 to-[#10B981]/5 rounded-full blur-[100px] pointer-events-none lg:hidden -z-10"></div>

        {/* Back Button */}
        <motion.button
          onClick={() => setAuthView('landing')}
          whileHover={{ x: -4 }}
          className="absolute top-8 left-8 lg:left-12 flex items-center gap-2 px-4 py-2 bg-white border border-[#E5E9F0] hover:border-slate-300 rounded-xl text-xs font-bold text-[#6B7280] hover:text-[#111827] transition-all shadow-xs cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Home
        </motion.button>

        {/* Card Form Container — stable key so it never remounts between login/signup switches */}
        <div className="w-full max-w-[440px] bg-white border border-[#E5E9F0] rounded-[32px] p-8 md:p-10 shadow-xl shadow-purple-500/5 relative z-10 hover:shadow-2xl hover:shadow-purple-500/10 transition-shadow duration-500">

          {/* Segmented Pill Tabs to Switch Between Sign In / Create Account */}
          <div className="flex bg-[#F1F5F9] p-1 rounded-2xl mb-8 border border-[#E2E8F0]">
            <button
              type="button"
              onClick={() => setAuthView('login')}
              className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer ${
                isLogin
                  ? 'bg-white text-[#111827] shadow-sm font-extrabold border border-[#E2E8F0]/30'
                  : 'text-[#64748B] hover:text-[#111827]'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setAuthView('signup')}
              className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer ${
                !isLogin
                  ? 'bg-white text-[#111827] shadow-sm font-extrabold border border-[#E2E8F0]/30'
                  : 'text-[#64748B] hover:text-[#111827]'
              }`}
            >
              Create Account
            </button>
          </div>

          <div className="flex flex-col mb-6">
            {/* Logo for mobile */}
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#6366F1] flex lg:hidden items-center justify-center shadow-lg shadow-purple-500/20 mb-6">
              <Terminal className="w-4.5 h-4.5 text-white" />
            </div>

            <h2 className="text-2xl font-black text-[#111827] tracking-tight">
              {isLogin ? 'Welcome back' : 'Create your account'}
            </h2>
            <p className="text-xs font-bold text-[#6B7280] mt-2">
              {isLogin ? 'Enter your credentials to access your dashboard.' : 'Start engineering your career with AI.'}
            </p>
          </div>

          {/* AnimatePresence only wraps the inner form fields — not the outer card.
              This prevents the card from re-running its entry animation on tab switch. */}
          <AnimatePresence mode="wait" initial={false}>
            <motion.form
              key={isLogin ? 'login-form' : 'signup-form'}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              onSubmit={handleSubmit}
              className="flex flex-col justify-between min-h-[290px]"
            >
              {!isLogin ? (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#4B5563] ml-1">Full Name</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Alex Rivera"
                        className="w-full pl-10 pr-4 py-3 bg-[#F9FAFB] border border-[#E5E9F0] rounded-xl text-xs font-bold text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED] transition-all placeholder:text-[#9CA3AF]"
                      />
                      <User className="w-4 h-4 text-[#9CA3AF] absolute left-3.5 top-3.5" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#4B5563] ml-1">Email Address</label>
                    <div className="relative">
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="alex@example.com"
                        className="w-full pl-10 pr-4 py-3 bg-[#F9FAFB] border border-[#E5E9F0] rounded-xl text-xs font-bold text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED] transition-all placeholder:text-[#9CA3AF]"
                      />
                      <Mail className="w-4 h-4 text-[#9CA3AF] absolute left-3.5 top-3.5" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#4B5563] ml-1">Password</label>
                    <div className="relative">
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-4 py-3 bg-[#F9FAFB] border border-[#E5E9F0] rounded-xl text-xs font-bold text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED] transition-all placeholder:text-[#9CA3AF]"
                      />
                      <Lock className="w-4 h-4 text-[#9CA3AF] absolute left-3.5 top-3.5" />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-[224px] flex flex-col justify-center space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#4B5563] ml-1">Email Address</label>
                    <div className="relative">
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="alex@example.com"
                        className="w-full pl-10 pr-4 py-3 bg-[#F9FAFB] border border-[#E5E9F0] rounded-xl text-xs font-bold text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED] transition-all placeholder:text-[#9CA3AF]"
                      />
                      <Mail className="w-4 h-4 text-[#9CA3AF] absolute left-3.5 top-3.5" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center ml-1">
                      <label className="text-xs font-bold text-[#4B5563]">Password</label>
                      <button type="button" className="text-[10px] text-[#7C3AED] hover:underline font-bold">Forgot password?</button>
                    </div>
                    <div className="relative">
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-4 py-3 bg-[#F9FAFB] border border-[#E5E9F0] rounded-xl text-xs font-bold text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED] transition-all placeholder:text-[#9CA3AF]"
                      />
                      <Lock className="w-4 h-4 text-[#9CA3AF] absolute left-3.5 top-3.5" />
                    </div>
                  </div>

                  <div className="flex items-center ml-1 pt-1">
                    <input type="checkbox" id="remember-me" className="w-3.5 h-3.5 rounded text-[#7C3AED] border-[#E5E9F0] focus:ring-[#7C3AED]/20" />
                    <label htmlFor="remember-me" className="text-[11px] font-bold text-[#6B7280] ml-2 cursor-pointer">Keep me signed in</label>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-[#111827] hover:bg-[#1F2937] text-white text-xs font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer mt-4"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    {isLogin ? 'Sign In' : 'Create Account'}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </motion.form>
          </AnimatePresence>

          <div className="mt-6 flex items-center justify-center gap-4">
            <div className="h-px bg-[#E5E9F0] flex-1"></div>
            <span className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider">OR</span>
            <div className="h-px bg-[#E5E9F0] flex-1"></div>
          </div>

          <div className="mt-6 space-y-3">
            {/* Google OAuth — use Vite proxy path, not hardcoded localhost */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="button"
              onClick={() => window.location.href = '/api/auth/google'}
              className="w-full py-3 bg-white hover:bg-[#F9FAFB] border border-[#E5E9F0] text-[#374151] text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </motion.button>

            {/* GitHub OAuth — use Vite proxy path */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="button"
              onClick={() => window.location.href = '/api/auth/github'}
              className="w-full py-3 bg-white hover:bg-[#F9FAFB] border border-[#E5E9F0] text-[#374151] text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <Github className="w-4 h-4" />
              Continue with GitHub
            </motion.button>
          </div>

        </div>
      </div>
    </div>
  );
}

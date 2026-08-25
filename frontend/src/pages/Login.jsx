import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, ArrowLeft, Mail, Lock, User, Github } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Login({ view, setAuthView }) {
  const { login, register } = useApp();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const isLogin = view === 'login';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        if (!name) throw new Error("Name is required");
        await register(name, email, password);
      }
      // AppContext will handle routing upon success (isAuthenticated will become true)
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || err.message || "Authentication failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F8FC] flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-tr from-[#7C3AED]/10 via-transparent to-[#10B981]/10 rounded-full blur-[120px] pointer-events-none -z-10"></div>

      <motion.button 
        onClick={() => setAuthView('landing')}
        whileHover={{ x: -4 }}
        className="absolute top-8 left-8 flex items-center gap-2 text-sm font-bold text-[#6B7280] hover:text-[#111827] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Home
      </motion.button>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-[420px] bg-white rounded-3xl border border-[#E5E9F0] shadow-xl p-8 relative z-10"
      >
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#7C3AED] to-[#6366F1] flex items-center justify-center shadow-lg shadow-purple-500/20 mb-4">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-black text-[#111827]">
            {isLogin ? 'Welcome back' : 'Create your account'}
          </h2>
          <p className="text-sm font-semibold text-[#6B7280] mt-1.5">
            {isLogin ? 'Enter your details to access your dashboard.' : 'Start engineering your career with AI.'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-100 rounded-xl text-xs font-bold text-red-600 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {!isLogin && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#4B5563] ml-1">Full Name</label>
              <div className="relative">
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alex Rivera"
                  className="w-full pl-10 pr-4 py-3 bg-[#F9FAFB] border border-[#E5E9F0] rounded-xl text-sm font-semibold text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED] transition-all placeholder:text-[#9CA3AF]"
                />
                <User className="w-4 h-4 text-[#9CA3AF] absolute left-3.5 top-3.5" />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#4B5563] ml-1">Email Address</label>
            <div className="relative">
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@example.com"
                className="w-full pl-10 pr-4 py-3 bg-[#F9FAFB] border border-[#E5E9F0] rounded-xl text-sm font-semibold text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED] transition-all placeholder:text-[#9CA3AF]"
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
                className="w-full pl-10 pr-4 py-3 bg-[#F9FAFB] border border-[#E5E9F0] rounded-xl text-sm font-semibold text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED] transition-all placeholder:text-[#9CA3AF]"
              />
              <Lock className="w-4 h-4 text-[#9CA3AF] absolute left-3.5 top-3.5" />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3.5 bg-[#111827] hover:bg-[#1F2937] text-white text-sm font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-70"
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
        </form>

        <div className="mt-6 flex items-center justify-center gap-4">
          <div className="h-px bg-[#E5E9F0] flex-1"></div>
          <span className="text-xs font-bold text-[#9CA3AF] uppercase tracking-wider">OR</span>
          <div className="h-px bg-[#E5E9F0] flex-1"></div>
        </div>

        <div className="mt-6 space-y-3">
          {/* Google OAuth */}
          <button 
            type="button"
            onClick={() => window.location.href = 'http://localhost:5000/api/auth/google'}
            className="w-full py-3 bg-white hover:bg-[#F9FAFB] border border-[#E5E9F0] text-[#374151] text-sm font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2.5"
          >
            {/* Google SVG icon */}
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          {/* GitHub OAuth */}
          <button 
            type="button"
            onClick={() => window.location.href = 'http://localhost:5000/api/auth/github'}
            className="w-full py-3 bg-white hover:bg-[#F9FAFB] border border-[#E5E9F0] text-[#374151] text-sm font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2.5"
          >
            <Github className="w-4 h-4" />
            Continue with GitHub
          </button>
        </div>

        <p className="mt-8 text-center text-xs font-semibold text-[#6B7280]">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button 
            onClick={() => setAuthView(isLogin ? 'signup' : 'login')}
            className="text-[#7C3AED] hover:text-[#6D28D9] font-bold"
          >
            {isLogin ? 'Sign up' : 'Sign in'}
          </button>
        </p>

      </motion.div>
    </div>
  );
}

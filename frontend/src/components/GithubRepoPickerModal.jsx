import React, { useState, useEffect } from 'react';
import { 
  Github, 
  Search, 
  X, 
  Check, 
  Lock, 
  Globe, 
  Star, 
  Loader2, 
  AlertCircle,
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { githubService } from '../services/githubService';

export default function GithubRepoPickerModal({ open, onClose, onSelectRepo }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notConnected, setNotConnected] = useState(false);
  const [username, setUsername] = useState('');
  const [repos, setRepos] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedId, setSelectedId] = useState(null);

  const fetchRepos = async () => {
    setLoading(true);
    setError(null);
    setNotConnected(false);
    try {
      const data = await githubService.getRepositories();
      setUsername(data.username || '');
      setRepos(data.repositories || []);
      setSelectedId(null);
    } catch (err) {
      const errMsg = err.response?.data?.error || err.message || 'Failed to load repositories.';
      if (err.response?.data?.connected === false || errMsg.includes('not connected')) {
        setNotConnected(true);
      } else {
        setError(errMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchRepos();
      setSearchTerm('');
      setSelectedId(null);
    }
  }, [open]);

  const filteredRepos = repos.filter((r) => {
    const q = searchTerm.toLowerCase();
    return (
      r.name.toLowerCase().includes(q) ||
      (r.description || '').toLowerCase().includes(q) ||
      (r.primaryLanguage || '').toLowerCase().includes(q)
    );
  });

  const handleSelectAndCustomize = (repo) => {
    if (!repo) return;
    const technologies = repo.primaryLanguage ? [repo.primaryLanguage] : ['GitHub'];
    const prefillData = {
      title: repo.name || '',
      description: repo.description || '',
      problem: repo.description || '',
      solution: 'Engineered repository architecture, modular codebase structure, and continuous deployment.',
      technologies,
      repositoryUrl: repo.repositoryUrl || '',
      liveDemoUrl: repo.liveDemoUrl || '',
      source: 'github',
      githubRepositoryId: repo.githubId,
      primaryLanguage: repo.primaryLanguage || '',
      isPrivate: Boolean(repo.isPrivate),
    };
    onSelectRepo?.(prefillData);
    onClose();
  };

  const handleConnectGithub = () => {
    const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const token = localStorage.getItem('accessToken');
    const url = `${backendUrl}/api/auth/github${token ? `?token=${encodeURIComponent(token)}` : ''}`;
    
    window.open(url, '_blank');

    const handleAuthMessage = async (event) => {
      if (event.data?.type === 'GITHUB_AUTH_SUCCESS') {
        window.removeEventListener('message', handleAuthMessage);
        setNotConnected(false);
        await fetchRepos();
      }
    };
    window.addEventListener('message', handleAuthMessage);
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/40 backdrop-blur-xs"
          onClick={onClose}
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          transition={{ duration: 0.15 }}
          className="relative w-full max-w-2xl bg-white border border-[#E5E9F0] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] z-10 text-left"
        >
          {/* Header */}
          <div className="p-6 border-b border-[#E5E9F0] flex items-center justify-between bg-[#FAFBFC]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#111827] flex items-center justify-center text-white shadow-sm shrink-0">
                <Github className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#111827]">
                  Select Projects from GitHub
                </h3>
                <p className="text-xs text-[#6B7280] font-semibold mt-0.5">
                  {username ? `@${username} • ${repos.length} repositories found` : 'Choose repositories to include in your CareerOS profile'}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg border border-[#E5E9F0] text-[#9CA3AF] hover:text-[#111827] hover:bg-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Not Connected State */}
          {notConnected ? (
            <div className="p-10 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-[#7C3AED] flex items-center justify-center mx-auto">
                <Github className="w-6 h-6" />
              </div>
              <div className="max-w-md mx-auto space-y-1">
                <h4 className="text-sm font-bold text-[#111827]">Connect your GitHub Account</h4>
                <p className="text-xs text-[#6B7280] font-semibold">
                  Authorize CareerOS to fetch your GitHub repositories and include them in your showcase.
                </p>
              </div>
              <button
                type="button"
                onClick={handleConnectGithub}
                className="px-5 py-2.5 bg-[#111827] hover:bg-[#1F2937] text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer inline-flex items-center gap-2"
              >
                <Github className="w-4 h-4" />
                Connect GitHub via OAuth
              </button>
            </div>
          ) : (
            <>
              {/* Search & Actions Bar */}
              <div className="p-4 border-b border-[#E5E9F0] bg-white flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-[#9CA3AF] absolute left-3.5 top-2.5 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search repositories…"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-[#FAFBFC] border border-[#E5E9F0] rounded-xl pl-9 pr-3 py-2 text-xs font-semibold text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/10 focus:border-[#7C3AED]"
                  />
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto text-xs font-semibold">
                  <button
                    type="button"
                    onClick={fetchRepos}
                    className="p-2 border border-[#E5E9F0] rounded-lg text-[#6B7280] hover:bg-[#FAFBFC] cursor-pointer"
                    title="Refresh repositories"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Error Alert */}
              {error && (
                <div className="mx-6 mt-4 p-3.5 bg-red-50 border border-red-100 rounded-xl text-xs font-semibold text-red-600 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                  <span>{error}</span>
                </div>
              )}

              {/* Repo List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
                {loading ? (
                  <div className="py-16 text-center space-y-2">
                    <Loader2 className="w-6 h-6 text-[#7C3AED] animate-spin mx-auto" />
                    <p className="text-xs font-semibold text-[#6B7280]">Fetching GitHub repositories…</p>
                  </div>
                ) : filteredRepos.length === 0 ? (
                  <div className="py-12 text-center text-xs font-semibold text-[#6B7280]">
                    No repositories found matching "{searchTerm}".
                  </div>
                ) : (
                  filteredRepos.map((repo) => {
                    const isSelected = selectedId === repo.githubId;
                    const isImported = repo.alreadyImported;

                    return (
                      <div
                        key={repo.githubId}
                        onClick={() => setSelectedId(repo.githubId)}
                        onDoubleClick={() => handleSelectAndCustomize(repo)}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer select-none flex items-start justify-between gap-3.5 ${
                          isSelected
                            ? 'bg-purple-50/50 border-[#7C3AED] ring-2 ring-[#7C3AED]/20 shadow-xs'
                            : 'bg-white border-[#E5E9F0] hover:border-[#CBD5E1] hover:bg-[#FAFBFC]'
                        }`}
                      >
                        {/* Radio Selection */}
                        <div className="pt-0.5 shrink-0">
                          <div
                            className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                              isSelected ? 'bg-[#7C3AED] border-[#7C3AED] text-white' : 'border-[#CBD5E1] bg-white'
                            }`}
                          >
                            {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                          </div>
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-xs text-[#111827] truncate max-w-[320px]">
                              {repo.name}
                            </span>

                            {repo.isPrivate ? (
                              <span className="px-1.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded text-[9px] font-bold flex items-center gap-1">
                                <Lock className="w-2.5 h-2.5" />
                                Private
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.5 bg-slate-50 text-slate-600 border border-slate-200 rounded text-[9px] font-semibold flex items-center gap-1">
                                <Globe className="w-2.5 h-2.5" />
                                Public
                              </span>
                            )}

                            {repo.primaryLanguage && (
                              <span className="px-2 py-0.5 bg-purple-50 text-[#7C3AED] border border-purple-100 rounded text-[9px] font-bold">
                                {repo.primaryLanguage}
                              </span>
                            )}

                            {isImported && (
                              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-[9px] font-bold">
                                Already in Projects
                              </span>
                            )}
                          </div>

                          {repo.description ? (
                            <p className="text-[11px] text-[#6B7280] font-semibold line-clamp-2">
                              {repo.description}
                            </p>
                          ) : (
                            <p className="text-[11px] text-gray-400 italic">No description provided on GitHub.</p>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectAndCustomize(repo);
                            }}
                            className="px-3 py-1.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-[11px] font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
                          >
                            <span>Import & Customize</span>
                          </button>

                          <a
                            href={repo.repositoryUrl}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="p-1.5 text-[#9CA3AF] hover:text-[#111827] rounded-lg shrink-0 border border-[#E5E9F0] hover:bg-white"
                            title="View on GitHub"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-[#E5E9F0] bg-[#FAFBFC] flex items-center justify-between">
                <span className="text-xs font-semibold text-[#6B7280]">
                  Select a repository to pre-fill and customize before adding.
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 border border-[#E5E9F0] text-[#4B5563] hover:bg-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
                  >
                    Close
                  </button>
                  {selectedId && (
                    <button
                      type="button"
                      onClick={() => {
                        const found = repos.find((r) => r.githubId === selectedId);
                        if (found) handleSelectAndCustomize(found);
                      }}
                      className="px-4 py-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <span>Customize Selected</span>
                    </button>
                  )}
                </div>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

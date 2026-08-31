import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { telemetryService } from '../services/telemetryService';
import { projectService } from '../services/projectService';
import { codeforcesService } from '../services/codeforcesService';
import { leetcodeService } from '../services/leetcodeService';
import { githubService } from '../services/githubService';
import LeetCodeHeatmap from '../components/LeetCodeHeatmap';
import {
  Github,
  Code,
  Award,
  ExternalLink,
  Activity,
  RefreshCw,
  FolderGit2,
  Clock,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  GitFork,
  Zap,
  Target,
  TrendingUp,
  Sparkles,
  ArrowUpRight,
  GitCommit,
  Briefcase,
} from 'lucide-react';

function formatRelativeTime(dateInput) {
  if (!dateInput) return 'Never synced';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return 'Never synced';
  const diffSec = Math.floor((Date.now() - d.getTime()) / 1000);
  if (diffSec < 0) return 'Just now';
  if (diffSec < 60) return `${Math.max(1, diffSec)}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}h ago`;
  const diffDays = Math.floor(diffHour / 24);
  if (diffDays < 30) return `${diffDays}d ago`;
  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) return `${diffMonths}mo ago`;
  const diffYears = Math.floor(diffMonths / 12);
  return `${diffYears}y ago`;
}

function formatCompactNumber(num) {
  if (num === null || num === undefined) return '0';
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
}

export default function Dashboard({ setActivePage }) {
  const { userData, refreshUser, telemetry, companies: matchedCompanies } = useApp();
  const { showToast } = useToast();

  const [isSyncing, setIsSyncing] = useState(false);
  const [projects, setProjects] = useState([]);
  const [cfData, setCfData] = useState(null);
  const [lcData, setLcData] = useState(null);
  const [ghData, setGhData] = useState(null);

  // Scalable Languages View More State
  const [showAllLanguages, setShowAllLanguages] = useState(false);

  // Selected GitHub contribution year & dynamic cache
  const currentYear = new Date().getFullYear();
  const [ghSelectedYear, setGhSelectedYear] = useState(currentYear);
  const [yearlyContributionsCache, setYearlyContributionsCache] = useState({});

  // Initial Load using telemetry cache or platform service
  useEffect(() => {
    projectService.getAll()
      .then(res => { if (Array.isArray(res)) setProjects(res); })
      .catch(() => { });

    if (telemetry?.sources?.codeforces?.data) {
      setCfData(telemetry.sources.codeforces.data);
    } else if (userData?.connectedSources?.codeforces) {
      codeforcesService.getProfile()
        .then(res => { if (res?.connected && res.data) setCfData(res.data); })
        .catch(() => { });
    }

    if (telemetry?.sources?.leetcode?.data) {
      setLcData(telemetry.sources.leetcode.data);
    } else if (userData?.connectedSources?.leetcode) {
      leetcodeService.getProfile()
        .then(res => { if (res?.connected && res.data) setLcData(res.data); })
        .catch(() => { });
    }

    const ghUser = userData?.connectedSources?.github || userData?.auth?.github?.username;
    if (ghUser) {
      if (telemetry?.sources?.github?.data) {
        setGhData(telemetry.sources.github.data);
        if (!telemetry.sources.github.data.recentCommits) {
          githubService.getProfile?.()
            .then(res => { if (res?.data) setGhData(res.data); })
            .catch(() => { });
        }
      } else {
        githubService.getProfile?.()
          .then(res => { if (res?.data) setGhData(res.data); })
          .catch(() => { });
      }
    } else {
      setGhData(null);
    }
  }, [userData, telemetry]);

  // Universal Sync All Sources
  const handleUniversalSync = async () => {
    setIsSyncing(true);
    try {
      await telemetryService.triggerSync();
      await refreshUser?.();

      // Refresh local states
      if (userData?.connectedSources?.leetcode) {
        leetcodeService.getProfile().then(r => r.data && setLcData(r.data)).catch(() => { });
      }
      if (userData?.connectedSources?.codeforces) {
        codeforcesService.getProfile().then(r => r.data && setCfData(r.data)).catch(() => { });
      }
      if (userData?.connectedSources?.github || userData?.auth?.github?.username) {
        githubService.getProfile().then(r => r.data && setGhData(r.data)).catch(() => { });
      }

      showToast?.('All connected platforms synchronized successfully!', 'success');
    } catch (err) {
      console.error('Universal sync error:', err);
      showToast?.('Universal sync completed with partial data.', 'info');
    } finally {
      setIsSyncing(false);
    }
  };

  // Dynamic Sources State
  const ghHandle = userData?.connectedSources?.github || userData?.auth?.github?.username || '';
  const lcHandle = userData?.connectedSources?.leetcode || '';
  const cfHandle = userData?.connectedSources?.codeforces || '';

  const sourcesList = [
    { key: 'github', name: 'GitHub', connected: !!ghHandle, handle: ghHandle, icon: Github, lastSynced: telemetry?.sources?.github?.fetchedAt || userData?.lastSyncedAt },
    { key: 'leetcode', name: 'LeetCode', connected: !!lcHandle, handle: lcHandle, icon: Code, lastSynced: telemetry?.sources?.leetcode?.fetchedAt || userData?.lastSyncedAt },
    { key: 'codeforces', name: 'Codeforces', connected: !!cfHandle, handle: cfHandle, icon: Award, lastSynced: telemetry?.sources?.codeforces?.fetchedAt || userData?.lastSyncedAt },
  ];

  const activeSourcesCount = sourcesList.filter(s => s.connected).length;

  // Scalable Language Proportions
  const languageStats = lcData?.languageStats || [];
  const maxLanguageCount = useMemo(() => {
    return languageStats.reduce((max, l) => Math.max(max, l.problemsSolved || 0), 1);
  }, [languageStats]);

  const displayedLanguages = showAllLanguages ? languageStats : languageStats.slice(0, 5);

  // Dynamic Year Fetch Handler
  const handleYearSelect = async (yr) => {
    setGhSelectedYear(yr);
    if (yearlyContributionsCache[yr] || ghData?.yearlyContributions?.[yr]) {
      return;
    }
    try {
      const res = await githubService.getContributions(yr);
      if (res && res.submissionCalendar) {
        setYearlyContributionsCache(prev => ({
          ...prev,
          [yr]: {
            totalContributions: res.totalContributions,
            submissionCalendar: res.submissionCalendar,
          },
        }));
      }
    } catch (err) {
      console.warn(`Could not fetch GitHub contributions for ${yr}:`, err.message);
    }
  };

  // Available contribution years for GitHub (e.g. 2026, 2025)
  const ghAvailableYears = useMemo(() => {
    if (ghData?.contributionYears && Array.isArray(ghData.contributionYears) && ghData.contributionYears.length > 0) {
      return ghData.contributionYears;
    }
    return [currentYear, currentYear - 1];
  }, [ghData, currentYear]);

  // Selected year's calendar and total contributions with multi-layer fallback
  const { selectedGhCalendar, selectedGhTotal } = useMemo(() => {
    if (!ghData) return { selectedGhCalendar: {}, selectedGhTotal: 0 };

    // 1. Check if yearlyContributions has this specific year in ghData
    if (ghData.yearlyContributions && ghData.yearlyContributions[ghSelectedYear]) {
      const yrData = ghData.yearlyContributions[ghSelectedYear];
      const cal = yrData.submissionCalendar || {};
      const tot = yrData.totalContributions || Object.values(cal).reduce((s, c) => s + Number(c), 0);
      return { selectedGhCalendar: cal, selectedGhTotal: tot };
    }

    // 2. Main submissionCalendar or commitCalendar
    const mainCal = ghData.submissionCalendar || ghData.commitCalendar;
    if (mainCal && Object.keys(mainCal).length > 0) {
      const tot = ghData.totalContributions || ghData.totalCommitsRecent || Object.values(mainCal).reduce((s, c) => s + Number(c), 0);
      return { selectedGhCalendar: mainCal, selectedGhTotal: tot };
    }

    // 3. Construct from recentPushEvents if raw events exist
    const pushMap = {};
    if (Array.isArray(ghData.recentPushEvents) && ghData.recentPushEvents.length > 0) {
      ghData.recentPushEvents.forEach(evt => {
        if (evt.date) {
          const dateStr = new Date(evt.date).toISOString().slice(0, 10);
          pushMap[dateStr] = (pushMap[dateStr] || 0) + (evt.commits || 1);
        }
      });
    }
    const pushTotal = Object.values(pushMap).reduce((s, c) => s + Number(c), 0);
    return {
      selectedGhCalendar: pushMap,
      selectedGhTotal: ghData.totalCommitsRecent || pushTotal || ghData.totalContributions || 0,
    };
  }, [ghData, ghSelectedYear, currentYear]);

  // Side panel for GitHub card: Latest Commit Logs (scrollable without scrollbar)
  const ghSideContent = useMemo(() => {
    if (!ghData) return null;

    let rawCommits = [];
    if (Array.isArray(ghData.recentCommits) && ghData.recentCommits.length > 0) {
      rawCommits = ghData.recentCommits;
    } else if (Array.isArray(ghData.recentPushEvents) && ghData.recentPushEvents.length > 0) {
      rawCommits = ghData.recentPushEvents.map(e => {
        const repoName = (e.repo || '').split('/')[1] || e.repo || 'repository';
        const sha = e.sha || (e.payload?.head ? e.payload.head.slice(0, 7) : 'latest');
        return {
          repo: repoName,
          message: `Pushed updates to ${repoName}`,
          date: e.date || e.created_at,
          sha,
        };
      });
    } else if (Array.isArray(ghData.recentRepos) && ghData.recentRepos.length > 0) {
      rawCommits = ghData.recentRepos.map(r => ({
        repo: r.name,
        message: r.description || `Updated repository ${r.name}`,
        date: r.updatedAt,
        sha: 'main',
      }));
    }

    const commits = rawCommits.map(c => {
      const repoShort = (c.repo || '').split('/')[1] || c.repo || 'repository';
      const actualRepo = repoShort === 'career-os' ? 'career-insider' : repoShort;
      const repoFullName = c.fullRepo && !c.fullRepo.includes('career-os')
        ? c.fullRepo
        : (c.repo?.includes('/') && !c.repo.includes('career-os') ? c.repo : (ghHandle ? `${ghHandle}/${actualRepo}` : actualRepo));
      const isShaValid = c.sha && c.sha !== 'latest' && c.sha !== 'main' && /^[0-9a-fA-F]{6,}$/.test(c.sha);
      let url = c.url;
      if (!url || url.includes('/career-os') || url.endsWith('/commit/latest') || !url.startsWith('https://github.com/')) {
        url = isShaValid
          ? `https://github.com/${repoFullName}/commit/${c.sha}`
          : `https://github.com/${repoFullName}/commits`;
      }
      return {
        ...c,
        repo: actualRepo,
        url,
      };
    });

    return (
      <div className="space-y-2 h-full flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider block">
              Latest Commit Logs
            </span>
            <span className="text-[9px] font-bold text-[#7C3AED] bg-purple-50 px-2 py-0.5 rounded border border-purple-100">
              Latest {Math.min(commits.length, 10)}
            </span>
          </div>

          {commits.length > 0 ? (
            <div className="max-h-[175px] overflow-y-auto no-scrollbar divide-y divide-[#F3F4F6] pr-1">
              {commits.slice(0, 10).map((c, idx) => (
                <a
                  key={idx}
                  href={c.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between py-2 px-1.5 rounded-lg hover:bg-[#F8FAFC] transition-colors group cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 min-w-0 pr-2">
                    <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 shrink-0 group-hover:bg-purple-100 group-hover:text-[#7C3AED] transition-colors">
                      <GitCommit className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#111827] group-hover:text-[#7C3AED] text-[11px] truncate transition-colors">
                          {c.repo}
                        </span>
                        <span className="text-[9px] font-mono font-bold text-gray-500 bg-gray-50 px-1 py-0.2 rounded border border-gray-200 shrink-0">
                          {c.sha}
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-600 font-medium truncate group-hover:text-gray-900">
                        {c.message}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[9px] text-gray-400 font-semibold">{formatRelativeTime(c.date)}</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-[#7C3AED] transition-colors" />
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-400 font-medium py-3 text-center">No recent commits found</p>
          )}
        </div>
      </div>
    );
  }, [ghData, ghHandle]);

  // Cross-Platform Unified Recent Activity Stream
  const crossPlatformActivity = useMemo(() => {
    const events = [];

    // LeetCode recent ACs
    if (lcData?.recentSubmissions?.length > 0) {
      lcData.recentSubmissions.slice(0, 6).forEach(sub => {
        const rawTime = sub.timestamp || sub.creationTimeSeconds;
        const timeMs = rawTime ? (rawTime > 1e11 ? rawTime : rawTime * 1000) : null;
        events.push({
          source: 'LeetCode',
          type: 'Problem Solved',
          title: `Solved ${sub.title || 'Algorithmic Problem'}`,
          subtitle: 'LeetCode Problem Solved',
          url: sub.slug ? `https://leetcode.com/problems/${sub.slug}/` : `https://leetcode.com`,
          time: timeMs ? new Date(timeMs) : new Date(Date.now() - 3600000),
          iconType: 'leetcode',
        });
      });
    }

    // Codeforces recent ACs
    if (cfData?.recentSubmissions?.length > 0) {
      cfData.recentSubmissions.slice(0, 6).forEach(sub => {
        const rawTime = sub.timestamp || sub.creationTimeSeconds;
        const timeMs = rawTime ? (rawTime > 1e11 ? rawTime : rawTime * 1000) : null;
        events.push({
          source: 'Codeforces',
          type: 'Contest Solve',
          title: `Accepted ${sub.problemName || 'Problem'}`,
          subtitle: sub.contestId && sub.index ? `Contest ${sub.contestId}${sub.index}` : 'Codeforces',
          url: sub.contestId && sub.index ? `https://codeforces.com/contest/${sub.contestId}/problem/${sub.index}` : `https://codeforces.com`,
          time: timeMs ? new Date(timeMs) : new Date(Date.now() - 7200000),
          iconType: 'codeforces',
        });
      });
    }

    // GitHub recent commits / repo updates
    if (ghData?.recentCommits?.length > 0) {
      ghData.recentCommits.slice(0, 6).forEach(c => {
        events.push({
          source: 'GitHub',
          type: 'Commit Push',
          title: `Committed "${c.message}"`,
          subtitle: `Repository: ${c.repo}`,
          url: c.url,
          time: c.date ? new Date(c.date) : new Date(),
          iconType: 'github',
        });
      });
    } else if (ghData?.recentRepos?.length > 0) {
      ghData.recentRepos.slice(0, 6).forEach(repo => {
        events.push({
          source: 'GitHub',
          type: 'Repository Update',
          title: `Updated ${repo.name}`,
          subtitle: `Repository • ${repo.language || 'Code'}`,
          url: repo.url,
          time: repo.updatedAt ? new Date(repo.updatedAt) : new Date(),
          iconType: 'github',
        });
      });
    }

    return events.sort((a, b) => b.time - a.time).slice(0, 10);
  }, [lcData, cfData, ghData]);

  // Default Company Match Targets (aligned with CompanyMatches.jsx)
  const DEFAULT_DASHBOARD_COMPANIES = [
    {
      id: 'stripe',
      name: 'Stripe',
      role: 'Staff Systems Engineer',
      logoChar: 'S',
      logoBg: 'bg-[#635BFF]',
      salary: '$160k - $210k',
      match: 94,
      location: 'San Francisco, CA (Hybrid)',
      tags: ['Go / Infra', 'Distributed Systems', 'API Design'],
      eligibility: 'High Compatibility',
    },
    {
      id: 'openai',
      name: 'OpenAI',
      role: 'AI Infrastructure Lead',
      logoChar: 'O',
      logoBg: 'bg-[#121212]',
      salary: '$220k - $310k',
      match: 88,
      location: 'San Francisco, CA (Onsite)',
      tags: ['PyTorch / CUDA', 'LLM Fine-tuning', 'Python Backend'],
      eligibility: 'Qualified',
    },
    {
      id: 'airbnb',
      name: 'Airbnb',
      role: 'Senior Full Stack',
      logoChar: 'A',
      logoBg: 'bg-[#FF5A5F]',
      salary: '$175k - $230k',
      match: 82,
      location: 'Remote (US/Canada)',
      tags: ['React / TS', 'GraphQL', 'Microservices'],
      eligibility: 'Qualified',
    },
    {
      id: 'netflix',
      name: 'Netflix',
      role: 'Streaming Platform',
      logoChar: 'N',
      logoBg: 'bg-[#E50914]',
      salary: '$250k - $350k',
      match: 79,
      location: 'Los Gatos, CA (Hybrid)',
      tags: ['Java / Spring', 'Kafka', 'Low Latency'],
      eligibility: 'Growth Area',
    },
  ];

  // Matched Companies & Career Eligibility Profile
  const eligibleCompanies = useMemo(() => {
    if (matchedCompanies && Array.isArray(matchedCompanies) && matchedCompanies.length > 0) {
      const LOGO_COLORS = ['bg-[#635BFF]', 'bg-[#121212]', 'bg-[#FF5A5F]', 'bg-[#E50914]', 'bg-[#0284C7]', 'bg-[#059669]', 'bg-[#7C3AED]'];
      return matchedCompanies.map((c, i) => ({
        id: c.name?.toLowerCase().replace(/\s+/g, '-') || `comp-${i}`,
        name: c.name || 'Tech Company',
        role: c.role || c.hiringInsights?.split('•')?.[1]?.trim() || 'Software Engineer',
        logoChar: (c.name || 'C').charAt(0).toUpperCase(),
        logoBg: LOGO_COLORS[i % LOGO_COLORS.length],
        salary: c.hiringInsights?.split('•')?.[0]?.trim() || c.salary || 'Competitive Package',
        match: Number(c.matchScore) || (92 - i * 5),
        location: c.tier || c.location || 'Remote',
        tags: [...(c.strong || []), ...(c.missing || [])].slice(0, 3),
        eligibility: (c.matchScore >= 85) ? 'High Compatibility' : ((c.matchScore >= 75) ? 'Qualified' : 'Target Match'),
      }));
    }
    return DEFAULT_DASHBOARD_COMPANIES;
  }, [matchedCompanies]);

  return (
    <div className="space-y-5 pb-12 animate-fadeIn text-left">

      {/* 1. Dashboard Top Header Bar */}
      <div className="bg-white border border-[#E5E9F0] rounded-3xl p-6 sm:p-7 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-black text-[#111827] tracking-tight">
              Developer Ecosystem Dashboard
            </h1>
          </div>
          <p className="text-xs text-[#6B7280] font-semibold mt-1">
            Real-time activity, algorithmic problem-solving status, and cross-platform health.
          </p>
        </div>

        {/* Universal Sync Button */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleUniversalSync}
            disabled={isSyncing}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer ${isSyncing
              ? 'bg-[#7C3AED]/80 text-white cursor-wait'
              : 'bg-[#7C3AED] hover:bg-[#6D28D9] text-white active:scale-95'
              }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Synchronizing Platforms...' : 'Universal Sync'}</span>
          </button>
        </div>
      </div>

      {/* Active Universal Syncing Live Banner */}
      {isSyncing && (
        <div className="p-4 bg-purple-50/90 border border-purple-200/90 rounded-3xl flex items-center justify-between gap-3 shadow-2xs animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-purple-100 flex items-center justify-center text-[#7C3AED] shrink-0">
              <RefreshCw className="w-4 h-4 animate-spin" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#7C3AED]">Universal Platform Synchronization Active</h4>
              <p className="text-[11px] font-medium text-purple-700">Pulling live commits, LeetCode submissions, and Codeforces contest telemetry across sources…</p>
            </div>
          </div>
          <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 bg-white/90 rounded-lg text-[#7C3AED] border border-purple-200 shrink-0">
            Syncing
          </span>
        </div>
      )}

      {isSyncing ? (
        <div className="space-y-5">
          {/* Row 1: LeetCode & Codeforces Snapshot Skeletons */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* LeetCode Skeleton (7 cols) */}
            <div className="lg:col-span-7 bg-white border border-[#E5E9F0] rounded-3xl p-6 sm:p-7 shadow-sm space-y-5 animate-pulse">
              <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-100" />
                  <div className="space-y-1">
                    <div className="h-4 w-36 bg-gray-200 rounded" />
                    <div className="h-3 w-20 bg-gray-100 rounded" />
                  </div>
                </div>
                <div className="h-4 w-20 bg-gray-100 rounded" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                <div className="sm:col-span-5 bg-[#FAFBFD] border border-gray-100 rounded-2xl p-4 text-center space-y-2">
                  <div className="h-3 w-24 bg-gray-200 rounded mx-auto" />
                  <div className="h-8 w-20 bg-gray-200 rounded-lg mx-auto" />
                  <div className="h-5 w-24 bg-amber-100 rounded-md mx-auto" />
                </div>
                <div className="sm:col-span-7 space-y-3 bg-[#FAFBFD] border border-gray-100 rounded-2xl p-4">
                  <div className="space-y-1.5">
                    <div className="h-3 w-20 bg-emerald-100 rounded" />
                    <div className="h-2 w-full bg-gray-200 rounded-full" />
                  </div>
                  <div className="space-y-1.5">
                    <div className="h-3 w-24 bg-amber-100 rounded" />
                    <div className="h-2 w-full bg-gray-200 rounded-full" />
                  </div>
                  <div className="space-y-1.5">
                    <div className="h-3 w-16 bg-rose-100 rounded" />
                    <div className="h-2 w-full bg-gray-200 rounded-full" />
                  </div>
                </div>
              </div>
              <div className="h-16 bg-[#FAFBFD] border border-gray-100 rounded-2xl p-4" />
            </div>

            {/* Codeforces Skeleton (5 cols) */}
            <div className="lg:col-span-5 bg-white border border-[#E5E9F0] rounded-3xl p-6 sm:p-7 shadow-sm space-y-5 animate-pulse">
              <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-purple-100" />
                  <div className="space-y-1">
                    <div className="h-4 w-32 bg-gray-200 rounded" />
                    <div className="h-3 w-20 bg-gray-100 rounded" />
                  </div>
                </div>
                <div className="h-4 w-20 bg-gray-100 rounded" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#FAFBFD] border border-gray-100 rounded-2xl p-4 text-center space-y-2">
                  <div className="h-3 w-16 bg-gray-200 rounded mx-auto" />
                  <div className="h-8 w-16 bg-purple-200 rounded-lg mx-auto" />
                  <div className="h-4 w-20 bg-purple-100 rounded mx-auto" />
                </div>
                <div className="bg-[#FAFBFD] border border-gray-100 rounded-2xl p-4 text-center space-y-2">
                  <div className="h-3 w-16 bg-gray-200 rounded mx-auto" />
                  <div className="h-8 w-16 bg-gray-200 rounded-lg mx-auto" />
                  <div className="h-4 w-20 bg-gray-100 rounded mx-auto" />
                </div>
              </div>
              <div className="h-28 bg-[#FAFBFD] border border-gray-100 rounded-2xl p-4" />
            </div>
          </div>

          {/* Row 2: Heatmap & GitHub Activity Skeletons */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            <div className="lg:col-span-6 bg-white border border-[#E5E9F0] rounded-3xl p-6 sm:p-7 shadow-sm space-y-4 animate-pulse">
              <div className="h-5 w-44 bg-gray-200 rounded-lg" />
              <div className="h-40 bg-[#FAFBFD] border border-gray-100 rounded-2xl" />
            </div>
            <div className="lg:col-span-6 bg-white border border-[#E5E9F0] rounded-3xl p-6 sm:p-7 shadow-sm space-y-4 animate-pulse">
              <div className="h-5 w-44 bg-gray-200 rounded-lg" />
              <div className="h-40 bg-[#FAFBFD] border border-gray-100 rounded-2xl" />
            </div>
          </div>

          {/* Row 3: Activity Stream & Engineering Velocity Skeletons */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Recent Activity Skeleton (7 cols) */}
            <div className="lg:col-span-7 bg-white border border-[#E5E9F0] rounded-3xl p-6 sm:p-7 shadow-sm space-y-4 animate-pulse">
              <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                <div className="h-5 w-48 bg-gray-200 rounded-lg" />
                <div className="h-3.5 w-24 bg-gray-100 rounded" />
              </div>
              <div className="divide-y divide-gray-100">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="py-3 px-2 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3.5 flex-1">
                      <div className="w-8 h-8 rounded-full bg-gray-200 shrink-0" />
                      <div className="space-y-1.5 flex-1">
                        <div className="h-3.5 w-48 bg-gray-200 rounded" />
                        <div className="h-2.5 w-28 bg-gray-100 rounded" />
                      </div>
                    </div>
                    <div className="w-4 h-4 bg-gray-100 rounded" />
                  </div>
                ))}
              </div>
            </div>

            {/* Company Matches & Eligibility Skeleton (5 cols) */}
            <div className="lg:col-span-5 bg-white border border-[#E5E9F0] rounded-3xl p-6 sm:p-7 shadow-sm space-y-4 animate-pulse">
              <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                <div className="h-5 w-48 bg-gray-200 rounded-lg" />
                <div className="h-3.5 w-16 bg-gray-100 rounded" />
              </div>
              <div className="bg-[#FAFBFD] border border-gray-100 rounded-2xl p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-purple-100" />
                  <div className="space-y-1">
                    <div className="h-3.5 w-28 bg-gray-200 rounded" />
                    <div className="h-2.5 w-36 bg-gray-100 rounded" />
                  </div>
                </div>
                <div className="h-5 w-16 bg-emerald-100 rounded-md" />
              </div>
              <div className="divide-y divide-gray-100">
                {[1, 2, 3].map(i => (
                  <div key={i} className="py-2.5 px-1 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-xl bg-gray-200" />
                      <div className="space-y-1">
                        <div className="h-3 w-20 bg-gray-200 rounded" />
                        <div className="h-2 w-28 bg-gray-100 rounded" />
                      </div>
                    </div>
                    <div className="h-4 w-10 bg-gray-100 rounded" />
                  </div>
                ))}
              </div>
              <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
                <div className="h-3 w-40 bg-gray-200 rounded" />
                <div className="h-3 w-16 bg-purple-100 rounded" />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>

          {/* 2. Top Overview Metric Cards (Pure White with Crisp Shadows) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white border border-[#E5E9F0] rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow hover:border-[#7C3AED]/30 transition-all flex flex-col items-center justify-center text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF] block">Active Sources</span>
              <div className="flex items-baseline justify-center gap-1 mt-1 min-h-[32px]">
                {isSyncing ? (
                  <span className="w-16 h-7 bg-gray-200 rounded-lg animate-pulse" />
                ) : (
                  <>
                    <span className="text-2xl font-black text-[#111827]">{activeSourcesCount}</span>
                    <span className="text-xs font-bold text-[#9CA3AF]">/ {sourcesList.length}</span>
                  </>
                )}
              </div>
              <span className="text-[10px] text-emerald-600 font-semibold block mt-0.5">Telemetry connected</span>
            </div>

            <div className="bg-white border border-[#E5E9F0] rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow hover:border-[#7C3AED]/30 transition-all flex flex-col items-center justify-center text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF] block">LeetCode Solved</span>
              <div className="min-h-[32px] flex items-center justify-center mt-1">
                {isSyncing ? (
                  <span className="w-16 h-7 bg-amber-100 rounded-lg animate-pulse" />
                ) : (
                  <span className="text-2xl font-black text-amber-600 block">
                    {lcData?.totalSolved || (lcHandle ? 'Synced' : '0')}
                  </span>
                )}
              </div>
              <span className="text-[10px] text-[#6B7280] font-semibold block mt-0.5">
                {lcData?.ranking ? `Rank #${lcData.ranking.toLocaleString()}` : (lcHandle ? 'Active handle' : 'Not connected')}
              </span>
            </div>

            <div className="bg-white border border-[#E5E9F0] rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow hover:border-[#7C3AED]/30 transition-all flex flex-col items-center justify-center text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF] block">Codeforces Rating</span>
              <div className="min-h-[32px] flex items-center justify-center mt-1">
                {isSyncing ? (
                  <span className="w-16 h-7 bg-purple-100 rounded-lg animate-pulse" />
                ) : (
                  <span className="text-2xl font-black text-[#7C3AED] block">
                    {cfData?.rating || (cfHandle ? 'Synced' : 'Unrated')}
                  </span>
                )}
              </div>
              <span className="text-[10px] text-[#6B7280] font-semibold block mt-0.5 capitalize">
                {cfData?.rank ? `${cfData.rank} tier` : (cfHandle ? 'Connected' : 'Not connected')}
              </span>
            </div>

            <div className="bg-white border border-[#E5E9F0] rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow hover:border-[#7C3AED]/30 transition-all flex flex-col items-center justify-center text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF] block">Showcase Projects</span>
              <div className="min-h-[32px] flex items-center justify-center mt-1">
                {isSyncing ? (
                  <span className="w-16 h-7 bg-gray-200 rounded-lg animate-pulse" />
                ) : (
                  <span className="text-2xl font-black text-[#111827] block">
                    {projects?.length || 0}
                  </span>
                )}
              </div>
              <span className="text-[10px] text-[#6B7280] font-semibold block mt-0.5">
                {projects.filter(p => p.isImported).length} GitHub • {projects.filter(p => !p.isImported).length} Custom
              </span>
            </div>
          </div>

          {/* 3. ROW 1: LeetCode Snapshot & Codeforces Competitive Snapshot */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

            {/* LeetCode Snapshot Block (7 Cols) */}
            <div className="lg:col-span-7 bg-white border border-[#E5E9F0] rounded-3xl p-6 sm:p-7 shadow-sm space-y-5 transition-all">
              <div className="flex items-center justify-between border-b border-[#E5E9F0] pb-3">
                <div className="flex items-center gap-2">
                  <Code className="w-5 h-5 text-amber-500" />
                  <div>
                    <h2 className="text-sm font-bold text-[#111827]">LeetCode Algorithmic Snapshot</h2>
                    <span className="text-[11px] text-[#6B7280] font-semibold">
                      {lcHandle ? `@${lcHandle}` : 'Account not connected'}
                    </span>
                  </div>
                </div>
                {lcHandle && (
                  <a
                    href={`https://leetcode.com/${lcHandle}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-bold text-[#7C3AED] hover:underline inline-flex items-center gap-1"
                  >
                    <span>View profile</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>

              {lcData ? (
                <div className="space-y-5">
                  {/* Solved Dial / Difficulties Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                    <div className="sm:col-span-5 bg-white border border-[#E2E8F0] rounded-2xl p-4 text-center shadow-2xs">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Problems Solved</span>
                      <div className="flex items-baseline justify-center gap-1.5 mt-1">
                        <span className="text-3xl font-black text-[#111827]">{lcData.totalSolved || 0}</span>
                        {lcData.totalQuestions > 0 && (
                          <span className="text-xs font-bold text-gray-400">/ {lcData.totalQuestions}</span>
                        )}
                      </div>
                      {lcData.ranking && (
                        <span className="inline-block mt-2 px-2.5 py-0.5 rounded-md text-[10px] font-extrabold bg-amber-50 text-amber-800 border border-amber-200 shadow-2xs">
                          Rank {lcData.ranking.toLocaleString()}
                        </span>
                      )}
                    </div>

                    {/* Easy / Med / Hard Horizontal Bars */}
                    <div className="sm:col-span-7 space-y-2.5 bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-2xs">
                      <div>
                        <div className="flex justify-between text-[11px] font-bold mb-1">
                          <span className="text-emerald-700">Easy ({lcData.easySolved || 0})</span>
                          <span className="text-gray-400">{lcData.easyTotalQuestions ? `${Math.round((lcData.easySolved / lcData.easyTotalQuestions) * 100)}%` : ''}</span>
                        </div>
                        <div className="w-full bg-[#EEF2F6] h-2 rounded-full overflow-hidden">
                          <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${lcData.easyTotalQuestions ? Math.min(100, (lcData.easySolved / lcData.easyTotalQuestions) * 100) : 0}%` }} />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-[11px] font-bold mb-1">
                          <span className="text-amber-700">Medium ({lcData.mediumSolved || 0})</span>
                          <span className="text-gray-400">{lcData.mediumTotalQuestions ? `${Math.round((lcData.mediumSolved / lcData.mediumTotalQuestions) * 100)}%` : ''}</span>
                        </div>
                        <div className="w-full bg-[#EEF2F6] h-2 rounded-full overflow-hidden">
                          <div className="bg-amber-500 h-full rounded-full transition-all duration-500" style={{ width: `${lcData.mediumTotalQuestions ? Math.min(100, (lcData.mediumSolved / lcData.mediumTotalQuestions) * 100) : 0}%` }} />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-[11px] font-bold mb-1">
                          <span className="text-rose-700">Hard ({lcData.hardSolved || 0})</span>
                          <span className="text-gray-400">{lcData.hardTotalQuestions ? `${Math.round((lcData.hardSolved / lcData.hardTotalQuestions) * 100)}%` : ''}</span>
                        </div>
                        <div className="w-full bg-[#EEF2F6] h-2 rounded-full overflow-hidden">
                          <div className="bg-rose-500 h-full rounded-full transition-all duration-500" style={{ width: `${lcData.hardTotalQuestions ? Math.min(100, (lcData.hardSolved / lcData.hardTotalQuestions) * 100) : 0}%` }} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Scalable Language Distribution */}
                  {languageStats.length > 0 && (
                    <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 space-y-2.5 shadow-2xs">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider block">
                          Language Distribution ({languageStats.length} Languages)
                        </span>
                        {languageStats.length > 5 && (
                          <button
                            onClick={() => setShowAllLanguages(!showAllLanguages)}
                            className="text-[10px] font-bold text-[#7C3AED] hover:underline inline-flex items-center gap-0.5 cursor-pointer"
                          >
                            <span>{showAllLanguages ? 'Show Top 5' : `+${languageStats.length - 5} More`}</span>
                            {showAllLanguages ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                          </button>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        {displayedLanguages.map((l, idx) => {
                          const pct = Math.min(100, Math.max(8, (l.problemsSolved / maxLanguageCount) * 100));
                          return (
                            <div key={idx} className="flex items-center gap-3 text-xs">
                              <span className="w-24 font-bold text-gray-700 truncate">{l.languageName}</span>
                              <div className="flex-1 bg-[#EEF2F6] h-2 rounded-full overflow-hidden">
                                <div className="bg-[#7C3AED] h-full rounded-full" style={{ width: `${pct}%` }} />
                              </div>
                              <span className="w-16 text-right font-bold text-gray-900">{l.problemsSolved} Solved</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Badges Summary */}
                  {lcData.badges?.length > 0 && (
                    <div className="flex items-center gap-3 bg-white border border-[#E2E8F0] rounded-2xl p-3.5 shadow-2xs">
                      <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider shrink-0">
                        Earned Badges:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {lcData.badges.slice(0, 3).map((b, idx) => (
                          <div key={idx} className="flex items-center gap-1.5 bg-[#FAFBFC] border border-[#E2E8F0] px-2.5 py-1 rounded-lg shadow-2xs">
                            {b.icon ? <img src={b.icon} alt={b.displayName} className="w-4 h-4 object-contain" /> : <Award className="w-3.5 h-3.5 text-amber-500" />}
                            <span className="text-[11px] font-bold text-gray-800">{b.displayName}</span>
                          </div>
                        ))}
                        {lcData.badges.length > 3 && (
                          <span className="text-[10px] font-bold text-gray-400 self-center">
                            +{lcData.badges.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Compact LeetCode Heatmap */}
                  <div>
                    <LeetCodeHeatmap
                      submissionCalendar={lcData.submissionCalendar}
                      totalPastYearSubmissions={lcData.totalPastYearSubmissions}
                      totalActiveDays={lcData.totalActiveDays}
                      unitName="submissions"
                    />
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center bg-white border border-dashed border-[#E2E8F0] rounded-2xl space-y-3 shadow-2xs">
                  <Code className="w-8 h-8 text-gray-300 mx-auto" />
                  <p className="text-xs text-gray-500 font-semibold">
                    LeetCode account is not connected yet. Connect your handle in Settings to visualize problem-solving metrics and heatmap.
                  </p>
                  {setActivePage && (
                    <button
                      onClick={() => setActivePage('settings')}
                      className="px-3.5 py-1.5 bg-[#7C3AED] text-white text-xs font-bold rounded-xl cursor-pointer hover:bg-[#6D28D9] transition-all shadow-xs"
                    >
                      Connect LeetCode
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Codeforces Competitive Snapshot (5 Cols) */}
            <div className="lg:col-span-5 bg-white border border-[#E5E9F0] rounded-3xl p-6 sm:p-7 shadow-sm space-y-5 transition-all">
              <div className="flex items-center justify-between border-b border-[#E5E9F0] pb-3">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-[#7C3AED]" />
                  <div>
                    <h2 className="text-sm font-bold text-[#111827]">Codeforces Competitive Profile</h2>
                    <span className="text-[11px] text-[#6B7280] font-semibold">
                      {cfHandle ? `@${cfHandle}` : 'Account not connected'}
                    </span>
                  </div>
                </div>
                {cfHandle && (
                  <a
                    href={`https://codeforces.com/profile/${cfHandle}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-bold text-[#7C3AED] hover:underline inline-flex items-center gap-1"
                  >
                    <span>View profile</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>

              {cfData ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div className="bg-white border border-[#E2E8F0] rounded-2xl p-3 text-center shadow-2xs">
                      <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">Rating</span>
                      <span className="text-xl font-black text-[#111827] mt-0.5 block">{cfData.rating || 'Unrated'}</span>
                      <span className="text-[9px] text-purple-700 font-bold block mt-0.5">Max {cfData.maxRating || cfData.rating}</span>
                    </div>

                    <div className="bg-white border border-[#E2E8F0] rounded-2xl p-3 text-center shadow-2xs">
                      <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">Rank Tier</span>
                      <span className="text-xs font-black text-amber-700 capitalize mt-1.5 block truncate">{cfData.rank || 'Unrated'}</span>
                      <span className="text-[9px] text-gray-400 font-semibold block mt-0.5">Max {cfData.maxRank || cfData.rank}</span>
                    </div>

                    <div className="bg-white border border-[#E2E8F0] rounded-2xl p-3 text-center shadow-2xs">
                      <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">Contests</span>
                      <span className="text-xl font-black text-[#7C3AED] mt-0.5 block">{cfData.contestCount || 0}</span>
                      <span className="text-[9px] text-gray-400 font-semibold block mt-0.5">Participated</span>
                    </div>

                    <div className="bg-white border border-[#E2E8F0] rounded-2xl p-3 text-center shadow-2xs">
                      <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">Solved</span>
                      <span className="text-xl font-black text-emerald-600 mt-0.5 block">{cfData.solvedCount || cfData.recentSubmissions?.length || 0}</span>
                      <span className="text-[9px] text-gray-400 font-semibold block mt-0.5">Problems</span>
                    </div>
                  </div>

                  {/* Top Problem Topics (Maximum 10) */}
                  {cfData.topTags?.length > 0 && (
                    <div className="bg-white border border-[#E2E8F0] rounded-2xl p-3.5 space-y-2 shadow-2xs">
                      <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider block">
                        Top Problem Topics
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {cfData.topTags.slice(0, 10).map((t, idx) => (
                          <span key={idx} className="text-xs font-bold px-2.5 py-1 bg-[#FAFBFC] border border-[#E2E8F0] rounded-lg text-gray-800 shadow-2xs">
                            {t.tag} <span className="text-purple-600 font-extrabold">({t.count})</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Contest Rating History (Maximum Recent 3) */}
                  {cfData.ratingHistory?.length > 0 && (
                    <div className="bg-white border border-[#E2E8F0] rounded-2xl p-3.5 space-y-2 shadow-2xs">
                      <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider block">
                        Recent Contest Rating Performance
                      </span>
                      <div className="space-y-1.5">
                        {cfData.ratingHistory.slice(-3).reverse().map((c, idx) => {
                          const diff = c.newRating - c.oldRating;
                          return (
                            <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-[#FAFBFC] border border-[#E2E8F0] text-xs shadow-2xs">
                              <span className="font-bold text-[#111827] truncate pr-2 max-w-[180px]">{c.contestName}</span>
                              <div className="flex items-center gap-2 shrink-0 text-xs">
                                <span className="font-semibold text-gray-400 text-[10px]">Rank #{c.rank}</span>
                                <span className={`font-black px-2 py-0.5 rounded-md text-[10px] ${diff >= 0 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
                                  {diff >= 0 ? `+${diff}` : diff} ({c.newRating})
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Recent Contest Solves (Maximum Recent 4) */}
                  {cfData.recentSubmissions?.length > 0 && (
                    <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 space-y-2.5 shadow-2xs">
                      <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider block">
                        Recent Accepted Solves
                      </span>
                      <div className="space-y-1.5">
                        {cfData.recentSubmissions.slice(0, 4).map((sub, idx) => (
                          <a
                            key={idx}
                            href={sub.contestId && sub.index ? `https://codeforces.com/problemset/problem/${sub.contestId}/${sub.index}` : `https://codeforces.com/profile/${cfHandle}`}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center justify-between p-2 rounded-xl bg-[#FAFBFC] hover:bg-white border border-[#E2E8F0] hover:border-[#7C3AED]/40 transition-all text-xs font-semibold text-gray-800 group shadow-2xs"
                          >
                            <div className="flex items-center gap-2 truncate pr-2">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span className="truncate group-hover:text-[#7C3AED]">{sub.problemName}</span>
                            </div>
                            {sub.index && (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 bg-purple-50 text-[#7C3AED] rounded border border-purple-100 shrink-0">
                                Problem {sub.contestId ? `${sub.contestId}${sub.index}` : sub.index}
                              </span>
                            )}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-8 text-center bg-white border border-dashed border-[#E2E8F0] rounded-2xl space-y-3 shadow-2xs">
                  <Award className="w-8 h-8 text-gray-300 mx-auto" />
                  <p className="text-xs text-gray-500 font-semibold">
                    Codeforces handle is not connected yet. Connect your handle in Settings to track contest rating and contest history.
                  </p>
                  {setActivePage && (
                    <button
                      onClick={() => setActivePage('settings')}
                      className="px-3.5 py-1.5 bg-[#7C3AED] text-white text-xs font-bold rounded-xl cursor-pointer hover:bg-[#6D28D9] transition-all shadow-xs"
                    >
                      Connect Codeforces
                    </button>
                  )}
                </div>
              )}
            </div>

          </div>

          {/* 4. ROW 2: GitHub Repository & Commit Activity */}
          <div className="w-full bg-white border border-[#E5E9F0] rounded-3xl p-6 sm:p-7 shadow-sm space-y-5 transition-all">
            <div className="flex items-center justify-between border-b border-[#E5E9F0] pb-3">
              <div className="flex items-center gap-2">
                <Github className="w-5 h-5 text-gray-900" />
                <div>
                  <h2 className="text-sm font-bold text-[#111827]">GitHub Repository & Activity Analytics</h2>
                  <span className="text-[11px] text-[#6B7280] font-semibold">
                    {ghHandle ? `@${ghHandle}` : 'Account not connected'}
                  </span>
                </div>
              </div>
              {ghHandle && (
                <a
                  href={`https://github.com/${ghHandle}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-bold text-[#7C3AED] hover:underline inline-flex items-center gap-1"
                >
                  <span>View GitHub</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>

            {ghData ? (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-white border border-[#E2E8F0] rounded-2xl p-3 text-center shadow-2xs">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Repositories</span>
                    <span className="text-xl font-black text-[#111827] mt-0.5 block">{ghData.publicRepos || 0}</span>
                  </div>
                  <div className="bg-white border border-[#E2E8F0] rounded-2xl p-3 text-center shadow-2xs">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Total Stars</span>
                    <span className="text-xl font-black text-amber-600 mt-0.5 block">★ {ghData.totalStars ?? ghData.stargazersTotal ?? 0}</span>
                  </div>
                  <div className="bg-white border border-[#E2E8F0] rounded-2xl p-3 text-center shadow-2xs">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Followers</span>
                    <span className="text-xl font-black text-emerald-600 mt-0.5 block">{ghData.followers || 0}</span>
                  </div>
                </div>

                {/* Top Languages */}
                {ghData.topLanguages?.length > 0 && (
                  <div className="bg-white border border-[#E2E8F0] rounded-2xl p-3.5 space-y-2 shadow-2xs">
                    <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider block">
                      Top Code Languages
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {ghData.topLanguages.slice(0, 6).map((lang, idx) => {
                        const displayStat = (lang.percentage !== undefined && lang.percentage !== null)
                          ? `${lang.percentage}%`
                          : (lang.count || (lang.bytes ? `${Math.round(lang.bytes / 1024)} KB` : ''));
                        return (
                          <span key={idx} className="text-xs font-bold px-2.5 py-1 bg-[#FAFBFC] border border-[#E2E8F0] rounded-lg text-gray-800 shadow-2xs">
                            {lang.name} {displayStat ? <span className="text-gray-400 font-normal">({displayStat})</span> : null}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* GitHub Dynamic Contribution Heatmap with Year Selection */}
                <div>
                  <LeetCodeHeatmap
                    submissionCalendar={selectedGhCalendar}
                    totalPastYearSubmissions={selectedGhTotal}
                    totalActiveDays={Object.values(selectedGhCalendar).filter(c => Number(c) > 0).length}
                    unitName="contributions"
                    timeRangeText={`in ${ghSelectedYear}`}
                    targetYear={ghSelectedYear}
                    years={ghAvailableYears}
                    selectedYear={ghSelectedYear}
                    onYearSelect={handleYearSelect}
                    sideContent={ghSideContent}
                  />
                </div>
              </div>
            ) : (
              <div className="p-8 text-center bg-white border border-dashed border-[#E2E8F0] rounded-2xl space-y-3 shadow-2xs">
                <Github className="w-8 h-8 text-gray-300 mx-auto" />
                <p className="text-xs text-gray-500 font-semibold">
                  GitHub account is not connected. Connect GitHub to index public repositories and showcase activity.
                </p>
                {setActivePage && (
                  <button
                    onClick={() => setActivePage('settings')}
                    className="px-3.5 py-1.5 bg-[#111827] text-white text-xs font-bold rounded-xl cursor-pointer hover:bg-gray-800 transition-all shadow-xs"
                  >
                    Connect GitHub
                  </button>
                )}
              </div>
            )}
          </div>

          {/* 5. ROW 3: Cross-Platform Recent Activity & Engineering Velocity */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">

            {/* Unified Recent Activity Stream (7 Cols) */}
            <div className="lg:col-span-7 bg-white border border-[#E5E9F0] rounded-3xl p-6 sm:p-7 shadow-sm transition-all flex flex-col justify-between min-h-[380px]">
              <div>
                <div className="flex items-center justify-between border-b border-[#E5E9F0] pb-3 mb-3">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-[#7C3AED]" />
                    <h2 className="text-sm font-bold text-[#111827]">Cross-Platform Recent Activity</h2>
                  </div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-purple-50 text-[#7C3AED] border border-purple-200">
                    {crossPlatformActivity.length} Events
                  </span>
                </div>

                {/* Seamless Timeline Stream (No Nested Cards) */}
                <div className="max-h-[300px] overflow-y-auto no-scrollbar divide-y divide-[#F3F4F6] pr-1">
                  {crossPlatformActivity.length > 0 ? (
                    crossPlatformActivity.map((act, idx) => (
                      <a
                        key={idx}
                        href={act.url || '#'}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between py-3 px-2 rounded-xl hover:bg-[#F8FAFC] transition-colors group cursor-pointer"
                      >
                        <div className="flex items-center gap-3.5 min-w-0 pr-2">
                          {/* Platform Icon Dot */}
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${act.iconType === 'leetcode'
                              ? 'bg-amber-50 text-amber-600'
                              : act.iconType === 'codeforces'
                                ? 'bg-purple-50 text-[#7C3AED]'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                            {act.iconType === 'leetcode' && <Code className="w-4 h-4" />}
                            {act.iconType === 'codeforces' && <Award className="w-4 h-4" />}
                            {act.iconType === 'github' && <Github className="w-4 h-4" />}
                          </div>

                          {/* Content Typography */}
                          <div className="min-w-0 space-y-0.5">
                            <span className="text-xs font-bold text-[#111827] group-hover:text-[#7C3AED] transition-colors truncate block">
                              {act.title}
                            </span>
                            <div className="flex items-center gap-2 text-[10px] font-semibold text-[#6B7280]">
                              <span className={`font-bold ${act.iconType === 'leetcode' ? 'text-amber-700' : act.iconType === 'codeforces' ? 'text-[#7C3AED]' : 'text-gray-700'
                                }`}>
                                {act.source}
                              </span>
                              <span className="text-gray-300">•</span>
                              <span>{formatRelativeTime(act.time)}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0 text-gray-300 group-hover:text-[#7C3AED] transition-colors">
                          <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                        </div>
                      </a>
                    ))
                  ) : (
                    <p className="text-xs text-gray-400 font-semibold text-center py-8">No recent cross-platform activity indexed yet.</p>
                  )}
                </div>
              </div>
            </div>

            {/* 5. Target Company Compatibility & Hiring Matches (5 Cols) */}
            <div className="lg:col-span-5 bg-white border border-[#E5E9F0] rounded-3xl p-6 sm:p-7 shadow-sm transition-all flex flex-col justify-between min-h-[380px]">
              <div>
                <div className="flex items-center justify-between border-b border-[#E5E9F0] pb-3 mb-3.5">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-[#7C3AED]" />
                    <h2 className="text-sm font-bold text-[#111827]">Target Company Compatibility</h2>
                  </div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {eligibleCompanies.length} High Matches
                  </span>
                </div>

                {/* Aggregate Compatibility Status Bar */}
                <div className="bg-[#FAFBFD] border border-[#E5E9F0] rounded-2xl p-3.5 mb-3 space-y-2 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">
                        Average Hiring Alignment
                      </span>
                      <div className="flex items-baseline gap-1.5 mt-0.5">
                        <span className="text-xl font-black text-[#111827]">
                          {Math.round(eligibleCompanies.reduce((acc, c) => acc + c.match, 0) / (eligibleCompanies.length || 1))}%
                        </span>
                        <span className="text-[10px] font-bold text-emerald-600">Strong Candidate Profile</span>
                      </div>
                    </div>
                    {eligibleCompanies[0] && (
                      <div className="text-right">
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">Top Role</span>
                        <span className="text-xs font-extrabold text-[#7C3AED] block">
                          {eligibleCompanies[0].name} ({eligibleCompanies[0].match}%)
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Multi-tone compatibility gradient bar */}
                  <div className="w-full bg-[#EEF2F6] h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-[#7C3AED] via-indigo-500 to-emerald-500 h-full rounded-full transition-all duration-700"
                      style={{ width: `${Math.round(eligibleCompanies.reduce((acc, c) => acc + c.match, 0) / (eligibleCompanies.length || 1))}%` }}
                    />
                  </div>
                </div>

                {/* Seamless List of Eligible Target Companies */}
                <div className="divide-y divide-[#F3F4F6] max-h-[175px] overflow-y-auto no-scrollbar pr-0.5">
                  {eligibleCompanies.map((comp, idx) => (
                    <div
                      key={idx}
                      onClick={() => setActivePage?.('companies')}
                      className="flex items-center justify-between py-2.5 px-1.5 rounded-xl hover:bg-[#F8FAFC] transition-colors group cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0 pr-2">
                        <div className={`w-8 h-8 rounded-xl ${comp.logoBg} text-white font-extrabold flex items-center justify-center text-xs shrink-0 shadow-3xs`}>
                          {comp.logoChar}
                        </div>
                        <div className="min-w-0 space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-[#111827] group-hover:text-[#7C3AED] transition-colors truncate">
                              {comp.name}
                            </span>
                            <span className="text-gray-300">•</span>
                            <span className="text-[11px] text-gray-600 font-semibold truncate">
                              {comp.role}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-gray-400 font-medium">
                            <span className="font-semibold text-gray-500">{comp.salary}</span>
                            <span>•</span>
                            <span className="truncate">{comp.location}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`text-[11px] font-black px-2 py-0.5 rounded-lg border shadow-3xs ${comp.match >= 90
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : comp.match >= 80
                              ? 'bg-purple-50 text-[#7C3AED] border-purple-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}>
                          {comp.match}%
                        </span>
                        <ArrowUpRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-[#7C3AED] transition-colors" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Callout / Navigation Action */}
              <div className="pt-3 border-t border-[#E5E9F0] flex items-center justify-between gap-2 mt-2">
                <span className="text-[10px] font-semibold text-gray-400">
                  Computed from verified DSA & projects
                </span>
                <button
                  onClick={() => setActivePage?.('companies')}
                  className="text-xs font-bold text-[#7C3AED] hover:text-[#6D28D9] flex items-center gap-1 cursor-pointer shrink-0"
                >
                  <span>Explore All Roles</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>
        </>
      )}

    </div>
  );
}

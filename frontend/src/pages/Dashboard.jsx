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
  Sparkles, 
  Github, 
  Code, 
  Database,
  Award,
  Terminal,
  FileText,
  ExternalLink,
  Layers,
  Activity,
  Zap,
  Check,
  XCircle,
  RefreshCw,
  FolderGit2,
  Globe,
  Clock,
  ArrowUpRight,
  TrendingUp,
  Star,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

function formatRelativeTime(dateInput) {
  if (!dateInput) return 'Never synced';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return 'Never synced';
  const diffSec = Math.floor((Date.now() - d.getTime()) / 1000);
  if (diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}h ago`;
  const diffDays = Math.floor(diffHour / 24);
  return `${diffDays}d ago`;
}

function formatCompactNumber(num) {
  if (num === null || num === undefined) return '0';
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
}

export default function Dashboard({ setActivePage }) {
  const { userData, refreshUser, telemetry } = useApp();
  const { showToast } = useToast();

  const [isSyncing, setIsSyncing] = useState(false);
  const [projects, setProjects] = useState([]);
  const [cfData, setCfData] = useState(null);
  const [lcData, setLcData] = useState(null);
  const [ghData, setGhData] = useState(null);

  // Scalable Languages View More State
  const [showAllLanguages, setShowAllLanguages] = useState(false);

  // Initial Load using telemetry cache or platform service
  useEffect(() => {
    projectService.getAll()
      .then(res => { if (Array.isArray(res)) setProjects(res); })
      .catch(() => {});

    if (telemetry?.sources?.codeforces?.data) {
      setCfData(telemetry.sources.codeforces.data);
    } else if (userData?.connectedSources?.codeforces) {
      codeforcesService.getProfile()
        .then(res => { if (res?.connected && res.data) setCfData(res.data); })
        .catch(() => {});
    }

    if (telemetry?.sources?.leetcode?.data) {
      setLcData(telemetry.sources.leetcode.data);
    } else if (userData?.connectedSources?.leetcode) {
      leetcodeService.getProfile()
        .then(res => { if (res?.connected && res.data) setLcData(res.data); })
        .catch(() => {});
    }

    const ghUser = userData?.connectedSources?.github || userData?.auth?.github?.username;
    if (ghUser) {
      if (telemetry?.sources?.github?.data) {
        setGhData(telemetry.sources.github.data);
      } else {
        githubService.getProfile?.()
          .then(res => { if (res?.data) setGhData(res.data); })
          .catch(() => {});
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
        leetcodeService.getProfile().then(r => r.data && setLcData(r.data)).catch(() => {});
      }
      if (userData?.connectedSources?.codeforces) {
        codeforcesService.getProfile().then(r => r.data && setCfData(r.data)).catch(() => {});
      }
      if (userData?.connectedSources?.github || userData?.auth?.github?.username) {
        githubService.getProfile().then(r => r.data && setGhData(r.data)).catch(() => {});
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

  // GitHub commit activity map
  const ghSubmissionCalendar = useMemo(() => {
    if (!ghData) return {};
    if (ghData.submissionCalendar) return ghData.submissionCalendar;
    if (ghData.commitCalendar) return ghData.commitCalendar;
    
    // Construct calendar map from recentPushEvents
    const map = {};
    if (Array.isArray(ghData.recentPushEvents)) {
      ghData.recentPushEvents.forEach(evt => {
        if (evt.date) {
          const dateStr = new Date(evt.date).toISOString().slice(0, 10);
          map[dateStr] = (map[dateStr] || 0) + (evt.commits || 1);
        }
      });
    }
    return map;
  }, [ghData]);

  const ghTotalCommits = useMemo(() => {
    if (!ghData) return 0;
    if (ghData.totalCommitsRecent !== undefined) return ghData.totalCommitsRecent;
    return Object.values(ghSubmissionCalendar).reduce((sum, c) => sum + Number(c), 0);
  }, [ghData, ghSubmissionCalendar]);

  // Render rightmost panel for GitHub Heatmap (Active Repositories & Recent Commit Logs)
  const ghSideContent = useMemo(() => {
    if (!ghData) return null;

    // Repos list with accurate per-repo stars
    let reposList = ghData.recentRepos || [];
    if (reposList.length === 0 && ghData.repos && Array.isArray(ghData.repos)) {
      reposList = ghData.repos.map(r => ({
        name: r.name,
        stars: r.stargazers_count || 0,
        forks: r.forks_count || 0,
        url: r.html_url,
        language: r.language || '',
      }));
    }
    if (reposList.length === 0 && Array.isArray(ghData.recentPushEvents)) {
      const repoNames = [...new Set(ghData.recentPushEvents.map(e => e.repo).filter(Boolean))];
      reposList = repoNames.map(rName => {
        const cleanName = rName.split('/')[1] || rName;
        return {
          name: cleanName,
          stars: 0,
          url: `https://github.com/${rName}`,
          language: '',
        };
      });
    }

    // Deduplicate push events by distinct repository name and sum recent commits
    const distinctPushLogsMap = new Map();
    (ghData.recentPushEvents || []).forEach(evt => {
      if (evt.repo) {
        const repoName = evt.repo.split('/')[1] || evt.repo;
        if (!distinctPushLogsMap.has(repoName)) {
          distinctPushLogsMap.set(repoName, {
            name: repoName,
            commits: evt.commits || 1,
            url: `https://github.com/${evt.repo}`,
          });
        } else {
          const existing = distinctPushLogsMap.get(repoName);
          existing.commits += (evt.commits || 1);
        }
      }
    });
    const pushLogs = Array.from(distinctPushLogsMap.values());

    return (
      <div className="space-y-3">
        <div>
          <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider block mb-1.5">
            Active Repositories ({ghData.publicRepos || reposList.length || 0})
          </span>
          {reposList.length > 0 ? (
            <div className="space-y-1.5 max-h-[130px] overflow-y-auto no-scrollbar pr-1">
              {reposList.slice(0, 3).map((repo, idx) => (
                <a
                  key={idx}
                  href={repo.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between p-2 rounded-xl bg-[#FAFBFC] border border-[#E5E9F0] hover:border-[#7C3AED]/40 hover:bg-purple-50/20 transition-all text-xs group"
                >
                  <div className="flex items-center gap-2 truncate pr-2">
                    <FolderGit2 className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#7C3AED] shrink-0" />
                    <span className="font-bold text-[#111827] truncate group-hover:text-[#7C3AED]">{repo.name}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 text-[10px] font-bold text-gray-500">
                    {repo.language && (
                      <span className="px-1.5 py-0.5 rounded bg-white border border-[#E5E9F0] text-gray-700">
                        {repo.language}
                      </span>
                    )}
                    {repo.stars > 0 && (
                      <span className="text-amber-600 font-extrabold">★ {repo.stars}</span>
                    )}
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-400 font-medium">No repositories found</p>
          )}
        </div>

        {pushLogs.length > 0 && (
          <div className="pt-2 border-t border-[#F3F4F6]">
            <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider block mb-1">
              Recent Repository Activity
            </span>
            <div className="text-xs text-gray-700 font-semibold space-y-1">
              {pushLogs.slice(0, 3).map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-[11px] text-gray-600">
                  <span className="truncate max-w-[140px] font-medium text-gray-800">{item.name}</span>
                  <span className="font-bold text-[#7C3AED]">{item.commits} commit{item.commits !== 1 ? 's' : ''}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }, [ghData]);

  // Cross-Platform Unified Recent Activity Stream
  const crossPlatformActivity = useMemo(() => {
    const events = [];

    // LeetCode recent ACs
    if (lcData?.recentSubmissions?.length > 0) {
      lcData.recentSubmissions.slice(0, 3).forEach(sub => {
        events.push({
          source: 'LeetCode',
          sourceColor: 'text-amber-600 bg-amber-50 border-amber-200',
          title: `Solved ${sub.title}`,
          url: `https://leetcode.com/problems/${sub.slug}/`,
          time: sub.timestamp ? new Date(sub.timestamp * 1000) : new Date(),
        });
      });
    }

    // Codeforces recent ACs
    if (cfData?.recentSubmissions?.length > 0) {
      cfData.recentSubmissions.slice(0, 3).forEach(sub => {
        events.push({
          source: 'Codeforces',
          sourceColor: 'text-purple-600 bg-purple-50 border-purple-200',
          title: `Accepted ${sub.problemName}`,
          url: `https://codeforces.com/contest/${sub.contestId}/problem/${sub.index}`,
          time: sub.creationTimeSeconds ? new Date(sub.creationTimeSeconds * 1000) : new Date(),
        });
      });
    }

    // GitHub recent projects / repos
    if (ghData?.repos?.length > 0) {
      ghData.repos.slice(0, 3).forEach(repo => {
        events.push({
          source: 'GitHub',
          sourceColor: 'text-gray-800 bg-gray-100 border-gray-200',
          title: `Pushed updates to ${repo.name}`,
          url: repo.url,
          time: repo.updatedAt ? new Date(repo.updatedAt) : new Date(),
        });
      });
    }

    return events.sort((a, b) => b.time - a.time).slice(0, 6);
  }, [lcData, cfData, ghData]);

  return (
    <div className="space-y-6 pb-12 animate-fadeIn text-left">
      
      {/* 1. Dashboard Top Header Bar */}
      <div className="bg-white border border-[#E5E9F0] rounded-3xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5">
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
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer ${
              isSyncing 
                ? 'bg-[#7C3AED]/80 text-white cursor-wait' 
                : 'bg-[#7C3AED] hover:bg-[#6D28D9] text-white'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Synchronizing Platforms...' : 'Universal Sync'}</span>
          </button>
        </div>
      </div>

      {/* 2. Top Overview Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-[#E5E9F0] rounded-2xl p-4 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF] block">Active Sources</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-[#111827]">{activeSourcesCount}</span>
            <span className="text-xs font-bold text-[#9CA3AF]">/ {sourcesList.length}</span>
          </div>
          <span className="text-[10px] text-emerald-600 font-semibold block mt-0.5">Telemetry connected</span>
        </div>

        <div className="bg-white border border-[#E5E9F0] rounded-2xl p-4 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF] block">LeetCode Solved</span>
          <span className="text-2xl font-black text-amber-600 mt-1 block">
            {lcData?.totalSolved || (lcHandle ? 'Synced' : '0')}
          </span>
          <span className="text-[10px] text-[#6B7280] font-semibold block mt-0.5">
            {lcData?.ranking ? `Rank #${lcData.ranking.toLocaleString()}` : (lcHandle ? 'Active handle' : 'Not connected')}
          </span>
        </div>

        <div className="bg-white border border-[#E5E9F0] rounded-2xl p-4 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF] block">Codeforces Rating</span>
          <span className="text-2xl font-black text-[#7C3AED] mt-1 block">
            {cfData?.rating || (cfHandle ? 'Synced' : 'Unrated')}
          </span>
          <span className="text-[10px] text-[#6B7280] font-semibold block mt-0.5 capitalize">
            {cfData?.rank ? `${cfData.rank} tier` : (cfHandle ? 'Connected' : 'Not connected')}
          </span>
        </div>

        <div className="bg-white border border-[#E5E9F0] rounded-2xl p-4 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF] block">Showcase Projects</span>
          <span className="text-2xl font-black text-[#111827] mt-1 block">{projects.length}</span>
          <span className="text-[10px] text-gray-500 font-semibold block mt-0.5">
            {projects.filter(p => p.isImported).length} GitHub • {projects.filter(p => !p.isImported).length} Custom
          </span>
        </div>
      </div>

      {/* 3. ROW 1: LeetCode Snapshot & Codeforces Competitive Snapshot */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LeetCode Snapshot Block (7 Cols) */}
        <div className="lg:col-span-7 bg-white border border-[#E5E9F0] rounded-3xl p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-[#F3F4F6] pb-3">
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
                <div className="sm:col-span-5 bg-[#FAFBFC] border border-[#E5E9F0] rounded-2xl p-4 text-center">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Problems Solved</span>
                  <div className="flex items-baseline justify-center gap-1.5 mt-1">
                    <span className="text-3xl font-black text-[#111827]">{lcData.totalSolved || 0}</span>
                    {lcData.totalQuestions > 0 && (
                      <span className="text-xs font-bold text-gray-400">/ {lcData.totalQuestions}</span>
                    )}
                  </div>
                  {lcData.ranking && (
                    <span className="inline-block mt-2 px-2.5 py-0.5 rounded-md text-[10px] font-extrabold bg-amber-50 text-amber-800 border border-amber-200">
                      Rank #{lcData.ranking.toLocaleString()}
                    </span>
                  )}
                </div>

                {/* Easy / Med / Hard Horizontal Bars */}
                <div className="sm:col-span-7 space-y-2 bg-[#FAFBFC] border border-[#E5E9F0] rounded-2xl p-4">
                  <div>
                    <div className="flex justify-between text-[11px] font-bold mb-1">
                      <span className="text-emerald-700">Easy ({lcData.easySolved || 0})</span>
                      <span className="text-gray-400">{lcData.easyTotalQuestions ? `${Math.round((lcData.easySolved / lcData.easyTotalQuestions) * 100)}%` : ''}</span>
                    </div>
                    <div className="w-full bg-[#E5E9F0] h-1.5 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${lcData.easyTotalQuestions ? Math.min(100, (lcData.easySolved / lcData.easyTotalQuestions) * 100) : 0}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] font-bold mb-1">
                      <span className="text-amber-700">Medium ({lcData.mediumSolved || 0})</span>
                      <span className="text-gray-400">{lcData.mediumTotalQuestions ? `${Math.round((lcData.mediumSolved / lcData.mediumTotalQuestions) * 100)}%` : ''}</span>
                    </div>
                    <div className="w-full bg-[#E5E9F0] h-1.5 rounded-full overflow-hidden">
                      <div className="bg-amber-500 h-full rounded-full" style={{ width: `${lcData.mediumTotalQuestions ? Math.min(100, (lcData.mediumSolved / lcData.mediumTotalQuestions) * 100) : 0}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] font-bold mb-1">
                      <span className="text-rose-700">Hard ({lcData.hardSolved || 0})</span>
                      <span className="text-gray-400">{lcData.hardTotalQuestions ? `${Math.round((lcData.hardSolved / lcData.hardTotalQuestions) * 100)}%` : ''}</span>
                    </div>
                    <div className="w-full bg-[#E5E9F0] h-1.5 rounded-full overflow-hidden">
                      <div className="bg-rose-500 h-full rounded-full" style={{ width: `${lcData.hardTotalQuestions ? Math.min(100, (lcData.hardSolved / lcData.hardTotalQuestions) * 100) : 0}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Scalable Language Distribution (Horizontal Bars) */}
              {languageStats.length > 0 && (
                <div className="bg-[#FAFBFC] border border-[#E5E9F0] rounded-2xl p-4 space-y-2.5">
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
                          <div className="flex-1 bg-[#E5E9F0] h-2 rounded-full overflow-hidden">
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
                <div className="flex items-center gap-3 bg-[#FAFBFC] border border-[#E5E9F0] rounded-2xl p-3.5">
                  <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider shrink-0">
                    Earned Badges:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {lcData.badges.slice(0, 3).map((b, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 bg-white border border-[#E5E9F0] px-2.5 py-1 rounded-lg shadow-xs">
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
                />
              </div>
            </div>
          ) : (
            <div className="p-8 text-center bg-[#FAFBFC] border border-dashed border-[#E5E9F0] rounded-2xl space-y-3">
              <Code className="w-8 h-8 text-gray-300 mx-auto" />
              <p className="text-xs text-gray-500 font-semibold">
                LeetCode account is not connected yet. Connect your handle in Settings to visualize problem-solving metrics and heatmap.
              </p>
              {setActivePage && (
                <button
                  onClick={() => setActivePage('settings')}
                  className="px-3.5 py-1.5 bg-[#7C3AED] text-white text-xs font-bold rounded-xl cursor-pointer hover:bg-[#6D28D9] transition-all"
                >
                  Connect LeetCode
                </button>
              )}
            </div>
          )}
        </div>

        {/* Codeforces Competitive Snapshot (5 Cols) */}
        <div className="lg:col-span-5 bg-white border border-[#E5E9F0] rounded-3xl p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-[#F3F4F6] pb-3">
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
                <div className="bg-[#FAFBFC] border border-[#E5E9F0] rounded-2xl p-3 text-center">
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">Rating</span>
                  <span className="text-xl font-black text-[#111827] mt-0.5 block">{cfData.rating || 'Unrated'}</span>
                  <span className="text-[9px] text-purple-700 font-bold block mt-0.5">Max {cfData.maxRating || cfData.rating}</span>
                </div>

                <div className="bg-[#FAFBFC] border border-[#E5E9F0] rounded-2xl p-3 text-center">
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">Rank Tier</span>
                  <span className="text-xs font-black text-amber-700 capitalize mt-1.5 block truncate">{cfData.rank || 'Unrated'}</span>
                  <span className="text-[9px] text-gray-400 font-semibold block mt-0.5">Max {cfData.maxRank || cfData.rank}</span>
                </div>

                <div className="bg-[#FAFBFC] border border-[#E5E9F0] rounded-2xl p-3 text-center">
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">Contests</span>
                  <span className="text-xl font-black text-[#7C3AED] mt-0.5 block">{cfData.contestCount || 0}</span>
                  <span className="text-[9px] text-gray-400 font-semibold block mt-0.5">Participated</span>
                </div>

                <div className="bg-[#FAFBFC] border border-[#E5E9F0] rounded-2xl p-3 text-center">
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">Solved</span>
                  <span className="text-xl font-black text-emerald-600 mt-0.5 block">{cfData.solvedCount || cfData.recentSubmissions?.length || 0}</span>
                  <span className="text-[9px] text-gray-400 font-semibold block mt-0.5">Problems</span>
                </div>
              </div>

              {/* Top Problem Topics */}
              {cfData.topTags?.length > 0 && (
                <div className="bg-[#FAFBFC] border border-[#E5E9F0] rounded-2xl p-3.5 space-y-2">
                  <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider block">
                    Top Problem Topics
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {cfData.topTags.slice(0, 6).map((t, idx) => (
                      <span key={idx} className="text-xs font-bold px-2.5 py-1 bg-white border border-[#E5E9F0] rounded-lg text-gray-800 shadow-xs">
                        {t.tag} <span className="text-purple-600 font-extrabold">({t.count})</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Contest Rating History */}
              {cfData.ratingHistory?.length > 0 && (
                <div className="bg-[#FAFBFC] border border-[#E5E9F0] rounded-2xl p-3.5 space-y-2">
                  <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider block">
                    Recent Contest Rating Performance
                  </span>
                  <div className="space-y-1.5">
                    {cfData.ratingHistory.slice(-3).reverse().map((c, idx) => {
                      const diff = c.newRating - c.oldRating;
                      return (
                        <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-white border border-[#E5E9F0] text-xs">
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

              {/* Recent Contest Solves */}
              {cfData.recentSubmissions?.length > 0 && (
                <div className="bg-[#FAFBFC] border border-[#E5E9F0] rounded-2xl p-4 space-y-2.5">
                  <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider block">
                    Recent Accepted Solves
                  </span>
                  <div className="space-y-1.5">
                    {cfData.recentSubmissions.slice(0, 5).map((sub, idx) => (
                      <a
                        key={idx}
                        href={sub.contestId && sub.index ? `https://codeforces.com/problemset/problem/${sub.contestId}/${sub.index}` : `https://codeforces.com/profile/${cfHandle}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between p-2 rounded-xl bg-white border border-[#E5E9F0] hover:border-[#7C3AED]/40 transition-all text-xs font-semibold text-gray-800 group"
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
            <div className="p-8 text-center bg-[#FAFBFC] border border-dashed border-[#E5E9F0] rounded-2xl space-y-3">
              <Award className="w-8 h-8 text-gray-300 mx-auto" />
              <p className="text-xs text-gray-500 font-semibold">
                Codeforces handle is not connected yet. Connect your handle in Settings to track contest rating and contest history.
              </p>
              {setActivePage && (
                <button
                  onClick={() => setActivePage('settings')}
                  className="px-3.5 py-1.5 bg-[#7C3AED] text-white text-xs font-bold rounded-xl cursor-pointer hover:bg-[#6D28D9] transition-all"
                >
                  Connect Codeforces
                </button>
              )}
            </div>
          )}
        </div>

      </div>

      {/* 4. ROW 2: GitHub Repository & Commit Activity */}
      <div className="w-full bg-white border border-[#E5E9F0] rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#F3F4F6] pb-3">
          <div className="flex items-center gap-2">
            <Github className="w-5 h-5 text-gray-900" />
            <div>
              <h2 className="text-sm font-bold text-[#111827]">GitHub Repository & Commit Activity</h2>
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
              <div className="bg-[#FAFBFC] border border-[#E5E9F0] rounded-2xl p-3 text-center">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Repositories</span>
                <span className="text-xl font-black text-[#111827] mt-0.5 block">{ghData.publicRepos || 0}</span>
              </div>
              <div className="bg-[#FAFBFC] border border-[#E5E9F0] rounded-2xl p-3 text-center">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Total Stars</span>
                <span className="text-xl font-black text-amber-600 mt-0.5 block">★ {ghData.totalStars ?? ghData.stargazersTotal ?? 0}</span>
              </div>
              <div className="bg-[#FAFBFC] border border-[#E5E9F0] rounded-2xl p-3 text-center">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Followers</span>
                <span className="text-xl font-black text-emerald-600 mt-0.5 block">{ghData.followers || 0}</span>
              </div>
            </div>

            {/* Top Languages */}
            {ghData.topLanguages?.length > 0 && (
              <div className="bg-[#FAFBFC] border border-[#E5E9F0] rounded-2xl p-3.5 space-y-2">
                <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider block">
                  Top Code Languages
                </span>
                <div className="flex flex-wrap gap-2">
                  {ghData.topLanguages.slice(0, 6).map((lang, idx) => {
                    const displayStat = (lang.percentage !== undefined && lang.percentage !== null)
                      ? `${lang.percentage}%`
                      : (lang.count || (lang.bytes ? `${Math.round(lang.bytes / 1024)} KB` : ''));
                    return (
                      <span key={idx} className="text-xs font-bold px-2.5 py-1 bg-white border border-[#E5E9F0] rounded-lg text-gray-800 shadow-xs">
                        {lang.name} {displayStat ? <span className="text-gray-400 font-normal">({displayStat})</span> : null}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {/* GitHub Commit Activity Heatmap */}
            <div>
              <LeetCodeHeatmap 
                submissionCalendar={ghSubmissionCalendar}
                totalPastYearSubmissions={ghTotalCommits}
                totalActiveDays={Object.keys(ghSubmissionCalendar).length}
                unitName="commits"
                timeRangeText={`in ${new Date().getFullYear()}`}
                sideContent={ghSideContent}
              />
            </div>
          </div>
        ) : (
          <div className="p-8 text-center bg-[#FAFBFC] border border-dashed border-[#E5E9F0] rounded-2xl space-y-3">
            <Github className="w-8 h-8 text-gray-300 mx-auto" />
            <p className="text-xs text-gray-500 font-semibold">
              GitHub account is not connected. Connect GitHub to index public repositories and showcase activity.
            </p>
            {setActivePage && (
              <button
                onClick={() => setActivePage('settings')}
                className="px-3.5 py-1.5 bg-[#111827] text-white text-xs font-bold rounded-xl cursor-pointer hover:bg-gray-800 transition-all"
              >
                Connect GitHub
              </button>
            )}
          </div>
        )}
      </div>

      {/* 5. ROW 3: Cross-Platform Recent Activity & Source Health / Data Freshness */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Unified Recent Activity Stream (7 Cols) */}
        <div className="lg:col-span-7 bg-white border border-[#E5E9F0] rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#F3F4F6] pb-3">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#7C3AED]" />
              <h2 className="text-sm font-bold text-[#111827]">Cross-Platform Recent Activity</h2>
            </div>
            <span className="text-[11px] font-semibold text-gray-400">Aggregated Timeline</span>
          </div>

          <div className="space-y-2.5">
            {crossPlatformActivity.map((act, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-2xl bg-[#FAFBFC] border border-[#E5E9F0] transition-all">
                <div className="flex items-center gap-2.5 truncate pr-3">
                  <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-md border uppercase tracking-wider shrink-0 ${act.sourceColor}`}>
                    {act.source}
                  </span>
                  <span className="text-xs font-bold text-gray-800 truncate">{act.title}</span>
                </div>
                <span className="text-[10px] font-semibold text-gray-400 shrink-0">
                  {formatRelativeTime(act.time)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Data Freshness & Connection Health (5 Cols) */}
        <div className="lg:col-span-5 bg-white border border-[#E5E9F0] rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#F3F4F6] pb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#7C3AED]" />
              <h2 className="text-sm font-bold text-[#111827]">Data Freshness & Source Health</h2>
            </div>
          </div>

          <div className="divide-y divide-[#F3F4F6]">
            {sourcesList.map((source) => {
              const Icon = source.icon;
              return (
                <div key={source.key} className="py-2.5 flex items-center justify-between first:pt-0 last:pb-0">
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 text-gray-500" />
                    <div>
                      <span className="text-xs font-bold text-gray-800 block">{source.name}</span>
                      <span className="text-[10px] font-semibold text-gray-400 block">{formatRelativeTime(source.lastSynced)}</span>
                    </div>
                  </div>

                  <span className={`inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                    source.connected ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {source.connected ? '● Healthy' : '○ Not connected'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
}

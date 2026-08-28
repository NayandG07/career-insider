import React, { useState, useEffect } from 'react';
import { 
  Lock,
  RefreshCw,
  Sliders,
  Bell,
  ShieldCheck,
  Github,
  Code,
  Award,
  AlertCircle,
  X,
  Save,
  Download,
  Edit2,
  Check,
  User,
  Mail,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';
import { userService } from '../services/userService';
import { githubService } from '../services/githubService';
import { codeforcesService } from '../services/codeforcesService';
import { leetcodeService } from '../services/leetcodeService';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { getApiBaseUrl } from '../services/api';
import GithubRepoPickerModal from '../components/GithubRepoPickerModal';

export default function Settings() {
  const { userData, refreshUser } = useApp();
  const { showToast } = useToast();

  // Modal & Notice State
  const [showRepoPicker, setShowRepoPicker] = useState(false);
  const [notice, setNotice] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(null);

  // Profile Edit State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileName, setProfileName] = useState(userData?.name || '');
  const [profileBio, setProfileBio] = useState(userData?.bio || '');
  const [profileLoading, setProfileLoading] = useState(false);

  useEffect(() => {
    if (userData) {
      setProfileName(userData.name || '');
      setProfileBio(userData.bio || '');
    }
  }, [userData]);

  // Check sessionStorage notice on mount
  useEffect(() => {
    const savedNotice = sessionStorage.getItem('settings_notice');
    if (savedNotice) {
      setNotice({ type: 'info', text: savedNotice });
      sessionStorage.removeItem('settings_notice');
    }
  }, []);

  // GitHub Connection State
  const githubUsername = userData?.connectedSources?.github || userData?.auth?.github?.username || '';
  const isGithubConnected = !!(githubUsername || userData?.auth?.github?.id);

  // Codeforces State
  const cfHandle = userData?.connectedSources?.codeforces || '';
  const isCfConnected = !!cfHandle;

  // LeetCode State
  const lcHandle = userData?.connectedSources?.leetcode || '';
  const isLcConnected = !!lcHandle;

  // Platform Handles State
  const [editingPlatform, setEditingPlatform] = useState(null); // 'github' | 'leetcode' | 'codeforces'
  const [platformInput, setPlatformInput] = useState('');
  const [platformSaving, setPlatformSaving] = useState(false);
  const [syncingPlatform, setSyncingPlatform] = useState(null);

  // Notification Preferences (persisted in localStorage)
  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem('careeros_notifications_prefs');
      return saved ? JSON.parse(saved) : {
        weeklyDigest: true,
        jobMatches: true,
        dailyReminders: false,
        syncAlerts: true,
      };
    } catch {
      return {
        weeklyDigest: true,
        jobMatches: true,
        dailyReminders: false,
        syncAlerts: true,
      };
    }
  });

  const toggleNotification = (key) => {
    const updated = { ...notifications, [key]: !notifications[key] };
    setNotifications(updated);
    localStorage.setItem('careeros_notifications_prefs', JSON.stringify(updated));
    showToast?.('Notification preferences saved.', 'success');
  };

  // Password State
  const [passLoading, setPassLoading] = useState(false);
  const [passMessage, setPassMessage] = useState(null);
  const [passwordFields, setPasswordFields] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Listen for OAuth completion from new tab or popup
  useEffect(() => {
    const handleAuthMessage = (event) => {
      if (event.data?.type === 'GITHUB_AUTH_SUCCESS') {
        refreshUser?.();
        showToast?.('GitHub account connected successfully!', 'success');
      }
    };
    window.addEventListener('message', handleAuthMessage);
    return () => window.removeEventListener('message', handleAuthMessage);
  }, [refreshUser, showToast]);

  // Handle Profile Update
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    try {
      await userService.updateProfile({
        name: profileName.trim(),
        bio: profileBio.trim(),
      });
      await refreshUser?.();
      setIsEditingProfile(false);
      showToast?.('Profile updated successfully.', 'success');
    } catch (err) {
      console.error(err);
      showToast?.(err.response?.data?.message || 'Failed to update profile.', 'error');
    } finally {
      setProfileLoading(false);
    }
  };

  // Handle GitHub OAuth
  const handleGithubOAuthAction = () => {
    const token = localStorage.getItem('accessToken');
    const url = `${getApiBaseUrl()}/auth/github${token ? `?token=${encodeURIComponent(token)}` : ''}`;
    window.open(url, '_blank');
  };

  // Handle Saving Platform Handle (GitHub, LeetCode, Codeforces)
  const handleSavePlatformHandle = async (platformKey) => {
    if (!platformInput.trim()) return;
    setPlatformSaving(true);
    try {
      const cleanHandle = platformInput.trim().replace(/^@/, '');

      if (platformKey === 'codeforces') {
        await codeforcesService.connect(cleanHandle);
        await refreshUser?.();
        showToast?.(`Codeforces handle @${cleanHandle} connected successfully!`, 'success');
      } else if (platformKey === 'leetcode') {
        await leetcodeService.connect(cleanHandle);
        await refreshUser?.();
        showToast?.(`LeetCode handle @${cleanHandle} connected successfully!`, 'success');
      } else if (platformKey === 'github') {
        await githubService.connect(cleanHandle);
        await refreshUser?.();
        showToast?.(`GitHub handle @${cleanHandle} connected successfully!`, 'success');
      }

      setEditingPlatform(null);
      setPlatformInput('');
    } catch (err) {
      console.error('Save platform handle error:', err);
      const errMsg = err.response?.data?.error || err.response?.data?.message || err.message || `Failed to connect ${platformKey}.`;
      showToast?.(errMsg, 'error');
    } finally {
      setPlatformSaving(false);
    }
  };

  // Handle Sync Platform Data
  const handleSyncPlatform = async (platformKey, handle) => {
    if (!handle) return;
    setSyncingPlatform(platformKey);
    try {
      if (platformKey === 'codeforces') {
        await codeforcesService.sync(handle);
      } else if (platformKey === 'leetcode') {
        await leetcodeService.sync(handle);
      } else if (platformKey === 'github') {
        await githubService.sync(handle);
      }
      await refreshUser?.();
      showToast?.(`Synced ${platformKey} data successfully.`, 'success');
    } catch (err) {
      console.error(`Sync error for ${platformKey}:`, err);
      showToast?.(`Failed to sync ${platformKey} data.`, 'error');
    } finally {
      setSyncingPlatform(null);
    }
  };

  // Handle Disconnecting a Platform
  const handleDisconnectPlatform = (platformKey) => {
    setConfirmDialog({
      title: `Disconnect ${platformKey.charAt(0).toUpperCase() + platformKey.slice(1)}?`,
      message: `Are you sure you want to disconnect ${platformKey}? Your profile metrics will no longer sync from this source.`,
      onConfirm: async () => {
        try {
          if (platformKey === 'github') {
            await githubService.disconnect();
          } else if (platformKey === 'codeforces') {
            await codeforcesService.disconnect();
          } else if (platformKey === 'leetcode') {
            await leetcodeService.disconnect();
          }
          await refreshUser?.();
          showToast?.(`Disconnected ${platformKey} successfully.`, 'success');
        } catch (err) {
          console.error(`Disconnect error for ${platformKey}:`, err);
          showToast?.(err.response?.data?.error || `Failed to disconnect ${platformKey}.`, 'error');
        } finally {
          setConfirmDialog(null);
        }
      }
    });
  };

  // Handle Password Update
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordFields.newPassword !== passwordFields.confirmPassword) {
      setPassMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    if (passwordFields.newPassword.length < 6) {
      setPassMessage({ type: 'error', text: 'Password must be at least 6 characters.' });
      return;
    }

    setPassLoading(true);
    setPassMessage(null);
    try {
      await userService.changePassword({
        currentPassword: passwordFields.oldPassword,
        newPassword: passwordFields.newPassword
      });
      setPassMessage({ type: 'success', text: 'Password changed successfully.' });
      setPasswordFields({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      showToast?.('Password updated successfully.', 'success');
    } catch (err) {
      console.error(err);
      setPassMessage({ 
        type: 'error', 
        text: err.response?.data?.message || err.response?.data?.error || 'Failed to update password.' 
      });
    } finally {
      setPassLoading(false);
    }
  };

  // Handle Data Export (Download JSON)
  const handleExportData = () => {
    try {
      const exportPayload = {
        user: userData,
        exportedAt: new Date().toISOString(),
      };
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportPayload, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `careeros_data_${userData?.email || 'user'}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      showToast?.('Data export downloaded successfully.', 'success');
    } catch (err) {
      console.error(err);
      showToast?.('Failed to export data.', 'error');
    }
  };

  const platforms = [
    {
      key: 'github',
      name: "GitHub",
      title: "GitHub Repositories & Commits",
      desc: "Authenticate via GitHub OAuth to securely sync repositories, commit activity, stars, and language distribution.",
      icon: Github,
      isConnected: isGithubConnected,
      handle: githubUsername,
      isOAuthOnly: true,
    },
    {
      key: 'leetcode',
      name: "LeetCode",
      title: "LeetCode Algorithm Activity",
      desc: "Syncs problem-solving activity, acceptance statistics, badges, and contest participation.",
      icon: Code,
      isConnected: isLcConnected,
      handle: lcHandle,
      placeholder: "e.g. neetcode or your_handle",
      isOAuthOnly: false,
    },
    {
      key: 'codeforces',
      name: "Codeforces",
      title: "Codeforces Competitive Rating",
      desc: "Syncs competitive contest history, rating changes, global ranking, and submission milestones.",
      icon: Award,
      isConnected: isCfConnected,
      handle: cfHandle,
      placeholder: "e.g. tourist or your_handle",
      isOAuthOnly: false,
    },
  ];

  const notificationOptions = [
    {
      key: 'weeklyDigest',
      name: "Weekly Readiness Digest",
      desc: "Receive automated weekly summaries on skill growth, code activity, and target role readiness.",
    },
    {
      key: 'jobMatches',
      name: "High-Tier Company Match Alerts",
      desc: "Instant notifications when high-match openings appear matching your verified skill stack.",
    },
    {
      key: 'dailyReminders',
      name: "Daily Practice & Goal Reminders",
      desc: "Daily alerts for targeted problem-solving streaks and recommended skill milestone updates.",
    },
    {
      key: 'syncAlerts',
      name: "Automated Source Sync Alerts",
      desc: "Notifies you when GitHub, Codeforces, LeetCode, or Resume indexing completes successfully.",
    }
  ];

  const memberSince = userData?.createdAt 
    ? new Date(userData.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : 'Recent Member';

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20 animate-fadeIn text-left">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-bold text-[#111827] tracking-tight">
            Settings & Integrations
          </h1>
          <p className="text-sm font-semibold text-[#6B7280] mt-1">
            Manage your developer profile, connect external coding platforms, configure notifications, and manage security.
          </p>
        </div>

        <button
          onClick={handleExportData}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-[#E5E9F0] hover:bg-[#FAFBFC] text-xs font-bold text-[#374151] rounded-xl shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Download className="w-4 h-4 text-[#6B7280]" />
          <span>Export Profile Data</span>
        </button>
      </div>

      {/* Notice Banner */}
      {notice && (
        <div className="p-4 sm:p-5 rounded-2xl border bg-purple-50 border-purple-200 text-[#7C3AED] flex items-start justify-between gap-3 shadow-xs">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="text-xs sm:text-sm font-bold leading-relaxed">{notice.text}</p>
          </div>
          <button
            onClick={() => setNotice(null)}
            className="p-1.5 rounded-lg hover:bg-black/5 text-gray-500 cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Section 1: Profile & Identity Overview */}
      <div className="bg-white border border-[#E5E9F0] rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-[#F3F4F6] pb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-[#7C3AED] flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#111827]">Account & Profile</h2>
              <p className="text-xs text-[#6B7280] font-semibold">Your basic identity and account details</p>
            </div>
          </div>

          {!isEditingProfile ? (
            <button
              onClick={() => setIsEditingProfile(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#F9FAFB] hover:bg-[#F3F4F6] text-[#374151] border border-[#E5E9F0] transition-colors cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5 text-[#6B7280]" />
              <span>Edit Profile</span>
            </button>
          ) : (
            <button
              onClick={() => setIsEditingProfile(false)}
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-[#6B7280] hover:text-[#111827] cursor-pointer"
            >
              Cancel
            </button>
          )}
        </div>

        {!isEditingProfile ? (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              {userData?.avatar ? (
                <img
                  src={userData.avatar}
                  alt={userData?.name}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-purple-100 shadow-sm shrink-0"
                />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#7C3AED] to-[#6366F1] flex items-center justify-center text-white font-black text-2xl shadow-sm shrink-0">
                  {userData?.name ? userData.name.charAt(0).toUpperCase() : 'U'}
                </div>
              )}

              <div className="space-y-1.5">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h3 className="text-lg font-bold text-[#111827]">
                    {userData?.name || 'Developer'}
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wider bg-purple-50 text-[#7C3AED] border border-purple-200">
                    {userData?.role === 'admin' ? 'Admin' : 'Student Developer'}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-[#6B7280]">
                  <span className="inline-flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5" />
                    {userData?.email || 'No email registered'}
                  </span>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    Joined {memberSince}
                  </span>
                </div>
                {userData?.bio && (
                  <p className="text-xs text-[#4B5563] font-medium pt-1 max-w-xl">
                    {userData.bio}
                  </p>
                )}
              </div>
            </div>

            <div className="bg-[#FAFBFC] border border-[#E5E9F0] rounded-2xl px-6 py-4 text-center shrink-0 self-start sm:self-auto">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF] block">Readiness Score</span>
              <span className="text-2xl font-black text-[#7C3AED]">{userData?.readinessScore || 0}%</span>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSaveProfile} className="space-y-5 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs font-bold text-[#374151]">
              <div className="space-y-1.5">
                <label>Full Name</label>
                <input
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  placeholder="Your Name"
                  className="w-full px-4 py-2.5 bg-[#FAFBFC] border border-[#E5E9F0] rounded-xl font-semibold text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/15 focus:border-[#7C3AED]"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label>Email Address</label>
                <input
                  type="email"
                  disabled
                  value={userData?.email || ''}
                  className="w-full px-4 py-2.5 bg-[#F3F4F6] border border-[#E5E9F0] rounded-xl font-semibold text-[#9CA3AF] cursor-not-allowed"
                />
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <label>Developer Bio / Headline</label>
                <input
                  type="text"
                  value={profileBio}
                  onChange={(e) => setProfileBio(e.target.value)}
                  placeholder="e.g. Full-Stack Engineer & Competitive Programmer"
                  className="w-full px-4 py-2.5 bg-[#FAFBFC] border border-[#E5E9F0] rounded-xl font-semibold text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/15 focus:border-[#7C3AED]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsEditingProfile(false)}
                className="px-4 py-2 text-xs font-bold text-[#6B7280] hover:text-[#111827] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={profileLoading}
                className="px-5 py-2.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                {profileLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                <span>Save Profile Changes</span>
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Section 2: Platform Integrations & External Sources (Spacious & Clean) */}
      <div className="bg-white border border-[#E5E9F0] rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-[#F3F4F6] pb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-[#7C3AED] flex items-center justify-center">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#111827]">
                Platform Integrations & External Sources
              </h2>
              <p className="text-xs text-[#6B7280] font-semibold">
                Link your accounts to automatically synchronize your verified coding metrics and repositories
              </p>
            </div>
          </div>
          <span className="text-xs font-bold px-3 py-1 bg-purple-50 text-[#7C3AED] border border-purple-100 rounded-xl">
            {platforms.filter(p => p.isConnected).length} of {platforms.length} Connected
          </span>
        </div>

        <div className="grid grid-cols-1 gap-5">
          {platforms.map((plat) => {
            const Icon = plat.icon;
            const isEditing = editingPlatform === plat.key;
            const isSyncing = syncingPlatform === plat.key;

            return (
              <div
                key={plat.key}
                className="p-5 sm:p-6 rounded-2xl border border-[#E5E9F0] bg-white hover:border-[#CBD5E1] transition-all flex flex-col md:flex-row md:items-center justify-between gap-5 text-left shadow-2xs"
              >
                {/* Left: Platform Icon & Info */}
                <div className="flex items-start gap-4 min-w-0 flex-1">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-2xs ${
                    plat.isConnected ? 'bg-[#111827] text-white' : 'bg-gray-100 text-gray-500'
                  }`}>
                    <Icon className="w-6 h-6" />
                  </div>

                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h3 className="text-sm sm:text-base font-bold text-[#111827]">{plat.title}</h3>
                      {plat.isConnected ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <Check className="w-3 h-3" />
                          Connected
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-gray-100 text-gray-500 border border-gray-200">
                          Not Connected
                        </span>
                      )}
                    </div>
                    
                    <p className="text-xs text-[#6B7280] font-semibold leading-relaxed">
                      {plat.desc}
                    </p>

                    {/* Connected Handle Pill (No stats/numbers shown) */}
                    {plat.isConnected && (
                      <div className="pt-1.5 flex items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-[#111827]">
                          <span className="text-[#7C3AED]">@</span>
                          {plat.handle}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Actions / Form Field */}
                <div className="flex items-center gap-2.5 shrink-0 self-start md:self-center w-full md:w-auto">
                  {plat.isOAuthOnly ? (
                    plat.isConnected ? (
                      <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap w-full md:w-auto">
                        <button
                          onClick={() => handleSyncPlatform('github', plat.handle)}
                          disabled={isSyncing}
                          className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#F9FAFB] hover:bg-[#F3F4F6] text-[#374151] border border-[#E5E9F0] transition-colors cursor-pointer inline-flex items-center gap-1.5"
                          title="Re-sync repositories and activity"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-[#7C3AED]' : 'text-gray-500'}`} />
                          <span>Sync Repos</span>
                        </button>

                        <button
                          onClick={() => handleDisconnectPlatform('github')}
                          className="px-3.5 py-2 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 border border-red-100 cursor-pointer transition-colors"
                        >
                          Disconnect
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={handleGithubOAuthAction}
                        className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs font-bold bg-[#7C3AED] hover:bg-[#6D28D9] text-white shadow-2xs transition-all cursor-pointer inline-flex items-center justify-center gap-2"
                      >
                        <Github className="w-4 h-4" />
                        <span>Connect GitHub</span>
                      </button>
                    )
                  ) : isEditing ? (
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full md:w-auto">
                      <div className="relative w-full sm:w-64">
                        <span className="absolute left-3.5 top-2.5 text-xs font-bold text-gray-400">@</span>
                        <input
                          type="text"
                          value={platformInput}
                          onChange={(e) => setPlatformInput(e.target.value)}
                          placeholder={plat.placeholder}
                          className="w-full bg-[#FAFBFC] border border-[#E5E9F0] rounded-xl pl-8 pr-3.5 py-2.5 text-xs font-semibold text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/15 focus:border-[#7C3AED] transition-all"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSavePlatformHandle(plat.key);
                          }}
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleSavePlatformHandle(plat.key)}
                          disabled={platformSaving || !platformInput.trim()}
                          className="flex-1 sm:flex-none px-4 py-2.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-50 inline-flex items-center justify-center gap-1.5 shadow-2xs shrink-0"
                        >
                          {platformSaving ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              <span>Saving...</span>
                            </>
                          ) : (
                            <span>Save Handle</span>
                          )}
                        </button>
                        <button
                          onClick={() => { setEditingPlatform(null); setPlatformInput(''); }}
                          className="p-2.5 border border-[#E5E9F0] hover:border-gray-300 text-gray-400 hover:text-gray-600 rounded-xl transition-colors cursor-pointer shrink-0"
                          title="Cancel"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : plat.isConnected ? (
                    <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap w-full md:w-auto">
                      <button
                        onClick={() => handleSyncPlatform(plat.key, plat.handle)}
                        disabled={isSyncing}
                        className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#F9FAFB] hover:bg-[#F3F4F6] text-[#374151] border border-[#E5E9F0] transition-colors cursor-pointer inline-flex items-center gap-1.5"
                        title="Re-sync data from platform"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-[#7C3AED]' : 'text-gray-500'}`} />
                        <span>Sync</span>
                      </button>

                      <button
                        onClick={() => { setEditingPlatform(plat.key); setPlatformInput(plat.handle); }}
                        className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white text-[#374151] border border-gray-200 hover:bg-gray-50 cursor-pointer"
                      >
                        Edit Handle
                      </button>

                      <button
                        onClick={() => handleDisconnectPlatform(plat.key)}
                        className="px-3.5 py-2 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 border border-red-100 cursor-pointer transition-colors"
                      >
                        Disconnect
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap w-full md:w-auto">
                      <button
                        onClick={() => { setEditingPlatform(plat.key); setPlatformInput(''); }}
                        className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs font-bold bg-[#7C3AED] hover:bg-[#6D28D9] text-white shadow-2xs transition-all cursor-pointer inline-flex items-center justify-center gap-1.5"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Connect Handle</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 3: Notification Preferences */}
      <div className="bg-white border border-[#E5E9F0] rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center gap-2.5 border-b border-[#F3F4F6] pb-5">
          <div className="w-8 h-8 rounded-xl bg-purple-50 text-[#7C3AED] flex items-center justify-center">
            <Bell className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#111827]">
              Notification Preferences & Alerts
            </h2>
            <p className="text-xs text-[#6B7280] font-semibold">Choose how and when CareerOS sends you updates</p>
          </div>
        </div>

        <div className="divide-y divide-[#F3F4F6]">
          {notificationOptions.map((opt) => {
            const isActive = !!notifications[opt.key];
            return (
              <div key={opt.key} className="py-4 flex items-center justify-between gap-4 first:pt-0 last:pb-0">
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-[#111827]">{opt.name}</h3>
                  <p className="text-xs text-[#6B7280] font-semibold mt-0.5">{opt.desc}</p>
                </div>

                <button 
                  onClick={() => toggleNotification(opt.key)}
                  className={`w-10 h-6 rounded-full p-0.5 transition-colors cursor-pointer focus:outline-none shrink-0 ${
                    isActive ? 'bg-[#7C3AED]' : 'bg-[#E5E9F0]'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform shadow-xs ${
                    isActive ? 'translate-x-4' : 'translate-x-0'
                  }`} />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 4: Password & Security */}
      <div className="bg-white border border-[#E5E9F0] rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center gap-2.5 border-b border-[#F3F4F6] pb-5">
          <div className="w-8 h-8 rounded-xl bg-purple-50 text-[#7C3AED] flex items-center justify-center">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#111827]">
              Account Security & Password
            </h2>
            <p className="text-xs text-[#6B7280] font-semibold">Keep your account secure with regular password updates</p>
          </div>
        </div>

        {passMessage && (
          <div className={`p-4 rounded-2xl text-xs font-bold border ${
            passMessage.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-red-50 border-red-100 text-red-700'
          }`}>
            {passMessage.text}
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 text-xs font-bold text-[#374151]">
            <div className="space-y-1.5">
              <label>Current Password</label>
              <input 
                type="password" 
                value={passwordFields.oldPassword}
                onChange={(e) => setPasswordFields({ ...passwordFields, oldPassword: e.target.value })}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 bg-[#FAFBFC] border border-[#E5E9F0] rounded-xl font-semibold text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/15 focus:border-[#7C3AED]"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label>New Password</label>
              <input 
                type="password" 
                value={passwordFields.newPassword}
                onChange={(e) => setPasswordFields({ ...passwordFields, newPassword: e.target.value })}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 bg-[#FAFBFC] border border-[#E5E9F0] rounded-xl font-semibold text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/15 focus:border-[#7C3AED]"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label>Confirm New Password</label>
              <input 
                type="password" 
                value={passwordFields.confirmPassword}
                onChange={(e) => setPasswordFields({ ...passwordFields, confirmPassword: e.target.value })}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 bg-[#FAFBFC] border border-[#E5E9F0] rounded-xl font-semibold text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/15 focus:border-[#7C3AED]"
                required
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button 
              type="submit"
              disabled={passLoading}
              className="px-5 py-2.5 bg-[#111827] hover:bg-[#1F2937] text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
            >
              {passLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Lock className="w-3.5 h-3.5" />}
              <span>Update Password</span>
            </button>
          </div>
        </form>
      </div>

      {/* GitHub Repository Picker Modal */}
      <GithubRepoPickerModal
        open={showRepoPicker}
        onClose={() => setShowRepoPicker(false)}
        onImportSuccess={() => {
          refreshUser?.();
        }}
      />

      {/* Confirmation Dialog */}
      {confirmDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={() => setConfirmDialog(null)}
          />
          
          <div className="relative bg-white border border-[#E5E9F0] rounded-3xl p-6 sm:p-7 shadow-2xl max-w-sm w-full z-10 text-center space-y-4 animate-fadeIn">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            
            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-[#111827]">{confirmDialog.title}</h3>
              <p className="text-xs text-[#6B7280] font-semibold leading-relaxed">
                {confirmDialog.message}
              </p>
            </div>
            
            <div className="flex gap-2.5 pt-2">
              <button
                onClick={() => setConfirmDialog(null)}
                className="flex-1 py-2.5 bg-white border border-[#E5E9F0] hover:bg-gray-50 text-[#374151] font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmDialog.onConfirm}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors cursor-pointer"
              >
                Disconnect
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

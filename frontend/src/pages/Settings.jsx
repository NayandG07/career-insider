import React, { useState, useEffect } from 'react';
import { 
  Lock,
  RefreshCw,
  Sliders,
  Bell,
  ShieldCheck,
  Github,
  Code,
  Terminal,
  Award,
  FileText,
  CheckCircle2,
  AlertCircle,
  X,
  ExternalLink,
  Save,
  Download,
  Edit2,
  Check,
  User,
  Mail,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { userService } from '../services/userService';
import { githubService } from '../services/githubService';
import { codeforcesService } from '../services/codeforcesService';
import { leetcodeService } from '../services/leetcodeService';
import { kaggleService } from '../services/kaggleService';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import GithubRepoPickerModal from '../components/GithubRepoPickerModal';

export default function Settings() {
  const { userData, refreshUser } = useApp();
  const { showToast } = useToast();

  // Modal State
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

  // GitHub Connection State
  const githubUsername = userData?.connectedSources?.github || userData?.auth?.github?.username || '';
  const isGithubConnected = !!(githubUsername || userData?.auth?.github?.id);

  // Codeforces Profile State
  const [cfProfile, setCfProfile] = useState(null);
  const cfHandle = userData?.connectedSources?.codeforces || '';
  const isCfConnected = !!cfHandle;

  // LeetCode Profile State
  const [lcProfile, setLcProfile] = useState(null);
  const lcHandle = userData?.connectedSources?.leetcode || '';
  const isLcConnected = !!lcHandle;

  // Kaggle Profile State
  const [kgProfile, setKgProfile] = useState(null);
  const kgUsername = userData?.connectedSources?.kaggle?.username || (typeof userData?.connectedSources?.kaggle === 'string' ? userData.connectedSources.kaggle : '');
  const isKgConnected = !!kgUsername;

  // Load Codeforces Profile data if connected
  useEffect(() => {
    if (isCfConnected) {
      codeforcesService.getProfile()
        .then(res => {
          if (res.connected && res.data) {
            setCfProfile(res.data);
          }
        })
        .catch(() => {});
    } else {
      setCfProfile(null);
    }
  }, [isCfConnected]);

  // Load LeetCode Profile data if connected
  useEffect(() => {
    if (isLcConnected) {
      leetcodeService.getProfile()
        .then(res => {
          if (res.connected && res.data) {
            setLcProfile(res.data);
          }
        })
        .catch(() => {});
    } else {
      setLcProfile(null);
    }
  }, [isLcConnected]);

  // Load Kaggle Profile data if connected
  useEffect(() => {
    if (isKgConnected) {
      kaggleService.getProfile()
        .then(res => {
          if (res.connected && res.data) {
            setKgProfile(res.data);
          }
        })
        .catch(() => {});
    } else {
      setKgProfile(null);
    }
  }, [isKgConnected]);

  // Platform Handles State (LeetCode, Codeforces, Kaggle, CodeChef)
  const [editingPlatform, setEditingPlatform] = useState(null); // 'leetcode' | 'codeforces' | 'kaggle' | 'codechef'
  const [platformInput, setPlatformInput] = useState('');
  const [platformSaving, setPlatformSaving] = useState(false);

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
    if (!profileName.trim()) {
      showToast?.('Name cannot be empty.', 'error');
      return;
    }
    setProfileLoading(true);
    try {
      await userService.updateMe({
        name: profileName.trim(),
        bio: profileBio.trim(),
      });
      await refreshUser?.();
      setIsEditingProfile(false);
      showToast?.('Profile updated successfully.', 'success');
    } catch (err) {
      console.error(err);
      showToast?.(err.response?.data?.error || 'Failed to update profile.', 'error');
    } finally {
      setProfileLoading(false);
    }
  };

  // Handle GitHub OAuth Launch / Disconnect
  const handleGithubAction = async () => {
    if (isGithubConnected) {
      setConfirmDialog({
        title: 'Disconnect GitHub',
        message: 'Are you sure you want to disconnect your GitHub account from CareerOS? Your imported repository projects will remain, but you will not be able to sync or import new ones.',
        onConfirm: async () => {
          try {
            await githubService.disconnect();
            await refreshUser?.();
            showToast?.('GitHub disconnected.', 'info');
          } catch (err) {
            console.error(err);
            showToast?.('Failed to disconnect GitHub.', 'error');
          } finally {
            setConfirmDialog(null);
          }
        }
      });
    } else {
      const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const token = localStorage.getItem('accessToken');
      const url = `${backendUrl}/api/auth/github${token ? `?token=${encodeURIComponent(token)}` : ''}`;
      window.open(url, '_blank');
    }
  };

  // Handle Codeforces Connect / Sync / Disconnect
  const handleConnectCodeforces = async () => {
    if (!platformInput.trim()) return;
    setPlatformSaving(true);
    const cleanHandle = platformInput.trim().replace(/^@/, '');
    try {
      const res = await codeforcesService.connect(cleanHandle);
      setCfProfile(res.data);
      await refreshUser?.();
      setEditingPlatform(null);
      setPlatformInput('');
      showToast?.(`Codeforces connected as @${cleanHandle}`, 'success');
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.error || err.message;
      if (msg && msg.toLowerCase().includes('not found')) {
        showToast?.('Codeforces handle not found.', 'error');
      } else {
        showToast?.('Unable to connect to Codeforces right now. Please try again.', 'error');
      }
    } finally {
      setPlatformSaving(false);
    }
  };

  const handleSyncCodeforces = async () => {
    setCfSyncing(true);
    try {
      const res = await codeforcesService.sync();
      setCfProfile(res.data);
      await refreshUser?.();
      showToast?.('Codeforces profile synced successfully!', 'success');
    } catch (err) {
      console.error(err);
      showToast?.(err.response?.data?.error || 'Unable to sync Codeforces right now. Please try again.', 'error');
    } finally {
      setCfSyncing(false);
    }
  };

  const handleDisconnectCodeforces = () => {
    setConfirmDialog({
      title: 'Disconnect Codeforces',
      message: 'Are you sure you want to disconnect your Codeforces account handle from CareerOS?',
      onConfirm: async () => {
        try {
          await codeforcesService.disconnect();
          setCfProfile(null);
          await refreshUser?.();
          showToast?.('Codeforces disconnected.', 'info');
        } catch (err) {
          console.error(err);
          showToast?.('Failed to disconnect Codeforces.', 'error');
        } finally {
          setConfirmDialog(null);
        }
      }
    });
  };

  // Handle Other Platform Handles Connect / Disconnect (LeetCode, Kaggle, CodeChef)
  const handleSavePlatformHandle = async (key) => {
    if (key === 'codeforces') {
      return handleConnectCodeforces();
    }

    if (!platformInput.trim()) return;
    setPlatformSaving(true);
    const cleanHandle = platformInput.trim().replace(/^@/, '');

    try {
      if (key === 'leetcode') {
        const res = await leetcodeService.connect(cleanHandle);
        setLcProfile(res.data);
        await refreshUser?.();
        setEditingPlatform(null);
        setPlatformInput('');
        showToast?.(`LeetCode connected as @${cleanHandle}`, 'success');
        return;
      }

      if (key === 'kaggle') {
        const res = await kaggleService.connect(cleanHandle);
        setKgProfile(res.data);
        await refreshUser?.();
        setEditingPlatform(null);
        setPlatformInput('');
        showToast?.(`Kaggle connected as @${cleanHandle}`, 'success');
        return;
      }

      const currentSources = userData?.connectedSources || {};
      let updatedSources = { ...currentSources };
      updatedSources[key] = cleanHandle;

      await userService.updateMe({ connectedSources: updatedSources });
      await refreshUser?.();
      setEditingPlatform(null);
      setPlatformInput('');
      showToast?.(`Connected ${key} as @${cleanHandle}`, 'success');
    } catch (err) {
      console.error(err);
      showToast?.(err.response?.data?.error || `Failed to update ${key}.`, 'error');
    } finally {
      setPlatformSaving(false);
    }
  };

  const handleDisconnectPlatform = async (key) => {
    if (key === 'codeforces') {
      return handleDisconnectCodeforces();
    }

    setConfirmDialog({
      title: `Disconnect ${key.charAt(0).toUpperCase() + key.slice(1)}`,
      message: `Are you sure you want to disconnect your ${key} account handle from CareerOS?`,
      onConfirm: async () => {
        try {
          if (key === 'leetcode') {
            await leetcodeService.disconnect();
            setLcProfile(null);
            await refreshUser?.();
            showToast?.('LeetCode disconnected.', 'info');
            return;
          }

          if (key === 'kaggle') {
            await kaggleService.disconnect();
            setKgProfile(null);
            await refreshUser?.();
            showToast?.('Kaggle disconnected.', 'info');
            return;
          }

          const currentSources = userData?.connectedSources || {};
          let updatedSources = { ...currentSources };
          updatedSources[key] = '';

          await userService.updateMe({ connectedSources: updatedSources });
          await refreshUser?.();
          showToast?.(`Disconnected ${key}.`, 'info');
        } catch (err) {
          console.error(err);
          showToast?.(`Failed to disconnect ${key}.`, 'error');
        } finally {
          setConfirmDialog(null);
        }
      }
    });
  };

  // Handle Password Change
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPassLoading(true);
    setPassMessage(null);

    if (passwordFields.newPassword !== passwordFields.confirmPassword) {
      setPassMessage({ type: 'error', text: 'New passwords do not match!' });
      setPassLoading(false);
      return;
    }

    try {
      const res = await userService.changePassword({
        oldPassword: passwordFields.oldPassword,
        newPassword: passwordFields.newPassword
      });
      setPassMessage({ type: 'success', text: res.message || 'Password updated successfully!' });
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
        codeforces: cfProfile,
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

  const kaggleHandle = typeof userData?.connectedSources?.kaggle === 'object' 
    ? userData?.connectedSources?.kaggle?.username 
    : (userData?.connectedSources?.kaggle || '');

  const platforms = [
    {
      key: 'github',
      name: "GitHub Repositories & Commits",
      desc: isGithubConnected 
        ? `Connected as @${githubUsername}` 
        : "Syncs public/private repositories, commit activity, and language breakdown.",
      icon: Github,
      isConnected: isGithubConnected,
      handle: githubUsername,
      isOAuth: true,
    },
    {
      key: 'codeforces',
      name: "Codeforces Competitive Rating",
      desc: isCfConnected 
        ? `Connected as @${cfHandle}${cfProfile?.rating ? ` • Rating: ${cfProfile.rating} (${cfProfile.rank || 'Ranked'})` : ''}` 
        : "Syncs contest rankings, rating progression, and contest submission history.",
      icon: Award,
      isConnected: isCfConnected,
      handle: cfHandle,
      isOAuth: false,
    },
    {
      key: 'leetcode',
      name: "LeetCode Algorithm Activity",
      desc: userData?.connectedSources?.leetcode 
        ? `Connected as @${userData.connectedSources.leetcode}` 
        : "Syncs problems solved, submission acceptance rates, and contest ranking.",
      icon: Code,
      isConnected: !!userData?.connectedSources?.leetcode,
      handle: userData?.connectedSources?.leetcode || '',
      isOAuth: false,
    },
    {
      key: 'kaggle',
      name: "Kaggle Competitions & Datasets",
      desc: kaggleHandle 
        ? `Connected as @${kaggleHandle}` 
        : "Indexes machine learning models, competition rankings, and notebook benchmarks.",
      icon: Terminal,
      isConnected: !!kaggleHandle,
      handle: kaggleHandle,
      isOAuth: false,
    },
    {
      key: 'codechef',
      name: "CodeChef Division & Stars",
      desc: userData?.connectedSources?.codechef 
        ? `Connected as @${userData.connectedSources.codechef}` 
        : "Syncs star rating, global rank, and contest solving metrics.",
      icon: Award,
      isConnected: !!userData?.connectedSources?.codechef,
      handle: userData?.connectedSources?.codechef || '',
      isOAuth: false,
    }
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
    <div className="max-w-4xl mx-auto space-y-6 pb-16 animate-fadeIn text-left">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#111827] tracking-tight">
            Settings & Integrations
          </h1>
          <p className="text-xs font-semibold text-[#6B7280] mt-1">
            Manage your developer identity, platform connections, notifications, and security.
          </p>
        </div>

        <button
          onClick={handleExportData}
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-[#E5E9F0] hover:bg-[#FAFBFC] text-xs font-bold text-[#374151] rounded-xl shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Download className="w-4 h-4 text-[#6B7280]" />
          <span>Export Data</span>
        </button>
      </div>

      {/* Notice Banner */}
      {notice && (
        <div className="p-4 rounded-2xl border bg-purple-50 border-purple-200 text-[#7C3AED] flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="text-xs font-bold">{notice.text}</p>
          </div>
          <button
            onClick={() => setNotice(null)}
            className="p-1 rounded-lg hover:bg-black/5 text-gray-500 cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Section 1: Profile & Identity Overview */}
      <div className="bg-white border border-[#E5E9F0] rounded-2xl p-6 shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-[#F3F4F6] pb-4">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-[#7C3AED]" />
            <h2 className="text-sm font-bold text-[#111827]">Account & Profile</h2>
          </div>

          {!isEditingProfile ? (
            <button
              onClick={() => setIsEditingProfile(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#F9FAFB] hover:bg-[#F3F4F6] text-[#374151] border border-[#E5E9F0] transition-colors cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5 text-[#6B7280]" />
              <span>Edit Profile</span>
            </button>
          ) : (
            <button
              onClick={() => setIsEditingProfile(false)}
              className="px-3 py-1.5 rounded-lg text-xs font-bold text-[#6B7280] hover:text-[#111827] cursor-pointer"
            >
              Cancel
            </button>
          )}
        </div>

        {!isEditingProfile ? (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {userData?.avatar ? (
                <img
                  src={userData.avatar}
                  alt={userData?.name}
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-purple-100 shadow-sm"
                />
              ) : (
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#7C3AED] to-[#6366F1] flex items-center justify-center text-white font-black text-xl shadow-sm">
                  {userData?.name ? userData.name.charAt(0).toUpperCase() : 'U'}
                </div>
              )}

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-[#111827]">
                    {userData?.name || 'Developer'}
                  </h3>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-purple-50 text-[#7C3AED] border border-purple-200">
                    {userData?.role === 'admin' ? 'Admin' : 'Student'}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-[#6B7280]">
                  <span className="inline-flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5" />
                    {userData?.email || 'No email registered'}
                  </span>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    Joined {memberSince}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-[#FAFBFC] border border-[#E5E9F0] rounded-xl px-4 py-2.5 text-center shrink-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF] block">Readiness Score</span>
              <span className="text-lg font-black text-[#7C3AED]">{userData?.readinessScore || 0}%</span>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSaveProfile} className="space-y-4 pt-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold text-[#374151]">
              <div className="space-y-1.5">
                <label>Full Name</label>
                <input
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  placeholder="Your Name"
                  className="w-full px-3.5 py-2 bg-[#FAFBFC] border border-[#E5E9F0] rounded-xl font-semibold text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/10 focus:border-[#7C3AED]"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label>Email Address</label>
                <input
                  type="email"
                  disabled
                  value={userData?.email || ''}
                  className="w-full px-3.5 py-2 bg-[#F3F4F6] border border-[#E5E9F0] rounded-xl font-semibold text-[#9CA3AF] cursor-not-allowed"
                />
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <label>Developer Bio / Headline</label>
                <input
                  type="text"
                  value={profileBio}
                  onChange={(e) => setProfileBio(e.target.value)}
                  placeholder="e.g. Full-Stack Developer & Competitive Programmer"
                  className="w-full px-3.5 py-2 bg-[#FAFBFC] border border-[#E5E9F0] rounded-xl font-semibold text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/10 focus:border-[#7C3AED]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
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
                className="px-4 py-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                {profileLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                <span>Save Changes</span>
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Section 2: Platform Integrations */}
      <div className="bg-white border border-[#E5E9F0] rounded-2xl p-6 shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-[#F3F4F6] pb-4">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#7C3AED]" />
            <h2 className="text-sm font-bold text-[#111827]">
              Platform Integrations & External Sources
            </h2>
          </div>
          <span className="text-[11px] font-bold text-[#6B7280]">
            {platforms.filter(p => p.isConnected).length} of {platforms.length} Connected
          </span>
        </div>

        <div className="divide-y divide-[#F3F4F6]">
          {platforms.map((plat) => {
            const Icon = plat.icon;
            const isEditing = editingPlatform === plat.key;

            return (
              <div key={plat.key} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 first:pt-0 last:pb-0">
                <div className="flex items-start gap-3.5">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    plat.isConnected ? 'bg-purple-50 text-[#7C3AED]' : 'bg-gray-100 text-gray-500'
                  }`}>
                    <Icon className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs font-bold text-[#111827]">{plat.name}</h3>
                      {plat.isConnected && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <Check className="w-2.5 h-2.5" />
                          Connected
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#6B7280] font-semibold mt-0.5">{plat.desc}</p>
                    
                    {/* Rich Codeforces Stats Row */}
                    {plat.key === 'codeforces' && isCfConnected && cfProfile && (
                      <div className="flex flex-wrap items-center gap-3 mt-2 text-[11px] font-bold">
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md border border-blue-100">
                          Rating: {cfProfile.rating || 'Unrated'}
                        </span>
                        <span className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded-md border border-purple-100">
                          Max: {cfProfile.maxRating || 'Unrated'}
                        </span>
                        <span className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded-md border border-amber-100 capitalize">
                          Rank: {cfProfile.rank || 'Unrated'}
                        </span>
                        <span className="text-gray-400 font-normal">
                          {cfProfile.contestCount || 0} contests • {cfProfile.solvedCount || 0} solved
                        </span>
                      </div>
                    )}

                    {/* Rich LeetCode Stats Row */}
                    {plat.key === 'leetcode' && isLcConnected && lcProfile && (
                      <div className="flex flex-wrap items-center gap-3 mt-2 text-[11px] font-bold">
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md border border-emerald-100">
                          Total Solved: {lcProfile.totalSolved || 0}
                        </span>
                        <span className="px-2 py-0.5 bg-green-50 text-green-700 rounded-md border border-green-100">
                          Easy: {lcProfile.easySolved || 0}
                        </span>
                        <span className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded-md border border-amber-100">
                          Med: {lcProfile.mediumSolved || 0}
                        </span>
                        <span className="px-2 py-0.5 bg-red-50 text-red-700 rounded-md border border-red-100">
                          Hard: {lcProfile.hardSolved || 0}
                        </span>
                        {lcProfile.ranking && (
                          <span className="text-gray-400 font-normal">
                            Rank #{lcProfile.ranking.toLocaleString()}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Rich Kaggle Stats Row */}
                    {plat.key === 'kaggle' && isKgConnected && kgProfile && (
                      <div className="flex flex-wrap items-center gap-3 mt-2 text-[11px] font-bold">
                        <span className="px-2 py-0.5 bg-sky-50 text-sky-700 rounded-md border border-sky-100">
                          Notebooks: {kgProfile.notebooks?.count || 0}
                        </span>
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md border border-blue-100">
                          Datasets: {kgProfile.datasets?.count || 0}
                        </span>
                        <span className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded-md border border-purple-100">
                          Competitions: {kgProfile.competitions?.count || 0}
                        </span>
                        <span className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded-md border border-amber-100 capitalize">
                          Tier: {kgProfile.tier || 'Active Member'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  {/* GitHub Specific Actions */}
                  {plat.isOAuth ? (
                    plat.isConnected ? (
                      <>
                        <button 
                          onClick={() => setShowRepoPicker(true)}
                          className="px-3 py-1.5 rounded-lg text-[11px] font-bold bg-purple-50 text-[#7C3AED] border border-purple-200 hover:bg-purple-100 transition-all cursor-pointer inline-flex items-center gap-1.5"
                        >
                          <Github className="w-3.5 h-3.5" />
                          <span>Manage Repositories</span>
                        </button>
                        <button 
                          onClick={handleGithubAction}
                          className="px-3 py-1.5 rounded-lg text-[11px] font-bold bg-gray-50 text-red-600 border border-gray-200 hover:bg-red-50 transition-all cursor-pointer"
                        >
                          Disconnect
                        </button>
                      </>
                    ) : (
                      <button 
                        onClick={handleGithubAction}
                        className="px-3.5 py-1.5 rounded-lg text-[11px] font-bold bg-[#111827] text-white hover:bg-[#1F2937] transition-all cursor-pointer inline-flex items-center gap-1.5"
                      >
                        <Github className="w-3.5 h-3.5" />
                        <span>Connect GitHub</span>
                      </button>
                    )
                  ) : (
                    /* Handle-based Platforms (Codeforces, LeetCode, Kaggle, CodeChef) */
                    isEditing ? (
                      <div className="flex items-center gap-1.5">
                        <div className="relative">
                          <span className="absolute left-2.5 top-1.5 text-[11px] font-bold text-gray-400">@</span>
                          <input
                            type="text"
                            value={platformInput}
                            onChange={(e) => setPlatformInput(e.target.value)}
                            placeholder={plat.key === 'codeforces' ? 'e.g. tourist' : 'username'}
                            className="bg-[#FAFBFC] border border-[#E5E9F0] rounded-lg pl-6 pr-2.5 py-1 text-xs font-semibold text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/10 focus:border-[#7C3AED] w-32"
                            autoFocus
                          />
                        </div>
                        <button
                          onClick={() => handleSavePlatformHandle(plat.key)}
                          disabled={platformSaving || !platformInput.trim()}
                          className="px-2.5 py-1 bg-[#7C3AED] text-white rounded-lg text-[11px] font-bold hover:bg-[#6D28D9] cursor-pointer disabled:opacity-50 inline-flex items-center gap-1"
                        >
                          {platformSaving ? (
                            <>
                              <RefreshCw className="w-3 h-3 animate-spin" />
                              <span>Connecting...</span>
                            </>
                          ) : (
                            <span>Connect</span>
                          )}
                        </button>
                        <button
                          onClick={() => { setEditingPlatform(null); setPlatformInput(''); }}
                          className="p-1 text-gray-400 hover:text-gray-600 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : plat.isConnected ? (
                      <>
                        <button
                          onClick={() => { setEditingPlatform(plat.key); setPlatformInput(plat.handle); }}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-gray-50 text-[#374151] border border-gray-200 hover:bg-gray-100 cursor-pointer"
                        >
                          Edit Handle
                        </button>
                        <button
                          onClick={() => handleDisconnectPlatform(plat.key)}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-red-600 hover:bg-red-50 border border-gray-200 cursor-pointer"
                        >
                          Disconnect
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => { setEditingPlatform(plat.key); setPlatformInput(''); }}
                        className="px-3.5 py-1.5 rounded-lg text-[11px] font-bold bg-[#F9FAFB] text-[#374151] border border-[#E5E9F0] hover:bg-[#F3F4F6] transition-all cursor-pointer"
                      >
                        {plat.key === 'codeforces' ? 'Connect Codeforces' : 'Connect Handle'}
                      </button>
                    )
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 3: Notification Preferences */}
      <div className="bg-white border border-[#E5E9F0] rounded-2xl p-6 shadow-xs space-y-5">
        <div className="flex items-center gap-2 border-b border-[#F3F4F6] pb-4">
          <Bell className="w-4 h-4 text-[#7C3AED]" />
          <h2 className="text-sm font-bold text-[#111827]">
            Notification Preferences & Alerts
          </h2>
        </div>

        <div className="divide-y divide-[#F3F4F6]">
          {notificationOptions.map((opt) => {
            const isActive = !!notifications[opt.key];
            return (
              <div key={opt.key} className="py-3.5 flex items-center justify-between gap-4 first:pt-0 last:pb-0">
                <div>
                  <h3 className="text-xs font-bold text-[#111827]">{opt.name}</h3>
                  <p className="text-[11px] text-[#6B7280] font-semibold">{opt.desc}</p>
                </div>

                <button 
                  onClick={() => toggleNotification(opt.key)}
                  className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer focus:outline-none shrink-0 ${
                    isActive ? 'bg-[#7C3AED]' : 'bg-[#E5E9F0]'
                  }`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full transition-transform shadow-xs ${
                    isActive ? 'translate-x-4' : 'translate-x-0'
                  }`} />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 4: Password & Security */}
      <div className="bg-white border border-[#E5E9F0] rounded-2xl p-6 shadow-xs space-y-5">
        <div className="flex items-center gap-2 border-b border-[#F3F4F6] pb-4">
          <ShieldCheck className="w-4 h-4 text-[#7C3AED]" />
          <h2 className="text-sm font-bold text-[#111827]">
            Account Security & Password
          </h2>
        </div>

        {passMessage && (
          <div className={`p-3.5 rounded-xl text-xs font-bold border ${
            passMessage.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-red-50 border-red-100 text-red-700'
          }`}>
            {passMessage.text}
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-bold text-[#374151]">
            <div className="space-y-1.5">
              <label>Current Password</label>
              <input 
                type="password" 
                value={passwordFields.oldPassword}
                onChange={(e) => setPasswordFields({ ...passwordFields, oldPassword: e.target.value })}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 bg-[#FAFBFC] border border-[#E5E9F0] rounded-xl font-semibold text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/10 focus:border-[#7C3AED]"
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
                className="w-full px-3.5 py-2.5 bg-[#FAFBFC] border border-[#E5E9F0] rounded-xl font-semibold text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/10 focus:border-[#7C3AED]"
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
                className="w-full px-3.5 py-2.5 bg-[#FAFBFC] border border-[#E5E9F0] rounded-xl font-semibold text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/10 focus:border-[#7C3AED]"
                required
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button 
              type="submit"
              disabled={passLoading}
              className="px-4 py-2 bg-[#111827] hover:bg-[#1F2937] text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
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

      {/* Custom In-App Confirmation Dialog Card */}
      {confirmDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop with premium blur */}
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={() => setConfirmDialog(null)}
          />
          
          {/* Confirm Dialog Card */}
          <div className="relative bg-white border border-[#E5E9F0] rounded-3xl p-6 shadow-2xl max-w-sm w-full z-10 text-center space-y-4 animate-fadeIn">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
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

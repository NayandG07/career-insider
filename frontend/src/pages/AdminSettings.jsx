import React, { useState, useEffect, useRef } from 'react';
import { adminService } from '../services/adminService';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Key, Plus, Trash2, RefreshCw, Cpu, Save, Edit2, Check, X,
  Eye, EyeOff, ToggleLeft, ToggleRight, Shield, AlertTriangle,
  ChevronDown, Activity, Zap, CheckCircle2
} from 'lucide-react';

// ─── Constants ────────────────────────────────────────────────────────────────

const PROVIDERS = ['gemini', 'openai', 'huggingface'];

const PROVIDER_META = {
  gemini: { label: 'Gemini', color: 'bg-blue-100 text-blue-700 border-blue-200', dot: 'bg-blue-500' },
  openai: { label: 'OpenAI', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  huggingface: { label: 'HuggingFace', color: 'bg-yellow-100 text-yellow-700 border-yellow-200', dot: 'bg-yellow-500' },
};

const STATUS_META = {
  ok: { label: 'OK', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
  rate_limited: { label: 'Rate Limited', color: 'text-amber-600 bg-amber-50 border-amber-200' },
  failed: { label: 'Failed', color: 'text-red-600 bg-red-50 border-red-200' },
};

const MODEL_PRESETS = {
  gemini: ['gemini-3.6-flash', 'gemini-2.5-pro', 'gemini-2.0-flash-exp'],
  openai: ['gpt-4o-mini', 'gpt-4o', 'gpt-4-turbo', 'gpt-3.5-turbo'],
  huggingface: [
    'mistralai/Mistral-7B-Instruct-v0.3',
    'meta-llama/Meta-Llama-3-8B-Instruct',
    'HuggingFaceH4/zephyr-7b-beta',
    'mistralai/Mixtral-8x7B-Instruct-v0.1',
  ],
};

const TASK_META = {
  skill_analyze: { label: 'Skill Analysis', icon: '🧠', desc: 'Analyzes GitHub, LeetCode & telemetry to build skill profile' },
  roadmap_gen: { label: 'Roadmap Generator', icon: '🗺️', desc: 'Generates personalized career roadmaps with milestones' },
  company_match: { label: 'Company Matching', icon: '🏢', desc: 'Scores company compatibility against your skill profile' },
  mentor_chat: { label: 'AI Mentor Chat', icon: '💬', desc: 'Conversational AI mentor for career coaching and prep' },
  resume_parse: { label: 'Resume Parser', icon: '📄', desc: 'Extracts structured skills and experience from resume text' },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function ProviderBadge({ provider }) {
  const meta = PROVIDER_META[provider] || { label: provider, color: 'bg-gray-100 text-gray-600 border-gray-200' };
  return (
    <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full border ${meta.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${meta.dot || 'bg-gray-400'}`} />
      {meta.label}
    </span>
  );
}

function StatusBadge({ status }) {
  const meta = STATUS_META[status] || { label: status, color: 'text-gray-500 bg-gray-50 border-gray-200' };
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${meta.color}`}>
      {meta.label}
    </span>
  );
}

// ─── API Key Pool Tab ─────────────────────────────────────────────────────────

function ApiKeyPool({ keys, onRefresh }) {
  const [showAdd, setShowAdd] = useState(false);
  const [provider, setProvider] = useState('gemini');
  const [keyValue, setKeyValue] = useState('');
  const [label, setLabel] = useState('');
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editLabel, setEditLabel] = useState('');
  const [editKey, setEditKey] = useState('');
  const [showKey, setShowKey] = useState({});
  const [togglingId, setTogglingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [savingEditId, setSavingEditId] = useState(null);

  // Group keys by provider for the summary
  const summary = PROVIDERS.reduce((acc, p) => {
    acc[p] = keys.filter(k => k.provider === p);
    return acc;
  }, {});

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!keyValue.trim()) return;
    setSaving(true);
    try {
      const lbl = label.trim() || `${PROVIDER_META[provider]?.label || provider} Key ${new Date().toLocaleDateString()}`;
      await adminService.addApiKey({ provider, label: lbl, key: keyValue.trim() });
      setKeyValue('');
      setLabel('');
      setShowAdd(false);
      await onRefresh();
    } catch (err) {
      alert('Failed to add API key: ' + (err.response?.data?.error || err.message));
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (k) => {
    setTogglingId(k.id);
    try {
      await adminService.toggleApiKey(k.id, !k.isActive);
      await onRefresh();
    } catch (err) {
      alert('Failed to update key.');
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this API key? This cannot be undone.')) return;
    setDeletingId(id);
    try {
      await adminService.deleteApiKey(id);
      await onRefresh();
    } catch (err) {
      alert('Failed to delete key.');
    } finally {
      setDeletingId(null);
    }
  };

  const startEdit = (k) => {
    setEditingId(k.id);
    setEditLabel(k.label);
    setEditKey('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditLabel('');
    setEditKey('');
  };

  const saveEdit = async (id) => {
    setSavingEditId(id);
    try {
      const data = { label: editLabel };
      if (editKey.trim()) data.key = editKey.trim();
      await adminService.updateApiKey(id, data);
      cancelEdit();
      await onRefresh();
    } catch (err) {
      alert('Failed to save changes.');
    } finally {
      setSavingEditId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Provider Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        {PROVIDERS.map(p => {
          const pKeys = summary[p];
          const active = pKeys.filter(k => k.isActive).length;
          const ok = pKeys.filter(k => k.status === 'ok' && k.isActive).length;
          const meta = PROVIDER_META[p];
          return (
            <div key={p} className="bg-white border border-[#E5E9F0] rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <ProviderBadge provider={p} />
                <span className="text-[10px] text-[#9CA3AF] font-bold">{pKeys.length} total</span>
              </div>
              <div className="text-2xl font-black text-[#111827]">{active}</div>
              <div className="text-[11px] text-[#6B7280] font-semibold mt-0.5">
                active · {ok} healthy
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Key */}
      <div className="bg-white border border-[#E5E9F0] rounded-2xl shadow-sm overflow-hidden">
        <button
          onClick={() => setShowAdd(v => !v)}
          className="w-full flex items-center justify-between px-5 py-4 hover:bg-[#FAFBFC] transition-colors cursor-pointer"
        >
          <span className="flex items-center gap-2 text-sm font-bold text-[#111827]">
            <Plus className="w-4 h-4 text-[#7C3AED]" />
            Add New API Key
          </span>
          <ChevronDown className={`w-4 h-4 text-[#9CA3AF] transition-transform ${showAdd ? 'rotate-180' : ''}`} />
        </button>

        <AnimatePresence>
          {showAdd && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <form onSubmit={handleAdd} className="px-5 pb-5 space-y-4 border-t border-[#F3F4F6] pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-[#374151] mb-1.5">Provider</label>
                    <select
                      value={provider}
                      onChange={e => setProvider(e.target.value)}
                      className="w-full bg-[#F9FAFB] border border-[#E5E9F0] rounded-xl px-3 py-2 text-xs font-semibold text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/10 focus:border-[#7C3AED]"
                    >
                      {PROVIDERS.map(p => (
                        <option key={p} value={p}>{PROVIDER_META[p]?.label || p}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#374151] mb-1.5">Label (optional)</label>
                    <input
                      value={label}
                      onChange={e => setLabel(e.target.value)}
                      placeholder="e.g. Primary Gemini Key"
                      className="w-full bg-[#F9FAFB] border border-[#E5E9F0] rounded-xl px-3 py-2 text-xs font-semibold text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/10 focus:border-[#7C3AED] placeholder-[#9CA3AF]"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#374151] mb-1.5">API Key Value</label>
                  <input
                    type="password"
                    value={keyValue}
                    onChange={e => setKeyValue(e.target.value)}
                    placeholder="Paste your API key here"
                    required
                    className="w-full bg-[#F9FAFB] border border-[#E5E9F0] rounded-xl px-3 py-2 text-xs font-mono text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/10 focus:border-[#7C3AED] placeholder-[#9CA3AF]"
                  />
                  <p className="text-[10px] text-[#9CA3AF] font-semibold mt-1">Key is AES-256 encrypted before storing in database.</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="submit"
                    disabled={saving || !keyValue.trim()}
                    className="px-4 py-2 bg-[#7C3AED] hover:bg-[#6D28D9] disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Key className="w-3.5 h-3.5" />}
                    {saving ? 'Encrypting & Saving…' : 'Save Key'}
                  </button>
                  <button type="button" onClick={() => setShowAdd(false)} className="text-xs font-semibold text-[#6B7280] hover:text-[#374151] cursor-pointer">
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Keys Table */}
      <div className="bg-white border border-[#E5E9F0] rounded-2xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-[#F3F4F6]">
          <h3 className="text-xs font-bold text-[#111827] uppercase tracking-wider">API Key Pool</h3>
          <p className="text-[11px] text-[#6B7280] font-semibold mt-0.5">{keys.length} key{keys.length !== 1 ? 's' : ''} configured</p>
        </div>

        {keys.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-[#9CA3AF] font-semibold">
            No API keys yet. Add one above.
          </div>
        ) : (
          <div className="divide-y divide-[#F3F4F6]">
            {keys.map(k => (
              <div key={k.id} className="px-5 py-4">
                {editingId === k.id ? (
                  // Edit Row
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-[#374151] mb-1">Label</label>
                        <input
                          value={editLabel}
                          onChange={e => setEditLabel(e.target.value)}
                          className="w-full bg-[#F9FAFB] border border-[#E5E9F0] rounded-lg px-3 py-1.5 text-xs font-semibold text-[#111827] focus:outline-none focus:border-[#7C3AED]"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-[#374151] mb-1">New Key Value (leave blank to keep current)</label>
                        <input
                          type="password"
                          value={editKey}
                          onChange={e => setEditKey(e.target.value)}
                          placeholder="Paste new key to replace"
                          className="w-full bg-[#F9FAFB] border border-[#E5E9F0] rounded-lg px-3 py-1.5 text-xs font-mono text-[#111827] focus:outline-none focus:border-[#7C3AED] placeholder-[#9CA3AF]"
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => saveEdit(k.id)}
                        disabled={savingEditId === k.id}
                        className="px-3 py-1.5 bg-[#7C3AED] text-white text-[10px] font-bold rounded-lg flex items-center gap-1.5 cursor-pointer"
                      >
                        {savingEditId === k.id ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                        Save
                      </button>
                      <button onClick={cancelEdit} className="px-3 py-1.5 bg-white border border-[#E5E9F0] text-[#6B7280] text-[10px] font-bold rounded-lg flex items-center gap-1.5 cursor-pointer">
                        <X className="w-3 h-3" />
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  // Display Row
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <ProviderBadge provider={k.provider} />
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-[#111827] truncate">{k.label}</div>
                        <div className="text-[10px] text-[#9CA3AF] font-mono mt-0.5">{k.keyFingerprint || '••••••••...••••••••'}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <StatusBadge status={k.status} />
                      {/* Active Toggle */}
                      <button
                        onClick={() => handleToggle(k)}
                        disabled={togglingId === k.id}
                        title={k.isActive ? 'Disable key' : 'Enable key'}
                        className="cursor-pointer"
                      >
                        {togglingId === k.id ? (
                          <RefreshCw className="w-4 h-4 text-[#7C3AED] animate-spin" />
                        ) : k.isActive ? (
                          <ToggleRight className="w-5 h-5 text-[#10B981]" />
                        ) : (
                          <ToggleLeft className="w-5 h-5 text-[#D1D5DB]" />
                        )}
                      </button>
                      {/* Edit */}
                      <button
                        onClick={() => startEdit(k)}
                        className="p-1 text-[#9CA3AF] hover:text-[#374151] transition-colors cursor-pointer"
                        title="Edit key"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      {/* Delete */}
                      <button
                        onClick={() => handleDelete(k.id)}
                        disabled={deletingId === k.id}
                        className="p-1 text-[#9CA3AF] hover:text-red-500 transition-colors cursor-pointer"
                        title="Delete key"
                      >
                        {deletingId === k.id ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Model Config Tab ─────────────────────────────────────────────────────────

function ModelConfig({ configs, onRefresh }) {
  const [editingTask, setEditingTask] = useState(null);
  const [editProvider, setEditProvider] = useState('gemini');
  const [editModel, setEditModel] = useState('');
  const [editFallbacks, setEditFallbacks] = useState([]);
  const [saving, setSaving] = useState(null);

  const startEdit = (c) => {
    setEditingTask(c.task);
    setEditProvider(c.primaryProvider);
    setEditModel(c.primaryModel);
    setEditFallbacks(c.fallbackChain || []);
  };

  const cancelEdit = () => setEditingTask(null);

  const toggleFallback = (p) => {
    setEditFallbacks(prev =>
      prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]
    );
  };

  const handleSave = async (task) => {
    setSaving(task);
    try {
      await adminService.updateAiConfig(task, {
        primaryProvider: editProvider,
        primaryModel: editModel,
        fallbackChain: editFallbacks,
      });
      setEditingTask(null);
      await onRefresh();
    } catch (err) {
      alert('Failed to save config: ' + (err.response?.data?.error || err.message));
    } finally {
      setSaving(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl flex items-start gap-2">
        <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
        <p className="text-[11px] font-semibold text-amber-700">
          Changes take effect immediately for new requests. The AI service caches configs for 30 seconds.
          Make sure the API key for the selected provider is added and enabled.
        </p>
      </div>

      {configs.length === 0 && (
        <div className="text-sm text-[#9CA3AF] font-semibold text-center py-10">
          No AI task configs found in database. Run the seed script to initialize.
        </div>
      )}

      {configs.map(c => {
        const meta = TASK_META[c.task] || { label: c.task, icon: '⚙️', desc: '' };
        const isEditing = editingTask === c.task;

        return (
          <div key={c.task} className={`bg-white border rounded-2xl shadow-sm overflow-hidden transition-all ${isEditing ? 'border-[#7C3AED] ring-2 ring-[#7C3AED]/10' : 'border-[#E5E9F0]'}`}>
            {/* Header */}
            <div className="px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xl">{meta.icon}</span>
                <div>
                  <div className="text-sm font-bold text-[#111827]">{meta.label}</div>
                  <div className="text-[11px] text-[#6B7280] font-semibold mt-0.5">{meta.desc}</div>
                </div>
              </div>
              {!isEditing && (
                <button
                  onClick={() => startEdit(c)}
                  className="px-3 py-1.5 bg-white border border-[#E5E9F0] text-[#374151] text-[10px] font-bold rounded-lg flex items-center gap-1.5 hover:bg-[#FAFBFC] transition-colors cursor-pointer"
                >
                  <Edit2 className="w-3 h-3" />
                  Configure
                </button>
              )}
            </div>

            {/* Current Config Summary (non-editing) */}
            {!isEditing && (
              <div className="px-5 pb-4 flex items-center gap-3 flex-wrap">
                <ProviderBadge provider={c.primaryProvider} />
                <span className="text-[11px] font-mono text-[#374151] bg-[#F9FAFB] px-2 py-0.5 rounded border border-[#E5E9F0]">
                  {c.primaryModel}
                </span>
                {(c.fallbackChain || []).length > 0 && (
                  <span className="text-[10px] text-[#9CA3AF] font-semibold">
                    → fallback: {c.fallbackChain.join(', ')}
                  </span>
                )}
              </div>
            )}

            {/* Edit Form */}
            {isEditing && (
              <div className="px-5 pb-5 border-t border-[#F3F4F6] pt-4 space-y-4">
                {/* Primary Provider */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-[#374151] mb-1.5">Primary Provider</label>
                    <select
                      value={editProvider}
                      onChange={e => {
                        setEditProvider(e.target.value);
                        setEditModel(MODEL_PRESETS[e.target.value]?.[0] || '');
                      }}
                      className="w-full bg-[#F9FAFB] border border-[#E5E9F0] rounded-xl px-3 py-2 text-xs font-semibold text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/10 focus:border-[#7C3AED]"
                    >
                      {PROVIDERS.map(p => (
                        <option key={p} value={p}>{PROVIDER_META[p]?.label || p}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#374151] mb-1.5">Model</label>
                    <div className="flex gap-2">
                      <select
                        value={MODEL_PRESETS[editProvider]?.includes(editModel) ? editModel : '__custom__'}
                        onChange={e => {
                          if (e.target.value !== '__custom__') setEditModel(e.target.value);
                        }}
                        className="flex-1 bg-[#F9FAFB] border border-[#E5E9F0] rounded-xl px-3 py-2 text-xs font-semibold text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/10 focus:border-[#7C3AED]"
                      >
                        {(MODEL_PRESETS[editProvider] || []).map(m => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                        <option value="__custom__">Custom…</option>
                      </select>
                    </div>
                    <input
                      value={editModel}
                      onChange={e => setEditModel(e.target.value)}
                      placeholder="or type model name"
                      className="w-full mt-2 bg-[#F9FAFB] border border-[#E5E9F0] rounded-xl px-3 py-1.5 text-xs font-mono text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/10 focus:border-[#7C3AED] placeholder-[#9CA3AF]"
                    />
                  </div>
                </div>

                {/* Fallback Chain */}
                <div>
                  <label className="block text-[11px] font-bold text-[#374151] mb-2">Fallback Chain (in order)</label>
                  <div className="flex items-center gap-3">
                    {PROVIDERS.filter(p => p !== editProvider).map(p => (
                      <label key={p} className="flex items-center gap-2 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={editFallbacks.includes(p)}
                          onChange={() => toggleFallback(p)}
                          className="w-3.5 h-3.5 accent-[#7C3AED]"
                        />
                        <ProviderBadge provider={p} />
                      </label>
                    ))}
                  </div>
                  {editFallbacks.length > 0 && (
                    <p className="text-[10px] text-[#9CA3AF] font-semibold mt-1.5">
                      Order: {editProvider} → {editFallbacks.join(' → ')}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleSave(c.task)}
                    disabled={saving === c.task || !editModel.trim()}
                    className="px-4 py-2 bg-[#7C3AED] hover:bg-[#6D28D9] disabled:opacity-50 text-white text-xs font-bold rounded-xl flex items-center gap-2 cursor-pointer"
                  >
                    {saving === c.task ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    {saving === c.task ? 'Saving…' : 'Save Config'}
                  </button>
                  <button onClick={cancelEdit} className="text-xs font-semibold text-[#6B7280] hover:text-[#374151] cursor-pointer">
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Provider Health Widget ───────────────────────────────────────────────────

function HealthWidget({ health }) {
  if (!health) return null;

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <div className={`flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full ${health.aiService === 'up' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
        <Activity className="w-3 h-3" />
        AI Service: {health.aiService === 'up' ? 'Online' : 'Offline'}
      </div>
      {health.providers && Object.entries(health.providers).map(([p, info]) => (
        <div key={p} className={`flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full ${info.status === 'operational' ? 'bg-emerald-50 text-emerald-700' : info.status === 'no_keys' ? 'bg-gray-50 text-gray-500' : 'bg-amber-50 text-amber-700'}`}>
          <Zap className="w-3 h-3" />
          {PROVIDER_META[p]?.label || p}: {info.healthyKeys}/{info.totalActiveKeys} keys OK
        </div>
      ))}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const TABS = [
  { id: 'keys', label: 'API Key Pool', icon: Key },
  { id: 'models', label: 'Model Configuration', icon: Cpu },
];

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState('keys');
  const [keys, setKeys] = useState([]);
  const [configs, setConfigs] = useState([]);
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const [keysData, configsData, healthData] = await Promise.allSettled([
        adminService.listApiKeys(),
        adminService.listAiConfigs(),
        adminService.getProviderHealth(),
      ]);
      if (keysData.status === 'fulfilled') setKeys(keysData.value);
      if (configsData.status === 'fulfilled') setConfigs(configsData.value);
      if (healthData.status === 'fulfilled') setHealth(healthData.value);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleRefresh = () => loadData(true);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 gap-3 text-[#7C3AED]">
        <RefreshCw className="w-5 h-5 animate-spin" />
        <span className="text-sm font-bold">Loading admin settings…</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 text-left">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-bold text-[#111827] tracking-tight leading-tight flex items-center gap-2.5">
            <Shield className="w-7 h-7 text-[#7C3AED]" />
            AI System Settings
          </h1>
          <p className="text-sm text-[#4B5563] mt-1 font-semibold">
            Manage API keys, model routing, and provider fallback chains.
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-[#E5E9F0] text-xs font-bold text-[#374151] rounded-xl shadow-sm hover:bg-[#FAFBFC] transition-colors cursor-pointer disabled:opacity-50 shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Health Widget */}
      <HealthWidget health={health} />

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-[#F3F4F6] rounded-xl p-1 w-fit">
        {TABS.map(tab => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                active
                  ? 'bg-white text-[#111827] shadow-sm'
                  : 'text-[#6B7280] hover:text-[#374151]'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${active ? 'text-[#7C3AED]' : ''}`} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.15 }}
        >
          {activeTab === 'keys' && (
            <ApiKeyPool keys={keys} onRefresh={handleRefresh} />
          )}
          {activeTab === 'models' && (
            <ModelConfig configs={configs} onRefresh={handleRefresh} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import { adminService } from '../services/adminService';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Key, Plus, Trash2, RefreshCw, Cpu, Save, Edit2, Check, X,
  Eye, EyeOff, Shield, AlertTriangle, ChevronDown, Activity, Zap,
  CheckCircle2, Sparkles, Sliders, ArrowRight
} from 'lucide-react';

const PROVIDERS = ['gemini', 'openai', 'huggingface'];

const PROVIDER_META = {
  gemini: { label: 'Google Gemini', color: 'bg-blue-50 text-blue-700 border-blue-200', dot: 'bg-blue-500' },
  openai: { label: 'OpenAI', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  huggingface: { label: 'HuggingFace Router', color: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
};

const STATUS_META = {
  ok: { label: 'Operational', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
  rate_limited: { label: 'Rate Limited', color: 'text-amber-700 bg-amber-50 border-amber-200' },
  failed: { label: 'Unreachable', color: 'text-rose-700 bg-rose-50 border-rose-200' },
};

const MODEL_PRESETS = {
  gemini: [
    'gemini-3.6-flash',
    'gemini-1.5-pro',
    'gemini-1.5-flash',
    'gemini-2.0-flash-exp',
  ],
  openai: [
    'gpt-4o',
    'gpt-4o-mini',
    'gpt-4-turbo',
    'o1-mini',
    'o3-mini',
  ],
  huggingface: [
    'Qwen/Qwen2.5-72B-Instruct',
    'meta-llama/Llama-3.3-70B-Instruct',
    'deepseek-ai/DeepSeek-R1-Distill-Qwen-32B',
    'mistralai/Mistral-Small-24B-Instruct-2501',
  ],
};

const TASK_META = {
  skill_analyze: { label: 'Skill Intelligence Engine', icon: '🧠', desc: 'Analyzes GitHub repos, LeetCode, and Codeforces telemetry to build verified skill profiles.' },
  roadmap_gen: { label: 'Career Roadmap Generator', icon: '🗺️', desc: 'Calculates personalized milestones, schedules, and subtask dependencies based on user readiness.' },
  company_match: { label: 'Company Compatibility Matcher', icon: '🏢', desc: 'Computes role compatibility scores and missing requirements against hiring criteria.' },
  mentor_chat: { label: 'Conversational Career Mentor', icon: '💬', desc: 'Powers interactive coaching with live roadmap, skill profile, and project context.' },
  resume_parse: { label: 'Resume Parser', icon: '📄', desc: 'Extracts structured skills, experience, and project evidence from resume files.' },
  progress_summary: { label: 'Progress Reports Generator', icon: '📊', desc: 'Synthesizes weekly velocity, project milestones, and engineering growth trends.' },
};

function ProviderBadge({ provider }) {
  const meta = PROVIDER_META[provider] || { label: provider, color: 'bg-gray-100 text-gray-600 border-gray-200' };
  return (
    <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-md border ${meta.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${meta.dot || 'bg-gray-400'}`} />
      {meta.label}
    </span>
  );
}

function ApiKeyPool({ keys, onRefresh }) {
  const [showAdd, setShowAdd] = useState(false);
  const [provider, setProvider] = useState('gemini');
  const [keyValue, setKeyValue] = useState('');
  const [label, setLabel] = useState('');
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editLabel, setEditLabel] = useState('');
  const [editKey, setEditKey] = useState('');
  const [selectedProviderFilter, setSelectedProviderFilter] = useState('all');
  const [togglingId, setTogglingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [savingEditId, setSavingEditId] = useState(null);

  const filteredKeys = keys.filter(k => selectedProviderFilter === 'all' || k.provider === selectedProviderFilter);

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
      alert('Failed to toggle key status.');
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this API key? This will permanently remove it from the rotation vault.')) return;
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
      alert('Failed to save key updates.');
    } finally {
      setSavingEditId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Action Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-[#E5E9F0] rounded-2xl p-4 shadow-2xs">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {['all', ...PROVIDERS].map((p) => (
            <button
              key={p}
              onClick={() => setSelectedProviderFilter(p)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer capitalize ${
                selectedProviderFilter === p
                  ? 'bg-[#7C3AED] text-white shadow-2xs'
                  : 'bg-[#F9FAFB] border border-[#E5E9F0] text-[#4B5563] hover:text-[#111827]'
              }`}
            >
              {p === 'all' ? `All Keys (${keys.length})` : `${PROVIDER_META[p]?.label || p} (${keys.filter(k => k.provider === p).length})`}
            </button>
          ))}
        </div>

        <button
          onClick={() => setShowAdd(v => !v)}
          className="px-3.5 py-1.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Key</span>
        </button>
      </div>

      {/* Add Key Form Drawer */}
      <AnimatePresence>
        {showAdd && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <form onSubmit={handleAdd} className="bg-white border border-[#E5E9F0] rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-[#F3F4F6] pb-2.5">
                <span className="text-xs font-bold text-[#111827]">Register Encrypted API Key</span>
                <button type="button" onClick={() => setShowAdd(false)} className="text-[#9CA3AF] hover:text-[#111827] cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-[#374151] mb-1">Provider Service</label>
                  <select
                    value={provider}
                    onChange={e => setProvider(e.target.value)}
                    className="w-full bg-[#F9FAFB] border border-[#E5E9F0] rounded-xl px-3 py-2 text-xs font-semibold text-[#111827] focus:outline-none focus:border-[#7C3AED]"
                  >
                    {PROVIDERS.map(p => (
                      <option key={p} value={p}>{PROVIDER_META[p]?.label || p}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#374151] mb-1">Key Label (optional)</label>
                  <input
                    value={label}
                    onChange={e => setLabel(e.target.value)}
                    placeholder="e.g. Primary Gemini Key"
                    className="w-full bg-[#F9FAFB] border border-[#E5E9F0] rounded-xl px-3 py-2 text-xs font-semibold text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:border-[#7C3AED]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#374151] mb-1">API Key Value</label>
                <input
                  type="password"
                  value={keyValue}
                  onChange={e => setKeyValue(e.target.value)}
                  placeholder="Paste your API key (stored encrypted in MongoDB)"
                  required
                  className="w-full bg-[#F9FAFB] border border-[#E5E9F0] rounded-xl px-3 py-2 text-xs font-mono text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:border-[#7C3AED]"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="submit"
                  disabled={saving || !keyValue.trim()}
                  className="px-4 py-2 bg-[#7C3AED] hover:bg-[#6D28D9] disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  <span>{saving ? 'Encrypting & Storing…' : 'Save Key to Vault'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowAdd(false)}
                  className="px-3 py-2 text-xs font-semibold text-[#6B7280] hover:text-[#111827] cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Keys Table Container */}
      <div className="bg-white border border-[#E5E9F0] rounded-2xl shadow-2xs overflow-hidden">
        {filteredKeys.length === 0 ? (
          <div className="p-8 text-center text-xs font-semibold text-[#9CA3AF]">
            No API keys found for the selected provider. Add one above.
          </div>
        ) : (
          <div className="divide-y divide-[#F3F4F6]">
            {filteredKeys.map((k) => {
              const statusInfo = STATUS_META[k.status] || STATUS_META.ok;
              const isEditing = editingId === k.id;
              return (
                <div key={k.id} className="p-4 hover:bg-[#FAFBFC] transition-colors">
                  {isEditing ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-[#374151] mb-1">Label</label>
                          <input
                            value={editLabel}
                            onChange={e => setEditLabel(e.target.value)}
                            className="w-full bg-white border border-[#E5E9F0] rounded-lg px-3 py-1.5 text-xs font-semibold focus:outline-none focus:border-[#7C3AED]"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-[#374151] mb-1">New Key (leave empty to retain)</label>
                          <input
                            type="password"
                            value={editKey}
                            onChange={e => setEditKey(e.target.value)}
                            placeholder="Paste new key"
                            className="w-full bg-white border border-[#E5E9F0] rounded-lg px-3 py-1.5 text-xs font-mono focus:outline-none focus:border-[#7C3AED]"
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => saveEdit(k.id)}
                          disabled={savingEditId === k.id}
                          className="px-3 py-1.5 bg-[#7C3AED] text-white text-xs font-bold rounded-lg cursor-pointer flex items-center gap-1"
                        >
                          {savingEditId === k.id ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                          <span>Save Changes</span>
                        </button>
                        <button onClick={cancelEdit} className="text-xs font-semibold text-[#6B7280] hover:text-[#111827] cursor-pointer">
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <div className="flex items-center gap-3 min-w-0">
                        <ProviderBadge provider={k.provider} />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-[#111827]">{k.label}</span>
                            <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${statusInfo.color}`}>
                              {statusInfo.label}
                            </span>
                          </div>
                          <span className="text-[11px] font-mono text-[#9CA3AF] block mt-0.5">
                            {k.keyPreview || '••••••••••••'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Active Toggle */}
                        <button
                          onClick={() => handleToggle(k)}
                          disabled={togglingId === k.id}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-colors cursor-pointer ${
                            k.isActive 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' 
                              : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
                          }`}
                        >
                          {k.isActive ? 'Active in Pool' : 'Disabled'}
                        </button>

                        <button
                          onClick={() => startEdit(k)}
                          className="p-1.5 text-[#6B7280] hover:text-[#7C3AED] hover:bg-purple-50 rounded-lg transition-colors cursor-pointer"
                          title="Edit label or replace key"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleDelete(k.id)}
                          disabled={deletingId === k.id}
                          className="p-1.5 text-[#6B7280] hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete key"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function ModelConfig({ configs, onRefresh }) {
  const [editingTask, setEditingTask] = useState(null);
  const [editProvider, setEditProvider] = useState('gemini');
  const [editModel, setEditModel] = useState('');
  const [editFallbacks, setEditFallbacks] = useState([]);
  const [saving, setSaving] = useState(null);

  const activeConfig = configs.find(c => c.task === editingTask);
  const activeTaskInfo = activeConfig ? (TASK_META[activeConfig.task] || { label: activeConfig.task, icon: '⚡', desc: 'AI Task Engine' }) : null;

  const startEdit = (c) => {
    setEditingTask(c.task);
    setEditProvider(c.primaryProvider || 'gemini');
    setEditModel(c.primaryModel || '');
    setEditFallbacks(c.fallbackChain || c.fallbackProviders || []);
  };

  const cancelEdit = () => {
    setEditingTask(null);
  };

  const handleToggleFallback = (p) => {
    if (editFallbacks.includes(p)) {
      setEditFallbacks(editFallbacks.filter(f => f !== p));
    } else {
      setEditFallbacks([...editFallbacks, p]);
    }
  };

  const handleSave = async (task) => {
    setSaving(task);
    try {
      await adminService.updateAiConfig(task, {
        primaryProvider: editProvider,
        primaryModel: editModel.trim(),
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
    <div className="space-y-3.5">
      {configs.map((c) => {
        const taskInfo = TASK_META[c.task] || { label: c.task, icon: '⚡', desc: 'AI Task Engine' };

        return (
          <div key={c.task} className="bg-white border border-[#E5E9F0] rounded-2xl p-5 shadow-2xs space-y-4">
            
            {/* Header */}
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#F9FAFB] border border-[#E5E9F0] flex items-center justify-center text-lg shrink-0">
                  {taskInfo.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-[#111827]">{taskInfo.label}</h3>
                    <code className="px-1.5 py-0.5 rounded bg-gray-100 text-[#4B5563] text-[10px] font-mono font-bold">
                      {c.task}
                    </code>
                  </div>
                  <p className="text-[11px] text-[#6B7280] font-semibold mt-0.5 leading-relaxed">
                    {taskInfo.desc}
                  </p>
                </div>
              </div>

              <button
                onClick={() => startEdit(c)}
                className="px-3.5 py-1.5 bg-[#F9FAFB] border border-[#E5E9F0] hover:border-purple-300 hover:text-[#7C3AED] text-[#374151] text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs shrink-0"
              >
                <Sliders className="w-3.5 h-3.5 text-[#7C3AED]" />
                <span>Configure Routing</span>
              </button>
            </div>

            {/* Read-Only Route Summary */}
            <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-[#F3F4F6]">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#111827] bg-[#F9FAFB] border border-[#E5E9F0] px-2.5 py-1 rounded-lg">
                <span className="text-[10px] text-[#6B7280] uppercase tracking-wider">Primary:</span>
                <ProviderBadge provider={c.primaryProvider} />
                <span className="font-mono text-[11px] text-[#7C3AED]">{c.primaryModel}</span>
              </div>

              {(c.fallbackChain || c.fallbackProviders || []).length > 0 && (
                <div className="flex items-center gap-1 text-xs text-[#6B7280] font-semibold">
                  <ArrowRight className="w-3 h-3 text-[#9CA3AF]" />
                  <span className="text-[10px] uppercase font-bold text-[#9CA3AF]">Fallbacks:</span>
                  {(c.fallbackChain || c.fallbackProviders || []).map(fb => (
                    <ProviderBadge key={fb} provider={fb} />
                  ))}
                </div>
              )}
            </div>

          </div>
        );
      })}

      {/* ─── Configure Routing Centered Modal ─────────────────────────────── */}
      <AnimatePresence>
        {editingTask && activeConfig && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.15 }}
              className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-[#E5E9F0] overflow-hidden text-left"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="p-5 border-b border-[#F3F4F6] flex items-center justify-between bg-[#FAFBFC]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-[#7C3AED] border border-purple-100 flex items-center justify-center text-xl shrink-0">
                    {activeTaskInfo?.icon || '⚡'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-[#111827]">{activeTaskInfo?.label || editingTask}</h3>
                      <code className="px-1.5 py-0.5 rounded bg-gray-100 text-[#4B5563] text-[10px] font-mono font-bold">
                        {editingTask}
                      </code>
                    </div>
                    <span className="text-[11px] text-[#6B7280] font-semibold block mt-0.5">
                      Configure primary provider, model, and automatic fallback chains
                    </span>
                  </div>
                </div>
                <button
                  onClick={cancelEdit}
                  className="p-1.5 text-[#9CA3AF] hover:text-[#111827] rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-5 space-y-4">
                
                <div className="space-y-4">
                  {/* Provider & Model Selection Dropdown */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-[#374151] mb-1.5">Model Provider</label>
                      <select
                        value={editProvider}
                        onChange={(e) => {
                          const newP = e.target.value;
                          setEditProvider(newP);
                          const presets = MODEL_PRESETS[newP] || [];
                          const newModel = presets.length > 0 ? presets[0] : '';
                          setEditModel(newModel);
                        }}
                        className="w-full bg-[#F9FAFB] border border-[#E5E9F0] rounded-xl px-3 py-2.5 text-xs font-semibold text-[#111827] focus:outline-none focus:border-[#7C3AED]"
                      >
                        {PROVIDERS.map(p => (
                          <option key={p} value={p}>{PROVIDER_META[p]?.label || p}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-[#374151] mb-1.5">Select Model</label>
                      <select
                        value={(MODEL_PRESETS[editProvider] || []).includes(editModel) ? editModel : '__custom__'}
                        onChange={(e) => {
                          const val = e.target.value;
                          let newModel;
                          if (val === '__custom__') {
                            newModel = editModel && !(MODEL_PRESETS[editProvider] || []).includes(editModel) ? editModel : '';
                          } else {
                            newModel = val;
                          }
                          setEditModel(newModel);
                        }}
                        className="w-full bg-[#F9FAFB] border border-[#E5E9F0] rounded-xl px-3 py-2.5 text-xs font-semibold text-[#111827] focus:outline-none focus:border-[#7C3AED]"
                      >
                        <optgroup label={`${PROVIDER_META[editProvider]?.label || editProvider} Available Models`}>
                          {(MODEL_PRESETS[editProvider] || []).map(m => (
                            <option key={m} value={m}>{m}</option>
                          ))}
                        </optgroup>
                        <option value="__custom__">✨ Custom Model (specify custom repo / model ID)...</option>
                      </select>
                    </div>
                  </div>

                  {/* Custom Model Input */}
                  {(!(MODEL_PRESETS[editProvider] || []).includes(editModel) || editModel === '') && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="space-y-1.5 p-3.5 bg-purple-50/50 border border-purple-200 rounded-2xl animate-fadeIn"
                    >
                      <label className="block text-[11px] font-bold text-[#7C3AED]">
                        Custom {PROVIDER_META[editProvider]?.label || editProvider} Model Name / Repo ID
                      </label>
                      <input
                        type="text"
                        value={editModel}
                        onChange={e => setEditModel(e.target.value)}
                        placeholder={
                          editProvider === 'huggingface'
                            ? "e.g. meta-llama/Llama-3.3-70B-Instruct or mistralai/Mixtral-8x7B"
                            : editProvider === 'openai'
                              ? "e.g. o1-preview or custom-ft-model"
                              : "e.g. gemini-1.5-pro-exp"
                        }
                        required
                        className="w-full bg-white border border-[#E5E9F0] rounded-xl px-3.5 py-2.5 text-xs font-mono font-semibold text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:border-[#7C3AED] shadow-2xs"
                      />
                      <p className="text-[10px] text-[#6B7280] font-semibold">
                        This custom model will use your registered {PROVIDER_META[editProvider]?.label || editProvider} API credentials from the Key Pool.
                      </p>
                    </motion.div>
                  )}
                </div>

                {/* Fallback Providers selection */}
                <div className="space-y-1.5 pt-1">
                  <label className="block text-[11px] font-bold text-[#374151]">Fallback Chain Routing</label>
                  <p className="text-[10px] text-[#6B7280] font-semibold">
                    If {PROVIDER_META[editProvider]?.label || editProvider} fails or rate limits, requests automatically traverse these fallbacks:
                  </p>
                  <div className="flex items-center gap-2 flex-wrap pt-1">
                    {PROVIDERS.filter(p => p !== editProvider).map(p => {
                      const isSelected = editFallbacks.includes(p);
                      return (
                        <button
                          key={p}
                          type="button"
                          onClick={() => handleToggleFallback(p)}
                          className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-2 ${
                            isSelected
                              ? 'bg-purple-50 border-purple-200 text-[#7C3AED]'
                              : 'bg-[#F9FAFB] border-[#E5E9F0] text-[#6B7280] hover:text-[#111827]'
                          }`}
                        >
                          <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-[#7C3AED]' : 'bg-gray-300'}`} />
                          <span>{PROVIDER_META[p]?.label || p}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-[#7C3AED]" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* Modal Footer */}
              <div className="p-5 border-t border-[#F3F4F6] bg-[#FAFBFC] flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="px-4 py-2 text-xs font-semibold text-[#6B7280] hover:text-[#111827] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleSave(editingTask)}
                  disabled={saving === editingTask || !editModel.trim()}
                  className="px-4 py-2.5 bg-[#7C3AED] hover:bg-[#6D28D9] disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-purple-100"
                >
                  {saving === editingTask ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  <span>{saving === editingTask ? 'Saving Configuration…' : 'Save Routing'}</span>
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

export default function AdminSettings({ embedded = false }) {
  const [activeTab, setActiveTab] = useState('keys');
  const [keys, setKeys] = useState([]);
  const [configs, setConfigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const [keysData, configsData] = await Promise.allSettled([
        adminService.listApiKeys(),
        adminService.listAiConfigs(),
      ]);
      if (keysData.status === 'fulfilled') setKeys(keysData.value);
      if (configsData.status === 'fulfilled') setConfigs(configsData.value);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRefresh = () => loadData(true);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 gap-2 text-[#7C3AED]">
        <RefreshCw className="w-5 h-5 animate-spin" />
        <span className="text-xs font-bold">Loading routing configurations…</span>
      </div>
    );
  }

  return (
    <div className="space-y-4 text-left">
      
      {/* Sub Tabs */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-1.5 bg-[#F3F4F6] p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('keys')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'keys'
                ? 'bg-white text-[#111827] shadow-2xs'
                : 'text-[#6B7280] hover:text-[#111827]'
            }`}
          >
            <Key className={`w-3.5 h-3.5 ${activeTab === 'keys' ? 'text-[#7C3AED]' : ''}`} />
            <span>API Key Pool ({keys.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('models')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'models'
                ? 'bg-white text-[#111827] shadow-2xs'
                : 'text-[#6B7280] hover:text-[#111827]'
            }`}
          >
            <Cpu className={`w-3.5 h-3.5 ${activeTab === 'models' ? 'text-[#7C3AED]' : ''}`} />
            <span>Model Task Routing ({configs.length})</span>
          </button>
        </div>

        <button
          onClick={handleRefresh}
          className="p-2 bg-white border border-[#E5E9F0] hover:bg-[#F8FAFC] text-[#6B7280] hover:text-[#111827] rounded-xl transition-all cursor-pointer shadow-2xs"
          title="Refresh configurations"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-[#7C3AED]' : ''}`} />
        </button>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
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

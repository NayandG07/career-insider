import React, { useState, useEffect } from 'react';
import { adminService } from '../services/adminService';
import { 
  Shield, 
  Key, 
  Plus, 
  Trash2, 
  RefreshCw, 
  Cpu, 
  Save, 
  ToggleLeft, 
  ToggleRight 
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminSettings() {
  const [keys, setKeys] = useState([]);
  const [configs, setConfigs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Key state
  const [provider, setProvider] = useState('gemini');
  const [keyValue, setKeyValue] = useState('');
  const [keyLabel, setKeyLabel] = useState('');
  const [savingKey, setSavingKey] = useState(false);

  // Config editing state
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editPrimaryProvider, setEditPrimaryProvider] = useState('gemini');
  const [editPrimaryModel, setEditPrimaryModel] = useState('');
  const [savingConfig, setSavingConfig] = useState(false);

  useEffect(() => {
    loadSettingsData();
  }, []);

  const loadSettingsData = async () => {
    try {
      setLoading(true);
      const [keysData, configsData] = await Promise.all([
        adminService.listApiKeys().catch(() => []),
        adminService.listAiConfigs().catch(() => [])
      ]);
      setKeys(keysData);
      setConfigs(configsData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddKey = async (e) => {
    e.preventDefault();
    if (!keyValue.trim()) return;
    setSavingKey(true);
    try {
      const label = keyLabel.trim() || `${provider} Key (${new Date().toLocaleDateString()})`;
      await adminService.addApiKey({
        provider,
        label,
        key: keyValue
      });
      setKeyValue('');
      setKeyLabel('');
      await loadSettingsData();
    } catch (err) {
      console.error(err);
      alert('Failed to add API key.');
    } finally {
      setSavingKey(false);
    }
  };

  const handleDeleteKey = async (id) => {
    if (!window.confirm('Are you sure you want to delete this API Key?')) return;
    try {
      await adminService.deleteApiKey(id);
      await loadSettingsData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditConfig = (c) => {
    setEditingTaskId(c.task);
    setEditPrimaryProvider(c.primaryProvider || 'gemini');
    setEditPrimaryModel(c.primaryModel || '');
  };

  const handleSaveConfig = async (taskId) => {
    setSavingConfig(true);
    try {
      await adminService.updateAiConfig(taskId, {
        primaryProvider: editPrimaryProvider,
        primaryModel: editPrimaryModel
      });
      setEditingTaskId(null);
      await loadSettingsData();
    } catch (err) {
      console.error(err);
      alert('Failed to save AI configuration routing.');
    } finally {
      setSavingConfig(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-[#7C3AED] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 text-left pb-12 animate-fadeIn max-w-4xl">
      {/* Title */}
      <div>
        <h1 className="text-[28px] font-bold text-[#111827] tracking-tight leading-tight">
          Admin Settings & AI Configs
        </h1>
        <p className="text-sm text-[#4B5563] mt-1 font-semibold">
          Manage system API Key pools, AI model fallback workflows, and LLM routes.
        </p>
      </div>

      {/* Two section split */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* API Key Pool (8 columns) */}
        <div className="md:col-span-12 space-y-6">
          <div className="bg-white border border-[#E5E9F0] rounded-3xl p-6 shadow-sm space-y-5">
            <h3 className="text-xs font-bold text-[#111827] uppercase tracking-wider flex items-center gap-2">
              <Key className="w-4.5 h-4.5 text-[#7C3AED]" />
              Global API Key Pool
            </h3>

            {/* Add Key Form */}
            <form onSubmit={handleAddKey} className="grid grid-cols-1 sm:grid-cols-12 gap-3 pb-4 border-b border-[#F3F4F6] text-xs font-bold text-[#4B5563]">
              <div className="sm:col-span-3 space-y-1">
                <label>Provider</label>
                <select 
                  value={provider}
                  onChange={(e) => setProvider(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FAFBFC] border border-[#E5E9F0] rounded-xl font-semibold text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/10 focus:border-[#7C3AED]"
                >
                  <option value="gemini">Google Gemini</option>
                  <option value="openai">OpenAI</option>
                  <option value="huggingface">HuggingFace</option>
                </select>
              </div>

              <div className="sm:col-span-3 space-y-1">
                <label>Key Name / Label</label>
                <input 
                  type="text" 
                  placeholder="e.g. Primary Key" 
                  value={keyLabel}
                  onChange={(e) => setKeyLabel(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FAFBFC] border border-[#E5E9F0] rounded-xl font-semibold text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/10 focus:border-[#7C3AED]"
                />
              </div>

              <div className="sm:col-span-4 space-y-1">
                <label>Credential Key (Encrypted)</label>
                <input 
                  type="password" 
                  placeholder="sk-..." 
                  value={keyValue}
                  onChange={(e) => setKeyValue(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FAFBFC] border border-[#E5E9F0] rounded-xl font-semibold text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/10 focus:border-[#7C3AED]"
                />
              </div>

              <div className="sm:col-span-2 flex items-end">
                <button 
                  type="submit"
                  disabled={savingKey || !keyValue}
                  className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-sm flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {savingKey ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                  Save Key
                </button>
              </div>
            </form>

            {/* Keys Table */}
            <div className="space-y-3">
              {keys.map((k) => (
                <div key={k.id} className="p-3 bg-[#FAFBFC] border border-[#E5E9F0] rounded-2xl flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-[#111827] capitalize">{k.provider} - {k.label}</h4>
                    <p className="text-[10px] text-[#6B7280] font-semibold mt-0.5">Fingerprint: {k.keyFingerprint || 'Encrypted'}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded text-[9px] font-black uppercase">
                      Active
                    </span>
                    <button 
                      onClick={() => handleDeleteKey(k.id)}
                      className="p-1 text-[#9CA3AF] hover:text-red-500 hover:bg-red-50 rounded-lg cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
              {keys.length === 0 && (
                <p className="text-xs font-semibold text-[#6B7280] text-center py-4">No API keys registered in MongoDB pool.</p>
              )}
            </div>
          </div>
        </div>

        {/* AI Task Routing configurations (12 columns) */}
        <div className="md:col-span-12 space-y-6">
          <div className="bg-white border border-[#E5E9F0] rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-[#111827] uppercase tracking-wider flex items-center gap-2">
              <Cpu className="w-4.5 h-4.5 text-[#6366F1]" />
              AI Parser & Router Routing Schema
            </h3>

            <div className="space-y-3 text-xs">
              {configs.map((c) => {
                const isEditing = editingTaskId === c.task;
                return (
                  <div key={c.task} className="p-4 bg-[#FAFBFC] border border-[#E5E9F0] rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h4 className="font-bold text-[#111827]">{c.label}</h4>
                      <p className="text-[10px] text-[#6B7280] font-semibold mt-0.5">Task code ID: {c.task}</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] font-bold">
                      {isEditing ? (
                        <>
                          <select 
                            value={editPrimaryProvider}
                            onChange={(e) => setEditPrimaryProvider(e.target.value)}
                            className="px-2.5 py-1.5 bg-white border border-[#E5E9F0] rounded-lg focus:outline-none"
                          >
                            <option value="gemini">Gemini</option>
                            <option value="openai">OpenAI</option>
                            <option value="huggingface">HuggingFace</option>
                          </select>
                          <input 
                            type="text" 
                            placeholder="Model ID" 
                            value={editPrimaryModel}
                            onChange={(e) => setEditPrimaryModel(e.target.value)}
                            className="px-2.5 py-1.5 bg-white border border-[#E5E9F0] rounded-lg focus:outline-none w-36"
                          />
                          <button 
                            onClick={() => handleSaveConfig(c.task)}
                            disabled={savingConfig}
                            className="p-1.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-lg cursor-pointer"
                          >
                            <Save className="w-3.5 h-3.5" />
                          </button>
                        </>
                      ) : (
                        <>
                          <span className="text-[#6B7280]">Primary:</span>
                          <span className="bg-purple-50 text-[#7C3AED] px-2 py-0.5 rounded uppercase text-[10px] font-black">
                            {c.primaryProvider} ({c.primaryModel})
                          </span>
                          <span className="text-[#6B7280]">Chain:</span>
                          <span className="text-[10px] text-[#4B5563] font-mono">
                            {c.fallbackChain ? c.fallbackChain.join(' → ') : 'None'}
                          </span>
                          <button 
                            onClick={() => handleEditConfig(c)}
                            className="px-2.5 py-1 bg-slate-900 text-white text-[10px] rounded-lg cursor-pointer"
                          >
                            Edit Route
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

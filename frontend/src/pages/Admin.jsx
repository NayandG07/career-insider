import React, { useState, useEffect } from 'react';
import { adminService } from '../services/adminService';
import { Shield, Key, Save, Trash2, Plus, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Admin() {
  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [provider, setProvider] = useState('gemini');
  const [keyValue, setKeyValue] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchKeys();
  }, []);

  const fetchKeys = async () => {
    try {
      setLoading(true);
      const data = await adminService.getApiKeys();
      setKeys(data);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch API keys. Are you an admin?");
    } finally {
      setLoading(false);
    }
  };

  const handleAddKey = async (e) => {
    e.preventDefault();
    if (!keyValue.trim()) return;
    setSaving(true);
    setError(null);
    try {
      await adminService.addApiKey(provider, keyValue);
      setKeyValue('');
      await fetchKeys();
    } catch (err) {
      console.error(err);
      setError("Failed to add key.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteKey = async (id) => {
    try {
      await adminService.deleteApiKey(id);
      await fetchKeys();
    } catch (err) {
      console.error(err);
      setError("Failed to delete key.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <RefreshCw className="w-6 h-6 text-[#7C3AED] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 animate-fadeIn text-left max-w-4xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-bold text-[#111827] tracking-tight leading-tight flex items-center gap-2">
            <Shield className="w-7 h-7 text-[#7C3AED]" />
            Admin Control Panel
          </h1>
          <p className="text-sm text-[#4B5563] mt-1 font-semibold">
            Manage system configurations and AI provider fallback chains.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-sm font-bold text-red-600">
          {error}
        </div>
      )}

      <div className="bg-white border border-[#E5E9F0] rounded-3xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-[#111827] flex items-center gap-2">
            <Key className="w-5 h-5 text-[#10B981]" />
            API Key Pool
          </h2>
        </div>

        <form onSubmit={handleAddKey} className="flex items-end gap-4 mb-8">
          <div className="space-y-1.5 flex-1">
            <label className="text-xs font-bold text-[#4B5563] ml-1">Provider</label>
            <select 
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              className="w-full px-4 py-3 bg-[#F9FAFB] border border-[#E5E9F0] rounded-xl text-sm font-semibold text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED]"
            >
              <option value="gemini">Google Gemini</option>
              <option value="openai">OpenAI</option>
              <option value="huggingface">HuggingFace</option>
            </select>
          </div>
          
          <div className="space-y-1.5 flex-[2]">
            <label className="text-xs font-bold text-[#4B5563] ml-1">API Key</label>
            <input 
              type="password"
              value={keyValue}
              onChange={(e) => setKeyValue(e.target.value)}
              placeholder="sk-..."
              className="w-full px-4 py-3 bg-[#F9FAFB] border border-[#E5E9F0] rounded-xl text-sm font-semibold text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED]"
            />
          </div>

          <button 
            type="submit"
            disabled={saving || !keyValue}
            className="py-3 px-6 bg-[#111827] hover:bg-[#1F2937] text-white text-sm font-bold rounded-xl shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Add Key
          </button>
        </form>

        <div className="space-y-3">
          <h3 className="text-xs font-bold text-[#9CA3AF] uppercase tracking-wider mb-2">Active Keys</h3>
          {keys.length === 0 ? (
            <p className="text-sm font-semibold text-[#6B7280]">No keys configured. AI services will fail.</p>
          ) : (
            keys.map((key, idx) => (
              <div key={key._id} className="flex items-center justify-between p-4 rounded-xl border border-[#E5E9F0] bg-[#FAFBFC]">
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-[#111827] capitalize">{key.provider}</span>
                  <span className="text-xs font-semibold text-[#6B7280]">Added {new Date(key.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-md text-[10px] font-extrabold uppercase">
                    Active
                  </span>
                  <button 
                    onClick={() => handleDeleteKey(key._id)}
                    className="p-2 text-[#9CA3AF] hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Key, Sparkles, CheckCircle2, X, RefreshCw } from 'lucide-react';
import { getSavedApiKey, saveApiKey, checkBackendHealth } from '../../services/vivaService';

export default function SettingsModal({ isOpen, onClose, onSettingsUpdated }) {
  const [apiKey, setApiKey] = useState(() => getSavedApiKey());
  const [healthStatus, setHealthStatus] = useState(null);
  const [isTesting, setIsTesting] = useState(false);
  const [saveNotice, setSaveNotice] = useState('');

  useEffect(() => {
    let isMounted = true;
    if (isOpen) {
      checkBackendHealth().then((res) => {
        if (isMounted) setHealthStatus(res);
      });
    }
    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  const handleRefreshHealth = async () => {
    setIsTesting(true);
    const res = await checkBackendHealth();
    setHealthStatus(res);
    setIsTesting(false);
  };

  const handleSave = () => {
    saveApiKey(apiKey);
    setSaveNotice('Settings updated successfully!');
    if (onSettingsUpdated) onSettingsUpdated();
    handleRefreshHealth();
    setTimeout(() => setSaveNotice(''), 2500);
  };

  const handleClear = () => {
    saveApiKey('');
    setApiKey('');
    setSaveNotice('Custom key cleared. Defaulting to server configuration.');
    if (onSettingsUpdated) onSettingsUpdated();
    handleRefreshHealth();
    setTimeout(() => setSaveNotice(''), 2500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-[#0b1222] border border-indigo-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-indigo-950/80 space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">AI Engine & Gemini Settings</h3>
              <p className="text-xs text-slate-400">Configure your Google Gemini API key or inspect status</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Health Status Pill */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-300">Engine Mode:</span>
            <span className={`px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1.5 ${
              healthStatus?.geminiConfigured || Boolean(apiKey)
                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                : 'bg-amber-950 text-amber-400 border border-amber-800'
            }`}>
              <Sparkles className="w-3 h-3" />
              <span>{healthStatus?.geminiConfigured || Boolean(apiKey) ? 'Live Gemini AI Mode' : 'Smart Rubric Demo Mode'}</span>
            </span>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Target AI Model:</span>
            <span className="font-mono text-indigo-300">gemini-2.5-flash</span>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Backend Server:</span>
            <span className="font-mono text-slate-300">{healthStatus?.status === 'ok' ? 'Connected (Port 5000)' : 'Standalone mode'}</span>
          </div>
        </div>

        {/* API Key Input Field */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
            Google Gemini API Key
          </label>
          <div className="relative">
            <input
              type="password"
              placeholder="AIzaSy..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full px-4 py-3 bg-slate-900 border border-slate-700/80 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono transition-all"
            />
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Keys entered here are securely passed via encrypted local requests to the backend server and never committed. If left blank, the app runs in our curated demo rubric mode.
          </p>
        </div>

        {/* Save Notice */}
        {saveNotice && (
          <div className="p-3 rounded-xl bg-emerald-950/70 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{saveNotice}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={handleRefreshHealth}
            disabled={isTesting}
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
            <span>Check Status</span>
          </button>

          <div className="flex items-center gap-2">
            {apiKey && (
              <button
                type="button"
                onClick={handleClear}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-950/40 border border-rose-900/60 transition-colors"
              >
                Clear
              </button>
            )}
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-900/40 transition-colors"
            >
              Save Key
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

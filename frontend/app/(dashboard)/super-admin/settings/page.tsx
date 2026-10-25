'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api-client';

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  
  const [settings, setSettings] = useState({
    systemName: '',
    supportEmail: '',
    require2FA: 'false',
    sessionTimeout: '30',
  });

  useEffect(() => {
    async function loadSettings() {
      try {
        const data = await api.getSettings();
        setSettings((prev) => ({ ...prev, ...data }));
      } catch (error: any) {
        setMessage({ text: error.message || 'መረጃውን ማምጣት አልተቻለም', type: 'error' });
      } finally {
        setIsLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage({ text: '', type: '' });

    try {
      await api.updateSettings(settings);
      setMessage({ text: 'ሴቲንጎች በተሳካ ሁኔታ ተቀይረዋል!', type: 'success' });
    } catch (error: any) {
      setMessage({ text: error.message || 'ሴቲንግ መቀየር አልተቻለም', type: 'error' });
    } finally {
      setIsSaving(false);
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    }
  };

  if (isLoading) return <div className="p-12 text-center text-slate-500 animate-pulse">Loading settings...</div>;

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">System Settings</h1>
        <p className="text-sm text-slate-500 mt-1">Manage your portal configurations and preferences.</p>
      </div>

      {message.text && (
        <div className={`p-4 rounded-md text-sm font-medium ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSave} className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">General</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">System Name</label>
              <input
                type="text"
                value={settings.systemName}
                onChange={(e) => setSettings({ ...settings, systemName: e.target.value })}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Support Email</label>
              <input
                type="email"
                value={settings.supportEmail}
                onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Security</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-700">Two-Factor Auth</p>
                <p className="text-xs text-slate-500">Require 2FA for admin accounts.</p>
              </div>
              <button 
                type="button"
                onClick={() => setSettings({ ...settings, require2FA: settings.require2FA === 'true' ? 'false' : 'true' })}
                className={`rounded-full p-1 w-11 h-6 flex items-center transition-colors ${settings.require2FA === 'true' ? 'bg-violet-600' : 'bg-slate-200'}`}
              >
                <div className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform ${settings.require2FA === 'true' ? 'translate-x-5' : 'translate-x-1'}`} />
              </button>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Session Timeout (Minutes)</label>
              <input
                type="number"
                value={settings.sessionTimeout}
                onChange={(e) => setSettings({ ...settings, sessionTimeout: e.target.value })}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="md:col-span-2 flex justify-end">
          <button 
            type="submit" 
            disabled={isSaving}
            className="rounded-md bg-violet-600 px-6 py-2 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-50 transition-colors"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
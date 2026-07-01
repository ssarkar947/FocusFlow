import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Settings as SettingsIcon, Sun, Moon, Coffee, Download, Upload, Trash2, ShieldAlert } from 'lucide-react';

export const Settings: React.FC = () => {
  const { settings, updateSettings, goals, projects, tasks, sessions, dailyReviews, weeklyReviews, importState } = useStore();

  const [focusDuration, setFocusDuration] = useState(settings.defaultFocusDuration);
  const [startTime, setStartTime] = useState(settings.workingHours.start);
  const [endTime, setEndTime] = useState(settings.workingHours.end);

  // Firebase Config State
  const [apiKey, setApiKey] = useState(settings.firebaseConfig?.apiKey || '');
  const [authDomain, setAuthDomain] = useState(settings.firebaseConfig?.authDomain || '');
  const [projectId, setProjectId] = useState(settings.firebaseConfig?.projectId || '');
  const [storageBucket, setStorageBucket] = useState(settings.firebaseConfig?.storageBucket || '');
  const [messagingSenderId, setMessagingSenderId] = useState(settings.firebaseConfig?.messagingSenderId || '');
  const [appId, setAppId] = useState(settings.firebaseConfig?.appId || '');

  const handleSaveDuration = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      defaultFocusDuration: Number(focusDuration),
      workingHours: {
        start: startTime,
        end: endTime,
      },
    });
    alert('Settings updated successfully!');
  };

  const handleSaveFirebase = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      firebaseConfig: {
        apiKey,
        authDomain,
        projectId,
        storageBucket,
        messagingSenderId,
        appId,
      }
    });
    alert('Firebase Cloud Sync configuration saved! Sync active.');
  };

  const handleDisconnectFirebase = () => {
    if (confirm('Disconnect Firebase cloud sync? Your data will remain stored locally.')) {
      updateSettings({ firebaseConfig: undefined });
      setApiKey('');
      setAuthDomain('');
      setProjectId('');
      setStorageBucket('');
      setMessagingSenderId('');
      setAppId('');
      alert('Cloud Sync disconnected.');
    }
  };

  const handleExportData = () => {
    const dataStr = JSON.stringify({
      goals,
      projects,
      tasks,
      sessions,
      dailyReviews,
      weeklyReviews,
      settings,
    }, null, 2);

    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `focusflow-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (confirm('Importing this file will overwrite all your current goals, projects, tasks, and settings. Continue?')) {
          importState(parsed);
          alert('Data imported successfully!');
          window.location.reload();
        }
      } catch (err) {
        alert('Invalid JSON file format.');
      }
    };
    reader.readAsText(file);
  };

  const handleDeleteAll = () => {
    if (confirm('CRITICAL WARNING: This will permanently delete all your goals, projects, tasks, reviews, and logs. This cannot be undone. Type "DELETE" to confirm.')) {
      const confirmation = prompt('Please type "DELETE" to confirm permanent account deletion:');
      if (confirmation === 'DELETE') {
        localStorage.clear();
        alert('All local account data deleted. Reloading application...');
        window.location.reload();
      }
    }
  };

  return (
    <div className="space-y-8 max-w-3xl mx-auto py-4">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-text-primary mb-1">Settings</h1>
        <p className="text-text-secondary text-sm">Configure your deep work preferences and manage your data.</p>
      </div>

      {/* Main Settings Body */}
      <div className="space-y-6">
        
        {/* Theme settings */}
        <div className="bg-bg-surface border border-border-main rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="font-semibold text-text-primary flex items-center gap-2">
            <Sun size={18} className="text-accent-main" />
            <span>Theme & Accent Preferences</span>
          </h3>
          <p className="text-xs text-text-secondary">Choose the interface aesthetic that keeps you calm and focused.</p>
          
          <div className="grid grid-cols-3 gap-3 pt-2">
            <button
              onClick={() => updateSettings({ theme: 'light' })}
              className={`p-4 border rounded-2xl flex flex-col items-center gap-2 transition-all ${
                settings.theme === 'light'
                  ? 'border-accent-main bg-accent-main/5 text-text-primary'
                  : 'border-border-main hover:bg-bg-muted text-text-secondary'
              }`}
            >
              <Sun size={20} />
              <span className="text-xs font-semibold">Light Calm</span>
            </button>

            <button
              onClick={() => updateSettings({ theme: 'warm' })}
              className={`p-4 border rounded-2xl flex flex-col items-center gap-2 transition-all ${
                settings.theme === 'warm'
                  ? 'border-accent-main bg-accent-main/5 text-text-primary'
                  : 'border-border-main hover:bg-bg-muted text-text-secondary'
              }`}
            >
              <Coffee size={20} />
              <span className="text-xs font-semibold">Warm Glow</span>
            </button>

            <button
              onClick={() => updateSettings({ theme: 'dark' })}
              className={`p-4 border rounded-2xl flex flex-col items-center gap-2 transition-all ${
                settings.theme === 'dark'
                  ? 'border-accent-main bg-accent-main/5 text-text-primary'
                  : 'border-border-main hover:bg-bg-muted text-text-secondary'
              }`}
            >
              <Moon size={20} />
              <span className="text-xs font-semibold">Dark Focus</span>
            </button>
          </div>
        </div>

        {/* Timer Preference Settings */}
        <div className="bg-bg-surface border border-border-main rounded-3xl p-6 shadow-sm">
          <form onSubmit={handleSaveDuration} className="space-y-4">
            <h3 className="font-semibold text-text-primary flex items-center gap-2">
              <SettingsIcon size={18} className="text-accent-main" />
              <span>Deep Work Durations</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="text-xs font-semibold text-text-secondary">Default Timer (Minutes)</label>
                <select
                  value={focusDuration}
                  onChange={(e) => setFocusDuration(Number(e.target.value))}
                  className="w-full mt-1.5 px-3 py-2 bg-bg-muted rounded-xl border border-border-main text-xs text-text-primary focus:outline-none"
                >
                  <option value={25}>25 Minutes (Pomodoro)</option>
                  <option value={45}>45 Minutes</option>
                  <option value={60}>60 Minutes</option>
                  <option value={90}>90 Minutes</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-text-secondary">Work Hours Start</label>
                <input
                  type="time"
                  required
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full mt-1.5 px-3 py-2 bg-bg-muted rounded-xl border border-border-main text-xs text-text-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-text-secondary">Work Hours End</label>
                <input
                  type="time"
                  required
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full mt-1.5 px-3 py-2 bg-bg-muted rounded-xl border border-border-main text-xs text-text-primary focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-text-primary hover:bg-opacity-95 text-bg-surface font-semibold rounded-xl text-xs transition-all active:scale-98"
            >
              Save Duration & Work Hours
            </button>
          </form>
        </div>

        {/* Data Portability */}
        <div className="bg-bg-surface border border-border-main rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="font-semibold text-text-primary flex items-center gap-2">
            <Download size={18} className="text-accent-main" />
            <span>Data Portability & Backups</span>
          </h3>
          <p className="text-xs text-text-secondary">All your focus data belongs to you. Export logs or import backups instantly.</p>
          
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={handleExportData}
              className="flex-1 py-3 border border-border-main hover:bg-bg-muted rounded-xl flex items-center justify-center gap-2 text-xs font-semibold text-text-primary transition-all active:scale-98"
            >
              <Download size={15} />
              <span>Export FocusFlow JSON Backup</span>
            </button>

            <label className="flex-1 py-3 border border-border-main hover:bg-bg-muted rounded-xl flex items-center justify-center gap-2 text-xs font-semibold text-text-primary transition-all active:scale-98 cursor-pointer text-center">
              <Upload size={15} />
              <span>Import FocusFlow Backup</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportData}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Cloud Synchronization (Firebase) */}
        <div className="bg-bg-surface border border-border-main rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="font-semibold text-text-primary flex items-center gap-2">
            <SettingsIcon size={18} className="text-accent-main" />
            <span>Cloud Sync (Firebase Integration)</span>
          </h3>
          <p className="text-xs text-text-secondary">
            Connect a remote Firebase project to synchronize your goals and focus timer across other browsers and devices.
          </p>

          <form onSubmit={handleSaveFirebase} className="space-y-3 pt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] uppercase font-bold text-text-secondary">API Key</label>
                <input
                  type="password"
                  required
                  placeholder="AIzaSy..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-bg-muted rounded-xl border border-border-main text-xs text-text-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-text-secondary">Auth Domain</label>
                <input
                  type="text"
                  required
                  placeholder="project-id.firebaseapp.com"
                  value={authDomain}
                  onChange={(e) => setAuthDomain(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-bg-muted rounded-xl border border-border-main text-xs text-text-primary focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] uppercase font-bold text-text-secondary">Project ID</label>
                <input
                  type="text"
                  required
                  placeholder="focusflow-12345"
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-bg-muted rounded-xl border border-border-main text-xs text-text-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-text-secondary">Storage Bucket</label>
                <input
                  type="text"
                  required
                  placeholder="project-id.appspot.com"
                  value={storageBucket}
                  onChange={(e) => setStorageBucket(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-bg-muted rounded-xl border border-border-main text-xs text-text-primary focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] uppercase font-bold text-text-secondary">Messaging Sender ID</label>
                <input
                  type="text"
                  required
                  placeholder="8754125896"
                  value={messagingSenderId}
                  onChange={(e) => setMessagingSenderId(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-bg-muted rounded-xl border border-border-main text-xs text-text-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-text-secondary">App ID</label>
                <input
                  type="text"
                  required
                  placeholder="1:8754125896:web:abcd1234"
                  value={appId}
                  onChange={(e) => setAppId(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-bg-muted rounded-xl border border-border-main text-xs text-text-primary focus:outline-none"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-3">
              <button
                type="submit"
                className="flex-grow py-2.5 bg-text-primary hover:bg-opacity-95 text-bg-surface font-semibold rounded-xl text-xs transition-all active:scale-98"
              >
                Connect & Enable Sync
              </button>
              
              {settings.firebaseConfig && (
                <button
                  type="button"
                  onClick={handleDisconnectFirebase}
                  className="py-2.5 px-4 border border-red-200 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-500 font-semibold rounded-xl text-xs transition-all active:scale-98"
                >
                  Disconnect Sync
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Account Deletion */}
        <div className="bg-bg-surface border border-red-200 dark:border-red-950/40 rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="font-semibold text-red-600 dark:text-red-500 flex items-center gap-2">
            <ShieldAlert size={18} />
            <span>Danger Zone</span>
          </h3>
          <p className="text-xs text-text-secondary">Permanently erase your data history. This clears all local storage state.</p>
          
          <button
            onClick={handleDeleteAll}
            className="w-full py-2.5 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-xl text-xs transition-all active:scale-98 flex items-center justify-center gap-1"
          >
            <Trash2 size={14} />
            <span>Permanently Delete All Local Account Data</span>
          </button>
        </div>

      </div>
    </div>
  );
};

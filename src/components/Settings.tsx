import React, { useState } from 'react';
import { useAppContext } from '../context';
import { Moon, Sun, Download, Trash2, Shield, Database, Smartphone } from 'lucide-react';
import { ConfirmModal } from './ConfirmModal';

export const Settings: React.FC = () => {
  const { theme, toggleTheme, transactions, categories } = useAppContext();
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);

  const handleExportData = () => {
    const data = {
      transactions,
      categories,
      exportDate: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gyd-budget-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-24 lg:pb-8 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-app-text tracking-tight">Settings</h1>
      </div>

      <div className="space-y-6">
        <section className="bg-app-card rounded-[2rem] p-6 border border-app-border">
          <h2 className="text-xl font-bold text-app-text mb-6">Preferences</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-app-hover rounded-2xl border border-app-border">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-[#6366F1]/10 rounded-xl text-[#6366F1]">
                  {theme === 'dark' ? <Moon size={24} /> : <Sun size={24} />}
                </div>
                <div>
                  <h3 className="font-bold text-app-text">Theme</h3>
                  <p className="text-sm text-app-muted">Toggle dark/light mode</p>
                </div>
              </div>
              <button
                onClick={toggleTheme}
                className="relative inline-flex h-8 w-14 items-center rounded-full bg-app-hover transition-colors focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:ring-offset-2 focus:ring-offset-app-card"
              >
                <span
                  className={`${
                    theme === 'dark' ? 'translate-x-7 bg-[#6366F1]' : 'translate-x-1 bg-white'
                  } inline-block h-6 w-6 transform rounded-full transition-transform`}
                />
              </button>
            </div>
          </div>
        </section>

        <section className="bg-app-card rounded-[2rem] p-6 border border-app-border">
          <h2 className="text-xl font-bold text-app-text mb-6">Data Management</h2>
          
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-app-hover rounded-2xl border border-app-border gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-500/10 rounded-xl text-green-500">
                  <Download size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-app-text">Export Data</h3>
                  <p className="text-sm text-app-muted">Download your data as JSON</p>
                </div>
              </div>
              <button
                onClick={handleExportData}
                className="px-6 py-3 bg-app-hover hover:bg-app-hover text-app-text font-bold rounded-xl transition-colors"
              >
                Export
              </button>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-red-500/5 rounded-2xl border border-red-500/10 gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-500/10 rounded-xl text-red-500">
                  <Trash2 size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-app-text">Clear Data</h3>
                  <p className="text-sm text-app-muted">Delete all local data permanently</p>
                </div>
              </div>
              <button
                onClick={() => setIsClearModalOpen(true)}
                className="px-6 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 font-bold rounded-xl transition-colors"
              >
                Clear All
              </button>
            </div>
          </div>
        </section>

        <section className="bg-app-card rounded-[2rem] p-6 border border-app-border">
          <h2 className="text-xl font-bold text-app-text mb-6">About & Privacy</h2>
          
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="p-4 bg-app-hover rounded-2xl border border-app-border">
              <Shield className="w-8 h-8 text-[#6366F1] mb-3" />
              <h3 className="font-bold text-app-text mb-1">Privacy First</h3>
              <p className="text-sm text-app-muted">
                Your financial data never leaves your device. Everything is stored locally in your browser.
              </p>
            </div>
            
            <div className="p-4 bg-app-hover rounded-2xl border border-app-border">
              <Database className="w-8 h-8 text-[#6366F1] mb-3" />
              <h3 className="font-bold text-app-text mb-1">Local Storage</h3>
              <p className="text-sm text-app-muted">
                We use IndexedDB and LocalStorage to keep your data safe and accessible offline.
              </p>
            </div>

            <div className="p-4 bg-app-hover rounded-2xl border border-app-border sm:col-span-2">
              <Smartphone className="w-8 h-8 text-[#6366F1] mb-3" />
              <h3 className="font-bold text-app-text mb-1">Install as App</h3>
              <p className="text-sm text-app-muted">
                You can install this app on your home screen for quick access. Look for the "Add to Home Screen" option in your browser menu.
              </p>
            </div>
          </div>
        </section>
      </div>

      <ConfirmModal
        isOpen={isClearModalOpen}
        title="Clear All Data"
        message="WARNING: This will delete all your transactions and categories permanently. This action cannot be undone. Are you absolutely sure?"
        confirmText="Clear All Data"
        isDestructive={true}
        onConfirm={() => {
          localStorage.removeItem('budget-app-state');
          window.location.reload();
        }}
        onCancel={() => setIsClearModalOpen(false)}
      />
    </div>
  );
};

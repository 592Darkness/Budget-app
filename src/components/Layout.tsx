import React, { useState } from 'react';
import { LayoutDashboard, Wallet, Receipt, PieChart, Settings, Plus, Sparkles } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onQuickAdd: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab, onQuickAdd }) => {
  const navItems = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'envelopes', label: 'Budgets', icon: Wallet },
    { id: 'transactions', label: 'Activity', icon: Receipt },
    { id: 'reports', label: 'Stats', icon: PieChart },
    { id: 'advisor', label: 'Advisor', icon: Sparkles },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col md:flex-row font-sans selection:bg-[#6366F1] selection:text-white">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-[#141414] border-r border-white/5 h-screen sticky top-0">
        <div className="flex items-center justify-center h-20 border-b border-white/5">
          <h1 className="text-xl font-bold text-white tracking-tight">Budget<span className="text-[#6366F1]">App</span></h1>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 ${
                  isActive 
                    ? 'bg-[#6366F1]/10 text-[#6366F1] font-medium' 
                    : 'hover:bg-white/5 text-gray-400 hover:text-white'
                }`}
              >
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
        <div className="p-4 border-t border-white/5">
          <button 
            onClick={onQuickAdd}
            className="w-full flex items-center justify-center gap-2 bg-[#6366F1] hover:bg-[#4F46E5] text-white py-3.5 rounded-2xl font-medium transition-colors shadow-lg shadow-[#6366F1]/20"
          >
            <Plus size={20} />
            <span>Add Transaction</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 pb-24 md:pb-0 overflow-y-auto h-screen scroll-smooth">
        <div className="max-w-md md:max-w-3xl lg:max-w-5xl mx-auto p-4 md:p-8">
          {children}
        </div>
      </main>

      {/* Mobile Floating Action Button */}
      <div className="md:hidden fixed bottom-24 right-6 z-50">
        <button 
          onClick={onQuickAdd}
          className="flex items-center justify-center w-14 h-14 bg-[#6366F1] text-white rounded-full shadow-lg shadow-[#6366F1]/30 hover:scale-105 transition-transform"
        >
          <Plus size={28} strokeWidth={2.5} />
        </button>
      </div>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#141414]/90 backdrop-blur-xl border-t border-white/5 px-2 py-2 z-40 pb-safe">
        <nav className="flex items-center justify-around relative overflow-x-auto scrollbar-hide">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center gap-1 p-2 min-w-[60px] transition-colors ${
                  isActive ? 'text-[#6366F1]' : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

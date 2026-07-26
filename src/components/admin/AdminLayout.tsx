import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Palette, 
  ShoppingBag, 
  Users, 
  Target, 
  Settings, 
  ExternalLink, 
  ShieldCheck,
  Search,
  KeyRound,
  Menu,
  X,
  LogOut,
  Star
} from 'lucide-react';

interface AdminLayoutProps {
  activeTab: 'dashboard' | 'cms' | 'orders' | 'customers' | 'marketing' | 'settings' | 'reviews';
  setActiveTab: (tab: 'dashboard' | 'cms' | 'orders' | 'customers' | 'marketing' | 'settings' | 'reviews') => void;
  pendingOrdersCount: number;
  highRiskCount: number;
  onExitAdmin: () => void;
  onLogout?: () => void;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  activeTab,
  setActiveTab,
  pendingOrdersCount,
  highRiskCount,
  onExitAdmin,
  onLogout,
  children,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  interface NavItem {
    id: 'dashboard' | 'cms' | 'orders' | 'customers' | 'marketing' | 'settings' | 'reviews';
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string | number | null;
    badgeColor?: string;
  }

  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'ড্যাশবোর্ড (Dashboard)', icon: LayoutDashboard },
    { 
      id: 'orders', 
      label: 'অর্ডার লিস্ট (Orders)', 
      icon: ShoppingBag, 
      badge: pendingOrdersCount > 0 ? `${pendingOrdersCount} NEW` : '4 NEW',
      badgeColor: 'bg-indigo-600 text-white'
    },
    { id: 'cms', label: 'পেজ বিল্ডার (CMS)', icon: Palette },
    { id: 'reviews', label: 'রিভিউ ম্যানেজমেন্ট', icon: Star },
    { 
      id: 'customers', 
      label: 'কাস্টমার ও ফ্রড ব্লক', 
      icon: Users,
      badge: highRiskCount > 0 ? `${highRiskCount} Risk` : null,
      badgeColor: 'bg-rose-500 text-white'
    },
    { id: 'marketing', label: 'মার্কেটিং পিক্সেল', icon: Target },
    { id: 'settings', label: 'এসইও ও মেটা', icon: Search },
    { id: 'settings', label: 'স্টোর ও চার্জ সেটিং', icon: Settings },
    { id: 'settings', label: 'পাসওয়ার্ড ও সিকিউরিটি', icon: KeyRound },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col lg:flex-row text-slate-800 font-sans antialiased relative">
      {/* Mobile Backdrop overlay when menu is open */}
      {mobileMenuOpen && (
        <div 
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-[#0c1021] text-slate-300 shrink-0 border-r border-slate-800/80 flex flex-col justify-between min-h-screen transform transition-transform duration-200 ease-in-out ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div>
          {/* Sidebar Top Header */}
          <div className="p-4 pt-5 pb-4 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-full bg-indigo-500 animate-pulse shadow-[0_0_12px_#6366f1]" />
              <div>
                <h1 className="font-black text-sm text-white tracking-wide">অ্যাডমিন প্যানেল CMS</h1>
                <p className="text-[10px] font-mono text-slate-400">Control Panel v2.5</p>
              </div>
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/60"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Main Menu Label */}
          <div className="px-4 pt-4 pb-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>মেইন মেনু</span>
            <span className="text-[10px] text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded font-mono">LIVE</span>
          </div>

          {/* Navigation Links */}
          <nav className="px-3 space-y-1.5">
            {navItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id && (item.id !== 'settings' || index === 5);
              return (
                <button
                  key={`${item.id}-${index}`}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full px-3.5 py-3 rounded-xl font-bold text-xs flex items-center justify-between transition-all cursor-pointer border ${
                    isActive
                      ? 'bg-[#181f38] text-white border-indigo-500/30 shadow-sm'
                      : 'border-transparent text-slate-300 hover:bg-[#141a30] hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                    <span className="font-semibold text-[13px]">{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-extrabold shadow-xs ${
                        item.badgeColor || 'bg-indigo-600 text-white'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-800/80 space-y-2">
          {onLogout && (
            <button
              onClick={onLogout}
              className="w-full py-2.5 px-3 bg-[#3a1a1a] hover:bg-[#522424] text-rose-200 font-bold text-xs rounded-xl border border-rose-800/60 flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
            >
              <LogOut className="w-4 h-4 text-rose-400" />
              <span>লগ আউট (Log Out)</span>
            </button>
          )}
          <button
            onClick={onExitAdmin}
            className="w-full py-2.5 px-3 bg-[#141a30] hover:bg-[#1c2442] text-slate-200 font-bold text-xs rounded-xl border border-slate-700/60 flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
          >
            <ExternalLink className="w-4 h-4 text-indigo-400" />
            <span>ওয়েবসাইট দেখুন</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto min-h-screen bg-[#f8fafc]">
        {/* Header Bar */}
        <header className="bg-white border-b border-slate-200/80 px-4 sm:px-6 py-4 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
          <div className="flex items-center gap-3">
            {/* Menu Open/Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl flex items-center gap-1.5 border border-slate-200/80 cursor-pointer transition-all active:scale-95"
            >
              <Menu className="w-4 h-4 text-indigo-600" />
              <span>মেনু বার</span>
            </button>

            <h2 className="text-base font-extrabold text-slate-900 capitalize tracking-tight flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 hidden sm:inline-block" />
              {activeTab === 'dashboard' && 'ড্যাশবোর্ড (Dashboard)'}
              {activeTab === 'cms' && 'পেজ বিল্ডার (Visual CMS Builder)'}
              {activeTab === 'orders' && 'অর্ডার ম্যানেজমেন্ট'}
              {activeTab === 'customers' && 'কাস্টমার ও ফ্রড ব্লক ফিল্টার'}
              {activeTab === 'marketing' && 'মার্কেটিং পিক্সেল ও ট্র্যাকার'}
              {activeTab === 'settings' && 'স্টোর ও চার্জ সেটিংস'}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onExitAdmin}
              className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border border-indigo-200 font-bold text-xs rounded-xl transition-all cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">লাইভ ওয়েবসাইট দেখুন</span>
              <span className="sm:hidden">ওয়েবসাইট</span>
            </button>
          </div>
        </header>

        {/* Page Content Render */}
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
          {children}
        </div>
      </main>
    </div>
  );
};


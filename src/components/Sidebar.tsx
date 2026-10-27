import React from 'react';
import {
  LayoutDashboard,
  Users,
  Trophy,
  AlertCircle,
  Terminal,
  Cpu,
  GraduationCap,
  X,
  Server,
} from 'lucide-react';
import { HealthCheckResult } from '../services/api';

export type TabId = 'dashboard' | 'students' | 'rankings' | 'analysis';

interface SidebarProps {
  currentTab: TabId;
  onSelectTab: (tab: TabId) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  mobileOpen,
  onCloseMobile,
}) => {
  const navItems = [
    {
      id: 'dashboard' as TabId,
      label: 'Dashboard Overview',
      icon: LayoutDashboard,
      desc: 'Class metrics & analytics',
    },
    {
      id: 'students' as TabId,
      label: 'Student Records',
      icon: Users,
      desc: 'Manage & update marks',
    },
    {
      id: 'rankings' as TabId,
      label: 'Academic Rankings',
      icon: Trophy,
      desc: 'Merit list & percentiles',
    },
    {
      id: 'analysis' as TabId,
      label: 'Subject Analysis',
      icon: AlertCircle,
      desc: 'Improvement reports (<60)',
    },
  ];

  const handleSelect = (id: TabId) => {
    onSelectTab(id);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-[#0b1329] text-white shadow-2xl transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-20 items-center justify-between border-b border-slate-800/80 px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 shadow-lg shadow-indigo-600/30">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className="font-bold tracking-tight text-white text-base">
                SmartTracker
              </span>
              <p className="text-[11px] text-slate-400">Academic Intelligence</p>
            </div>
          </div>
          <button
            onClick={onCloseMobile}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Section */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
          <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Navigation Menu
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`group flex w-full items-center gap-3.5 rounded-xl px-3.5 py-3 text-left transition-all ${
                  active
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium shadow-md shadow-indigo-900/30'
                    : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                }`}
              >
                <Icon
                  className={`h-5 w-5 transition-transform group-hover:scale-110 ${
                    active ? 'text-white' : 'text-slate-400 group-hover:text-blue-400'
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium leading-none">{item.label}</div>
                  <div
                    className={`mt-1 text-[11px] truncate ${
                      active ? 'text-blue-100' : 'text-slate-400'
                    }`}
                  >
                    {item.desc}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="border-t border-slate-800/80 p-4">
          <div className="rounded-xl border border-slate-800/90 bg-slate-900/70 p-3 text-center">
            <div className="text-xs font-semibold text-slate-200">Department of Computer Science</div>
            <p className="text-[11px] text-slate-400 mt-0.5">Academic Performance System</p>
          </div>
          <div className="mt-3 flex items-center justify-between px-1 text-[10px] text-slate-400">
            <span>Academic Session 2026</span>
            <span>v1.0.0</span>
          </div>
        </div>
      </aside>
    </>
  );
};

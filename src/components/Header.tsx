import React from 'react';
import { Menu, Plus, RefreshCw, Cpu, CheckCircle2, AlertTriangle } from 'lucide-react';
import { TabId } from './Sidebar';
import { HealthCheckResult } from '../services/api';

interface HeaderProps {
  currentTab: TabId;
  onOpenMobile: () => void;
  onOpenAddModal: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onOpenMobile,
  onOpenAddModal,
  onRefresh,
  isRefreshing,
}) => {
  const getTitles = () => {
    switch (currentTab) {
      case 'dashboard':
        return {
          title: 'Academic Dashboard',
          subtitle: 'Real-time academic performance analytics & grade tracking',
        };
      case 'students':
        return {
          title: 'Student Records',
          subtitle: 'Manage marks across all five subjects with persistent storage',
        };
      case 'rankings':
        return {
          title: 'Merit & Rankings',
          subtitle: 'Official leaderboard calculated and ranked by percentage',
        };
      case 'analysis':
        return {
          title: 'Subject Improvement Reports',
          subtitle: 'Academic diagnostic alerts for marks falling below 60.0%',
        };
      default:
        return { title: 'Academic Tracker', subtitle: 'Performance management' };
    }
  };

  const { title, subtitle } = getTitles();

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 backdrop-blur-md sm:px-8">
      {/* Left side: hamburger on mobile + page title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobile}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
          aria-label="Open navigation menu"
        >
          <Menu className="h-6 w-6" />
        </button>

        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            {title}
          </h1>
          <p className="hidden text-xs text-slate-500 sm:block">{subtitle}</p>
        </div>
      </div>

      {/* Right side: Refresh + Add Student CTA */}
      <div className="flex items-center gap-2.5 sm:gap-3.5">
        {/* Refresh button */}
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors disabled:opacity-50"
          title="Refresh academic data"
        >
          <RefreshCw
            className={`h-4 w-4 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`}
          />
        </button>

        {/* Primary Add Student button */}
        <button
          onClick={onOpenAddModal}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-indigo-500/25 transition-all hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg active:scale-95 sm:text-sm"
        >
          <Plus className="h-4 w-4 stroke-[2.5]" />
          <span className="hidden sm:inline">Add Student</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>
    </header>
  );
};

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: LucideIcon;
  badge?: {
    text: string;
    variant: 'blue' | 'emerald' | 'amber' | 'purple' | 'rose';
  };
  gradient?: 'blue' | 'purple' | 'emerald' | 'amber';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  badge,
  gradient = 'blue',
}) => {
  const iconGradientClasses = {
    blue: 'bg-gradient-to-tr from-blue-600 to-cyan-500 text-white shadow-blue-500/20',
    purple: 'bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-purple-500/20',
    emerald: 'bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-emerald-500/20',
    amber: 'bg-gradient-to-tr from-amber-500 to-orange-500 text-white shadow-amber-500/20',
  }[gradient];

  const badgeClasses = {
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
    rose: 'bg-rose-50 text-rose-700 border-rose-200',
  }[badge?.variant || 'blue'];

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:border-slate-300">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            {title}
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-slate-900">
              {value}
            </span>
            {badge && (
              <span
                className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${badgeClasses}`}
              >
                {badge.text}
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
        </div>
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-xl shadow-lg ${iconGradientClasses}`}
        >
          <Icon className="h-6 w-6 stroke-[2]" />
        </div>
      </div>
    </div>
  );
};

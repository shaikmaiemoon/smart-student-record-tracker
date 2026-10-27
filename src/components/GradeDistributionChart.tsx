import React from 'react';
import { PieChart } from 'lucide-react';

interface GradeDistributionChartProps {
  distribution: Record<'S' | 'A' | 'B' | 'C' | 'D' | 'F', number>;
  totalStudents: number;
}

export const GradeDistributionChart: React.FC<GradeDistributionChartProps> = ({
  distribution,
  totalStudents,
}) => {
  const grades: Array<{
    grade: 'S' | 'A' | 'B' | 'C' | 'D' | 'F';
    range: string;
    label: string;
    bgColor: string;
    textColor: string;
    barColor: string;
    border: string;
  }> = [
    {
      grade: 'S',
      range: '90–100%',
      label: 'Outstanding',
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-700',
      barColor: 'bg-emerald-500',
      border: 'border-emerald-200',
    },
    {
      grade: 'A',
      range: '80–89%',
      label: 'Excellent',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
      barColor: 'bg-blue-600',
      border: 'border-blue-200',
    },
    {
      grade: 'B',
      range: '70–79%',
      label: 'Good',
      bgColor: 'bg-indigo-50',
      textColor: 'text-indigo-700',
      barColor: 'bg-indigo-600',
      border: 'border-indigo-200',
    },
    {
      grade: 'C',
      range: '60–69%',
      label: 'Satisfactory',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700',
      barColor: 'bg-purple-600',
      border: 'border-purple-200',
    },
    {
      grade: 'D',
      range: '50–59%',
      label: 'Passing',
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-700',
      barColor: 'bg-amber-500',
      border: 'border-amber-200',
    },
    {
      grade: 'F',
      range: '<50%',
      label: 'Failing',
      bgColor: 'bg-rose-50',
      textColor: 'text-rose-700',
      barColor: 'bg-rose-500',
      border: 'border-rose-200',
    },
  ];

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <PieChart className="h-5 w-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">Grade Distribution</h3>
          </div>
          <p className="mt-0.5 text-xs text-slate-500">
            Standard 6-tier grading scale defined in C++ core specification
          </p>
        </div>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
          {totalStudents} Enrolled
        </span>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {grades.map((g) => {
          const count = distribution?.[g.grade] || 0;
          const pct = totalStudents > 0 ? ((count / totalStudents) * 100).toFixed(0) : '0';

          return (
            <div
              key={g.grade}
              className={`rounded-xl border ${g.border} ${g.bgColor} p-3.5 transition-all hover:scale-[1.02] hover:shadow-sm`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-xl font-black ${g.textColor}`}>{g.grade}</span>
                <span className="text-[11px] font-semibold text-slate-500">{pct}%</span>
              </div>
              <div className="mt-2 text-2xl font-extrabold text-slate-900">{count}</div>
              <div className="mt-1 text-[11px] text-slate-600 font-medium">{g.range}</div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider">{g.label}</div>

              {/* Mini bar indicator */}
              <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-white/80">
                <div
                  className={`h-full rounded-full ${g.barColor}`}
                  style={{ width: `${Math.min(100, (count / (totalStudents || 1)) * 100)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

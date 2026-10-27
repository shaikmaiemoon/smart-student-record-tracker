import React from 'react';
import { SubjectAverageInfo } from '../types/student';
import { BarChart3, AlertCircle, Award } from 'lucide-react';

interface SubjectPerformanceChartProps {
  subjects: SubjectAverageInfo[];
}

export const SubjectPerformanceChart: React.FC<SubjectPerformanceChartProps> = ({ subjects }) => {
  if (!subjects || subjects.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
        <h3 className="text-base font-bold text-slate-900">Subject Performance</h3>
        <p className="mt-2 text-sm text-slate-500">No subject data available yet.</p>
      </div>
    );
  }

  // Find highest performing subject
  const topSubject = [...subjects].sort((a, b) => b.average - a.average)[0];

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">
              Subject-Wise Performance Averages
            </h3>
          </div>
          <p className="mt-0.5 text-xs text-slate-500">
            Average marks computed across all enrolled students (benchmark threshold: 60.0%)
          </p>
        </div>

        {topSubject && (
          <div className="inline-flex items-center gap-1.5 self-start rounded-full bg-amber-50 border border-amber-200/80 px-3 py-1 text-xs font-semibold text-amber-800">
            <Award className="h-3.5 w-3.5 text-amber-600" />
            <span>Top Subject: {topSubject.subject} ({topSubject.average}%)</span>
          </div>
        )}
      </div>

      <div className="mt-6 space-y-5">
        {subjects.map((item) => {
          const isWeakOverall = item.average < 60;
          const barColor = isWeakOverall
            ? 'from-rose-500 to-amber-500'
            : item.average >= 85
            ? 'from-emerald-500 to-teal-500'
            : 'from-blue-600 to-indigo-600';

          return (
            <div key={item.subject} className="group">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-800 text-sm">
                    {item.subject}
                  </span>
                  {item.studentsBelow60 > 0 && (
                    <span className="inline-flex items-center gap-1 rounded bg-rose-50 px-1.5 py-0.5 text-[10px] font-medium text-rose-700 border border-rose-200">
                      <AlertCircle className="h-3 w-3" />
                      {item.studentsBelow60} below 60%
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[11px] text-slate-400">
                    Min: <span className="font-mono text-slate-600 font-medium">{item.min}</span> / Max:{' '}
                    <span className="font-mono text-slate-600 font-medium">{item.max}</span>
                  </span>
                  <span className="font-mono text-sm font-bold text-slate-900">
                    {item.average.toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* Progress track */}
              <div className="relative h-3 w-full overflow-hidden rounded-full bg-slate-100">
                {/* 60% benchmark guide line */}
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-slate-300 z-10"
                  style={{ left: '60%' }}
                  title="60% Proficiency Threshold"
                />
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${barColor} transition-all duration-700 ease-out`}
                  style={{ width: `${Math.min(100, Math.max(0, item.average))}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4 text-[11px] text-slate-500">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
            Distinction (≥85%)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />
            Proficient (60-84%)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
            Below Threshold (&lt;60%)
          </span>
        </div>
        <span className="italic text-slate-400">Vertical marker at 60% pass requirement</span>
      </div>
    </div>
  );
};

import React from 'react';
import { Trophy, Medal, Award, ArrowUpRight, BookOpen, Crown, CheckCircle2 } from 'lucide-react';
import { Student } from '../types/student';

interface RankingsViewProps {
  rankings: Student[];
  loading: boolean;
  onViewReport: (student: Student) => void;
  onOpenEditModal: (student: Student) => void;
}

export const RankingsView: React.FC<RankingsViewProps> = ({
  rankings,
  loading,
  onViewReport,
}) => {
  const topThree = rankings.slice(0, 3);

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="rounded-2xl border border-indigo-100 bg-gradient-to-r from-[#0b1329] via-indigo-950 to-[#0b1329] p-8 text-white shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-400/20 border border-amber-300/30 px-3 py-1 text-xs font-bold text-amber-300">
              <Crown className="h-4 w-4" />
              <span>Official Academic Rankings (C++ Merit Algorithm)</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Class Merit Leaderboard
            </h2>
            <p className="text-xs sm:text-sm text-indigo-200/90 max-w-2xl leading-relaxed">
              Students ranked strictly by total percentage out of 500 across five curriculum subjects. In case of identical percentage scores, alphabetical tie-breaking is enforced by the C++ core.
            </p>
          </div>

          <div className="flex items-center gap-6 rounded-2xl bg-white/5 border border-white/10 p-4 backdrop-blur-md self-start md:self-auto">
            <div className="text-center">
              <div className="text-xs text-indigo-200">Ranked Students</div>
              <div className="text-2xl font-black font-mono">{rankings.length}</div>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div className="text-center">
              <div className="text-xs text-indigo-200">Top Percentage</div>
              <div className="text-2xl font-black text-amber-400 font-mono">
                {rankings[0]?.percentage.toFixed(1) || '0'}%
              </div>
            </div>
          </div>
        </div>

        {/* Podium 3 Cards */}
        {topThree.length > 0 && (
          <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-3">
            {/* Rank 2 (Silver) */}
            {topThree[1] && (
              <div className="relative order-2 md:order-1 rounded-2xl border border-slate-300/30 bg-slate-800/40 p-6 backdrop-blur-md flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 rounded-full bg-slate-200/20 px-2.5 py-0.5 text-xs font-bold text-slate-200 border border-slate-200/30">
                      <Medal className="h-4 w-4 text-slate-300" />
                      Rank #2 · Silver
                    </span>
                    <span className="rounded bg-white/20 px-2 py-0.5 text-xs font-bold font-mono">
                      {topThree[1].grade}
                    </span>
                  </div>
                  <h3 className="mt-4 text-xl font-bold text-white truncate">
                    {topThree[1].name}
                  </h3>
                  <p className="text-xs text-slate-300 font-mono">ID: #{topThree[1].id}</p>
                </div>

                <div className="mt-6 border-t border-white/10 pt-4 flex items-baseline justify-between">
                  <span className="text-xs text-slate-300 font-mono">
                    {topThree[1].total} / 500
                  </span>
                  <span className="text-2xl font-black text-white font-mono">
                    {topThree[1].percentage.toFixed(2)}%
                  </span>
                </div>
              </div>
            )}

            {/* Rank 1 (Gold - Center) */}
            {topThree[0] && (
              <div className="relative order-1 md:order-2 rounded-2xl border-2 border-amber-400/60 bg-gradient-to-b from-amber-500/20 to-indigo-950/80 p-6 backdrop-blur-md shadow-xl flex flex-col justify-between md:-translate-y-2">
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-amber-400 px-3 py-0.5 text-[11px] font-black uppercase tracking-wider text-slate-950 shadow-md">
                  ★ Class Valedictorian
                </div>
                <div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="flex items-center gap-1.5 rounded-full bg-amber-400/30 px-3 py-1 text-xs font-bold text-amber-200 border border-amber-400/40">
                      <Trophy className="h-4 w-4 text-amber-300" />
                      Rank #1 · Gold Trophy
                    </span>
                    <span className="rounded bg-amber-400 px-2.5 py-0.5 text-xs font-black text-slate-950 font-mono">
                      {topThree[0].grade}
                    </span>
                  </div>
                  <h3 className="mt-4 text-2xl font-extrabold text-white truncate">
                    {topThree[0].name}
                  </h3>
                  <p className="text-xs text-amber-200 font-mono">ID: #{topThree[0].id}</p>
                </div>

                <div className="mt-6 border-t border-amber-400/20 pt-4 flex items-baseline justify-between">
                  <span className="text-xs text-amber-200 font-mono">
                    {topThree[0].total} / 500
                  </span>
                  <span className="text-3xl font-black text-amber-300 font-mono">
                    {topThree[0].percentage.toFixed(2)}%
                  </span>
                </div>
              </div>
            )}

            {/* Rank 3 (Bronze) */}
            {topThree[2] && (
              <div className="relative order-3 rounded-2xl border border-amber-700/30 bg-amber-950/20 p-6 backdrop-blur-md flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 rounded-full bg-amber-700/20 px-2.5 py-0.5 text-xs font-bold text-amber-300 border border-amber-600/30">
                      <Award className="h-4 w-4 text-amber-400" />
                      Rank #3 · Bronze
                    </span>
                    <span className="rounded bg-white/20 px-2 py-0.5 text-xs font-bold font-mono">
                      {topThree[2].grade}
                    </span>
                  </div>
                  <h3 className="mt-4 text-xl font-bold text-white truncate">
                    {topThree[2].name}
                  </h3>
                  <p className="text-xs text-amber-200/80 font-mono">ID: #{topThree[2].id}</p>
                </div>

                <div className="mt-6 border-t border-white/10 pt-4 flex items-baseline justify-between">
                  <span className="text-xs text-amber-200/80 font-mono">
                    {topThree[2].total} / 500
                  </span>
                  <span className="text-2xl font-black text-white font-mono">
                    {topThree[2].percentage.toFixed(2)}%
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Complete Rankings Roster Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 p-6">
          <div>
            <h3 className="text-base font-bold text-slate-900">Complete Academic Merit Standing</h3>
            <p className="text-xs text-slate-500">
              Sorted strictly descending by percentage (tie-breaker alphabetical ascending)
            </p>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
            {rankings.length} Evaluated
          </span>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-16 text-center text-slate-400">Loading rankings...</div>
          ) : rankings.length === 0 ? (
            <div className="py-16 text-center text-slate-500">No records available for ranking.</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-6 text-center w-20">Rank</th>
                  <th className="py-3.5 px-4">Student ID</th>
                  <th className="py-3.5 px-6">Name</th>
                  <th className="py-3.5 px-4 text-right">Total Score</th>
                  <th className="py-3.5 px-6 text-right">Percentage</th>
                  <th className="py-3.5 px-4 text-center">Grade</th>
                  <th className="py-3.5 px-4 text-center">Academic Standing</th>
                  <th className="py-3.5 px-6 text-right">Report</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {rankings.map((s, index) => {
                  const rank = index + 1;
                  const isTop3 = rank <= 3;
                  const rankPill =
                    rank === 1
                      ? 'bg-amber-100 text-amber-900 border-amber-300 font-black'
                      : rank === 2
                      ? 'bg-slate-200 text-slate-800 border-slate-300 font-black'
                      : rank === 3
                      ? 'bg-amber-50 text-amber-800 border-amber-200 font-black'
                      : 'bg-slate-100 text-slate-700 font-semibold';

                  const gradeBadge = {
                    'S': 'bg-emerald-50 text-emerald-700 border-emerald-200',
                    A: 'bg-blue-50 text-blue-700 border-blue-200',
                    B: 'bg-indigo-50 text-indigo-700 border-indigo-200',
                    C: 'bg-purple-50 text-purple-700 border-purple-200',
                    D: 'bg-amber-50 text-amber-700 border-amber-200',
                    F: 'bg-rose-50 text-rose-700 border-rose-200',
                  }[s.grade] || 'bg-slate-50 text-slate-700 border-slate-200';

                  return (
                    <tr
                      key={s.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isTop3 ? 'bg-indigo-50/20' : ''
                      }`}
                    >
                      <td className="py-4 px-6 text-center">
                        <span
                          className={`inline-flex items-center justify-center h-7 w-7 rounded-full border font-mono text-xs ${rankPill}`}
                        >
                          {rank}
                        </span>
                      </td>
                      <td className="py-4 px-4 font-mono font-medium text-slate-500">
                        #{s.id}
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-bold text-slate-900">{s.name}</div>
                        <div className="text-[11px] text-slate-400">
                          {s.performanceRemark}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right font-mono font-bold text-slate-800">
                        {s.total.toFixed(1)} <span className="text-[10px] text-slate-400">/500</span>
                      </td>
                      <td className="py-4 px-6 text-right font-mono text-sm font-black text-blue-600">
                        {s.percentage.toFixed(2)}%
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span
                          className={`inline-block rounded-md border px-2.5 py-0.5 text-xs font-bold ${gradeBadge}`}
                        >
                          {s.grade}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        {s.percentage >= 80 ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            <CheckCircle2 className="h-3 w-3" />
                            Honors List
                          </span>
                        ) : s.needsImprovement ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                            Needs Guidance
                          </span>
                        ) : (
                          <span className="text-[11px] font-medium text-slate-600">
                            Satisfactory
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => onViewReport(s)}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors"
                        >
                          <BookOpen className="h-3.5 w-3.5" />
                          <span>Report</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import {
  Users,
  TrendingUp,
  Award,
  AlertCircle,
  Search,
  Eye,
  Edit2,
  Trash2,
  Plus,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { Student, DashboardStats } from '../types/student';
import { StatCard } from '../components/StatCard';
import { SubjectPerformanceChart } from '../components/SubjectPerformanceChart';
import { GradeDistributionChart } from '../components/GradeDistributionChart';
import { TabId } from '../components/Sidebar';

interface DashboardViewProps {
  students: Student[];
  stats: DashboardStats | null;
  loading: boolean;
  onOpenAddModal: () => void;
  onOpenEditModal: (student: Student) => void;
  onOpenDeleteModal: (student: Student) => void;
  onViewReport: (student: Student) => void;
  onNavigateTab: (tab: TabId) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  students,
  stats,
  loading,
  onOpenAddModal,
  onOpenEditModal,
  onOpenDeleteModal,
  onViewReport,
  onNavigateTab,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.id.toString().includes(searchTerm)
  );

  // Top 3 students for mini podium
  const topThree = [...students]
    .sort((a, b) => b.percentage - a.percentage)
    .slice(0, 3);

  const totalStudents = stats?.totalStudents ?? students.length;
  const avgPercentage = stats?.averagePercentage ?? 0;
  const highestPercentage = stats?.highestPercentage ?? 0;
  const needsImprovementCount = stats?.needsImprovementCount ?? 0;

  return (
    <div className="space-y-8">
      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Students"
          value={totalStudents}
          subtitle="Enrolled in academic curriculum"
          icon={Users}
          gradient="blue"
          badge={{ text: 'JSON Storage', variant: 'blue' }}
        />

        <StatCard
          title="Class Average"
          value={`${avgPercentage.toFixed(1)}%`}
          subtitle="Mean across all 5 subjects"
          icon={TrendingUp}
          gradient="purple"
          badge={{
            text: avgPercentage >= 70 ? 'Good Standing' : 'Mentoring Needed',
            variant: avgPercentage >= 70 ? 'emerald' : 'amber',
          }}
        />

        <StatCard
          title="Highest Score"
          value={`${highestPercentage.toFixed(1)}%`}
          subtitle={stats?.topPerformer ? stats.topPerformer.name : 'Rank 1 Topper'}
          icon={Award}
          gradient="emerald"
          badge={{ text: 'Rank #1', variant: 'emerald' }}
        />

        <StatCard
          title="Needs Improvement"
          value={needsImprovementCount}
          subtitle="Students with marks < 60%"
          icon={AlertCircle}
          gradient="amber"
          badge={{
            text: needsImprovementCount > 0 ? 'Action Req.' : 'All Proficient',
            variant: needsImprovementCount > 0 ? 'rose' : 'emerald',
          }}
        />
      </div>

      {/* Top Performers Podium Banner */}
      {topThree.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-indigo-100 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-6 text-white shadow-md">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-400 text-slate-950 font-bold">
                  ★
                </span>
                <h3 className="text-lg font-bold text-white">Academic Honor Roll</h3>
                <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs text-indigo-200">
                  C++ Ranked Leaderboard
                </span>
              </div>
              <p className="mt-1 text-xs text-indigo-200">
                Top performing students recognized for outstanding achievement across all subjects
              </p>
            </div>

            <button
              onClick={() => onNavigateTab('rankings')}
              className="inline-flex items-center gap-1.5 self-start md:self-auto rounded-xl bg-white/10 px-4 py-2 text-xs font-semibold text-white backdrop-blur-sm hover:bg-white/20 transition-all"
            >
              <span>View Full Merit List</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {topThree.map((s, idx) => {
              const medal = ['🥇 Rank 1', '🥈 Rank 2', '🥉 Rank 3'][idx];
              const borderStyles = [
                'border-amber-400/40 bg-amber-500/10',
                'border-slate-300/40 bg-slate-400/10',
                'border-amber-700/40 bg-amber-700/10',
              ][idx];

              return (
                <div
                  key={s.id}
                  className={`rounded-xl border ${borderStyles} p-4 backdrop-blur-md transition-all hover:scale-[1.02]`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-300">{medal}</span>
                    <span className="rounded bg-white/20 px-2 py-0.5 text-xs font-bold font-mono">
                      {s.grade}
                    </span>
                  </div>
                  <div className="mt-2">
                    <h4 className="text-base font-bold text-white truncate">{s.name}</h4>
                    <p className="text-[11px] text-indigo-200 font-mono">ID: #{s.id}</p>
                  </div>
                  <div className="mt-3 flex items-baseline justify-between border-t border-white/10 pt-2">
                    <span className="text-xs text-indigo-200">Overall:</span>
                    <span className="text-base font-black text-white font-mono">
                      {s.percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Two Analytics Charts Side-by-Side */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <SubjectPerformanceChart subjects={stats?.subjectAverages || []} />
        <GradeDistributionChart
          distribution={
            stats?.gradeDistribution || { 'S': 0, A: 0, B: 0, C: 0, D: 0, F: 0 }
          }
          totalStudents={totalStudents}
        />
      </div>

      {/* Student Records Quick Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 p-6">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900">Student Directory & Marks</h3>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                {filteredStudents.length} records
              </span>
            </div>
            <p className="mt-0.5 text-xs text-slate-500">
              Directly managed and persisted by the authoritative C++17 REST service
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search ID or student name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-9 pr-3 py-1.5 text-xs outline-none focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </div>

            <button
              onClick={onOpenAddModal}
              className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition-all shrink-0"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add</span>
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <div className="h-8 w-8 animate-spin rounded-full border-3 border-indigo-600 border-t-transparent" />
              <p className="mt-3 text-xs">Loading records from C++ engine...</p>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="py-16 text-center text-slate-500">
              <AlertCircle className="mx-auto h-8 w-8 text-slate-300" />
              <p className="mt-2 text-sm font-semibold text-slate-700">No student records found</p>
              <p className="text-xs text-slate-400 mt-1">
                {searchTerm ? 'Try another search query' : 'Click "Add Student" to create a new record'}
              </p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-4">Rank</th>
                  <th className="py-3 px-4">ID</th>
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4 text-center">Marks (5 Subjects)</th>
                  <th className="py-3 px-4 text-right">Total</th>
                  <th className="py-3 px-4 text-right">Percent</th>
                  <th className="py-3 px-4 text-center">Grade</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredStudents.map((s) => {
                  const gradeBadge = {
                    'S': 'bg-emerald-50 text-emerald-700 border-emerald-200',
                    A: 'bg-blue-50 text-blue-700 border-blue-200',
                    B: 'bg-indigo-50 text-indigo-700 border-indigo-200',
                    C: 'bg-purple-50 text-purple-700 border-purple-200',
                    D: 'bg-amber-50 text-amber-700 border-amber-200',
                    F: 'bg-rose-50 text-rose-700 border-rose-200',
                  }[s.grade] || 'bg-slate-50 text-slate-700 border-slate-200';

                  return (
                    <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-600">
                        {s.rank ? `#${s.rank}` : '-'}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-medium text-slate-500">
                        #{s.id}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">{s.name}</div>
                        <div className="text-[10px] text-slate-400">
                          {s.performanceRemark || 'Student Record'}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1 font-mono text-[11px]">
                          {s.marks.map((m, idx) => (
                            <span
                              key={idx}
                              title={`${['C Prog', 'C++', 'Math', 'CS', 'Eng'][idx]}: ${m}/100`}
                              className={`rounded px-1.5 py-0.5 text-[10px] font-medium border ${
                                m < 60
                                  ? 'bg-rose-50 text-rose-700 border-rose-200 font-bold'
                                  : m >= 85
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : 'bg-slate-100 text-slate-700 border-slate-200'
                              }`}
                            >
                              {m}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-800">
                        {s.total.toFixed(1)}
                        <span className="text-[10px] text-slate-400">/500</span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-black text-blue-600">
                        {s.percentage.toFixed(2)}%
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-block rounded-md border px-2 py-0.5 font-bold ${gradeBadge}`}
                        >
                          {s.grade}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {s.needsImprovement ? (
                          <button
                            onClick={() => onViewReport(s)}
                            className="inline-flex items-center gap-1 rounded-full bg-rose-50 border border-rose-200 px-2 py-0.5 text-[10px] font-semibold text-rose-700 hover:bg-rose-100"
                          >
                            <AlertCircle className="h-3 w-3" />
                            Needs Attention ({s.weakSubjectsCount})
                          </button>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                            <Sparkles className="h-3 w-3" />
                            Proficient
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onViewReport(s)}
                            title="View C++ Subject Improvement Report"
                            className="rounded-lg p-1.5 text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => onOpenEditModal(s)}
                            title="Edit marks"
                            className="rounded-lg p-1.5 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => onOpenDeleteModal(s)}
                            title="Delete student"
                            className="rounded-lg p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
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

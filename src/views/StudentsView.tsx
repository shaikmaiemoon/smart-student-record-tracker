import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Eye,
  Edit2,
  Trash2,
  AlertCircle,
  Filter,
  CheckCircle2,
  ArrowUpDown,
  BookOpen,
} from 'lucide-react';
import { Student, SUBJECT_LIST } from '../types/student';

interface StudentsViewProps {
  students: Student[];
  loading: boolean;
  onOpenAddModal: () => void;
  onOpenEditModal: (student: Student) => void;
  onOpenDeleteModal: (student: Student) => void;
  onViewReport: (student: Student) => void;
}

export const StudentsView: React.FC<StudentsViewProps> = ({
  students,
  loading,
  onOpenAddModal,
  onOpenEditModal,
  onOpenDeleteModal,
  onViewReport,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [gradeFilter, setGradeFilter] = useState<string>('ALL');
  const [needsImprovementOnly, setNeedsImprovementOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'id' | 'name' | 'percentage' | 'rank'>('rank');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const filteredStudents = useMemo(() => {
    let result = students.filter((s) => {
      const matchSearch =
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.id.toString().includes(searchTerm);

      const matchGrade = gradeFilter === 'ALL' || s.grade === gradeFilter;
      const matchImprovement = !needsImprovementOnly || s.needsImprovement;

      return matchSearch && matchGrade && matchImprovement;
    });

    result.sort((a, b) => {
      let cmp = 0;
      if (sortBy === 'id') {
        cmp = a.id - b.id;
      } else if (sortBy === 'name') {
        cmp = a.name.localeCompare(b.name);
      } else if (sortBy === 'percentage') {
        cmp = a.percentage - b.percentage;
      } else if (sortBy === 'rank') {
        cmp = (a.rank || 999) - (b.rank || 999);
      }
      return sortOrder === 'asc' ? cmp : -cmp;
    });

    return result;
  }, [students, searchTerm, gradeFilter, needsImprovementOnly, sortBy, sortOrder]);

  const toggleSort = (field: 'id' | 'name' | 'percentage' | 'rank') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder(field === 'percentage' ? 'desc' : 'asc');
    }
  };

  return (
    <div className="space-y-6">
      {/* Search, Filter & Action Toolbar */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by student name or unique ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/60 pl-10 pr-4 py-2 text-xs sm:text-sm outline-none focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600"
              >
                Clear
              </button>
            )}
          </div>

          {/* Quick Filters and CTA */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Grade Filter Pills */}
            <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50/80 p-1 text-xs">
              <span className="px-2 font-semibold text-slate-400 text-[11px] hidden sm:inline">
                Grade:
              </span>
              {['ALL', 'S', 'A', 'B', 'C', 'D', 'F'].map((g) => (
                <button
                  key={g}
                  onClick={() => setGradeFilter(g)}
                  className={`rounded-lg px-2.5 py-1 font-semibold transition-all ${
                    gradeFilter === g
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>

            {/* Needs Improvement Toggle */}
            <button
              onClick={() => setNeedsImprovementOnly(!needsImprovementOnly)}
              className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all ${
                needsImprovementOnly
                  ? 'border-rose-300 bg-rose-50 text-rose-700 shadow-2xs'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              <AlertCircle className="h-3.5 w-3.5 text-rose-500" />
              <span>&lt; 60% Only</span>
            </button>

            {/* Add Student Primary Button */}
            <button
              onClick={onOpenAddModal}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-indigo-500/25 hover:from-blue-700 hover:to-indigo-700 transition-all"
            >
              <Plus className="h-4 w-4" />
              <span>New Student</span>
            </button>
          </div>
        </div>

        {/* Active Filter Chips & Summary */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3 text-xs text-slate-500">
          <div>
            Showing <span className="font-bold text-slate-800">{filteredStudents.length}</span> of{' '}
            <span className="font-bold text-slate-800">{students.length}</span> student records
            {gradeFilter !== 'ALL' && ` (Grade: ${gradeFilter})`}
            {needsImprovementOnly && ' (Needs Improvement)'}
          </div>

          <div className="flex items-center gap-3 text-[11px]">
            <span>Subjects:</span>
            {SUBJECT_LIST.map((subj) => (
              <span key={subj} className="rounded bg-slate-100 px-1.5 py-0.5 text-slate-600 font-medium">
                {subj}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Main Student Records Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <div className="h-8 w-8 animate-spin rounded-full border-3 border-indigo-600 border-t-transparent" />
              <p className="mt-3 text-xs">Querying C++ backend database...</p>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="py-20 text-center text-slate-500">
              <AlertCircle className="mx-auto h-10 w-10 text-slate-300" />
              <p className="mt-3 text-base font-bold text-slate-800">No matching student records</p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                No students match your active filter criteria. Try adjusting your search query or reset filters.
              </p>
              <div className="mt-4 flex justify-center gap-3">
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setGradeFilter('ALL');
                    setNeedsImprovementOnly(false);
                  }}
                  className="rounded-xl border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Reset Filters
                </button>
                <button
                  onClick={onOpenAddModal}
                  className="rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
                >
                  Add New Student
                </button>
              </div>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th
                    onClick={() => toggleSort('rank')}
                    className="py-3.5 px-4 cursor-pointer hover:text-slate-800"
                  >
                    <div className="flex items-center gap-1">
                      <span>Rank</span>
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </th>
                  <th
                    onClick={() => toggleSort('id')}
                    className="py-3.5 px-4 cursor-pointer hover:text-slate-800"
                  >
                    <div className="flex items-center gap-1">
                      <span>ID</span>
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </th>
                  <th
                    onClick={() => toggleSort('name')}
                    className="py-3.5 px-4 cursor-pointer hover:text-slate-800"
                  >
                    <div className="flex items-center gap-1">
                      <span>Student Name</span>
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </th>
                  <th className="py-3.5 px-3 text-center">C Prog</th>
                  <th className="py-3.5 px-3 text-center">C++</th>
                  <th className="py-3.5 px-3 text-center">Math</th>
                  <th className="py-3.5 px-3 text-center">CS</th>
                  <th className="py-3.5 px-3 text-center">English</th>
                  <th className="py-3.5 px-4 text-right">Total (/500)</th>
                  <th
                    onClick={() => toggleSort('percentage')}
                    className="py-3.5 px-4 text-right cursor-pointer hover:text-slate-800"
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>Percentage</span>
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </th>
                  <th className="py-3.5 px-4 text-center">Grade</th>
                  <th className="py-3.5 px-4 text-center">Report Alert</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredStudents.map((s) => {
                  const gradeStyles = {
                    'S': 'bg-emerald-50 text-emerald-700 border-emerald-200',
                    A: 'bg-blue-50 text-blue-700 border-blue-200',
                    B: 'bg-indigo-50 text-indigo-700 border-indigo-200',
                    C: 'bg-purple-50 text-purple-700 border-purple-200',
                    D: 'bg-amber-50 text-amber-700 border-amber-200',
                    F: 'bg-rose-50 text-rose-700 border-rose-200',
                  }[s.grade] || 'bg-slate-50 text-slate-700 border-slate-200';

                  return (
                    <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-700">
                        {s.rank ? (
                          <span className={`inline-block px-1.5 py-0.5 rounded text-[11px] ${
                            s.rank === 1 ? 'bg-amber-100 text-amber-800 font-black' :
                            s.rank === 2 ? 'bg-slate-200 text-slate-800' :
                            s.rank === 3 ? 'bg-amber-50 text-amber-900 border border-amber-200' : 'text-slate-600'
                          }`}>
                            #{s.rank}
                          </span>
                        ) : '-'}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-medium text-slate-500">
                        #{s.id}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">{s.name}</div>
                        <div className="text-[10px] text-slate-400">{s.performanceRemark}</div>
                      </td>

                      {/* 5 subject marks columns */}
                      {s.marks.map((m, idx) => (
                        <td key={idx} className="py-3.5 px-3 text-center">
                          <span
                            className={`inline-block font-mono text-xs px-2 py-0.5 rounded border ${
                              m < 60
                                ? 'bg-rose-50 text-rose-700 border-rose-200 font-bold'
                                : m >= 85
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200 font-semibold'
                                : 'bg-slate-50 text-slate-700 border-slate-200'
                            }`}
                          >
                            {m.toFixed(1)}
                          </span>
                        </td>
                      ))}

                      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-800">
                        {s.total.toFixed(1)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-black text-blue-600">
                        {s.percentage.toFixed(2)}%
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-block rounded-md border px-2 py-0.5 font-bold ${gradeStyles}`}>
                          {s.grade}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {s.needsImprovement ? (
                          <button
                            onClick={() => onViewReport(s)}
                            className="inline-flex items-center gap-1 rounded-full bg-rose-50 border border-rose-200 px-2.5 py-0.5 text-[10px] font-semibold text-rose-700 hover:bg-rose-100 transition-colors"
                          >
                            <AlertCircle className="h-3 w-3" />
                            <span>{s.weakSubjectsCount} Weak Subject(s)</span>
                          </button>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-700">
                            <CheckCircle2 className="h-3 w-3" />
                            <span>Proficient</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onViewReport(s)}
                            title="Generate C++ Improvement Report"
                            className="rounded-lg p-1.5 text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                          >
                            <BookOpen className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => onOpenEditModal(s)}
                            title="Edit student marks"
                            className="rounded-lg p-1.5 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => onOpenDeleteModal(s)}
                            title="Delete student record"
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

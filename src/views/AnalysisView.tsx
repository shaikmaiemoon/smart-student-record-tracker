import React, { useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  BookOpen,
  Search,
  Sparkles,
  TrendingDown,
  TrendingUp,
  FileText,
  Lightbulb,
} from 'lucide-react';
import { Student, DashboardStats, SUBJECT_LIST, SubjectName } from '../types/student';

interface AnalysisViewProps {
  students: Student[];
  stats: DashboardStats | null;
  onViewReport: (student: Student) => void;
}

export const AnalysisView: React.FC<AnalysisViewProps> = ({
  students,
  stats,
  onViewReport,
}) => {
  const [selectedStudentId, setSelectedStudentId] = useState<number | ''>('');
  const [searchTerm, setSearchTerm] = useState('');

  // Find students who have at least one mark < 60
  const studentsNeedingImprovement = students.filter((s) => s.needsImprovement);
  const proficientStudents = students.filter((s) => !s.needsImprovement);

  // Subject requiring most attention class-wide
  const subjectAverages = stats?.subjectAverages || [];
  const mostChallengingSubject = [...subjectAverages].sort(
    (a, b) => b.studentsBelow60 - a.studentsBelow60 || a.average - b.average
  )[0];

  const filteredNeeding = studentsNeedingImprovement.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.id.toString().includes(searchTerm)
  );

  return (
    <div className="space-y-8">
      {/* Top Banner: Subject Analysis & Rule Introduction */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-100 text-rose-700 font-bold text-xs">
                &lt;60
              </span>
              <h2 className="text-xl font-bold text-slate-900">
                Curriculum Subject Analysis & Improvement Reports
              </h2>
            </div>
            <p className="mt-1 text-xs text-slate-500 max-w-2xl leading-relaxed">
              Based on the core academic rule: any student scoring under{' '}
              <span className="font-semibold text-slate-800">60.0 marks</span> in any of the five
              curriculum subjects requires structured academic advisory and remedial tasks.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-center">
              <div className="text-[10px] font-bold uppercase tracking-wider text-rose-600">
                Needs Advisory
              </div>
              <div className="text-xl font-extrabold text-rose-900 font-mono">
                {studentsNeedingImprovement.length} Students
              </div>
            </div>

            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-center">
              <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                All Proficient
              </div>
              <div className="text-xl font-extrabold text-emerald-900 font-mono">
                {proficientStudents.length} Students
              </div>
            </div>
          </div>
        </div>

        {/* Most Challenging Subject Alert */}
        {mostChallengingSubject && mostChallengingSubject.studentsBelow60 > 0 && (
          <div className="mt-5 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50/60 p-4">
            <TrendingDown className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900">
                Curriculum Attention Required: {mostChallengingSubject.subject}
              </h4>
              <p className="mt-0.5 text-xs text-amber-800">
                This subject has the highest remediation count:{' '}
                <span className="font-bold">{mostChallengingSubject.studentsBelow60} student(s)</span>{' '}
                scored below 60. Class average stands at{' '}
                <span className="font-mono font-bold">{mostChallengingSubject.average}%</span>.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 5 Subjects Aggregate Breakdown Cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">
            Subject-Wise Performance Metrics
          </h3>
          <span className="text-xs text-slate-400">Calculated by C++ Backend</span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {SUBJECT_LIST.map((subjName: SubjectName) => {
            const subjData = subjectAverages.find((s) => s.subject === subjName);
            const avg = subjData?.average ?? 0;
            const weakCount = subjData?.studentsBelow60 ?? 0;
            const minScore = subjData?.min ?? 0;
            const maxScore = subjData?.max ?? 0;

            return (
              <div
                key={subjName}
                className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all hover:border-slate-300 hover:shadow-md"
              >
                <div className="text-xs font-bold text-slate-800 truncate mb-1">
                  {subjName}
                </div>
                <div className="mt-2 text-2xl font-black text-slate-900 font-mono">
                  {avg.toFixed(1)}%
                </div>
                <p className="text-[11px] text-slate-400">Class Average</p>

                <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-[11px]">
                  <div className="flex justify-between text-slate-500">
                    <span>Range:</span>
                    <span className="font-mono font-semibold text-slate-700">
                      {minScore} – {maxScore}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Below 60:</span>
                    <span
                      className={`font-mono font-bold ${
                        weakCount > 0 ? 'text-rose-600' : 'text-emerald-600'
                      }`}
                    >
                      {weakCount} {weakCount === 1 ? 'student' : 'students'}
                    </span>
                  </div>
                </div>

                <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full ${
                      avg < 60 ? 'bg-rose-500' : avg >= 80 ? 'bg-emerald-500' : 'bg-blue-600'
                    }`}
                    style={{ width: `${Math.min(100, Math.max(0, avg))}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Student Report Generator Picker */}
      <div className="rounded-2xl border border-indigo-100 bg-gradient-to-r from-blue-50/50 via-indigo-50/40 to-purple-50/50 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-indigo-600" />
              <h3 className="text-base font-bold text-indigo-950">
                Instant Student Improvement Report Query
              </h3>
            </div>
            <p className="mt-0.5 text-xs text-indigo-800/80">
              Select any enrolled student to query the C++ endpoint{' '}
              <code className="rounded bg-white/80 px-1 py-0.5 font-mono text-[11px]">
                /api/students/&#123;id&#125;/improvement-report
              </code>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value ? Number(e.target.value) : '')}
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
            >
              <option value="">-- Choose a Student --</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  #{s.id} · {s.name} ({s.percentage}% {s.grade})
                  {s.needsImprovement ? ' [⚠️ Below 60]' : ''}
                </option>
              ))}
            </select>

            <button
              disabled={!selectedStudentId}
              onClick={() => {
                const s = students.find((st) => st.id === selectedStudentId);
                if (s) onViewReport(s);
              }}
              className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 disabled:opacity-50 transition-all shrink-0"
            >
              <BookOpen className="h-4 w-4" />
              <span>Generate Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* Roster of Students Requiring Academic Improvement */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-rose-600" />
              <h3 className="text-base font-bold text-slate-900">
                Students Requiring Immediate Improvement (&lt; 60% Marks)
              </h3>
            </div>
            <p className="mt-0.5 text-xs text-slate-500">
              Students highlighted below have scored less than 60 in one or more subjects
            </p>
          </div>

          <div className="relative w-full sm:w-60">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Filter by name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/60 pl-9 pr-3 py-1.5 text-xs outline-none focus:border-blue-600 focus:bg-white"
            />
          </div>
        </div>

        {filteredNeeding.length === 0 ? (
          <div className="py-12 text-center text-slate-500">
            <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-500" />
            <p className="mt-3 text-base font-bold text-slate-800">
              {studentsNeedingImprovement.length === 0
                ? 'Excellent! No students have subjects below 60.'
                : 'No students match your filter query.'}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Every student has met or exceeded the 60% subject benchmark.
            </p>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            {filteredNeeding.map((s) => {
              // Identify weak subjects
              const weakSubjs = SUBJECT_LIST.filter((_, idx) => s.marks[idx] < 60);

              return (
                <div
                  key={s.id}
                  className="rounded-xl border border-rose-200/80 bg-rose-50/20 p-5 shadow-2xs hover:border-rose-300 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono text-xs font-bold text-slate-500">
                        #{s.id}
                      </span>
                      <h4 className="text-base font-bold text-slate-900">{s.name}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Overall: {s.percentage}% · Grade {s.grade}
                      </p>
                    </div>

                    <button
                      onClick={() => onViewReport(s)}
                      className="flex items-center gap-1.5 rounded-lg border border-rose-300 bg-white px-3 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-50 shadow-2xs transition-colors"
                    >
                      <BookOpen className="h-3.5 w-3.5" />
                      <span>View C++ Report</span>
                    </button>
                  </div>

                  <div className="mt-4">
                    <div className="text-[11px] font-semibold text-slate-600 mb-1.5">
                      Weak Subject(s) Flagged:
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {weakSubjs.map((subj) => {
                        const idx = SUBJECT_LIST.indexOf(subj);
                        const mark = s.marks[idx];
                        const shortfall = (60 - mark).toFixed(1);
                        return (
                          <span
                            key={subj}
                            className="inline-flex items-center gap-1 rounded-md bg-rose-100/80 border border-rose-200 px-2 py-0.5 text-xs font-semibold text-rose-800 font-mono"
                          >
                            <span>{subj}:</span>
                            <span className="font-black">{mark}/100</span>
                            <span className="text-[10px] text-rose-600 font-normal">
                              (-{shortfall})
                            </span>
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 border-t border-rose-100 pt-2">
                    <span>Pass / Fail Threshold: 60.0%</span>
                    <span className="font-semibold text-rose-700">Needs Remedial Coaching</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

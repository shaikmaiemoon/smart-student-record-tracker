import React, { useState, useEffect } from 'react';
import { X, Check, AlertCircle, Sparkles } from 'lucide-react';
import { Student, StudentFormData, SUBJECT_LIST, SubjectName } from '../types/student';

interface StudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: StudentFormData) => Promise<void>;
  studentToEdit?: Student | null;
  existingIds: number[];
}

export const StudentModal: React.FC<StudentModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  studentToEdit,
  existingIds,
}) => {
  const isEditMode = !!studentToEdit;

  const [id, setId] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [marks, setMarks] = useState<[string, string, string, string, string]>(['', '', '', '', '']);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [submitting, setSubmitting] = useState(false);

  // Initialize form state ONLY when modal opens or studentToEdit changes
  useEffect(() => {
    if (!isOpen) return;

    if (studentToEdit) {
      setId(studentToEdit.id.toString());
      setName(studentToEdit.name);
      setMarks([
        studentToEdit.marks[0].toString(),
        studentToEdit.marks[1].toString(),
        studentToEdit.marks[2].toString(),
        studentToEdit.marks[3].toString(),
        studentToEdit.marks[4].toString(),
      ]);
      setErrors({});
    } else {
      // For a new student, suggest the next available ID
      const maxId = existingIds.length > 0 ? Math.max(...existingIds) : 100;
      setId((maxId + 1).toString());
      setName('');
      setMarks(['', '', '', '', '']);
      setErrors({});
    }
  }, [isOpen, studentToEdit]); // Intentionally do NOT depend on existingIds to prevent reset while typing

  if (!isOpen) return null;

  // Real-time live calculations based on user-entered values
  const numericMarks = marks.map((m) => {
    const val = parseFloat(m.trim());
    return !isNaN(val) && val >= 0 && val <= 100 ? val : null;
  });

  const enteredMarksSum = numericMarks.reduce<number>(
    (sum, m) => sum + (m !== null ? m : 0),
    0
  );
  const enteredMarksCount = numericMarks.filter((m) => m !== null).length;

  // Compute total out of 500
  const total = enteredMarksSum;
  // Compute percentage (out of 500 = total / 5.0)
  const percentage = Math.round((total / 5.0) * 100) / 100;

  const calculateGrade = (p: number, count: number) => {
    if (count === 0) return { grade: '-', label: 'Pending Marks Input', color: 'bg-slate-100 text-slate-600 border-slate-300' };
    if (p >= 90) return { grade: 'S', label: 'Outstanding Distinction', color: 'bg-emerald-50 text-emerald-700 border-emerald-300' };
    if (p >= 80) return { grade: 'A', label: 'Excellent', color: 'bg-blue-50 text-blue-700 border-blue-300' };
    if (p >= 70) return { grade: 'B', label: 'Good', color: 'bg-indigo-50 text-indigo-700 border-indigo-300' };
    if (p >= 60) return { grade: 'C', label: 'Satisfactory', color: 'bg-purple-50 text-purple-700 border-purple-300' };
    if (p >= 50) return { grade: 'D', label: 'Passing', color: 'bg-amber-50 text-amber-700 border-amber-300' };
    return { grade: 'F', label: 'Needs Intervention', color: 'bg-rose-50 text-rose-700 border-rose-300' };
  };

  const gradeInfo = calculateGrade(percentage, enteredMarksCount);
  const hasMarksBelow60 = numericMarks.some((m) => m !== null && m < 60);

  const handleMarkChange = (index: number, val: string) => {
    const newMarks: [string, string, string, string, string] = [...marks];
    newMarks[index] = val;
    setMarks(newMarks);

    if (errors[`mark_${index}`]) {
      const newErrors = { ...errors };
      delete newErrors[`mark_${index}`];
      setErrors(newErrors);
    }
    if (errors.form) {
      const newErrors = { ...errors };
      delete newErrors.form;
      setErrors(newErrors);
    }
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (errors.name) {
      const newErrors = { ...errors };
      delete newErrors.name;
      setErrors(newErrors);
    }
  };

  const handleIdChange = (val: string) => {
    setId(val);
    if (errors.id) {
      const newErrors = { ...errors };
      delete newErrors.id;
      setErrors(newErrors);
    }
  };

  const validate = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    const numericId = parseInt(id.trim(), 10);
    if (isNaN(numericId) || numericId <= 0) {
      newErrors.id = 'Please enter a valid positive student ID (e.g. 109).';
    } else if (!isEditMode && existingIds.includes(numericId)) {
      newErrors.id = `Student ID ${numericId} already exists. Please choose a unique ID.`;
    }

    if (!name.trim()) {
      newErrors.name = 'Student name cannot be empty.';
    } else if (name.trim().length > 100) {
      newErrors.name = 'Name cannot exceed 100 characters.';
    }

    marks.forEach((m, idx) => {
      const trimmed = m.trim();
      if (!trimmed) {
        newErrors[`mark_${idx}`] = `Enter marks for ${SUBJECT_LIST[idx]} (0-100).`;
      } else {
        const num = parseFloat(trimmed);
        if (isNaN(num) || num < 0 || num > 100) {
          newErrors[`mark_${idx}`] = `${SUBJECT_LIST[idx]} must be between 0 and 100.`;
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setSubmitting(true);
      const parsedId = parseInt(id.trim(), 10);
      const parsedMarks: [number, number, number, number, number] = [
        parseFloat(marks[0].trim()),
        parseFloat(marks[1].trim()),
        parseFloat(marks[2].trim()),
        parseFloat(marks[3].trim()),
        parseFloat(marks[4].trim()),
      ];

      await onSubmit({
        id: parsedId,
        name: name.trim(),
        marks: parsedMarks,
      });
      onClose();
    } catch (err: any) {
      setErrors({ form: err.message || 'Failed to save student record.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/70 px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {isEditMode ? `Edit Student Marks (#${studentToEdit.id})` : 'Add New Student Record'}
            </h2>
            <p className="text-xs text-slate-500">
              {isEditMode
                ? 'Update academic performance marks in persistent storage'
                : 'Enter student details and marks for all five curriculum subjects'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200/60 hover:text-slate-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {errors.form && (
            <div className="flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-800">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
              <span>{errors.form}</span>
            </div>
          )}

          {/* Student ID & Name */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Student ID
              </label>
              <input
                type="number"
                disabled={isEditMode}
                value={id}
                onChange={(e) => handleIdChange(e.target.value)}
                placeholder="e.g. 109"
                className={`w-full rounded-xl border px-3 py-2 text-sm font-mono font-medium outline-none transition-all ${
                  isEditMode
                    ? 'bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed'
                    : errors.id
                    ? 'border-rose-400 bg-rose-50/30 focus:border-rose-500 focus:ring-2 focus:ring-rose-200'
                    : 'border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100'
                }`}
              />
              {errors.id && <p className="mt-1 text-[11px] text-rose-600">{errors.id}</p>}
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Student Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Siddharth Verma"
                className={`w-full rounded-xl border px-3 py-2 text-sm outline-none transition-all ${
                  errors.name
                    ? 'border-rose-400 bg-rose-50/30 focus:border-rose-500 focus:ring-2 focus:ring-rose-200'
                    : 'border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100'
                }`}
              />
              {errors.name && <p className="mt-1 text-[11px] text-rose-600">{errors.name}</p>}
            </div>
          </div>

          {/* Marks for 5 Subjects */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Subject Marks (out of 100 each)
              </label>
              <span className="text-[11px] text-slate-500">Benchmark: 60 / 100</span>
            </div>

            <div className="space-y-2.5 rounded-xl border border-slate-200/80 bg-slate-50/50 p-3.5">
              {SUBJECT_LIST.map((subject: SubjectName, index: number) => {
                const rawVal = marks[index];
                const numericVal = parseFloat(rawVal.trim());
                const isBelow60 = !isNaN(numericVal) && numericVal < 60;
                const fieldError = errors[`mark_${index}`];

                return (
                  <div
                    key={subject}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-white p-2.5 rounded-lg border border-slate-200/80 shadow-2xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-md bg-slate-100 text-xs font-bold text-slate-600 font-mono">
                        {index + 1}
                      </span>
                      <span className="text-sm font-medium text-slate-800">{subject}</span>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      {isBelow60 && (
                        <span className="text-[10px] font-semibold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                          &lt; 60 Alert
                        </span>
                      )}
                      <div className="relative w-24">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="any"
                          value={rawVal}
                          onChange={(e) => handleMarkChange(index, e.target.value)}
                          placeholder="0 - 100"
                          className={`w-full rounded-lg border px-2.5 py-1.5 text-right font-mono text-sm font-bold outline-none transition-all ${
                            fieldError
                              ? 'border-rose-400 bg-rose-50/40 text-rose-900 focus:border-rose-500'
                              : isBelow60
                              ? 'border-amber-300 bg-amber-50/40 text-amber-900 focus:border-amber-500'
                              : 'border-slate-300 text-slate-900 focus:border-blue-600 focus:ring-1 focus:ring-blue-100'
                          }`}
                        />
                      </div>
                      <span className="text-xs font-semibold text-slate-400">/100</span>
                    </div>
                    {fieldError && (
                      <p className="w-full text-right text-[10px] text-rose-600 sm:hidden">
                        {fieldError}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Real-time Calculation Summary Card */}
          <div className="rounded-xl border border-indigo-100 bg-gradient-to-r from-blue-50/80 via-indigo-50/60 to-purple-50/80 p-4">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-900 mb-2">
              <Sparkles className="h-4 w-4 text-indigo-600" />
              <span>Real-Time Academic Computation</span>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded-lg bg-white/90 p-2 border border-indigo-100/80 shadow-2xs">
                <div className="text-[10px] uppercase font-semibold text-slate-500">Total Marks</div>
                <div className="text-lg font-black text-slate-900 font-mono">
                  {total.toFixed(1)} <span className="text-xs font-normal text-slate-400">/500</span>
                </div>
              </div>

              <div className="rounded-lg bg-white/90 p-2 border border-indigo-100/80 shadow-2xs">
                <div className="text-[10px] uppercase font-semibold text-slate-500">Percentage</div>
                <div className="text-lg font-black text-blue-600 font-mono">
                  {enteredMarksCount > 0 ? `${percentage.toFixed(2)}%` : '—'}
                </div>
              </div>

              <div className="rounded-lg bg-white/90 p-2 border border-indigo-100/80 shadow-2xs">
                <div className="text-[10px] uppercase font-semibold text-slate-500">Calculated Grade</div>
                <div className="flex items-center justify-center gap-1">
                  <span className={`text-base font-black px-2 py-0.5 rounded border ${gradeInfo.color}`}>
                    {gradeInfo.grade}
                  </span>
                </div>
              </div>
            </div>

            {hasMarksBelow60 && (
              <p className="mt-2 text-center text-[11px] font-medium text-amber-800">
                ⚠️ Contains subjects below 60.0% — will generate a Subject Improvement Report.
              </p>
            )}
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2 text-xs font-semibold text-white shadow-md shadow-indigo-500/20 hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50"
            >
              <Check className="h-4 w-4" />
              <span>{submitting ? 'Saving...' : isEditMode ? 'Update Marks' : 'Save Record'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

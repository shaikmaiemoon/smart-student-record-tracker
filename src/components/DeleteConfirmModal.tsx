import React, { useState } from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { Student } from '../types/student';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (id: number) => Promise<void>;
  student: Student | null;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  student,
}) => {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !student) return null;

  const handleDelete = async () => {
    try {
      setDeleting(true);
      setError(null);
      await onConfirm(student.id);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to delete student.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
        <div className="flex items-start justify-between">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
            <AlertTriangle className="h-6 w-6 stroke-[2.2]" />
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4">
          <h3 className="text-lg font-bold text-slate-900">Confirm Deletion</h3>
          <p className="mt-2 text-xs text-slate-600 leading-relaxed">
            Are you sure you want to delete student record{' '}
            <span className="font-semibold text-slate-900">
              #{student.id} — {student.name}
            </span>
            ? This action permanently removes their records from the backend persistent JSON storage.
          </p>

          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs">
            <div className="flex justify-between text-slate-600 py-0.5">
              <span>Overall Score:</span>
              <span className="font-mono font-bold text-slate-800">
                {student.total} / 500 ({student.percentage}%)
              </span>
            </div>
            <div className="flex justify-between text-slate-600 py-0.5">
              <span>Grade Assigned:</span>
              <span className="font-bold text-slate-800">{student.grade}</span>
            </div>
          </div>

          {error && (
            <p className="mt-3 text-xs text-rose-600 bg-rose-50 p-2 rounded-lg border border-rose-200">
              {error}
            </p>
          )}
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            disabled={deleting}
            className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-rose-700 disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" />
            <span>{deleting ? 'Deleting from C++...' : 'Delete Student'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

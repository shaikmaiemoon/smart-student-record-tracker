import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Sidebar, TabId } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './views/DashboardView';
import { StudentsView } from './views/StudentsView';
import { RankingsView } from './views/RankingsView';
import { AnalysisView } from './views/AnalysisView';
import { StudentModal } from './components/StudentModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { ImprovementReportModal } from './components/ImprovementReportModal';
import {
  apiService,
  HealthCheckResult,
} from './services/api';
import {
  Student,
  DashboardStats,
  ImprovementReport,
  StudentFormData,
} from './types/student';
import { CheckCircle2, AlertTriangle, X } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<TabId>('dashboard');
  const [mobileOpen, setMobileOpen] = useState(false);

  // Data states
  const [students, setStudents] = useState<Student[]>([]);
  const [rankings, setRankings] = useState<Student[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [health, setHealth] = useState<HealthCheckResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const existingIds = useMemo(() => students.map((s) => s.id), [students]);

  // Modals
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [studentToEdit, setStudentToEdit] = useState<Student | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);

  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [activeReport, setActiveReport] = useState<ImprovementReport | null>(null);
  const [reportLoading, setReportLoading] = useState(false);

  // Toast notifications
  const [toast, setToast] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 4000);
  };

  // Health check
  const checkHealth = useCallback(async () => {
    const res = await apiService.checkHealth();
    setHealth(res);
    return res.healthy;
  }, []);

  // Fetch all data from C++ backend
  const loadData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setIsRefreshing(true);
    else setLoading(true);

    try {
      const [healthRes, studentsRes, rankingsRes, statsRes] = await Promise.allSettled([
        apiService.checkHealth(),
        apiService.getStudents(),
        apiService.getRankings(),
        apiService.getStats(),
      ]);

      if (healthRes.status === 'fulfilled') {
        setHealth(healthRes.value);
      }

      if (studentsRes.status === 'fulfilled') {
        setStudents(studentsRes.value);
      } else {
        console.error('Failed to load students:', studentsRes.reason);
      }

      if (rankingsRes.status === 'fulfilled') {
        setRankings(rankingsRes.value);
      }

      if (statsRes.status === 'fulfilled') {
        setStats(statsRes.value);
      }

      if (isRefresh) {
        showToast('Data synchronized with C++ backend', 'success');
      }
    } catch (err: any) {
      console.error('Error fetching data:', err);
      showToast(err.message || 'Error communicating with C++ backend', 'error');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadData();
    // Periodic heartbeat every 15 seconds
    const interval = setInterval(() => {
      checkHealth();
    }, 15000);
    return () => clearInterval(interval);
  }, [loadData, checkHealth]);

  // Handle Add / Edit Student Submit
  const handleStudentSubmit = async (formData: StudentFormData) => {
    if (studentToEdit) {
      await apiService.updateStudent(formData.id, {
        name: formData.name,
        marks: formData.marks,
      });
      showToast(`Student #${formData.id} marks updated successfully in C++ database.`);
    } else {
      await apiService.createStudent(formData);
      showToast(`Student #${formData.id} (${formData.name}) added successfully.`);
    }
    await loadData();
  };

  // Handle Delete Confirm
  const handleDeleteConfirm = async (id: number) => {
    await apiService.deleteStudent(id);
    showToast(`Student #${id} record permanently removed from C++ database.`);
    await loadData();
  };

  // Handle View Improvement Report
  const handleViewReport = async (student: Student) => {
    setIsReportModalOpen(true);
    setReportLoading(true);
    try {
      const report = await apiService.getImprovementReport(student.id);
      setActiveReport(report);
    } catch (err: any) {
      showToast(err.message || 'Failed to generate improvement report', 'error');
      setIsReportModalOpen(false);
    } finally {
      setReportLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 font-sans antialiased">
      {/* Toast Notification Container */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl transition-all animate-in fade-in slide-in-from-bottom-3">
          {toast.type === 'success' ? (
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
              <AlertTriangle className="h-5 w-5" />
            </div>
          )}
          <div>
            <div className="text-xs font-bold text-slate-900">
              {toast.type === 'success' ? 'C++ Backend Success' : 'Error Notice'}
            </div>
            <div className="text-xs text-slate-600">{toast.message}</div>
          </div>
          <button
            onClick={() => setToast(null)}
            className="ml-2 rounded-lg p-1 text-slate-400 hover:text-slate-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Navy Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Sticky Header */}
        <Header
          currentTab={currentTab}
          onOpenMobile={() => setMobileOpen(true)}
          onOpenAddModal={() => {
            setStudentToEdit(null);
            setIsStudentModalOpen(true);
          }}
          onRefresh={() => loadData(true)}
          isRefreshing={isRefreshing}
        />

        {/* Tab Content */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full">
          {currentTab === 'dashboard' && (
            <DashboardView
              students={students}
              stats={stats}
              loading={loading}
              onOpenAddModal={() => {
                setStudentToEdit(null);
                setIsStudentModalOpen(true);
              }}
              onOpenEditModal={(s) => {
                setStudentToEdit(s);
                setIsStudentModalOpen(true);
              }}
              onOpenDeleteModal={(s) => setStudentToDelete(s)}
              onViewReport={handleViewReport}
              onNavigateTab={setCurrentTab}
            />
          )}

          {currentTab === 'students' && (
            <StudentsView
              students={students}
              loading={loading}
              onOpenAddModal={() => {
                setStudentToEdit(null);
                setIsStudentModalOpen(true);
              }}
              onOpenEditModal={(s) => {
                setStudentToEdit(s);
                setIsStudentModalOpen(true);
              }}
              onOpenDeleteModal={(s) => setStudentToDelete(s)}
              onViewReport={handleViewReport}
            />
          )}

          {currentTab === 'rankings' && (
            <RankingsView
              rankings={rankings}
              loading={loading}
              onViewReport={handleViewReport}
              onOpenEditModal={(s) => {
                setStudentToEdit(s);
                setIsStudentModalOpen(true);
              }}
            />
          )}

          {currentTab === 'analysis' && (
            <AnalysisView
              students={students}
              stats={stats}
              onViewReport={handleViewReport}
            />
          )}
        </main>
      </div>

      {/* Student Add / Edit Modal */}
      <StudentModal
        isOpen={isStudentModalOpen}
        onClose={() => {
          setIsStudentModalOpen(false);
          setStudentToEdit(null);
        }}
        onSubmit={handleStudentSubmit}
        studentToEdit={studentToEdit}
        existingIds={existingIds}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!studentToDelete}
        onClose={() => setStudentToDelete(null)}
        onConfirm={handleDeleteConfirm}
        student={studentToDelete}
      />

      {/* Subject Improvement Report Modal */}
      <ImprovementReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        report={activeReport}
        loading={reportLoading}
      />
    </div>
  );
}

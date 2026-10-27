import React, { useState } from 'react';
import {
  X,
  Cpu,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  Save,
  Server,
  Layers,
  FileCode,
  HardDrive,
} from 'lucide-react';
import {
  HealthCheckResult,
  getApiBaseUrl,
  setApiBaseUrl,
  resetApiBaseUrl,
} from '../services/api';

interface BackendStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  health: HealthCheckResult | null;
  onRefreshHealth: () => void;
}

export const BackendStatusModal: React.FC<BackendStatusModalProps> = ({
  isOpen,
  onClose,
  health,
  onRefreshHealth,
}) => {
  const [baseUrlInput, setBaseUrlInput] = useState<string>(getApiBaseUrl());
  const [activeTest, setActiveTest] = useState<string>('');
  const [testResult, setTestResult] = useState<string | null>(null);
  const [testing, setTesting] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSaveUrl = () => {
    setApiBaseUrl(baseUrlInput.trim() || '/api');
    setSaveMsg('API Base URL updated! Triggering health verification...');
    onRefreshHealth();
    setTimeout(() => setSaveMsg(null), 3000);
  };

  const handleResetUrl = () => {
    resetApiBaseUrl();
    setBaseUrlInput('/api');
    setSaveMsg('Reset to default /api proxy');
    onRefreshHealth();
    setTimeout(() => setSaveMsg(null), 3000);
  };

  const runEndpointTest = async (endpoint: string) => {
    try {
      setTesting(true);
      setActiveTest(endpoint);
      setTestResult(null);

      const base = getApiBaseUrl();
      const url = `${base}${endpoint}`;
      const res = await fetch(url);
      const data = await res.json();
      setTestResult(JSON.stringify(data, null, 2));
    } catch (err: any) {
      setTestResult(`Error calling ${endpoint}:\n${err.message}`);
    } finally {
      setTesting(false);
    }
  };

  const isHealthy = health?.healthy ?? false;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-[#0B132B] text-white px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600/30 border border-blue-400/40 text-blue-300">
              <Cpu className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">C++17 REST Backend Engine</h2>
                <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-400/30">
                  Native Process
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Authoritative source of business logic, validations, and JSON storage
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Health Status Banner */}
          <div
            className={`rounded-xl border p-4 ${
              isHealthy
                ? 'border-emerald-200 bg-emerald-50/70 text-emerald-900'
                : 'border-rose-200 bg-rose-50/70 text-rose-900'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {isHealthy ? (
                  <CheckCircle2 className="h-6 w-6 text-emerald-600 shrink-0" />
                ) : (
                  <AlertTriangle className="h-6 w-6 text-rose-600 shrink-0" />
                )}
                <div>
                  <h4 className="font-bold text-sm">
                    {isHealthy
                      ? 'Authoritative C++ Backend Online & Responsive'
                      : 'Backend Connection Offline'}
                  </h4>
                  <p className="text-xs text-slate-600 mt-0.5">
                    {isHealthy
                      ? `HTTP latency: ${health?.latencyMs} ms · Uptime: ${health?.data?.uptimeSeconds ?? 0}s · Active Records: ${health?.data?.activeStudents ?? 0}`
                      : health?.error || 'Unable to establish HTTP handshake with port 5000.'}
                  </p>
                </div>
              </div>
              <button
                onClick={onRefreshHealth}
                className="rounded-lg border border-slate-300 bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50"
              >
                Re-check
              </button>
            </div>
          </div>

          {/* Configurable API Base URL section */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5">
              <Server className="h-4 w-4 text-indigo-600" />
              Configurable API Base URL
            </h4>
            <p className="text-xs text-slate-500 mb-3">
              Configure the endpoint used by the React client. Default is{' '}
              <code className="rounded bg-slate-200 px-1 py-0.5 text-slate-800 font-mono text-[11px]">
                /api
              </code>{' '}
              which proxies directly to the compiled C++ daemon listening on port 5000.
            </p>

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={baseUrlInput}
                onChange={(e) => setBaseUrlInput(e.target.value)}
                placeholder="/api or http://127.0.0.1:5000/api"
                className="flex-1 rounded-xl border border-slate-300 px-3 py-2 text-xs font-mono outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 bg-white"
              />
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSaveUrl}
                  className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700"
                >
                  <Save className="h-3.5 w-3.5" />
                  <span>Save URL</span>
                </button>
                <button
                  onClick={handleResetUrl}
                  className="flex items-center gap-1 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  title="Reset to default /api"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Reset</span>
                </button>
              </div>
            </div>

            {saveMsg && (
              <p className="mt-2 text-xs font-medium text-emerald-700">{saveMsg}</p>
            )}
          </div>

          {/* Architectural specs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-xl border border-slate-200 bg-white p-3.5">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                <FileCode className="h-4 w-4 text-blue-600" />
                C++ Architecture
              </div>
              <p className="mt-1.5 text-[11px] text-slate-500 leading-relaxed">
                Compiled with GCC 12 (-O2 -std=c++17) using CMake. Powered by{' '}
                <span className="font-semibold text-slate-700">cpp-httplib</span> &{' '}
                <span className="font-semibold text-slate-700">nlohmann/json</span>.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-3.5">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                <HardDrive className="h-4 w-4 text-purple-600" />
                JSON Persistence
              </div>
              <p className="mt-1.5 text-[11px] text-slate-500 leading-relaxed">
                Stores records persistently at <code className="text-slate-800 font-mono text-[10px]">backend/data/students.json</code>. Survives server restarts.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-3.5">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                <Layers className="h-4 w-4 text-emerald-600" />
                Thread Safety
              </div>
              <p className="mt-1.5 text-[11px] text-slate-500 leading-relaxed">
                Protected via RAII <code className="text-slate-800 font-mono text-[10px]">std::lock_guard</code> on shared state for concurrent HTTP safety.
              </p>
            </div>
          </div>

          {/* Interactive Endpoint Test Runner */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5">
              <Play className="h-4 w-4 text-indigo-600" />
              Live REST Endpoint Verification
            </h4>
            <div className="flex flex-wrap gap-2 mb-3">
              {[
                { label: 'GET /health', endpoint: '/health' },
                { label: 'GET /subjects', endpoint: '/subjects' },
                { label: 'GET /students', endpoint: '/students' },
                { label: 'GET /rankings', endpoint: '/rankings' },
                { label: 'GET /stats', endpoint: '/stats' },
              ].map((ep) => (
                <button
                  key={ep.endpoint}
                  onClick={() => runEndpointTest(ep.endpoint)}
                  disabled={testing}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-mono font-medium transition-all ${
                    activeTest === ep.endpoint
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-bold'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {ep.label}
                </button>
              ))}
            </div>

            {testResult && (
              <div className="relative rounded-xl border border-slate-800 bg-slate-900 p-4 text-slate-100 font-mono text-xs overflow-x-auto max-h-60">
                <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">
                  C++ Server Response for {activeTest}:
                </div>
                <pre>{testResult}</pre>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/80 px-6 py-4">
          <span className="text-[11px] text-slate-500 font-mono">
            Binary: backend/build/student_tracker_api
          </span>
          <button
            onClick={onClose}
            className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

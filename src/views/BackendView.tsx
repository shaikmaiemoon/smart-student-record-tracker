import React, { useState } from 'react';
import {
  Terminal,
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
  Copy,
  Check,
} from 'lucide-react';
import {
  HealthCheckResult,
  getApiBaseUrl,
  setApiBaseUrl,
  resetApiBaseUrl,
} from '../services/api';

interface BackendViewProps {
  health: HealthCheckResult | null;
  onRefreshHealth: () => void;
}

export const BackendView: React.FC<BackendViewProps> = ({
  health,
  onRefreshHealth,
}) => {
  const [baseUrlInput, setBaseUrlInput] = useState<string>(getApiBaseUrl());
  const [activeTest, setActiveTest] = useState<string>('/health');
  const [testResult, setTestResult] = useState<string | null>(null);
  const [testing, setTesting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const isHealthy = health?.healthy ?? false;

  const handleSaveUrl = () => {
    setApiBaseUrl(baseUrlInput.trim() || '/api');
    setStatusMsg('Saved API Base URL! Checking connection...');
    onRefreshHealth();
    setTimeout(() => setStatusMsg(null), 3000);
  };

  const handleResetUrl = () => {
    resetApiBaseUrl();
    setBaseUrlInput('/api');
    setStatusMsg('Reset to default /api proxy');
    onRefreshHealth();
    setTimeout(() => setStatusMsg(null), 3000);
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
      setTestResult(`Error communicating with ${endpoint}:\n${err.message}`);
    } finally {
      setTesting(false);
    }
  };

  const handleCopyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8">
      {/* C++ Status Card */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0B132B] text-blue-400 shadow-md">
              <Cpu className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900">
                  C++17 Authoritative Backend Engine
                </h2>
                <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-bold text-blue-800">
                  Native Linux Binary
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Full-stack architecture: React frontend communicates with compiled C++ HTTP server
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div
              className={`flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-bold ${
                isHealthy
                  ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                  : 'border-rose-300 bg-rose-50 text-rose-800'
              }`}
            >
              {isHealthy ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>ONLINE (Port 5000)</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="h-4 w-4 text-rose-600" />
                  <span>OFFLINE</span>
                </>
              )}
            </div>

            <button
              onClick={onRefreshHealth}
              className="rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs"
            >
              Ping Server
            </button>
          </div>
        </div>

        {/* Engine specs banner */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3.5">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Language Standard
            </div>
            <div className="mt-1 text-sm font-black text-slate-900 font-mono">ISO C++17</div>
            <div className="text-[10px] text-slate-500">GCC 12.3.0 (-O2)</div>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3.5">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              HTTP Framework
            </div>
            <div className="mt-1 text-sm font-black text-slate-900 font-mono">cpp-httplib</div>
            <div className="text-[10px] text-slate-500">Multi-threaded REST</div>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3.5">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              JSON Serialization
            </div>
            <div className="mt-1 text-sm font-black text-slate-900 font-mono">nlohmann/json</div>
            <div className="text-[10px] text-slate-500">v3.11.3 single-header</div>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3.5">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Storage Engine
            </div>
            <div className="mt-1 text-sm font-black text-slate-900 font-mono">Atomic JSON</div>
            <div className="text-[10px] text-slate-500">backend/data/students.json</div>
          </div>
        </div>
      </div>

      {/* Configurable API Base URL section */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 mb-2 flex items-center gap-2">
          <Server className="h-4 w-4 text-blue-600" />
          Configurable API Base URL (Requirement #5)
        </h3>
        <p className="text-xs text-slate-500 mb-4 max-w-3xl leading-relaxed">
          The React client communicates over HTTP REST API to the authoritative C++ backend. The API
          Base URL is configurable in runtime and saved in browser storage. By default, it uses{' '}
          <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-slate-800">/api</code>{' '}
          which proxies directly to the C++ server listening on port 5000.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={baseUrlInput}
            onChange={(e) => setBaseUrlInput(e.target.value)}
            placeholder="/api or http://127.0.0.1:5000/api"
            className="flex-1 rounded-xl border border-slate-300 px-3.5 py-2 text-xs font-mono outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 bg-slate-50/40"
          />
          <div className="flex items-center gap-2">
            <button
              onClick={handleSaveUrl}
              className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition-all"
            >
              <Save className="h-3.5 w-3.5" />
              <span>Update Base URL</span>
            </button>
            <button
              onClick={handleResetUrl}
              className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {statusMsg && (
          <p className="mt-3 text-xs font-semibold text-emerald-700">{statusMsg}</p>
        )}
      </div>

      {/* Live REST API Explorer */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Play className="h-4 w-4 text-indigo-600" />
              Interactive C++ REST API Explorer
            </h3>
            <p className="text-xs text-slate-500">
              Click any endpoint below to send an actual live HTTP GET request to the C++ daemon
            </p>
          </div>
          <span className="text-xs font-mono font-medium text-slate-400">
            Current: {getApiBaseUrl()}
          </span>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {[
            { label: 'GET /health', path: '/health', desc: 'Server health & uptime' },
            { label: 'GET /subjects', path: '/subjects', desc: 'Curriculum subjects list' },
            { label: 'GET /students', path: '/students', desc: 'All student records' },
            { label: 'GET /rankings', path: '/rankings', desc: 'Ranked leaderboard' },
            { label: 'GET /students/105/improvement-report', path: '/students/105/improvement-report', desc: 'Student #105 improvement report' },
            { label: 'GET /stats', path: '/stats', desc: 'Aggregate dashboard analytics' },
          ].map((ep) => (
            <button
              key={ep.path}
              onClick={() => runEndpointTest(ep.path)}
              disabled={testing}
              className={`rounded-xl border px-3.5 py-2 text-xs font-mono font-medium transition-all ${
                activeTest === ep.path
                  ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-bold shadow-2xs'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              {ep.label}
            </button>
          ))}
        </div>

        {/* Response Box */}
        <div className="relative rounded-2xl border border-slate-900 bg-[#0B132B] p-5 text-slate-200 font-mono text-xs shadow-inner">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3 text-[11px] text-slate-400">
            <span className="font-semibold text-blue-400">
              C++ HTTP Response for: {activeTest}
            </span>
            <button
              onClick={() => handleCopyCode(testResult || '')}
              className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-white"
            >
              {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
              <span>{copied ? 'Copied' : 'Copy JSON'}</span>
            </button>
          </div>

          <pre className="overflow-x-auto max-h-80 leading-relaxed text-[11px]">
            {testing
              ? 'Sending HTTP request to C++ backend on port 5000...'
              : testResult || 'Click an endpoint button above to test the C++ REST API'}
          </pre>
        </div>
      </div>

      {/* Backend Code & Build Reference */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 mb-3 flex items-center gap-2">
            <FileCode className="h-4 w-4 text-blue-600" />
            C++ Build & Run Commands
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Compile the backend using CMake and run the standalone native binary on Linux or macOS:
          </p>
          <pre className="rounded-xl border border-slate-800 bg-[#0B132B] p-4 text-xs font-mono text-slate-200 leading-relaxed overflow-x-auto">
{`# 1. Build backend using CMake
cd backend
mkdir -p build && cd build
cmake ..
cmake --build . -j$(nproc)

# 2. Run the C++ REST API server
./student_tracker_api 5000 backend/data/students.json`}
          </pre>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 mb-3 flex items-center gap-2">
            <Layers className="h-4 w-4 text-purple-600" />
            Core Academic Algorithms in C++
          </h3>
          <div className="space-y-2 text-xs text-slate-600 leading-relaxed">
            <p>
              • <span className="font-semibold text-slate-900">Total & Percentage:</span> Sum of 5
              subjects out of 500, percentage calculated as <code className="font-mono">total / 5.0</code>.
            </p>
            <p>
              • <span className="font-semibold text-slate-900">6-Tier Grading:</span> A+ (≥90), A (≥80),
              B (≥70), C (≥60), D (≥50), F (&lt;50).
            </p>
            <p>
              • <span className="font-semibold text-slate-900">Rankings:</span> Stably sorted descending
              by percentage; tie-broken by student name alphabetical ascending.
            </p>
            <p>
              • <span className="font-semibold text-slate-900">Weak Subject Detection:</span> Any
              subject mark below 60.0 triggers automatic shortfall calculation and tailored study
              recommendation.
            </p>
            <p>
              • <span className="font-semibold text-slate-900">JSON Persistence:</span> Loaded on
              startup and saved atomically upon every add, update, and delete operation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

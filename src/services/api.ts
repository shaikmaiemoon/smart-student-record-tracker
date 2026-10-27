import {
  Student,
  ImprovementReport,
  DashboardStats,
  BackendHealth,
  StudentFormData,
  SubjectName,
} from '../types/student';

// Configurable API base URL, defaults to '/api' (proxied directly to C++ server)
let currentApiBaseUrl: string =
  localStorage.getItem('tracker_api_base_url') || '/api';

export function getApiBaseUrl(): string {
  return currentApiBaseUrl;
}

export function setApiBaseUrl(newUrl: string): void {
  currentApiBaseUrl = newUrl.replace(/\/+$/, '');
  localStorage.setItem('tracker_api_base_url', currentApiBaseUrl);
}

export function resetApiBaseUrl(): void {
  currentApiBaseUrl = '/api';
  localStorage.removeItem('tracker_api_base_url');
}

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${currentApiBaseUrl}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
  
  const headers = new Headers(options?.headers);
  if (!headers.has('Content-Type') && options?.body) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMsg = `HTTP Error ${response.status}: ${response.statusText}`;
    try {
      const errorJson = await response.json();
      if (errorJson && errorJson.error) {
        errorMsg = errorJson.error;
      }
    } catch {
      // Failed to parse JSON error, use default
    }
    throw new Error(errorMsg);
  }

  return response.json();
}

export interface HealthCheckResult {
  healthy: boolean;
  data?: BackendHealth;
  latencyMs: number;
  error?: string;
}

export const apiService = {
  async checkHealth(): Promise<HealthCheckResult> {
    const start = performance.now();
    try {
      const data = await request<BackendHealth>('/health', {
        cache: 'no-store',
      });
      const latencyMs = Math.round(performance.now() - start);
      return {
        healthy: data.status === 'healthy' || data.status === 'ok',
        data,
        latencyMs,
      };
    } catch (err: any) {
      const latencyMs = Math.round(performance.now() - start);
      return {
        healthy: false,
        latencyMs,
        error: err.message || 'Cannot connect to C++ backend',
      };
    }
  },

  async getSubjects(): Promise<SubjectName[]> {
    return request<SubjectName[]>('/subjects');
  },

  async getStudents(searchQuery?: string): Promise<Student[]> {
    const endpoint = searchQuery?.trim()
      ? `/students?q=${encodeURIComponent(searchQuery.trim())}`
      : '/students';
    return request<Student[]>(endpoint);
  },

  async getStudentById(id: number): Promise<Student> {
    return request<Student>(`/students/${id}`);
  },

  async createStudent(payload: StudentFormData): Promise<{ success: boolean; message: string; student: Student }> {
    return request<{ success: boolean; message: string; student: Student }>('/students', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async updateStudent(
    id: number,
    payload: { name: string; marks: number[] }
  ): Promise<{ success: boolean; message: string; student: Student }> {
    return request<{ success: boolean; message: string; student: Student }>(`/students/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  async deleteStudent(id: number): Promise<{ success: boolean; message: string }> {
    return request<{ success: boolean; message: string }>(`/students/${id}`, {
      method: 'DELETE',
    });
  },

  async getRankings(): Promise<Student[]> {
    return request<Student[]>('/rankings');
  },

  async getImprovementReport(id: number): Promise<ImprovementReport> {
    return request<ImprovementReport>(`/students/${id}/improvement-report`);
  },

  async getStats(): Promise<DashboardStats> {
    return request<DashboardStats>('/stats');
  },
};

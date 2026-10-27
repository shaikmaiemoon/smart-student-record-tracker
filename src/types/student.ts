export type SubjectName =
  | 'C Programming'
  | 'C++'
  | 'Mathematics'
  | 'Computer Science'
  | 'English';

export const SUBJECT_LIST: SubjectName[] = [
  'C Programming',
  'C++',
  'Mathematics',
  'Computer Science',
  'English',
];

export interface Student {
  id: number;
  name: string;
  marks: [number, number, number, number, number];
  subjectMarks?: Record<SubjectName, number>;
  total: number;
  maxTotal: number;
  percentage: number;
  grade: 'S' | 'A' | 'B' | 'C' | 'D' | 'F';
  performanceRemark?: string;
  needsImprovement: boolean;
  weakSubjectsCount: number;
  rank?: number;
}

export interface WeakSubjectItem {
  subject: SubjectName;
  mark: number;
  maxMark: number;
  threshold: number;
  shortfall: number;
  recommendation: string;
}

export interface ProficientSubjectItem {
  subject: SubjectName;
  mark: number;
}

export interface ImprovementReport {
  studentId: number;
  studentName: string;
  totalMarks: number;
  percentage: number;
  grade: string;
  needsImprovement: boolean;
  weakSubjectsCount: number;
  weakSubjects: WeakSubjectItem[];
  proficientSubjects: ProficientSubjectItem[];
  summary: string;
}

export interface SubjectAverageInfo {
  subject: SubjectName;
  average: number;
  min: number;
  max: number;
  studentsBelow60: number;
}

export interface DashboardStats {
  totalStudents: number;
  averagePercentage: number;
  highestPercentage: number;
  lowestPercentage: number;
  needsImprovementCount: number;
  proficientCount: number;
  topPerformer?: {
    id: number;
    name: string;
    percentage: number;
  };
  gradeDistribution: Record<'S' | 'A' | 'B' | 'C' | 'D' | 'F', number>;
  subjectAverages: SubjectAverageInfo[];
}

export interface BackendHealth {
  status: string;
  engine: string;
  version: string;
  uptimeSeconds: number;
  authoritativeSource: string;
  activeStudents: number;
}

export interface StudentFormData {
  id: number;
  name: string;
  marks: [number, number, number, number, number];
}

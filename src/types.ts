export type ActiveTab = 'home' | 'associacao' | 'doacoes' | 'projetos' | 'galeria' | 'area_associado';

export interface GalleryPhoto {
  id: string;
  title: string;
  category: 'karate' | 'costura' | 'bordado' | 'pilates' | 'ingles' | 'eventos' | 'comunidade';
  categoryLabel: string;
  imageUrl: string;
  description: string;
  date: string;
  author: string;
  tags: string[];
}

export interface ClassTurma {
  id: string;
  name: string;
  course: 'karate' | 'english' | 'sewing' | 'pilates' | 'embroidery';
  courseName: string;
  schedule: string;
  maxCapacity: number;
  room?: string;
  teacherName?: string;
  description?: string;
}

export interface Student {
  id: string;
  name: string;
  matricula: string;
  turma: string; // e.g., "Turma A", "Turma B" or custom turma name
  turmaId?: string;
  age: number;
  course: 'karate' | 'english' | 'sewing' | 'pilates' | 'embroidery';
  status: 'active' | 'inactive';
  joinedAt: string;
  guardianName?: string;
  guardianPhone?: string;
  phone?: string;
  birthDate?: string;
  address?: string;
  notes?: string;
  attendanceCount: number;
  totalClasses: number;
}

export interface SchoolUser {
  id: string;
  email: string;
  password?: string;
  name: string;
  role: 'super_admin' | 'admin' | 'professor';
  title?: string;
  createdAt: string;
}

export interface Subject {
  id: string;
  name: string;
  description?: string;
  teacherId: string; // References SchoolUser.id
  turma: string; // References class group / student.turma
  createdAt: string;
}

export interface Lesson {
  id: string;
  subjectId: string; // References Subject.id
  date: string; // YYYY-MM-DD
  title: string;
  description?: string;
  presentStudentIds: string[]; // List of Student.id
}

export interface Assessment {
  id: string;
  subjectId: string; // References Subject.id
  title: string;
  type: 'prova' | 'trabalho' | 'atividade';
  weight: number;
  maxScore: number; // e.g., 10
  date?: string;
}

export interface Grade {
  id: string;
  studentId: string; // References Student.id
  assessmentId: string; // References Assessment.id
  score: number;
}

export interface Associate {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'Doador Regular' | 'Voluntário' | 'Apoiador';
  contributionType?: 'mensal' | 'anual' | 'ocasional';
  joinedAt: string;
}

export interface Donation {
  id: string;
  donorName: string;
  amount?: number;
  type?: 'pix' | 'clothing' | 'food' | 'other';
  description?: string;
  date: string;
  approved?: boolean;
}

export interface Workshop {
  id: 'karate' | 'english' | 'sewing' | 'pilates' | 'embroidery' | string;
  title: string;
  subTitle: string;
  description: string;
  longDesc: string;
  color: string;
  accentBg: string;
  timetable: string;
  targetPublic: string;
  requirements: string;
  cost: string;
  items: string[];
  stats?: { students: number; volunteers: number; limit: number };
  imageUrl?: string;
  updatedAt?: string;
  updatedBy?: string;
}

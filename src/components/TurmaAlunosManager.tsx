import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, UserPlus, Search, Filter, Edit3, Trash2, Eye, 
  GraduationCap, AlertCircle, CheckCircle2, ShieldAlert, 
  Phone, MessageCircle, MapPin, Calendar, Clock, BookOpen, 
  Award, ChevronRight, X, Copy, Check, Info, Sparkles, 
  SlidersHorizontal, RefreshCw, ArrowRightLeft, Plus, Settings2,
  CheckCircle, AlertTriangle, UserCheck, UserX, FileText
} from 'lucide-react';
import { Student, ClassTurma, SchoolUser, Grade, Assessment, Subject } from '../types';
import { useModal } from './ModalContext';
import AnimatedCounter from './AnimatedCounter';

// Default initial turmas with specific schedules, capacity limits, and instructors
export const defaultTurmasList: ClassTurma[] = [
  {
    id: 'turma_karate_mat',
    name: 'Karatê – Turma A (Matutino)',
    course: 'karate',
    courseName: '🥋 Karatê Shotokan',
    schedule: 'Terças e Quintas • 08h30 às 10h00',
    maxCapacity: 20,
    room: 'Dojô Comunitário Principal',
    teacherName: 'Sensei Marcelo Rodrigues',
    description: 'Aulas de karatê focadas em disciplina, katas e flexibilidade motora para crianças e adolescentes.'
  },
  {
    id: 'turma_karate_vesp',
    name: 'Karatê – Turma B (Vespertino)',
    course: 'karate',
    courseName: '🥋 Karatê Shotokan',
    schedule: 'Terças e Quintas • 18h30 às 20h00',
    maxCapacity: 25,
    room: 'Dojô Comunitário Principal',
    teacherName: 'Sensei Marcelo Rodrigues',
    description: 'Turma de artes marciais com ênfase em autoconfiança, cidadania e preparação esportiva.'
  },
  {
    id: 'turma_english_a',
    name: 'Inglês – Turma A (Iniciante)',
    course: 'english',
    courseName: 'Inglês Instrumental & Conversação',
    schedule: 'Quartas e Sábados • 14h00 às 15h30',
    maxCapacity: 20,
    room: 'Sala Multimídia 01',
    teacherName: 'Prof. Marcelo Rodrigues',
    description: 'Introdução ao idioma inglês com vocabulário prático, música e conversação cotidiana.'
  },
  {
    id: 'turma_english_b',
    name: 'Inglês – Turma B (Intermediário)',
    course: 'english',
    courseName: 'Inglês Instrumental & Conversação',
    schedule: 'Quartas e Sábados • 16h00 às 17h30',
    maxCapacity: 20,
    room: 'Sala Multimídia 01',
    teacherName: 'Prof. Marcelo Rodrigues',
    description: 'Aprofundamento gramatical e simulações de entrevistas e diálogos profissionais.'
  },
  {
    id: 'turma_sewing_a',
    name: 'Costura & Modelagem – Turma A',
    course: 'sewing',
    courseName: '🧵 Corte, Costura e Modelagem',
    schedule: 'Segundas e Sextas • 14h00 às 16h30',
    maxCapacity: 15,
    room: 'Ateliê Solidário de Costura',
    teacherName: 'Profa. Carla Antunes',
    description: 'Formação prática para confecção de roupas, peças artesanais e fomento de renda própria.'
  },
  {
    id: 'turma_pilates_a',
    name: 'Pilates & Bem-Estar – Turma Única',
    course: 'pilates',
    courseName: '🧘 Pilates & Saúde Integral',
    schedule: 'Sextas-feiras • 09h00 às 10h00',
    maxCapacity: 20,
    room: 'Salão de Convivência',
    teacherName: 'Instrutora Convidada',
    description: 'Exercícios posturais de solo (Mat Pilates), alívio de dores articulares e respiração preventiva.'
  },
  {
    id: 'turma_embroidery_a',
    name: 'Bordado Livre – Turma A',
    course: 'embroidery',
    courseName: '🪡 Bordado Livre & Arteterapia',
    schedule: 'Terças-feiras • 13h00 às 16h00',
    maxCapacity: 15,
    room: 'Sala de Artes Manuais',
    teacherName: 'Profa. Carla Antunes',
    description: 'Pontos tradicionais, acabamento fino e socialização artística com materiais gratuitos.'
  }
];

interface TurmaAlunosManagerProps {
  isMaster: boolean;
  isAdmin?: boolean;
  studentsList: Student[];
  onAddStudent: (student: Student) => Promise<void> | void;
  onUpdateStudent: (student: Student) => Promise<void> | void;
  onDeleteStudent: (id: string) => Promise<void> | void;
  schoolUsers?: SchoolUser[];
  grades?: Grade[];
  assessments?: Assessment[];
  subjects?: Subject[];
}

export default function TurmaAlunosManager({
  isMaster,
  isAdmin = false,
  studentsList,
  onAddStudent,
  onUpdateStudent,
  onDeleteStudent,
  schoolUsers = [],
  grades = [],
  assessments = [],
  subjects = []
}: TurmaAlunosManagerProps) {
  const { alert, confirm } = useModal();

  // Turmas list state (persisted locally with fallback)
  const [turmas, setTurmas] = useState<ClassTurma[]>(() => {
    try {
      const saved = localStorage.getItem('sge_turmas_config');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return defaultTurmasList;
  });

  const saveTurmas = (updatedList: ClassTurma[]) => {
    setTurmas(updatedList);
    try {
      localStorage.setItem('sge_turmas_config', JSON.stringify(updatedList));
    } catch {}
  };

  // Active filters and views
  const [selectedTurmaId, setSelectedTurmaId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [courseFilter, setCourseFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [viewingStudent, setViewingStudent] = useState<Student | null>(null);
  const [isCapacityModalOpen, setIsCapacityModalOpen] = useState(false);
  const [editingTurma, setEditingTurma] = useState<ClassTurma | null>(null);
  const [newCapacityValue, setNewCapacityValue] = useState<number>(20);

  // Form State
  const [formState, setFormState] = useState({
    name: '',
    matricula: '',
    turmaId: defaultTurmasList[0].id,
    age: '',
    birthDate: '',
    status: 'active' as 'active' | 'inactive',
    guardianName: '',
    guardianPhone: '',
    phone: '',
    address: '',
    notes: '',
    attendanceCount: 0,
    totalClasses: 12
  });

  // Calculate statistics per Turma
  const turmaStatsMap = useMemo(() => {
    const map = new Map<string, { occupied: number; active: number; inactive: number; available: number; isFull: boolean; percent: number }>();

    turmas.forEach(turma => {
      // Find students belonging to this turma by turmaId or normalized name
      const turmaStudents = studentsList.filter(s => {
        if (s.turmaId) {
          return s.turmaId === turma.id;
        }
        return s.turma === turma.name || s.turma === turma.id || (turma.id === 'turma_karate_mat' && s.turma === 'Turma A' && s.course === 'karate');
      });

      const activeCount = turmaStudents.filter(s => s.status === 'active').length;
      const inactiveCount = turmaStudents.filter(s => s.status === 'inactive').length;
      // In NGO rules, active enrolled students take up official spots
      const occupied = activeCount;
      const available = Math.max(0, turma.maxCapacity - occupied);
      const isFull = occupied >= turma.maxCapacity;
      const percent = turma.maxCapacity > 0 ? Math.min(100, Math.round((occupied / turma.maxCapacity) * 100)) : 0;

      map.set(turma.id, {
        occupied,
        active: activeCount,
        inactive: inactiveCount,
        available,
        isFull,
        percent
      });
    });

    return map;
  }, [turmas, studentsList]);

  // Overall metrics
  const totalCapacity = useMemo(() => turmas.reduce((acc, t) => acc + t.maxCapacity, 0), [turmas]);
  const totalEnrolled = useMemo(() => studentsList.filter(s => s.status === 'active').length, [studentsList]);
  const totalAvailable = Math.max(0, totalCapacity - totalEnrolled);
  const overallOccupancyPercent = totalCapacity > 0 ? Math.round((totalEnrolled / totalCapacity) * 100) : 0;

  // Helper to get matching turma object for a student
  const getStudentTurma = (student: Student): ClassTurma | undefined => {
    if (student.turmaId) {
      const found = turmas.find(t => t.id === student.turmaId);
      if (found) return found;
    }
    return turmas.find(t => t.name === student.turma || t.id === student.turma) || turmas.find(t => t.course === student.course);
  };

  // Filtered Students List
  const filteredStudents = useMemo(() => {
    return studentsList.filter(student => {
      // 1. Turma filter
      if (selectedTurmaId !== 'all') {
        const studentTurma = getStudentTurma(student);
        if (studentTurma?.id !== selectedTurmaId && student.turmaId !== selectedTurmaId && student.turma !== selectedTurmaId) {
          return false;
        }
      }

      // 2. Course filter
      if (courseFilter !== 'all' && student.course !== courseFilter) {
        return false;
      }

      // 3. Status filter
      if (statusFilter !== 'all' && student.status !== statusFilter) {
        return false;
      }

      // 4. Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = student.name.toLowerCase().includes(query);
        const matchesMatricula = student.matricula.toLowerCase().includes(query);
        const matchesGuardian = (student.guardianName || '').toLowerCase().includes(query);
        const matchesPhone = (student.phone || '').includes(query) || (student.guardianPhone || '').includes(query);
        const matchesTurmaName = (student.turma || '').toLowerCase().includes(query);

        return matchesName || matchesMatricula || matchesGuardian || matchesPhone || matchesTurmaName;
      }

      return true;
    });
  }, [studentsList, selectedTurmaId, courseFilter, statusFilter, searchQuery, turmas]);

  // Generate random matricula code
  const generateMatricula = () => {
    const currentYear = new Date().getFullYear();
    const randomNum = Math.floor(100 + Math.random() * 900);
    return `MAT-${currentYear}-${randomNum}`;
  };

  // Open Form to add new student
  const handleOpenAddForm = (preselectedTurmaId?: string) => {
    const targetTurmaId = preselectedTurmaId || (selectedTurmaId !== 'all' ? selectedTurmaId : turmas[0]?.id || 'turma_karate_mat');
    const selectedTurma = turmas.find(t => t.id === targetTurmaId) || turmas[0];

    // Check if target turma has available spots
    const stats = turmaStatsMap.get(targetTurmaId);
    if (stats?.isFull) {
      alert(
        `A turma "${selectedTurma.name}" está totalmente LOTADA (${stats.occupied}/${selectedTurma.maxCapacity} vagas ocupadas). Selecione outra turma ou aumente a capacidade de vagas antes de prosseguir.`,
        'Turma Sem Vagas',
        'warn'
      );
    }

    setEditingStudent(null);
    setFormState({
      name: '',
      matricula: generateMatricula(),
      turmaId: targetTurmaId,
      age: '',
      birthDate: '',
      status: 'active',
      guardianName: '',
      guardianPhone: '',
      phone: '',
      address: '',
      notes: '',
      attendanceCount: 0,
      totalClasses: 12
    });
    setIsFormModalOpen(true);
  };

  // Open Form to edit student
  const handleOpenEditForm = (student: Student) => {
    const studentTurma = getStudentTurma(student);
    setEditingStudent(student);
    setFormState({
      name: student.name,
      matricula: student.matricula,
      turmaId: studentTurma?.id || turmas[0]?.id || '',
      age: student.age.toString(),
      birthDate: student.birthDate || '',
      status: student.status,
      guardianName: student.guardianName || '',
      guardianPhone: student.guardianPhone || '',
      phone: student.phone || '',
      address: student.address || '',
      notes: student.notes || '',
      attendanceCount: student.attendanceCount || 0,
      totalClasses: student.totalClasses || 12
    });
    setIsFormModalOpen(true);
  };

  // Handle Form Submit with Strict Capacity Validation
  const handleSaveStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formState.name.trim()) {
      await alert('Por favor, informe o nome completo do aluno.', 'Nome Obrigatório', 'warn');
      return;
    }

    if (!formState.matricula.trim()) {
      await alert('Por favor, informe o número da matrícula escolar.', 'Matrícula Obrigatória', 'warn');
      return;
    }

    const targetTurma = turmas.find(t => t.id === formState.turmaId);
    if (!targetTurma) {
      await alert('Por favor, selecione uma turma válida.', 'Turma Inválida', 'warn');
      return;
    }

    const targetStats = turmaStatsMap.get(targetTurma.id);

    // CAPACITY LIMIT VALIDATION:
    // Only active students count towards capacity.
    // If it's a new student AND active, check if target turma is already full.
    // If editing and changing turma to a full turma, block the transfer.
    const isNew = !editingStudent;
    const isChangingToThisTurma = editingStudent && (editingStudent.turmaId !== targetTurma.id && editingStudent.turma !== targetTurma.name);

    if (formState.status === 'active') {
      if (isNew && targetStats && targetStats.occupied >= targetTurma.maxCapacity) {
        await alert(
          `Não é possível cadastrar o aluno! A turma "${targetTurma.name}" atingiu o limite máximo de ${targetTurma.maxCapacity} vagas ocupadas (${targetStats.occupied}/${targetTurma.maxCapacity}).`,
          'Limite de Vagas Atingido',
          'error'
        );
        return;
      }

      if (isChangingToThisTurma && targetStats && targetStats.occupied >= targetTurma.maxCapacity) {
        await alert(
          `Não é possível transferir o aluno para a turma "${targetTurma.name}" pois a mesma já atingiu seu limite máximo de ${targetTurma.maxCapacity} vagas.`,
          'Turma Destino Lotada',
          'error'
        );
        return;
      }
    }

    const ageNum = parseInt(formState.age) || 12;

    if (editingStudent) {
      // Update existing student
      const updated: Student = {
        ...editingStudent,
        name: formState.name.trim(),
        matricula: formState.matricula.trim(),
        turma: targetTurma.name,
        turmaId: targetTurma.id,
        course: targetTurma.course,
        age: ageNum,
        birthDate: formState.birthDate || undefined,
        status: formState.status,
        guardianName: formState.guardianName.trim() || undefined,
        guardianPhone: formState.guardianPhone.trim() || undefined,
        phone: formState.phone.trim() || undefined,
        address: formState.address.trim() || undefined,
        notes: formState.notes.trim() || undefined,
        attendanceCount: formState.attendanceCount,
        totalClasses: formState.totalClasses
      };

      await onUpdateStudent(updated);
      if (viewingStudent?.id === updated.id) {
        setViewingStudent(updated);
      }
      await alert(`Informações do aluno ${updated.name} atualizadas com sucesso!`, 'Aluno Atualizado', 'success');
    } else {
      // Create new student
      const newStudent: Student = {
        id: 'stud_' + Math.random().toString(36).substring(2, 11),
        name: formState.name.trim(),
        matricula: formState.matricula.trim(),
        turma: targetTurma.name,
        turmaId: targetTurma.id,
        course: targetTurma.course,
        age: ageNum,
        birthDate: formState.birthDate || undefined,
        status: formState.status,
        joinedAt: new Date().toLocaleDateString('pt-BR'),
        guardianName: formState.guardianName.trim() || undefined,
        guardianPhone: formState.guardianPhone.trim() || undefined,
        phone: formState.phone.trim() || undefined,
        address: formState.address.trim() || undefined,
        notes: formState.notes.trim() || undefined,
        attendanceCount: 0,
        totalClasses: 12
      };

      await onAddStudent(newStudent);
      await alert(`Aluno ${newStudent.name} cadastrado com sucesso na turma "${targetTurma.name}"!`, 'Cadastro Realizado', 'success');
    }

    setIsFormModalOpen(false);
  };

  // Handle Remove Student
  const handleDeleteStudent = async (student: Student) => {
    const isConfirmed = await confirm(
      `Deseja realmente remover o aluno "${student.name}" (Matrícula: ${student.matricula}) da turma "${student.turma}"? Esta ação liberará 1 vaga imediatamente no sistema.`,
      'Confirmar Remoção de Aluno',
      'warn'
    );

    if (isConfirmed) {
      await onDeleteStudent(student.id);
      if (viewingStudent?.id === student.id) {
        setViewingStudent(null);
      }
      await alert(`O aluno ${student.name} foi desvinculado com sucesso e a vaga foi liberada.`, 'Aluno Removido', 'success');
    }
  };

  // Edit Turma Capacity
  const handleOpenCapacityModal = (turma: ClassTurma) => {
    setEditingTurma(turma);
    setNewCapacityValue(turma.maxCapacity);
    setIsCapacityModalOpen(true);
  };

  const handleSaveCapacity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTurma) return;

    if (newCapacityValue < 1 || newCapacityValue > 200) {
      await alert('Por favor, informe uma capacidade entre 1 e 200 vagas.', 'Capacidade Inválida', 'warn');
      return;
    }

    const stats = turmaStatsMap.get(editingTurma.id);
    if (stats && newCapacityValue < stats.occupied) {
      const proceed = await confirm(
        `A nova capacidade (${newCapacityValue} vagas) é menor que o número atual de alunos ativos matriculados (${stats.occupied} alunos). A turma ficará com status de superlotação até que vagas sejam ajustadas. Deseja confirmar mesmo assim?`,
        'Atenção à Lotação',
        'warn'
      );
      if (!proceed) return;
    }

    const updatedTurmas = turmas.map(t => t.id === editingTurma.id ? { ...t, maxCapacity: newCapacityValue } : t);
    saveTurmas(updatedTurmas);
    setIsCapacityModalOpen(false);
    await alert(`Capacidade da turma "${editingTurma.name}" atualizada para ${newCapacityValue} vagas!`, 'Vagas Atualizadas', 'success');
  };

  const handleCopyMatricula = (matricula: string) => {
    navigator.clipboard.writeText(matricula);
    setCopiedId(matricula);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Helper for course color badge
  const getCourseBadge = (course: string) => {
    switch (course) {
      case 'karate':
        return { label: '🥋 Karatê', bg: 'bg-orange-50 text-orange-800 border-orange-200', gradient: 'from-orange-500 to-amber-600' };
      case 'english':
        return { label: 'Inglês', bg: 'bg-blue-50 text-blue-800 border-blue-200', gradient: 'from-blue-500 to-indigo-600' };
      case 'sewing':
        return { label: '🧵 Costura', bg: 'bg-purple-50 text-purple-800 border-purple-200', gradient: 'from-purple-500 to-pink-600' };
      case 'pilates':
        return { label: '🧘 Pilates', bg: 'bg-teal-50 text-teal-800 border-teal-200', gradient: 'from-teal-500 to-emerald-600' };
      case 'embroidery':
        return { label: '🪡 Bordados', bg: 'bg-rose-50 text-rose-800 border-rose-200', gradient: 'from-rose-500 to-pink-600' };
      default:
        return { label: 'Oficina Geral', bg: 'bg-emerald-50 text-emerald-800 border-emerald-200', gradient: 'from-emerald-600 to-teal-600' };
    }
  };

  // SECURITY GUARD: If user is neither Master nor Admin, prevent access
  if (!isMaster && !isAdmin) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-3xl p-8 text-center max-w-lg mx-auto my-8 shadow-sm space-y-4">
        <div className="w-14 h-14 bg-red-100 text-red-700 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
          <ShieldAlert className="h-7 w-7" />
        </div>
        <div className="space-y-1">
          <h3 className="font-sans font-black text-lg text-red-950">Acesso Restrito a Administradores</h3>
          <p className="text-xs text-red-800/80 leading-relaxed">
            A gestão e o cadastro de alunos nas turmas são restritos a <strong>Administradores</strong> e perfil <strong>Master</strong> da Casa Sandríssima.
          </p>
        </div>
      </div>
    );
  }

  const selectedTurmaObj = turmas.find(t => t.id === selectedTurmaId);
  const selectedTurmaStats = selectedTurmaId !== 'all' ? turmaStatsMap.get(selectedTurmaId) : null;

  return (
    <div className="space-y-6 text-left" id="sge-turmas-alunos-manager">
      
      {/* Top Banner Notice for Master/Admin */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-850 to-teal-900 text-white rounded-3xl p-6 shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1 ${
                isMaster 
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-400/30' 
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
              }`}>
                <Sparkles className="h-3 w-3 text-amber-300" />
                {isMaster ? 'Acesso Master (Total)' : 'Acesso Administrador (Operacional)'}
              </span>
              <span className="text-white/60 text-xs">•</span>
              <span className="text-white/80 text-xs font-mono">{turmas.length} Turmas Ativas</span>
            </div>
            <h2 className="font-sans font-black text-2xl tracking-tight text-white flex items-center gap-2">
              <GraduationCap className="h-7 w-7 text-emerald-300" />
              Cadastro de Alunos por Turma
            </h2>
            <p className="text-emerald-100/80 text-xs max-w-2xl leading-relaxed">
              Gerencie matrículas, acompanhe o limite de vagas disponíveis em tempo real, consulte fichas individuais e organize a ocupação das oficinas da ONG.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => handleOpenAddForm()}
              className="px-4 py-2.5 bg-emerald-400 hover:bg-emerald-300 text-emerald-950 font-black rounded-xl text-xs flex items-center gap-2 shadow-lg hover:shadow-emerald-400/20 transition-all cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <UserPlus className="h-4 w-4" /> Novo Aluno
            </button>
          </div>
        </div>

        {/* Global Key Metrics summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-white/10 text-xs">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 border border-white/10">
            <span className="text-[10px] uppercase font-mono text-emerald-200 block font-semibold">Total de Alunos Ativos</span>
            <span className="font-mono font-black text-xl text-white mt-0.5 block">
              <AnimatedCounter value={totalEnrolled} />
            </span>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 border border-white/10">
            <span className="text-[10px] uppercase font-mono text-emerald-200 block font-semibold">Capacidade Total</span>
            <span className="font-mono font-black text-xl text-white mt-0.5 block">
              <AnimatedCounter value={totalCapacity} suffix=" vagas" />
            </span>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 border border-white/10">
            <span className="text-[10px] uppercase font-mono text-emerald-200 block font-semibold">Vagas Disponíveis</span>
            <span className="font-mono font-black text-xl text-emerald-300 mt-0.5 block">
              <AnimatedCounter value={totalAvailable} suffix=" livres" />
            </span>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 border border-white/10">
            <span className="text-[10px] uppercase font-mono text-emerald-200 block font-semibold">Taxa de Ocupação</span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="font-mono font-black text-xl text-white">
                <AnimatedCounter value={overallOccupancyPercent} suffix="%" />
              </span>
              <div className="flex-1 bg-white/20 h-2 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full ${overallOccupancyPercent >= 90 ? 'bg-red-400' : overallOccupancyPercent >= 70 ? 'bg-amber-400' : 'bg-emerald-300'}`}
                  style={{ width: `${overallOccupancyPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Vagas por Turma - Horizontal Scroll Cards */}
      <div className="space-y-3">
        <div className="flex justify-between items-center px-1">
          <div>
            <h3 className="font-sans font-bold text-stone-900 text-sm flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-emerald-600" />
              Controle de Vagas e Lotação por Turma
            </h3>
            <p className="text-stone-500 text-xs">Clique em uma turma para filtrar a lista ou matricular diretamente.</p>
          </div>

          <button
            type="button"
            onClick={() => setSelectedTurmaId('all')}
            className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
              selectedTurmaId === 'all' 
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm' 
                : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
            }`}
          >
            Ver Todas ({studentsList.length} alunos)
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
          {turmas.map(turma => {
            const stats = turmaStatsMap.get(turma.id) || { occupied: 0, active: 0, inactive: 0, available: turma.maxCapacity, isFull: false, percent: 0 };
            const badge = getCourseBadge(turma.course);
            const isSelected = selectedTurmaId === turma.id;

            return (
              <div
                key={turma.id}
                onClick={() => setSelectedTurmaId(turma.id === selectedTurmaId ? 'all' : turma.id)}
                className={`bg-white rounded-2xl border p-4.5 transition-all cursor-pointer flex flex-col justify-between relative group ${
                  isSelected 
                    ? 'border-emerald-600 ring-2 ring-emerald-500/20 shadow-md bg-emerald-50/10' 
                    : 'border-stone-200 hover:border-emerald-400 hover:shadow-sm'
                }`}
              >
                {/* Header tag */}
                <div className="flex justify-between items-start gap-2 mb-2.5">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border ${badge.bg}`}>
                    {badge.label}
                  </span>
                  
                  {stats.isFull ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-800 border border-red-200 font-mono animate-pulse">
                      🔴 LOTADA
                    </span>
                  ) : stats.available <= 2 ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 font-mono">
                      🟡 {stats.available} {stats.available === 1 ? 'Última vaga' : 'Vagas restantes'}
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 font-mono">
                      🟢 {stats.available} vagas livres
                    </span>
                  )}
                </div>

                {/* Turma Title & Schedule */}
                <div className="space-y-1 mb-3">
                  <h4 className="font-sans font-black text-stone-900 text-sm leading-snug group-hover:text-emerald-700 transition-colors">
                    {turma.name}
                  </h4>
                  <p className="text-[11px] text-stone-500 flex items-center gap-1 font-medium">
                    <Clock className="h-3 w-3 text-stone-400 shrink-0" /> {turma.schedule}
                  </p>
                  {turma.teacherName && (
                    <p className="text-[10px] text-stone-400">
                      Docente: <strong>{turma.teacherName}</strong>
                    </p>
                  )}
                </div>

                {/* Occupancy Progress Bar */}
                <div className="space-y-1.5 pt-2 border-t border-stone-100">
                  <div className="flex justify-between text-[11px] font-mono">
                    <span className="text-stone-600 font-bold">
                      {stats.occupied} <span className="text-stone-400 font-normal">/ {turma.maxCapacity} matriculados</span>
                    </span>
                    <span className={`font-bold ${stats.percent >= 90 ? 'text-red-600' : stats.percent >= 70 ? 'text-amber-600' : 'text-emerald-700'}`}>
                      {stats.percent}%
                    </span>
                  </div>

                  <div className="w-full bg-stone-150 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        stats.isFull 
                          ? 'bg-red-500' 
                          : stats.percent >= 80 
                            ? 'bg-amber-500' 
                            : 'bg-emerald-500'
                      }`}
                      style={{ width: `${stats.percent}%` }}
                    />
                  </div>
                </div>

                {/* Action shortcut button */}
                <div className="flex justify-between items-center mt-3 pt-2 text-[11px]">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenCapacityModal(turma);
                    }}
                    className="text-stone-400 hover:text-stone-700 flex items-center gap-1 font-medium transition-colors"
                    title="Ajustar limite de vagas da turma"
                  >
                    <Settings2 className="h-3.5 w-3.5" /> Limite ({turma.maxCapacity})
                  </button>

                  <button
                    type="button"
                    disabled={stats.isFull}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenAddForm(turma.id);
                    }}
                    className={`font-bold flex items-center gap-1 transition-colors ${
                      stats.isFull 
                        ? 'text-stone-300 cursor-not-allowed' 
                        : 'text-emerald-700 hover:text-emerald-900 cursor-pointer font-bold'
                    }`}
                  >
                    {stats.isFull ? 'Sem Vagas' : '+ Matricular'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Filter and Search Bar */}
      <div className="bg-white p-4.5 rounded-2xl border border-stone-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-3 justify-between items-center">
          
          {/* Search field */}
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-stone-400" />
            <input
              type="text"
              placeholder="Buscar por nome, matrícula, responsável ou telefone..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
            />
            {searchQuery && (
              <button 
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-3 text-stone-400 hover:text-stone-600 cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Filters and View toggles */}
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
            
            {/* Turma filter dropdown */}
            <select
              value={selectedTurmaId}
              onChange={e => setSelectedTurmaId(e.target.value)}
              className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-sans font-medium focus:outline-none"
            >
              <option value="all">Todas as Turmas ({studentsList.length})</option>
              {turmas.map(t => {
                const s = turmaStatsMap.get(t.id);
                return (
                  <option key={t.id} value={t.id}>
                    {t.name} ({s?.occupied || 0}/{t.maxCapacity} vagas)
                  </option>
                );
              })}
            </select>

            {/* Status filter dropdown */}
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as any)}
              className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-sans font-medium focus:outline-none"
            >
              <option value="all">Todos os Status</option>
              <option value="active">🟢 Apenas Ativos</option>
              <option value="inactive">⚪ Apenas Inativos</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex border border-stone-200 rounded-xl overflow-hidden bg-stone-50 p-0.5">
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                  viewMode === 'cards' ? 'bg-white text-emerald-800 shadow-sm' : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                Cards
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                  viewMode === 'table' ? 'bg-white text-emerald-800 shadow-sm' : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                Tabela
              </button>
            </div>

            {/* Add student shortcut */}
            <button
              type="button"
              onClick={() => handleOpenAddForm()}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Plus className="h-4 w-4" /> Novo Aluno
            </button>
          </div>
        </div>

        {/* Filter status banner if filtered */}
        {(selectedTurmaId !== 'all' || statusFilter !== 'all' || searchQuery.trim()) && (
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-stone-150 text-xs text-stone-600">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-stone-800">Filtros ativos:</span>
              {selectedTurmaId !== 'all' && (
                <span className="bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-lg font-bold flex items-center gap-1">
                  Turma: {turmas.find(t => t.id === selectedTurmaId)?.name}
                  <button onClick={() => setSelectedTurmaId('all')} className="hover:text-emerald-700 cursor-pointer">×</button>
                </span>
              )}
              {statusFilter !== 'all' && (
                <span className="bg-stone-200 text-stone-800 px-2 py-0.5 rounded-lg font-bold flex items-center gap-1">
                  Status: {statusFilter === 'active' ? 'Ativos' : 'Inativos'}
                  <button onClick={() => setStatusFilter('all')} className="hover:text-stone-600 cursor-pointer">×</button>
                </span>
              )}
              {searchQuery && (
                <span className="bg-stone-200 text-stone-800 px-2 py-0.5 rounded-lg font-bold flex items-center gap-1">
                  Busca: "{searchQuery}"
                  <button onClick={() => setSearchQuery('')} className="hover:text-stone-600 cursor-pointer">×</button>
                </span>
              )}
            </div>

            <span className="font-mono text-stone-500 font-medium">
              Exibindo <strong>{filteredStudents.length}</strong> de <strong>{studentsList.length}</strong> educandos
            </span>
          </div>
        )}
      </div>

      {/* STUDENTS DISPLAY (CARDS VIEW) */}
      {viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" id="students-cards-grid">
          {filteredStudents.map(student => {
            const studentTurma = getStudentTurma(student);
            const badge = getCourseBadge(student.course);
            const attendancePct = student.totalClasses > 0 ? Math.round((student.attendanceCount / student.totalClasses) * 100) : 0;

            return (
              <div
                key={student.id}
                className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 relative group"
              >
                {/* Card Top: Avatar, Name, Matricula & Status */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${badge.gradient} text-white font-black text-base flex items-center justify-center shadow-sm shrink-0`}>
                      {student.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-sans font-black text-stone-900 text-sm leading-tight group-hover:text-emerald-700 transition-colors">
                        {student.name}
                      </h4>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <button
                          type="button"
                          onClick={() => handleCopyMatricula(student.matricula)}
                          className="font-mono text-[11px] font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-1.5 py-0.5 rounded flex items-center gap-1 transition-colors cursor-pointer"
                          title="Copiar matrícula"
                        >
                          {student.matricula}
                          {copiedId === student.matricula ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3 text-stone-400" />}
                        </button>
                        <span className="text-[10px] text-stone-400 font-medium">• {student.age} anos</span>
                      </div>
                    </div>
                  </div>

                  <span className={`text-[9px] font-bold font-mono uppercase px-2 py-0.5 rounded-full shrink-0 ${
                    student.status === 'active' 
                      ? 'bg-emerald-100 text-emerald-900 border border-emerald-200' 
                      : 'bg-stone-100 text-stone-600 border border-stone-200'
                  }`}>
                    {student.status === 'active' ? 'Ativo' : 'Inativo'}
                  </span>
                </div>

                {/* Turma & Course Tag */}
                <div className="bg-stone-50 rounded-xl p-3 border border-stone-150/80 space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] uppercase font-mono font-bold text-stone-400">Turma Vinculada</span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${badge.bg}`}>
                      {badge.label}
                    </span>
                  </div>
                  <p className="font-bold text-stone-800 text-xs truncate">
                    {studentTurma?.name || student.turma || 'Turma A'}
                  </p>
                  {studentTurma?.schedule && (
                    <p className="text-[10px] text-stone-500 flex items-center gap-1">
                      <Clock className="h-3 w-3 text-stone-400" /> {studentTurma.schedule}
                    </p>
                  )}
                </div>

                {/* Guardian & Contact info */}
                <div className="space-y-1.5 text-xs text-stone-600">
                  {student.guardianName && (
                    <div className="flex items-center gap-1.5 text-[11px]">
                      <span className="text-stone-400 text-[10px] uppercase font-mono font-semibold">Tutor:</span>
                      <span className="font-medium text-stone-800 truncate">{student.guardianName}</span>
                    </div>
                  )}

                  {(student.guardianPhone || student.phone) && (
                    <div className="flex items-center gap-2 text-[11px]">
                      <a
                        href={`https://wa.me/55${(student.guardianPhone || student.phone || '').replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-900 font-bold bg-emerald-50 px-2 py-0.5 rounded-lg text-[10px]"
                      >
                        <MessageCircle className="h-3 w-3" />
                        {student.guardianPhone || student.phone}
                      </a>
                    </div>
                  )}
                </div>

                {/* Attendance & Frequency progress */}
                <div className="pt-2 border-t border-stone-100 space-y-1">
                  <div className="flex justify-between text-[10px] font-mono text-stone-500">
                    <span>Frequência nas Aulas:</span>
                    <span className="font-bold text-stone-800">{student.attendanceCount}/{student.totalClasses} ({attendancePct}%)</span>
                  </div>
                  <div className="w-full bg-stone-150 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${attendancePct >= 75 ? 'bg-emerald-500' : attendancePct >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                      style={{ width: `${attendancePct}%` }}
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-xs">
                  <button
                    type="button"
                    onClick={() => setViewingStudent(student)}
                    className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Eye className="h-3.5 w-3.5" /> Ficha
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleOpenEditForm(student)}
                      className="p-2 text-emerald-700 hover:bg-emerald-50 rounded-xl transition-colors cursor-pointer"
                      title="Editar Aluno"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteStudent(student)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                      title="Remover Aluno (Liberar Vaga)"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* STUDENTS DISPLAY (TABLE VIEW) */
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden text-xs">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-stone-50 text-[10px] font-mono uppercase tracking-wider text-stone-500 border-b border-stone-200">
                  <th className="py-3 px-4 text-left">Aluno & Matrícula</th>
                  <th className="py-3 px-4 text-left">Turma & Horário</th>
                  <th className="py-3 px-4 text-left">Oficina</th>
                  <th className="py-3 px-4 text-left">Idade</th>
                  <th className="py-3 px-4 text-left">Responsável / Contato</th>
                  <th className="py-3 px-4 text-left">Frequência</th>
                  <th className="py-3 px-4 text-left">Status</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredStudents.map(student => {
                  const studentTurma = getStudentTurma(student);
                  const badge = getCourseBadge(student.course);
                  const attendancePct = student.totalClasses > 0 ? Math.round((student.attendanceCount / student.totalClasses) * 100) : 0;

                  return (
                    <tr key={student.id} className="hover:bg-emerald-50/20 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-stone-900 flex items-center gap-2">
                          <span>{student.name}</span>
                        </div>
                        <span className="font-mono text-[10px] text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded font-bold inline-block mt-0.5">
                          {student.matricula}
                        </span>
                      </td>
                      
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-stone-800 block">{studentTurma?.name || student.turma || 'Turma A'}</span>
                        <span className="text-[10px] text-stone-400 font-mono">{studentTurma?.schedule || 'Horário padrão'}</span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border ${badge.bg}`}>
                          {badge.label}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-medium text-stone-700">
                        {student.age} anos
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-medium text-stone-800 block truncate max-w-[140px]">
                          {student.guardianName || 'Próprio aluno'}
                        </span>
                        {(student.guardianPhone || student.phone) && (
                          <a
                            href={`https://wa.me/55${(student.guardianPhone || student.phone || '').replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[10px] text-emerald-700 hover:underline font-mono"
                          >
                            {student.guardianPhone || student.phone}
                          </a>
                        )}
                      </td>

                      <td className="py-3.5 px-4 font-mono text-[11px]">
                        <span className="font-bold text-stone-800">{student.attendanceCount}/{student.totalClasses}</span>
                        <span className="text-stone-400 pl-1">({attendancePct}%)</span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`text-[9px] font-bold uppercase font-mono px-2 py-0.5 rounded-full ${
                          student.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-100 text-stone-600'
                        }`}>
                          {student.status === 'active' ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => setViewingStudent(student)}
                            className="p-1.5 text-stone-600 hover:bg-stone-100 rounded-lg transition-colors"
                            title="Ver Ficha Completa"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEditForm(student)}
                            className="p-1.5 text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Editar Aluno"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteStudent(student)}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Remover Aluno"
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
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredStudents.length === 0 && (
        <div className="bg-white rounded-3xl border border-stone-200 p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-stone-100 text-stone-400 flex items-center justify-center mx-auto">
            <Users className="h-6 w-6" />
          </div>
          <h4 className="font-sans font-bold text-stone-800 text-sm">Nenhum aluno encontrado</h4>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            Não localizamos nenhum aluno com os filtros selecionados. Tente limpar os termos de busca ou cadastrar um novo aluno na turma.
          </p>
          <button
            type="button"
            onClick={() => handleOpenAddForm()}
            className="mt-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs inline-flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Plus className="h-4 w-4" /> Cadastrar Aluno Agora
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: FORMULÁRIO DE CADASTRO E EDIÇÃO DE ALUNO (COM TRAVA DE VAGAS)    */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isFormModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-8"
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white p-6 flex justify-between items-center">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase bg-emerald-400/20 text-emerald-300 px-2.5 py-0.5 rounded-full font-bold border border-emerald-400/30">
                    {editingStudent ? 'Atualização de Matrícula' : 'Nova Matrícula Escolar'}
                  </span>
                  <h3 className="font-sans font-black text-xl text-white flex items-center gap-2">
                    <GraduationCap className="h-6 w-6 text-emerald-300" />
                    {editingStudent ? `Editar: ${editingStudent.name}` : 'Cadastrar Aluno em Turma'}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Form Content */}
              <form onSubmit={handleSaveStudentSubmit} className="p-6 space-y-5 text-xs">
                
                {/* 1. SELEÇÃO DA TURMA E VERIFICAÇÃO DE VAGAS EM TEMPO REAL */}
                <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-2xl p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-[11px] font-bold font-mono text-emerald-950 uppercase flex items-center gap-1.5">
                      <BookOpen className="h-4 w-4 text-emerald-700" /> Turma de Destino & Capacidade
                    </label>
                    <span className="text-[10px] text-stone-500 font-medium">Controle de Vagas Ativo</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <select
                        required
                        value={formState.turmaId}
                        onChange={e => setFormState({ ...formState, turmaId: e.target.value })}
                        className="w-full h-11 px-3 bg-white border border-stone-200 rounded-xl font-sans font-bold text-xs focus:ring-2 focus:ring-emerald-500/20"
                      >
                        {turmas.map(t => {
                          const s = turmaStatsMap.get(t.id);
                          return (
                            <option key={t.id} value={t.id}>
                              {t.name} — {s?.occupied || 0}/{t.maxCapacity} vagas {s?.isFull ? '🔴 (LOTADA)' : `🟢 (${s?.available} livres)`}
                            </option>
                          );
                        })}
                      </select>
                    </div>

                    {/* Turma Realtime Vagas Box */}
                    {(() => {
                      const curTurma = turmas.find(t => t.id === formState.turmaId);
                      const curStats = curTurma ? turmaStatsMap.get(curTurma.id) : null;
                      const isFull = curStats?.isFull;

                      return (
                        <div className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
                          isFull 
                            ? 'bg-red-100/80 border-red-200 text-red-900' 
                            : 'bg-white border-emerald-200 text-emerald-900'
                        }`}>
                          <div className="space-y-0.5">
                            <span className="text-[10px] uppercase font-mono font-bold block">
                              {isFull ? 'Atenção: Turma Lotada' : 'Vagas Disponíveis'}
                            </span>
                            <span className="font-mono font-extrabold text-sm">
                              {curStats?.occupied} / {curTurma?.maxCapacity} vagas
                            </span>
                          </div>

                          <div className="text-right">
                            {isFull ? (
                              <span className="px-2 py-1 bg-red-600 text-white font-mono font-bold text-[10px] rounded-lg">
                                0 VAGAS
                              </span>
                            ) : (
                              <span className="px-2 py-1 bg-emerald-600 text-white font-mono font-bold text-[10px] rounded-lg">
                                {curStats?.available} RESTANTES
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Warning if the chosen turma is full */}
                  {(() => {
                    const curTurma = turmas.find(t => t.id === formState.turmaId);
                    const curStats = curTurma ? turmaStatsMap.get(curTurma.id) : null;
                    const isNew = !editingStudent;
                    const isChanging = editingStudent && (editingStudent.turmaId !== curTurma?.id && editingStudent.turma !== curTurma?.name);

                    if (formState.status === 'active' && curStats?.isFull && (isNew || isChanging)) {
                      return (
                        <div className="p-3 bg-red-100 border border-red-300 rounded-xl text-red-900 flex items-start gap-2 text-xs">
                          <AlertTriangle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                          <div>
                            <p className="font-bold">Limite de Vagas Atingido!</p>
                            <p className="text-[11px] text-red-800">
                              Esta turma já atingiu sua lotação máxima de {curTurma?.maxCapacity} alunos. Para matricular um aluno aqui, altere o status para "Inativo", libere uma vaga ou aumente a capacidade da turma nas configurações.
                            </p>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })()}
                </div>

                {/* 2. DADOS PRINCIPAIS DO ALUNO */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold font-mono text-stone-500 uppercase block">Nome Completo do Aluno *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Gabriel Siqueira Silva"
                      value={formState.name}
                      onChange={e => setFormState({ ...formState, name: e.target.value })}
                      className="w-full h-10 px-3 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-bold font-mono text-stone-500 uppercase block">Matrícula Escolar *</label>
                      <button
                        type="button"
                        onClick={() => setFormState({ ...formState, matricula: generateMatricula() })}
                        className="text-[10px] text-emerald-700 hover:underline flex items-center gap-1 font-mono"
                      >
                        <RefreshCw className="h-2.5 w-2.5" /> Gerar nova
                      </button>
                    </div>
                    <input
                      type="text"
                      required
                      placeholder="Ex: MAT-2026-118"
                      value={formState.matricula}
                      onChange={e => setFormState({ ...formState, matricula: e.target.value })}
                      className="w-full h-10 px-3 bg-stone-50 border border-stone-200 rounded-xl font-mono text-xs font-bold text-emerald-900"
                    />
                  </div>
                </div>

                {/* 3. IDADE, STATUS & DATA DE NASCIMENTO */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold font-mono text-stone-500 uppercase block">Idade (Anos) *</label>
                    <input
                      type="number"
                      required
                      min="3"
                      max="100"
                      placeholder="Ex: 12"
                      value={formState.age}
                      onChange={e => setFormState({ ...formState, age: e.target.value })}
                      className="w-full h-10 px-3 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold font-mono text-stone-500 uppercase block">Data de Nascimento</label>
                    <input
                      type="date"
                      value={formState.birthDate}
                      onChange={e => setFormState({ ...formState, birthDate: e.target.value })}
                      className="w-full h-10 px-3 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold font-mono text-stone-500 uppercase block">Status da Matrícula</label>
                    <select
                      value={formState.status}
                      onChange={e => setFormState({ ...formState, status: e.target.value as any })}
                      className="w-full h-10 px-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-sans font-bold"
                    >
                      <option value="active">🟢 Ativo (Ocupa Vaga)</option>
                      <option value="inactive">⚪ Inativo / Trancado</option>
                    </select>
                  </div>
                </div>

                {/* 4. RESPONSÁVEL LEGAL & CONTATOS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold font-mono text-stone-500 uppercase block">Nome do Responsável Legal (se menor)</label>
                    <input
                      type="text"
                      placeholder="Ex: Carla Siqueira (Mãe)"
                      value={formState.guardianName}
                      onChange={e => setFormState({ ...formState, guardianName: e.target.value })}
                      className="w-full h-10 px-3 bg-stone-50 border border-stone-200 rounded-xl text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold font-mono text-stone-500 uppercase block">WhatsApp / Telefone de Contato</label>
                    <input
                      type="text"
                      placeholder="Ex: (16) 99182-3344"
                      value={formState.guardianPhone}
                      onChange={e => setFormState({ ...formState, guardianPhone: e.target.value })}
                      className="w-full h-10 px-3 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono"
                    />
                  </div>
                </div>

                {/* 5. ENDEREÇO & OBSERVAÇÕES */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold font-mono text-stone-500 uppercase block">Endereço / Bairro (Franca/SP)</label>
                    <input
                      type="text"
                      placeholder="Ex: Rua das Palmeiras, 120 - Jd. Ipanema"
                      value={formState.address}
                      onChange={e => setFormState({ ...formState, address: e.target.value })}
                      className="w-full h-10 px-3 bg-stone-50 border border-stone-200 rounded-xl text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold font-mono text-stone-500 uppercase block">Observações Pedagógicas / Médicas</label>
                    <input
                      type="text"
                      placeholder="Ex: Alergias, autorizações especiais ou histórico"
                      value={formState.notes}
                      onChange={e => setFormState({ ...formState, notes: e.target.value })}
                      className="w-full h-10 px-3 bg-stone-50 border border-stone-200 rounded-xl text-xs"
                    />
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-150">
                  <button
                    type="button"
                    onClick={() => setIsFormModalOpen(false)}
                    className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl text-xs cursor-pointer transition-colors"
                  >
                    Cancelar
                  </button>

                  {(() => {
                    const curTurma = turmas.find(t => t.id === formState.turmaId);
                    const curStats = curTurma ? turmaStatsMap.get(curTurma.id) : null;
                    const isNew = !editingStudent;
                    const isChanging = editingStudent && (editingStudent.turmaId !== curTurma?.id && editingStudent.turma !== curTurma?.name);
                    const isBlocked = formState.status === 'active' && curStats?.isFull && (isNew || isChanging);

                    return (
                      <button
                        type="submit"
                        disabled={isBlocked}
                        className={`px-5 py-2.5 font-bold rounded-xl text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer ${
                          isBlocked 
                            ? 'bg-stone-300 text-stone-500 cursor-not-allowed' 
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        }`}
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        {isBlocked ? 'Turma Lotada (Sem Vagas)' : editingStudent ? 'Salvar Alterações' : 'Confirmar Matrícula'}
                      </button>
                    );
                  })()}
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* MODAL 2: CONSULTA DE INFORMAÇÕES INDIVIDUAIS DO ALUNO (FICHA COMPLETA)   */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {viewingStudent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-8"
            >
              {/* Header with Student Badge */}
              {(() => {
                const studentTurma = getStudentTurma(viewingStudent);
                const badge = getCourseBadge(viewingStudent.course);
                const attendancePct = viewingStudent.totalClasses > 0 ? Math.round((viewingStudent.attendanceCount / viewingStudent.totalClasses) * 100) : 0;
                const studentGrades = grades.filter(g => g.studentId === viewingStudent.id);
                const avgScore = studentGrades.length > 0 ? (studentGrades.reduce((acc, g) => acc + g.score, 0) / studentGrades.length).toFixed(1) : null;

                return (
                  <div>
                    <div className={`bg-gradient-to-r ${badge.gradient} text-white p-6 flex justify-between items-start`}>
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md text-white font-black text-2xl flex items-center justify-center shadow-lg border border-white/30">
                          {viewingStudent.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono font-bold bg-black/20 px-2 py-0.5 rounded-full text-white">
                              {viewingStudent.matricula}
                            </span>
                            <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-full ${
                              viewingStudent.status === 'active' ? 'bg-emerald-300 text-emerald-950' : 'bg-stone-300 text-stone-900'
                            }`}>
                              {viewingStudent.status === 'active' ? '🟢 Matrícula Ativa' : '⚪ Matrícula Inativa'}
                            </span>
                          </div>
                          <h3 className="font-sans font-black text-2xl text-white tracking-tight">{viewingStudent.name}</h3>
                          <p className="text-white/80 text-xs">{viewingStudent.age} anos • Ingressou em {viewingStudent.joinedAt}</p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setViewingStudent(null)}
                        className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>

                    {/* Body Info */}
                    <div className="p-6 space-y-6 text-xs text-stone-700">
                      
                      {/* Turma Details Card */}
                      <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-mono uppercase font-bold text-stone-400">Turma e Oficina Vinculada</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border ${badge.bg}`}>
                            {badge.label}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-sans font-black text-stone-900 text-base">
                            {studentTurma?.name || viewingStudent.turma}
                          </h4>
                          <p className="text-stone-500 text-xs flex items-center gap-1 mt-0.5">
                            <Clock className="h-3.5 w-3.5 text-stone-400" />
                            {studentTurma?.schedule || 'Horário padrão'}
                          </p>
                          {studentTurma?.room && (
                            <p className="text-stone-500 text-xs flex items-center gap-1 mt-0.5">
                              <MapPin className="h-3.5 w-3.5 text-stone-400" />
                              Local: {studentTurma.room}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Responsável & Contato */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-1.5">
                          <span className="text-[10px] uppercase font-mono font-bold text-stone-400 block">Responsável / Tutor Legal</span>
                          <p className="font-bold text-stone-900 text-sm">{viewingStudent.guardianName || 'Próprio Aluno / Autônomo'}</p>
                          {(viewingStudent.guardianPhone || viewingStudent.phone) && (
                            <a
                              href={`https://wa.me/55${(viewingStudent.guardianPhone || viewingStudent.phone || '').replace(/\D/g, '')}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 text-emerald-700 hover:text-emerald-900 font-bold mt-1 bg-emerald-50 px-2.5 py-1 rounded-xl text-xs"
                            >
                              <MessageCircle className="h-3.5 w-3.5" />
                              Conversar no WhatsApp ({viewingStudent.guardianPhone || viewingStudent.phone})
                            </a>
                          )}
                        </div>

                        <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-1.5">
                          <span className="text-[10px] uppercase font-mono font-bold text-stone-400 block">Endereço Residencial</span>
                          {viewingStudent.address ? (
                            <a
                              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(viewingStudent.address + ', Franca - SP')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-start gap-1.5 text-xs font-semibold text-emerald-800 hover:text-emerald-950 hover:underline leading-relaxed group transition-colors"
                              title="Abrir endereço no Google Maps"
                            >
                              <MapPin className="h-3.5 w-3.5 text-emerald-600 group-hover:scale-110 transition-transform shrink-0 mt-0.5" />
                              <span>{viewingStudent.address}</span>
                            </a>
                          ) : (
                            <p className="font-medium text-stone-500 text-xs leading-relaxed italic">
                              Endereço não informado / Cadastro preliminar
                            </p>
                          )}
                          {viewingStudent.birthDate && (
                            <p className="text-[11px] text-stone-500 font-mono">
                              Nascido em: {new Date(viewingStudent.birthDate + 'T12:00:00').toLocaleDateString('pt-BR')}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Desempenho Escolar & Frequência */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200/80 space-y-2">
                          <div className="flex justify-between items-center text-[10px] font-mono uppercase font-bold text-emerald-900">
                            <span>Frequência Escolar</span>
                            <span>{attendancePct}% de Presença</span>
                          </div>
                          <p className="text-xl font-mono font-black text-emerald-950">
                            {viewingStudent.attendanceCount} <span className="text-xs font-normal text-emerald-800">de {viewingStudent.totalClasses} aulas registradas</span>
                          </p>
                          <div className="w-full bg-emerald-200/80 h-2 rounded-full overflow-hidden">
                            <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${attendancePct}%` }} />
                          </div>
                        </div>

                        <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200/80 space-y-2">
                          <span className="text-[10px] font-mono uppercase font-bold text-amber-900 block">Média de Notas (SGE)</span>
                          <p className="text-xl font-mono font-black text-amber-950">
                            {avgScore ? `${avgScore} / 10.0` : 'Sem notas lançadas'}
                          </p>
                          <p className="text-[11px] text-amber-800">
                            {studentGrades.length} {studentGrades.length === 1 ? 'avaliação registrada' : 'avaliações registradas'} no boletim escolar
                          </p>
                        </div>
                      </div>

                      {/* Observações Pedagógicas */}
                      {viewingStudent.notes && (
                        <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-1">
                          <span className="text-[10px] uppercase font-mono font-bold text-stone-400 block">Observações Pedagógicas / Histórico</span>
                          <p className="text-xs text-stone-700 italic">"{viewingStudent.notes}"</p>
                        </div>
                      )}

                      {/* Modal Actions */}
                      <div className="flex items-center justify-between pt-4 border-t border-stone-150">
                        <button
                          type="button"
                          onClick={() => {
                            const st = viewingStudent;
                            setViewingStudent(null);
                            handleDeleteStudent(st);
                          }}
                          className="px-3.5 py-2 text-red-600 hover:bg-red-50 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" /> Excluir Aluno
                        </button>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => window.print()}
                            className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
                          >
                            <FileText className="h-4 w-4" /> Imprimir Ficha
                          </button>
                          
                          <button
                            type="button"
                            onClick={() => {
                              const st = viewingStudent;
                              setViewingStudent(null);
                              handleOpenEditForm(st);
                            }}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
                          >
                            <Edit3 className="h-4 w-4" /> Editar Informações
                          </button>
                        </div>
                      </div>

                    </div>
                  </div>
                );
              })()}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* MODAL 3: GERENCIAR CAPACIDADE DE VAGAS DA TURMA (EXCLUSIVO MASTER)       */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isCapacityModalOpen && editingTurma && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-stone-200 overflow-hidden"
            >
              <div className="bg-emerald-900 text-white p-5 flex justify-between items-center">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-mono uppercase text-emerald-300 font-bold">Gestão de Vagas Master</span>
                  <h3 className="font-sans font-bold text-base text-white">Capacidade da Turma</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCapacityModalOpen(false)}
                  className="p-1.5 text-white/70 hover:text-white rounded-full cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleSaveCapacity} className="p-5 space-y-4 text-xs">
                <div className="space-y-1">
                  <p className="font-bold text-stone-900 text-sm">{editingTurma.name}</p>
                  <p className="text-stone-500 text-xs">
                    Vagas ocupadas atualmente: <strong>{turmaStatsMap.get(editingTurma.id)?.occupied || 0} alunos</strong>
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold font-mono text-stone-500 block">Número Máximo de Vagas</label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="200"
                    value={newCapacityValue}
                    onChange={e => setNewCapacityValue(parseInt(e.target.value) || 1)}
                    className="w-full h-11 px-3 bg-stone-50 border border-stone-200 rounded-xl font-mono text-base font-bold text-emerald-900"
                  />
                  <p className="text-[10px] text-stone-400 mt-1">
                    Ao alterar o limite, o sistema atualizará instantaneamente a disponibilidade de vagas e os bloqueios de lotação desta turma.
                  </p>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-stone-150">
                  <button
                    type="button"
                    onClick={() => setIsCapacityModalOpen(false)}
                    className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl cursor-pointer shadow-sm"
                  >
                    Salvar Capacidade
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

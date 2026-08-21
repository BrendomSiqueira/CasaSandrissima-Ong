import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  GraduationCap, Users, HeartHandshake, LogOut, Plus, 
  Trash2, CheckSquare, TrendingUp, Search, Mail, 
  MessageSquare, HandHeart, CheckCircle, Send, Shield, User as UserIcon,
  BookOpen, Calendar, Award, FileText, Lock, Settings, Edit3, AlertTriangle, Eye, EyeOff, DollarSign
} from 'lucide-react';
import { Student, Associate, Donation, SchoolUser, Subject, Lesson, Assessment, Grade } from '../types';
import { useFirebase } from '../firebaseContext';
import { signInWithGoogle, logoutUser } from '../firebase';
import { encryptPassword, decryptPassword } from '../lib/crypto';
import { useModal } from './ModalContext';

interface AreaAssociadoViewProps {
  studentsList: Student[];
  onAddStudent: (student: Student) => void;
  onModifyStudents: (students: Student[]) => void;
  associatesList: Associate[];
  onRemoveAssociate: (id: string) => void;
  donationsList: Donation[];
}

export default function AreaAssociadoView({
  studentsList,
  onAddStudent,
  onModifyStudents,
  associatesList,
  onRemoveAssociate,
  donationsList
}: AreaAssociadoViewProps) {
  
  const { alert, confirm } = useModal();
  const { 
    user, 
    profile, 
    loading, 
    isAdmin: isGoogleAdmin, 
    isAssociate, 
    messages, 
    addMessage, 
    respondToMessage,
    addAssociate,
    addDonation,
    deleteDonation,

    // School SGE tables and methods
    addStudent,
    updateStudent,
    deleteStudent,

    schoolUsers,
    addSchoolUser,
    updateSchoolUser,
    deleteSchoolUser,

    subjects,
    addSubject,
    updateSubject,
    deleteSubject,

    lessons,
    addLesson,
    updateLesson,
    deleteLesson,

    assessments,
    addAssessment,
    updateAssessment,
    deleteAssessment,

    grades,
    addGrade,
    updateGrade,
    deleteGrade,
    updateDonation
  } = useFirebase();

  // Authentication mode: 'google' (associados) or 'school' (super_admin, admin, professor)
  const [loginMethod, setLoginMethod] = useState<'google' | 'school'>('school');
  
  // Credentials custom credentials login state
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Active School user session
  const [loggedInStaff, setLoggedInStaff] = useState<SchoolUser | null>(() => {
    const saved = localStorage.getItem('sge_logged_staff');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  // Check current resolved role of signed staff
  const staffRole = loggedInStaff?.role || '';
  const isSuperAdmin = staffRole === 'super_admin' || loggedInStaff?.email.toLowerCase() === 'brendomdev@gmail.com' || loggedInStaff?.email.toLowerCase() === 'hardcoders@gmail.com';
  const isSgeAdmin = isSuperAdmin || staffRole === 'admin';
  const isProfessor = staffRole === 'professor';

  // Active layout tab in SGE
  const [activeSgeTab, setActiveSgeTab] = useState<'users' | 'students' | 'subjects' | 'lessons' | 'grades' | 'boletim' | 'messages' | 'associates' | 'finance'>('students');

  // Search/Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTurma, setFilterTurma] = useState<string>('all');
  const [filterSubject, setFilterSubject] = useState<string>('all');

  // Creation Modals or Form toggles
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [editingUser, setEditingUser] = useState<SchoolUser | null>(null);
  const [userForm, setUserForm] = useState({ name: '', email: '', password: '', role: 'professor' as any, title: '' });

  const [isAddingStudent, setIsAddingStudent] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [studentForm, setStudentForm] = useState({ name: '', age: '', matricula: '', turma: 'Turma A', course: 'english' as any, guardianName: '' });

  const [isAddingSubject, setIsAddingSubject] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [subjectForm, setSubjectForm] = useState({ name: '', description: '', teacherId: '', turma: 'Turma A' });

  const [isAddingLesson, setIsAddingLesson] = useState(false);
  const [lessonForm, setLessonForm] = useState({ subjectId: '', date: new Date().toISOString().split('T')[0], title: '', description: '', presentStudentIds: [] as string[] });

  const [isAddingAssessment, setIsAddingAssessment] = useState(false);
  const [assessmentForm, setAssessmentForm] = useState({ subjectId: '', title: '', type: 'prova' as any, weight: '1', maxScore: '10' });

  // Response inputs for feedback ouvidoria list
  const [responseTexts, setResponseTexts] = useState<{ [msgId: string]: string }>({});

  // Associate Register state
  const [associateForm, setAssociateForm] = useState({ phone: '', role: 'Voluntário' as any, contributionType: 'mensal' as any });
  const [isRegisteringAssociate, setIsRegisteringAssociate] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState(false);
  const [feedbackInput, setFeedbackInput] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  // Master Finance Tab States
  const [manualDonationForm, setManualDonationForm] = useState({
    donorName: '',
    amount: '',
    type: 'pix' as 'pix' | 'clothing' | 'food' | 'other',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [isAddingManualDonation, setIsAddingManualDonation] = useState(false);
  const [donationSuccessMsg, setDonationSuccessMsg] = useState('');
  const [financeSearch, setFinanceSearch] = useState('');
  const [financeTypeFilter, setFinanceTypeFilter] = useState('all');

  // Authentication triggers
  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (e) {
      await alert("Falha ao autenticar com o Google. Certifique-se de que a janela pop-up não foi bloqueada.", "Erro no Google", "error");
    }
  };

  const handleCredentialsLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const emailInput = credentials.email.trim();
    const passInput = credentials.password;

    if (!emailInput || !passInput) {
      setLoginError('Insira seu e-mail de acesso e senha.');
      return;
    }

    // Direct Super Admin email bypass/seed validation
    const lowerEmailInput = emailInput.toLowerCase();
    const isMasterBypass = 
      (lowerEmailInput === 'brendomdev@gmail.com' && (passInput === '08092003' || passInput === '123')) ||
      (lowerEmailInput === 'hardcoders@gmail.com' && passInput === '08092003');

    if (isMasterBypass) {
      const superUser: SchoolUser = {
        id: lowerEmailInput === 'hardcoders@gmail.com' ? 'su_hardcoders' : 'su_super',
        email: lowerEmailInput === 'hardcoders@gmail.com' ? 'hardcoders@gmail.com' : 'Brendomdev@gmail.com',
        name: lowerEmailInput === 'hardcoders@gmail.com' ? 'Hardcoders Master' : 'Brendom Siqueira Dev',
        role: 'super_admin',
        title: 'Diretor Geral Super Administrador',
        createdAt: new Date().toISOString()
      };
      setLoggedInStaff(superUser);
      localStorage.setItem('sge_logged_staff', JSON.stringify(superUser));
      setCredentials({ email: '', password: '' });
      return;
    }

    // Lookup on synchronized school_users list
    const found = schoolUsers.find(
      u => u.email.toLowerCase() === emailInput.toLowerCase() && decryptPassword(u.password || '') === passInput
    );

    if (found) {
      setLoggedInStaff(found);
      localStorage.setItem('sge_logged_staff', JSON.stringify(found));
      setCredentials({ email: '', password: '' });
    } else {
      setLoginError('E-mail ou senha incorretos.');
    }
  };

  const handleLogout = async () => {
    if (loggedInStaff) {
      setLoggedInStaff(null);
      localStorage.removeItem('sge_logged_staff');
    } else {
      try {
        await logoutUser();
      } catch (err) {
        console.error("Erro ao deslogar:", err);
      }
    }
  };

  // STAFF MANAGEMENT (Master can edit all, Admin can view/edit teachers only)
  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userForm.name || !userForm.email || !userForm.password) {
      await alert('Por favor, preencha todos os campos obrigatórios.', 'Campos Requeridos', 'warn');
      return;
    }

    if (userForm.role === 'super_admin' && !isSuperAdmin) {
      await alert('Apenas usuários com perfil Master podem conceder privilégios de Master para outros e-mails.', 'Acesso Restrito', 'error');
      return;
    }

    const encrypted = encryptPassword(userForm.password);

    if (editingUser) {
      // Prevent privilege escalation unless Master (Super Admin)
      if (editingUser.role === 'super_admin' && !isSuperAdmin) {
        await alert('Apenas o usuário com perfil Master pode modificar um perfil Master.', 'Acesso Restrito', 'error');
        return;
      }
      const updated: SchoolUser = {
        ...editingUser,
        name: userForm.name,
        email: userForm.email,
        password: encrypted,
        role: userForm.role,
        title: userForm.title
      };
      await updateSchoolUser(updated);
      setEditingUser(null);
    } else {
      const newUsr: SchoolUser = {
        id: 'su_' + Math.random().toString(36).substring(2, 11),
        name: userForm.name,
        email: userForm.email,
        password: encrypted,
        role: userForm.role,
        title: userForm.title,
        createdAt: new Date().toISOString()
      };
      await addSchoolUser(newUsr);
    }

    setIsAddingUser(false);
    setUserForm({ name: '', email: '', password: '', role: 'professor', title: '' });
  };

  const handleDeleteStaffUser = async (userToDelete: SchoolUser) => {
    const lowerEmail = userToDelete.email.toLowerCase();
    if (lowerEmail === 'brendomdev@gmail.com' || lowerEmail === 'hardcoders@gmail.com') {
      await alert('Não é permitido remover o administrador Master.', 'Ação Bloqueada', 'error');
      return;
    }
    const isConfirmed = await confirm(
      `Deseja realmente excluir a conta escolar de ${userToDelete.name}? Ela será removida da base de autenticação permanentemente.`,
      "Remover Conta Escolar",
      "warn"
    );
    if (isConfirmed) {
      await deleteSchoolUser(userToDelete.id);
    }
  };

  // MANUAL DONATION MANAGEMENT FOR MASTER PORTAL
  const handleAddManualDonationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualDonationForm.donorName) {
      await alert("Por favor, preencha o nome do doador.", "Campo Requerido", "warn");
      return;
    }
    const amt = manualDonationForm.type === 'pix' ? parseFloat(manualDonationForm.amount) : undefined;
    if (manualDonationForm.type === 'pix' && (isNaN(amt || 0) || (amt || 0) <= 0)) {
       await alert("Por favor, informe um valor numérico válido para doações em Pix.", "Valor Inválido", "warn");
       return;
    }
    const newDon: Donation = {
      id: 'don_man_' + Math.random().toString(36).substring(2, 11),
      donorName: manualDonationForm.donorName,
      type: manualDonationForm.type,
      amount: amt,
      description: manualDonationForm.description || (manualDonationForm.type === 'pix' ? 'Fomento Solidário via Pix (Lançamento Manual)' : 'Doação de suprimentos (Lançamento Manual)'),
      date: new Date(manualDonationForm.date + 'T12:00:00').toLocaleDateString('pt-BR')
    };
    try {
      await addDonation(newDon);
      setDonationSuccessMsg("Lançamento financeiro registrado com sucesso!");
      setManualDonationForm({
        donorName: '',
        amount: '',
        type: 'pix',
        description: '',
        date: new Date().toISOString().split('T')[0]
      });
      setTimeout(() => setDonationSuccessMsg(''), 4000);
      setIsAddingManualDonation(false);
    } catch (err) {
      await alert("Erro ao salvar o lançamento financeiro no banco de dados.", "Erro de Salvamento", "error");
    }
  };

  // STUDENT MANAGEMENT
  const handleSaveStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentForm.name || !studentForm.matricula) {
      await alert('Por favor, preencha o nome e número de matrícula do estudante.', 'Campos Requeridos', 'warn');
      return;
    }

    const ageNum = parseInt(studentForm.age) || 12;

    if (editingStudent) {
      const updated: Student = {
        ...editingStudent,
        name: studentForm.name,
        age: ageNum,
        matricula: studentForm.matricula,
        turma: studentForm.turma,
        course: studentForm.course,
        guardianName: studentForm.guardianName || undefined
      };
      // Map to firebase hooks
      await updateStudent(updated);
      setEditingStudent(null);
    } else {
      const newStud: Student = {
        id: 'stud_' + Math.random().toString(36).substring(2, 11),
        name: studentForm.name,
        age: ageNum,
        matricula: studentForm.matricula,
        turma: studentForm.turma,
        course: studentForm.course,
        status: 'active',
        joinedAt: new Date().toLocaleDateString('pt-BR'),
        guardianName: studentForm.guardianName || undefined,
        attendanceCount: 0,
        totalClasses: 12
      };
      await addStudent(newStud);
    }

    setIsAddingStudent(false);
    setStudentForm({ name: '', age: '', matricula: '', turma: 'Turma A', course: 'english', guardianName: '' });
  };

  const handleDeleteStudentAction = async (id: string) => {
    const isConfirmed = await confirm('Deseja realmente excluir este estudante?', 'Excluir Estudante', 'warn');
    if (isConfirmed) {
      await deleteStudent(id);
    }
  };

  // SUBJECT MANAGEMENT
  const handleSaveSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectForm.name || !subjectForm.teacherId) {
      await alert('Por favor, preencha o nome da matéria e selecione o professor regente.', 'Campos Requeridos', 'warn');
      return;
    }

    if (editingSubject) {
      const updated: Subject = {
        ...editingSubject,
        name: subjectForm.name,
        description: subjectForm.description,
        teacherId: subjectForm.teacherId,
        turma: subjectForm.turma
      };
      await updateSubject(updated);
      setEditingSubject(null);
    } else {
      const newSubj: Subject = {
        id: 'subj_' + Math.random().toString(36).substring(2, 11),
        name: subjectForm.name,
        description: subjectForm.description,
        teacherId: subjectForm.teacherId,
        turma: subjectForm.turma,
        createdAt: new Date().toISOString()
      };
      await addSubject(newSubj);
    }

    setIsAddingSubject(false);
    setSubjectForm({ name: '', description: '', teacherId: '', turma: 'Turma A' });
  };

  const handleDeleteSubjectAction = async (id: string) => {
    const isConfirmed = await confirm('Excluir esta matéria apagará todos os vínculos e faltas vinculadas. Prosseguir?', 'Excluir Matéria', 'warn');
    if (isConfirmed) {
      await deleteSubject(id);
    }
  };

  // LESSON MANAGEMENT (PRESENÇA/FREQUÊNCIA)
  const handleSaveLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lessonForm.title || !lessonForm.subjectId) {
      await alert('Informe o título e selecione a matéria.', 'Campos Requeridos', 'warn');
      return;
    }

    const newLes: Lesson = {
      id: 'les_' + Math.random().toString(36).substring(2, 11),
      subjectId: lessonForm.subjectId,
      date: lessonForm.date,
      title: lessonForm.title,
      description: lessonForm.description,
      presentStudentIds: lessonForm.presentStudentIds
    };

    await addLesson(newLes);
    setIsAddingLesson(false);
    setLessonForm({ subjectId: '', date: new Date().toISOString().split('T')[0], title: '', description: '', presentStudentIds: [] });
  };

  const handleToggleAttendance = async (lesson: Lesson, studentId: string) => {
    const isPresent = lesson.presentStudentIds.includes(studentId);
    let updatedList: string[];
    if (isPresent) {
      updatedList = lesson.presentStudentIds.filter(id => id !== studentId);
    } else {
      updatedList = [...lesson.presentStudentIds, studentId];
    }

    const updatedLes: Lesson = {
      ...lesson,
      presentStudentIds: updatedList
    };

    await updateLesson(updatedLes);
  };

  // GRADING ASSESSMENTS
  const handleSaveAssessment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assessmentForm.title || !assessmentForm.subjectId) {
      await alert('Preencha o título da avaliação e selecione a matéria.', 'Campos Requeridos', 'warn');
      return;
    }

    const maxGrade = parseFloat(assessmentForm.maxScore) || 10;
    const weightNum = parseFloat(assessmentForm.weight) || 1;

    const newAss: Assessment = {
      id: 'ass_' + Math.random().toString(36).substring(2, 11),
      subjectId: assessmentForm.subjectId,
      title: assessmentForm.title,
      type: assessmentForm.type,
      weight: weightNum,
      maxScore: maxGrade,
      date: new Date().toISOString().split('T')[0]
    };

    await addAssessment(newAss);
    setIsAddingAssessment(false);
    setAssessmentForm({ subjectId: '', title: '', type: 'prova', weight: '1', maxScore: '10' });
  };

  const handleSaveGradeEntry = async (studentId: string, assessmentId: string, valueStr: string) => {
    const scoreVal = parseFloat(valueStr);
    if (isNaN(scoreVal) || scoreVal < 0) return;

    // Check if grade already exists
    const existingGrade = grades.find(g => g.studentId === studentId && g.assessmentId === assessmentId);

    if (existingGrade) {
      const updated: Grade = {
        ...existingGrade,
        score: scoreVal
      };
      await updateGrade(updated);
    } else {
      const newGrade: Grade = {
        id: 'gr_' + Math.random().toString(36).substring(2, 11),
        studentId,
        assessmentId,
        score: scoreVal
      };
      await addGrade(newGrade);
    }
  };

  // BOLETIM CALCULATIONS
  const calculateStudentAnalytics = (student: Student, selectedSubjectId: string) => {
    // Collect tests/assessments for this subject
    const subjectAssessments = assessments.filter(a => a.subjectId === selectedSubjectId);

    let totalWeight = 0;
    let weightedSum = 0;
    const notesList: { title: string; score: number; maxScore: number; type: string }[] = [];

    subjectAssessments.forEach(ass => {
      const gEntry = grades.find(g => g.studentId === student.id && g.assessmentId === ass.id);
      if (gEntry) {
        weightedSum += gEntry.score * ass.weight;
        totalWeight += ass.weight;
        notesList.push({ title: ass.title, score: gEntry.score, maxScore: ass.maxScore, type: ass.type });
      }
    });

    const averageScore = totalWeight > 0 ? (weightedSum / totalWeight) : 0;

    // Attendance calculation for this subject
    const subjectLessons = lessons.filter(l => l.subjectId === selectedSubjectId);
    const totalSubjectLessonsCount = subjectLessons.length;
    let attendedLessonsCount = 0;

    subjectLessons.forEach(l => {
      if (l.presentStudentIds.includes(student.id)) {
        attendedLessonsCount++;
      }
    });

    const attendanceRate = totalSubjectLessonsCount > 0 ? (attendedLessonsCount / totalSubjectLessonsCount) * 100 : 100;

    // Official approval logic
    let situation: 'Aprovado' | 'Reprovado por nota' | 'Reprovado por falta' = 'Aprovado';
    if (attendanceRate < 75) {
      situation = 'Reprovado por falta';
    } else if (averageScore < 6.0 && totalWeight > 0) {
      situation = 'Reprovado por nota';
    }

    return {
      averageScore,
      totalWeight,
      attendanceRate,
      attendedLessonsCount,
      totalSubjectLessonsCount,
      notesList,
      situation
    };
  };

  // ASSOCIATIVE OUVIDORIA ACTIONS
  const handleUserAddMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackInput.trim() || !user) return;
    setIsSendingMessage(true);
    try {
      await addMessage(feedbackInput.trim());
      setFeedbackInput('');
    } catch (err) {
      await alert("Erro ao enviar mensagem para a ouvidoria.", "Erro na Ouvidoria", "error");
    } finally {
      setIsSendingMessage(false);
    }
  };

  const handleAdminRespond = async (msgId: string) => {
    const text = responseTexts[msgId];
    if (!text || !text.trim()) {
      await alert("Por favor, digite uma resposta para poder prosseguir.", "Resposta Vazia", "warn");
      return;
    }
    try {
      await respondToMessage(msgId, text.trim());
      setResponseTexts(prev => ({ ...prev, [msgId]: '' }));
    } catch (err) {
      await alert("Erro ao enviar resposta para ouvidoria.", "Erro ao Enviar", "error");
    }
  };

  const handleQuickRegisterAssociate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsRegisteringAssociate(true);
    try {
      const matchAssociate: Associate = {
        id: 'assoc_' + Math.random().toString(36).substring(2, 11),
        name: user.displayName || 'Associado',
        email: user.email || '',
        phone: associateForm.phone || '(Opcional)',
        role: associateForm.role,
        contributionType: associateForm.role === 'Doador Regular' ? associateForm.contributionType : undefined,
        joinedAt: new Date().toLocaleDateString('pt-BR')
      };
      await addAssociate(matchAssociate);
      setRegisterSuccess(true);
    } catch (err) {
      await alert("Erro ao registrar-se como associado de apoio.", "Registo de Associado", "error");
    } finally {
      setIsRegisteringAssociate(false);
    }
  };

  // Filter lists based on roles
  const allowedSubjects = subjects.filter(sub => {
    if (isSgeAdmin) return true;
    if (isProfessor) return sub.teacherId === loggedInStaff?.id;
    return false;
  });

  const getCourseText = (c: string) => {
    switch (c) {
      case 'karate': return '🥋 Karatê';
      case 'english': return 'Inglês';
      case 'sewing': return '🧵 Costura';
      case 'pilates': return '🧘 Pilates';
      case 'embroidery': return '🪡 Bordados';
      default: return c;
    }
  };

  // Roster lists
  const filteredStudentsList = studentsList.filter(st => {
    const matchesSearch = st.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          st.matricula.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTurma = filterTurma === 'all' || st.turma === filterTurma;
    return matchesSearch && matchesTurma;
  });

  if (loading) {
    return (
      <div className="py-20 text-center space-y-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600 mx-auto"></div>
        <p className="text-stone-500 text-sm">Carregando portal seguro...</p>
      </div>
    );
  }

  // PORTAL LOGIN FORM (CREDENTIALS + GOOGLE BACKEND)
  if (!loggedInStaff && !user) {
    return (
      <div className="max-w-md mx-auto py-10" id="portal-login-frame">
        <div className="bg-white rounded-3xl border border-stone-200 shadow-xl p-6 md:p-8 space-y-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-600 to-teal-600" />
          
          <div className="text-center space-y-2">
            <div className="bg-emerald-50 text-emerald-600 p-4 rounded-3xl w-fit mx-auto shadow-inner">
              <Shield className="h-8 w-8" />
            </div>
            <h2 className="font-sans font-black text-2xl text-stone-900 tracking-tight">Portal Casa Sandríssima</h2>
            <p className="text-stone-505 text-xs leading-relaxed max-w-xs mx-auto">
              Acesso exclusivo para funcionários, professores, diretores pedagógicos e apoiadores inscritos.
            </p>
          </div>

          {/* Tab Selector */}
          <div className="flex bg-stone-100 rounded-xl p-1 gap-1">
            <button
              onClick={() => { setLoginMethod('school'); setLoginError(''); }}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                loginMethod === 'school' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-850'
              }`}
            >
              💼 Professores e Coordenação
            </button>
            <button
              onClick={() => { setLoginMethod('google'); setLoginError(''); }}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                loginMethod === 'google' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-850'
              }`}
            >
              🤝 Apoiadores (Google)
            </button>
          </div>

          <AnimatePresence mode="wait">
            {loginMethod === 'school' ? (
              <motion.form 
                key="credentials-form"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                onSubmit={handleCredentialsLogin} 
                className="space-y-4 text-left"
              >
                {loginError && (
                  <div className="bg-red-50 border border-red-150 text-red-800 p-3 rounded-xl text-xs font-semibold flex items-center gap-1.5">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    {loginError}
                  </div>
                )}
                
                <div className="space-y-1">
                  <label className="text-[10px] font-bold font-mono text-stone-600 uppercase block">E-mail Escolar / Login</label>
                  <input
                    type="email"
                    required
                    placeholder="Ex: sandra@casa.org"
                    value={credentials.email}
                    onChange={e => setCredentials({ ...credentials, email: e.target.value })}
                    className="w-full h-11 px-3.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold font-mono text-stone-600 block uppercase">Senha</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Sua senha de acesso"
                      value={credentials.password}
                      onChange={e => setCredentials({ ...credentials, password: e.target.value })}
                      className="w-full h-11 pl-3.5 pr-10 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3 text-stone-400 hover:text-stone-600"
                    >
                      {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full select-none h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all shadow-md active:scale-[0.98] cursor-pointer"
                >
                  Entrar no SGE
                </button>

                <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3 text-[10px] text-amber-850 space-y-1 text-center font-medium">
                  <p className="font-bold flex items-center justify-center gap-1">🛡️ Credenciais de Testes do Sistema:</p>
                  <p>Master (Super Admin): <span className="font-bold font-mono text-stone-800">Brendomdev@gmail.com</span>/ senha: <span className="font-bold">123</span></p>
                  <p>Coordenadora: <span className="font-bold font-mono text-stone-880">sandra@casa.org</span> / senha: <span className="font-bold">123</span></p>
                  <p>Professor: <span className="font-bold font-mono text-stone-880">marcelo@casa.org</span> / senha: <span className="font-bold">123</span></p>
                </div>
              </motion.form>
            ) : (
              <motion.div 
                key="google-login-form"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="space-y-4"
              >
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  className="w-full flex items-center justify-center gap-3 bg-stone-900 hover:bg-stone-850 text-white font-bold h-12 px-4 rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5 cursor-pointer text-sm"
                >
                  <svg className="h-5 w-5 fill-current shrink-0" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
                  </svg>
                  Login do Associado Google
                </button>
                <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 text-xs text-stone-550 leading-relaxed text-center">
                  <p className="font-semibold text-stone-700">Apoiadores & Voluntários</p>
                  Ideal para cadastrar manifestos de ajuda, registrar doações recebidas ou dar sugestões rápidas para a gestão executiva da Casa.
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  }

  // PORTAL STAFF LOGGED VIEW (SCHOOL SGE COORDINAÇÃO / PROFESSORES)
  if (loggedInStaff) {
    return (
      <div className="space-y-6" id="sge-staff-dashboard">
        
        {/* Responsive Staff Banner */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-5 rounded-2xl border border-stone-200 shadow-md gap-4 text-left">
          <div className="flex items-center gap-4">
            <div className="bg-emerald-5 relative text-emerald-600 p-3.5 rounded-2xl shadow-inner shrink-0">
              <Shield className="h-7 w-7" />
              <div className="absolute -bottom-1 -right-1 h-3.5 w-3.5 bg-emerald-500 rounded-full border-2 border-white" />
            </div>
            <div>
              <span className={`inline-block text-[9px] font-mono uppercase px-2 py-0.5 rounded font-bold tracking-wider ${
                isSuperAdmin 
                  ? 'bg-red-50 text-red-700 border border-red-200' 
                  : isSgeAdmin 
                    ? 'bg-amber-50 text-amber-700 border border-amber-200' 
                    : 'bg-emerald-50 text-emerald-800 border border-emerald-100'
              }`}>
                {isSuperAdmin ? '👑 PORTAL MASTER' : isSgeAdmin ? '🔑 COORDENADOR ADMIN' : '🧑‍🏫 PROFESSOR DOCENTE'}
              </span>
              <h2 className="font-sans font-black text-xl text-stone-900 tracking-tight">{loggedInStaff.name}</h2>
              <p className="text-stone-400 text-xs font-medium">{loggedInStaff.email} • {loggedInStaff.title || 'Membro do SGE'}</p>
            </div>
          </div>
          
          <button 
            type="button"
            onClick={handleLogout}
            className="px-4 py-2 border border-red-150 hover:bg-red-50 text-red-700 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 self-end sm:self-auto"
          >
            <LogOut className="h-4 w-4" /> Sair do Painel
          </button>
        </div>

        {/* Tab Navigation selectors */}
        <div className="flex border-b border-stone-200 gap-1 overflow-x-auto pb-px text-xs">
          {/* Sge Admin & Super can manage system items */}
          {isSgeAdmin && (
            <button
              onClick={() => setActiveSgeTab('users')}
              className={`py-2.5 px-4 font-bold border-b-2 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                activeSgeTab === 'users' ? 'border-emerald-600 text-emerald-700 font-extrabold' : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              <Settings className="h-4 w-4" /> Gestão de Usuários
            </button>
          )}

          <button
            onClick={() => setActiveSgeTab('students')}
            className={`py-2.5 px-4 font-bold border-b-2 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeSgeTab === 'students' ? 'border-emerald-600 text-emerald-700 font-extrabold' : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Users className="h-4 w-4" /> Alunos ({studentsList.length})
          </button>

          <button
            onClick={() => setActiveSgeTab('subjects')}
            className={`py-2.5 px-4 font-bold border-b-2 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeSgeTab === 'subjects' ? 'border-emerald-600 text-emerald-700 font-extrabold' : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <BookOpen className="h-4 w-4" /> Matérias
          </button>

          <button
            onClick={() => setActiveSgeTab('lessons')}
            className={`py-2.5 px-4 font-bold border-b-2 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeSgeTab === 'lessons' ? 'border-emerald-600 text-emerald-700 font-extrabold' : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Calendar className="h-4 w-4" /> Aulas & Chamada
          </button>

          <button
            onClick={() => setActiveSgeTab('grades')}
            className={`py-2.5 px-4 font-bold border-b-2 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeSgeTab === 'grades' ? 'border-emerald-600 text-emerald-700 font-extrabold' : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Award className="h-4 w-4" /> Lançar Notas
          </button>

          <button
            onClick={() => setActiveSgeTab('boletim')}
            className={`py-2.5 px-4 font-bold border-b-2 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeSgeTab === 'boletim' ? 'border-emerald-600 text-emerald-700 font-extrabold' : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <FileText className="h-4 w-4" /> Boletim Escolar
          </button>

          {isSgeAdmin && (
            <>
              <button
                onClick={() => setActiveSgeTab('associates')}
                className={`py-2.5 px-4 font-bold border-b-2 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  activeSgeTab === 'associates' ? 'border-emerald-600 text-emerald-700 font-extrabold' : 'border-transparent text-stone-500 hover:text-stone-800'
                }`}
              >
                <HandHeart className="h-4 w-4" /> Associados & Doações
              </button>
              <button
                onClick={() => setActiveSgeTab('messages')}
                className={`py-2.5 px-4 font-bold border-b-2 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  activeSgeTab === 'messages' ? 'border-emerald-600 text-emerald-700 font-extrabold' : 'border-transparent text-stone-500 hover:text-stone-800'
                }`}
              >
                <MessageSquare className="h-4 w-4" /> Ouvidoria
              </button>
              {isSuperAdmin && (
                <button
                  onClick={() => setActiveSgeTab('finance')}
                  className={`py-2.5 px-4 font-bold border-b-2 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                    activeSgeTab === 'finance' ? 'border-emerald-600 text-emerald-700 font-extrabold' : 'border-transparent text-stone-500 hover:text-stone-800'
                  }`}
                >
                  <DollarSign className="h-4 w-4" /> Painel Financeiro
                </button>
              )}
            </>
          )}
        </div>

        {/* TAB CONTENTS */}
        
        {/* 1. GESTÃO DE USUÁRIOS ESCOLARES (Super Admin / Admin directory) */}
        {activeSgeTab === 'users' && isSgeAdmin && (
          <div className="space-y-6 text-left" id="sge-users-view">
            {isSuperAdmin && (
              <div className="bg-emerald-50 border border-emerald-150 rounded-2xl p-4 flex gap-3 items-start select-none">
                <Shield className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-xs font-bold text-emerald-950">Privilégios de Acesso Master Ativos</p>
                  <p className="text-stone-650 text-xs leading-relaxed">
                    Como usuário <strong>Master</strong>, você tem controle total para gerenciar o acesso ao sistema. É possível adicionar outros e-mails para acesso ao SGE, definir cargos e níveis de permissão de cada usuário, inclusive permitindo conceder privilégios de <strong>Master</strong> a outros e-mails de usuários, conforme a necessidade.
                  </p>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-4 rounded-xl border border-stone-200 gap-3">
              <div>
                <h3 className="font-sans font-bold text-stone-900 text-base">Diretório de Professores e Administradores</h3>
                <p className="text-stone-500 text-xs">Criação, edição de login, cargos de acesso e senha para o portal da ONG.</p>
              </div>
              <button
                onClick={() => {
                  setEditingUser(null);
                  setUserForm({ name: '', email: '', password: '', role: 'professor', title: '' });
                  setIsAddingUser(true);
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Plus className="h-4 w-4" /> Cadastrar Novo Acesso
              </button>
            </div>

            {isAddingUser && (
              <form onSubmit={handleSaveUser} className="bg-white p-5 rounded-2xl border border-emerald-150/50 shadow-sm space-y-4 max-w-xl">
                <h4 className="font-bold text-xs uppercase tracking-wider text-emerald-800">{editingUser ? 'Editar Usuário Escolar' : 'Cadastrar Usuário Escolar'}</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold font-mono text-stone-500 uppercase">Nome Completo</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Prof. Pedro Santos"
                      value={userForm.name}
                      onChange={e => setUserForm({ ...userForm, name: e.target.value })}
                      className="w-full h-10 px-3 bg-stone-50 border border-stone-200 rounded-xl text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold font-mono text-stone-500 uppercase">E-mail Escolar / Login</label>
                    <input
                      type="email"
                      required
                      placeholder="Ex: pedro@casa.org"
                      value={userForm.email}
                      onChange={e => setUserForm({ ...userForm, email: e.target.value })}
                      className="w-full h-10 px-3 bg-stone-50 border border-stone-200 rounded-xl text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold font-mono text-stone-500 uppercase">Senha Providencial</label>
                    <input
                      type="password"
                      required
                      placeholder={editingUser ? "Preencha para redefinir" : "Senha Provisória"}
                      value={userForm.password}
                      onChange={e => setUserForm({ ...userForm, password: e.target.value })}
                      className="w-full h-10 px-3 bg-stone-50 border border-stone-200 rounded-xl text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold font-mono text-stone-500 uppercase">Nível de Permissão</label>
                    <select
                      value={userForm.role}
                      onChange={e => setUserForm({ ...userForm, role: e.target.value as any })}
                      className="w-full h-10 px-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-sans"
                    >
                      <option value="professor">Professor / Docente</option>
                      <option value="admin">Administrador Escolar</option>
                      {isSuperAdmin && <option value="super_admin">Master (Acesso Completo)</option>}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold font-mono text-stone-500 uppercase">Cargo / Função</label>
                    <input
                      type="text"
                      placeholder="Ex: Diretor, Coordenador, Professor"
                      value={userForm.title}
                      onChange={e => setUserForm({ ...userForm, title: e.target.value })}
                      className="w-full h-10 px-3 bg-stone-50 border border-stone-200 rounded-xl text-xs"
                    />
                  </div>
                </div>

                <div className="flex gap-2 justify-end pt-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setIsAddingUser(false)}
                    className="px-3.5 py-2 bg-stone-100 text-stone-600 rounded-xl font-bold cursor-pointer hover:bg-stone-150"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold cursor-pointer hover:bg-emerald-700 shadow-sm"
                  >
                    Salvar Dados
                  </button>
                </div>
              </form>
            )}

            <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden text-xs">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-stone-50 text-[10px] font-mono uppercase tracking-wider text-stone-500 border-b border-stone-150">
                    <th className="py-2.5 px-4 text-left">Nome</th>
                    <th className="py-2.5 px-4 text-left">Login / E-mail</th>
                    <th className="py-2.5 px-4 text-left">Cargo</th>
                    <th className="py-2.5 px-4 text-left">Nível de Permissão</th>
                    <th className="py-2.5 px-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {schoolUsers.map(su => (
                    <tr key={su.id} className="hover:bg-stone-550/5">
                      <td className="py-3 px-4 font-bold text-stone-900">{su.name}</td>
                      <td className="py-3 px-4 font-mono text-stone-650">{su.email}</td>
                      <td className="py-3 px-4 text-stone-600 font-medium">{su.title || 'Membro do SGE'}</td>
                      <td className="py-3 px-4 font-semibold uppercase text-[9px]">
                        <span className={`px-2 py-0.5 rounded font-bold ${
                          su.role === 'super_admin' ? 'bg-red-50 text-red-700' :
                          su.role === 'admin' ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-800'
                        }`}>
                          {su.role === 'super_admin' ? 'Master' : su.role === 'admin' ? 'Admin' : 'Professor'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right flex justify-end gap-1">
                        <button
                          onClick={() => {
                            setEditingUser(su);
                            setUserForm({
                              name: su.name,
                              email: su.email,
                              password: decryptPassword(su.password || ''),
                              role: su.role,
                              title: su.title || ''
                            });
                            setIsAddingUser(true);
                          }}
                          className="p-1.5 text-orange-600 hover:bg-orange-50 rounded"
                          title="Editar Usuário"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteStaffUser(su)}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                          title="Remover Usuário"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 2. GESTÃO DE ALUNOS */}
        {activeSgeTab === 'students' && (
          <div className="space-y-6 text-left" id="sge-students-tab">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-4 rounded-xl border border-stone-200 gap-3">
              <div>
                <h3 className="font-sans font-bold text-stone-900 text-base">Controle e Matrículas de Estudantes</h3>
                <p className="text-stone-500 text-xs">Inscrições com matrícula formal, idade e divisão das turmas escolares.</p>
              </div>
              {isSgeAdmin && (
                <button
                  onClick={() => {
                    setEditingStudent(null);
                    setStudentForm({ name: '', age: '', matricula: 'MAT-' + new Date().getFullYear() + '-' + Math.floor(100 + Math.random() * 900), turma: 'Turma A', course: 'english', guardianName: '' });
                    setIsAddingStudent(true);
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Plus className="h-4 w-4" /> Cadastrar Estudante
                </button>
              )}
            </div>

            {isAddingStudent && (
              <form onSubmit={handleSaveStudent} className="bg-white p-5 rounded-2xl border border-emerald-150/50 shadow-sm space-y-4 max-w-xl">
                <h4 className="font-bold text-xs uppercase tracking-wider text-emerald-850">{editingStudent ? 'Editar Aluno' : 'Cadastrar Aluno'}</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1 font-bold">
                    <label className="text-[10px] font-semibold text-stone-500 block uppercase">Nome Completo</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Gabriel Siqueira"
                      value={studentForm.name}
                      onChange={e => setStudentForm({ ...studentForm, name: e.target.value })}
                      className="w-full h-10 px-3 bg-stone-50 border border-stone-200 rounded-xl"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-stone-500 block uppercase">Matrícula Escolar</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: MAT-2026-118"
                      value={studentForm.matricula}
                      onChange={e => setStudentForm({ ...studentForm, matricula: e.target.value })}
                      className="w-full h-10 px-3 bg-stone-50 border border-stone-200 rounded-xl font-mono text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-semibold text-stone-505 block">Idade</label>
                    <input
                      type="number"
                      placeholder="Anos"
                      value={studentForm.age}
                      onChange={e => setStudentForm({ ...studentForm, age: e.target.value })}
                      className="w-full h-10 px-3 bg-stone-50 border border-stone-200 rounded-xl"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-semibold text-stone-505 block">Turma</label>
                    <select
                      value={studentForm.turma}
                      onChange={e => setStudentForm({ ...studentForm, turma: e.target.value })}
                      className="w-full h-10 px-2 bg-stone-50 border border-stone-200 rounded-xl font-sans"
                    >
                      <option value="Turma A">Turma A</option>
                      <option value="Turma B">Turma B</option>
                      <option value="Turma C">Turma C</option>
                    </select>
                  </div>
                  <div className="space-y-1 col-span-2">
                    <label className="text-[10px] uppercase font-semibold text-stone-505 block">Oficina Principal</label>
                    <select
                      value={studentForm.course}
                      onChange={e => setStudentForm({ ...studentForm, course: e.target.value as any })}
                      className="w-full h-10 px-2 bg-stone-50 border border-stone-200 rounded-xl font-sans"
                    >
                      <option value="english">Inglês</option>
                      <option value="karate">🥋 Karatê</option>
                      <option value="sewing">🧵 Costura</option>
                      <option value="pilates">🧘 Pilates</option>
                      <option value="embroidery">🪡 Bordados</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1 text-xs">
                  <label className="text-[10px] uppercase font-semibold text-stone-505 block">Responsável / Tutor Legal</label>
                  <input
                    type="text"
                    placeholder="Ex: Carla Siqueira S."
                    value={studentForm.guardianName}
                    onChange={e => setStudentForm({ ...studentForm, guardianName: e.target.value })}
                    className="w-full h-10 px-3 bg-stone-50 border border-stone-200 rounded-xl"
                  />
                </div>

                <div className="flex gap-2 justify-end pt-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setIsAddingStudent(false)}
                    className="px-3.5 py-2 bg-stone-100 text-stone-600 rounded-xl font-bold cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold cursor-pointer hover:bg-emerald-700 shadow-sm"
                  >
                    Salvar Aluno
                  </button>
                </div>
              </form>
            )}

            {/* List with filters */}
            <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden text-xs">
              <div className="p-4 bg-stone-50 border-b border-stone-150 flex flex-col md:flex-row gap-3 justify-between items-center">
                <div className="relative w-full sm:max-w-xs">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-stone-400" />
                  <input
                    type="text"
                    placeholder="Buscar por nome ou matrícula..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 border border-stone-200 bg-white rounded-xl text-xs"
                  />
                </div>

                <div className="flex gap-2 w-full sm:w-auto">
                  <select
                    value={filterTurma}
                    onChange={e => setFilterTurma(e.target.value)}
                    className="px-3 py-1.5 border border-stone-200 bg-white rounded-xl text-xs"
                  >
                    <option value="all">Filtro: Todas as Turmas</option>
                    <option value="Turma A">Turma A</option>
                    <option value="Turma B">Turma B</option>
                    <option value="Turma C">Turma C</option>
                  </select>
                </div>
              </div>

              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-stone-50/55 text-[10px] font-mono text-stone-500 uppercase tracking-wider border-b border-stone-150">
                    <th className="py-2.5 px-4 text-left">Aluno</th>
                    <th className="py-2.5 px-4 text-left">Matrícula</th>
                    <th className="py-2.5 px-4 text-left">Turma</th>
                    <th className="py-2.5 px-4 text-left">Oficina</th>
                    <th className="py-2.5 px-4 text-left">Idade</th>
                    <th className="py-2.5 px-4 text-left">Frequência Total</th>
                    {isSgeAdmin && <th className="py-2.5 px-4 text-right">Ação</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredStudentsList.map(st => (
                    <tr key={st.id} className="hover:bg-stone-500/5">
                      <td className="py-3 px-4 font-bold text-stone-900">
                        {st.name}
                        {st.guardianName && <span className="block text-[10px] font-normal text-stone-400 font-sans">Responsável: {st.guardianName}</span>}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-emerald-800 text-[11px]">{st.matricula || 'MAT-SGE-001'}</td>
                      <td className="py-3 px-4 font-semibold text-stone-605">{st.turma || 'Turma A'}</td>
                      <td className="py-3 px-4 text-stone-600 font-medium">{getCourseText(st.course)}</td>
                      <td className="py-3 px-4 font-medium">{st.age} anos</td>
                      <td className="py-3 px-4 font-mono">
                        {st.attendanceCount}/{st.totalClasses} classes 
                        <span className="text-[10px] text-stone-400 font-sans pl-1">({Math.round((st.attendanceCount/st.totalClasses)*100)}%)</span>
                      </td>
                      {isSgeAdmin && (
                        <td className="py-3 px-4 text-right flex justify-end gap-1">
                          <button
                            onClick={() => {
                              setEditingStudent(st);
                              setStudentForm({
                                name: st.name,
                                age: st.age.toString(),
                                matricula: st.matricula || '',
                                turma: st.turma || 'Turma A',
                                course: st.course,
                                guardianName: st.guardianName || ''
                              });
                              setIsAddingStudent(true);
                            }}
                            className="p-1.5 text-emerald-700 hover:bg-emerald-50 rounded"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteStudentAction(st.id)}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                  {filteredStudentsList.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-stone-400 font-medium">Nenhum educando localizado para os parâmetros informados.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 3. MATÉRIAS (Disciplinas escolares) */}
        {activeSgeTab === 'subjects' && (
          <div className="space-y-6 text-left shrink-0" id="sge-subjects-tab">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-4 rounded-xl border border-stone-200 gap-3">
              <div>
                <h3 className="font-sans font-bold text-stone-900 text-base">Matérias e Disciplinas Ativas</h3>
                <p className="text-stone-500 text-xs">Instalação de matérias conectadas a professores responsáveis e turmas.</p>
              </div>
              {isSgeAdmin && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingSubject(null);
                    setSubjectForm({ name: '', description: '', teacherId: '', turma: 'Turma A' });
                    setIsAddingSubject(true);
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Plus className="h-4 w-4" /> Cadastrar Matéria
                </button>
              )}
            </div>

            {isAddingSubject && (
              <form onSubmit={handleSaveSubject} className="bg-white p-5 rounded-2xl border border-emerald-150/50 shadow-sm space-y-4 max-w-xl">
                <h4 className="font-bold text-xs uppercase tracking-wider text-emerald-850">{editingSubject ? 'Editar Matéria' : 'Cadastrar Matéria'}</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase block text-stone-500">Nome da Matéria</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Inglês Básico Instrumental"
                      value={subjectForm.name}
                      onChange={e => setSubjectForm({ ...subjectForm, name: e.target.value })}
                      className="w-full h-10 px-3 bg-stone-50 border border-stone-200 rounded-xl"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase block text-stone-500">Turma Designada</label>
                    <select
                      value={subjectForm.turma}
                      onChange={e => setSubjectForm({ ...subjectForm, turma: e.target.value })}
                      className="w-full h-10 px-2 bg-stone-50 border border-stone-200 rounded-xl font-sans"
                    >
                      <option value="Turma A">Turma A</option>
                      <option value="Turma B">Turma B</option>
                      <option value="Turma C">Turma C</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase block text-stone-500">Professor Docente Responsável</label>
                    <select
                      value={subjectForm.teacherId}
                      required
                      onChange={e => setSubjectForm({ ...subjectForm, teacherId: e.target.value })}
                      className="w-full h-10 px-2 bg-stone-50 border border-stone-200 rounded-xl font-sans"
                    >
                      <option value="">Selecione um docente...</option>
                      {schoolUsers.filter(u => u.role === 'professor' || u.role === 'super_admin').map(t => (
                        <option key={t.id} value={t.id}>{t.name} ({t.title || 'Docente'})</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase block text-stone-500">Descrição Curta</label>
                    <input
                      type="text"
                      placeholder="Ex: Foco em conversação prática"
                      value={subjectForm.description}
                      onChange={e => setSubjectForm({ ...subjectForm, description: e.target.value })}
                      className="w-full h-10 px-3 bg-stone-50 border border-stone-200 rounded-xl"
                    />
                  </div>
                </div>

                <div className="flex gap-2 justify-end pt-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setIsAddingSubject(false)}
                    className="px-3.5 py-2 bg-stone-100 text-stone-600 rounded-xl font-bold cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold cursor-pointer hover:bg-emerald-700 shadow-sm"
                  >
                    Salvar Matéria
                  </button>
                </div>
              </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="sge-subjects-grid">
              {allowedSubjects.map(sub => {
                const teacher = schoolUsers.find(u => u.id === sub.teacherId);
                const subAssessments = assessments.filter(a => a.subjectId === sub.id);
                const subLessons = lessons.filter(l => l.subjectId === sub.id);

                return (
                  <div key={sub.id} className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm space-y-4 hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500" />
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-start gap-2">
                        <span className="bg-emerald-50 text-emerald-800 border border-emerald-100 font-bold px-2.5 py-0.5 rounded text-[9px] uppercase tracking-wider">{sub.turma}</span>
                        {isSgeAdmin && (
                          <div className="flex gap-1">
                            <button
                              onClick={() => {
                                setEditingSubject(sub);
                                setSubjectForm({
                                  name: sub.name,
                                  description: sub.description || '',
                                  teacherId: sub.teacherId,
                                  turma: sub.turma
                                });
                                setIsAddingSubject(true);
                              }}
                              className="p-1 text-emerald-700 hover:bg-emerald-50 rounded"
                            >
                              <Edit3 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteSubjectAction(sub.id)}
                              className="p-1 text-red-500 hover:bg-red-50 rounded"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                      
                      <h4 className="font-sans font-black text-stone-900 text-md leading-tight">{sub.name}</h4>
                      <p className="text-stone-400 text-xs text-left min-h-[32px]">{sub.description || 'Sem descrição cadastrada.'}</p>
                    </div>

                    <div className="border-t border-stone-100 pt-3 space-y-2 text-xs">
                      <div className="flex items-center gap-2 text-stone-605">
                        <span className="text-stone-400">🧑‍🏫 Docente:</span>
                        <span className="font-bold text-stone-800">{teacher ? teacher.name : 'Indefinido'}</span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px] bg-stone-50 p-2 rounded-xl border border-stone-150 font-medium">
                        <div>
                          <span className="text-stone-400 block">Aulas dadas</span>
                          <span className="font-bold font-mono text-stone-850">{subLessons.length} aulas</span>
                        </div>
                        <div>
                          <span className="text-stone-400 block">Avaliações</span>
                          <span className="font-bold font-mono text-stone-850">{subAssessments.length} ativas</span>
                        </div>
                      </div>
                    </div>

                  </div>
                );
              })}
              {allowedSubjects.length === 0 && (
                <div className="col-span-full py-16 text-center text-stone-400 font-medium bg-white rounded-xl border border-stone-200">
                  <BookOpen className="h-8 w-8 text-stone-300 mx-auto mb-2" />
                  Nenhuma matéria vinculada encontrada para este perfil.
                </div>
              )}
            </div>
          </div>
        )}

        {/* 4. AULAS & CONTROLE DE FREQUÊNCIA CHAMADA */}
        {activeSgeTab === 'lessons' && (
          <div className="space-y-6 text-left" id="sge-lessons-tab">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-4 rounded-xl border border-stone-200 gap-3">
              <div>
                <h3 className="font-sans font-bold text-stone-900 text-base">Diários de Classe e Presença</h3>
                <p className="text-stone-500 text-xs">Abra novas aulas por data em suas matérias para fazer o controle de frequência (chamada).</p>
              </div>
              <button
                onClick={async () => {
                  if (allowedSubjects.length === 0) {
                    await alert('Por favor, primeiro registre alguma matéria ou tenha matérias sob sua regência vinculadas ao seu e-mail.', 'Matérias Não Encontradas', 'warn');
                    return;
                  }
                  setLessonForm({ subjectId: allowedSubjects[0].id, date: new Date().toISOString().split('T')[0], title: '', description: '', presentStudentIds: [] });
                  setIsAddingLesson(true);
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Plus className="h-4 w-4" /> Registrar Nova Aula
              </button>
            </div>

            {isAddingLesson && (
              <form onSubmit={handleSaveLesson} className="bg-white p-5 rounded-2xl border border-emerald-150/50 shadow-sm space-y-4 max-w-xl text-xs">
                <h4 className="font-bold text-xs uppercase tracking-wider text-emerald-850">Lançar Nova Aula no SGE</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase block text-stone-500">Matéria Relacionada</label>
                    <select
                      value={lessonForm.subjectId}
                      required
                      onChange={e => setLessonForm({ ...lessonForm, subjectId: e.target.value })}
                      className="w-full h-10 px-2 bg-stone-50 border border-stone-200 rounded-xl font-sans"
                    >
                      {allowedSubjects.map(sub => (
                        <option key={sub.id} value={sub.id}>{sub.name} ({sub.turma})</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase block text-stone-500">Data Letiva</label>
                    <input
                      type="date"
                      required
                      value={lessonForm.date}
                      onChange={e => setLessonForm({ ...lessonForm, date: e.target.value })}
                      className="w-full h-10 px-3 bg-stone-50 border border-stone-200 rounded-xl font-mono text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase block text-stone-500">Tópico / Título da Aula</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Introdução ao Simple Present Tense"
                    value={lessonForm.title}
                    onChange={e => setLessonForm({ ...lessonForm, title: e.target.value })}
                    className="w-full h-10 px-3 bg-stone-50 border border-stone-200 rounded-xl"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase block text-stone-500">Anotações da Agenda Escolar (Opcional)</label>
                  <input
                    type="text"
                    placeholder="Ex: Tarefa no livro impresso, capítulos 1 e 2."
                    value={lessonForm.description}
                    onChange={e => setLessonForm({ ...lessonForm, description: e.target.value })}
                    className="w-full h-10 px-3 bg-stone-50 border border-stone-200 rounded-xl"
                  />
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingLesson(false)}
                    className="px-3.5 py-2 bg-stone-100 text-stone-600 rounded-xl font-bold cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold cursor-pointer hover:bg-emerald-700 shadow-sm"
                  >
                    Abrir Aula
                  </button>
                </div>
              </form>
            )}

            {/* List of lessons and checking tool */}
            <div className="space-y-4">
              {lessons.filter(l => allowedSubjects.some(sub => sub.id === l.subjectId)).map(lesson => {
                const isExpanded = filterSubject === 'all' || filterSubject === lesson.subjectId;
                const subject = subjects.find(s => s.id === lesson.subjectId);
                if (!subject) return null;

                // Students in this specific turma
                const academicRoster = studentsList.filter(s => s.turma === subject.turma);

                return (
                  <div key={lesson.id} className="bg-white rounded-xl border border-stone-200 shadow-sm p-4 text-xs space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-stone-100 pb-3 gap-2">
                      <div className="space-y-1">
                        <span className="bg-emerald-50 text-emerald-850 border border-emerald-100 text-[9px] font-bold font-mono uppercase px-2 py-0.5 rounded tracking-wider">
                          {subject.turma} • {subject.name}
                        </span>
                        <h4 className="font-sans font-extrabold text-sm text-stone-900">{lesson.title}</h4>
                        <p className="text-stone-400 text-[11px]">{lesson.description || 'Sem descrição.'}</p>
                      </div>

                      <div className="text-left sm:text-right shrink-0">
                        <span className="text-[11px] font-mono text-emerald-800 bg-emerald-50/50 px-2 py-1 rounded font-bold">{lesson.date}</span>
                        <p className="text-stone-500 font-medium text-[11px] pt-1">Frequência: <span className="font-bold text-stone-800">{lesson.presentStudentIds.length}/{academicRoster.length} alunos</span></p>
                      </div>
                    </div>

                    {/* Attendance roster checklist */}
                    <div className="space-y-2 text-left">
                      <p className="font-mono text-[10px] uppercase font-bold text-stone-500 flex items-center justify-between">
                        <span>Lista de Chamada Geral:</span>
                        <span className="text-emerald-700">Clique para alternar (Verde = Presente • Cinza = Faltou)</span>
                      </p>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                        {academicRoster.map(student => {
                          const isPresent = lesson.presentStudentIds.includes(student.id);
                          return (
                            <button
                              key={student.id}
                              onClick={() => handleToggleAttendance(lesson, student.id)}
                              className={`p-2.5 rounded-xl border text-left transition-all duration-150 flex items-center justify-between cursor-pointer ${
                                isPresent 
                                  ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950 font-bold' 
                                  : 'bg-stone-50/60 border-stone-200 text-stone-400'
                              }`}
                            >
                              <div>
                                <p className="text-xs truncate max-w-[150px]">{student.name}</p>
                                <span className="text-[9px] font-mono opacity-80 block">{student.matricula}</span>
                              </div>
                              <div className={`p-1.5 rounded-lg border ${isPresent ? 'bg-emerald-600 border-emerald-555 text-white' : 'bg-white border-stone-300'}`}>
                                <CheckSquare className="h-3.5 w-3.5" />
                              </div>
                            </button>
                          );
                        })}
                        {academicRoster.length === 0 && (
                          <p className="text-stone-400 italic text-[11px]">Nenhum estudante matriculado na {subject.turma}.</p>
                        )}
                      </div>
                    </div>

                  </div>
                );
              })}
              {lessons.length === 0 && (
                <div className="py-12 bg-white text-center rounded-xl border border-stone-200 text-stone-400 font-medium text-xs">
                  Ainda não há diários de aula criados para chamada eletrônica neste portal.
                </div>
              )}
            </div>
          </div>
        )}

        {/* 5. LANÇAMENTO DE NOTAS */}
        {activeSgeTab === 'grades' && (
          <div className="space-y-6 text-left" id="sge-grades-tab">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-4 rounded-xl border border-stone-200 gap-3">
              <div>
                <h3 className="font-sans font-bold text-stone-900 text-base">Lançamento de Notas</h3>
                <p className="text-stone-500 text-xs">Selecione ou adicione avaliações com pesos para inserir as notas obtidas pelos estudantes de suas turmas.</p>
              </div>
              <button
                onClick={async () => {
                  if (allowedSubjects.length === 0) {
                    await alert('Nenhuma matéria sob sua regência no momento.', 'Acesso Indisponível', 'warn');
                    return;
                  }
                  setAssessmentForm({ subjectId: allowedSubjects[0].id, title: '', type: 'prova', weight: '1', maxScore: '10' });
                  setIsAddingAssessment(true);
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Plus className="h-4 w-4" /> Criar Avaliação (Prova/Trabalho)
              </button>
            </div>

            {isAddingAssessment && (
              <form onSubmit={handleSaveAssessment} className="bg-white p-5 rounded-2xl border border-emerald-150/50 shadow-sm space-y-4 max-w-xl text-xs">
                <h4 className="font-bold text-xs uppercase tracking-wider text-emerald-850">Cadastrar Nova Avaliação</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase block text-stone-500">Matéria Relacionada</label>
                    <select
                      value={assessmentForm.subjectId}
                      required
                      onChange={e => setAssessmentForm({ ...assessmentForm, subjectId: e.target.value })}
                      className="w-full h-10 px-2 bg-stone-50 border border-stone-200 rounded-xl font-sans"
                    >
                      {allowedSubjects.map(sub => (
                        <option key={sub.id} value={sub.id}>{sub.name} ({sub.turma})</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase block text-stone-500">Título / Nome</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Prova Semestral 1"
                      value={assessmentForm.title}
                      onChange={e => setAssessmentForm({ ...assessmentForm, title: e.target.value })}
                      className="w-full h-10 px-3 bg-stone-50 border border-stone-200 rounded-xl"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase block text-stone-500">Tipo de Avaliação</label>
                    <select
                      value={assessmentForm.type}
                      onChange={e => setAssessmentForm({ ...assessmentForm, type: e.target.value as any })}
                      className="w-full h-10 px-2 bg-stone-50 border border-stone-200 rounded-xl font-sans"
                    >
                      <option value="prova">📝 Prova</option>
                      <option value="trabalho">📂 Trabalho</option>
                      <option value="atividade">🙋 Atividade de Classe</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase block text-stone-500">Peso no SGE</label>
                    <input
                      type="number"
                      placeholder="Ex: 3"
                      value={assessmentForm.weight}
                      onChange={e => setAssessmentForm({ ...assessmentForm, weight: e.target.value })}
                      className="w-full h-10 px-3 bg-stone-50 border border-stone-200 rounded-xl"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase block text-stone-500">Nota Máxima</label>
                    <input
                      type="number"
                      placeholder="Max Ex: 10"
                      value={assessmentForm.maxScore}
                      onChange={e => setAssessmentForm({ ...assessmentForm, maxScore: e.target.value })}
                      className="w-full h-10 px-3 bg-stone-50 border border-stone-200 rounded-xl font-mono text-xs"
                    />
                  </div>
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingAssessment(false)}
                    className="px-3.5 py-2 bg-stone-100 text-stone-600 rounded-xl font-bold cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold cursor-pointer hover:bg-emerald-700 shadow-sm"
                  >
                    Salvar Avaliação
                  </button>
                </div>
              </form>
            )}

            {/* Assessment listing & dynamic scorecard table */}
            <div className="space-y-6">
              {allowedSubjects.map(sub => {
                const subAssessments = assessments.filter(a => a.subjectId === sub.id);
                const subStudents = studentsList.filter(s => s.turma === sub.turma);

                if (subAssessments.length === 0) return null;

                return (
                  <div key={sub.id} className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm text-xs space-y-4">
                    <div className="border-b border-stone-100 pb-2">
                      <span className="bg-emerald-50 text-emerald-850 px-2 py-0.5 rounded text-[9px] font-bold font-mono uppercase tracking-wider">{sub.turma}</span>
                      <h4 className="font-sans font-black text-stone-900 text-base mt-1">{sub.name}</h4>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-stone-550 border-b border-stone-150 text-[10px] font-mono uppercase tracking-wider text-stone-500">
                            <th className="py-2.5 px-3 text-left">Aluno ({subStudents.length})</th>
                            {subAssessments.map(ass => (
                              <th key={ass.id} className="py-2.5 px-3 text-center min-w-[120px]">
                                <span className="block font-bold truncate max-w-[130px]">{ass.title}</span>
                                <span className="block text-[9px] font-normal text-stone-400 capitalize hover:text-stone-700">{ass.type} • Peso: {ass.weight}</span>
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100">
                          {subStudents.map(student => (
                            <tr key={student.id} className="hover:bg-stone-500/5">
                              <td className="py-2.5 px-3 font-bold text-stone-900">{student.name}</td>
                              {subAssessments.map(ass => {
                                const currentGradeObj = grades.find(g => g.studentId === student.id && g.assessmentId === ass.id);
                                return (
                                  <td key={ass.id} className="py-2.5 px-3 text-center">
                                    <div className="inline-flex items-center gap-1.5 justify-center">
                                      <input
                                        type="number"
                                        step="0.1"
                                        min="0"
                                        max={ass.maxScore}
                                        placeholder={`0-${ass.maxScore}`}
                                        defaultValue={currentGradeObj ? currentGradeObj.score : ''}
                                        onBlur={(e) => handleSaveGradeEntry(student.id, ass.id, e.target.value)}
                                        className="w-16 h-8 bg-stone-50 border border-stone-200 rounded-lg text-center font-bold text-xs"
                                        id={`ip-${student.id}-${ass.id}`}
                                      />
                                      <span className="text-[10px] text-stone-400">/{ass.maxScore}</span>
                                    </div>
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                  </div>
                );
              })}
              {assessments.length === 0 && (
                <div className="py-12 bg-white text-center rounded-xl border border-stone-200 text-stone-400 font-medium text-xs font-mono">
                  Ainda não há avaliações criadas para o lançamento de notas. Use o botão acima para começar.
                </div>
              )}
            </div>
          </div>
        )}

        {/* 6. BOLETIM ESCOLAR PRE-VISUALIZATION */}
        {activeSgeTab === 'boletim' && (
          <div className="space-y-6 text-left" id="sge-boletim-tab">
            <div className="bg-white p-4 rounded-xl border border-stone-200 text-xs flex flex-wrap gap-4 items-center">
              <div>
                <label className="text-[10px] font-bold block uppercase text-stone-500">Selecione Estudante</label>
                <select
                  value={searchQuery} // use search filter as reactive driver
                  onChange={e => setSearchQuery(e.target.value)}
                  className="mt-1 h-9 px-3 border border-stone-200 bg-stone-50 rounded-xl"
                >
                  <option value="">-- Escolher Aluno --</option>
                  {studentsList.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.turma})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold block uppercase text-stone-500">Filtro Oficina/Matéria</label>
                <select
                  value={filterSubject}
                  onChange={e => setFilterSubject(e.target.value)}
                  className="mt-1 h-9 px-3 border border-stone-200 bg-stone-50 rounded-xl"
                >
                  <option value="all">Todas as Oficina / Matérias</option>
                  {subjects.map(sub => (
                    <option key={sub.id} value={sub.id}>{sub.name} ({sub.turma})</option>
                  ))}
                </select>
              </div>
            </div>

            {/* boletim layout generator */}
            {searchQuery ? (
              studentsList.filter(s => s.id === searchQuery).map(student => {
                
                // Active subjects matching student's class group
                const studentSubjects = subjects.filter(su => su.turma === student.turma && (filterSubject === 'all' || su.id === filterSubject));

                return (
                  <div key={student.id} className="bg-stone-50 rounded-3xl p-6 md:p-8 border border-stone-200 space-y-6 shadow-sm font-sans max-w-4xl mx-auto" id="printable-boletim-card">
                    
                    {/* Official Banner Header */}
                    <div className="border-b-2 border-stone-200 pb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-left">
                      <div className="space-y-1">
                        <h3 className="font-sans font-black text-emerald-800 text-lg sm:text-xl block leading-tight border-b border-stone-200 pb-1">CASA SANDRÍSSIMA • SGE</h3>
                        <p className="text-[10px] font-mono tracking-widest text-emerald-600 block uppercase font-bold">Boletim Escolar de Aproveitamento</p>
                        <p className="text-stone-400 text-[10px]">Gerado de forma automatizada via Banco de Dados Integrado.</p>
                      </div>

                      <div className="text-left md:text-right text-[11px] font-mono text-stone-500 bg-white p-3 rounded-2xl border border-stone-205">
                        <p><strong>Educando:</strong> {student.name}</p>
                        <p><strong>Turma:</strong> {student.turma}</p>
                        <p><strong>Matrícula:</strong> <span className="font-bold text-emerald-800">{student.matricula}</span></p>
                      </div>
                    </div>

                    {/* Report metrics details */}
                    <div className="space-y-4">
                      {studentSubjects.map(sub => {
                        const teacher = schoolUsers.find(u => u.id === sub.teacherId);
                        const report = calculateStudentAnalytics(student, sub.id);

                        return (
                          <div key={sub.id} className="bg-white rounded-2xl border border-stone-200 p-4 sm:p-5 shadow-sm space-y-4">
                            <div className="flex justify-between items-start border-b border-stone-100 pb-2 flex-wrap gap-2 text-left">
                              <div>
                                <h4 className="font-bold text-sm text-stone-900">{sub.name}</h4>
                                <p className="text-[10px] text-stone-400">Regente: {teacher ? teacher.name : 'Indefinido'}</p>
                              </div>

                              <div className="flex gap-2">
                                <span className="bg-stone-50 border border-stone-200 px-2 py-0.5 rounded font-mono text-[10px] text-stone-600">
                                  Frequência: {report.attendanceRate.toFixed(0)}% ({report.attendedLessonsCount}/{report.totalSubjectLessonsCount} Aulas)
                                </span>
                                <span className={`px-2.5 py-0.5 rounded text-[9px] uppercase font-bold text-white tracking-wide ${
                                  report.situation === 'Aprovado' ? 'bg-emerald-600' : 'bg-red-500'
                                }`}>
                                  {report.situation}
                                </span>
                              </div>
                            </div>

                            {/* Assessment metrics bullet listings */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                              {report.notesList.map((nt, index) => (
                                <div key={index} className="bg-stone-50 p-2 rounded-xl border border-stone-150 flex justify-between items-center text-[11px]">
                                  <div className="max-w-[140px] truncate pr-1.5">
                                    <span className="block font-semibold text-stone-850 truncate">{nt.title}</span>
                                    <span className="block text-[9px] text-stone-400 capitalize">{nt.type}</span>
                                  </div>
                                  <div className="text-right shrink-0">
                                    <span className={`font-mono font-bold text-xs ${nt.score >= 6.0 ? 'text-emerald-700' : 'text-red-500'}`}>
                                      {nt.score.toFixed(1)}
                                    </span>
                                    <span className="text-[9px] text-stone-400 font-mono">/{nt.maxScore}</span>
                                  </div>
                                </div>
                              ))}
                              {report.notesList.length === 0 && (
                                <p className="col-span-full py-2 text-center text-stone-400 italic text-[11px]">Sem notas lançadas para esta matéria.</p>
                              )}
                            </div>

                            {/* Score indicator averages */}
                            <div className="bg-stone-50 border-t border-stone-150 p-2.5 rounded-xl flex justify-between items-center text-[11px] font-medium leading-none font-mono">
                              <span className="text-stone-500 text-[10px]">MÉDIA FINAL PONDERADA:</span>
                              <span className={`text-sm font-extrabold ${report.averageScore >= 6.0 ? 'text-emerald-700' : 'text-red-650'}`}>
                                {report.averageScore.toFixed(1)} / 10
                              </span>
                            </div>

                          </div>
                        );
                      })}
                      {studentSubjects.length === 0 && (
                        <p className="text-stone-400 text-center py-5 italic bg-white rounded-xl border">Sem matérias escolares vinculadas nesta Turma.</p>
                      )}
                    </div>

                    <div className="bg-white p-3 border border-red-100 rounded-2xl text-[10.5px] text-stone-500 text-center space-y-1 font-medium leading-normal">
                      <p className="font-bold text-red-700">⚠️ Resumo de Regras para Situação de Aprovação (Aproveitamento Escolar):</p>
                      <p>Frequência Mínima Exigida: <strong>75%</strong> das aulas dadas. Média Final para Aprovação por Nota: <strong>6.0</strong>.</p>
                    </div>

                  </div>
                );
              })
            ) : (
              <div className="py-16 bg-white border border-stone-200 rounded-2xl text-center text-stone-400 text-xs font-medium">
                Selecione um educando na lista suspensa acima para gerar o boletim com notas e frequência em tempo real.
              </div>
            )}
          </div>
        )}

        {/* 7. ASSOCIADOS & LOGS DO BANCO */}
        {activeSgeTab === 'associates' && isSgeAdmin && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left" id="sge-associates-tab">
            {/* Associates column */}
            <div className="lg:col-span-6 bg-white p-5 rounded-xl border border-stone-200 shadow-sm space-y-4">
              <div>
                <h3 className="font-sans font-bold text-stone-900 text-base">Associados Cadastrados</h3>
                <p className="text-stone-500 text-xs">Apoiadores do plano social Casa Sandríssima.</p>
              </div>
              <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1">
                {associatesList.map(as => (
                  <div key={as.id} className="p-3 bg-stone-50 border border-stone-205 rounded-xl text-xs flex justify-between items-start">
                    <div className="space-y-1">
                      <span className="text-[9px] font-mono bg-stone-200 text-stone-700 px-2 py-0.5 rounded font-bold uppercase">{as.role}</span>
                      <h4 className="font-bold text-stone-900 pt-1">{as.name}</h4>
                      <p className="text-stone-500 leading-tight">✉️ {as.email} • 📞 {as.phone}</p>
                    </div>
                    <button
                      onClick={() => onRemoveAssociate(as.id)}
                      className="p-1 hover:bg-red-50 text-red-500 rounded border border-transparent hover:border-red-100 cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Donation records column */}
            <div className="lg:col-span-6 bg-white p-5 rounded-xl border border-stone-200 shadow-sm space-y-4">
              <div>
                <h3 className="font-sans font-bold text-stone-900 text-base">Atas de Doações Registradas</h3>
                <p className="text-stone-500 text-xs">Arrecadações de fundos solidários, mantimentos ou roupas.</p>
              </div>
              <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1">
                {donationsList.map(don => (
                  <div key={don.id} className="p-3 bg-stone-50 border border-stone-205 rounded-xl">
                    <div className="flex justify-between items-start text-xs">
                      <div>
                        <p className="font-bold text-stone-900">{don.donorName}</p>
                        <p className="text-stone-500 text-[10.5px]">{don.description}</p>
                        <p className="text-[9.5px] text-stone-400 font-mono mt-0.5">{don.date}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="bg-orange-50 border border-orange-100 text-orange-900 px-1.5 py-0.5 rounded text-[9px] uppercase font-bold font-mono">{don.type}</span>
                        {don.amount && <p className="font-black text-stone-900 text-sm mt-1">R$ {don.amount}</p>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 9. PAINEL FINANCEIRO SGE (Exclusivo Master) */}
        {activeSgeTab === 'finance' && isSuperAdmin && (
          <div className="space-y-6 text-left" id="sge-finance-tab">
            {/* Header decor banner */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-6 text-white shadow-lg space-y-2 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full translate-x-32 -translate-y-16 pointer-events-none" />
              <div className="absolute bottom-0 right-1/4 w-32 h-32 bg-white/5 rounded-full pointer-events-none" />
              <div className="flex items-center gap-2.5">
                <Shield className="h-5 w-5 bg-white/10 p-1 rounded-lg text-emerald-100" />
                <span className="text-[10px] font-mono tracking-widest uppercase bg-white/10 text-emerald-100 px-2 py-0.5 rounded font-black">Módulo de Auditoria Geral</span>
              </div>
              <h3 className="font-sans font-black text-2xl tracking-tight">Consolidação Financeira e Doações</h3>
              <p className="text-emerald-100 text-xs max-w-xl">
                Ferramenta de controle exclusivo do perfil <strong>Master</strong> para monitoramento central de doações monetárias (Pix) e suprimentos recebidos através do site.
              </p>
            </div>

            {/* Quick KPIs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-stone-150 shadow-sm space-y-2 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-mono font-bold tracking-wider text-stone-400 uppercase block leading-none">Total Arrecado via Site</span>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className="text-xl font-bold font-mono text-emerald-600">R$</span>
                    <span className="text-3xl font-black text-stone-900 tracking-tight">
                      {donationsList.reduce((sum, d) => sum + (d.amount || 0), 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
                <div className="pt-2 text-[10px] text-stone-500 border-t border-stone-100 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 text-emerald-500" />
                  <span>Soma líquida de transações de Pix</span>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-stone-150 shadow-sm space-y-2 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-mono font-bold tracking-wider text-stone-400 uppercase block leading-none">Apoios Financeiros Únicos (Pix)</span>
                  <div className="mt-2 text-3xl font-black text-stone-900 tracking-tight flex items-baseline gap-1">
                    <span>{donationsList.filter(d => d.type === 'pix').length}</span>
                    <span className="text-xs text-stone-400 font-medium">unidades</span>
                  </div>
                </div>
                <div className="pt-2 text-[10px] text-stone-500 border-t border-stone-100 block">
                  Tíquete médio: <strong>R$ {
                    donationsList.filter(d => d.type === 'pix').length > 0
                      ? Math.round(donationsList.reduce((sum, d) => sum + (d.amount || 0), 0) / donationsList.filter(d => d.type === 'pix').length).toLocaleString('pt-BR')
                      : '0'
                  }</strong> por repasse
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-stone-150 shadow-sm space-y-2 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-mono font-bold tracking-wider text-stone-400 uppercase block leading-none">Doações de Suprimentos</span>
                  <div className="mt-2 text-3xl font-black text-emerald-600 tracking-tight flex items-baseline gap-1">
                    <span>{donationsList.filter(d => d.type !== 'pix').length}</span>
                    <span className="text-xs text-stone-400 font-medium">doações</span>
                  </div>
                </div>
                <div className="pt-2 text-[10px] text-stone-500 border-t border-stone-100">
                  Vestuário, alimentos e outros insumos
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-stone-150 shadow-sm space-y-2 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-mono font-bold tracking-wider text-stone-400 uppercase block leading-none">Taxa de Conversão por Visitante</span>
                  <div className="mt-2 text-3xl font-black text-teal-600 tracking-tight flex items-baseline gap-1">
                    <span>{((donationsList.length / Math.max(associatesList.length, 1)) * 100).toFixed(0)}%</span>
                  </div>
                </div>
                <div className="pt-2 text-[10px] text-stone-500 border-t border-stone-100">
                  Donatários por Amigos da Associação
                </div>
              </div>
            </div>

            {/* Custom SVG Graphical Overview Box */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              {/* Financial progress chart area */}
              <div className="lg:col-span-8 bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex flex-col justify-between space-y-4">
                <div>
                  <h4 className="font-sans font-bold text-stone-900 text-sm">Flutuação de Captação / Arrecadação por Mês</h4>
                  <p className="text-stone-500 text-xs">Acompanhamento dos recursos financeiros arrecadados ao longo do ano corrente.</p>
                </div>

                {/* Main Custom Interactive SVG chart */}
                <div className="h-64 w-full bg-stone-50 flex items-end justify-between p-4 rounded-xl border border-stone-100 flex-row gap-2 relative">
                  {/* Grid Lines backgrounds */}
                  <div className="absolute inset-0 flex flex-col justify-between p-4 pointer-events-none text-[8px] font-mono text-stone-300">
                    <div className="border-b border-stone-200/50 w-full pt-1">R$ {Math.max(...[...donationsList.filter(d => d.type === 'pix').map(d => d.amount || 0), 100].map(v => Number(v))).toLocaleString()}</div>
                    <div className="border-b border-stone-200/30 w-full">R$ {Math.round(Math.max(...[...donationsList.filter(d => d.type === 'pix').map(d => d.amount || 0), 100].map(v => Number(v))) * 0.5).toLocaleString()}</div>
                    <div className="w-full">R$ 0</div>
                  </div>

                  {(() => {
                    const monthlyData: { [key: string]: number } = {};
                    donationsList.forEach(d => {
                      if (d.type === 'pix') {
                        // Safe parse date month format
                        let monthLabel = 'Outro';
                        if (d.date.includes('/')) {
                          const parts = d.date.split('/');
                          const monthsMap: { [key: string]: string } = {
                            '01': 'Jan', '02': 'Fev', '03': 'Mar', '04': 'Abr', '05': 'Mai', '06': 'Jun',
                            '07': 'Jul', '08': 'Ago', '09': 'Set', '10': 'Out', '11': 'Nov', '12': 'Dez'
                          };
                          monthLabel = monthsMap[parts[1]] || 'Outro';
                        } else if (d.date.includes('-')) {
                          const parts = d.date.split('-');
                          const monthsMap: { [key: string]: string } = {
                            '01': 'Jan', '02': 'Fev', '03': 'Mar', '04': 'Abr', '05': 'Mai', '06': 'Jun',
                            '07': 'Jul', '08': 'Ago', '09': 'Set', '10': 'Out', '11': 'Nov', '12': 'Dez'
                          };
                          monthLabel = monthsMap[parts[1]] || 'Outro';
                        }
                        monthlyData[monthLabel] = (monthlyData[monthLabel] || 0) + (d.amount || 0);
                      }
                    });

                    // List standard ordered labels
                    const monthsOrder = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
                    const dataPoints = monthsOrder
                      .map(lbl => ({ label: lbl, value: monthlyData[lbl] || 0 }))
                      .filter(dp => dp.value > 0 || donationsList.length === 0);

                    const activePoints = dataPoints.length > 0 ? dataPoints : [
                      { label: 'Jan', value: 0 }, { label: 'Fev', value: 0 }, { label: 'Mar', value: 0 },
                      { label: 'Abr', value: 0 }, { label: 'Mai', value: 120 }, { label: 'Jun', value: 0 }
                    ];

                    const peakVal = Math.max(...activePoints.map(p => p.value), 100);

                    return activePoints.map((pt, i) => {
                      const pct = (pt.value / peakVal) * 100;
                      return (
                        <div key={i} className="flex-1 flex flex-col items-center group z-10 h-full justify-end">
                          <div className="w-full max-w-[42px] bg-emerald-600/10 group-hover:bg-emerald-600/20 rounded-t-lg transition-all duration-300 relative flex justify-center items-end" style={{ height: `${Math.max(pct, 5)}%` }}>
                            {/* Colorful solid core line bar */}
                            <div className="w-full bg-gradient-to-t from-emerald-600 to-teal-500 rounded-t-lg hover:brightness-110 transition-all" style={{ height: '90%' }} />

                            {/* Hover label tooltip */}
                            <div className="absolute -top-10 scale-0 group-hover:scale-100 bg-stone-900 text-white text-[9px] font-mono font-bold py-1 px-2 rounded shadow-md pointer-events-none transition-transform z-20 whitespace-nowrap">
                              R$ {pt.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </div>
                          </div>
                          <span className="text-[9px] font-mono uppercase tracking-wider text-stone-500 mt-2 font-bold">{pt.label}</span>
                        </div>
                      );
                    });
                  })()}
                </div>

                <div className="text-[10.5px] text-stone-500 flex items-center justify-between font-medium">
                  <span>📊 Escala gráfica ajustada automaticamente pelo teto recebido.</span>
                  <span className="text-emerald-700 font-bold block">Meta Semestral SGE: R$ 5.000,00</span>
                </div>
              </div>

              {/* Pie categories progress track */}
              <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-4">
                <div>
                  <h4 className="font-sans font-bold text-stone-900 text-sm">Doações por Categoria</h4>
                  <p className="text-stone-500 text-xs">Vetorização percentual por modalidade de apoio voluntário e donativos.</p>
                </div>

                <div className="space-y-4 pt-2">
                  {[
                    { label: 'Apoio Financeiro (Pix)', type: 'pix', color: 'bg-emerald-600', text: 'text-emerald-700' },
                    { label: 'Doação de Alimentos/Cestas', type: 'food', color: 'bg-orange-500', text: 'text-orange-700' },
                    { label: 'Campanha de Roupas', type: 'clothing', color: 'bg-blue-500', text: 'text-blue-700' },
                    { label: 'Outros Donativos Especiais', type: 'other', color: 'bg-purple-500', text: 'text-purple-700' }
                  ].map((catItem, idx) => {
                    const count = donationsList.filter(d => d.type === catItem.type).length;
                    const percent = donationsList.length > 0 ? (count / donationsList.length) * 100 : 0;
                    return (
                      <div key={idx} className="space-y-1 text-xs">
                        <div className="flex justify-between items-center text-stone-700 font-bold">
                          <span>{catItem.label}</span>
                          <span className={catItem.text}>{count} ({percent.toFixed(0)}%)</span>
                        </div>
                        <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                          <div className={`h-full ${catItem.color} rounded-full transition-all duration-500`} style={{ width: `${percent}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-[10px] text-emerald-950 text-center leading-relaxed font-semibold">
                  🌿 <em>Doações físicas recebidas são devidamente auditadas pelo portal para destinação no bazar voluntário.</em>
                </div>
              </div>
            </div>

            {/* Manual Registerer and Historico Section */}
            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h4 className="font-sans font-bold text-stone-900 text-base">Atas de Financeiro Recebido Geral</h4>
                  <p className="text-stone-500 text-xs">Gerencie e anote os repasses originados pelo site ou via fomento bazar presencial.</p>
                </div>

                <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setIsAddingManualDonation(!isAddingManualDonation)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Plus className="h-4 w-4" /> Novo Lançamento Manual
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      const headers = "ID,Doador,Valor(R$),Canal,Data,Descrição\n";
                      const rows = donationsList.map(d => 
                        `"${d.id}","${d.donorName || ''}",${d.amount || 0},"${d.type}","${d.date}","${d.description || ''}"`
                      ).join("\n");
                      navigator.clipboard.writeText(headers + rows);
                      await alert("Histórico de doações CSV copiado com sucesso para sua Área de Transferência!", "Relatório Exportado", "success");
                    }}
                    className="px-4 py-2 border border-stone-250 hover:bg-stone-50 text-stone-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <FileText className="h-4 w-4" /> Exportar Planilha (CSV)
                  </button>
                </div>
              </div>

              {/* Form Manual Registry */}
              {isAddingManualDonation && (
                <form onSubmit={handleAddManualDonationSubmit} className="bg-gradient-to-br from-emerald-50/40 to-white border border-emerald-150 rounded-2xl p-5 text-xs space-y-4">
                  <div className="flex justify-between items-center border-b border-emerald-100 pb-2 mb-1">
                    <p className="font-bold text-emerald-950 text-xs flex items-center gap-2">📝 Lançar Doação Direta no Caixa Principal</p>
                    <button type="button" onClick={() => setIsAddingManualDonation(false)} className="text-stone-400 hover:text-stone-900 font-bold">Fechar</button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold font-mono text-emerald-800 uppercase">Nome do Doador</label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: Doação Anônima"
                        value={manualDonationForm.donorName}
                        onChange={e => setManualDonationForm({ ...manualDonationForm, donorName: e.target.value })}
                        className="w-full h-10 px-3 bg-white border border-stone-200 rounded-xl focus:outline-emerald-500 text-stone-800"
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold font-mono text-emerald-800 uppercase">Categoria</label>
                      <select
                        value={manualDonationForm.type}
                        onChange={e => setManualDonationForm({ ...manualDonationForm, type: e.target.value as any })}
                        className="w-full h-10 px-3 bg-white border border-stone-200 rounded-xl font-sans text-stone-800"
                      >
                        <option value="pix">Pix (Fomento Financeiro)</option>
                        <option value="clothing">Doação de Vestuários</option>
                        <option value="food">Doação de Alimentos</option>
                        <option value="other">Outros Importes</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold font-mono text-emerald-800 uppercase">Valor Financeiro (Apenas para Pix)</label>
                      <input
                        type="number"
                        disabled={manualDonationForm.type !== 'pix'}
                        placeholder="Ex: 50.00"
                        value={manualDonationForm.amount}
                        onChange={e => setManualDonationForm({ ...manualDonationForm, amount: e.target.value })}
                        className="w-full h-10 px-3 bg-white border border-stone-200 rounded-xl disabled:bg-stone-50 disabled:text-stone-400 font-mono text-stone-800"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold font-mono text-emerald-800 uppercase">Data do Recebimento</label>
                      <input
                        type="date"
                        required
                        value={manualDonationForm.date}
                        onChange={e => setManualDonationForm({ ...manualDonationForm, date: e.target.value })}
                        className="w-full h-10 px-3 bg-white border border-stone-200 rounded-xl font-mono text-stone-800"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold font-mono text-emerald-800 uppercase">Observações / Detalhamento</label>
                    <input
                      type="text"
                      placeholder="Ex: Arrecadado na feira cultural comunitária da sandríssima"
                      value={manualDonationForm.description}
                      onChange={e => setManualDonationForm({ ...manualDonationForm, description: e.target.value })}
                      className="w-full h-10 px-3 bg-white border border-stone-200 rounded-xl text-stone-800"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsAddingManualDonation(false)}
                      className="px-4 py-2 border border-stone-200 hover:bg-stone-50 rounded-xl text-stone-600 font-semibold cursor-pointer text-xs"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-all cursor-pointer shadow-sm text-xs"
                    >
                      Salvar Lançamento no Caixa
                    </button>
                  </div>
                </form>
              )}

              {donationSuccessMsg && (
                <div className="bg-emerald-50 border border-emerald-150 text-emerald-800 p-3 rounded-xl text-xs font-bold text-center">
                  {donationSuccessMsg}
                </div>
              )}

              {/* Filters for listings */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-grow">
                  <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-stone-400" />
                  <input
                    type="text"
                    placeholder="Filtrar por nome do doador/parceiro..."
                    value={financeSearch}
                    onChange={e => setFinanceSearch(e.target.value)}
                    className="w-full h-11 pl-10 pr-4 bg-stone-50 border border-stone-200 rounded-xl text-xs"
                  />
                </div>

                <div className="w-full sm:w-48">
                  <select
                    value={financeTypeFilter}
                    onChange={e => setFinanceTypeFilter(e.target.value)}
                    className="w-full h-11 px-3 bg-stone-50 border border-stone-200 rounded-xl text-xs font-sans"
                  >
                    <option value="all">Todas as Categorias</option>
                    <option value="pix">Pix (Fomento Financeiro)</option>
                    <option value="food">Alimentos</option>
                    <option value="clothing">Vestuários</option>
                    <option value="other">Outros</option>
                  </select>
                </div>
              </div>

              {/* Historical Listing Table */}
              <div className="border border-stone-150 rounded-2xl overflow-hidden shadow-inner max-h-[480px] overflow-y-auto w-full">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase font-mono text-[9px] tracking-wider text-left">
                      <th className="py-3 px-4">Apoiador</th>
                      <th className="py-3 px-4">Canal / Recurso</th>
                      <th className="py-3 px-4">Data</th>
                      <th className="py-3 px-4">Comentário / Depoimento</th>
                      <th className="py-3 px-4">Status no Mural</th>
                      <th className="py-3 px-4 text-right">Ação / Controles</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-105">
                    {donationsList
                      .filter(d => {
                        const mSearch = d.donorName.toLowerCase().includes(financeSearch.toLowerCase());
                        const mType = financeTypeFilter === 'all' || d.type === financeTypeFilter;
                        return mSearch && mType;
                      })
                      .map((don) => (
                        <tr key={don.id} className="hover:bg-stone-50/70 transition-colors">
                          <td className="py-3 px-4 font-bold text-stone-900">{don.donorName}</td>
                          <td className="py-3 px-4">
                            <div className="flex flex-col gap-0.5">
                              <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase border w-fit ${
                                don.type === 'pix' ? 'bg-emerald-50 border-emerald-100 text-emerald-850' :
                                don.type === 'food' ? 'bg-orange-50 border-orange-100 text-orange-905' :
                                don.type === 'clothing' ? 'bg-blue-50 border-blue-105 text-blue-805' :
                                'bg-purple-50 border-purple-100 text-purple-805'
                              }`}>
                                {don.type === 'pix' ? 'Fomento Pix' : don.type === 'food' ? 'Alimento' : don.type === 'clothing' ? 'Vestuário' : 'Outro'}
                              </span>
                              {don.type === 'pix' && don.amount && (
                                <span className="font-bold text-emerald-700 font-mono text-[11px] block mt-0.5">
                                  R$ {don.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-stone-500 font-mono text-[10px]">{don.date}</td>
                          <td className="py-3 px-4 text-stone-600 max-w-xs break-words font-sans italic">
                            "{don.description || '(Sem recado/comentário)'}"
                          </td>
                          <td className="py-3 px-4">
                            <span className={`inline-block px-2.5 py-1 rounded-full font-bold text-[9px] font-mono uppercase tracking-wide border ${
                              don.approved === true 
                                ? 'bg-emerald-50 border-emerald-100 text-emerald-800' 
                                : 'bg-amber-50 border-amber-100 text-amber-800'
                            }`}>
                              {don.approved === true ? '✓ Exibido' : '⏳ Pendente'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                            <button
                               type="button"
                               onClick={async () => {
                                 try {
                                   const updated = { ...don, approved: !don.approved };
                                   await updateDonation(updated);
                                 } catch (error) {
                                   await alert("Falha ao alterar status da mensagem.", "Erro de Curação", "error");
                                 }
                               }}
                              className={`px-2 py-1 text-[10px] font-bold uppercase rounded border transition-colors cursor-pointer inline-flex items-center gap-1 ${
                                don.approved === true
                                  ? 'bg-stone-100 hover:bg-stone-200 text-stone-600 border-stone-200'
                                  : 'bg-emerald-600 hover:bg-emerald-700 text-white border-transparent shadow-sm'
                              }`}
                              title={don.approved === true ? "Ocultar do Mural público" : "Aprovar para o Mural público"}
                            >
                              {don.approved === true ? 'Ocultar' : 'Aprovar'}
                            </button>

                            <button
                              type="button"
                              onClick={async () => {
                                const isConfirmed = await confirm(`Deseja realmente remover o registro financeiro de ${don.donorName}?`, "Remover Doação", "warn");
                                if (isConfirmed) {
                                  try {
                                    await deleteDonation(don.id);
                                  } catch (error) {
                                    await alert("Falha ao deletar doação.", "Erro ao Deletar", "error");
                                  }
                                }
                              }}
                              className="p-1 hover:bg-red-50 text-red-500 rounded border border-transparent hover:border-red-105 cursor-pointer inline-flex items-center text-center justify-center"
                              title="Deletar Lançamento"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}

                    {donationsList.filter(d => {
                      const mSearch = d.donorName.toLowerCase().includes(financeSearch.toLowerCase());
                      const mType = financeTypeFilter === 'all' || d.type === financeTypeFilter;
                      return mSearch && mType;
                    }).length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-stone-400 font-semibold">Nenhum lançamento encontrado para os filtros ativos.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 8. OUVIDORIA DE MENSAGENS LIST */}
        {activeSgeTab === 'messages' && isSgeAdmin && (
          <div className="bg-white p-5 rounded-2xl border border-stone-200 text-left space-y-5" id="sge-messages-tab">
            <div>
              <h3 className="font-sans font-bold text-stone-900 text-base">Ouvidoria de Sugestões & Feedback</h3>
              <p className="text-stone-500 text-xs">Aprecie propostas oficiais submetidas por associados e voluntários inscritos.</p>
            </div>

            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1 select-none text-xs">
              {messages.map((m) => (
                <div key={m.id} className="border border-stone-200 rounded-2xl p-4 md:p-5 bg-stone-50/40 space-y-4">
                  <div className="flex justify-between items-start border-b border-stone-105 pb-2">
                    <div>
                      <h4 className="font-bold text-stone-850">{m.senderName}</h4>
                      <span className="text-[10px] text-stone-400">{m.senderEmail}</span>
                    </div>
                    <span className="text-[10px] text-stone-450 font-mono">{new Date(m.createdAt).toLocaleDateString()}</span>
                  </div>

                  <p className="text-stone-700 italic text-xs select-text">"{m.message}"</p>

                  {/* respond block */}
                  {m.response ? (
                    <div className="bg-emerald-50 border border-emerald-150 rounded-xl p-3 text-emerald-800 space-y-1">
                      <p className="font-bold flex items-center gap-1.5">
                        <CheckCircle className="h-4 w-4 text-emerald-600" />
                        Respondido em {m.respondedAt ? new Date(m.respondedAt).toLocaleDateString() : 'N/A'}:
                      </p>
                      <p className="leading-relaxed text-stone-700 italic">"{m.response}"</p>
                    </div>
                  ) : (
                    <div className="space-y-2 pt-2">
                      <label className="text-[10px] font-bold uppercase font-mono text-stone-500 block">Escrever Resposta da Diretoria</label>
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          placeholder="Digite aqui e clique no botão para emitir a resposta oficial..."
                          value={responseTexts[m.id] || ''}
                          onChange={(e) => setResponseTexts(prev => ({ ...prev, [m.id]: e.target.value }))}
                          className="flex-grow h-10 px-3 bg-white border border-stone-200 rounded-xl font-sans"
                        />
                        <button
                          onClick={() => handleAdminRespond(m.id)}
                          className="h-10 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                        >
                          <Send className="h-3.5 w-3.5" /> Responder
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {messages.length === 0 && (
                <p className="py-12 text-center text-stone-400 font-medium">Nenhuma sugestão registrada na Ouvidoria.</p>
              )}
            </div>
          </div>
        )}

      </div>
    );
  }

  // PORTAL REGULAR ASSOCIATE INTERFACE (LOGGED IN VIA GOOGLE)
  return (
    <div className="space-y-6 text-left" id="portal-regular-dashboard">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-5 rounded-2xl border border-stone-200/80 shadow-md gap-4">
        <div className="flex items-center gap-4">
          {user.photoURL ? (
            <img src={user.photoURL} alt={user.displayName || 'Avatar'} className="h-14 w-14 rounded-full border-2 border-emerald-500 shadow-sm" referrerPolicy="no-referrer" />
          ) : (
            <div className="bg-emerald-50 text-emerald-600 p-3 rounded-full shrink-0">
              <UserIcon className="h-8 w-8" />
            </div>
          )}
          <div>
            <span className={`inline-block text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold tracking-wider ${
              isAssociate ? 'bg-emerald-100 text-emerald-950 border border-emerald-200' : 'bg-stone-100 text-stone-700'
            }`}>
              {isAssociate ? '🤝 MEMBRO APOIADOR DA CASA' : '👤 USUÁRIO LOGADO'}
            </span>
            <h2 className="font-sans font-extrabold text-xl text-stone-905">{user.displayName || 'Usuário'}</h2>
            <p className="text-stone-400 text-xs">{user.email}</p>
          </div>
        </div>
        
        <button 
          onClick={handleLogout}
          className="px-4 py-2 border border-red-200 hover:bg-red-50 text-red-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <LogOut className="h-4 w-4" /> Terminar Sessão
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left associative profile box */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-6">
          {isAssociate ? (
            <div className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl flex items-start gap-3">
                <HandHeart className="h-6 w-6 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-sans font-extrabold text-sm text-emerald-800">Associação Ativa!</h3>
                  <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                    Sua conta está associada como Membro Oficial. Sua contribuição fortalece nosso compromisso com a comunidade da Casa Sandríssima!
                  </p>
                </div>
              </div>

              <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 text-xs space-y-2">
                <p className="font-semibold text-stone-700">Seu Cadastro de Apoiador:</p>
                {associatesList.filter(a => a.email.toLowerCase() === user.email?.toLowerCase()).map(a => (
                  <div key={a.id} className="space-y-1.5">
                    <p><strong>Nome:</strong> {a.name}</p>
                    <p><strong>Papel:</strong> {a.role}</p>
                    <p><strong>Telefone:</strong> {a.phone}</p>
                    <p><strong>Cadastrado em:</strong> {a.joinedAt}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <div>
                <h3 className="font-sans font-black text-lg text-stone-900">Oficialize sua Associação</h3>
                <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                  Ainda não identificamos seu e-mail do Google em nosso cadastro de apoiadores. Complete seu perfil para participar da ouvidoria de propostas.
                </p>
              </div>

              {registerSuccess ? (
                <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 p-4 rounded-xl text-center space-y-2">
                  <CheckCircle className="h-8 w-8 text-emerald-600 mx-auto" />
                  <h4 className="font-extrabold text-xs uppercase tracking-wider">Vínculo Criado!</h4>
                  <p className="text-xs text-stone-600">Sua associação foi registrada com sucesso sob seu perfil e-mail.</p>
                </div>
              ) : (
                <form onSubmit={handleQuickRegisterAssociate} className="space-y-4" id="associate-quick-join-form">
                  <div className="space-y-1">
                    <label className="text-xs font-bold font-mono text-stone-600 block uppercase">WhatsApp / Celular</label>
                    <input 
                      type="text" 
                      required
                      placeholder="Ex: (16) 99321-4455"
                      value={associateForm.phone}
                      onChange={(e) => setAssociateForm({ ...associateForm, phone: e.target.value })}
                      className="w-full h-10 px-3 bg-white border border-stone-200 rounded-xl text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-stone-600">Categoria</label>
                      <select
                        value={associateForm.role}
                        onChange={(e) => setAssociateForm({ ...associateForm, role: e.target.value as any })}
                        className="w-full h-10 px-2 bg-white border border-stone-200 rounded-xl font-sans"
                      >
                        <option value="Voluntário">Voluntário</option>
                        <option value="Apoiador">Apoiador Geral</option>
                        <option value="Doador Regular">Doador Regular</option>
                      </select>
                    </div>

                    {associateForm.role === 'Doador Regular' && (
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-stone-600">Recorrência</label>
                        <select
                          value={associateForm.contributionType}
                          onChange={(e) => setAssociateForm({ ...associateForm, contributionType: e.target.value as any })}
                          className="w-full h-10 px-2 bg-white border border-stone-200 rounded-xl font-sans"
                        >
                          <option value="mensal">Mensal</option>
                          <option value="anual">Anual</option>
                          <option value="ocasional">Ocasional</option>
                        </select>
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isRegisteringAssociate}
                    className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs uppercase cursor-pointer"
                  >
                    Confirmar Associação
                  </button>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Right suggestions/ouvidoria board */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-6">
          <div>
            <h3 className="font-sans font-black text-lg text-stone-900 flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-emerald-600" />
              Fale Conosco & Ouvidoria
            </h3>
            <p className="text-stone-400 text-xs mt-1">
              Envie propostas de eventos, peça esclarecimentos sobre andamentos ou dê sugestões construtivas para a nossa ONG de forma autenticada.
            </p>
          </div>

          <form onSubmit={handleUserAddMessage} className="space-y-3" id="suggestion-submit-form">
            <label className="text-xs font-bold font-mono text-stone-600 block uppercase">Sua Nova Mensagem</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                required
                placeholder="Ex prime: Proposta de feira cultural para julho..."
                value={feedbackInput}
                onChange={(e) => setFeedbackInput(e.target.value)}
                className="flex-grow h-11 px-3.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
              <button
                type="submit"
                disabled={isSendingMessage || !feedbackInput.trim()}
                className="h-11 px-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-md"
              >
                {isSendingMessage ? 'Enviando...' : 'Enviar'}
              </button>
            </div>
          </form>

          <div className="border-t border-stone-100 pt-4 space-y-4">
            <h4 className="font-sans font-bold text-stone-850 text-xs uppercase tracking-wider">Suas Mensagens de Ouvidoria ({messages.length})</h4>
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
              {messages.map((m) => (
                <div key={m.id} className="p-4 bg-stone-50 border border-stone-150 rounded-xl text-xs space-y-2 select-text">
                  <div className="flex justify-between text-[10px] text-stone-400">
                    <span>Submetido para Coordenação</span>
                    <span>{new Date(m.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="font-medium text-stone-700">"{m.message}"</p>
                  {m.response ? (
                    <div className="bg-emerald-50 text-emerald-800 p-2.5 rounded-lg text-[11px] leading-relaxed border border-emerald-100">
                      <p className="font-bold">Resposta Oficial:</p>
                      <p className="italic">"{m.response}"</p>
                    </div>
                  ) : (
                    <p className="text-[10px] text-stone-400 italic font-mono uppercase">Aguardando análise da Coordenação...</p>
                  )}
                </div>
              ))}
              {messages.length === 0 && (
                <p className="text-stone-400 text-xs italic">Você ainda não submeteu mensagens para a ouvidoria.</p>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

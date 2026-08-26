import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc as firestoreSetDoc, 
  collection, 
  onSnapshot, 
  query, 
  where,
  getDocs,
  deleteDoc
} from 'firebase/firestore';
import { 
  auth, 
  db, 
  handleFirestoreError, 
  OperationType, 
  signInWithSocial, 
  signInWithGoogle,
  signInWithFacebook,
  signInWithMicrosoft,
  signInWithEmail,
  signUpWithEmail,
  sendPasswordReset,
  logoutUser 
} from './firebase';
import { Student, Associate, Donation, SchoolUser, Subject, Lesson, Assessment, Grade, Workshop } from './types';

// Helper to recursively scrub undefined properties so Firestore writes do not crash on optional fields
function cleanUndefined(obj: any): any {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(cleanUndefined).filter(v => v !== undefined);
  }
  const clean: any = {};
  for (const key of Object.keys(obj)) {
    const value = obj[key];
    if (value !== undefined) {
      clean[key] = cleanUndefined(value);
    }
  }
  return clean;
}

const setDoc = async (ref: any, data: any, options?: any) => {
  return firestoreSetDoc(ref, cleanUndefined(data), options);
};

export interface FirebaseUser {
  uid: string;
  name: string;
  email: string;
  role: 'admin' | 'associate' | 'user';
  phone?: string;
  createdAt: string;
}

export interface FeedbackMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderEmail: string;
  message: string;
  response?: string;
  createdAt: string;
  respondedAt?: string;
}

interface FirebaseContextType {
  user: User | null;
  profile: FirebaseUser | null;
  loading: boolean;
  isAdmin: boolean;
  isAssociate: boolean;
  isMaster: boolean;
  
  // Real-time Collections synced from Firestore
  students: Student[];
  associates: Associate[];
  donations: Donation[];
  messages: FeedbackMessage[];
  workshops: Workshop[];
  
  // SGE - School Management System Sync Lists
  schoolUsers: SchoolUser[];
  subjects: Subject[];
  lessons: Lesson[];
  assessments: Assessment[];
  grades: Grade[];

  // Actions
  loginWithSocial: (provider: 'google' | 'facebook' | 'microsoft') => Promise<User>;
  signInWithGoogle: () => Promise<User>;
  signInWithFacebook: () => Promise<User>;
  signInWithMicrosoft: () => Promise<User>;
  loginWithEmail: (email: string, pass: string) => Promise<User>;
  registerWithEmail: (email: string, pass: string, displayName: string) => Promise<User>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;

  updateWorkshop: (workshop: Workshop) => Promise<void>;
  resetWorkshops: () => Promise<void>;

  addStudent: (student: Student) => Promise<void>;
  updateStudent: (student: Student) => Promise<void>;
  deleteStudent: (id: string) => Promise<void>;
  
  addAssociate: (associate: Associate) => Promise<void>;
  removeAssociate: (id: string) => Promise<void>;
  
  addDonation: (donation: Donation) => Promise<void>;
  updateDonation: (donation: Donation) => Promise<void>;
  deleteDonation: (id: string) => Promise<void>;
  
  addMessage: (messageText: string) => Promise<void>;
  respondToMessage: (messageId: string, responseText: string) => Promise<void>;

  // SGE Actions
  addSchoolUser: (su: SchoolUser) => Promise<void>;
  updateSchoolUser: (su: SchoolUser) => Promise<void>;
  deleteSchoolUser: (id: string) => Promise<void>;

  addSubject: (subj: Subject) => Promise<void>;
  updateSubject: (subj: Subject) => Promise<void>;
  deleteSubject: (id: string) => Promise<void>;

  addLesson: (les: Lesson) => Promise<void>;
  updateLesson: (les: Lesson) => Promise<void>;
  deleteLesson: (id: string) => Promise<void>;

  addAssessment: (ass: Assessment) => Promise<void>;
  updateAssessment: (ass: Assessment) => Promise<void>;
  deleteAssessment: (id: string) => Promise<void>;

  addGrade: (gr: Grade) => Promise<void>;
  updateGrade: (gr: Grade) => Promise<void>;
  deleteGrade: (id: string) => Promise<void>;
}

const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

// Baseline initial databases
const defaultStudentsList: Student[] = [
  { id: 'stud_1', name: 'João Carlos Lima', matricula: 'MAT-2026-001', turma: 'Turma A', age: 11, course: 'karate', status: 'active', joinedAt: '10/02/2026', guardianName: 'Carlos Lima', attendanceCount: 9, totalClasses: 12 },
  { id: 'stud_2', name: 'Beatriz Sousa', matricula: 'MAT-2026-002', turma: 'Turma A', age: 13, course: 'english', status: 'active', joinedAt: '24/02/2026', guardianName: 'Sandra Sousa', attendanceCount: 11, totalClasses: 12 },
  { id: 'stud_3', name: 'Amanda Alves', matricula: 'MAT-2026-003', turma: 'Turma B', age: 22, course: 'sewing', status: 'active', joinedAt: '18/02/2026', guardianName: undefined, attendanceCount: 6, totalClasses: 12 },
  { id: 'stud_4', name: 'Lucas Gabriel Costa', matricula: 'MAT-2026-004', turma: 'Turma B', age: 8, course: 'karate', status: 'active', joinedAt: '03/03/2026', guardianName: 'Maria de Lourdes', attendanceCount: 10, totalClasses: 12 },
  { id: 'stud_5', name: 'Guilherme Dias Torres', matricula: 'MAT-2026-005', turma: 'Turma A', age: 12, course: 'english', status: 'inactive', joinedAt: '12/03/2026', guardianName: 'Regina Dias', attendanceCount: 4, totalClasses: 12 }
];

const defaultSchoolUsers: SchoolUser[] = [
  { id: 'su_1', email: 'brendomdev@gmail.com', password: '123', name: 'Brendom Siqueira Dev', role: 'super_admin', title: 'Diretor Geral - Master', createdAt: new Date().toISOString() },
  { id: 'su_2', email: 'sandra@casa.org', password: '123', name: 'Ana Sandra Abreu', role: 'admin', title: 'Coordenadora Pedagógica', createdAt: new Date().toISOString() },
  { id: 'su_3', email: 'marcelo@casa.org', password: '123', name: 'Prof. Marcelo Rodrigues', role: 'professor', title: 'Língua Inglesa & Karatê', createdAt: new Date().toISOString() },
  { id: 'su_4', email: 'carla@casa.org', password: '123', name: 'Profa. Carla Antunes', role: 'professor', title: 'Oficinas de Costura & Bordado', createdAt: new Date().toISOString() }
];

const defaultSubjects: Subject[] = [
  { id: 'subj_1', name: 'Oficina de Inglês Básico', description: 'Curso de inglês instrumental para jovens.', teacherId: 'su_3', turma: 'Turma A', createdAt: new Date().toISOString() },
  { id: 'subj_2', name: '🥋 Karatê e Disciplina', description: 'Artes marciais comunitárias.', teacherId: 'su_3', turma: 'Turma A', createdAt: new Date().toISOString() },
  { id: 'subj_3', name: '🧵 Corte e Costura Criativa', description: 'Atividades profissionalizantes de corte e modelagem.', teacherId: 'su_4', turma: 'Turma B', createdAt: new Date().toISOString() }
];

const defaultLessons: Lesson[] = [
  { id: 'les_1', subjectId: 'subj_1', date: '2026-05-18', title: 'Saudações e Present Simple', description: 'Introdução aos cumprimentos habituais em Inglês.', presentStudentIds: ['stud_1', 'stud_2', 'stud_5'] },
  { id: 'les_2', subjectId: 'subj_1', date: '2026-05-20', title: 'Verbo To Be e Pronomes', description: 'Uso do verbo to be com pronomes pessoais.', presentStudentIds: ['stud_1', 'stud_2'] },
  { id: 'les_3', subjectId: 'subj_2', date: '2026-05-19', title: 'Katas Básicos', description: 'Exercícios de condicionamento físico e katas.', presentStudentIds: ['stud_1', 'stud_4'] }
];

const defaultAssessments: Assessment[] = [
  { id: 'ass_1', subjectId: 'subj_1', title: 'Prova Escrita de Vocabulário', type: 'prova', weight: 3, maxScore: 10, date: '2026-05-10' },
  { id: 'ass_2', subjectId: 'subj_1', title: 'Trabalho de Diálogo Prático', type: 'trabalho', weight: 2, maxScore: 10, date: '2026-05-15' },
  { id: 'ass_3', subjectId: 'subj_2', title: 'Avaliação Postural e Defesa', type: 'prova', weight: 5, maxScore: 10, date: '2026-05-12' },
  { id: 'ass_4', subjectId: 'subj_3', title: 'Atividade de Bainha e Overloque', type: 'atividade', weight: 1, maxScore: 10, date: '2026-05-14' }
];

const defaultGrades: Grade[] = [
  { id: 'gr_1', studentId: 'stud_1', assessmentId: 'ass_1', score: 8.5 },
  { id: 'gr_2', studentId: 'stud_2', assessmentId: 'ass_1', score: 9.0 },
  { id: 'gr_3', studentId: 'stud_5', assessmentId: 'ass_1', score: 5.5 },
  { id: 'gr_4', studentId: 'stud_1', assessmentId: 'ass_2', score: 7.0 },
  { id: 'gr_5', studentId: 'stud_2', assessmentId: 'ass_2', score: 9.5 },
  { id: 'gr_6', studentId: 'stud_1', assessmentId: 'ass_3', score: 8.0 },
  { id: 'gr_7', studentId: 'stud_4', assessmentId: 'ass_3', score: 7.5 },
  { id: 'gr_8', studentId: 'stud_3', assessmentId: 'ass_4', score: 9.0 }
];

const defaultAssociatesList: Associate[] = [
  { id: 'assoc_1', name: 'Roberto Santos', email: 'roberto.santos@gmail.com', phone: '(16) 99182-3344', role: 'Apoiador', joinedAt: '10/04/2026' },
  { id: 'assoc_2', name: 'Patrícia Oliveira', email: 'patricia.ol@exemplo.com', phone: '(16) 99321-5566', role: 'Voluntário', joinedAt: '15/05/2026' },
  { id: 'assoc_3', name: 'Carlos Alberto Lima', email: 'carlos.limabb@exemplo.com', phone: '(16) 98877-2211', role: 'Doador Regular', contributionType: 'mensal', joinedAt: '02/05/2026' }
];

const defaultDonationsList: Donation[] = [
  { id: 'don_1', donorName: 'Anônimo', description: 'Que a Casa Sandríssima continue florescendo e ajudando tantas famílias!', date: '18/05/2026', approved: true },
  { id: 'don_2', donorName: 'Roberto Santos', description: 'Muito orgulho em apoiar este projeto incrível de Franca.', date: '19/05/2026', approved: true },
  { id: 'don_4', donorName: 'Carlos Alberto Lima', description: 'Parabéns a todo o time de voluntários e professores!', date: '20/05/2026', approved: true }
];

export const defaultWorkshopsList: Workshop[] = [
  {
    id: 'karate',
    title: "🥋 Karatê – Disciplina e Autoconhecimento",
    subTitle: "Transformando Vidas Através da Disciplina e do Movimento",
    description: "Nossa ONG oferece aulas de karatê gratuitas como parte de seu compromisso em promover o desenvolvimento físico, emocional e social de crianças e jovens da periferia de Franca/SP. O esporte transmite ética e dedicação.",
    longDesc: "Mais do que uma simples arte marcial, o karatê é uma ferramenta de cidadania. Nosso sensei ensina de técnicas de katas a combate ético, promovendo disciplina pessoal, desenvolvimento de reflexos motores, resiliência mental e integração social.",
    color: "from-orange-500 to-amber-600",
    accentBg: "bg-orange-50 text-orange-700 border-orange-100",
    timetable: "Terças e Quintas: 18h30 às 20h00",
    targetPublic: "Crianças e Adolescentes (7 a 17 anos)",
    requirements: "Vontade de aprender e autorização assinada pelos pais/responsáveis. Fornecemos o kimono conforme estoque.",
    cost: "Totalmente de graça",
    items: [
      "Iniciação ao estilo Shotokan",
      "Participação em torneios regionais solidários",
      "Apostila teórica sobre a história das artes marciais",
      "Graduações de faixas sem taxa de exames"
    ],
    stats: { students: 58, volunteers: 2, limit: 60 }
  },
  {
    id: 'english',
    title: "Inglês – Conexão Global",
    subTitle: "Abrindo Portas para o Futuro profissional",
    description: "Aulas de inglês gratuitas com o objetivo de ampliar as oportunidades de aprendizado escolar e crescimento profissional na comunidade. Para crianças, jovens e adultos interessados.",
    longDesc: "Aprender um novo idioma vai muito além de dominar regras sintáticas — é assegurar autonomia no mercado e no ambiente digital. Nosso curso é prático e enfoca conversação básica, músicas, vocabulário cotidiano e preparação técnica para o mercado.",
    color: "from-blue-500 to-indigo-600",
    accentBg: "bg-blue-50 text-blue-700 border-blue-100",
    timetable: "Quartas e Sábados: 14h00 às 15h30",
    targetPublic: "A partir de 9 anos (Crianças, Jovens e Adultos)",
    requirements: "Caderno e estojo de uso pessoal. Material didático exclusivo fornecido de forma impressa pela ONG.",
    cost: "Totalmente de graça",
    items: [
      "Metodologia focada em diálogos cotidianos (Conversação)",
      "Gramática descomplicada e lúdica",
      "Oficinas culturais de países anglófonos",
      "Preparação simulada para exames escolares"
    ],
    stats: { students: 44, volunteers: 1, limit: 50 }
  },
  {
    id: 'sewing',
    title: "🧵 Costura e Modelagem – Autonomia Financeira",
    subTitle: "Costurando Sonhos e Oportunidades Empreendedoras",
    description: "Oficinas de corte, costura e modelagem gratuitas com o propósito de promover autonomia e geração de renda imediata para pessoas da comunidade. Focado principalmente em chefes de família.",
    longDesc: "A costura é uma forma extraordinária de expressão, criatividade, terapia em grupo e, acima de tudo, fomento financeiro. Nossos participantes dominam do manuseio de máquinas retas e overloques à modelagem de roupas infantis e consertos gerais.",
    color: "from-purple-500 to-pink-600",
    accentBg: "bg-purple-50 text-purple-700 border-purple-100",
    timetable: "Segundas e Sextas: 14h00 às 16h30",
    targetPublic: "Adultos (foco em geração de renda para chefes de família)",
    requirements: "Apenas vontade de criar! Não é preciso conhecimento prévio de corte ou agulhas.",
    cost: "Totalmente de graça",
    items: [
      "Aulas de modelagem básica passo-a-passo",
      "Manutenção básica preventora de máquinas",
      "Confecção de vestimentas, panos de prato e ecobags",
      "Dicas essenciais de precificação e vendas caseiras"
    ],
    stats: { students: 31, volunteers: 2, limit: 35 }
  },
  {
    id: 'pilates',
    title: "🧘 Pilates e Bem-Estar – Qualidade de Vida",
    subTitle: "Fortalecendo Mente e Corpo para a Saúde Integral",
    description: "Oferecemos aulas semanais de pilates com foco em postura, alongamento, equilíbrio e fortalecimento do corpo de forma saudável e segura.",
    longDesc: "Nosso projeto de pilates promove a saúde preventiva e ativa na comunidade através de exercícios de solo, alongamentos dirigidos e controle consciente da respiração. Ideal para reduzir cansaço físico, melhorar a saúde das articulações e proporcionar integração social. Ministrado com carinho todas as sextas das 9h às 10h da manhã na sede da nossa ONG.",
    color: "from-teal-500 to-emerald-600",
    accentBg: "bg-teal-50 text-teal-700 border-teal-100",
    timetable: "Sextas-feiras: 09h00 às 10h00",
    targetPublic: "Adultos e Idosos (comunidade em geral)",
    requirements: "Roupas elásticas que facilitem o alongamento técnico. Colchonetes integrados fornecidos pela sede.",
    cost: "Apenas R$ 40,00 mensais",
    items: [
      "Exercícios adaptados de solo (Mat Pilates)",
      "Fortalecimentos musculares profundos e alinhamentos da coluna",
      "Exercícios de respiração intercostal e reeducação motora de equilíbrio",
      "Meditações e alongamentos funcionais anticansaço"
    ],
    stats: { students: 28, volunteers: 1, limit: 30 }
  },
  {
    id: 'embroidery',
    title: "🪡 Curso de Bordado Livre",
    subTitle: "Tornando Linhas, Pontos e Tradição em Obras de Arte",
    description: "Nossa oficina de bordado livre ensina pontos tradicionais e criativos como ferramenta de socialização, arteterapia e autonomia financeira.",
    longDesc: "O bordado artístico livre é uma terapia focada e repleta de afeto. Os participantes dominam técnicas estruturadas de bordado em tecidos, desenvolvendo acabamentos finos e habilidades ideais para fabricação de artigos de decoração e vestuários. O curso acontece às terças das 13h às 16h na nossa sede no Jardim Ipanema, totalmente de graça.",
    color: "from-rose-500 to-pink-600",
    accentBg: "bg-rose-50 text-rose-700 border-rose-100",
    timetable: "Terças-feiras: 13h00 às 16h00",
    targetPublic: "Comunidade em geral (a partir de 14 anos)",
    requirements: "Bastidores, linhas, agulhas e tecidos piloto fornecidos inteiramente de graça pela ONG.",
    cost: "Totalmente de graça",
    items: [
      "Introdução prática a pontos bases (Ponto atrás, corrente, nó francês e rococó)",
      "Desenho artístico e transferência de riscos originais para panos",
      "Harmonias cromáticas e acabamento invisível de avesso",
      "Orientação focada em empreendedorismo, precificação e vendas"
    ],
    stats: { students: 18, volunteers: 1, limit: 20 }
  }
];

// Helper to construct a compliant mock/local User object for local sessions
const createMockUser = (email: string, displayName: string, uid?: string): User => {
  const userId = uid || 'usr_' + Math.random().toString(36).substring(2, 11);
  return {
    uid: userId,
    email: email.trim().toLowerCase(),
    displayName: displayName.trim() || email.split('@')[0],
    emailVerified: true,
    isAnonymous: false,
    phoneNumber: null,
    photoURL: null,
    providerId: 'password',
    tenantId: null,
    providerData: [],
    metadata: {} as any,
    refreshToken: 'local-session-token',
    delete: async () => {},
    getIdToken: async () => 'local-mock-token',
    getIdTokenResult: async () => ({} as any),
    reload: async () => {},
    toJSON: () => ({ uid: userId, email })
  } as unknown as User;
};

export const FirebaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('casa_sandrissima_auth_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.user) return parsed.user as User;
      }
    } catch (e) {
      console.warn("Error reading cached local user:", e);
    }
    return null;
  });

  const [profile, setProfile] = useState<FirebaseUser | null>(() => {
    try {
      const saved = localStorage.getItem('casa_sandrissima_auth_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.profile) return parsed.profile as FirebaseUser;
      }
    } catch (e) {
      console.warn("Error reading cached local profile:", e);
    }
    return null;
  });

  const [loading, setLoading] = useState(true);

  // Synced states
  const [students, setStudents] = useState<Student[]>([]);
  const [associates, setAssociates] = useState<Associate[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [messages, setMessages] = useState<FeedbackMessage[]>([]);
  const [workshops, setWorkshops] = useState<Workshop[]>(() => {
    try {
      const saved = localStorage.getItem('casa_sandrissima_workshops');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return defaultWorkshopsList;
  });

  // SGE collections states
  const [schoolUsers, setSchoolUsers] = useState<SchoolUser[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);

  const isAdmin = profile?.role === 'admin';
  const isAssociate = profile?.role === 'associate' || associates.some(a => a.email.toLowerCase() === user?.email?.toLowerCase());

  const isMaster = isAdmin || 
    user?.email?.toLowerCase() === 'brendomdev@gmail.com' ||
    user?.email?.toLowerCase() === 'brendomsiqueira96@gmail.com' ||
    user?.email?.toLowerCase() === 'hardcoders@gmail.com' ||
    profile?.role === 'admin' ||
    (() => {
      try {
        const sge = localStorage.getItem('sge_logged_staff');
        if (sge) {
          const parsed = JSON.parse(sge);
          if (parsed?.role === 'super_admin' || parsed?.role === 'admin') return true;
        }
      } catch {}
      return false;
    })();

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          const userRef = doc(db, 'users', currentUser.uid);
          const userSnap = await getDoc(userRef);
          
          let currentProfile: FirebaseUser;
          const lowerEmail = currentUser.email?.toLowerCase() || '';
          const isUserAdmin = lowerEmail === 'brendomdev@gmail.com' || lowerEmail === 'brendomsiqueira96@gmail.com' || lowerEmail === 'hardcoders@gmail.com';

          if (!userSnap.exists()) {
            currentProfile = {
              uid: currentUser.uid,
              name: currentUser.displayName || 'Usuário',
              email: currentUser.email || '',
              role: isUserAdmin ? 'admin' : 'user',
              createdAt: new Date().toISOString(),
            };
            await setDoc(userRef, currentProfile);
          } else {
            currentProfile = userSnap.data() as FirebaseUser;
            if (isUserAdmin && currentProfile.role !== 'admin') {
              currentProfile.role = 'admin';
              await setDoc(userRef, { role: 'admin' }, { merge: true });
            }
          }
          setProfile(currentProfile);
          localStorage.setItem('casa_sandrissima_auth_user', JSON.stringify({ user: currentUser, profile: currentProfile }));

          // Seed databases if empty
          await seedDatabaseIfEmpty();

        } catch (error) {
          console.error("Error setting up user profile: ", error);
        }
      } else {
        // If there's no active Firebase Auth session, check if we have a local session
        const saved = localStorage.getItem('casa_sandrissima_auth_user');
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            if (parsed?.user && parsed?.profile) {
              setUser(parsed.user);
              setProfile(parsed.profile);
              setLoading(false);
              return;
            }
          } catch (e) {
            console.warn("Could not parse saved local user:", e);
          }
        }
        setUser(null);
        setProfile(null);
        // Fallback default lists
        setStudents(defaultStudentsList);
        setAssociates(defaultAssociatesList);
        setDonations(defaultDonationsList);
        setMessages([]);
        setSchoolUsers(defaultSchoolUsers);
        setSubjects(defaultSubjects);
        setLessons(defaultLessons);
        setAssessments(defaultAssessments);
        setGrades(defaultGrades);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Real-time school databases listeners when logged in
  useEffect(() => {
    if (!user) return;

    const lowerEmail = user.email?.toLowerCase() || '';
    const isUserAdmin = lowerEmail === 'brendomdev@gmail.com' || lowerEmail === 'brendomsiqueira96@gmail.com' || lowerEmail === 'hardcoders@gmail.com';

    let unsubStudents = onSnapshot(collection(db, 'students'), (snap) => {
      const fetched: Student[] = [];
      snap.forEach((doc) => fetched.push(doc.data() as Student));
      fetched.sort((a,b) => a.name.localeCompare(b.name));
      setStudents(fetched.length ? fetched : defaultStudentsList);
    }, (err) => {
      console.warn("Students listener notice:", err?.message || err);
      setStudents(defaultStudentsList);
    });

    // If super admin, read all associates; else query only our own associate record to prevent permission errors
    const associatesQuery = isUserAdmin 
      ? collection(db, 'associates') 
      : query(collection(db, 'associates'), where('email', '==', user.email || ''));

    let unsubAssociates = onSnapshot(associatesQuery, (snap) => {
      const fetched: Associate[] = [];
      snap.forEach((doc) => fetched.push(doc.data() as Associate));
      fetched.sort((a,b) => new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime());
      setAssociates(isUserAdmin ? (fetched.length ? fetched : defaultAssociatesList) : fetched);
    }, (err) => {
      console.warn("Associates listener notice:", err?.message || err);
      setAssociates(defaultAssociatesList);
    });

    // Admins read all messages; normal users only read messages they wrote themselves
    const messagesQuery = isUserAdmin 
      ? collection(db, 'messages') 
      : query(collection(db, 'messages'), where('senderId', '==', user.uid));

    let unsubMessages = onSnapshot(messagesQuery, (snap) => {
      const fetched: FeedbackMessage[] = [];
      snap.forEach((doc) => fetched.push(doc.data() as FeedbackMessage));
      fetched.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setMessages(fetched);
    }, (err) => {
      console.warn("Messages listener notice:", err?.message || err);
      setMessages([]);
    });

    // SGE collection hooks
    let unsubSchoolUsers = onSnapshot(collection(db, 'school_users'), (snap) => {
      const fetched: SchoolUser[] = [];
      snap.forEach((doc) => fetched.push(doc.data() as SchoolUser));
      setSchoolUsers(fetched.length ? fetched : defaultSchoolUsers);
    }, (err) => {
      console.warn("SchoolUsers listener notice:", err?.message || err);
      setSchoolUsers(defaultSchoolUsers);
    });

    let unsubSubjects = onSnapshot(collection(db, 'subjects'), (snap) => {
      const fetched: Subject[] = [];
      snap.forEach((doc) => fetched.push(doc.data() as Subject));
      fetched.sort((a,b) => a.name.localeCompare(b.name));
      setSubjects(fetched.length ? fetched : defaultSubjects);
    }, (err) => {
      console.warn("Subjects listener notice:", err?.message || err);
      setSubjects(defaultSubjects);
    });

    let unsubLessons = onSnapshot(collection(db, 'lessons'), (snap) => {
      const fetched: Lesson[] = [];
      snap.forEach((doc) => fetched.push(doc.data() as Lesson));
      fetched.sort((a,b) => b.date.localeCompare(a.date));
      setLessons(fetched.length ? fetched : defaultLessons);
    }, (err) => {
      console.warn("Lessons listener notice:", err?.message || err);
      setLessons(defaultLessons);
    });

    let unsubAssessments = onSnapshot(collection(db, 'assessments'), (snap) => {
      const fetched: Assessment[] = [];
      snap.forEach((doc) => fetched.push(doc.data() as Assessment));
      setAssessments(fetched.length ? fetched : defaultAssessments);
    }, (err) => {
      console.warn("Assessments listener notice:", err?.message || err);
      setAssessments(defaultAssessments);
    });

    let unsubGrades = onSnapshot(collection(db, 'grades'), (snap) => {
      const fetched: Grade[] = [];
      snap.forEach((doc) => fetched.push(doc.data() as Grade));
      setGrades(fetched.length ? fetched : defaultGrades);
    }, (err) => {
      console.warn("Grades listener notice:", err?.message || err);
      setGrades(defaultGrades);
    });

    return () => {
      unsubStudents();
      unsubAssociates();
      unsubMessages();
      unsubSchoolUsers();
      unsubSubjects();
      unsubLessons();
      unsubAssessments();
      unsubGrades();
    };
  }, [user]);

  // Synchronize donations list in real-time for ALL visitors (including anonymous guests and logged-in users)
  useEffect(() => {
    const unsubDonations = onSnapshot(collection(db, 'donations'), (snap) => {
      const fetched: Donation[] = [];
      snap.forEach((doc) => fetched.push(doc.data() as Donation));
      fetched.sort((a,b) => {
        const dateA = a.date.includes('/') ? a.date.split('/').reverse().join('-') : a.date;
        const dateB = b.date.includes('/') ? b.date.split('/').reverse().join('-') : b.date;
        return new Date(dateB).getTime() - new Date(dateA).getTime();
      });
      setDonations(fetched.length ? fetched : defaultDonationsList);
    }, (err) => {
      console.warn("Public readable donations fell back to default list: ", err);
      setDonations(defaultDonationsList);
    });

    return () => unsubDonations();
  }, [user]);

  // Synchronize workshops (Projetos e Oficinas) in real-time for everyone
  useEffect(() => {
    const unsubWorkshops = onSnapshot(collection(db, 'workshops'), (snap) => {
      if (!snap.empty) {
        const fetchedMap = new Map<string, Workshop>();
        snap.forEach((doc) => {
          fetchedMap.set(doc.id, doc.data() as Workshop);
        });
        
        const merged = defaultWorkshopsList.map(dw => {
          return fetchedMap.get(dw.id) || dw;
        });

        fetchedMap.forEach((ws, id) => {
          if (!merged.some(m => m.id === id)) {
            merged.push(ws);
          }
        });

        setWorkshops(merged);
        localStorage.setItem('casa_sandrissima_workshops', JSON.stringify(merged));
      }
    }, (err) => {
      console.warn("Workshops real-time listener notice:", err?.message || err);
    });

    return () => unsubWorkshops();
  }, []);

  // Seeding tools
  const seedDatabaseIfEmpty = async () => {
    try {
      const lowerEmail = user?.email?.toLowerCase() || '';
      const isUserAdmin = lowerEmail === 'brendomdev@gmail.com' || lowerEmail === 'brendomsiqueira96@gmail.com' || lowerEmail === 'hardcoders@gmail.com';
      if (!isUserAdmin) return;

      const studentCountRef = await getDocs(collection(db, 'students'));
      if (studentCountRef.empty) {
        console.log("Seeding school default databases...");
        for (const st of defaultStudentsList) {
          await setDoc(doc(db, 'students', st.id), st);
        }
        for (const assoc of defaultAssociatesList) {
          await setDoc(doc(db, 'associates', assoc.id), assoc);
        }
        for (const don of defaultDonationsList) {
          await setDoc(doc(db, 'donations', don.id), don);
        }
        for (const su of defaultSchoolUsers) {
          await setDoc(doc(db, 'school_users', su.id), su);
        }
        for (const sb of defaultSubjects) {
          await setDoc(doc(db, 'subjects', sb.id), sb);
        }
        for (const ls of defaultLessons) {
          await setDoc(doc(db, 'lessons', ls.id), ls);
        }
        for (const as of defaultAssessments) {
          await setDoc(doc(db, 'assessments', as.id), as);
        }
        for (const gd of defaultGrades) {
          await setDoc(doc(db, 'grades', gd.id), gd);
        }
        
        const firstMsg: FeedbackMessage = {
          id: 'msg_1',
          senderId: 'assoc_1',
          senderName: 'Roberto Santos',
          senderEmail: 'roberto.santos@gmail.com',
          message: 'Sugiro organizar uma bazar cultural no final de junho para arrecadarmos fundos adicionais e divulgar os produtos de costura da Casa Sandríssima.',
          createdAt: new Date().toISOString(),
          response: 'Excelente ideia Roberto! Vamos colocar em discussão na próxima assembleia geral marcada para a semana que vem.',
          respondedAt: new Date().toISOString()
        };
        await setDoc(doc(db, 'messages', firstMsg.id), firstMsg);
      }
    } catch (e) {
      console.error("Baseline seeding failed: ", e);
    }
  };

  // ACTIONS IMPLEMENTATION
  const addStudent = async (student: Student) => {
    setStudents(prev => [...prev.filter(s => s.id !== student.id), student]);
    try {
      await setDoc(doc(db, 'students', student.id), student);
    } catch (error) {
      console.warn("Could not sync student to Firestore:", error);
    }
  };

  const updateStudent = async (student: Student) => {
    setStudents(prev => prev.map(s => s.id === student.id ? student : s));
    try {
      await setDoc(doc(db, 'students', student.id), student, { merge: true });
    } catch (error) {
      console.warn("Could not sync student update to Firestore:", error);
    }
  };

  const deleteStudent = async (id: string) => {
    setStudents(prev => prev.filter(s => s.id !== id));
    try {
      await deleteDoc(doc(db, 'students', id));
    } catch (error) {
      console.warn("Could not delete student from Firestore:", error);
    }
  };

  const addAssociate = async (associate: Associate) => {
    setAssociates(prev => [associate, ...prev.filter(a => a.id !== associate.id)]);
    try {
      await setDoc(doc(db, 'associates', associate.id), associate);
      if (user && user.email?.toLowerCase() === associate.email.toLowerCase()) {
        const userRef = doc(db, 'users', user.uid);
        await setDoc(userRef, { role: 'associate', phone: associate.phone }, { merge: true });
        if (profile) {
          setProfile({ ...profile, role: 'associate', phone: associate.phone });
        }
      }
    } catch (error) {
      console.warn("Could not sync associate to Firestore:", error);
    }
  };

  const removeAssociate = async (id: string) => {
    setAssociates(prev => prev.filter(a => a.id !== id));
    try {
      await deleteDoc(doc(db, 'associates', id));
    } catch (error) {
      console.warn("Could not delete associate from Firestore:", error);
    }
  };

  const addDonation = async (donation: Donation) => {
    setDonations(prev => [donation, ...prev.filter(d => d.id !== donation.id)]);
    try {
      await setDoc(doc(db, 'donations', donation.id), donation);
    } catch (error) {
      console.warn("Could not sync donation to Firestore:", error);
    }
  };

  const deleteDonation = async (id: string) => {
    setDonations(prev => prev.filter(d => d.id !== id));
    try {
      await deleteDoc(doc(db, 'donations', id));
    } catch (error) {
      console.warn("Could not delete donation from Firestore:", error);
    }
  };

  const updateDonation = async (donation: Donation) => {
    setDonations(prev => prev.map(d => d.id === donation.id ? donation : d));
    try {
      await setDoc(doc(db, 'donations', donation.id), donation, { merge: true });
    } catch (error) {
      console.warn("Could not sync donation update to Firestore:", error);
    }
  };

  const addMessage = async (messageText: string) => {
    if (!user) return;
    const msgId = 'msg_' + Math.random().toString(36).substring(2, 11);
    const newMsg: FeedbackMessage = {
      id: msgId,
      senderId: user.uid,
      senderName: user.displayName || 'Associado',
      senderEmail: user.email || '',
      message: messageText,
      createdAt: new Date().toISOString()
    };
    setMessages(prev => [newMsg, ...prev]);
    try {
      await setDoc(doc(db, 'messages', msgId), newMsg);
    } catch (error) {
      console.warn("Could not sync message to Firestore:", error);
    }
  };

  const respondToMessage = async (messageId: string, responseText: string) => {
    setMessages(prev => prev.map(m => m.id === messageId ? { ...m, response: responseText, respondedAt: new Date().toISOString() } : m));
    try {
      const msgRef = doc(db, 'messages', messageId);
      await setDoc(msgRef, {
        response: responseText,
        respondedAt: new Date().toISOString()
      }, { merge: true });
    } catch (error) {
      console.warn("Could not sync message response to Firestore:", error);
    }
  };

  // SGE SCHOOL_USERS
  const addSchoolUser = async (su: SchoolUser) => {
    setSchoolUsers(prev => [...prev.filter(u => u.id !== su.id), su]);
    try {
      await setDoc(doc(db, 'school_users', su.id), su);
    } catch (error) {
      console.warn("Could not sync school user to Firestore:", error);
    }
  };

  const updateSchoolUser = async (su: SchoolUser) => {
    setSchoolUsers(prev => prev.map(u => u.id === su.id ? su : u));
    try {
      await setDoc(doc(db, 'school_users', su.id), su, { merge: true });
    } catch (error) {
      console.warn("Could not update school user in Firestore:", error);
    }
  };

  const deleteSchoolUser = async (id: string) => {
    setSchoolUsers(prev => prev.filter(u => u.id !== id));
    try {
      await deleteDoc(doc(db, 'school_users', id));
    } catch (error) {
      console.warn("Could not delete school user from Firestore:", error);
    }
  };

  // SUBJECTS
  const addSubject = async (subj: Subject) => {
    setSubjects(prev => [...prev.filter(s => s.id !== subj.id), subj]);
    try {
      await setDoc(doc(db, 'subjects', subj.id), subj);
    } catch (error) {
      console.warn("Could not sync subject to Firestore:", error);
    }
  };

  const updateSubject = async (subj: Subject) => {
    setSubjects(prev => prev.map(s => s.id === subj.id ? subj : s));
    try {
      await setDoc(doc(db, 'subjects', subj.id), subj, { merge: true });
    } catch (error) {
      console.warn("Could not update subject in Firestore:", error);
    }
  };

  const deleteSubject = async (id: string) => {
    setSubjects(prev => prev.filter(s => s.id !== id));
    try {
      await deleteDoc(doc(db, 'subjects', id));
    } catch (error) {
      console.warn("Could not delete subject from Firestore:", error);
    }
  };

  // LESSONS
  const addLesson = async (les: Lesson) => {
    setLessons(prev => [les, ...prev.filter(l => l.id !== les.id)]);
    try {
      await setDoc(doc(db, 'lessons', les.id), les);
    } catch (error) {
      console.warn("Could not sync lesson to Firestore:", error);
    }
  };

  const updateLesson = async (les: Lesson) => {
    setLessons(prev => prev.map(l => l.id === les.id ? les : l));
    try {
      await setDoc(doc(db, 'lessons', les.id), les, { merge: true });
    } catch (error) {
      console.warn("Could not update lesson in Firestore:", error);
    }
  };

  const deleteLesson = async (id: string) => {
    setLessons(prev => prev.filter(l => l.id !== id));
    try {
      await deleteDoc(doc(db, 'lessons', id));
    } catch (error) {
      console.warn("Could not delete lesson from Firestore:", error);
    }
  };

  // ASSESSMENTS
  const addAssessment = async (ass: Assessment) => {
    setAssessments(prev => [ass, ...prev.filter(a => a.id !== ass.id)]);
    try {
      await setDoc(doc(db, 'assessments', ass.id), ass);
    } catch (error) {
      console.warn("Could not sync assessment to Firestore:", error);
    }
  };

  const updateAssessment = async (ass: Assessment) => {
    setAssessments(prev => prev.map(a => a.id === ass.id ? ass : a));
    try {
      await setDoc(doc(db, 'assessments', ass.id), ass, { merge: true });
    } catch (error) {
      console.warn("Could not update assessment in Firestore:", error);
    }
  };

  const deleteAssessment = async (id: string) => {
    setAssessments(prev => prev.filter(a => a.id !== id));
    try {
      await deleteDoc(doc(db, 'assessments', id));
    } catch (error) {
      console.warn("Could not delete assessment from Firestore:", error);
    }
  };

  // GRADES
  const addGrade = async (gr: Grade) => {
    setGrades(prev => [...prev.filter(g => g.id !== gr.id), gr]);
    try {
      await setDoc(doc(db, 'grades', gr.id), gr);
    } catch (error) {
      console.warn("Could not sync grade to Firestore:", error);
    }
  };

  const updateGrade = async (gr: Grade) => {
    setGrades(prev => prev.map(g => g.id === gr.id ? gr : g));
    try {
      await setDoc(doc(db, 'grades', gr.id), gr, { merge: true });
    } catch (error) {
      console.warn("Could not update grade in Firestore:", error);
    }
  };

  const deleteGrade = async (id: string) => {
    setGrades(prev => prev.filter(g => g.id !== id));
    try {
      await deleteDoc(doc(db, 'grades', id));
    } catch (error) {
      console.warn("Could not delete grade from Firestore:", error);
    }
  };

  // WORKSHOPS (Projetos / Oficinas) Master Management
  const updateWorkshop = async (workshop: Workshop) => {
    const updatedWithMeta: Workshop = {
      ...workshop,
      updatedAt: new Date().toISOString(),
      updatedBy: profile?.name || user?.displayName || user?.email || 'Master'
    };
    
    setWorkshops(prev => {
      const exists = prev.some(w => w.id === workshop.id);
      const next = exists ? prev.map(w => w.id === workshop.id ? updatedWithMeta : w) : [...prev, updatedWithMeta];
      localStorage.setItem('casa_sandrissima_workshops', JSON.stringify(next));
      return next;
    });

    try {
      await setDoc(doc(db, 'workshops', workshop.id), updatedWithMeta, { merge: true });
    } catch (err) {
      console.warn("Could not sync workshop update to Firestore:", err);
    }
  };

  const resetWorkshops = async () => {
    setWorkshops(defaultWorkshopsList);
    localStorage.setItem('casa_sandrissima_workshops', JSON.stringify(defaultWorkshopsList));
    try {
      for (const ws of defaultWorkshopsList) {
        await setDoc(doc(db, 'workshops', ws.id), ws);
      }
    } catch (err) {
      console.warn("Could not reset workshops in Firestore:", err);
    }
  };

  // RESILIENT AUTH WRAPPERS
  const handleLoginWithEmail = async (emailInput: string, passInput: string): Promise<User> => {
    const cleanEmail = emailInput.trim().toLowerCase();
    try {
      const firebaseUser = await signInWithEmail(cleanEmail, passInput);
      return firebaseUser;
    } catch (err: any) {
      const isNotAllowed = err?.code === 'auth/operation-not-allowed' || err?.code === 'auth/configuration-not-found';
      
      if (isNotAllowed) {
        console.warn("Firebase Auth Email provider not enabled; using local session fallback.");
        
        // Find existing local account or demo account
        const localAccountsRaw = localStorage.getItem('casa_sandrissima_local_accounts');
        const localAccounts: Array<{ email: string; pass: string; name: string }> = localAccountsRaw ? JSON.parse(localAccountsRaw) : [];
        
        const isMaster = cleanEmail === 'brendomdev@gmail.com' || cleanEmail === 'brendomsiqueira96@gmail.com' || cleanEmail === 'hardcoders@gmail.com';
        const isSandra = cleanEmail === 'sandra@casa.org';
        const isRoberto = cleanEmail === 'roberto.santos@gmail.com';
        const localAccount = localAccounts.find(a => a.email.toLowerCase() === cleanEmail);

        let userName = 'Usuário';
        if (isMaster) userName = 'Brendom Siqueira Dev';
        else if (isSandra) userName = 'Ana Sandra Abreu';
        else if (isRoberto) userName = 'Roberto Santos';
        else if (localAccount) userName = localAccount.name;

        const mockUid = 'usr_' + cleanEmail.replace(/[^a-zA-Z0-9]/g, '_');
        const mockUser = createMockUser(cleanEmail, userName, mockUid);
        const newProfile: FirebaseUser = {
          uid: mockUid,
          name: userName,
          email: cleanEmail,
          role: isMaster ? 'admin' : (isRoberto ? 'associate' : 'user'),
          createdAt: new Date().toISOString()
        };

        setUser(mockUser);
        setProfile(newProfile);
        localStorage.setItem('casa_sandrissima_auth_user', JSON.stringify({ user: mockUser, profile: newProfile }));
        return mockUser;
      }
      throw err;
    }
  };

  const handleRegisterWithEmail = async (emailInput: string, passInput: string, displayName: string): Promise<User> => {
    const cleanEmail = emailInput.trim().toLowerCase();
    try {
      const firebaseUser = await signUpWithEmail(cleanEmail, passInput, displayName);
      return firebaseUser;
    } catch (err: any) {
      const isNotAllowed = err?.code === 'auth/operation-not-allowed' || err?.code === 'auth/configuration-not-found';
      
      if (isNotAllowed) {
        console.warn("Firebase Auth Email provider not enabled; registering local session fallback.");
        
        const localAccountsRaw = localStorage.getItem('casa_sandrissima_local_accounts');
        const localAccounts: Array<{ email: string; pass: string; name: string }> = localAccountsRaw ? JSON.parse(localAccountsRaw) : [];
        
        if (localAccounts.some(a => a.email.toLowerCase() === cleanEmail)) {
          const dupErr = new Error('Email already in use.');
          (dupErr as any).code = 'auth/email-already-in-use';
          throw dupErr;
        }

        localAccounts.push({ email: cleanEmail, pass: passInput, name: displayName.trim() });
        localStorage.setItem('casa_sandrissima_local_accounts', JSON.stringify(localAccounts));

        const isMaster = cleanEmail === 'brendomdev@gmail.com' || cleanEmail === 'brendomsiqueira96@gmail.com' || cleanEmail === 'hardcoders@gmail.com';
        const mockUid = 'usr_' + cleanEmail.replace(/[^a-zA-Z0-9]/g, '_');
        const mockUser = createMockUser(cleanEmail, displayName, mockUid);
        const newProfile: FirebaseUser = {
          uid: mockUid,
          name: displayName.trim() || 'Usuário',
          email: cleanEmail,
          role: isMaster ? 'admin' : 'user',
          createdAt: new Date().toISOString()
        };

        setUser(mockUser);
        setProfile(newProfile);
        localStorage.setItem('casa_sandrissima_auth_user', JSON.stringify({ user: mockUser, profile: newProfile }));

        try {
          await setDoc(doc(db, 'users', mockUid), newProfile);
        } catch (dbErr) {
          console.warn("Could not write local user to Firestore:", dbErr);
        }

        return mockUser;
      }
      throw err;
    }
  };

  const handleResetPassword = async (emailInput: string): Promise<void> => {
    const cleanEmail = emailInput.trim().toLowerCase();
    try {
      await sendPasswordReset(cleanEmail);
    } catch (err: any) {
      const isNotAllowed = err?.code === 'auth/operation-not-allowed' || err?.code === 'auth/configuration-not-found';
      if (isNotAllowed) {
        // Fallback for simulation
        console.warn("Firebase Auth Email provider not enabled; password reset simulated.");
        return;
      }
      throw err;
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (e) {
      console.warn("Firebase Auth signout error:", e);
    }
    localStorage.removeItem('casa_sandrissima_auth_user');
    setUser(null);
    setProfile(null);
  };

  return (
    <FirebaseContext.Provider value={{
      user,
      profile,
      loading,
      isAdmin,
      isAssociate,
      isMaster,
      students,
      associates,
      donations,
      messages,
      workshops,
      schoolUsers,
      subjects,
      lessons,
      assessments,
      grades,

      loginWithSocial: signInWithSocial,
      signInWithGoogle,
      signInWithFacebook,
      signInWithMicrosoft,
      loginWithEmail: handleLoginWithEmail,
      registerWithEmail: handleRegisterWithEmail,
      resetPassword: handleResetPassword,
      logout: handleLogout,

      updateWorkshop,
      resetWorkshops,

      addStudent,
      updateStudent,
      deleteStudent,
      addAssociate,
      removeAssociate,
      addDonation,
      updateDonation,
      deleteDonation,
      addMessage,
      respondToMessage,

      // SGE Methods
      addSchoolUser,
      updateSchoolUser,
      deleteSchoolUser,
      addSubject,
      updateSubject,
      deleteSubject,
      addLesson,
      updateLesson,
      deleteLesson,
      addAssessment,
      updateAssessment,
      deleteAssessment,
      addGrade,
      updateGrade,
      deleteGrade
    }}>
      {children}
    </FirebaseContext.Provider>
  );
};

export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
};

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
import { auth, db, handleFirestoreError, OperationType } from './firebase';
import { Student, Associate, Donation, SchoolUser, Subject, Lesson, Assessment, Grade } from './types';

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
  
  // Real-time Collections synced from Firestore
  students: Student[];
  associates: Associate[];
  donations: Donation[];
  messages: FeedbackMessage[];
  
  // SGE - School Management System Sync Lists
  schoolUsers: SchoolUser[];
  subjects: Subject[];
  lessons: Lesson[];
  assessments: Assessment[];
  grades: Grade[];

  // Actions
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
  { id: 'su_1', email: 'Brendomdev@gmail.com', password: '123', name: 'Brendom Siqueira Dev', role: 'super_admin', title: 'Diretor Geral - Master', createdAt: new Date().toISOString() },
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

export const FirebaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Synced states
  const [students, setStudents] = useState<Student[]>([]);
  const [associates, setAssociates] = useState<Associate[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [messages, setMessages] = useState<FeedbackMessage[]>([]);

  // SGE collections states
  const [schoolUsers, setSchoolUsers] = useState<SchoolUser[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);

  const isAdmin = profile?.role === 'admin';
  const isAssociate = profile?.role === 'associate' || associates.some(a => a.email.toLowerCase() === user?.email?.toLowerCase());

  // Listen to auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
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

          // Seed databases if empty
          await seedDatabaseIfEmpty();

        } catch (error) {
          console.error("Error setting up user profile: ", error);
        }
      } else {
        setProfile(null);
        // Fallback or clear lists
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
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'students'));

    // If super admin, read all associates; else query only our own associate record to prevent permission errors
    const associatesQuery = isUserAdmin 
      ? collection(db, 'associates') 
      : query(collection(db, 'associates'), where('email', '==', user.email || ''));

    let unsubAssociates = onSnapshot(associatesQuery, (snap) => {
      const fetched: Associate[] = [];
      snap.forEach((doc) => fetched.push(doc.data() as Associate));
      fetched.sort((a,b) => new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime());
      setAssociates(isUserAdmin ? (fetched.length ? fetched : defaultAssociatesList) : fetched);
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'associates'));



    // Admins read all messages; normal users only read messages they wrote themselves
    const messagesQuery = isUserAdmin 
      ? collection(db, 'messages') 
      : query(collection(db, 'messages'), where('senderId', '==', user.uid));

    let unsubMessages = onSnapshot(messagesQuery, (snap) => {
      const fetched: FeedbackMessage[] = [];
      snap.forEach((doc) => fetched.push(doc.data() as FeedbackMessage));
      fetched.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setMessages(fetched);
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'messages'));

    // SGE collection hooks
    let unsubSchoolUsers = onSnapshot(collection(db, 'school_users'), (snap) => {
      const fetched: SchoolUser[] = [];
      snap.forEach((doc) => fetched.push(doc.data() as SchoolUser));
      setSchoolUsers(fetched.length ? fetched : defaultSchoolUsers);
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'school_users'));

    let unsubSubjects = onSnapshot(collection(db, 'subjects'), (snap) => {
      const fetched: Subject[] = [];
      snap.forEach((doc) => fetched.push(doc.data() as Subject));
      fetched.sort((a,b) => a.name.localeCompare(b.name));
      setSubjects(fetched.length ? fetched : defaultSubjects);
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'subjects'));

    let unsubLessons = onSnapshot(collection(db, 'lessons'), (snap) => {
      const fetched: Lesson[] = [];
      snap.forEach((doc) => fetched.push(doc.data() as Lesson));
      fetched.sort((a,b) => b.date.localeCompare(a.date));
      setLessons(fetched.length ? fetched : defaultLessons);
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'lessons'));

    let unsubAssessments = onSnapshot(collection(db, 'assessments'), (snap) => {
      const fetched: Assessment[] = [];
      snap.forEach((doc) => fetched.push(doc.data() as Assessment));
      setAssessments(fetched.length ? fetched : defaultAssessments);
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'assessments'));

    let unsubGrades = onSnapshot(collection(db, 'grades'), (snap) => {
      const fetched: Grade[] = [];
      snap.forEach((doc) => fetched.push(doc.data() as Grade));
      setGrades(fetched.length ? fetched : defaultGrades);
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'grades'));

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
    try {
      await setDoc(doc(db, 'students', student.id), student);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `students/${student.id}`);
    }
  };

  const updateStudent = async (student: Student) => {
    try {
      await setDoc(doc(db, 'students', student.id), student, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `students/${student.id}`);
    }
  };

  const deleteStudent = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'students', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `students/${id}`);
    }
  };

  const addAssociate = async (associate: Associate) => {
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
      handleFirestoreError(error, OperationType.WRITE, `associates/${associate.id}`);
    }
  };

  const removeAssociate = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'associates', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `associates/${id}`);
    }
  };

  const addDonation = async (donation: Donation) => {
    try {
      await setDoc(doc(db, 'donations', donation.id), donation);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `donations/${donation.id}`);
    }
  };

  const deleteDonation = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'donations', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `donations/${id}`);
    }
  };

  const updateDonation = async (donation: Donation) => {
    try {
      await setDoc(doc(db, 'donations', donation.id), donation, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `donations/${donation.id}`);
    }
  };

  const addMessage = async (messageText: string) => {
    if (!user) return;
    try {
      const msgId = 'msg_' + Math.random().toString(36).substring(2, 11);
      const newMsg: FeedbackMessage = {
        id: msgId,
        senderId: user.uid,
        senderName: user.displayName || 'Associado',
        senderEmail: user.email || '',
        message: messageText,
        createdAt: new Date().toISOString()
      };
      await setDoc(doc(db, 'messages', msgId), newMsg);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `messages`);
    }
  };

  const respondToMessage = async (messageId: string, responseText: string) => {
    try {
      const msgRef = doc(db, 'messages', messageId);
      await setDoc(msgRef, {
        response: responseText,
        respondedAt: new Date().toISOString()
      }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `messages/${messageId}`);
    }
  };

  // SGE SCHOOL_USERS
  const addSchoolUser = async (su: SchoolUser) => {
    try {
      await setDoc(doc(db, 'school_users', su.id), su);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `school_users/${su.id}`);
    }
  };

  const updateSchoolUser = async (su: SchoolUser) => {
    try {
      await setDoc(doc(db, 'school_users', su.id), su, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `school_users/${su.id}`);
    }
  };

  const deleteSchoolUser = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'school_users', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `school_users/${id}`);
    }
  };

  // SUBJECTS
  const addSubject = async (subj: Subject) => {
    try {
      await setDoc(doc(db, 'subjects', subj.id), subj);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `subjects/${subj.id}`);
    }
  };

  const updateSubject = async (subj: Subject) => {
    try {
      await setDoc(doc(db, 'subjects', subj.id), subj, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `subjects/${subj.id}`);
    }
  };

  const deleteSubject = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'subjects', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `subjects/${id}`);
    }
  };

  // LESSONS
  const addLesson = async (les: Lesson) => {
    try {
      await setDoc(doc(db, 'lessons', les.id), les);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `lessons/${les.id}`);
    }
  };

  const updateLesson = async (les: Lesson) => {
    try {
      await setDoc(doc(db, 'lessons', les.id), les, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `lessons/${les.id}`);
    }
  };

  const deleteLesson = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'lessons', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `lessons/${id}`);
    }
  };

  // ASSESSMENTS
  const addAssessment = async (ass: Assessment) => {
    try {
      await setDoc(doc(db, 'assessments', ass.id), ass);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `assessments/${ass.id}`);
    }
  };

  const updateAssessment = async (ass: Assessment) => {
    try {
      await setDoc(doc(db, 'assessments', ass.id), ass, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `assessments/${ass.id}`);
    }
  };

  const deleteAssessment = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'assessments', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `assessments/${id}`);
    }
  };

  // GRADES
  const addGrade = async (gr: Grade) => {
    try {
      await setDoc(doc(db, 'grades', gr.id), gr);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `grades/${gr.id}`);
    }
  };

  const updateGrade = async (gr: Grade) => {
    try {
      await setDoc(doc(db, 'grades', gr.id), gr, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `grades/${gr.id}`);
    }
  };

  const deleteGrade = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'grades', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `grades/${id}`);
    }
  };

  return (
    <FirebaseContext.Provider value={{
      user,
      profile,
      loading,
      isAdmin,
      isAssociate,
      students,
      associates,
      donations,
      messages,
      schoolUsers,
      subjects,
      lessons,
      assessments,
      grades,

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

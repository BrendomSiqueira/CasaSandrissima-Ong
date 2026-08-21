import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomeView from './components/HomeView';
import AssociacaoView from './components/AssociacaoView';
import DoacaoView from './components/DoacaoView';
import ProjetosView from './components/ProjetosView';
import AreaAssociadoView from './components/AreaAssociadoView';
import { ActiveTab, Student, Associate, Donation } from './types';
import { useFirebase } from './firebaseContext';
import { useModal } from './components/ModalContext';

export default function App() {
  const [activeTab, setActiveTab ] = useState<ActiveTab>('home');
  const { confirm } = useModal();
  const { 
    students, 
    associates, 
    donations, 
    addStudent, 
    updateStudent,
    deleteStudent,
    addAssociate, 
    removeAssociate, 
    addDonation,
    updateDonation
  } = useFirebase();

  // Handle addition callbacks mapping to Firebase Context
  const handleAddStudent = async (newStudent: Student) => {
    await addStudent(newStudent);
  };

  const handleModifyStudents = async (updatedStudents: Student[]) => {
    // Locate modified or deleted students
    // Since we are changing locally-triggered arrays, we can reconcile changes
    // But inside AreaAssociadoView, we can also use direct context methods.
    // For compatibility with the existing prop signatures, we can check 
    // which student was changed, or simply loop/reconcile.
    // Better, let's look at the old array and see what changed:
    for (const st of updatedStudents) {
      const match = students.find(s => s.id === st.id);
      if (!match || JSON.stringify(match) !== JSON.stringify(st)) {
        await updateStudent(st);
      }
    }
    // Check for deletions
    for (const st of students) {
      if (!updatedStudents.some(s => s.id === st.id)) {
        await deleteStudent(st.id);
      }
    }
  };

  const handleAddAssociate = async (newAssociate: Associate) => {
    await addAssociate(newAssociate);
  };

  const handleRemoveAssociate = async (id: string) => {
    const isConfirmed = await confirm("Deseja realmente descadastrar este associado?", "Desvincular Associado", "warn");
    if (isConfirmed) {
      await removeAssociate(id);
    }
  };

  const handleAddDonation = async (newDonation: Donation) => {
    await addDonation(newDonation);
  };

  const renderActiveView = () => {
    switch (activeTab) {
      case 'home':
        return <HomeView setActiveTab={setActiveTab} />;
      case 'associacao':
        return (
          <AssociacaoView 
            onAddAssociate={handleAddAssociate} 
            associatesList={associates} 
          />
        );
      case 'doacoes':
        return (
          <DoacaoView 
            onAddDonation={handleAddDonation} 
            onUpdateDonation={updateDonation}
            donationsList={donations} 
          />
        );
      case 'projetos':
        return <ProjetosView setActiveTab={setActiveTab} />;
      case 'area_associado':
        return (
          <AreaAssociadoView 
            studentsList={students}
            onAddStudent={handleAddStudent}
            onModifyStudents={handleModifyStudents}
            associatesList={associates}
            onRemoveAssociate={handleRemoveAssociate}
            donationsList={donations}
          />
        );
      default:
        return <HomeView setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-emerald-50/60 via-white to-stone-100 text-stone-800 font-sans" id="app-root-container">
      
      {/* Dynamic Navbar */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      {/* Scroll indicator for aesthetic purposes */}
      <div className="h-1 bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600" />

      {/* Screen Frame Content Area */}
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 mb-12">
        <div id="active-tab-container">
          {renderActiveView()}
        </div>
      </main>

      {/* Stateful Footer */}
      <Footer setActiveTab={setActiveTab} />

    </div>
  );
}

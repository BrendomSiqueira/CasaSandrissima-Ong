import React, { useState, useRef } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomeView from './components/HomeView';
import AssociacaoView from './components/AssociacaoView';
import DoacaoView from './components/DoacaoView';
import ProjetosView from './components/ProjetosView';
import GaleriaView from './components/GaleriaView';
import AreaAssociadoView from './components/AreaAssociadoView';
import SocialLoginModal from './components/SocialLoginModal';
import CookieBanner from './components/CookieBanner';
import { ActiveTab, Student, Associate, Donation } from './types';
import { useFirebase } from './firebaseContext';
import { useModal } from './components/ModalContext';
import PencilLoader from './components/PencilLoader';
import { ShapeOverlaysTransition, ShapeOverlaysHandle } from './components/ShapeOverlaysTransition';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [selectedWorkshopId, setSelectedWorkshopId] = useState<string>('karate');
  const [sgeTargetTab, setSgeTargetTab] = useState<'users' | 'students' | 'subjects' | 'lessons' | 'grades' | 'boletim' | 'messages' | 'associates' | 'finance'>('students');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginReason, setLoginReason] = useState<'galeria' | 'doacoes' | 'portal' | 'geral' | 'aluno_apoiador'>('geral');
  const shapeOverlaysRef = useRef<ShapeOverlaysHandle | null>(null);

  const handleTabChange = (newTab: ActiveTab) => {
    if (newTab === activeTab) return;
    if (shapeOverlaysRef.current) {
      shapeOverlaysRef.current.triggerTransition(() => {
        setActiveTab(newTab);
        window.scrollTo({ top: 0, behavior: 'instant' });
      });
    } else {
      setActiveTab(newTab);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNavigateToWorkshop = (workshopId: string) => {
    if (shapeOverlaysRef.current) {
      shapeOverlaysRef.current.triggerTransition(() => {
        setSelectedWorkshopId(workshopId);
        setActiveTab('projetos');
        window.scrollTo({ top: 0, behavior: 'instant' });
      });
    } else {
      setSelectedWorkshopId(workshopId);
      setActiveTab('projetos');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNavigateToSgeTab = (tab: 'users' | 'students' | 'subjects' | 'lessons' | 'grades' | 'boletim' | 'messages' | 'associates' | 'finance') => {
    if (shapeOverlaysRef.current) {
      shapeOverlaysRef.current.triggerTransition(() => {
        setSgeTargetTab(tab);
        setActiveTab('area_associado');
        window.scrollTo({ top: 0, behavior: 'instant' });
      });
    } else {
      setSgeTargetTab(tab);
      setActiveTab('area_associado');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const { confirm } = useModal();
  const { 
    loading,
    user,
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

  const handleOpenLoginModal = (reason: 'galeria' | 'doacoes' | 'portal' | 'geral' | 'aluno_apoiador' = 'geral') => {
    setLoginReason(reason);
    setIsLoginModalOpen(true);
  };

  // Handle addition callbacks mapping to Firebase Context
  const handleAddStudent = async (newStudent: Student) => {
    await addStudent(newStudent);
  };

  const handleModifyStudents = async (updatedStudents: Student[]) => {
    for (const st of updatedStudents) {
      const match = students.find(s => s.id === st.id);
      if (!match || JSON.stringify(match) !== JSON.stringify(st)) {
        await updateStudent(st);
      }
    }
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
        return (
          <HomeView 
            setActiveTab={handleTabChange} 
            onSelectWorkshop={handleNavigateToWorkshop}
          />
        );
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
            onOpenLoginModal={handleOpenLoginModal}
          />
        );
      case 'projetos':
        return (
          <ProjetosView 
            setActiveTab={handleTabChange} 
            selectedProjectId={selectedWorkshopId}
            onSelectProject={setSelectedWorkshopId}
          />
        );
      case 'galeria':
        return (
          <GaleriaView 
            setActiveTab={handleTabChange} 
            onOpenLoginModal={handleOpenLoginModal} 
          />
        );
      case 'area_associado':
        return (
          <AreaAssociadoView 
            studentsList={students}
            onAddStudent={handleAddStudent}
            onModifyStudents={handleModifyStudents}
            associatesList={associates}
            onRemoveAssociate={handleRemoveAssociate}
            donationsList={donations}
            initialSgeTab={sgeTargetTab}
          />
        );
      default:
        return (
          <HomeView 
            setActiveTab={handleTabChange} 
            onSelectWorkshop={handleNavigateToWorkshop}
          />
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative text-stone-800 font-sans selection:bg-emerald-200 selection:text-emerald-900 overflow-x-hidden" id="app-root-container">
      
      {/* Morphing Shape Overlays Fluid Wave Transition System (Entrance & Tab Navigation) */}
      <ShapeOverlaysTransition ref={shapeOverlaysRef} />

      {/* Dynamic Ambient Background: Soft White-to-Green Gradient & Glows */}
      <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden" aria-hidden="true" id="site-ambient-background">
        {/* Core Vertical Gradient: Crisp Pure White at Top -> Delicate Mint Mist -> Refreshing Soft Green at Base */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#ffffff] via-[#f3faf6] via-[35%] to-[#bbf7d0]/65" />
        
        {/* Ambient Radial Mesh Highlight Top-Right */}
        <div className="absolute -top-[12%] -right-[8%] w-[680px] h-[680px] rounded-full bg-gradient-to-br from-emerald-100/60 via-teal-100/35 to-transparent blur-[110px] opacity-85" />
        
        {/* Ambient Radial Mesh Highlight Mid-Left */}
        <div className="absolute top-[28%] -left-[12%] w-[720px] h-[720px] rounded-full bg-gradient-to-tr from-emerald-200/40 via-emerald-100/25 to-transparent blur-[120px] opacity-75" />
        
        {/* Ambient Radial Glow Lower Section */}
        <div className="absolute bottom-[8%] right-[5%] w-[800px] h-[600px] rounded-full bg-gradient-to-t from-emerald-300/35 via-teal-100/30 to-transparent blur-[130px] opacity-80" />
        
        {/* Subtle Micro-pattern Grid for Modern Tactile Depth */}
        <div className="absolute inset-0 bg-[radial-gradient(#059669_0.65px,transparent_0.65px)] [background-size:28px_28px] opacity-[0.028]" />
      </div>

      {/* Dynamic Navbar */}
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={handleTabChange} 
        onOpenLoginModal={handleOpenLoginModal} 
        onNavigateToSgeTab={handleNavigateToSgeTab}
      />
      
      {/* Subtle Glowing Header Accent Bar */}
      <div className="h-[3px] bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-600 shadow-[0_1px_8px_rgba(16,185,129,0.35)]" />

      {/* Screen Frame Content Area */}
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 mb-12 relative z-10">
        <div id="active-tab-container">
          {renderActiveView()}
        </div>
      </main>

      {/* Stateful Footer */}
      <Footer 
        setActiveTab={handleTabChange} 
        onOpenLoginModal={handleOpenLoginModal} 
      />

      {/* Social Login Modal Accessible from anywhere */}
      <SocialLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        reason={loginReason}
      />

      {/* Cookie Consent Notification & Preferences */}
      <CookieBanner />

    </div>
  );
}

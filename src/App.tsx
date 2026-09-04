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
import SiteAmbientBackground from './components/SiteAmbientBackground';
import DemoModeBanner from './components/DemoModeBanner';
import MobileBottomNav from './components/MobileBottomNav';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [selectedWorkshopId, setSelectedWorkshopId] = useState<string>('karate');
  const [sgeTargetTab, setSgeTargetTab] = useState<'users' | 'students' | 'subjects' | 'lessons' | 'grades' | 'boletim' | 'messages' | 'associates' | 'finance'>('students');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginReason, setLoginReason] = useState<'galeria' | 'doacoes' | 'portal' | 'geral' | 'aluno_apoiador'>('geral');
  const shapeOverlaysRef = useRef<ShapeOverlaysHandle | null>(null);

  // Normal tab navigation is fast and direct.
  // The shape overlay wave animation is reserved specifically for the Galeria section.
  const handleTabChange = (newTab: ActiveTab) => {
    if (newTab === activeTab) return;

    if (newTab === 'galeria' && shapeOverlaysRef.current) {
      shapeOverlaysRef.current.triggerTransition(() => {
        setActiveTab('galeria');
        window.scrollTo({ top: 0, behavior: 'instant' });
      });
    } else {
      setActiveTab(newTab);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNavigateToWorkshop = (workshopId: string) => {
    setSelectedWorkshopId(workshopId);
    setActiveTab('projetos');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateToSgeTab = (tab: 'users' | 'students' | 'subjects' | 'lessons' | 'grades' | 'boletim' | 'messages' | 'associates' | 'finance') => {
    setSgeTargetTab(tab);
    setActiveTab('area_associado');
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
    <div className="min-h-screen flex flex-col relative text-stone-800 font-sans selection:bg-emerald-200 selection:text-emerald-900 overflow-x-clip bg-transparent" id="app-root-container">
      
      {/* Morphing Shape Overlays Fluid Wave Transition System (Restricted exclusively to Galeria) */}
      <ShapeOverlaysTransition ref={shapeOverlaysRef} autoPlayOnMount={false} />

      {/* Dynamic Ambient Background: Crafted with reference ribbons, swooshes, waves & tactile micro-texture */}
      <SiteAmbientBackground />

      {/* Sticky Header with Navbar, Demo Mode Banner and Wave Accent Ribbon */}
      <header className="sticky top-0 z-40 w-full" id="site-header">
        {/* Interactive Demo Mode Banner (Simulated, zero-persistence mode) */}
        <DemoModeBanner 
          onNavigateToTab={handleTabChange} 
          onNavigateToSgeTab={handleNavigateToSgeTab} 
        />
        <Navbar 
          activeTab={activeTab} 
          setActiveTab={handleTabChange} 
          onOpenLoginModal={handleOpenLoginModal} 
          onNavigateToSgeTab={handleNavigateToSgeTab}
        />
        {/* Glowing Header Wave Accent Ribbon */}
        <div className="h-1 bg-gradient-to-r from-emerald-600 via-lime-400 via-40% to-teal-700 shadow-[0_2px_10px_rgba(16,185,129,0.4)] relative z-20" />
      </header>

      {/* Screen Frame Content Area */}
      <main className="flex-grow max-w-7xl mx-auto w-full px-3 sm:px-6 lg:px-8 py-4 sm:py-6 mb-16 md:mb-12 relative z-10">
        <div id="active-tab-container">
          {renderActiveView()}
        </div>
      </main>

      {/* Stateful Footer */}
      <Footer 
        setActiveTab={handleTabChange} 
        onOpenLoginModal={handleOpenLoginModal} 
      />

      {/* Fixed Ergonomic Mobile Dock Navigation Bar */}
      <MobileBottomNav 
        activeTab={activeTab} 
        setActiveTab={handleTabChange} 
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

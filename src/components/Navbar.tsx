import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Menu, 
  X, 
  Home, 
  Users, 
  HeartHandshake, 
  FolderHeart, 
  Image as ImageIcon, 
  LogOut, 
  User as UserIcon, 
  ChevronDown,
  GraduationCap,
  Sparkles
} from 'lucide-react';
import { ActiveTab } from '../types';
import { useFirebase } from '../firebaseContext';
import logoImg from '../assets/images/casa_sandrissima_green_white_logo_original.png';
import TactileButton from './TactileButton';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenLoginModal: (reason?: 'galeria' | 'doacoes' | 'portal' | 'geral' | 'aluno_apoiador') => void;
  onNavigateToSgeTab?: (tab: 'students' | 'users' | 'subjects' | 'lessons' | 'grades' | 'boletim' | 'messages' | 'associates' | 'finance') => void;
}

export default function Navbar({ activeTab, setActiveTab, onOpenLoginModal, onNavigateToSgeTab }: NavbarProps) {
  const { user, logout, isMaster, isDemoMode, demoRole, enterDemoMode, exitDemoMode } = useFirebase();
  const [isOpen, setIsOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 8);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Check if current authenticated user has Master privileges
  const isMasterUser = isMaster || 
    user?.email?.toLowerCase() === 'brendomdev@gmail.com' || 
    user?.email?.toLowerCase() === 'brendomsiqueira96@gmail.com' || 
    user?.email?.toLowerCase() === 'hardcoders@gmail.com';

  // Clean public navigation tabs
  const navItems = [
    { id: 'home', label: 'Início', icon: Home },
    { id: 'associacao', label: 'A Associação', icon: Users },
    { id: 'projetos', label: 'Projetos', icon: FolderHeart },
    { id: 'galeria', label: 'Galeria', icon: ImageIcon },
    { id: 'doacoes', label: 'Doações', icon: HeartHandshake },
  ];

  const handleNavClick = (tabId: ActiveTab) => {
    setActiveTab(tabId);
    setIsOpen(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
      setUserDropdownOpen(false);
      setIsOpen(false);
    } catch (err) {
      console.error('Erro ao sair:', err);
    }
  };

  const handleStudentSupporterClick = () => {
    if (user) {
      setUserDropdownOpen(!userDropdownOpen);
    } else {
      onOpenLoginModal('aluno_apoiador');
    }
  };

  return (
    <nav 
      className={`w-full transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/95 backdrop-blur-md shadow-md border-b border-emerald-200/80' 
          : 'bg-white/90 backdrop-blur-md border-b border-emerald-100/60 shadow-xs'
      }`} 
      id="main-navbar"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* Logo Section */}
          <div 
            className="flex items-center gap-3 cursor-pointer group" 
            onClick={() => setActiveTab('home')}
            id="nav-logo-container"
          >
            <img 
              src={logoImg} 
              alt="Logo Casa Sandríssima" 
              className="h-10 w-10 sm:h-12 sm:w-12 object-contain group-hover:scale-105 transition-transform" 
              referrerPolicy="no-referrer"
              id="logo-img"
            />
            <div>
              <span className="font-sans font-bold text-base sm:text-lg tracking-tight text-stone-800 block leading-tight">
                Casa Sandríssima
              </span>
              <span className="text-[9px] sm:text-[10px] font-mono uppercase tracking-widest text-emerald-600 block">
                ONG Comunitária
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links (Public Tabs Only) */}
          <div className="hidden md:flex space-x-1 items-center" id="desktop-nav-links">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-link-${item.id}`}
                  onClick={() => handleNavClick(item.id as ActiveTab)}
                  className={`relative px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                    isActive 
                      ? 'text-emerald-700 font-semibold bg-emerald-50/60' 
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeTabUnderline"
                      className="absolute bottom-0 left-3 right-3 h-0.5 bg-emerald-600 rounded-full"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Desktop Action Buttons: Supporter/Student Login & Demo Mode */}
          <div className="hidden md:flex items-center gap-2" id="desktop-auth-section">
            
            {/* Supporter & Student Login / Profile Button */}
            {!user ? (
              <TactileButton
                type="button"
                id="btn-login-aluno-apoiador"
                variant="glass"
                size="sm"
                onClick={handleStudentSupporterClick}
                title="Acesso para Alunos e Apoiadores"
                icon={<UserIcon className="h-4 w-4 text-emerald-700" />}
              >
                Alunos & Apoiadores
              </TactileButton>
            ) : (
              <div className="relative">
                <button
                  type="button"
                  id="btn-user-profile-menu"
                  onClick={handleStudentSupporterClick}
                  title={isDemoMode ? `Modo Demonstração Ativo (${demoRole})` : "Perfil do Usuário"}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                    isDemoMode
                      ? 'border-amber-300 bg-amber-50/90 hover:bg-amber-100 text-amber-950 shadow-xs'
                      : 'border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100/80 text-emerald-900'
                  }`}
                >
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt=""
                      className={`w-5 h-5 rounded-full object-cover border ${isDemoMode ? 'border-amber-400' : 'border-emerald-400'}`}
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className={`w-5 h-5 rounded-full text-white flex items-center justify-center text-[10px] font-bold ${isDemoMode ? 'bg-amber-600' : 'bg-emerald-600'}`}>
                      {(user.displayName || user.email || 'U')[0].toUpperCase()}
                    </div>
                  )}
                  <span className="max-w-[100px] truncate">{user.displayName?.split(' ')[0] || 'Aluno / Apoiador'}</span>
                  {isDemoMode && (
                    <span className="text-[9px] px-1.5 py-0.5 bg-amber-500 text-stone-950 rounded font-mono font-black uppercase tracking-wider">
                      Demo
                    </span>
                  )}
                  <ChevronDown className="h-3 w-3 text-stone-500" />
                </button>

                {/* User Dropdown */}
                <AnimatePresence>
                  {userDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-stone-150 p-2 z-50 text-left"
                      id="user-dropdown-menu"
                    >
                      <div className={`p-3 border-b ${isDemoMode ? 'bg-amber-50/50 border-amber-100 rounded-xl mb-1' : 'border-stone-100'}`}>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-stone-900 block truncate">
                            {user.displayName || 'Aluno / Apoiador'}
                          </span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${
                            isDemoMode ? 'bg-amber-200 text-amber-900 font-extrabold' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {isDemoMode ? `DEMO • ${demoRole.toUpperCase()}` : 'Conectado'}
                          </span>
                        </div>
                        <span className="text-[11px] text-stone-400 font-mono block truncate mt-0.5">
                          {user.email}
                        </span>
                        {isDemoMode && (
                          <span className="text-[10px] text-amber-700 font-medium block mt-1">
                            ⚡ Operações simuladas (sem gravação no banco)
                          </span>
                        )}
                      </div>

                      <div className="py-1 space-y-0.5">
                        <button
                          onClick={() => {
                            setActiveTab('projetos');
                            setUserDropdownOpen(false);
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-stone-700 hover:bg-stone-50 rounded-xl transition-colors cursor-pointer"
                        >
                          <FolderHeart className="h-4 w-4 text-emerald-600" />
                          <span>Oficinas & Projetos</span>
                        </button>

                        <button
                          onClick={() => {
                            setActiveTab('doacoes');
                            setUserDropdownOpen(false);
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-stone-700 hover:bg-stone-50 rounded-xl transition-colors cursor-pointer"
                        >
                          <HeartHandshake className="h-4 w-4 text-emerald-600" />
                          <span>Histórico de Apoio / Doações</span>
                        </button>

                        {/* Master Shortcut: Cadastro de Alunos nas Turmas */}
                        {isMasterUser && (
                          <button
                            id="user-dropdown-cadastro-alunos"
                            onClick={() => {
                              if (onNavigateToSgeTab) {
                                onNavigateToSgeTab('students');
                              } else {
                                setActiveTab('area_associado');
                              }
                              setUserDropdownOpen(false);
                            }}
                            className="w-full flex items-center justify-between px-3 py-2 text-xs font-bold text-emerald-900 bg-emerald-50 hover:bg-emerald-100/90 rounded-xl transition-all border border-emerald-200/80 cursor-pointer shadow-2xs group"
                          >
                            <div className="flex items-center gap-2.5">
                              <div className="p-1 rounded-lg bg-emerald-600 text-white shadow-2xs group-hover:scale-105 transition-transform">
                                <Users className="h-3.5 w-3.5" />
                              </div>
                              <span className="text-left font-extrabold text-emerald-950">Cadastro de Alunos</span>
                            </div>
                            <span className="text-[9px] px-1.5 py-0.5 bg-emerald-700 text-white rounded font-mono font-black uppercase tracking-wider">
                              Master
                            </span>
                          </button>
                        )}

                        <button
                          onClick={() => {
                            setActiveTab('area_associado');
                            setUserDropdownOpen(false);
                          }}
                          className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold rounded-xl transition-colors cursor-pointer ${
                            activeTab === 'area_associado' 
                              ? 'bg-emerald-50 text-emerald-750' 
                              : 'text-stone-700 hover:bg-stone-50'
                          }`}
                        >
                          <GraduationCap className="h-4 w-4 text-emerald-600" />
                          <span>Painel do Sistema (SGE / Gestão)</span>
                        </button>
                      </div>

                      <div className="pt-1 border-t border-stone-100">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 rounded-xl font-bold transition-colors cursor-pointer"
                        >
                          <LogOut className="h-4 w-4 text-rose-600" />
                          <span>Encerrar Sessão</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

          </div>

          {/* Mobile Actions: Supporter/Student + Menu Toggle */}
          <div className="md:hidden flex items-center gap-2">
            
            {/* Student/Supporter Button on Mobile */}
            {!user ? (
              <button
                type="button"
                id="mobile-login-aluno-apoiador"
                onClick={handleStudentSupporterClick}
                title="Alunos & Apoiadores"
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 transition-all cursor-pointer"
              >
                <UserIcon className="h-3.5 w-3.5 text-emerald-600" />
                <span>Alunos & Apoiadores</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsOpen(true)}
                className="p-1.5 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 flex items-center gap-1 cursor-pointer text-xs font-bold"
                title="Meu Perfil"
              >
                <UserIcon className="h-4 w-4 text-emerald-600" />
              </button>
            )}

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              id="mobile-menu-toggle"
              className="p-2 rounded-lg text-stone-500 hover:bg-stone-50 hover:text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              aria-label="Abrir menu"
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden border-t border-stone-100 bg-white"
            id="mobile-drawer"
          >
            <div className="px-3 pt-2 pb-4 space-y-1">
              
              {/* User Session Info on Mobile (if logged in) */}
              {user ? (
                <div className="p-3 mb-2 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    {user.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt=""
                        className="w-8 h-8 rounded-full object-cover border border-emerald-400"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                        {(user.displayName || user.email || 'U')[0].toUpperCase()}
                      </div>
                    )}
                    <div className="text-left text-xs">
                      <span className="font-bold text-stone-900 block truncate max-w-[170px]">
                        {user.displayName || 'Aluno / Apoiador'}
                      </span>
                      <span className="text-stone-500 text-[10px] font-mono block truncate max-w-[170px]">
                        {user.email}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="p-1.5 text-rose-600 hover:bg-rose-100 rounded-lg text-xs font-bold cursor-pointer"
                    title="Sair"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="p-2 mb-2 bg-stone-50 rounded-2xl border border-stone-200/70">
                  <TactileButton
                    type="button"
                    variant="primary"
                    size="md"
                    className="w-full"
                    onClick={() => {
                      onOpenLoginModal('aluno_apoiador');
                      setIsOpen(false);
                    }}
                    icon={<UserIcon className="h-4 w-4" />}
                  >
                    Acesso & Cadastro
                  </TactileButton>
                </div>
              )}

              {/* Public Nav Items */}
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    id={`mobile-nav-link-${item.id}`}
                    onClick={() => handleNavClick(item.id as ActiveTab)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                      isActive 
                        ? 'bg-emerald-50 text-emerald-700 font-semibold' 
                        : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-5 w-5 text-emerald-650" />
                      <span>{item.label}</span>
                    </div>
                  </button>
                );
              })}

              {/* Discreet Mobile Admin Portal Entry (Only if user is logged in) */}
              {user && (
                <div className="pt-2 border-t border-stone-100 space-y-1">
                  {isMasterUser && (
                    <button
                      onClick={() => {
                        if (onNavigateToSgeTab) {
                          onNavigateToSgeTab('students');
                        } else {
                          setActiveTab('area_associado');
                        }
                        setIsOpen(false);
                      }}
                      className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold bg-emerald-50 text-emerald-950 border border-emerald-200 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <Users className="h-5 w-5 text-emerald-600" />
                        <span>Cadastro de Alunos nas Turmas</span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 bg-emerald-700 text-white rounded-md font-mono font-bold uppercase tracking-wider">
                        Master
                      </span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setActiveTab('area_associado');
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-colors cursor-pointer ${
                      activeTab === 'area_associado'
                        ? 'bg-emerald-50 text-emerald-800'
                        : 'bg-stone-100 text-stone-800 hover:bg-stone-200'
                    }`}
                  >
                    <GraduationCap className="h-5 w-5 text-emerald-600" />
                    <span>Painel Administrativo & SGE</span>
                  </button>
                </div>
              )}

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

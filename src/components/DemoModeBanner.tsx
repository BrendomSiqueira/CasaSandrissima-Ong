import React, { useState } from 'react';
import { useFirebase } from '../firebaseContext';
import { DemoRole, ActiveTab } from '../types';
import { 
  Sparkles, 
  RotateCcw, 
  X, 
  ShieldAlert, 
  ChevronDown, 
  ChevronUp, 
  UserCheck, 
  GraduationCap, 
  HeartHandshake, 
  Users,
  Compass,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface DemoModeBannerProps {
  onNavigateToTab?: (tab: ActiveTab) => void;
  onNavigateToSgeTab?: (tab: 'users' | 'students' | 'subjects' | 'lessons' | 'grades' | 'boletim' | 'messages' | 'associates' | 'finance') => void;
}

export const DemoModeBanner: React.FC<DemoModeBannerProps> = ({ 
  onNavigateToTab, 
  onNavigateToSgeTab 
}) => {
  const { 
    isDemoMode, 
    demoRole, 
    setDemoRole, 
    resetDemoData, 
    exitDemoMode,
    user 
  } = useFirebase();

  const [isExpanded, setIsExpanded] = useState(false);
  const [showToast, setShowToast] = useState<string | null>(null);

  if (!isDemoMode) return null;

  const triggerToast = (msg: string) => {
    setShowToast(msg);
    setTimeout(() => setShowToast(null), 3000);
  };

  const handleRoleChange = (newRole: DemoRole) => {
    setDemoRole(newRole);
    triggerToast(`Papel alterado para: ${getRoleLabel(newRole)}`);
  };

  const handleReset = () => {
    resetDemoData();
    triggerToast('Base de dados de demonstração restaurada ao estado original!');
  };

  const getRoleLabel = (role: DemoRole) => {
    switch (role) {
      case 'master': return 'Master (Acesso Total / Super Admin)';
      case 'professor': return 'Professor (Pedagógico / SGE)';
      case 'associate': return 'Apoiador / Voluntário';
      case 'student': return 'Aluno / Beneficiário';
    }
  };

  return (
    <div className="w-full bg-gradient-to-r from-amber-500 via-emerald-600 to-teal-700 text-white shadow-md relative z-30 transition-all">
      {/* Toast Feedback Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-4 py-2 bg-stone-900/95 text-emerald-300 text-xs font-bold rounded-xl shadow-xl border border-emerald-500/40 flex items-center gap-2 z-50 pointer-events-none"
          >
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>{showToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Top Strip */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex flex-wrap items-center justify-between gap-3 text-xs">
        
        {/* Left: Mode Badge & Description */}
        <div className="flex items-center gap-2.5">
          <span className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-400/20 backdrop-blur-sm border border-amber-300/40 text-amber-100 rounded-full font-extrabold uppercase tracking-wider text-[10px] animate-pulse">
            <Sparkles className="h-3 w-3 text-amber-300" />
            Modo Demonstração
          </span>
          <p className="hidden md:inline text-amber-50 font-medium">
            Navegue livremente por todas as telas. Ações e cadastros são <strong className="text-white font-bold underline decoration-amber-300 decoration-2">simulados em memória sem persistência</strong> no Firebase.
          </p>
        </div>

        {/* Right: Active Role, Controls & Expand Button */}
        <div className="flex items-center gap-2 ml-auto">
          {/* Active Profile Pill */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-black/20 rounded-lg text-emerald-100 border border-white/10 font-semibold">
            <span className="text-[10px] text-white/70 uppercase">Perfil:</span>
            <span className="text-amber-200 font-bold capitalize">{demoRole}</span>
          </div>

          {/* Quick Toggle Details */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 px-2.5 py-1 bg-white/15 hover:bg-white/25 active:bg-white/30 rounded-lg transition-colors font-bold cursor-pointer"
            title="Alternar painel de controle da demonstração"
          >
            <span>{isExpanded ? 'Ocultar Opções' : 'Trocar Perfil / Ajustes'}</span>
            {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>

          {/* Reset Demo State Button */}
          <button
            onClick={handleReset}
            className="flex items-center gap-1 px-2.5 py-1 bg-amber-400/20 hover:bg-amber-400/30 text-amber-100 border border-amber-300/30 rounded-lg transition-colors font-bold cursor-pointer"
            title="Restaurar dados padrão da demonstração"
          >
            <RotateCcw className="h-3 w-3 text-amber-300" />
            <span className="hidden sm:inline">Restaurar Dados</span>
          </button>

          {/* Exit Demo Mode */}
          <button
            onClick={exitDemoMode}
            className="flex items-center gap-1 px-2.5 py-1 bg-rose-600/80 hover:bg-rose-600 active:bg-rose-700 text-white rounded-lg transition-colors font-bold cursor-pointer shadow-2xs"
            title="Sair do Modo Demonstração"
          >
            <X className="h-3.5 w-3.5" />
            <span>Sair</span>
          </button>
        </div>
      </div>

      {/* Expanded Control Drawer */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-white/15 bg-stone-900/90 text-stone-100 backdrop-blur-md"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 space-y-3">
              
              {/* Profile Selection Row */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                <div>
                  <span className="font-extrabold text-amber-400 uppercase tracking-wider text-[11px] block">
                    Simular Perfil de Acesso:
                  </span>
                  <span className="text-stone-300 text-[11px]">
                    Alterne o perfil instantaneamente para inspecionar permissões específicas de cada nível do sistema.
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    onClick={() => handleRoleChange('master')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all text-xs border ${
                      demoRole === 'master' 
                        ? 'bg-amber-500 text-stone-950 border-amber-300 shadow-md ring-2 ring-amber-400/40' 
                        : 'bg-white/5 hover:bg-white/10 text-stone-200 border-white/10'
                    }`}
                  >
                    <ShieldAlert className="h-3.5 w-3.5" />
                    <span>Master (Diretor)</span>
                  </button>

                  <button
                    onClick={() => handleRoleChange('professor')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all text-xs border ${
                      demoRole === 'professor' 
                        ? 'bg-emerald-500 text-stone-950 border-emerald-300 shadow-md ring-2 ring-emerald-400/40' 
                        : 'bg-white/5 hover:bg-white/10 text-stone-200 border-white/10'
                    }`}
                  >
                    <GraduationCap className="h-3.5 w-3.5" />
                    <span>Professor (SGE)</span>
                  </button>

                  <button
                    onClick={() => handleRoleChange('associate')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all text-xs border ${
                      demoRole === 'associate' 
                        ? 'bg-teal-500 text-stone-950 border-teal-300 shadow-md ring-2 ring-teal-400/40' 
                        : 'bg-white/5 hover:bg-white/10 text-stone-200 border-white/10'
                    }`}
                  >
                    <HeartHandshake className="h-3.5 w-3.5" />
                    <span>Apoiador / Doador</span>
                  </button>

                  <button
                    onClick={() => handleRoleChange('student')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all text-xs border ${
                      demoRole === 'student' 
                        ? 'bg-cyan-500 text-stone-950 border-cyan-300 shadow-md ring-2 ring-cyan-400/40' 
                        : 'bg-white/5 hover:bg-white/10 text-stone-200 border-white/10'
                    }`}
                  >
                    <UserCheck className="h-3.5 w-3.5" />
                    <span>Aluno / Família</span>
                  </button>
                </div>
              </div>

              {/* Navigation Shortcuts */}
              <div className="pt-2 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                <div className="flex items-center gap-1.5 text-stone-400">
                  <Compass className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Atalhos Rápidos de Exploração:</span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => {
                      if (onNavigateToSgeTab) onNavigateToSgeTab('students');
                      else if (onNavigateToTab) onNavigateToTab('area_associado');
                    }}
                    className="px-2.5 py-1 bg-white/5 hover:bg-white/15 text-stone-200 rounded-lg transition-colors border border-white/10 font-medium cursor-pointer"
                  >
                    🎓 SGE - Gestão Escolar
                  </button>

                  <button
                    onClick={() => {
                      if (onNavigateToSgeTab) onNavigateToSgeTab('finance');
                      else if (onNavigateToTab) onNavigateToTab('area_associado');
                    }}
                    className="px-2.5 py-1 bg-white/5 hover:bg-white/15 text-stone-200 rounded-lg transition-colors border border-white/10 font-medium cursor-pointer"
                  >
                    💰 Transparência Financeira
                  </button>

                  <button
                    onClick={() => onNavigateToTab && onNavigateToTab('doacoes')}
                    className="px-2.5 py-1 bg-white/5 hover:bg-white/15 text-stone-200 rounded-lg transition-colors border border-white/10 font-medium cursor-pointer"
                  >
                    🤝 Mural de Doações
                  </button>

                  <button
                    onClick={() => onNavigateToTab && onNavigateToTab('projetos')}
                    className="px-2.5 py-1 bg-white/5 hover:bg-white/15 text-stone-200 rounded-lg transition-colors border border-white/10 font-medium cursor-pointer"
                  >
                    🥋 Oficinas & Projetos
                  </button>

                  <button
                    onClick={() => onNavigateToTab && onNavigateToTab('galeria')}
                    className="px-2.5 py-1 bg-white/5 hover:bg-white/15 text-stone-200 rounded-lg transition-colors border border-white/10 font-medium cursor-pointer"
                  >
                    📸 Galeria de Fotos
                  </button>
                </div>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DemoModeBanner;

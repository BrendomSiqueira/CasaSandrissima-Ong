import React from 'react';
import { 
  Home, 
  Users, 
  FolderHeart, 
  ImageIcon, 
  HeartHandshake, 
  GraduationCap 
} from 'lucide-react';
import { ActiveTab } from '../types';

interface MobileBottomNavProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
}

export default function MobileBottomNav({ activeTab, setActiveTab }: MobileBottomNavProps) {
  const navItems = [
    { id: 'home' as ActiveTab, label: 'Início', icon: Home },
    { id: 'associacao' as ActiveTab, label: 'A ONG', icon: Users },
    { id: 'projetos' as ActiveTab, label: 'Oficinas', icon: FolderHeart },
    { id: 'galeria' as ActiveTab, label: 'Galeria', icon: ImageIcon },
    { id: 'doacoes' as ActiveTab, label: 'Doar', icon: HeartHandshake, highlight: true },
    { id: 'area_associado' as ActiveTab, label: 'Aluno/SGE', icon: GraduationCap },
  ];

  const handleSelectTab = (tabId: ActiveTab) => {
    setActiveTab(tabId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <nav 
      id="mobile-bottom-navigation-bar" 
      aria-label="Navegação inferior mobile"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-emerald-100 shadow-[0_-4px_20px_rgba(0,0,0,0.07)] px-2 pt-2 pb-[max(0.6rem,env(safe-area-inset-bottom))] transition-all"
    >
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          if (item.highlight) {
            return (
              <button
                key={item.id}
                id={`mobile-dock-btn-${item.id}`}
                onClick={() => handleSelectTab(item.id)}
                className="flex flex-col items-center justify-center -mt-3.5 group cursor-pointer focus:outline-none"
                aria-current={isActive ? 'page' : undefined}
              >
                <div 
                  className={`w-11 h-11 rounded-full flex items-center justify-center shadow-md transition-all duration-200 group-active:scale-90 ${
                    isActive 
                      ? 'bg-gradient-to-tr from-emerald-600 to-teal-500 text-white ring-3 ring-emerald-300/40 shadow-emerald-600/30' 
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <span 
                  className={`text-[9.5px] tracking-tight font-extrabold mt-0.5 transition-colors ${
                    isActive ? 'text-emerald-700' : 'text-stone-600 group-hover:text-emerald-700'
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={item.id}
              id={`mobile-dock-btn-${item.id}`}
              onClick={() => handleSelectTab(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-1.5 min-w-[50px] rounded-xl transition-all duration-150 cursor-pointer group focus:outline-none ${
                isActive 
                  ? 'text-emerald-700 font-black' 
                  : 'text-stone-500 hover:text-stone-800'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              <div className="relative">
                <Icon 
                  className={`h-5 w-5 transition-transform duration-150 group-active:scale-90 ${
                    isActive ? 'text-emerald-600 stroke-[2.5]' : 'stroke-[1.8]'
                  }`} 
                />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-emerald-600 rounded-full" />
                )}
              </div>
              <span 
                className={`text-[10px] tracking-tight leading-none mt-1 transition-all ${
                  isActive ? 'font-black text-emerald-800' : 'font-medium'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

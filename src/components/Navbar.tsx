import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, Home, Users, HeartHandshake, FolderHeart, GraduationCap } from 'lucide-react';
import { ActiveTab } from '../types';
import logoImg from '../assets/images/casa_sandrissima_green_white_logo_1779323893215.png';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
}

export default function Navbar({ activeTab, setActiveTab }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Início', icon: Home },
    { id: 'associacao', label: 'A Associação', icon: Users },
    { id: 'doacoes', label: 'Doações', icon: HeartHandshake },
    { id: 'projetos', label: 'Projetos', icon: FolderHeart },
    { id: 'area_associado', label: 'Portal', icon: GraduationCap },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-stone-100 shadow-sm" id="main-navbar">
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
              className="h-10 w-10 sm:h-12 sm:w-12 rounded-full object-cover border border-stone-200/60 shadow-sm group-hover:scale-105 transition-transform" 
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

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-1 items-center" id="desktop-nav-links">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-link-${item.id}`}
                  onClick={() => setActiveTab(item.id as ActiveTab)}
                  className={`relative px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                    isActive 
                      ? 'text-emerald-700 font-semibold' 
                      : 'text-stone-500 hover:text-stone-900 hover:bg-stone-50'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                  {isActive && (
                    <motion.div
                      layoutId="activeTabUnderline"
                      className="absolute bottom-0 left-4 right-4 h-0.5 bg-emerald-600 rounded-full"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
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
            <div className="px-2 pt-2 pb-4 space-y-1 sm:px-3">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    id={`mobile-nav-link-${item.id}`}
                    onClick={() => {
                      setActiveTab(item.id as ActiveTab);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-all cursor-pointer ${
                      isActive 
                        ? 'bg-emerald-50 text-emerald-700 font-semibold' 
                        : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
                    }`}
                  >
                    <Icon className="h-5 w-5 text-emerald-650" />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

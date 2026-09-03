import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, ChevronLeft, ChevronRight, MessageSquare, Share2, Sparkles, User, Layers, Grid, Quote, ExternalLink } from 'lucide-react';
import { Donation } from '../types';
import logoImg from '../assets/images/casa_sandrissima_green_white_logo_1779323893215.png';
import logoWhiteImg from '../assets/images/casa_sandrissima_white_logo.png';
import TactileButton from './TactileButton';

interface DonorCommentsShowcaseProps {
  donations: Donation[];
  setActiveTab: (tab: any) => void;
}

export default function DonorCommentsShowcase({ donations, setActiveTab }: DonorCommentsShowcaseProps) {
  const approvedDonations = donations.filter((d) => d.approved === true);
  
  // Default mock/fallback data if none exists yet
  const displayDonations: (Donation | { id: string; donorName: string; description: string; amount?: number; date?: string; approved?: boolean })[] = 
    approvedDonations.length > 0 
      ? approvedDonations 
      : [
          {
            id: 'sample-1',
            donorName: 'Roberto Santos',
            description: 'Muito orgulho em apoiar este projeto incrível de Franca! Que a Casa Sandríssima continue transformando a vida de tantas famílias com arte, amor e educação.',
            amount: 50,
            date: '2026-08-20'
          },
          {
            id: 'sample-2',
            donorName: 'Carlos Alberto Lima',
            description: 'Parabéns a todo o time de voluntários e professores! O trabalho com as crianças na capoeira e reforço escolar faz toda a diferença.',
            amount: 100,
            date: '2026-08-18'
          },
          {
            id: 'sample-3',
            donorName: 'Mariana Azevedo',
            description: 'Fiz minha doação mensal com muita alegria. Cada semente plantada aqui floresce no coração da nossa comunidade.',
            amount: 75,
            date: '2026-08-15'
          },
          {
            id: 'sample-4',
            donorName: 'Família Oliveira & Amigos',
            description: 'Apoio incondicional à Casa Sandríssima. Transparência, carinho e acolhimento real para quem mais precisa.',
            amount: 120,
            date: '2026-08-10'
          }
        ];

  const [activeIndex, setActiveIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'showcase' | 'grid'>('showcase');
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto rotate cards in showcase mode
  useEffect(() => {
    if (!isAutoPlaying || viewMode !== 'showcase' || displayDonations.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % displayDonations.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, viewMode, displayDonations.length]);

  const handleNext = () => {
    setIsAutoPlaying(false);
    setActiveIndex((prev) => (prev + 1) % displayDonations.length);
  };

  const handlePrev = () => {
    setIsAutoPlaying(false);
    setActiveIndex((prev) => (prev - 1 + displayDonations.length) % displayDonations.length);
  };

  const activeDonor = displayDonations[activeIndex] || displayDonations[0];

  return (
    <section 
      className="donor-comments-showcase-section relative overflow-hidden bg-white/80 backdrop-blur-md rounded-3xl p-6 sm:p-8 lg:p-12 border border-emerald-100/80 shadow-sm hover:shadow-md transition-shadow" 
      id="donor-gratitude-wall"
    >
      {/* Subtle Radial Glow identical to Hero card */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-100/35 via-transparent to-transparent opacity-70 pointer-events-none -z-10" />

      {/* Header bar with counter and mode toggle */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 mb-6 border-b border-emerald-100">
        <div className="text-left space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100/80 text-emerald-900 text-xs font-bold font-mono tracking-wide uppercase border border-emerald-200/80">
            <Sparkles className="w-3.5 h-3.5 text-emerald-700 animate-spin" style={{ animationDuration: '4s' }} />
            Mural de Gratidão & Depoimentos
          </div>
          <h2 className="font-sans font-extrabold text-2xl sm:text-3xl text-stone-900 tracking-tight">
            Vozes que Fazem a <span className="green-text-highlight font-black">Diferença</span>
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 max-w-xl">
            Mensagens de carinho, apoio e encorajamento deixadas pelos amigos e doadores da Casa Sandríssima.
          </p>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto justify-between sm:justify-end">
          {/* Mode Switcher */}
          <div className="inline-flex p-1 rounded-xl bg-emerald-100/70 border border-emerald-200/80 text-xs font-semibold">
            <button
              onClick={() => { setViewMode('showcase'); setIsAutoPlaying(true); }}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'showcase' 
                  ? 'bg-white text-emerald-900 shadow-xs font-bold' 
                  : 'text-emerald-700 hover:text-emerald-900'
              }`}
              title="Apresentação Dinâmica"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Destaque</span>
            </button>
            <button
              onClick={() => { setViewMode('grid'); setIsAutoPlaying(false); }}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'grid' 
                  ? 'bg-white text-emerald-900 shadow-xs font-bold' 
                  : 'text-emerald-700 hover:text-emerald-900'
              }`}
              title="Exibir em Grade"
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Todos ({displayDonations.length})</span>
            </button>
          </div>

          <TactileButton
            variant="glass"
            size="sm"
            onClick={() => setActiveTab('doacoes')}
            icon={<Heart className="w-3.5 h-3.5 fill-emerald-600 text-emerald-600" />}
          >
            Quero Doar
          </TactileButton>
        </div>
      </div>

      {/* VIEW 1: DYNAMIC LOCKUP SHOWCASE (Based on provided code structure & green styling) */}
      {viewMode === 'showcase' && (
        <div className="dynamic-comments-lockup grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center py-2">
          
          {/* Left Column: Active Comment Meta & High-impact Quotes */}
          <div className="lg:col-span-6 space-y-6 text-left relative z-10">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-600 text-white shadow-xs">
                  ❤️ Apoio Social Verificado
                </span>
                <span className="text-xs font-mono text-emerald-700 font-semibold">
                  Recado #{activeIndex + 1} de {displayDonations.length}
                </span>
              </div>

              {/* Dynamic Headline */}
              <h3 className="text-2xl sm:text-3xl font-extrabold text-stone-900 leading-tight">
                "{activeDonor.donorName}"{' '}
                <span className="green-text-highlight block sm:inline">
                  apoia a transformação social
                </span>
              </h3>

              {/* Big Quote Box */}
              <div className="relative p-5 sm:p-6 rounded-2xl bg-white/90 backdrop-blur-md border border-emerald-200/90 shadow-md">
                <Quote className="w-8 h-8 text-emerald-300 absolute -top-3 -left-2 -rotate-12 fill-emerald-100" />
                <p className="text-stone-700 text-base sm:text-lg italic font-medium leading-relaxed relative z-10">
                  "{activeDonor.description || 'Apoiador oficial da Casa Sandríssima, fortalecendo nossa comunidade!'}"
                </p>
                
                <div className="mt-4 pt-3 border-t border-emerald-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white font-bold text-sm shadow-sm ring-2 ring-emerald-200">
                      {activeDonor.donorName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-stone-900 leading-none">{activeDonor.donorName}</h4>
                      <p className="text-xs text-emerald-700 font-medium mt-0.5">Amigo da Casa Sandríssima</p>
                    </div>
                  </div>

                  <a 
                    href="https://www.instagram.com/casasandrissima/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 inline-flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1.5 rounded-lg border border-emerald-200 transition-colors"
                  >
                    @casasandrissima
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>

            {/* Carousel Navigation & Interactive Pill Indicators */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
              {/* Previous / Next Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrev}
                  className="w-10 h-10 rounded-xl bg-white hover:bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-center shadow-sm hover:shadow transition-all cursor-pointer active:scale-95"
                  title="Recado Anterior"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={handleNext}
                  className="w-10 h-10 rounded-xl bg-emerald-700 hover:bg-emerald-800 border border-emerald-800 text-white flex items-center justify-center shadow-sm hover:shadow transition-all cursor-pointer active:scale-95"
                  title="Próximo Recado"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Visual Dots / Avatars */}
              <div className="flex items-center gap-1.5 max-w-xs overflow-x-auto py-1">
                {displayDonations.map((item, idx) => (
                  <button
                    key={item.id || idx}
                    onClick={() => {
                      setIsAutoPlaying(false);
                      setActiveIndex(idx);
                    }}
                    className={`transition-all rounded-full cursor-pointer ${
                      idx === activeIndex
                        ? 'w-7 h-2.5 bg-emerald-600 shadow-xs'
                        : 'w-2.5 h-2.5 bg-emerald-200 hover:bg-emerald-400'
                    }`}
                    title={`Ver recado de ${item.donorName}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: 3D Stacked Dynamic Cards Showcase (`.visual .card-wrapper`) */}
          <div className="lg:col-span-6 flex items-center justify-center min-h-[360px] sm:min-h-[420px] relative">
            <div className="comments-stack-container relative w-full max-w-[380px] h-[340px] sm:h-[380px] flex items-center justify-center">
              
              {/* Stack of Cards (Rendered with 3D depth & green styling) */}
              {displayDonations.map((item, idx) => {
                // Calculate distance from active index
                const count = displayDonations.length;
                const offset = (idx - activeIndex + count) % count;

                // We only render the front 3-4 cards in the stack
                if (offset > 3) return null;

                const isFront = offset === 0;
                const cardScale = 1 - offset * 0.08;
                const translateY = offset * 22;
                const translateX = offset * 18;
                const cardRotate = offset * 3;
                const cardOpacity = 1 - offset * 0.25;
                const zIndex = 30 - offset * 5;

                return (
                  <motion.div
                    key={item.id || idx}
                    onClick={() => {
                      setIsAutoPlaying(false);
                      setActiveIndex(idx);
                    }}
                    animate={{
                      scale: cardScale,
                      y: translateY,
                      x: translateX,
                      rotate: cardRotate,
                      opacity: cardOpacity,
                      zIndex: zIndex,
                    }}
                    transition={{ type: 'spring', stiffness: 260, damping: 22 }}
                    className={`absolute inset-0 cursor-pointer select-none rounded-3xl p-6 sm:p-7 flex flex-col justify-between transition-shadow ${
                      isFront
                        ? 'bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 text-white shadow-2xl shadow-emerald-900/30 border-2 border-emerald-400/40 ring-4 ring-emerald-500/20'
                        : 'bg-gradient-to-br from-emerald-100 via-teal-100 to-emerald-200 text-emerald-950 shadow-md border border-emerald-300/80 backdrop-blur-md'
                    }`}
                    style={{
                      transformOrigin: 'center center',
                    }}
                  >
                    {/* Glowing Top Orbs / Decorative Badges */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className={`w-12 h-12 rounded-2xl p-1.5 flex items-center justify-center shrink-0 shadow-inner ${
                          isFront ? 'bg-white/20 border border-white/40 backdrop-blur-md' : 'bg-emerald-900/30 border border-emerald-700/40'
                        }`}>
                          <img
                            src={logoWhiteImg}
                            alt="Logo Casa Sandríssima"
                            className="w-full h-full object-contain filter drop-shadow-xs brightness-0 invert"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div className="min-w-0">
                          <span className={`text-[10px] font-mono uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full inline-block ${
                            isFront ? 'bg-emerald-400/20 text-emerald-200 border border-emerald-300/30' : 'bg-emerald-800/20 text-emerald-900 border border-emerald-700/20'
                          }`}>
                            Apoiador Oficial
                          </span>
                          <h4 className="font-extrabold text-base sm:text-lg leading-tight mt-1 line-clamp-1 truncate">
                            {item.donorName}
                          </h4>
                        </div>
                      </div>

                      <span className={`p-2 rounded-xl ${
                        isFront ? 'bg-white/10 text-emerald-200' : 'bg-emerald-800/10 text-emerald-800'
                      }`}>
                        <Heart className="w-4 h-4 fill-current" />
                      </span>
                    </div>

                    {/* Message Quote */}
                    <div className="my-auto py-2">
                      <p className={`text-sm sm:text-base italic leading-relaxed line-clamp-4 ${
                        isFront ? 'text-emerald-50 font-medium' : 'text-emerald-950 font-medium'
                      }`}>
                        "{item.description || 'Apoiador oficial da Casa Sandríssima, fortalecendo nossa comunidade!'}"
                      </p>
                    </div>

                    {/* Card Footer with Socials & Action */}
                    <div className={`pt-4 border-t flex items-center justify-between ${
                      isFront ? 'border-emerald-500/40 text-emerald-100' : 'border-emerald-300/60 text-emerald-900'
                    }`}>
                      <div className="flex items-center gap-2">
                        <a
                          href="https://www.instagram.com/casasandrissima/"
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className={`w-7 h-7 rounded-full flex items-center justify-center transition-transform hover:scale-110 ${
                            isFront ? 'bg-white/20 hover:bg-white/30 text-white' : 'bg-emerald-700/15 text-emerald-900'
                          }`}
                          title="Instagram @casasandrissima"
                        >
                          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 16 16">
                            <path d="M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.917 3.917 0 0 0-1.417.923A3.927 3.927 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.916 3.916 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.175-1.433-.372-1.941a3.926 3.926 0 0 0-.923-1.417A3.911 3.911 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.998 0h.003zm-.717 1.442h.718c2.136 0 2.389.007 3.232.046.78.035 1.204.166 1.486.275.373.145.64.319.92.599.28.28.453.546.598.92.11.281.24.705.275 1.485.039.843.047 1.096.047 3.231s-.008 2.389-.047 3.232c-.035.78-.166 1.203-.275 1.485a2.47 2.47 0 0 1-.599.919c-.28.28-.546.453-.92.598-.28.11-.704.24-1.485.276-.843.038-1.096.047-3.232.047s-2.39-.009-3.233-.047c-.78-.036-1.203-.166-1.485-.276a2.478 2.478 0 0 1-.92-.598 2.48 2.48 0 0 1-.6-.92c-.109-.281-.24-.705-.275-1.485-.038-.843-.046-1.096-.046-3.233 0-2.136.008-2.388.046-3.231.036-.78.166-1.204.276-1.486.145-.373.319-.64.599-.92.28-.28.546-.453.92-.598.282-.11.705-.24 1.485-.276.738-.034 1.024-.044 2.515-.045v.002zm4.988 1.328a.96.96 0 1 0 0 1.92.96.96 0 0 0 0-1.92zm-4.27 1.122a4.109 4.109 0 1 0 0 8.217 4.109 4.109 0 0 0 0-8.217zm0 1.441a2.667 2.667 0 1 1 0 5.334 2.667 2.667 0 0 1 0-5.334z"/>
                          </svg>
                        </a>
                      </div>

                      <span className="text-xs font-bold inline-flex items-center gap-1">
                        {isFront ? '★ Em Destaque' : 'Clique para Ler'}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {/* VIEW 2: COMPLETE REFINED GREEN GRID VIEW */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pt-4" id="donors-grid">
          {displayDonations.map((item, idx) => (
            <motion.div
              key={item.id || idx}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="donor-green-card group relative rounded-3xl p-6 bg-white/90 backdrop-blur-md border border-emerald-200/90 hover:border-emerald-400 shadow-sm hover:shadow-xl hover:shadow-emerald-500/10 transition-all flex flex-col justify-between text-left overflow-hidden"
            >
              {/* Gradient Aura on Hover */}
              <div className="absolute -top-16 -right-16 w-32 h-32 rounded-full bg-emerald-200/40 blur-2xl group-hover:bg-emerald-300/60 transition-all pointer-events-none" />

              <div className="space-y-4 relative z-10">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 p-0.5 shadow-xs">
                      <div className="w-full h-full bg-emerald-800 rounded-[14px] flex items-center justify-center p-1.5">
                        <img
                          src={logoWhiteImg}
                          alt="Logo"
                          className="w-full h-full object-contain brightness-0 invert"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    </div>
                    <div>
                      <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                        Apoiador Social
                      </span>
                      <h4 className="font-bold text-sm text-stone-900 leading-tight mt-0.5 line-clamp-1">
                        {item.donorName}
                      </h4>
                    </div>
                  </div>

                  <Heart className="w-4 h-4 text-emerald-600 fill-emerald-100 group-hover:scale-110 transition-transform" />
                </div>

                <p className="text-stone-600 text-xs sm:text-sm italic leading-relaxed line-clamp-4 pl-2 border-l-2 border-emerald-300">
                  "{item.description || 'Apoiador oficial da Casa Sandríssima, fortalecendo nossa comunidade!'}"
                </p>
              </div>

              <div className="mt-6 pt-3 border-t border-emerald-100/80 flex items-center justify-between text-xs relative z-10">
                <a
                  href="https://www.instagram.com/casasandrissima/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-700 hover:text-emerald-900 font-semibold inline-flex items-center gap-1"
                >
                  <svg className="w-3.5 h-3.5 fill-emerald-600" viewBox="0 0 16 16">
                    <path d="M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.917 3.917 0 0 0-1.417.923A3.927 3.927 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.916 3.916 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.175-1.433-.372-1.941a3.926 3.926 0 0 0-.923-1.417A3.911 3.911 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.998 0h.003zm-.717 1.442h.718c2.136 0 2.389.007 3.232.046.78.035 1.204.166 1.486.275.373.145.64.319.92.599.28.28.453.546.598.92.11.281.24.705.275 1.485.039.843.047 1.096.047 3.231s-.008 2.389-.047 3.232c-.035.78-.166 1.203-.275 1.485a2.47 2.47 0 0 1-.599.919c-.28.28-.546.453-.92.598-.28.11-.704.24-1.485.276-.843.038-1.096.047-3.232.047s-2.39-.009-3.233-.047c-.78-.036-1.203-.166-1.485-.276a2.478 2.478 0 0 1-.92-.598 2.48 2.48 0 0 1-.6-.92c-.109-.281-.24-.705-.275-1.485-.038-.843-.046-1.096-.046-3.233 0-2.136.008-2.388.046-3.231.036-.78.166-1.204.276-1.486.145-.373.319-.64.599-.92.28-.28.546-.453.92-.598.282-.11.705-.24 1.485-.276.738-.034 1.024-.044 2.515-.045v.002zm4.988 1.328a.96.96 0 1 0 0 1.92.96.96 0 0 0 0-1.92zm-4.27 1.122a4.109 4.109 0 1 0 0 8.217 4.109 4.109 0 0 0 0-8.217zm0 1.441a2.667 2.667 0 1 1 0 5.334 2.667 2.667 0 0 1 0-5.334z"/>
                  </svg>
                  <span>@casasandrissima</span>
                </a>

                <button
                  onClick={() => setActiveTab('doacoes')}
                  className="font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 cursor-pointer"
                >
                  Apoiar <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Encouragement Footer CTA - Crisp, high contrast and fully legible */}
      <div className="mt-8 pt-6 border-t border-emerald-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left bg-gradient-to-r from-emerald-50/90 via-white to-emerald-50/70 p-4 sm:p-5 rounded-2xl border border-emerald-200 shadow-sm relative z-10">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center shrink-0 shadow-sm">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm sm:text-base font-extrabold text-stone-900">
              Quer ver seu recado brilhando no nosso mural comunitário?
            </p>
            <p className="text-xs sm:text-sm text-stone-700 font-semibold mt-0.5">
              Faça sua doação de qualquer valor e deixe sua mensagem de encorajamento.
            </p>
          </div>
        </div>

        <TactileButton
          variant="primary"
          size="md"
          onClick={() => setActiveTab('doacoes')}
          icon={<Heart className="w-4 h-4 fill-white" />}
        >
          Deixar Meu Recado & Doar
        </TactileButton>
      </div>
    </section>
  );
}

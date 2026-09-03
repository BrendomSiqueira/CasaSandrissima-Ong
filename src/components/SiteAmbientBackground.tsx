import React from 'react';
import { motion } from 'motion/react';

/**
 * SiteAmbientBackground
 * 
 * Inspirado na identidade visual e no fundo do site GUPY (gupy.io):
 * - FAIXAS DE ONDA SOBREPOSTAS (Ribbon Waves): Fitas geométricas e orgânicas em verde floresta escuro,
 *   verde pinheiro, esmeralda denso e toques de lima vibrante (#022c22, #064e3b, #047857, #bef264).
 * - RETÂNGULOS TECNOLÓGICOS E PAINÉIS ANGULADOS: Cartões e molduras geométricas puras com marcadores
 *   de precisão que se encaixam e tangenciam o fluxo das ondas.
 * - LINHAS VETORIAIS DE CONTINUIDADE: Traçados de crista, projeções tracejadas e nós de intersecção
 *   que conectam os vértices dos retângulos diretamente às curvas das ondas.
 * - LEITURA 100% PRESERVADA: O miolo central possui respiro amplo e véu translúcido suave,
 *   garantindo contraste impecável para todos os componentes do site.
 */
export default function SiteAmbientBackground() {
  return (
    <div
      className="fixed inset-0 z-0 pointer-events-none overflow-hidden select-none bg-[#f4f8f5]"
      aria-hidden="true"
      id="site-ambient-background"
    >
      {/* 1. Base Atmosférica com Gradiente de Luz Suave */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#edf5f0] via-[#ffffff] via-45% to-[#e8f2ec]" />

      {/* Auréolas de Profundidade em Verde Escuro (Estilo iluminação de palco da Gupy) */}
      <div className="absolute -top-40 -left-28 w-[720px] h-[720px] rounded-full bg-[#064e3b]/20 blur-[140px]" />
      <div className="absolute -top-24 -right-32 w-[760px] h-[760px] rounded-full bg-[#022c22]/18 blur-[150px]" />
      <div className="absolute top-[42%] -left-48 w-[680px] h-[780px] rounded-full bg-[#065f46]/20 blur-[150px]" />
      <div className="absolute top-[50%] -right-40 w-[700px] h-[800px] rounded-full bg-[#022c22]/16 blur-[160px]" />
      <div className="absolute -bottom-40 left-1/3 w-[920px] h-[680px] rounded-full bg-[#064e3b]/22 blur-[160px]" />

      {/* 2. Malha Gráfica Arquitetônica de Precisão (Micro-grid discreto) */}
      <div
        className="absolute inset-0 opacity-[0.05] mix-blend-multiply"
        style={{
          backgroundImage: `
            linear-gradient(to right, #022c22 1.5px, transparent 1.5px),
            linear-gradient(to bottom, #022c22 1.5px, transparent 1.5px)
          `,
          backgroundSize: '48px 48px',
        }}
      />

      {/* 3. RETÂNGULOS E PAINÉIS GEOMÉTRICOS PURAMENTE ARQUITETÔNICOS (Estilo Gupy Tech Cards) */}
      
      {/* Retângulo Superior Esquerdo: Conecta-se à crista da onda superior */}
      <motion.div
        animate={{
          y: [0, -10, 0],
          rotate: [-2.5, -1, -2.5],
        }}
        transition={{
          duration: 16,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute top-12 left-[3%] w-72 sm:w-96 h-44 sm:h-56 rounded-2xl border border-[#064e3b]/40 bg-[#022c22]/[0.035] backdrop-blur-[2px] p-3.5 shadow-[0_8px_30px_rgba(2,44,34,0.04)]"
      >
        <div className="w-full h-full rounded-xl border border-dashed border-[#065f46]/45 relative flex flex-col justify-between p-3">
          {/* Marcadores de cantos de engenharia (L-brackets) */}
          <div className="absolute -top-1.5 -left-1.5 w-3 h-3 border-t-2 border-l-2 border-[#022c22]" />
          <div className="absolute -top-1.5 -right-1.5 w-3 h-3 border-t-2 border-r-2 border-[#022c22]" />
          <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 border-b-2 border-l-2 border-[#022c22]" />
          <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 border-b-2 border-r-2 border-[#022c22]" />

          {/* Topo do painel: marcadores e barra de nível */}
          <div className="flex justify-between items-center opacity-70">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#064e3b]" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#bef264]" />
            </div>
            <div className="w-20 h-1 rounded-full bg-[#022c22]/30" />
          </div>

          {/* Elementos estruturais internos */}
          <div className="space-y-2 opacity-40">
            <div className="h-0.5 w-full bg-gradient-to-r from-[#064e3b] via-[#047857] to-transparent" />
            <div className="flex gap-2">
              <div className="h-6 w-1/3 rounded-lg border border-[#064e3b]/50" />
              <div className="h-6 flex-1 rounded-lg border border-[#064e3b]/50" />
            </div>
          </div>

          <div className="flex justify-between items-center opacity-50">
            <div className="w-16 h-0.5 bg-[#022c22]" />
            <div className="w-2 h-2 rounded-xs bg-[#064e3b]" />
          </div>
        </div>
      </motion.div>

      {/* Retângulo Superior Direito: Emoldura o flanco direito com corte angular */}
      <motion.div
        animate={{
          y: [0, 12, 0],
          rotate: [3, 4.5, 3],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute top-16 -right-6 sm:right-6 w-80 sm:w-[420px] h-48 sm:h-64 rounded-3xl border-2 border-[#022c22]/35 bg-[#064e3b]/[0.045] backdrop-blur-[2px] p-4 shadow-[0_8px_30px_rgba(2,44,34,0.04)]"
      >
        <div className="w-full h-full rounded-2xl border border-[#047857]/40 relative p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between opacity-70">
            <div className="flex gap-1.5">
              <span className="w-2 h-2 rounded-full border border-[#022c22]" />
              <span className="w-2 h-2 rounded-full bg-[#064e3b]" />
              <span className="w-2 h-2 rounded-full bg-[#bef264]" />
            </div>
            <div className="w-24 h-1 rounded-full bg-[#022c22]/35" />
          </div>

          {/* Grid de módulos geométricos internos */}
          <div className="grid grid-cols-3 gap-2 opacity-35 my-auto">
            <div className="h-9 rounded-xl border border-[#064e3b]/60 flex items-center justify-center">
              <div className="w-4 h-0.5 bg-[#064e3b]" />
            </div>
            <div className="h-9 rounded-xl border border-[#064e3b]/60 flex items-center justify-center">
              <div className="w-4 h-0.5 bg-[#064e3b]" />
            </div>
            <div className="h-9 rounded-xl border border-[#064e3b]/60 flex items-center justify-center">
              <div className="w-4 h-0.5 bg-[#064e3b]" />
            </div>
          </div>

          <div className="flex items-center justify-between opacity-50">
            <div className="w-20 h-0.5 bg-[#064e3b]" />
            <div className="w-10 h-0.5 bg-[#022c22]" />
          </div>
        </div>
      </motion.div>

      {/* Retângulo Lateral Esquerdo: Bloco de suporte com divisões de engenharia */}
      <motion.div
        animate={{
          y: [0, 14, 0],
          rotate: [6, 4.5, 6],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute top-[42%] -left-10 sm:left-[1%] w-64 sm:w-80 h-36 sm:h-48 rounded-2xl border border-[#065f46]/35 bg-[#022c22]/[0.03] p-3"
      >
        <div className="w-full h-full rounded-xl border border-dashed border-[#064e3b]/40 flex flex-col justify-between p-3 opacity-60">
          <div className="flex justify-between items-center">
            <div className="w-16 h-1 bg-[#022c22]/40 rounded-full" />
            <div className="w-2 h-2 rounded-xs bg-[#064e3b]" />
          </div>
          <div className="flex gap-2">
            <div className="flex-1 h-7 rounded-lg border border-[#064e3b]/40" />
            <div className="flex-1 h-7 rounded-lg border border-[#064e3b]/40" />
          </div>
          <div className="w-2/3 h-1 bg-[#065f46]/40 rounded-full" />
        </div>
      </motion.div>

      {/* Retângulo Lateral Direito: Moldura que tangencia a faixa transversal */}
      <motion.div
        animate={{
          y: [0, -15, 0],
          rotate: [-5, -3.5, -5],
        }}
        transition={{
          duration: 19,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute top-[50%] -right-10 sm:right-[1%] w-72 sm:w-84 h-40 sm:h-52 rounded-3xl border-2 border-[#022c22]/35 bg-[#064e3b]/[0.035] p-3.5"
      >
        <div className="w-full h-full rounded-2xl border border-[#065f46]/35 flex flex-col justify-between p-3.5 opacity-60">
          <div className="flex justify-between items-center">
            <span className="w-2.5 h-2.5 rounded-full bg-[#022c22]" />
            <div className="w-20 h-0.5 bg-[#022c22]/40" />
          </div>
          <div className="h-10 rounded-xl border border-dashed border-[#064e3b]/50 flex items-center justify-center">
            <div className="w-12 h-1 rounded-full bg-[#064e3b]/30" />
          </div>
          <div className="flex justify-between items-center">
            <div className="w-14 h-1 bg-[#064e3b]/40 rounded-full" />
            <div className="w-1.5 h-1.5 rounded-full bg-[#022c22]" />
          </div>
        </div>
      </motion.div>

      {/* Retângulo Inferior: Base arquitetônica da página */}
      <motion.div
        animate={{
          y: [0, -8, 0],
          rotate: [-1.5, -0.5, -1.5],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute -bottom-8 left-[10%] sm:left-[18%] w-80 sm:w-[500px] h-40 sm:h-52 rounded-3xl border-2 border-[#064e3b]/35 bg-[#022c22]/[0.035] p-3.5"
      >
        <div className="w-full h-full rounded-2xl border border-dashed border-[#022c22]/35 flex flex-col justify-between p-3 opacity-60">
          <div className="flex justify-between items-center">
            <div className="w-28 h-1 bg-[#022c22]/50 rounded-full" />
            <div className="flex gap-1.5">
              <span className="w-2 h-2 rounded-xs bg-[#022c22]" />
              <span className="w-2 h-2 rounded-xs bg-[#bef264]" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2.5">
            <div className="h-7 rounded-lg border border-[#064e3b]/40" />
            <div className="h-7 rounded-lg border border-[#064e3b]/40" />
            <div className="h-7 rounded-lg border border-[#064e3b]/40" />
          </div>
        </div>
      </motion.div>

      {/* 4. ONDAS VETORIAIS E FAIXAS ESTILO GUPY (Curvas Conectadas, Degradês e Linhas de Precisão) */}
      <svg
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        viewBox="0 0 1600 1000"
        preserveAspectRatio="none"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Degradê 1: Verde Floresta Profundo e Denso (Assinatura base escura) */}
          <linearGradient id="gupy-wave-dark-forest" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#01241a" stopOpacity="0.55" />
            <stop offset="30%" stopColor="#022c22" stopOpacity="0.50" />
            <stop offset="70%" stopColor="#064e3b" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#022c22" stopOpacity="0.58" />
          </linearGradient>

          {/* Degradê 2: Verde Pinheiro e Esmeralda Escuro */}
          <linearGradient id="gupy-wave-pine-emerald" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#064e3b" stopOpacity="0.50" />
            <stop offset="45%" stopColor="#065f46" stopOpacity="0.42" />
            <stop offset="80%" stopColor="#047857" stopOpacity="0.46" />
            <stop offset="100%" stopColor="#01261d" stopOpacity="0.58" />
          </linearGradient>

          {/* Degradê 3: Faixa de Realce Estilo Gupy (Lima / Citrus vibrante com verde profundo) */}
          <linearGradient id="gupy-wave-accent-lime" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#064e3b" stopOpacity="0.30" />
            <stop offset="25%" stopColor="#bef264" stopOpacity="0.55" />
            <stop offset="60%" stopColor="#4ade80" stopOpacity="0.50" />
            <stop offset="85%" stopColor="#bef264" stopOpacity="0.60" />
            <stop offset="100%" stopColor="#064e3b" stopOpacity="0.30" />
          </linearGradient>

          {/* Degradê 4: Faixa Ondulada Diagonal */}
          <linearGradient id="gupy-wave-diagonal" x1="0%" y1="25%" x2="100%" y2="75%">
            <stop offset="0%" stopColor="#064e3b" stopOpacity="0.42" />
            <stop offset="35%" stopColor="#022c22" stopOpacity="0.52" />
            <stop offset="70%" stopColor="#065f46" stopOpacity="0.40" />
            <stop offset="100%" stopColor="#047857" stopOpacity="0.48" />
          </linearGradient>

          {/* Linhas de Trajetória e Crista */}
          <linearGradient id="gupy-line-stroke-solid" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#022c22" stopOpacity="0.5" />
            <stop offset="20%" stopColor="#064e3b" stopOpacity="1" />
            <stop offset="50%" stopColor="#047857" stopOpacity="1" />
            <stop offset="80%" stopColor="#064e3b" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#022c22" stopOpacity="0.5" />
          </linearGradient>

          <linearGradient id="gupy-line-stroke-lime" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#047857" stopOpacity="0.4" />
            <stop offset="30%" stopColor="#bef264" stopOpacity="0.95" />
            <stop offset="70%" stopColor="#86efac" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#022c22" stopOpacity="0.4" />
          </linearGradient>

          <linearGradient id="gupy-line-connector" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#022c22" stopOpacity="0.85" />
            <stop offset="50%" stopColor="#064e3b" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#065f46" stopOpacity="0.85" />
          </linearGradient>
        </defs>

        {/* --- CAMADA 1: FAIXAS DE ONDA SOBREPOSTAS (INSPIRADAS NA CONSTRUÇÃO DA GUPY) --- */}
        
        {/* Onda 1: Superior Principal (Fita curvada que desce do topo e cruza o horizonte) */}
        <path
          d="M -120 180 C 240 330 640 80 1100 240 C 1340 325 1540 195 1720 145 L 1720 -60 L -120 -60 Z"
          fill="url(#gupy-wave-dark-forest)"
        />

        {/* Onda 2: Fita Entrelaçada Superior (Gupy Ribbon Style - cruza em sentido oposto) */}
        <path
          d="M -120 290 C 220 160 660 370 1120 200 C 1360 110 1550 220 1720 250 L 1720 110 C 1550 70 1360 -40 1120 40 C 660 200 220 20 -120 120 Z"
          fill="url(#gupy-wave-pine-emerald)"
        />

        {/* Onda 3: Faixa Estreita de Realce com Toque Lima/Citrus (Assinatura Gupy) */}
        <path
          d="M -120 230 C 230 180 650 330 1110 180 C 1350 100 1545 190 1720 210 L 1720 190 C 1545 170 1350 80 1110 160 C 650 310 230 160 -120 210 Z"
          fill="url(#gupy-wave-accent-lime)"
        />

        {/* Onda 4: Faixa Diagonal Central Sinuosa (Conecta os flancos e deixa o miolo livre) */}
        <path
          d="M -120 520 C 180 630 430 410 770 525 C 1110 640 1360 460 1720 575 L 1720 485 C 1360 375 1110 545 770 435 C 430 325 180 525 -120 430 Z"
          fill="url(#gupy-wave-diagonal)"
        />

        {/* Onda 5: Faixa de Contorno Estreita Central */}
        <path
          d="M -120 465 C 180 560 430 350 770 465 C 1110 575 1360 405 1720 515 L 1720 500 C 1360 390 1110 560 770 450 C 430 335 180 545 -120 450 Z"
          fill="url(#gupy-wave-accent-lime)"
        />

        {/* Onda 6: Base Inferior de Sustentação (Verde Escuro Denso e Nobre) */}
        <path
          d="M -120 840 C 320 700 740 910 1180 755 C 1420 670 1590 785 1720 835 L 1720 1060 L -120 1060 Z"
          fill="url(#gupy-wave-dark-forest)"
        />

        {/* Onda 7: Faixa Secundária na Base */}
        <path
          d="M -120 730 C 280 860 700 670 1150 840 C 1380 930 1540 825 1720 780 L 1720 890 C 1540 940 1380 1035 1150 960 C 700 795 280 980 -120 845 Z"
          fill="url(#gupy-wave-pine-emerald)"
        />

        {/* --- CAMADA 2: LINHAS VETORIAIS DE CRISTA (TRAÇO FORTE E CONTÍNUO) --- */}
        
        {/* Linha Forte da Crista Superior */}
        <path
          d="M -120 180 C 240 330 640 80 1100 240 C 1340 325 1540 195 1720 145"
          stroke="url(#gupy-line-stroke-solid)"
          strokeWidth="3.5"
          strokeLinecap="round"
        />

        {/* Linha Tracejada de Precisão Superior */}
        <path
          d="M -120 205 C 240 355 640 105 1100 265 C 1340 350 1540 220 1720 170"
          stroke="url(#gupy-line-stroke-lime)"
          strokeWidth="2.5"
          strokeDasharray="9 7"
        />

        {/* Linha da Onda Cruzada 2 */}
        <path
          d="M -120 290 C 220 160 660 370 1120 200 C 1360 110 1550 220 1720 250"
          stroke="url(#gupy-line-stroke-solid)"
          strokeWidth="3"
          strokeLinecap="round"
        />

        {/* Linha da Faixa Diagonal Central */}
        <path
          d="M -120 520 C 180 630 430 410 770 525 C 1110 640 1360 460 1720 575"
          stroke="url(#gupy-line-stroke-solid)"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M -120 430 C 180 525 430 325 770 435 C 1110 545 1360 375 1720 485"
          stroke="url(#gupy-line-stroke-lime)"
          strokeWidth="2.2"
          strokeDasharray="11 8"
        />

        {/* Linha Forte da Crista da Base */}
        <path
          d="M -120 840 C 320 700 740 910 1180 755 C 1420 670 1590 785 1720 835"
          stroke="url(#gupy-line-stroke-solid)"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        <path
          d="M -120 805 C 320 665 740 875 1180 720 C 1420 635 1590 750 1720 800"
          stroke="url(#gupy-line-stroke-lime)"
          strokeWidth="2.5"
          strokeDasharray="9 7"
        />

        {/* --- CAMADA 3: LINHAS GEOMÉTRICAS QUE CONECTAM RETÂNGULOS E ONDAS --- */}
        
        {/* Traçado Poligonal Superior conectando vértices aos ápices das curvas */}
        <path
          d="M 140 120 L 340 250 L 680 130 L 1080 240 L 1440 160"
          stroke="url(#gupy-line-connector)"
          strokeWidth="2.5"
          strokeDasharray="8 6"
        />

        {/* Traçado Poligonal Central */}
        <path
          d="M 100 480 L 380 405 L 740 505 L 1170 435 L 1520 515"
          stroke="url(#gupy-line-connector)"
          strokeWidth="2"
          strokeDasharray="8 6"
        />

        {/* Traçado Poligonal Inferior */}
        <path
          d="M 130 860 L 420 755 L 820 845 L 1220 735 L 1500 825"
          stroke="url(#gupy-line-connector)"
          strokeWidth="2.5"
          strokeDasharray="8 6"
        />

        {/* Eixos Verticais de Alinhamento Arquitetônico (Grid de Engenharia) */}
        <line
          x1="260"
          y1="50"
          x2="260"
          y2="460"
          stroke="#022c22"
          strokeOpacity="0.45"
          strokeWidth="1.8"
          strokeDasharray="7 7"
        />
        <line
          x1="1380"
          y1="80"
          x2="1380"
          y2="520"
          stroke="#064e3b"
          strokeOpacity="0.45"
          strokeWidth="1.8"
          strokeDasharray="7 7"
        />
        <line
          x1="360"
          y1="640"
          x2="360"
          y2="980"
          stroke="#022c22"
          strokeOpacity="0.45"
          strokeWidth="1.8"
          strokeDasharray="7 7"
        />
        <line
          x1="1280"
          y1="600"
          x2="1280"
          y2="950"
          stroke="#065f46"
          strokeOpacity="0.45"
          strokeWidth="1.8"
          strokeDasharray="7 7"
        />

        {/* Linhas Horizontais de Alinhamento Global */}
        <line
          x1="0"
          y1="260"
          x2="1600"
          y2="260"
          stroke="url(#gupy-line-stroke-solid)"
          strokeWidth="1.5"
          strokeDasharray="18 12"
        />
        <line
          x1="0"
          y1="750"
          x2="1600"
          y2="750"
          stroke="url(#gupy-line-stroke-solid)"
          strokeWidth="1.5"
          strokeDasharray="18 12"
        />

        {/* PONTOS DE NÓ E INTERSECÇÃO TÉCNICA (Círculos Conectados em Verde Escuro) */}
        <g>
          {/* Nós Superiores */}
          <circle cx="340" cy="250" r="6" fill="#022c22" />
          <circle cx="340" cy="250" r="11" stroke="#064e3b" strokeWidth="2" strokeOpacity="0.8" />
          <circle cx="340" cy="250" r="2" fill="#bef264" />

          <circle cx="680" cy="130" r="5" fill="#064e3b" />
          <circle cx="680" cy="130" r="10" stroke="#065f46" strokeWidth="1.8" strokeOpacity="0.75" />

          <circle cx="1080" cy="240" r="6" fill="#022c22" />
          <circle cx="1080" cy="240" r="11" stroke="#064e3b" strokeWidth="2" strokeOpacity="0.8" />
          <circle cx="1080" cy="240" r="2" fill="#bef264" />

          {/* Nós Centrais */}
          <circle cx="380" cy="405" r="5.5" fill="#065f46" />
          <circle cx="380" cy="405" r="10" stroke="#022c22" strokeWidth="1.8" strokeOpacity="0.7" />

          <circle cx="740" cy="505" r="6" fill="#022c22" />
          <circle cx="740" cy="505" r="11" stroke="#064e3b" strokeWidth="2" strokeOpacity="0.8" />
          <circle cx="740" cy="505" r="2" fill="#bef264" />

          <circle cx="1170" cy="435" r="5.5" fill="#064e3b" />
          <circle cx="1170" cy="435" r="10" stroke="#065f46" strokeWidth="1.8" strokeOpacity="0.7" />

          {/* Nós Inferiores */}
          <circle cx="420" cy="755" r="6" fill="#022c22" />
          <circle cx="420" cy="755" r="11" stroke="#064e3b" strokeWidth="2" strokeOpacity="0.8" />
          <circle cx="420" cy="755" r="2" fill="#bef264" />

          <circle cx="820" cy="845" r="5" fill="#064e3b" />
          <circle cx="820" cy="845" r="10" stroke="#022c22" strokeWidth="1.8" strokeOpacity="0.75" />

          <circle cx="1220" cy="735" r="6" fill="#022c22" />
          <circle cx="1220" cy="735" r="11" stroke="#065f46" strokeWidth="2" strokeOpacity="0.8" />
          <circle cx="1220" cy="735" r="2" fill="#bef264" />
        </g>

        {/* CRUZETAS TÉCNICAS (+) EM VERDE ESCURO */}
        <g stroke="#022c22" strokeOpacity="0.7" strokeWidth="2">
          {/* Cruz 1 */}
          <line x1="251" y1="250" x2="269" y2="250" />
          <line x1="260" y1="241" x2="260" y2="259" />

          {/* Cruz 2 */}
          <line x1="1371" y1="330" x2="1389" y2="330" />
          <line x1="1380" y1="321" x2="1380" y2="339" />

          {/* Cruz 3 */}
          <line x1="351" y1="765" x2="369" y2="765" />
          <line x1="360" y1="756" x2="360" y2="774" />

          {/* Cruz 4 */}
          <line x1="1271" y1="735" x2="1289" y2="735" />
          <line x1="1280" y1="726" x2="1280" y2="744" />
        </g>
      </svg>

      {/* 5. Escudo Suave de Leitura Central */}
      {/* Garante que todo o miolo do site, textos dos cartões, tabelas e formulários mantenham nitidez e contraste absoluto */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#f8fbf9]/70 via-50% to-transparent pointer-events-none" />
    </div>
  );
}

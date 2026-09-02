import React from 'react';
import { motion } from 'motion/react';
import greenWavesWideSpacedBg from '../assets/images/green_waves_wide_spaced_1788389125948.jpg';

/**
 * SiteAmbientBackground
 * 
 * Based on the user's reference with wide spacing between waves:
 * - Fluid emerald/lime curved wave ribbons with generous distance and white space between them.
 * - Expansive glowing lime-yellow center with open breathing room.
 * - Wide clean white negative space separating the wave crests.
 */
export default function SiteAmbientBackground() {
  return (
    <div
      className="fixed inset-0 z-0 pointer-events-none overflow-hidden select-none"
      aria-hidden="true"
      id="site-ambient-background"
    >
      {/* 1. Base Wallpaper Image with Widely Spaced Emerald Waves & Vast White Spaces */}
      <div className="absolute inset-0">
        <img
          src={greenWavesWideSpacedBg}
          alt="Papel de Parede Ondas Verdes Espaçadas - Casa Sandríssima"
          className="w-full h-full object-cover object-center scale-105 transform-gpu"
          referrerPolicy="no-referrer"
        />
      </div>

      {/* 2. Calibrated Readability Veil (Softens deep saturated waves while preserving elegant depth and luminosity) */}
      <div className="absolute inset-0 bg-white/50 backdrop-blur-[0.8px]" />
      <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-transparent to-white/30" />

      {/* 3. Central Radiant Glow Pulsing Aura (Broad open center) */}
      <motion.div
        animate={{
          scale: [1, 1.05, 1],
          opacity: [0.45, 0.7, 0.45],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] sm:w-[1050px] h-[350px] sm:h-[500px] rounded-[50%] bg-gradient-to-r from-lime-300/25 via-yellow-200/40 to-emerald-300/25 blur-[90px] pointer-events-none"
      />

      {/* 4. Widely Spaced Dynamic White Ribbons & Curved Separators */}
      <svg
        className="absolute inset-0 w-full h-full object-cover opacity-85 pointer-events-none"
        viewBox="0 0 1440 900"
        preserveAspectRatio="none"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="white-ribbon-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="30%" stopColor="#f8fafc" stopOpacity="0.85" />
            <stop offset="70%" stopColor="#ffffff" stopOpacity="1" />
            <stop offset="100%" stopColor="#ecfdf5" stopOpacity="0.9" />
          </linearGradient>

          <linearGradient id="silk-gold-accent" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#84cc16" stopOpacity="0.15" />
            <stop offset="45%" stopColor="#facc15" stopOpacity="0.7" />
            <stop offset="55%" stopColor="#eab308" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#4ade80" stopOpacity="0.15" />
          </linearGradient>

          <filter id="white-ribbon-shadow" x="-10%" y="-20%" width="120%" height="150%">
            <feDropShadow dx="0" dy="6" stdDeviation="10" floodColor="#064e3b" floodOpacity="0.2" />
          </filter>
        </defs>

        {/* Upper Distant White Separator Ribbon (Placed higher for wide spacing) */}
        <path
          d="M -50 140 C 320 220 680 225 1060 150 C 1220 115 1380 90 1490 70 L 1490 88 C 1380 108 1220 133 1060 168 C 680 243 320 238 -50 158 Z"
          fill="url(#white-ribbon-grad)"
          filter="url(#white-ribbon-shadow)"
        />

        {/* Golden Lime Accent Trim Line (Upper Outer Rim) */}
        <path
          d="M 0 240 C 360 170 720 140 1080 180 C 1260 200 1380 250 1440 290"
          stroke="url(#silk-gold-accent)"
          strokeWidth="2.5"
          opacity="0.65"
        />

        {/* Golden Lime Accent Trim Line (Lower Outer Rim) */}
        <path
          d="M 0 660 C 360 730 720 760 1080 720 C 1260 700 1380 650 1440 610"
          stroke="url(#silk-gold-accent)"
          strokeWidth="2.5"
          opacity="0.65"
        />

        {/* Lower Distant White Separator Ribbon (Placed lower for wide spacing) */}
        <path
          d="M -50 740 C 340 800 700 805 1080 745 C 1240 715 1390 675 1490 635 L 1490 652 C 1390 692 1240 732 1080 762 C 700 822 340 817 -50 757 Z"
          fill="url(#white-ribbon-grad)"
          filter="url(#white-ribbon-shadow)"
        />
      </svg>

      {/* 5. Delicate Micro-texture Grid */}
      <div 
        className="absolute inset-0 opacity-[0.025] mix-blend-overlay"
        style={{
          backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)',
          backgroundSize: '32px 32px'
        }}
      />
    </div>
  );
}

import React from 'react';

export interface Interactive3DCardProps {
  id?: string;
  title: string;
  badge?: string;
  icon?: React.ReactNode;
  variant?: 'emerald' | 'teal' | 'amber' | 'indigo';
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export default function Interactive3DCard({
  id,
  title,
  badge,
  icon,
  variant = 'emerald',
  children,
  footer,
  className = '',
}: Interactive3DCardProps) {
  // Theme color accents for icons & subtle highlights
  const themeIconStyles = {
    emerald: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 group-hover:bg-emerald-500 group-hover:text-white',
    teal: 'bg-teal-500/10 text-teal-600 border-teal-500/20 group-hover:bg-teal-500 group-hover:text-white',
    amber: 'bg-amber-500/10 text-amber-600 border-amber-500/20 group-hover:bg-amber-500 group-hover:text-white',
    indigo: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20 group-hover:bg-indigo-500 group-hover:text-white',
  };

  const themeBadgeStyles = {
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
    teal: 'bg-teal-50 text-teal-700 border-teal-200/60',
    amber: 'bg-amber-50 text-amber-800 border-amber-200/60',
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200/60',
  };

  return (
    <div 
      className={`tracker-card-wrapper tracker-card--${variant} ${className}`}
      id={id}
    >
      {/* 5x5 Kinetic Mouse Perspective Tracker Canvas */}
      <div className="tracker-card-canvas" aria-hidden="true">
        <div className="tracker tr-1"></div>
        <div className="tracker tr-2"></div>
        <div className="tracker tr-3"></div>
        <div className="tracker tr-4"></div>
        <div className="tracker tr-5"></div>
        <div className="tracker tr-6"></div>
        <div className="tracker tr-7"></div>
        <div className="tracker tr-8"></div>
        <div className="tracker tr-9"></div>
        <div className="tracker tr-10"></div>
        <div className="tracker tr-11"></div>
        <div className="tracker tr-12"></div>
        <div className="tracker tr-13"></div>
        <div className="tracker tr-14"></div>
        <div className="tracker tr-15"></div>
        <div className="tracker tr-16"></div>
        <div className="tracker tr-17"></div>
        <div className="tracker tr-18"></div>
        <div className="tracker tr-19"></div>
        <div className="tracker tr-20"></div>
        <div className="tracker tr-21"></div>
        <div className="tracker tr-22"></div>
        <div className="tracker tr-23"></div>
        <div className="tracker tr-24"></div>
        <div className="tracker tr-25"></div>

        {/* 3D Elevated Card Body */}
        <div className="tracker-card-body group">
          {/* Subtle Ambient Decorative Circles */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-emerald-500/10 via-emerald-400/5 to-transparent rounded-full translate-x-10 -translate-y-10 pointer-events-none depth-layer-low"></div>
          <div className="absolute -bottom-10 -left-10 w-28 h-28 bg-gradient-to-tr from-amber-500/10 to-transparent rounded-full pointer-events-none depth-layer-low"></div>

          {/* Top Section: Icon & Badge with Depth */}
          <div className="space-y-4 relative z-10">
            <div className="flex items-center justify-between gap-3 depth-layer-high">
              {icon && (
                <div className={`p-3 rounded-2xl border transition-all duration-300 shadow-xs flex items-center justify-center ${themeIconStyles[variant]}`}>
                  {icon}
                </div>
              )}

              {badge && (
                <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full border shadow-2xs ${themeBadgeStyles[variant]}`}>
                  {badge}
                </span>
              )}
            </div>

            {/* Title with High Depth */}
            <div className="depth-layer-high pt-1">
              <h3 className="font-sans font-extrabold text-xl text-stone-900 tracking-tight transition-colors">
                {title}
              </h3>
            </div>

            {/* Content Body with Medium Depth */}
            <div className="depth-layer-med text-stone-600 text-sm leading-relaxed">
              {children}
            </div>
          </div>

          {/* Optional Footer or Subtle Interactive Micro-Prompt */}
          {footer ? (
            <div className="pt-4 border-t border-stone-100 mt-4 depth-layer-med relative z-10">
              {footer}
            </div>
          ) : (
            <div className="pt-4 mt-auto depth-layer-low flex items-center justify-between text-[11px] text-stone-400 font-medium select-none">
              <span className="flex items-center gap-1.5 group-hover:text-emerald-700 transition-colors">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/60 animate-pulse"></span>
                <span>Casa Sandríssima</span>
              </span>
              <span className="text-[10px] font-mono tracking-wide opacity-60 group-hover:opacity-100 transition-opacity">
                3D INTERACTIVE
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

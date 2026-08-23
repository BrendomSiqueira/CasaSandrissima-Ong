import React from 'react';

export type TactileButtonVariant = 'primary' | 'secondary' | 'accent' | 'amber' | 'dark' | 'glass' | 'outline';
export type TactileButtonSize = 'sm' | 'md' | 'lg';

export interface TactileButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: TactileButtonVariant;
  size?: TactileButtonSize;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  className?: string;
  isSent?: boolean;
  sentText?: string;
  animateLetters?: boolean;
  id?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  type?: 'button' | 'submit' | 'reset';
  title?: string;
  disabled?: boolean;
}

export default function TactileButton({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  className = '',
  isSent = false,
  sentText = 'Enviado!',
  animateLetters = true,
  ...props
}: TactileButtonProps) {

  // Helper to split text into animated letter spans
  const renderContent = (content: React.ReactNode) => {
    if (!animateLetters || typeof content !== 'string') {
      return <span>{content}</span>;
    }

    return (
      <p className="btn-text-wrapper inline-flex flex-wrap items-center justify-center pointer-events-none">
        {content.split('').map((char, index) => {
          if (char === ' ') {
            return (
              <span key={index} className="inline-block" style={{ width: '0.32em' }}>
                &nbsp;
              </span>
            );
          }
          return (
            <span
              key={index}
              style={{ '--i': index } as React.CSSProperties}
              className="inline-block"
            >
              {char}
            </span>
          );
        })}
      </p>
    );
  };

  const sizeClasses = {
    sm: 'tactile-btn-sm text-xs font-semibold px-4 py-2 min-h-[38px]',
    md: 'tactile-btn-md text-sm font-bold px-5 py-2.5 min-h-[46px]',
    lg: 'tactile-btn-lg text-base font-bold px-7 py-3.5 min-h-[56px]',
  }[size];

  const variantClass = `tactile-btn-${variant}`;

  return (
    <button
      {...props}
      className={`tactile-btn ${variantClass} ${sizeClasses} ${className} select-none`}
    >
      {/* Animated Conic Outline Glow on Hover */}
      <div className="btn-outline-glow" aria-hidden="true" />

      {/* Default State */}
      <div className={`btn-state btn-state--default ${isSent ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        {icon && iconPosition === 'left' && (
          <span className="btn-icon mr-1.5 shrink-0 inline-flex items-center justify-center">
            {icon}
          </span>
        )}
        {renderContent(children)}
        {icon && iconPosition === 'right' && (
          <span className="btn-icon ml-1.5 shrink-0 inline-flex items-center justify-center">
            {icon}
          </span>
        )}
      </div>

      {/* Sent/Completed State if applicable */}
      {isSent && (
        <div className="btn-state btn-state--sent absolute inset-0 flex items-center justify-center">
          <span className="btn-icon mr-1.5 inline-flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              height="1.2em"
              width="1.2em"
              strokeWidth="2"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </span>
          {renderContent(sentText)}
        </div>
      )}
    </button>
  );
}

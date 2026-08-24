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
  showArrows?: boolean;
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
  sentText = 'Enviado com sucesso!',
  showArrows = true,
  ...props
}: TactileButtonProps) {

  const sizeClasses = {
    sm: 'tactile-btn-sm text-xs font-semibold px-4 py-2 min-h-[38px]',
    md: 'tactile-btn-md text-sm font-bold px-6 py-2.5 min-h-[46px]',
    lg: 'tactile-btn-lg text-base font-bold px-8 py-3.5 min-h-[54px]',
  }[size];

  const variantClass = `tactile-btn-${variant}`;

  return (
    <button
      {...props}
      className={`tactile-btn ${variantClass} ${sizeClasses} ${className} select-none`}
    >
      {/* Sliding Arrow 2 (entering from left on hover) */}
      {showArrows && !isSent && (
        <svg viewBox="0 0 24 24" className="arr-2" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path
            d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z"
          />
        </svg>
      )}

      {/* Expanding Ripple/Morphing Circle from Center */}
      <span className="circle" aria-hidden="true"></span>

      {/* Default Content with Animated Translation */}
      <div className={`btn-state btn-state--default ${isSent ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        <span className="btn-text">
          {icon && iconPosition === 'left' && (
            <span className="btn-icon mr-1.5 shrink-0 inline-flex items-center justify-center">
              {icon}
            </span>
          )}
          <span>{children}</span>
          {icon && iconPosition === 'right' && (
            <span className="btn-icon ml-1.5 shrink-0 inline-flex items-center justify-center">
              {icon}
            </span>
          )}
        </span>
      </div>

      {/* Sliding Arrow 1 (exiting to right on hover) */}
      {showArrows && !isSent && (
        <svg viewBox="0 0 24 24" className="arr-1" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path
            d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z"
          />
        </svg>
      )}

      {/* Sent/Completed State if applicable */}
      {isSent && (
        <div className="btn-state btn-state--sent absolute inset-0 flex items-center justify-center z-10">
          <span className="btn-icon mr-1.5 inline-flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              height="1.2em"
              width="1.2em"
              strokeWidth="2.5"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </span>
          <span className="font-bold">{sentText}</span>
        </div>
      )}
    </button>
  );
}

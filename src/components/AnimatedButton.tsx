import React from 'react';

interface AnimatedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'emerald' | 'dark' | 'amber' | 'outline' | 'white';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  icon?: React.ReactNode;
  showArrows?: boolean;
  className?: string;
}

export default function AnimatedButton({
  variant = 'emerald',
  size = 'md',
  children,
  className = '',
  icon,
  showArrows = true,
  ...props
}: AnimatedButtonProps) {
  const sizeClasses = {
    sm: 'animated-btn-sm',
    md: 'animated-btn-md',
    lg: 'animated-btn-lg'
  }[size];

  const variantClasses = {
    emerald: 'animated-btn-emerald',
    dark: 'animated-btn-dark',
    amber: 'animated-btn-amber',
    outline: 'animated-btn-outline',
    white: 'animated-btn-white'
  }[variant];

  return (
    <button
      className={`animated-btn ${sizeClasses} ${variantClasses} ${className}`}
      {...props}
    >
      {showArrows && (
        <svg viewBox="0 0 24 24" className="arr-2" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z"
          />
        </svg>
      )}

      <span className="btn-text">
        {icon && <span className="btn-icon-addon">{icon}</span>}
        {children}
      </span>

      <span className="circle"></span>

      {showArrows && (
        <svg viewBox="0 0 24 24" className="arr-1" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z"
          />
        </svg>
      )}
    </button>
  );
}

import React from 'react';

interface PencilLoaderProps {
  size?: 'sm' | 'md' | 'lg' | number;
  message?: string;
  submessage?: string;
  className?: string;
}

export default function PencilLoader({
  size = 'md',
  message,
  submessage,
  className = ''
}: PencilLoaderProps) {
  const getSizePx = () => {
    if (typeof size === 'number') return size;
    switch (size) {
      case 'sm':
        return 75;
      case 'lg':
        return 160;
      case 'md':
      default:
        return 115;
    }
  };

  const px = getSizePx();

  return (
    <div className={`flex flex-col items-center justify-center text-center p-4 ${className}`}>
      <div style={{ width: `${px}px`, height: `${px}px` }} className="relative flex items-center justify-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 200 200"
          className="pencil"
          style={{ width: '100%', height: '100%' }}
        >
          <defs>
            <clipPath id="pencil-eraser">
              <rect height="30" width="30" ry="5" rx="5"></rect>
            </clipPath>
          </defs>
          <circle
            transform="rotate(-113,100,100)"
            strokeLinecap="round"
            strokeDashoffset="439.82"
            strokeDasharray="439.82 439.82"
            strokeWidth="2"
            stroke="currentColor"
            fill="none"
            r="70"
            className="pencil__stroke text-emerald-600"
          ></circle>
          <g transform="translate(100,100)" className="pencil__rotate">
            <g fill="none">
              <circle
                transform="rotate(-90)"
                strokeDashoffset="402"
                strokeDasharray="402.12 402.12"
                strokeWidth="30"
                stroke="hsl(223,90%,50%)"
                r="64"
                className="pencil__body1"
              ></circle>
              <circle
                transform="rotate(-90)"
                strokeDashoffset="465"
                strokeDasharray="464.96 464.96"
                strokeWidth="10"
                stroke="hsl(223,90%,60%)"
                r="74"
                className="pencil__body2"
              ></circle>
              <circle
                transform="rotate(-90)"
                strokeDashoffset="339"
                strokeDasharray="339.29 339.29"
                strokeWidth="10"
                stroke="hsl(223,90%,40%)"
                r="54"
                className="pencil__body3"
              ></circle>
            </g>
            <g transform="rotate(-90) translate(49,0)" className="pencil__eraser">
              <g className="pencil__eraser-skew">
                <rect height="30" width="30" ry="5" rx="5" fill="hsl(223,90%,70%)"></rect>
                <rect clipPath="url(#pencil-eraser)" height="30" width="5" fill="hsl(223,90%,60%)"></rect>
                <rect height="20" width="30" fill="hsl(223,10%,90%)"></rect>
                <rect height="20" width="15" fill="hsl(223,10%,70%)"></rect>
                <rect height="20" width="5" fill="hsl(223,10%,80%)"></rect>
                <rect height="2" width="30" y="6" fill="hsla(223,10%,10%,0.2)"></rect>
                <rect height="2" width="30" y="13" fill="hsla(223,10%,10%,0.2)"></rect>
              </g>
            </g>
            <g transform="rotate(-90) translate(49,-30)" className="pencil__point">
              <polygon points="15 0,30 30,0 30" fill="hsl(33,90%,70%)"></polygon>
              <polygon points="15 0,6 30,0 30" fill="hsl(33,90%,50%)"></polygon>
              <polygon points="15 0,20 10,10 10" fill="hsl(223,10%,10%)"></polygon>
            </g>
          </g>
        </svg>
      </div>

      {message && (
        <p className="mt-3 font-sans font-bold text-stone-800 text-sm tracking-tight">
          {message}
        </p>
      )}
      {submessage && (
        <p className="mt-0.5 text-xs text-stone-500 font-sans">
          {submessage}
        </p>
      )}
    </div>
  );
}

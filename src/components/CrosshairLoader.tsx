import React from 'react';

interface CrosshairLoaderProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const CrosshairLoader: React.FC<CrosshairLoaderProps> = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16'
  };

  return (
    <div className={`inline-block animate-spin ${sizeClasses[size]} ${className}`}>
      <svg
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Outer circle */}
        <circle
          cx="20"
          cy="20"
          r="18"
          stroke="currentColor"
          strokeWidth="2"
          strokeDasharray="28 100"
          opacity="0.3"
        />
        <circle
          cx="20"
          cy="20"
          r="18"
          stroke="currentColor"
          strokeWidth="2"
          strokeDasharray="28 100"
          strokeLinecap="round"
        />
        
        {/* Crosshair lines */}
        <line x1="20" y1="8" x2="20" y2="14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="20" y1="26" x2="20" y2="32" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="8" y1="20" x2="14" y2="20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="26" y1="20" x2="32" y2="20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        
        {/* Center dot */}
        <circle cx="20" cy="20" r="2" fill="currentColor" />
      </svg>
    </div>
  );
};

export default CrosshairLoader;

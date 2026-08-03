import React from 'react';

const AegisLogo = ({ className = "h-9 w-9", theme = "dark" }) => {
  const isLight = theme === 'light';
  
  return (
    <svg 
      className={`${className} animate-pulse-slow`}
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Gradients */}
        <linearGradient id="logo-shield-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={isLight ? "#5B4CF5" : "#2563EB"} />
          <stop offset="50%" stopColor={isLight ? "#6C63FF" : "#3B82F6"} />
          <stop offset="100%" stopColor={isLight ? "#14B8A6" : "#0D9488"} />
        </linearGradient>
        <linearGradient id="logo-cross-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={isLight ? "#6C63FF" : "#3B82F6"} />
          <stop offset="100%" stopColor={isLight ? "#5B4CF5" : "#60A5FA"} />
        </linearGradient>
        <linearGradient id="logo-glow" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={isLight ? "#5B4CF5" : "#2563EB"} stopOpacity="0.15" />
          <stop offset="100%" stopColor={isLight ? "#14B8A6" : "#14B8A6"} stopOpacity="0.05" />
        </linearGradient>
        
        {/* Glow Filter */}
        <filter id="glow-effect" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Glowing Backdrop */}
      <circle cx="50" cy="50" r="45" fill="url(#logo-glow)" />

      {/* Main Shield Outline - Aegis */}
      <path 
        d="M50 8L15 21V50C15 72 35 88 50 92C65 88 85 72 85 50V21L50 8Z" 
        stroke="url(#logo-shield-grad)" 
        strokeWidth="6" 
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={isLight ? "rgba(238, 240, 255, 0.35)" : "rgba(11, 17, 32, 0.45)"}
      />

      {/* Medical Cross - Health */}
      <path 
        d="M50 30V70M30 50H70" 
        stroke="url(#logo-cross-grad)" 
        strokeWidth="7" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />

      {/* Core AI Tech Node / Signal / Heartbeat Line overlaying the cross */}
      <path 
        d="M25 58H38L44 38L56 62L62 46L68 54L75 50" 
        stroke={isLight ? "#5B4CF5" : "#14B8A6"} 
        strokeWidth="4" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        filter="url(#glow-effect)"
      />
      
      {/* Node Dots on the Pulse */}
      <circle cx="44" cy="38" r="3.5" fill={isLight ? "#5B4CF5" : "#FFFFFF"} />
      <circle cx="56" cy="62" r="3.5" fill={isLight ? "#5B4CF5" : "#FFFFFF"} />
      <circle cx="62" cy="46" r="3.5" fill={isLight ? "#5B4CF5" : "#FFFFFF"} />
    </svg>
  );
};

export default AegisLogo;

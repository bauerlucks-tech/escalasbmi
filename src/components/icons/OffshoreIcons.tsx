import React from 'react';

export const HelicopterIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M12 3v3M12 3H8M12 3h4" strokeLinecap="round" />
    <ellipse cx="12" cy="13" rx="4" ry="3" />
    <path d="M16 13h4l1 2M8 13H4l-1 2" strokeLinecap="round" />
    <path d="M10 16l-2 4M14 16l2 4" strokeLinecap="round" />
    <path d="M8 20h8" strokeLinecap="round" />
    <circle cx="12" cy="13" r="1" fill="currentColor" />
  </svg>
);

export const HelicopterDetailedIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5">
    {/* Rotor blades */}
    <line x1="24" y1="8" x2="4" y2="8" strokeLinecap="round" strokeWidth="2" />
    <line x1="24" y1="8" x2="44" y2="8" strokeLinecap="round" strokeWidth="2" />
    {/* Rotor hub */}
    <circle cx="24" cy="8" r="2" fill="currentColor" />
    {/* Rotor shaft */}
    <line x1="24" y1="10" x2="24" y2="16" strokeWidth="2" />
    {/* Main body - cockpit */}
    <ellipse cx="20" cy="24" rx="10" ry="8" />
    {/* Cockpit window */}
    <path d="M12 22c2-3 6-4 10-3" strokeLinecap="round" />
    {/* Tail boom */}
    <path d="M30 24h12" strokeWidth="2" />
    {/* Tail rotor */}
    <circle cx="42" cy="24" r="3" />
    <line x1="42" y1="21" x2="42" y2="27" strokeWidth="2" />
    {/* Tail fin */}
    <path d="M40 24l4-6M40 24l4 4" strokeLinecap="round" />
    {/* Skids */}
    <path d="M12 32v4h16v-4" strokeLinecap="round" />
    <line x1="10" y1="36" x2="30" y2="36" strokeWidth="2" strokeLinecap="round" />
    {/* Door */}
    <path d="M16 20v8" strokeLinecap="round" />
  </svg>
);

export const HelipadIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="7" strokeDasharray="2 2" />
    <path d="M9 8v8M15 8v8M9 12h6" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const CargoIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="4" y="8" width="16" height="12" rx="1" />
    <path d="M8 8V6a2 2 0 012-2h4a2 2 0 012 2v2" />
    <path d="M4 12h16" strokeLinecap="round" />
    <path d="M10 12v4M14 12v4" strokeLinecap="round" />
    <rect x="9" y="14" width="6" height="2" rx="0.5" />
  </svg>
);

export const RotorIcon: React.FC<{ className?: string; animated?: boolean }> = ({ className, animated = true }) => (
  <svg className={`${className} ${animated ? 'animate-spin' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="12" cy="12" r="2" fill="currentColor" />
    <line x1="12" y1="12" x2="12" y2="2" strokeWidth="2" strokeLinecap="round" />
    <line x1="12" y1="12" x2="20.5" y2="17" strokeWidth="2" strokeLinecap="round" />
    <line x1="12" y1="12" x2="3.5" y2="17" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const PlatformIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="6" y="8" width="12" height="8" rx="1" />
    <path d="M4 16h16" strokeLinecap="round" />
    <path d="M6 16v4M18 16v4" strokeLinecap="round" />
    <path d="M4 20h16" strokeLinecap="round" />
    <path d="M10 5v3M14 5v3" strokeLinecap="round" />
    <path d="M10 5h4" strokeLinecap="round" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);

export const WaveIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M2 12c2-2 4-2 6 0s4 2 6 0 4-2 6 0" strokeLinecap="round" />
    <path d="M2 16c2-2 4-2 6 0s4 2 6 0 4-2 6 0" strokeLinecap="round" opacity="0.6" />
    <path d="M2 8c2-2 4-2 6 0s4 2 6 0 4-2 6 0" strokeLinecap="round" opacity="0.3" />
  </svg>
);

export const ShipIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M4 19l2-10h12l2 10" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M6 9V6a1 1 0 011-1h10a1 1 0 011 1v3" strokeLinecap="round" />
    <path d="M12 5V3" strokeLinecap="round" />
    <path d="M2 19c2 1 4 1 6 0s4-1 6 0 4 1 6 0" strokeLinecap="round" />
  </svg>
);

export const ContainerIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="3" y="6" width="18" height="12" rx="1" />
    <path d="M7 6v12M11 6v12M15 6v12M19 6v12" strokeLinecap="round" />
    <path d="M3 10h18M3 14h18" strokeLinecap="round" />
  </svg>
);

export const AirTrafficIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="10" y="2" width="4" height="10" rx="1" />
    <rect x="6" y="12" width="12" height="4" rx="1" />
    <path d="M12 16v6" strokeWidth="2" strokeLinecap="round" />
    <path d="M8 22h8" strokeLinecap="round" />
    <circle cx="12" cy="6" r="1" fill="currentColor" />
  </svg>
);

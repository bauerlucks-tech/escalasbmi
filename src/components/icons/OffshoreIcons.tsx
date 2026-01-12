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

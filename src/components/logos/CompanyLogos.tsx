import React from 'react';

interface LogoProps {
  className?: string;
  showName?: boolean;
}

// Petrobras - Professional logo with Brazilian colors
export const PetrobrasLogo: React.FC<LogoProps> = ({ className, showName = true }) => (
  <div className={`flex items-center gap-2 ${className}`}>
    <svg viewBox="0 0 40 40" className="w-8 h-8" fill="none">
      <circle cx="20" cy="20" r="18" fill="#006B3F" />
      <circle cx="20" cy="20" r="18" fill="url(#petrobras-gradient)" opacity="0.9"/>
      <path d="M12 20h16M20 12v16" stroke="#FFD700" strokeWidth="2" strokeLinecap="round" opacity="0.8"/>
      <circle cx="20" cy="20" r="6" fill="none" stroke="#FFD700" strokeWidth="1.5" opacity="0.6"/>
      <defs>
        <radialGradient id="petrobras-gradient" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#00A859" />
          <stop offset="100%" stopColor="#006B3F" />
        </radialGradient>
      </defs>
    </svg>
    {showName && <span className="text-xs font-semibold text-muted-foreground">Petrobras</span>}
  </div>
);

// Omni Taxi Aéreo - Professional helicopter logo
export const OmniLogo: React.FC<LogoProps> = ({ className, showName = true }) => (
  <div className={`flex items-center gap-2 ${className}`}>
    <svg viewBox="0 0 40 40" className="w-8 h-8" fill="none">
      <rect x="4" y="4" width="32" height="32" rx="6" fill="url(#omni-gradient)" />
      {/* Helicopter body */}
      <ellipse cx="20" cy="22" rx="8" ry="3" fill="#FFFFFF" opacity="0.9"/>
      {/* Helicopter tail */}
      <path d="M28 22l6-1v2l-6 1z" fill="#FFFFFF" opacity="0.8"/>
      {/* Helicopter rotor */}
      <path d="M12 18h16" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" opacity="0.7"/>
      <path d="M20 10v16" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" opacity="0.7"/>
      {/* OMNI text */}
      <text x="20" y="30" textAnchor="middle" fill="#FFFFFF" fontSize="8" fontWeight="bold" fontFamily="Arial">OMNI</text>
      <defs>
        <linearGradient id="omni-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1E3A8A" />
          <stop offset="100%" stopColor="#3B82F6" />
        </linearGradient>
      </defs>
    </svg>
    {showName && <span className="text-xs font-semibold text-muted-foreground">Omni</span>}
  </div>
);

// Líder Taxi Aéreo - Professional L with aviation elements
export const LiderLogo: React.FC<LogoProps> = ({ className, showName = true }) => (
  <div className={`flex items-center gap-2 ${className}`}>
    <svg viewBox="0 0 40 40" className="w-8 h-8" fill="none">
      <circle cx="20" cy="20" r="18" fill="url(#lider-gradient)" />
      {/* Bold L */}
      <path d="M14 12v16h4V20h8v-4H18v-4z" fill="#FFFFFF" opacity="0.95"/>
      {/* Wing element */}
      <path d="M12 16l16-2M12 18l16-2" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" opacity="0.7"/>
      {/* Aviation symbol */}
      <circle cx="28" cy="14" r="2" fill="none" stroke="#FFFFFF" strokeWidth="1" opacity="0.6"/>
      <defs>
        <linearGradient id="lider-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#DC2626" />
          <stop offset="100%" stopColor="#C41E3A" />
        </linearGradient>
      </defs>
    </svg>
    {showName && <span className="text-xs font-semibold text-muted-foreground">Líder</span>}
  </div>
);

// CHC do Brasil - Professional aviation logo
export const CHCLogo: React.FC<LogoProps> = ({ className, showName = true }) => (
  <div className={`flex items-center gap-2 ${className}`}>
    <svg viewBox="0 0 40 40" className="w-8 h-8" fill="none">
      <rect x="4" y="4" width="32" height="32" rx="6" fill="url(#chc-gradient)" />
      {/* Helicopter silhouette */}
      <ellipse cx="20" cy="16" rx="7" ry="2.5" fill="#FFFFFF" opacity="0.9"/>
      <path d="M27 16l5-1v2l-5 1z" fill="#FFFFFF" opacity="0.8"/>
      {/* Rotor blades */}
      <path d="M11 14h18" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" opacity="0.7"/>
      <path d="M20 8v16" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" opacity="0.7"/>
      {/* CHC text */}
      <text x="20" y="28" textAnchor="middle" fill="#FFFFFF" fontSize="7" fontWeight="bold" fontFamily="Arial">CHC</text>
      <text x="20" y="32" textAnchor="middle" fill="#FFFFFF" fontSize="4" fontWeight="normal" fontFamily="Arial">BRASIL</text>
      <defs>
        <linearGradient id="chc-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0D4F8B" />
          <stop offset="100%" stopColor="#1E40AF" />
        </linearGradient>
      </defs>
    </svg>
    {showName && <span className="text-xs font-semibold text-muted-foreground">CHC</span>}
  </div>
);

// Combined partner logos component
export const PartnerLogos: React.FC<{ className?: string; compact?: boolean }> = ({ className, compact = false }) => (
  <div className={`flex items-center justify-center gap-4 ${className}`}>
    <PetrobrasLogo showName={!compact} />
    <OmniLogo showName={!compact} />
    <LiderLogo showName={!compact} />
    <CHCLogo showName={!compact} />
  </div>
);

// Aviation operations badge
export const AviationBadge: React.FC<{ className?: string }> = ({ className }) => (
  <div className={`inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-full ${className}`}>
    <svg viewBox="0 0 24 24" className="w-4 h-4 text-primary" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <path d="M9 8v8M15 8v8M9 12h6" strokeLinecap="round" />
    </svg>
    <span className="text-xs font-semibold text-primary uppercase tracking-wider">Operações Aéreas</span>
  </div>
);

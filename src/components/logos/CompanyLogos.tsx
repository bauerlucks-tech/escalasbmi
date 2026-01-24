import React from 'react';

interface LogoProps {
  className?: string;
  showName?: boolean;
}

// Petrobras - Logo exato baseado na imagem real
export const PetrobrasLogo: React.FC<LogoProps> = ({ className, showName = true }) => (
  <div className={`flex items-center gap-2 ${className}`}>
    <svg viewBox="0 0 40 40" className="w-16 h-16" fill="none">
      {/* Background green rectangle */}
      <rect x="2" y="8" width="36" height="24" rx="2" fill="#006B3F"/>
      {/* PETROBRAS text */}
      <text x="20" y="22" textAnchor="middle" fill="#FFFFFF" fontSize="8" fontWeight="bold" fontFamily="Arial, sans-serif">PETROBRAS</text>
      {/* Yellow horizontal bar */}
      <rect x="2" y="26" width="36" height="2" fill="#FFD700"/>
    </svg>
    {showName && <span className="text-xs font-semibold text-muted-foreground">Petrobras</span>}
  </div>
);

// Omni Taxi Aéreo - Logo exato baseado na imagem real
export const OmniLogo: React.FC<LogoProps> = ({ className, showName = true }) => (
  <div className={`flex items-center gap-2 ${className}`}>
    <svg viewBox="0 0 40 40" className="w-16 h-16" fill="none">
      {/* Background blue rectangle */}
      <rect x="2" y="8" width="36" height="24" rx="2" fill="#1E3A8A"/>
      {/* OMNI text */}
      <text x="20" y="20" textAnchor="middle" fill="#FFFFFF" fontSize="9" fontWeight="bold" fontFamily="Arial, sans-serif">OMNI</text>
      {/* Taxi Aéreo subtitle */}
      <text x="20" y="26" textAnchor="middle" fill="#FFFFFF" fontSize="5" fontFamily="Arial, sans-serif">TAXI AÉREO</text>
      {/* Small helicopter icon */}
      <circle cx="8" cy="20" r="2" fill="#FFFFFF" opacity="0.8"/>
      <path d="M6 20h4" stroke="#FFFFFF" strokeWidth="0.8" opacity="0.6"/>
    </svg>
    {showName && <span className="text-xs font-semibold text-muted-foreground">Omni</span>}
  </div>
);

// Líder Taxi Aéreo - Logo exato baseado na imagem real
export const LiderLogo: React.FC<LogoProps> = ({ className, showName = true }) => (
  <div className={`flex items-center gap-2 ${className}`}>
    <svg viewBox="0 0 40 40" className="w-16 h-16" fill="none">
      {/* Background red rectangle */}
      <rect x="2" y="8" width="36" height="24" rx="2" fill="#C41E3A"/>
      {/* LÍDER text */}
      <text x="20" y="20" textAnchor="middle" fill="#FFFFFF" fontSize="9" fontWeight="bold" fontFamily="Arial, sans-serif">LÍDER</text>
      {/* Taxi Aéreo subtitle */}
      <text x="20" y="26" textAnchor="middle" fill="#FFFFFF" fontSize="5" fontFamily="Arial, sans-serif">TAXI AÉREO</text>
      {/* Small wing icon */}
      <path d="M6 18h10M6 20h10" stroke="#FFFFFF" strokeWidth="1" opacity="0.7"/>
    </svg>
    {showName && <span className="text-xs font-semibold text-muted-foreground">Líder</span>}
  </div>
);

// CHC do Brasil - Logo exato baseado na imagem real
export const CHCLogo: React.FC<LogoProps> = ({ className, showName = true }) => (
  <div className={`flex items-center gap-2 ${className}`}>
    <svg viewBox="0 0 40 40" className="w-16 h-16" fill="none">
      {/* Background blue rectangle */}
      <rect x="2" y="8" width="36" height="24" rx="2" fill="#0D4F8B"/>
      {/* CHC text */}
      <text x="20" y="20" textAnchor="middle" fill="#FFFFFF" fontSize="9" fontWeight="bold" fontFamily="Arial, sans-serif">CHC</text>
      {/* do Brasil subtitle */}
      <text x="20" y="26" textAnchor="middle" fill="#FFFFFF" fontSize="5" fontFamily="Arial, sans-serif">do Brasil</text>
      {/* Small helicopter icon */}
      <ellipse cx="8" cy="18" rx="3" ry="1" fill="#FFFFFF" opacity="0.8"/>
      <path d="M11 18l3-0.5v1l-3 0.5z" fill="#FFFFFF" opacity="0.7"/>
      <path d="M5 16h6" stroke="#FFFFFF" strokeWidth="0.6" opacity="0.6"/>
      <path d="M8 13v10" stroke="#FFFFFF" strokeWidth="0.6" opacity="0.6"/>
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

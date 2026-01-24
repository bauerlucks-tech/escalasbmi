import React from 'react';

interface LogoProps {
  className?: string;
  showName?: boolean;
}

// Petrobras - Logo original mantendo identidade visual
export const PetrobrasLogo: React.FC<LogoProps> = ({ className, showName = true }) => (
  <div className={`flex items-center gap-2 ${className}`}>
    <svg viewBox="0 0 120 40" className="w-12 h-8" fill="none">
      {/* Background rectangle */}
      <rect x="0" y="0" width="120" height="40" rx="4" fill="#006B3F"/>
      {/* Petrobras text in original style */}
      <text x="60" y="25" textAnchor="middle" fill="#FFFFFF" fontSize="14" fontWeight="bold" fontFamily="Arial, sans-serif">PETROBRAS</text>
      {/* Yellow accent bar */}
      <rect x="10" y="30" width="100" height="2" fill="#FFD700" opacity="0.8"/>
    </svg>
    {showName && <span className="text-xs font-semibold text-muted-foreground">Petrobras</span>}
  </div>
);

// Omni Taxi Aéreo - Logo original mantendo identidade visual
export const OmniLogo: React.FC<LogoProps> = ({ className, showName = true }) => (
  <div className={`flex items-center gap-2 ${className}`}>
    <svg viewBox="0 0 100 40" className="w-12 h-8" fill="none">
      {/* Background */}
      <rect x="0" y="0" width="100" height="40" rx="4" fill="#1E3A8A"/>
      {/* OMNI text in original style */}
      <text x="50" y="25" textAnchor="middle" fill="#FFFFFF" fontSize="16" fontWeight="bold" fontFamily="Arial, sans-serif">OMNI</text>
      {/* Taxi Aéreo subtitle */}
      <text x="50" y="35" textAnchor="middle" fill="#FFFFFF" fontSize="8" fontFamily="Arial, sans-serif">TAXI AÉREO</text>
      {/* Small helicopter icon */}
      <circle cx="15" cy="20" r="3" fill="#FFFFFF" opacity="0.8"/>
      <path d="M12 20h6" stroke="#FFFFFF" strokeWidth="1" opacity="0.6"/>
    </svg>
    {showName && <span className="text-xs font-semibold text-muted-foreground">Omni</span>}
  </div>
);

// Líder Taxi Aéreo - Logo original mantendo identidade visual
export const LiderLogo: React.FC<LogoProps> = ({ className, showName = true }) => (
  <div className={`flex items-center gap-2 ${className}`}>
    <svg viewBox="0 0 100 40" className="w-12 h-8" fill="none">
      {/* Background */}
      <rect x="0" y="0" width="100" height="40" rx="4" fill="#C41E3A"/>
      {/* LÍDER text in original style */}
      <text x="50" y="25" textAnchor="middle" fill="#FFFFFF" fontSize="16" fontWeight="bold" fontFamily="Arial, sans-serif">LÍDER</text>
      {/* Taxi Aéreo subtitle */}
      <text x="50" y="35" textAnchor="middle" fill="#FFFFFF" fontSize="8" fontFamily="Arial, sans-serif">TAXI AÉREO</text>
      {/* Small wing icon */}
      <path d="M10 20h15M10 18h15" stroke="#FFFFFF" strokeWidth="1.5" opacity="0.7"/>
    </svg>
    {showName && <span className="text-xs font-semibold text-muted-foreground">Líder</span>}
  </div>
);

// CHC do Brasil - Logo original mantendo identidade visual
export const CHCLogo: React.FC<LogoProps> = ({ className, showName = true }) => (
  <div className={`flex items-center gap-2 ${className}`}>
    <svg viewBox="0 0 100 40" className="w-12 h-8" fill="none">
      {/* Background */}
      <rect x="0" y="0" width="100" height="40" rx="4" fill="#0D4F8B"/>
      {/* CHC text in original style */}
      <text x="50" y="22" textAnchor="middle" fill="#FFFFFF" fontSize="18" fontWeight="bold" fontFamily="Arial, sans-serif">CHC</text>
      {/* do Brasil subtitle */}
      <text x="50" y="32" textAnchor="middle" fill="#FFFFFF" fontSize="8" fontFamily="Arial, sans-serif">do Brasil</text>
      {/* Small helicopter icon */}
      <ellipse cx="15" cy="20" rx="4" ry="1.5" fill="#FFFFFF" opacity="0.8"/>
      <path d="M19 20l4-0.5v1l-4 0.5z" fill="#FFFFFF" opacity="0.7"/>
      <path d="M11 18h8" stroke="#FFFFFF" strokeWidth="0.8" opacity="0.6"/>
      <path d="M15 14v12" stroke="#FFFFFF" strokeWidth="0.8" opacity="0.6"/>
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

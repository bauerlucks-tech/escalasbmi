import React from 'react';

interface LogoProps {
  className?: string;
  showName?: boolean;
}

// Petrobras - Stylized logo (green/yellow BR shape)
export const PetrobrasLogo: React.FC<LogoProps> = ({ className, showName = true }) => (
  <div className={`flex items-center gap-2 ${className}`}>
    <svg viewBox="0 0 40 40" className="w-12 h-12" fill="none">
      <circle cx="20" cy="20" r="18" fill="url(#petrobras-gradient)" />
      <text x="20" y="26" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold" fontFamily="Arial">BR</text>
      <defs>
        <linearGradient id="petrobras-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#006B3F" />
          <stop offset="100%" stopColor="#00A859" />
        </linearGradient>
      </defs>
    </svg>
    {showName && <span className="text-xs font-semibold text-muted-foreground">Petrobras</span>}
  </div>
);

// Omni Taxi Aéreo - Stylized helicopter outline
export const OmniLogo: React.FC<LogoProps> = ({ className, showName = true }) => (
  <div className={`flex items-center gap-2 ${className}`}>
    <svg viewBox="0 0 40 40" className="w-12 h-12" fill="none">
      <rect x="4" y="4" width="32" height="32" rx="4" fill="#1E3A8A" />
      <text x="20" y="24" textAnchor="middle" fill="#FBBF24" fontSize="10" fontWeight="bold" fontFamily="Arial">OMNI</text>
      <path d="M12 30l16-2" stroke="#FBBF24" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
    {showName && <span className="text-xs font-semibold text-muted-foreground">Omni</span>}
  </div>
);

// Líder Taxi Aéreo - Bold L with wing
export const LiderLogo: React.FC<LogoProps> = ({ className, showName = true }) => (
  <div className={`flex items-center gap-2 ${className}`}>
    <svg viewBox="0 0 40 40" className="w-12 h-12" fill="none">
      <circle cx="20" cy="20" r="18" fill="#C41E3A" />
      <text x="20" y="26" textAnchor="middle" fill="white" fontSize="18" fontWeight="bold" fontFamily="Arial">L</text>
      <path d="M14 14l12 3" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
    </svg>
    {showName && <span className="text-xs font-semibold text-muted-foreground">Líder</span>}
  </div>
);

// CHC do Brasil - CHC text with helicopter silhouette
export const CHCLogo: React.FC<LogoProps> = ({ className, showName = true }) => (
  <div className={`flex items-center gap-2 ${className}`}>
    <svg viewBox="0 0 40 40" className="w-12 h-12" fill="none">
      <rect x="4" y="4" width="32" height="32" rx="4" fill="#0D4F8B" />
      <text x="20" y="22" textAnchor="middle" fill="white" fontSize="9" fontWeight="bold" fontFamily="Arial">CHC</text>
      <path d="M10 28h20" stroke="#00B5E2" strokeWidth="2" strokeLinecap="round" />
      {/* Mini helicopter silhouette */}
      <ellipse cx="20" cy="12" rx="6" ry="2" fill="#00B5E2" opacity="0.6" />
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

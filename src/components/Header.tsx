import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSwap } from '@/contexts/SwapContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { HelicopterDetailedIcon, HelipadIcon } from '@/components/icons/OffshoreIcons';
import { PartnerLogos } from '@/components/logos/CompanyLogos';
import { LogOut, Shield, Bell, Calendar, ArrowLeftRight, Settings, Plane } from 'lucide-react';
import UserSettings from '@/components/UserSettings';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab }) => {
  const { currentUser, logout, isAdmin } = useAuth();
  const { getPendingCount, getPendingAdminApproval } = useSwap();
  
  const pendingCount = currentUser ? getPendingCount(currentUser.name) : 0;
  const adminPendingCount = isAdmin(currentUser) ? getPendingAdminApproval().length : 0;

  const tabs = [
    { id: 'schedule', label: 'Escala SBMIBZ', icon: Calendar },
    { id: 'swap', label: 'Solicitar Troca', icon: ArrowLeftRight },
    { id: 'requests', label: 'Solicitações', icon: Bell, badge: pendingCount },
  ];

  if (isAdmin(currentUser)) {
    tabs.push({ id: 'admin', label: 'Administração', icon: Settings, badge: adminPendingCount });
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2);
  };

  return (
    <header className="glass-card sticky top-0 z-50 border-b border-border/50">
      <div className="container mx-auto px-4">
        {/* Top bar */}
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center gap-4">
            {/* Logo */}
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 glow-primary relative">
              <HelicopterDetailedIcon className="w-7 h-7 text-primary" />
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-success border-2 border-card" />
            </div>
            
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-gradient">Operações Aéreas Offshore</h1>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 bg-primary/10 rounded text-xs text-primary font-medium">
                  <Plane className="w-3 h-3" />
                  ATIVO
                </span>
              </div>
              <p className="text-xs text-muted-foreground">Sistema de Escalas • Janeiro 2026</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Partner logos - hidden on mobile */}
            <div className="hidden lg:block mr-2">
              <PartnerLogos compact />
            </div>
            
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50 border border-border/50">
              {isAdmin(currentUser) && (
                <Shield className="w-4 h-4 text-primary" />
              )}
              {currentUser?.profileImage ? (
                <Avatar className="w-6 h-6">
                  <AvatarImage src={currentUser.profileImage} alt={currentUser.name} />
                  <AvatarFallback className="text-[10px] bg-primary/20 text-primary">
                    {getInitials(currentUser.name)}
                  </AvatarFallback>
                </Avatar>
              ) : (
                <HelipadIcon className="w-4 h-4 text-muted-foreground" />
              )}
              <span className="text-sm font-medium">{currentUser?.name}</span>
            </div>
            
            <UserSettings />
            
            <Button 
              variant="ghost" 
              size="icon"
              onClick={logout}
              className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Navigation tabs */}
        <nav className="flex gap-1 pb-2 overflow-x-auto">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium
                  transition-all whitespace-nowrap relative
                  ${isActive 
                    ? 'bg-primary text-primary-foreground glow-primary' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
                {tab.badge && tab.badge > 0 && (
                  <span className={`
                    absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs font-bold
                    flex items-center justify-center
                    ${isActive ? 'bg-white text-primary' : 'bg-primary text-primary-foreground'}
                  `}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};

export default Header;

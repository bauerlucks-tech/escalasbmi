import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSwap } from '@/contexts/SwapContext';
import { Button } from '@/components/ui/button';
import { PlatformIcon, HelicopterIcon } from '@/components/icons/OffshoreIcons';
import { LogOut, Shield, Bell, Calendar, ArrowLeftRight, Settings } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab }) => {
  const { currentUser, logout } = useAuth();
  const { getPendingCount, getPendingAdminApproval } = useSwap();
  
  const pendingCount = currentUser ? getPendingCount(currentUser.name) : 0;
  const adminPendingCount = currentUser?.isAdmin ? getPendingAdminApproval().length : 0;

  const tabs = [
    { id: 'schedule', label: 'Minha Escala', icon: Calendar },
    { id: 'swap', label: 'Solicitar Troca', icon: ArrowLeftRight },
    { id: 'requests', label: 'Solicitações', icon: Bell, badge: pendingCount },
  ];

  if (currentUser?.isAdmin) {
    tabs.push({ id: 'admin', label: 'Administração', icon: Settings, badge: adminPendingCount });
  }

  return (
    <header className="glass-card sticky top-0 z-50 border-b border-border/50">
      <div className="container mx-auto px-4">
        {/* Top bar */}
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10">
              <PlatformIcon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gradient">Escala Offshore</h1>
              <p className="text-xs text-muted-foreground">Janeiro 2026</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50">
              {currentUser?.isAdmin && (
                <Shield className="w-4 h-4 text-primary" />
              )}
              <span className="text-sm font-medium">{currentUser?.name}</span>
            </div>
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
                    ? 'bg-primary text-primary-foreground' 
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

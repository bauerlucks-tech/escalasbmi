import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSwap } from '@/contexts/SwapContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { HelicopterDetailedIcon, HelipadIcon } from '@/components/icons/OffshoreIcons';
import { PartnerLogos } from '@/components/logos/CompanyLogos';
import { LogOut, Shield, Bell, Calendar, ArrowLeftRight, Settings, Plane, User, HelpCircle, Database, TestTube, FileText } from 'lucide-react';
import UserSettings from '@/components/UserSettings';
import OperatorHelp from '@/components/OperatorHelp';
import ThemeToggle from '@/components/ThemeToggle';
import TestPanel from '@/components/TestPanel';
import NotificationCenter from '@/components/NotificationCenter';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}
///
const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab }) => {
  const { currentUser, logout, isAdmin, isSuperAdmin } = useAuth();
  const { getPendingCount, getPendingAdminApproval } = useSwap();
  const [showHelp, setShowHelp] = React.useState(false);
  const [showTestPanel, setShowTestPanel] = React.useState(false);
  
  const pendingCount = currentUser ? getPendingCount(currentUser.name) : 0;
  const adminPendingCount = isAdmin(currentUser) ? getPendingAdminApproval().length : 0;

  let tabs = [
    { id: 'schedule', label: 'Escala SBMIBZ', icon: Calendar },
    { id: 'swap', label: 'Solicitar Troca', icon: ArrowLeftRight },
    { id: 'requests', label: 'Solicitações', icon: Bell, badge: pendingCount },
    { id: 'vacations', label: 'Férias', icon: Plane },
  ];

  // Remove "Solicitar Troca" e "Solicitações" para o usuário RICARDO
  if (currentUser?.name === 'RICARDO') {
    tabs = tabs.filter(tab => tab.id !== 'swap' && tab.id !== 'requests');
  }

  // Adicionar aba de ajuda para operadores (não administradores)
  if (currentUser && !isAdmin(currentUser)) {
    tabs.push({ id: 'help', label: 'Ajuda', icon: HelpCircle });
  }

  if (currentUser && isAdmin(currentUser)) {
    tabs.push({ id: 'admin', label: 'Administração', icon: Settings, badge: adminPendingCount });
  }

  // Adicionar aba de Backup apenas para Super Admin
  if (currentUser && isSuperAdmin(currentUser)) {
    tabs.push({ id: 'backup', label: 'Backup', icon: Database });
    tabs.push({ id: 'audit', label: 'Auditoria', icon: FileText });
  }

  // Adicionar aba de Testes apenas no branch de teste
  if (window.location.hostname === 'localhost' || process.env.NODE_ENV === 'development' || window.location.pathname.includes('test')) {
    tabs.push({ id: 'test', label: 'Testes', icon: TestTube });
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
              <p className="text-xs text-muted-foreground">Sistemas de Escalas</p>
              <div className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 bg-muted rounded text-xs text-muted-foreground">
                v2.0
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Partner logos - hidden on mobile */}
            <div className="hidden lg:block mr-2">
              <PartnerLogos compact />
            </div>
            
            {/* User Actions */}
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <NotificationCenter />
              <UserSettings trigger={
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                  <Settings className="w-5 h-5" />
                </Button>
              } />
              
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowHelp(true)}
                className="text-muted-foreground hover:text-foreground"
              >
                <HelpCircle className="w-5 h-5" />
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={logout}
                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              >
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
            
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50 border border-border/50">
              {currentUser && isSuperAdmin(currentUser) && (
                <Shield className="w-4 h-4 text-destructive" />
              )}
              {currentUser && isAdmin(currentUser) && !isSuperAdmin(currentUser) && (
                <Shield className="w-4 h-4 text-primary" />
              )}
              {currentUser?.profileImage ? (
                <Avatar className="w-6 h-6">
                  <AvatarImage src={currentUser.profileImage} alt={currentUser.name || ''} />
                  <AvatarFallback className="text-[10px] bg-primary/20 text-primary">
                    {getInitials(currentUser.name || '')}
                  </AvatarFallback>
                </Avatar>
              ) : currentUser ? (
                <span className="text-sm font-medium">{getInitials(currentUser.name || '')}</span>
              ) : null}
            </div>
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

      {/* Help Modal */}
      {showHelp && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-background rounded-xl border border-border/50 max-w-6xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-4 border-b border-border/50 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Guia do Operador</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowHelp(false)}
              >
                ✕
              </Button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[calc(90vh-80px)]">
              <OperatorHelp />
            </div>
          </div>
        </div>
      )}

      {/* Test Panel Modal */}
      {showTestPanel && (
        <TestPanel onClose={() => setShowTestPanel(false)} />
      )}
    </header>
  );
};

export default Header;

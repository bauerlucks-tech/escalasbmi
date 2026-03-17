import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSwap } from '@/contexts/SwapContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { HelicopterDetailedIcon, HelipadIcon } from '@/components/icons/OffshoreIcons';
import { PartnerLogos } from '@/components/logos/CompanyLogos';
import { LogOut, Shield, Bell, Calendar, ArrowLeftRight, Settings, Plane, User, HelpCircle, Database, TestTube, FileText, BarChart3, Activity } from 'lucide-react';
import UserSettings from '@/components/UserSettings';
import OperatorHelp from '@/components/OperatorHelp';
import ThemeToggle from '@/components/ThemeToggle';
import TestPanel from '@/components/TestPanel';
import NotificationCenter from '@/components/NotificationCenter';
import ReportsDashboard from '@/components/ReportsDashboard';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

interface TabItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  badge?: number;
}
///
const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab }) => {
  const { currentUser, logout, isAdmin, isSuperAdmin, switchToSuperAdmin, switchBackToUser, isHiddenSuperAdmin } = useAuth();
  const { getPendingCount, getPendingAdminApproval } = useSwap();
  const [showHelp, setShowHelp] = React.useState(false);
  const [showTestPanel, setShowTestPanel] = React.useState(false);
  const [secretKeyClicks, setSecretKeyClicks] = React.useState(0);
  
  const pendingCount = currentUser ? getPendingCount(currentUser.name) : 0;
  const adminPendingCount = isAdmin(currentUser) ? getPendingAdminApproval().length : 0;

  
  const tabs: TabItem[] = [
    { id: 'schedule', label: 'Escala SBMIBZ', icon: Calendar },
  ];

  // Adicionar aba de Solicitar Troca apenas para OPERADORES (não administradores)
  const operatorTabs = currentUser && !isAdmin(currentUser) 
    ? [{ id: 'swap', label: 'Solicitar Troca', icon: ArrowLeftRight }]
    : [];

  // Adicionar aba de Férias apenas para OPERADORES (não administradores)
  const vacationTabs = currentUser && !isAdmin(currentUser)
    ? [{ id: 'vacations', label: 'Férias', icon: Plane }]
    : [];

  // Adicionar aba de ajuda para operadores (não administradores)
  const helpTabs = currentUser && !isAdmin(currentUser)
    ? [{ id: 'help', label: 'Ajuda', icon: HelpCircle }]
    : [];

  // Adicionar abas de ADMINISTRAÇÃO apenas para ADMINISTRADORES
  const adminTabs = currentUser && isAdmin(currentUser)
    ? [{ id: 'admin', label: 'Administração', icon: Settings }]
    : [];

  // Adicionar aba de Backup e Auditoria apenas para Super Admin
  const superAdminTabs = currentUser && isSuperAdmin(currentUser)
    ? [
        { id: 'backup', label: 'Backup', icon: Database },
        { id: 'audit', label: 'Auditoria', icon: FileText }
      ]
    : [];

  // Adicionar aba de Relatórios para Admins e Super Admins
  const reportTabs = currentUser && (isAdmin(currentUser) || isSuperAdmin(currentUser))
    ? [{ id: 'reports', label: 'Relatórios', icon: BarChart3 }]
    : [];

  // Combinar todas as abas
  const allTabs = [
    ...tabs,
    ...operatorTabs,
    ...vacationTabs,
    ...helpTabs,
    ...adminTabs,
    ...superAdminTabs,
    ...reportTabs
  ];

  // Adicionar aba de Calendário para todos os usuários (DESATIVADO TEMPORARIAMENTE)
  // if (currentUser) {
  //   tabs.push({ id: 'calendar', label: 'Calendário', icon: Calendar });
  // }

  // Adicionar abas avançadas para Admins e Super Admins
  const analyticsTabs = currentUser && (isAdmin(currentUser) || isSuperAdmin(currentUser))
    ? [{ id: 'analytics', label: 'Analytics', icon: BarChart3 }]
    : [];

  // Combinar todas as abas finais
  const baseTabs = [...allTabs, ...analyticsTabs];

  // Adicionar abas especiais apenas para Super Admin
  const superAdminSpecialTabs = currentUser && isSuperAdmin(currentUser)
    ? [
        { id: 'widgets', label: 'Widgets', icon: Settings },
        { id: 'performance', label: 'Performance', icon: Activity }
      ]
    : [];

  // Adicionar aba de Animações apenas para Super Admin em desenvolvimento
  const developmentTabs = currentUser && isSuperAdmin(currentUser) && (window.location.hostname === 'localhost' || process.env.NODE_ENV === 'development')
    ? [{ id: 'animations', label: 'Animações', icon: Settings }]
    : [];

  // Combinar todas as abas finais
  const finalTabs = [
    ...baseTabs,
    ...superAdminSpecialTabs,
    ...developmentTabs
  ];

  // Adicionar aba de Testes apenas para Super Admin em desenvolvimento
  const testTabs = currentUser && isSuperAdmin(currentUser) && (window.location.hostname === 'localhost' || process.env.NODE_ENV === 'development' || window.location.pathname.includes('test'))
    ? [{ id: 'test', label: 'Testes', icon: TestTube }]
    : [];

  // Combinar todas as abas finais
  const allFinalTabs: TabItem[] = [
    ...finalTabs,
    ...testTabs
  ];

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2);
  };

  const handleLogoClick = () => {
    setSecretKeyClicks(prev => {
      const newCount = prev + 1;
      
      if (newCount >= 3) {
        switchToSuperAdmin();
        return 0;
      }
      
      // Reset após 2 segundos
      setTimeout(() => setSecretKeyClicks(0), 2000);
      
      return newCount;
    });
  };

  return (
    <header className="glass-card sticky top-0 z-50 border-b border-border/50">
      <div className="container mx-auto px-4">
        {/* Top bar */}
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center gap-4">
            {/* Logo */}
            <div 
              className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 glow-primary relative cursor-pointer"
              onClick={handleLogoClick}
              title="Clique 3x para Super Admin"
            >
              <HelicopterDetailedIcon className="w-7 h-7 text-primary" />
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-success border-2 border-card" />
              {secretKeyClicks > 0 && (
                <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-warning border-2 border-card text-[8px] flex items-center justify-center">
                  {secretKeyClicks}
                </div>
              )}
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
                id="react-logout-btn"
                variant="ghost"
                size="icon"
                onClick={isHiddenSuperAdmin ? switchBackToUser : logout}
                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              >
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
            
            <div className="hidden sm:flex items-center gap-2">
              {/* Indicador discreto de Super Admin */}
              {isHiddenSuperAdmin && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20">
                  <Shield className="w-4 h-4 text-purple-500" />
                  <span className="text-xs font-medium text-purple-500">SA</span>
                </div>
              )}
              
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50 border border-border/50">
                {currentUser && isSuperAdmin(currentUser) && !isHiddenSuperAdmin && (
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
        </div>

        {/* Navigation tabs */}
        <nav className="flex gap-1 pb-2 overflow-x-auto">
          {(allFinalTabs as TabItem[]).map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('Header button clicked:', tab.id, 'Current activeTab:', activeTab);
                  setActiveTab(tab.id);
                }}
                className={`
                  flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium
                  transition-all whitespace-nowrap relative
                  z-50 pointer-events-auto cursor-pointer
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

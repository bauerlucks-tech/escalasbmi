import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSwap } from '@/contexts/SwapContext';
import { useNavigate } from 'react-router-dom';
import { downloadCompleteBackup, restoreCompleteBackup, CompleteBackup } from '@/utils/backupUtils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Download, Upload, Clock, Database, Shield, Calendar, FileJson, ArrowLeft, Plus, AlertTriangle, CheckCircle, XCircle, Trash2, Package } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface StoredBackup extends CompleteBackup {
  id: string;
  createdAt: string;
}

interface BackupComparison {
  schedules: {
    current: number;
    backup: number;
    difference: number;
  };
  swapRequests: {
    current: number;
    backup: number;
    difference: number;
  };
  users: {
    current: number;
    backup: number;
    difference: number;
  };
  vacations: {
    current: number;
    backup: number;
    difference: number;
  };
}

const BackupPage: React.FC = () => {
  const { currentUser, isSuperAdmin } = useAuth();
  const { currentSchedules, swapRequests } = useSwap();
  const navigate = useNavigate();
  const [storedBackups, setStoredBackups] = useState<StoredBackup[]>([]);
  const [isRestoring, setIsRestoring] = useState(false);
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);
  const [backupComparison, setBackupComparison] = useState<BackupComparison | null>(null);
  const [isClearingSchedules, setIsClearingSchedules] = useState(false);
  const [isImportingYear, setIsImportingYear] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const yearImportInputRef = React.useRef<HTMLInputElement>(null);

  // Check if user is Super Admin
  if (!isSuperAdmin(currentUser)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-96">
          <CardHeader className="text-center">
            <Shield className="w-12 h-12 text-destructive mx-auto mb-4" />
            <CardTitle className="text-xl">Acesso Restrito</CardTitle>
            <CardDescription>
              Apenas Super Admin pode acessar esta página.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Load stored backups from localStorage
  useEffect(() => {
    const loadStoredBackups = () => {
      const stored = localStorage.getItem('system_backups');
      if (stored) {
        try {
          const backups = JSON.parse(stored);
          setStoredBackups(backups.sort((a: StoredBackup, b: StoredBackup) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          ));
        } catch (error) {
          console.error('Error loading stored backups:', error);
        }
      }
    };

    loadStoredBackups();
  }, []);

  // Auto backup at 00:00
  useEffect(() => {
    const checkAndRunAutoBackup = () => {
      const now = new Date();
      const lastBackup = localStorage.getItem('last_auto_backup');
      
      // Check if it's 00:00 and backup hasn't run today
      if (now.getHours() === 0 && now.getMinutes() === 0) {
        const today = now.toDateString();
        
        if (!lastBackup || lastBackup !== today) {
          runAutoBackup();
          localStorage.setItem('last_auto_backup', today);
        }
      }
    };

    const interval = setInterval(checkAndRunAutoBackup, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  const runAutoBackup = async () => {
    try {
      const backup = await createAutoBackup();
      if (backup) {
        toast.success('Backup automático realizado com sucesso!');
      }
    } catch (error) {
      console.error('Auto backup failed:', error);
    }
  };

  const createAutoBackup = (): Promise<StoredBackup | null> => {
    return new Promise((resolve) => {
      try {
        // Get all data from localStorage
        const storedSchedules = localStorage.getItem('schedules');
        const storedVacations = localStorage.getItem('vacations');
        const storedSwapRequests = localStorage.getItem('swapRequests');
        const storedUsers = localStorage.getItem('users');

        const schedules = storedSchedules ? JSON.parse(storedSchedules) : { current: [], archived: [] };
        const vacations = storedVacations ? JSON.parse(storedVacations) : { requests: [] };
        const swapRequestsData = storedSwapRequests ? JSON.parse(storedSwapRequests) : [];
        const usersData = storedUsers ? JSON.parse(storedUsers) : [];

        const backup: CompleteBackup = {
          version: '1.0.0',
          timestamp: new Date().toISOString(),
          data: {
            schedules: schedules,
            vacations: vacations,
            swapRequests: swapRequestsData,
            users: usersData
          }
        };

        const storedBackup: StoredBackup = {
          ...backup,
          id: `auto_${Date.now()}`,
          createdAt: new Date().toISOString()
        };

        // Store backup in localStorage
        const existingBackups = JSON.parse(localStorage.getItem('system_backups') || '[]');
        existingBackups.push(storedBackup);
        
        // Keep only last 30 backups to prevent storage overflow
        if (existingBackups.length > 30) {
          existingBackups.splice(0, existingBackups.length - 30);
        }
        
        localStorage.setItem('system_backups', JSON.stringify(existingBackups));
        setStoredBackups(existingBackups.sort((a: StoredBackup, b: StoredBackup) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ));

        resolve(storedBackup);
      } catch (error) {
        console.error('Error creating auto backup:', error);
        resolve(null);
      }
    });
  };

  const createManualBackup = (): Promise<StoredBackup | null> => {
    return new Promise((resolve) => {
      try {
        // Get all data from localStorage
        const storedSchedules = localStorage.getItem('schedules');
        const storedVacations = localStorage.getItem('vacations');
        const storedSwapRequests = localStorage.getItem('swapRequests');
        const storedUsers = localStorage.getItem('users');

        const schedules = storedSchedules ? JSON.parse(storedSchedules) : { current: [], archived: [] };
        const vacations = storedVacations ? JSON.parse(storedVacations) : { requests: [] };
        const swapRequestsData = storedSwapRequests ? JSON.parse(storedSwapRequests) : [];
        const usersData = storedUsers ? JSON.parse(storedUsers) : [];

        const backup: CompleteBackup = {
          version: '1.0.0',
          timestamp: new Date().toISOString(),
          data: {
            schedules: schedules,
            vacations: vacations,
            swapRequests: swapRequestsData,
            users: usersData
          }
        };

        const storedBackup: StoredBackup = {
          ...backup,
          id: `manual_${Date.now()}`,
          createdAt: new Date().toISOString()
        };

        // Store backup in localStorage
        const existingBackups = JSON.parse(localStorage.getItem('system_backups') || '[]');
        existingBackups.push(storedBackup);
        
        // Keep only last 30 backups to prevent storage overflow
        if (existingBackups.length > 30) {
          existingBackups.splice(0, existingBackups.length - 30);
        }
        
        localStorage.setItem('system_backups', JSON.stringify(existingBackups));
        setStoredBackups(existingBackups.sort((a: StoredBackup, b: StoredBackup) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ));

        resolve(storedBackup);
      } catch (error) {
        console.error('Error creating manual backup:', error);
        resolve(null);
      }
    });
  };

  const handleManualBackup = () => {
    downloadCompleteBackup();
  };

  const handleCreateBackupNow = async () => {
    setIsCreatingBackup(true);
    try {
      const backup = await createManualBackup();
      if (backup) {
        toast.success('Backup manual criado com sucesso e armazenado no sistema!');
      }
    } catch (error) {
      console.error('Manual backup failed:', error);
      toast.error('Erro ao criar backup manual');
    } finally {
      setIsCreatingBackup(false);
    }
  };

  const handleClearSchedules = async () => {
    setIsClearingSchedules(true);
    try {
      // Fazer backup antes de limpar
      const backup = await createManualBackup();
      
      // Limpar todas as escalas
      localStorage.setItem('escala_scheduleData', JSON.stringify([]));
      localStorage.setItem('escala_currentSchedules', JSON.stringify([]));
      localStorage.setItem('escala_archivedSchedules', JSON.stringify([]));
      
      // Limpar logs de auditoria
      localStorage.setItem('escala_auditLogs', JSON.stringify({
        logs: [],
        lastCleanup: new Date().toISOString()
      }));
      
      toast.success('Escalas limpas com sucesso! Backup criado automaticamente.');
      
      // Recarregar página após 2 segundos
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
    } catch (error) {
      console.error('Error clearing schedules:', error);
      toast.error('Erro ao limpar escalas');
    } finally {
      setIsClearingSchedules(false);
    }
  };

  const handleImportYear = async () => {
    setIsImportingYear(true);
    try {
      // Fazer backup antes de importar
      const backup = await createManualBackup();
      
      // Limpar escalas existentes
      localStorage.setItem('escala_scheduleData', JSON.stringify([]));
      localStorage.setItem('escala_currentSchedules', JSON.stringify([]));
      localStorage.setItem('escala_archivedSchedules', JSON.stringify([]));
      
      toast.info('Escalas limpas. Agora importe os arquivos CSV manualmente na ordem correta.');
      
      // Mostrar instruções
      setTimeout(() => {
        toast.success('Instruções: Importe os CSVs em ordem: Janeiro → Fevereiro → Março → ... → Dezembro');
      }, 1000);
      
      // Redirecionar para administração após 2 segundos
      setTimeout(() => {
        navigate('/?tab=admin');
      }, 2000);
      
    } catch (error) {
      console.error('Error preparing for year import:', error);
      toast.error('Erro ao preparar importação do ano');
    } finally {
      setIsImportingYear(false);
    }
  };

  const compareBackupWithCurrent = (backup: CompleteBackup): BackupComparison => {
    // Get current data
    const storedSchedules = localStorage.getItem('schedules');
    const storedVacations = localStorage.getItem('vacations');
    const storedSwapRequests = localStorage.getItem('swapRequests');
    const storedUsers = localStorage.getItem('users');

    const currentSchedules = storedSchedules ? JSON.parse(storedSchedules) : { current: [], archived: [] };
    const currentVacations = storedVacations ? JSON.parse(storedVacations) : { requests: [] };
    const currentSwapRequests = storedSwapRequests ? JSON.parse(storedSwapRequests) : [];
    const currentUsers = storedUsers ? JSON.parse(storedUsers) : [];

    // Calculate counts
    const currentScheduleCount = currentSchedules.current.length + currentSchedules.archived.length;
    const backupScheduleCount = backup.data.schedules.current.length + backup.data.schedules.archived.length;
    
    const currentSwapCount = currentSwapRequests.length;
    const backupSwapCount = backup.data.swapRequests.length;
    
    const currentUserCount = currentUsers.length;
    const backupUserCount = backup.data.users.length;
    
    const currentVacationCount = currentVacations.requests.length;
    const backupVacationCount = backup.data.vacations.requests.length;

    return {
      schedules: {
        current: currentScheduleCount,
        backup: backupScheduleCount,
        difference: currentScheduleCount - backupScheduleCount
      },
      swapRequests: {
        current: currentSwapCount,
        backup: backupSwapCount,
        difference: currentSwapCount - backupSwapCount
      },
      users: {
        current: currentUserCount,
        backup: backupUserCount,
        difference: currentUserCount - backupUserCount
      },
      vacations: {
        current: currentVacationCount,
        backup: backupVacationCount,
        difference: currentVacationCount - backupVacationCount
      }
    };
  };

  const handleRestoreBackup = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    if (!file.name.endsWith('.json')) {
      toast.error('Por favor, selecione um arquivo de backup (.json)');
      return;
    }
    
    setIsRestoring(true);
    
    try {
      // Read and parse the backup file
      const fileContent = await file.text();
      const backup: CompleteBackup = JSON.parse(fileContent);
      
      // Compare with current data
      const comparison = compareBackupWithCurrent(backup);
      setBackupComparison(comparison);
      
      // Show comparison dialog
      const shouldRestore = window.confirm(
        `Comparação de dados:\n` +
        `Escalas: ${comparison.schedules.backup} → ${comparison.schedules.current} (${comparison.schedules.difference > 0 ? '+' : ''}${comparison.schedules.difference})\n` +
        `Trocas: ${comparison.swapRequests.backup} → ${comparison.swapRequests.current} (${comparison.swapRequests.difference > 0 ? '+' : ''}${comparison.swapRequests.difference})\n` +
        `Usuários: ${comparison.users.backup} → ${comparison.users.current} (${comparison.users.difference > 0 ? '+' : ''}${comparison.users.difference})\n` +
        `Férias: ${comparison.vacations.backup} → ${comparison.vacations.current} (${comparison.vacations.difference > 0 ? '+' : ''}${comparison.vacations.difference})\n\n` +
        `Deseja continuar com a restauração?`
      );
      
      if (shouldRestore) {
        await restoreCompleteBackup(file);
        toast.success('Backup restaurado com sucesso!');
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        toast.info('Restauração cancelada');
      }
    } catch (error) {
      console.error('Restore failed:', error);
      toast.error('Erro ao processar arquivo de backup');
    } finally {
      setIsRestoring(false);
      setBackupComparison(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDownloadStoredBackup = (backup: StoredBackup) => {
    const blob = new Blob([JSON.stringify(backup, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const timestamp = new Date(backup.timestamp).toISOString().replace(/[:.]/g, '-').slice(0, 19);
    link.download = `backup_${backup.id}_${timestamp}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success('Backup baixado com sucesso!');
  };

  const handleDeleteStoredBackup = (backupId: string) => {
    const existingBackups = JSON.parse(localStorage.getItem('system_backups') || '[]');
    const filteredBackups = existingBackups.filter((b: StoredBackup) => b.id !== backupId);
    localStorage.setItem('system_backups', JSON.stringify(filteredBackups));
    setStoredBackups(filteredBackups.sort((a: StoredBackup, b: StoredBackup) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ));
    toast.success('Backup excluído com sucesso!');
  };

  const formatBackupSize = (backup: StoredBackup) => {
    const size = new Blob([JSON.stringify(backup)]).size;
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatBackupDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-destructive/20 flex items-center justify-center">
              <Database className="w-6 h-6 text-destructive" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Sistema de Backup</h1>
              <p className="text-muted-foreground">
                Gerenciamento completo de backups do sistema
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate('/')}
            className="border-primary/50 text-primary hover:bg-primary/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </div>

        {/* Manual Backup Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="w-5 h-5 text-success" />
                Download Manual
              </CardTitle>
              <CardDescription>
                Baixe um backup completo do sistema agora mesmo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={handleManualBackup}
                className="w-full bg-success hover:bg-success/90"
              >
                <Download className="w-4 h-4 mr-2" />
                Baixar Backup
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-primary" />
                Criar Backup Agora
              </CardTitle>
              <CardDescription>
                Crie um backup imediato e armazene no sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={handleCreateBackupNow}
                disabled={isCreatingBackup}
                className="w-full bg-primary hover:bg-primary/90"
              >
                <Plus className="w-4 h-4 mr-2" />
                {isCreatingBackup ? 'Criando...' : 'Criar Backup'}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-warning" />
                Restaurar Backup
              </CardTitle>
              <CardDescription>
                Restaure o sistema a partir de um arquivo de backup
              </CardDescription>
            </CardHeader>
            <CardContent>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleRestoreBackup}
                className="hidden"
                id="restore-backup"
              />
              <Button
                variant="outline"
                onClick={() => document.getElementById('restore-backup')?.click()}
                className="w-full border-warning/50 text-warning hover:bg-warning/10"
                disabled={isRestoring}
              >
                <Upload className="w-4 h-4 mr-2" />
                {isRestoring ? 'Restaurando...' : 'Restaurar Backup'}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Schedule Management Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5 text-blue-600" />
                Importar Ano Todo
              </CardTitle>
              <CardDescription>
                Importe todas as escalas de 2026 com backup automático
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={handleImportYear}
                disabled={isImportingYear}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Package className="w-4 h-4 mr-2" />
                {isImportingYear ? 'Preparando...' : 'Importar Ano Todo'}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-destructive" />
                Limpar Escalas
              </CardTitle>
              <CardDescription>
                Remove todas as escalas e cria backup automático
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={handleClearSchedules}
                disabled={isClearingSchedules}
                variant="destructive"
                className="w-full"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {isClearingSchedules ? 'Limpando...' : 'Limpar Escalas'}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-600" />
                Status das Escalas
              </CardTitle>
              <CardDescription>
                Verifique o status atual das escalas importadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Escala Atual:</span>
                  <span className="font-medium">{JSON.parse(localStorage.getItem('escala_scheduleData') || '[]').length} dias</span>
                </div>
                <div className="flex justify-between">
                  <span>Meses Importados:</span>
                  <span className="font-medium">{JSON.parse(localStorage.getItem('escala_currentSchedules') || '[]').length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Arquivadas:</span>
                  <span className="font-medium">{JSON.parse(localStorage.getItem('escala_archivedSchedules') || '[]').length}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Auto Backup Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Backup Automático
            </CardTitle>
            <CardDescription>
              O sistema realiza backup automaticamente todos os dias às 00:00
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>Próximo backup: Hoje às 00:00</span>
            </div>
          </CardContent>
        </Card>

        {/* Stored Backups */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileJson className="w-5 h-5 text-primary" />
              Backups Armazenados ({storedBackups.length})
            </CardTitle>
            <CardDescription>
              Backups automáticos armazenados no sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            {storedBackups.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Database className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum backup armazenado ainda</p>
                <p className="text-sm">O primeiro backup automático será criado às 00:00</p>
              </div>
            ) : (
              <ScrollArea className="h-96">
                <div className="space-y-3">
                  {storedBackups.map((backup) => (
                    <div key={backup.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <FileJson className="w-4 h-4 text-primary" />
                          <span className="font-medium text-sm">
                            {backup.id.startsWith('auto_') ? 'Backup Automático' : 'Backup Manual'}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground space-y-1">
                          <div>Criado: {formatBackupDate(backup.createdAt)}</div>
                          <div>Tamanho: {formatBackupSize(backup)}</div>
                          <div>Versão: {backup.version}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownloadStoredBackup(backup)}
                        >
                          <Download className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteStoredBackup(backup.id)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          ×
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BackupPage;

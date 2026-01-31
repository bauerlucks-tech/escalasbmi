import React, { useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSwap } from '@/contexts/SwapContext';
import { scheduleData as initialScheduleData, ScheduleEntry, MonthSchedule, calculateScheduleStats, UserRole } from '@/data/scheduleData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeftRight,
  Calendar,
  Users,
  Archive,
  Download,
  Upload,
  FileSpreadsheet,
  CheckCircle,
  XCircle,
  AlertTriangle,
  AlertCircle,
  Clock,
  Power,
  PowerOff,
  BarChart3,
  FileWarning,
  Plus,
  Trash2,
  UserPlus,
  Edit3,
  X,
  Save,
  Package,
  Loader2,
  Shield,
  Check,
  Key
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { validateAndParseCSV, downloadCSVTemplate, downloadScheduleCSV, CSVValidationResult } from '@/utils/csvParser';
import { downloadCompleteBackup, restoreCompleteBackup } from '@/utils/backupUtils';
import { ScrollArea } from '@/components/ui/scroll-area';

const AdminPanel: React.FC<{ setActiveTab: (tab: string) => void }> = ({ setActiveTab }) => {
  const { currentUser, users, activeUsers, operators, isAdmin, isSuperAdmin, resetPassword, updateUserRole, createUser, archiveUser } = useAuth();
  const { 
    getPendingAdminApproval, 
    getApprovedSwaps, 
    adminApproveSwap, 
    swapRequests, 
    scheduleData, 
    updateSchedule,
    updateMonthSchedule,
    importNewSchedule,
    currentSchedules,
    archivedSchedules,
    archiveCurrentSchedule,
    restoreArchivedSchedule,
    switchToSchedule,
    toggleScheduleActivation,
    refreshSchedules
  } = useSwap();
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [editingEntry, setEditingEntry] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ meioPeriodo: '', fechamento: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const backupFileInputRef = useRef<HTMLInputElement>(null);
  
  const [selectedMonth, setSelectedMonth] = useState<number>(1); // January 2026
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  
  const [hoveredSchedule, setHoveredSchedule] = useState<{month: number, year: number} | null>(null);
  
  // Import state
  const [importMonth, setImportMonth] = useState<number>(() => new Date().getMonth() + 2); // Next month
  const [importYear, setImportYear] = useState<number>(2026);
  const [importedStats, setImportedStats] = useState<{name: string; totalDays: number; weekendDays: number}[] | null>(null);
  const [csvValidation, setCsvValidation] = useState<CSVValidationResult | null>(null);
  const [isProcessingCSV, setIsProcessingCSV] = useState(false);
  const [activateOnImport, setActivateOnImport] = useState<boolean>(true); // New state for activation control
  
  // New user form
  const [showNewUserForm, setShowNewUserForm] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('operador');
  const [showArchivedUsers, setShowArchivedUsers] = useState(false);

  if (!isAdmin(currentUser)) {
    return (
      <div className="glass-card p-12 text-center animate-fade-in">
        <AlertTriangle className="w-12 h-12 text-warning mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">Acesso Restrito</h3>
        <p className="text-sm text-muted-foreground">
          Apenas administradores podem acessar este painel.
        </p>
      </div>
    );
  }

  const pendingApproval = getPendingAdminApproval();
  const approvedSwaps = getApprovedSwaps();
  const rejectedSwaps = swapRequests.filter(r => r.status === 'rejected');

  const handleBackupDownload = () => {
    downloadCompleteBackup();
  };

  const handleBackupRestore = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    if (!file.name.endsWith('.json')) {
      toast.error('Por favor, selecione um arquivo de backup (.json)');
      return;
    }
    
    restoreCompleteBackup(file)
      .then(() => {
        // Refresh the page after successful restore
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      })
      .catch((error) => {
        console.error('Restore failed:', error);
      });
    
    // Clear the input
    if (backupFileInputRef.current) {
      backupFileInputRef.current.value = '';
    }
  };

  const handleResetPassword = (userId: string) => {
    if (!newPassword || newPassword.length < 4) {
      toast.error('A senha deve ter pelo menos 4 caracteres');
      return;
    }

    resetPassword(userId, newPassword);
    toast.success('Senha alterada com sucesso!');
    setSelectedUser(null);
    setNewPassword('');
  };

  const handleApproveSwap = (requestId: string) => {
    if (!currentUser) return;
    adminApproveSwap(requestId, currentUser.name);
    toast.success('Troca aprovada com sucesso!');
  };

  const handleEditEntry = (entry: ScheduleEntry) => {
    setEditingEntry(entry.date);
    setEditForm({ meioPeriodo: entry.meioPeriodo, fechamento: entry.fechamento });
  };

  const handleSaveEntry = (date: string) => {
    const updatedSchedule = currentScheduleData.map(entry =>
      entry.date === date
        ? { ...entry, meioPeriodo: editForm.meioPeriodo.toUpperCase(), fechamento: editForm.fechamento.toUpperCase() }
        : entry
    );
    
    // Save to the specific month schedule
    const success = updateMonthSchedule(selectedMonth, selectedYear, updatedSchedule);
    
    if (success) {
      setEditingEntry(null);
      setEditForm({ meioPeriodo: '', fechamento: '' });
      toast.success('Escala atualizada com sucesso!');
    } else {
      toast.error('Erro ao atualizar escala');
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Only accept CSV files
    if (!file.name.endsWith('.csv')) {
      toast.error('Formato inválido. Use apenas arquivos .csv');
      return;
    }

    setIsProcessingCSV(true);
    setCsvValidation(null);
    setImportedStats(null);

    try {
      const content = await file.text();
      
      // Get registered employees from active users (excluding hidden ones)
      const registeredEmployees = activeUsers
        .filter(u => !u.hideFromSchedule)
        .map(u => u.name);
      
      // Validate and parse CSV
      const result = validateAndParseCSV(content, registeredEmployees, importMonth, importYear);
      
      setCsvValidation(result);
      
      if (result.isValid) {
        // Calculate stats for the imported schedule
        const stats = calculateScheduleStats(result.data);
        setImportedStats(stats);
        toast.success(`Arquivo "${file.name}" validado com sucesso!`);
      } else {
        toast.error('O arquivo contém erros. Verifique os detalhes abaixo.');
      }
      
      if (result.warnings.length > 0) {
        toast.warning(`${result.warnings.length} avisos encontrados`);
      }
    } catch (error) {
      toast.error('Erro ao processar o arquivo CSV');
      console.error('CSV processing error:', error);
    } finally {
      setIsProcessingCSV(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleConfirmImport = () => {
    if (!csvValidation || !csvValidation.isValid || csvValidation.data.length === 0) {
      toast.error('Nenhuma escala válida para importar');
      return;
    }

    if (!currentUser) return;

    // Import new schedule without replacing existing ones
    const result = importNewSchedule(importMonth, importYear, csvValidation.data, currentUser.name, activateOnImport);
    
    if (result.success) {
      const statusText = activateOnImport ? 'ativada' : 'carregada como inativa';
      toast.success(`Escala ${result.message.replace('importada com sucesso', statusText + ' com sucesso')}`);
      
      if (result.archived && result.archived.length > 0) {
        const archivedNames = result.archived.map(a => `${getMonthName(a.month)}/${a.year}`).join(', ');
        toast.info(`Escalas arquivadas automaticamente: ${archivedNames}`);
      }
    } else {
      toast.error(result.message);
    }
    
    // Reset import state
    setCsvValidation(null);
    setImportedStats(null);
  };

  const handleCancelImport = () => {
    setCsvValidation(null);
    setImportedStats(null);
  };

  const handleDownloadTemplate = () => {
    downloadCSVTemplate(importMonth, importYear);
    toast.success('Template CSV baixado!');
  };

  const handleImportYearMultiple = async () => {
    setIsProcessingCSV(true);
    
    try {
      // Função para ler CSV de um input file
      const readCSVFile = (file) => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target.result);
          reader.onerror = reject;
          reader.readAsText(file);
        });
      };
      
      // Função para processar CSV
      const parseCSV = (csvText) => {
        const lines = csvText.split('\n').filter(line => line.trim());
        const headers = lines[0].split(',');
        
        return lines.slice(1).map(line => {
          const values = line.split(',');
          return {
            data: values[0],
            posto: values[1],
            colaborador: values[2]
          };
        });
      };
      
      // Função para converter CSV para formato de escala
      const csvToSchedule = (csvData) => {
        const scheduleMap = new Map();
        
        csvData.forEach(entry => {
          if (!scheduleMap.has(entry.data)) {
            scheduleMap.set(entry.data, {
              date: entry.data,
              dayOfWeek: getDayOfWeek(entry.data),
              meioPeriodo: '',
              fechamento: ''
            });
          }
          
          const dayEntry = scheduleMap.get(entry.data);
          if (entry.posto === 'meio_periodo') {
            dayEntry.meioPeriodo = entry.colaborador;
          } else if (entry.posto === 'fechamento') {
            dayEntry.fechamento = entry.colaborador;
          }
        });
        
        return Array.from(scheduleMap.values()).sort((a, b) => {
          const dateA = new Date(a.date.split('/').reverse().join('-'));
          const dateB = new Date(b.date.split('/').reverse().join('-'));
          return dateA.getTime() - dateB.getTime();
        });
      };
      
      // Função para obter dia da semana
      const getDayOfWeek = (dateStr) => {
        const days = ['DOMINGO', 'SEGUNDA-FEIRA', 'TERÇA-FEIRA', 'QUARTA-FEIRA', 'QUINTA-FEIRA', 'SEXTA-FEIRA', 'SÁBADO'];
        const [day, month, year] = dateStr.split('/').map(Number);
        const date = new Date(year, month - 1, day);
        return days[date.getDay()];
      };
      
      // Criar input para seleção múltipla de arquivos
      const input = document.createElement('input');
      input.type = 'file';
      input.multiple = true;
      input.accept = '.csv';
      
      input.onchange = async (e) => {
        const target = e.target as HTMLInputElement;
        const files = target.files ? Array.from(target.files) : [];
        
        if (files.length === 0) {
          toast.error('Nenhum arquivo selecionado');
          setIsProcessingCSV(false);
          return;
        }
        
        toast.info(`Processando ${files.length} arquivos CSV...`);
        
        let successCount = 0;
        let errorCount = 0;
        
        for (const file of files) {
          try {
            const csvContent = await readCSVFile(file);
            const csvData = parseCSV(csvContent);
            const scheduleData = csvToSchedule(csvData);
            
            // Extrair mês e ano do nome do arquivo
            const fileName = file.name.toLowerCase();
            let month = 1;
            
            if (fileName.includes('janeiro')) month = 1;
            else if (fileName.includes('fevereiro')) month = 2;
            else if (fileName.includes('marco')) month = 3;
            else if (fileName.includes('abril')) month = 4;
            else if (fileName.includes('maio')) month = 5;
            else if (fileName.includes('junho')) month = 6;
            else if (fileName.includes('julho')) month = 7;
            else if (fileName.includes('agosto')) month = 8;
            else if (fileName.includes('setembro')) month = 9;
            else if (fileName.includes('outubro')) month = 10;
            else if (fileName.includes('novembro')) month = 11;
            else if (fileName.includes('dezembro')) month = 12;
            
            // Importar usando a função existente do sistema
            if (currentUser) {
              const result = importNewSchedule(month, 2026, scheduleData, currentUser.name, activateOnImport);
              
              if (result.success) {
                successCount++;
                console.log(`✅ ${file.name}: ${scheduleData.length} dias importados`);
              } else {
                errorCount++;
                console.error(`❌ Erro ao importar ${file.name}: ${result.message}`);
              }
            }
            
          } catch (error) {
            errorCount++;
            console.error(`❌ Erro ao importar ${file.name}:`, error);
          }
        }
        
        // Resumo final
        if (successCount > 0) {
          toast.success(`${successCount} meses importados com sucesso! ${errorCount > 0 ? `${errorCount} com erros.` : ''}`);
        } else {
          toast.error('Nenhum mês foi importado com sucesso');
        }
        
        setIsProcessingCSV(false);
      };
      
      input.click();
      
    } catch (error) {
      console.error('Error importing year:', error);
      toast.error('Erro ao importar ano: ' + error.message);
      setIsProcessingCSV(false);
    }
  };

  const handleImportYearSingle = async () => {
    setIsProcessingCSV(true);
    
    try {
      // Função para ler CSV de um input file
      const readCSVFile = (file) => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target.result);
          reader.onerror = reject;
          reader.readAsText(file);
        });
      };
      
      // Função para processar CSV
      const parseCSV = (csvText) => {
        const lines = csvText.split('\n').filter(line => line.trim());
        const headers = lines[0].split(',');
        
        return lines.slice(1).map(line => {
          const values = line.split(',');
          return {
            data: values[0],
            posto: values[1],
            colaborador: values[2]
          };
        });
      };
      
      // Função para converter CSV para formato de escala
      const csvToSchedule = (csvData) => {
        const scheduleMap = new Map();
        
        csvData.forEach(entry => {
          if (!scheduleMap.has(entry.data)) {
            scheduleMap.set(entry.data, {
              date: entry.data,
              dayOfWeek: getDayOfWeek(entry.data),
              meioPeriodo: '',
              fechamento: ''
            });
          }
          
          const dayEntry = scheduleMap.get(entry.data);
          if (entry.posto === 'meio_periodo') {
            dayEntry.meioPeriodo = entry.colaborador;
          } else if (entry.posto === 'fechamento') {
            dayEntry.fechamento = entry.colaborador;
          }
        });
        
        return Array.from(scheduleMap.values()).sort((a, b) => {
          const dateA = new Date(a.date.split('/').reverse().join('-'));
          const dateB = new Date(b.date.split('/').reverse().join('-'));
          return dateA.getTime() - dateB.getTime();
        });
      };
      
      // Função para obter dia da semana
      const getDayOfWeek = (dateStr) => {
        const days = ['DOMINGO', 'SEGUNDA-FEIRA', 'TERÇA-FEIRA', 'QUARTA-FEIRA', 'QUINTA-FEIRA', 'SEXTA-FEIRA', 'SÁBADO'];
        const [day, month, year] = dateStr.split('/').map(Number);
        const date = new Date(year, month - 1, day);
        return days[date.getDay()];
      };
      
      // Função para agrupar dados por mês
      const groupByMonth = (scheduleData) => {
        const monthlyData = {};
        
        scheduleData.forEach(entry => {
          const [day, month, year] = entry.data.split('/').map(Number);
          const monthKey = month;
          
          if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = [];
          }
          
          monthlyData[monthKey].push(entry);
        });
        
        return monthlyData;
      };
      
      // Criar input para seleção de único arquivo
      const input = document.createElement('input');
      input.type = 'file';
      input.multiple = false;
      input.accept = '.csv';
      
      input.onchange = async (e) => {
        const target = e.target as HTMLInputElement;
        const file = target.files?.[0];
        
        if (!file) {
          toast.error('Nenhum arquivo selecionado');
          setIsProcessingCSV(false);
          return;
        }
        
        try {
          toast.info(`Processando arquivo CSV do ano todo...`);
          
          const csvContent = await readCSVFile(file);
          const csvData = parseCSV(csvContent);
          const scheduleData = csvToSchedule(csvData);
          
          // Agrupar dados por mês
          const monthlyData = groupByMonth(scheduleData);
          
          let successCount = 0;
          let errorCount = 0;
          
          // Importar cada mês
          for (const [month, monthData] of Object.entries(monthlyData)) {
            try {
              // Importar usando a função existente do sistema
              if (currentUser) {
                const result = importNewSchedule(Number(month), 2026, monthData as any, currentUser.name, activateOnImport);
                
                if (result.success) {
                  successCount++;
                  console.log(`✅ Mês ${month}: ${(monthData as any).length} dias importados`);
                } else {
                  errorCount++;
                  console.error(`❌ Erro ao importar mês ${month}: ${(result as any).message}`);
                }
              }
            } catch (error) {
              errorCount++;
              console.error(`❌ Erro ao importar mês ${month}:`, error);
            }
          }
          
          // Resumo final
          if (successCount > 0) {
            toast.success(`${successCount} meses importados com sucesso! ${errorCount > 0 ? `${errorCount} com erros.` : ''}`);
          } else {
            toast.error('Nenhum mês foi importado com sucesso');
          }
          
        } catch (error) {
          console.error('Error processing single CSV:', error);
          toast.error('Erro ao processar arquivo: ' + error.message);
        }
        
        setIsProcessingCSV(false);
      };
      
      input.click();
      
    } catch (error) {
      console.error('Error importing single CSV year:', error);
      toast.error('Erro ao importar ano: ' + error.message);
      setIsProcessingCSV(false);
    }
  };

  const handleCreateUser = () => {
    if (!newUserName.trim() || !newUserPassword.trim()) {
      toast.error('Preencha todos os campos');
      return;
    }
    
    if (newUserPassword.length < 4) {
      toast.error('A senha deve ter pelo menos 4 caracteres');
      return;
    }

    const result = createUser(newUserName, newUserPassword, newUserRole);
    if (result) {
      toast.success(`Usuário ${result.name} criado com sucesso!`);
      setNewUserName('');
      setNewUserPassword('');
      setNewUserRole('operador');
      setShowNewUserForm(false);
    } else {
      toast.error('Usuário já existe');
    }
  };

  const handleArchiveUser = (userId: string, userName: string) => {
    archiveUser(userId);
    toast.success(`Usuário ${userName} arquivado`);
  };

  const handleRoleChange = (userId: string, role: UserRole) => {
    updateUserRole(userId, role);
    toast.success('Perfil atualizado com sucesso!');
  };

  const getMonthName = (month: number) => {
    const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    return months[month - 1];
  };

  const getFirstName = (name: string) => name.split(' ')[0];

  const getShiftName = (shift: 'meioPeriodo' | 'fechamento') => {
    return shift === 'meioPeriodo' ? 'Meio Período' : 'Fechamento';
  };

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  
  // Get current selected schedule data
  const currentScheduleData = currentSchedules.find(s => s.month === selectedMonth && s.year === selectedYear)?.entries || scheduleData;
  
  // Calculate calendar for selected month
  const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
  const firstDayOfMonth = new Date(selectedYear, selectedMonth - 1, 1).getDay();
  const calendarDays = Array.from({ length: firstDayOfMonth }, () => null).concat(
    Array.from({ length: daysInMonth }, (_, i) => i + 1)
  );

  const getScheduleForDay = (day: number): ScheduleEntry | undefined => {
    const dateStr = `${String(day).padStart(2, '0')}/${String(selectedMonth).padStart(2, '0')}/${selectedYear}`;
    return currentScheduleData.find(s => s.date === dateStr);
  };

  const displayUsers = showArchivedUsers 
    ? users.filter(u => u.status === 'arquivado')
    : users.filter(u => u.status === 'ativo');

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Admin Header */}
      <div className="glass-card-elevated p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center glow-primary">
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Painel Administrativo</h2>
            <p className="text-sm text-muted-foreground">
              Gerencie escalas, trocas e usuários do sistema
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="glass-card p-3 text-center">
            <div className="text-2xl font-bold text-warning">{pendingApproval.length}</div>
            <div className="text-xs text-muted-foreground">Trocas pendentes</div>
          </div>
          <div className="glass-card p-3 text-center">
            <div className="text-2xl font-bold text-success">{approvedSwaps.length}</div>
            <div className="text-xs text-muted-foreground">Trocas aprovadas</div>
          </div>
          <div className="glass-card p-3 text-center">
            <div className="text-2xl font-bold text-muted-foreground">{activeUsers.length}</div>
            <div className="text-xs text-muted-foreground">Usuários ativos</div>
          </div>
        </div>

        {/* Backup Section - Only for Super Admin */}
        {isSuperAdmin(currentUser) && currentUser.name !== 'RICARDO' && (
          <div className="mt-4 p-4 border border-border/50 rounded-xl bg-background/50">
            <h3 className="font-semibold flex items-center gap-2 mb-3">
              <Download className="w-4 h-4 text-primary" />
              Backup Completo do Sistema
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Faça backup completo de todas as escalas, férias, trocas e usuários. Use para restaurar ou migrar dados.
            </p>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleBackupDownload}
                className="border-primary/50 text-primary hover:bg-primary/10"
              >
                <Download className="w-4 h-4 mr-2" />
                Baixar Backup Completo
              </Button>
              <div className="flex items-center gap-2">
                <input
                  ref={backupFileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleBackupRestore}
                  className="hidden"
                  id="backup-upload"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById('backup-upload')?.click()}
                  className="border-warning/50 text-warning hover:bg-warning/10"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Restaurar Backup
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="swaps" className="space-y-4">
        <TabsList className={`grid ${isSuperAdmin(currentUser) && currentUser.name !== 'RICARDO' ? 'grid-cols-6' : 'grid-cols-5'} w-full`}>
          <TabsTrigger value="swaps" className="flex items-center gap-2">
            <ArrowLeftRight className="w-4 h-4" />
            Trocas
            {pendingApproval.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-warning text-warning-foreground">
                {pendingApproval.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="schedule" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Escala
          </TabsTrigger>
          <TabsTrigger value="months" className="flex items-center gap-2">
            <Archive className="w-4 h-4" />
            Meses
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Usuários
          </TabsTrigger>
          {isSuperAdmin(currentUser) && currentUser.name !== 'RICARDO' && (
            <TabsTrigger value="csv-import" className="flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4" />
              Importar CSV
            </TabsTrigger>
          )}
        </TabsList>

        {/* Swaps Tab */}
        <TabsContent value="swaps" className="space-y-4">
          {/* Pending Admin Approval */}
          <div className="glass-card overflow-hidden">
            <div className="p-4 border-b border-border/50 flex items-center justify-between">
              <h3 className="font-semibold flex items-center gap-2">
                <Clock className="w-4 h-4 text-warning" />
                Aguardando Aprovação
              </h3>
              <span className="text-xs text-muted-foreground">
                Trocas aceitas pelos colegas
              </span>
            </div>

            {pendingApproval.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <CheckCircle className="w-10 h-10 mx-auto mb-3 opacity-50" />
                <p>Nenhuma troca pendente de aprovação</p>
              </div>
            ) : (
              <div className="divide-y divide-border/30">
                {pendingApproval.map(request => (
                  <div key={request.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-sm mb-2">
                          {request.requesterName} ⇄ {request.targetName}
                        </div>
                        
                        {/* Seção DE (origem) */}
                        <div className="bg-muted/30 rounded p-2 mb-2">
                          <div className="text-xs font-medium text-primary mb-1">📍 DE (Origem):</div>
                          <div className="text-xs space-y-0.5">
                            <div><span className="font-medium">Data:</span> {request.originalDate}</div>
                            <div><span className="font-medium">Turno:</span> {getShiftName(request.originalShift)}</div>
                            <div><span className="font-medium">Operador:</span> {request.requesterName}</div>
                          </div>
                        </div>
                        
                        {/* Seção PARA (destino) */}
                        <div className="bg-muted/30 rounded p-2 mb-2">
                          <div className="text-xs font-medium text-secondary mb-1">🎯 PARA (Destino):</div>
                          <div className="text-xs space-y-0.5">
                            <div><span className="font-medium">Data:</span> {request.targetDate}</div>
                            <div><span className="font-medium">Turno:</span> {getShiftName(request.targetShift)}</div>
                            <div><span className="font-medium">Operador:</span> {request.targetName}</div>
                          </div>
                        </div>
                        
                        <div className="text-xs text-success mt-1">
                          ✓ Aceito pelo colega
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleApproveSwap(request.id)}
                        className="bg-success hover:bg-success/90 ml-4"
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Aprovar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* History */}
          <div className="glass-card overflow-hidden">
            <div className="p-4 border-b border-border/50">
              <h3 className="font-semibold flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-success" />
                Histórico de Trocas
              </h3>
            </div>

            <div className="divide-y divide-border/30 max-h-[600px] overflow-y-auto">
              {approvedSwaps.length === 0 && rejectedSwaps.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground text-sm">
                  Nenhuma troca no histórico
                </div>
              ) : (
                <>
                  {approvedSwaps.map(request => (
                    <div key={request.id} className="p-4 flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-sm mb-2">
                          {request.requesterName} ⇄ {request.targetName}
                        </div>
                        
                        {/* Seção DE (origem) */}
                        <div className="bg-muted/30 rounded p-2 mb-2">
                          <div className="text-xs font-medium text-primary mb-1">📍 DE (Origem):</div>
                          <div className="text-xs space-y-0.5">
                            <div><span className="font-medium">Data:</span> {request.originalDate}</div>
                            <div><span className="font-medium">Turno:</span> {getShiftName(request.originalShift)}</div>
                            <div><span className="font-medium">Operador:</span> {request.requesterName}</div>
                          </div>
                        </div>
                        
                        {/* Seção PARA (destino) */}
                        <div className="bg-muted/30 rounded p-2 mb-2">
                          <div className="text-xs font-medium text-secondary mb-1">🎯 PARA (Destino):</div>
                          <div className="text-xs space-y-0.5">
                            <div><span className="font-medium">Data:</span> {request.targetDate}</div>
                            <div><span className="font-medium">Turno:</span> {getShiftName(request.targetShift)}</div>
                            <div><span className="font-medium">Operador:</span> {request.targetName}</div>
                          </div>
                        </div>
                        
                        {/* Seção de registro */}
                        <div className="text-xs text-muted-foreground space-y-0.5 border-t pt-2">
                          <div><span className="font-medium">Solicitado:</span> {new Date(request.createdAt).toLocaleString('pt-BR')}</div>
                          {request.respondedAt && (
                            <div><span className="font-medium">Respondido:</span> {new Date(request.respondedAt).toLocaleString('pt-BR')} por {request.respondedBy}</div>
                          )}
                          {request.adminApprovedAt && (
                            <div><span className="font-medium">Aprovado:</span> {new Date(request.adminApprovedAt).toLocaleString('pt-BR')} por {request.adminApprovedBy}</div>
                          )}
                        </div>
                      </div>
                      <span className="badge-accepted ml-4 mt-1">Aprovada</span>
                    </div>
                  ))}
                  {rejectedSwaps.map(request => (
                    <div key={request.id} className="p-4 flex items-start justify-between opacity-60">
                      <div className="flex-1">
                        <div className="font-medium text-sm mb-2">
                          {request.requesterName} ⇄ {request.targetName}
                        </div>
                        
                        {/* Seção DE (origem) */}
                        <div className="bg-muted/20 rounded p-2 mb-2">
                          <div className="text-xs font-medium text-muted-foreground mb-1">📍 DE (Origem):</div>
                          <div className="text-xs space-y-0.5">
                            <div><span className="font-medium">Data:</span> {request.originalDate}</div>
                            <div><span className="font-medium">Turno:</span> {getShiftName(request.originalShift)}</div>
                            <div><span className="font-medium">Operador:</span> {request.requesterName}</div>
                          </div>
                        </div>
                        
                        {/* Seção PARA (destino) */}
                        <div className="bg-muted/20 rounded p-2 mb-2">
                          <div className="text-xs font-medium text-muted-foreground mb-1">🎯 PARA (Destino):</div>
                          <div className="text-xs space-y-0.5">
                            <div><span className="font-medium">Data:</span> {request.targetDate}</div>
                            <div><span className="font-medium">Turno:</span> {getShiftName(request.targetShift)}</div>
                            <div><span className="font-medium">Operador:</span> {request.targetName}</div>
                          </div>
                        </div>
                        
                        {/* Seção de registro */}
                        <div className="text-xs text-muted-foreground space-y-0.5 border-t pt-2">
                          <div><span className="font-medium">Solicitado:</span> {new Date(request.createdAt).toLocaleString('pt-BR')}</div>
                          {request.respondedAt && (
                            <div><span className="font-medium">Respondido:</span> {new Date(request.respondedAt).toLocaleString('pt-BR')} por {request.respondedBy}</div>
                          )}
                        </div>
                      </div>
                      <span className="badge-rejected ml-4 mt-1">Recusada</span>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Schedule Tab */}
        <TabsContent value="schedule" className="space-y-4">
          {/* Import Section */}
          <div className="glass-card p-4">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4 text-primary" />
                    Importar Escala via CSV
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Adicione um novo mês à escala. Escalas com mais de 3 meses de antiguidade são arquivadas automaticamente.
                  </p>
                </div>
              </div>

              {/* Import System Disabled Notice */}
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600" />
                  <span className="font-medium text-yellow-800">Sistema de Importação CSV Desativado</span>
                </div>
                <p className="text-sm text-yellow-700 mb-3">
                  O sistema de importação por CSV está temporariamente desativado para manutenção.
                </p>
                <div className="text-xs text-yellow-600 space-y-1">
                  <p><strong>Alternativa:</strong> Use o script <code>inserir-escalas-csv.js</code></p>
                  <p><strong>Como usar:</strong></p>
                  <ol className="list-decimal list-inside ml-2 space-y-1">
                    <li>Faça login como administrador</li>
                    <li>Abra o console do navegador (F12)</li>
                    <li>Cole e execute o conteúdo do script</li>
                    <li>Execute <code>inserirEscalasDoCSV()</code></li>
                  </ol>
                </div>
              </div>

              {/* Hidden Import Options (commented out) */}
              {/* 
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-muted/30 rounded-lg p-3 text-xs">
                  <p className="font-medium mb-1">Importação Individual</p>
                  <p className="text-muted-foreground mb-2">
                    Importe um mês específico de escala
                  </p>
                  <code className="bg-background/50 px-2 py-1 rounded block">
                    data, posto, colaborador
                  </code>
                  <p className="text-muted-foreground mt-2">
                    <strong>posto:</strong> meio_periodo ou fechamento
                  </p>
                </div>
                
                <div className="bg-primary/10 rounded-lg p-3 text-xs border border-primary/20">
                  <p className="font-medium mb-1 text-primary">Importação Completa</p>
                  <p className="text-muted-foreground mb-2">
                    Importe o ano todo de uma vez
                  </p>
                  <p className="text-muted-foreground">
                    <strong>Opção 1:</strong> 12 CSVs (um por mês)
                  </p>
                  <p className="text-muted-foreground">
                    <strong>Opção 2:</strong> 1 CSV (ano todo)
                  </p>
                  <p className="text-muted-foreground">
                    <strong>Vantagens:</strong> Mais rápido, sem erros
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Mês da Escala</label>
                  <Select value={String(importMonth)} onValueChange={(v) => setImportMonth(Number(v))}>
                    <SelectTrigger className="bg-muted/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => (
                        <SelectItem key={m} value={String(m)}>{getMonthName(m)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Ano</label>
                  <Select value={String(importYear)} onValueChange={(v) => setImportYear(Number(v))}>
                    <SelectTrigger className="bg-muted/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2025">2025</SelectItem>
                      <SelectItem value="2026">2026</SelectItem>
                      <SelectItem value="2027">2027</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button
                    variant="outline"
                    onClick={handleDownloadTemplate}
                    className="w-full"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Baixar Template
                  </Button>
                </div>
                <div className="flex items-end">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full bg-primary hover:bg-primary/90"
                    disabled={isProcessingCSV}
                  >
                    {isProcessingCSV ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4 mr-2" />
                    )}
                    Importar CSV
                  </Button>
                </div>
                <div className="flex items-end">
                  <Button
                    onClick={handleImportYearMultiple}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    disabled={isProcessingCSV}
                  >
                    {isProcessingCSV ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Package className="w-4 h-4 mr-2" />
                    )}
                    12 CSVs
                  </Button>
                </div>
                <div className="flex items-end">
                  <Button
                    onClick={handleImportYearSingle}
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                    disabled={isProcessingCSV}
                  >
                    {isProcessingCSV ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <FileSpreadsheet className="w-4 h-4 mr-2" />
                    )}
                    1 CSV Ano Todo
                  </Button>
                </div>
              </div>

              {/* Activation Option */}
              <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                <input
                  type="checkbox"
                  id="activateOnImport"
                  checked={activateOnImport}
                  onChange={(e) => setActivateOnImport(e.target.checked)}
                  className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary focus:ring-2"
                />
                <label htmlFor="activateOnImport" className="text-sm cursor-pointer">
                  <span className="font-medium">Ativar escala imediatamente após importação</span>
                  <span className="text-muted-foreground block text-xs">
                    {activateOnImport 
                      ? "A escala ficará visível e disponível para todos os usuários após a importação."
                      : "A escala será carregada no sistema mas permanecerá inativa até ser ativada manualmente."
                    }
                  </span>
                </label>
              </div>

              {/* CSV Validation Results */}
              {csvValidation && (
                <div className={`glass-card p-4 ${csvValidation.isValid ? 'bg-success/10 border-success/30' : 'bg-destructive/10 border-destructive/30'} border`}>
                  <div className="flex items-center gap-2 mb-3">
                    {csvValidation.isValid ? (
                      <CheckCircle className="w-5 h-5 text-success" />
                    ) : (
                      <FileWarning className="w-5 h-5 text-destructive" />
                    )}
                    <h4 className="font-medium">
                      {csvValidation.isValid ? 'Validação concluída com sucesso' : 'Erros encontrados na validação'}
                    </h4>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-4 gap-2 mb-3">
                    <div className="bg-background/50 rounded p-2 text-center">
                      <div className="text-lg font-bold">{csvValidation.stats.totalRows}</div>
                      <div className="text-xs text-muted-foreground">Linhas</div>
                    </div>
                    <div className="bg-background/50 rounded p-2 text-center">
                      <div className="text-lg font-bold text-success">{csvValidation.stats.validRows}</div>
                      <div className="text-xs text-muted-foreground">Válidas</div>
                    </div>
                    <div className="bg-background/50 rounded p-2 text-center">
                      <div className="text-lg font-bold text-destructive">{csvValidation.stats.invalidRows}</div>
                      <div className="text-xs text-muted-foreground">Inválidas</div>
                    </div>
                    <div className="bg-background/50 rounded p-2 text-center">
                      <div className="text-lg font-bold text-primary">{csvValidation.data.length}</div>
                      <div className="text-xs text-muted-foreground">Dias</div>
                    </div>
                  </div>

                  {/* Errors */}
                  {csvValidation.errors.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs font-medium text-destructive mb-1">Erros ({csvValidation.errors.length}):</p>
                      <ScrollArea className="h-[100px] rounded bg-background/50 p-2">
                        {csvValidation.errors.map((error, i) => (
                          <div key={i} className="text-xs text-destructive flex items-start gap-1 mb-1">
                            <XCircle className="w-3 h-3 mt-0.5 shrink-0" />
                            {error}
                          </div>
                        ))}
                      </ScrollArea>
                    </div>
                  )}

                  {/* Unknown Employees */}
                  {csvValidation.stats.unknownEmployees.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs font-medium text-warning mb-1">Colaboradores não cadastrados:</p>
                      <div className="flex flex-wrap gap-1">
                        {csvValidation.stats.unknownEmployees.map(name => (
                          <span key={name} className="px-2 py-0.5 bg-warning/20 text-warning rounded text-xs">
                            {name}
                          </span>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Cadastre estes colaboradores na aba "Usuários" antes de importar.
                      </p>
                    </div>
                  )}

                  {/* Warnings */}
                  {csvValidation.warnings.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs font-medium text-warning mb-1">Avisos ({csvValidation.warnings.length}):</p>
                      <ScrollArea className="h-[60px] rounded bg-background/50 p-2">
                        {csvValidation.warnings.map((warning, i) => (
                          <div key={i} className="text-xs text-warning flex items-start gap-1 mb-1">
                            <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0" />
                            {warning}
                          </div>
                        ))}
                      </ScrollArea>
                    </div>
                  )}
                </div>
              )}

              {/* Import Stats Preview */}
              {importedStats && csvValidation?.isValid && (
                <div className="glass-card p-4 bg-muted/20">
                  <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-primary" />
                    Estatísticas da Nova Escala - {getMonthName(importMonth)}/{importYear}
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {importedStats.map(stat => (
                      <div key={stat.name} className="bg-background/50 rounded-lg p-3">
                        <div className="font-medium text-sm">{stat.name}</div>
                        <div className="flex gap-3 mt-1">
                          <span className="text-xs">
                            <span className="text-primary font-bold">{stat.totalDays}</span> dias
                          </span>
                          <span className="text-xs">
                            <span className="text-warning font-bold">{stat.weekendDays}</span> fim de semana
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button size="sm" className="bg-success hover:bg-success/90" onClick={handleConfirmImport}>
                      <Check className="w-4 h-4 mr-1" />
                      Confirmar Importação
                    </Button>
                    <Button size="sm" variant="ghost" onClick={handleCancelImport}>
                      Cancelar
                    </Button>
                  </div>
                  <div className="text-xs text-muted-foreground mt-2 space-y-1">
                    <p className="flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      Um novo mês será adicionado ao sistema!
                    </p>
                    <p className="flex items-center gap-1">
                      {activateOnImport ? (
                        <>
                          <Power className="w-3 h-3 text-success" />
                          <span className="text-success">A escala será <strong>ativada</strong> e ficará visível para todos os usuários.</span>
                        </>
                      ) : (
                        <>
                          <PowerOff className="w-3 h-3 text-warning" />
                          <span className="text-warning">A escala será <strong>carregada como inativa</strong> e poderá ser ativada posteriormente.</span>
                        </>
                      )}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Calendar Edit View */}
          <div className="glass-card-elevated overflow-hidden">
            <div className="p-4 border-b border-border/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  {getMonthName(selectedMonth)} {selectedYear} - Editar Escala
                </h3>
                <Select
                  value={`${selectedMonth}/${selectedYear}`}
                  onValueChange={(value) => {
                    const [month, year] = value.split('/').map(Number);
                    setSelectedMonth(month);
                    setSelectedYear(year);
                  }}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {currentSchedules.map(schedule => (
                      <SelectItem key={`${schedule.month}/${schedule.year}`} value={`${schedule.month}/${schedule.year}`}>
                        {getMonthName(schedule.month)}/{schedule.year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    downloadScheduleCSV(currentScheduleData);
                    toast.success('Escala baixada com sucesso!');
                  }}
                  className="border-primary/50 text-primary hover:bg-primary/10"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Baixar Escala
                </Button>
                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-meioPeriodo" />
                    <span className="text-muted-foreground">Meio Período</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-fechamento" />
                    <span className="text-muted-foreground">Fechamento</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4">
              {/* Week days header */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {weekDays.map(day => (
                  <div 
                    key={day} 
                    className={`
                      text-center text-xs font-medium py-2
                      ${day === 'Dom' || day === 'Sáb' ? 'text-primary' : 'text-muted-foreground'}
                    `}
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, index) => {
                  if (day === null) {
                    return <div key={`empty-${index}`} className="min-h-[90px]" />;
                  }

                  const entry = getScheduleForDay(day);
                  const isEditing = editingEntry === entry?.date;

                  return (
                    <div
                      key={day}
                      className={`
                        min-h-[90px] rounded-lg p-1.5 flex flex-col
                        transition-all relative group
                        ${isEditing 
                          ? 'bg-primary/20 ring-2 ring-primary' 
                          : 'bg-muted/30 border border-border/30 hover:border-primary/50'
                        }
                      `}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-muted-foreground">{day}</span>
                        {entry && !isEditing && (
                          <button
                            onClick={() => handleEditEntry(entry)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:bg-primary/20 rounded"
                          >
                            <Edit3 className="w-3 h-3 text-primary" />
                          </button>
                        )}
                      </div>
                      
                      {entry && (
                        isEditing ? (
                          <div className="flex flex-col gap-1 flex-1">
                            <Select
                              value={editForm.meioPeriodo}
                              onValueChange={(v) => setEditForm(f => ({ ...f, meioPeriodo: v }))}
                            >
                              <SelectTrigger className="h-6 text-[10px] bg-meioPeriodo/20 px-1">
                                <SelectValue placeholder="MP" />
                              </SelectTrigger>
                              <SelectContent>
                                {operators.map(op => (
                                  <SelectItem key={op.id} value={op.name} className="text-xs">
                                    {op.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Select
                              value={editForm.fechamento}
                              onValueChange={(v) => setEditForm(f => ({ ...f, fechamento: v }))}
                            >
                              <SelectTrigger className="h-6 text-[10px] bg-fechamento/20 px-1">
                                <SelectValue placeholder="FE" />
                              </SelectTrigger>
                              <SelectContent>
                                {operators.map(op => (
                                  <SelectItem key={op.id} value={op.name} className="text-xs">
                                    {op.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <div className="flex gap-1 mt-auto">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-5 w-5 p-0"
                                onClick={() => handleSaveEntry(entry.date)}
                              >
                                <Check className="w-3 h-3 text-success" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-5 w-5 p-0"
                                onClick={() => setEditingEntry(null)}
                              >
                                <X className="w-3 h-3 text-destructive" />
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-0.5 flex-1">
                            <div className="text-[10px] px-1 py-0.5 rounded truncate bg-meioPeriodo/20 text-meioPeriodo">
                              {getFirstName(entry.meioPeriodo)}
                            </div>
                            <div className="text-[10px] px-1 py-0.5 rounded truncate bg-fechamento/20 text-fechamento">
                              {getFirstName(entry.fechamento)}
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Months Tab */}
        <TabsContent value="months" className="space-y-4">
          {/* Current Schedules */}
          <div className="glass-card overflow-hidden">
            <div className="p-4 border-b border-border/50">
              <h3 className="font-semibold flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
                Escalas Atuais
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Escalas ativas no sistema (máximo 3 meses)
              </p>
            </div>

            {currentSchedules.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <Calendar className="w-10 h-10 mx-auto mb-3 opacity-50" />
                <p>Nenhuma escala encontrada</p>
              </div>
            ) : (
              <div className="divide-y divide-border/30">
                {currentSchedules.map(schedule => (
                  <div key={`${schedule.month}-${schedule.year}`} className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">
                          {getMonthName(schedule.month)}/{schedule.year}
                          {schedule.isActive === false && (
                            <span className="ml-2 px-2 py-1 text-xs bg-warning/20 text-warning rounded-full">
                              Inativa
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {schedule.entries.length} dias • 
                          Importado: {schedule.importedBy} • 
                          {schedule.importedAt && new Date(schedule.importedAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            switchToSchedule(schedule.month, schedule.year);
                            // Atualizar o mês/ano selecionado no AdminPanel para corresponder
                            setSelectedMonth(schedule.month);
                            setSelectedYear(schedule.year);
                            toast.success(`Visualizando escala de ${getMonthName(schedule.month)}/${schedule.year}`);
                            // Mudar para a aba de escala para mostrar o calendário
                            setActiveTab('schedule');
                          }}
                          onMouseEnter={() => setHoveredSchedule({month: schedule.month, year: schedule.year})}
                          onMouseLeave={() => setHoveredSchedule(null)}
                          className="border-primary/50 text-primary hover:bg-primary/10 relative"
                        >
                          <Calendar className="w-4 h-4 mr-1" />
                          Visualizar
                          {hoveredSchedule?.month === schedule.month && hoveredSchedule?.year === schedule.year && (
                            <div className="absolute top-full mt-2 right-0 z-50 glass-card-elevated p-4 min-w-[280px] max-w-[90vw] animate-scale-in">
                              <div className="text-sm font-medium mb-2">
                                {getMonthName(schedule.month)}/{schedule.year}
                              </div>
                              <div className="grid grid-cols-7 gap-1 text-xs">
                                {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map(day => (
                                  <div key={day} className="text-center font-medium text-muted-foreground py-1">
                                    {day}
                                  </div>
                                ))}
                                {(() => {
                                  const monthSchedule = currentSchedules.find(s => s.month === schedule.month && s.year === schedule.year);
                                  const entries = monthSchedule?.entries || [];
                                  const daysInMonth = new Date(schedule.year, schedule.month, 0).getDate();
                                  const firstDay = new Date(schedule.year, schedule.month - 1, 1).getDay();
                                  const calendarDays = Array.from({ length: firstDay }, () => null).concat(
                                    Array.from({ length: daysInMonth }, (_, i) => i + 1)
                                  );
                                  
                                  return calendarDays.map((day, index) => {
                                    if (day === null) {
                                      return <div key={`empty-${index}`} className="min-h-[20px]" />;
                                    }
                                    
                                    const dateStr = `${String(day).padStart(2, '0')}/${String(schedule.month).padStart(2, '0')}/${schedule.year}`;
                                    const entry = entries.find(e => e.date === dateStr);
                                    
                                    return (
                                      <div
                                        key={day}
                                        className={`
                                          min-h-[20px] rounded p-1 text-center
                                          ${entry ? 'bg-primary/20 text-primary' : 'text-muted-foreground'}
                                        `}
                                      >
                                        {day}
                                      </div>
                                    );
                                  });
                                })()}
                              </div>
                            </div>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant={schedule.isActive === false ? "default" : "outline"}
                          onClick={() => {
                            if (toggleScheduleActivation(schedule.month, schedule.year)) {
                              const newStatus = schedule.isActive === false ? "ativada" : "desativada";
                              toast.success(`Escala de ${getMonthName(schedule.month)}/${schedule.year} ${newStatus}`);
                            }
                          }}
                          className={schedule.isActive === false ? "bg-success hover:bg-success/90" : "border-warning/50 text-warning hover:bg-warning/10"}
                        >
                          {schedule.isActive === false ? (
                            <><Power className="w-4 h-4 mr-1" />Ativar</>
                          ) : (
                            <><PowerOff className="w-4 h-4 mr-1" />Desativar</>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            if (currentUser && archiveCurrentSchedule(schedule.month, schedule.year, currentUser.name)) {
                              toast.success(`Escala de ${getMonthName(schedule.month)}/${schedule.year} arquivada`);
                            }
                          }}
                          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        >
                          <Archive className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Archived Schedules */}
          <div className="glass-card overflow-hidden">
            <div className="p-4 border-b border-border/50">
              <h3 className="font-semibold flex items-center gap-2">
                <Archive className="w-4 h-4 text-muted-foreground" />
                Escalas Arquivadas
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Escalas antigas que podem ser restauradas
              </p>
            </div>

            {archivedSchedules.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <Archive className="w-10 h-10 mx-auto mb-3 opacity-50" />
                <p>Nenhuma escala arquivada</p>
              </div>
            ) : (
              <div className="divide-y divide-border/30">
                {archivedSchedules.map(schedule => (
                  <div key={`${schedule.month}-${schedule.year}`} className="p-4 opacity-75">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">
                          {getMonthName(schedule.month)}/{schedule.year}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {schedule.entries.length} dias • 
                          Arquivado: {schedule.archivedBy} • 
                          {new Date(schedule.archivedAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            if (restoreArchivedSchedule(schedule.month, schedule.year)) {
                              toast.success(`Escala de ${getMonthName(schedule.month)}/${schedule.year} restaurada`);
                            }
                          }}
                          className="border-success/50 text-success hover:bg-success/10"
                        >
                          <Archive className="w-4 h-4 mr-1" />
                          Restaurar
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-4">
          {/* New User Button */}
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Button
                variant={showArchivedUsers ? "outline" : "default"}
                size="sm"
                onClick={() => setShowArchivedUsers(false)}
              >
                <Users className="w-4 h-4 mr-1" />
                Ativos ({users.filter(u => u.status === 'ativo').length})
              </Button>
              <Button
                variant={showArchivedUsers ? "default" : "outline"}
                size="sm"
                onClick={() => setShowArchivedUsers(true)}
              >
                <Archive className="w-4 h-4 mr-1" />
                Arquivados ({users.filter(u => u.status === 'arquivado').length})
              </Button>
            </div>
            <Button
              size="sm"
              onClick={() => setShowNewUserForm(!showNewUserForm)}
              className="bg-success hover:bg-success/90"
              disabled={!isSuperAdmin(currentUser) || currentUser.name === 'RICARDO'}
            >
              <UserPlus className="w-4 h-4 mr-1" />
              Novo Usuário
            </Button>
          </div>

          {/* New User Form */}
          {showNewUserForm && (
            <div className="glass-card p-4">
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-success" />
                Cadastrar Novo Usuário
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <Input
                  placeholder="Nome"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="bg-muted/50"
                />
                <Input
                  type="password"
                  placeholder="Senha"
                  value={newUserPassword}
                  onChange={(e) => setNewUserPassword(e.target.value)}
                  className="bg-muted/50"
                />
                <Select value={newUserRole} onValueChange={(v: UserRole) => setNewUserRole(v)}>
                  <SelectTrigger className="bg-muted/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="operador">Operador</SelectItem>
                    <SelectItem value="administrador">Administrador</SelectItem>
                    {isSuperAdmin(currentUser) && currentUser.name !== 'RICARDO' && <SelectItem value="super_admin">Super Admin</SelectItem>}
                  </SelectContent>
                </Select>
                <div className="flex gap-2">
                  <Button onClick={handleCreateUser} className="flex-1 bg-success hover:bg-success/90">
                    <Check className="w-4 h-4 mr-1" />
                    Criar
                  </Button>
                  <Button variant="ghost" onClick={() => setShowNewUserForm(false)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Users List */}
          <div className="glass-card overflow-hidden">
            <div className="p-4 border-b border-border/50">
              <h3 className="font-semibold flex items-center gap-2">
                {showArchivedUsers ? (
                  <>
                    <Archive className="w-4 h-4 text-muted-foreground" />
                    Usuários Arquivados
                  </>
                ) : (
                  <>
                    <Users className="w-4 h-4 text-primary" />
                    Gerenciar Usuários
                  </>
                )}
              </h3>
            </div>

            {displayUsers.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <Users className="w-10 h-10 mx-auto mb-3 opacity-50" />
                <p>{showArchivedUsers ? 'Nenhum usuário arquivado' : 'Nenhum usuário ativo'}</p>
              </div>
            ) : (
              <div className="divide-y divide-border/30">
                {displayUsers.map(user => (
                  <div key={user.id} className="p-4">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div className="flex items-center gap-3">
                        <div className={`
                          w-10 h-10 rounded-full flex items-center justify-center
                          ${user.role === 'super_admin' ? 'bg-destructive/20' : user.role === 'administrador' ? 'bg-primary/20' : 'bg-muted/50'}
                        `}>
                          {user.role === 'super_admin' ? (
                            <Shield className="w-5 h-5 text-destructive" />
                          ) : user.role === 'administrador' ? (
                            <Shield className="w-5 h-5 text-primary" />
                          ) : (
                            <UserPlus className="w-5 h-5 text-muted-foreground" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-xs text-muted-foreground flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded-full ${
                              user.role === 'super_admin' 
                                ? 'bg-destructive/20 text-destructive' 
                                : user.role === 'administrador' 
                                ? 'bg-primary/20 text-primary' 
                                : 'bg-meioPeriodo/20 text-meioPeriodo'
                            }`}>
                              {user.role === 'super_admin' ? 'Super Admin' : user.role === 'administrador' ? 'Administrador' : 'Operador'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Role Selector */}
                        {!showArchivedUsers && (
                          <Select 
                            value={user.role} 
                            onValueChange={(v: UserRole) => handleRoleChange(user.id, v)}
                          >
                            <SelectTrigger className="w-[140px] h-9 text-sm bg-muted/50">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="operador">Operador</SelectItem>
                              <SelectItem value="administrador">Administrador</SelectItem>
                              {isSuperAdmin(currentUser) && currentUser.name !== 'RICARDO' && <SelectItem value="super_admin">Super Admin</SelectItem>}
                            </SelectContent>
                          </Select>
                        )}

                        {/* Password Reset */}
                        {selectedUser === user.id ? (
                          <div className="flex items-center gap-2">
                            <Input
                              type="password"
                              placeholder="Nova senha"
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              className="w-28 h-9 text-sm bg-muted/50"
                            />
                            <Button
                              size="sm"
                              onClick={() => handleResetPassword(user.id)}
                              className="bg-success hover:bg-success/90"
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setSelectedUser(null);
                                setNewPassword('');
                              }}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedUser(user.id)}
                            className="border-primary/50 text-primary hover:bg-primary/10"
                          >
                            <Key className="w-4 h-4 mr-1" />
                            Senha
                          </Button>
                        )}

                        {/* Archive Button */}
                        {!showArchivedUsers && user.id !== currentUser?.id && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleArchiveUser(user.id, user.name)}
                            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          >
                            <Archive className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* System Info */}
          <div className="glass-card p-4">
            <div className="grid grid-cols-4 gap-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Total:</span>
                <span className="font-mono font-bold">{users.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Operadores:</span>
                <span className="font-mono font-bold text-meioPeriodo">
                  {users.filter(u => u.role === 'operador' && u.status === 'ativo').length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Admins:</span>
                <span className="font-mono font-bold text-primary">
                  {users.filter(u => u.role === 'administrador' && u.status === 'ativo').length}
                </span>
              </div>
              {isSuperAdmin(currentUser) && currentUser.name !== 'RICARDO' && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Super Admin:</span>
                  <span className="font-mono font-bold text-destructive">
                    {users.filter(u => u.role === 'super_admin' && u.status === 'ativo').length}
                  </span>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* CSV Import Tab */}
        {isSuperAdmin(currentUser) && currentUser.name !== 'RICARDO' && (
          <TabsContent value="csv-import" className="space-y-4">
            <div className="glass-card p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4 text-primary" />
                    Importação de Escalas via CSV
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Sistema avançado de importação com preview e correção de erros
                  </p>
                </div>
                <Button
                  onClick={() => window.location.href = '/csv-import'}
                  className="bg-primary hover:bg-primary/90"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Abrir Sistema de Importação
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-muted/30 rounded-lg p-3 text-xs">
                  <p className="font-medium mb-1 text-primary">📋 Formato do Arquivo</p>
                  <p className="text-muted-foreground mb-2">
                    O CSV deve seguir o formato padrão:
                  </p>
                  <code className="bg-background/50 px-2 py-1 rounded block">
                    data,posto,colaborador
                  </code>
                  <p className="text-muted-foreground mt-2">
                    <strong>Exemplo:</strong> 01/01/2026,meio_periodo,CARLOS
                  </p>
                </div>
                
                <div className="bg-primary/10 rounded-lg p-3 text-xs border border-primary/20">
                  <p className="font-medium mb-1 text-primary">🔧 Recursos Avançados</p>
                  <p className="text-muted-foreground mb-2">
                    Sistema completo de validação:
                  </p>
                  <ul className="text-muted-foreground space-y-1">
                    <li>• Validação automática de datas</li>
                    <li>• Verificação de colaboradores</li>
                    <li>• Preview do calendário</li>
                    <li>• Correção de erros online</li>
                    <li>• Importação mês a mês</li>
                  </ul>
                </div>
              </div>

              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-4 h-4 text-yellow-600" />
                  <span className="font-medium text-yellow-800 text-sm">⚠️ Importante</span>
                </div>
                <p className="text-xs text-yellow-700">
                  Antes de importar, certifique-se de que os meses Janeiro 2026 e Fevereiro 2026 foram removidos do sistema.
                  O novo sistema permitirá visualizar e corrigir qualquer erro antes da importação final.
                </p>
              </div>
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default AdminPanel;

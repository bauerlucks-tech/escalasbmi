import React, { useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSwap } from '@/contexts/SwapContext';
import { scheduleData as initialScheduleData, ScheduleEntry, MonthSchedule, calculateScheduleStats, UserRole } from '@/data/scheduleData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, Key, User, Check, AlertTriangle, Calendar, Upload, 
  FileSpreadsheet, ArrowLeftRight, CheckCircle, XCircle, Clock,
  Edit3, Save, X, Plus, Users, Archive, UserPlus, BarChart3,
  Download, FileWarning, Loader2, Power, PowerOff
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
import { ScrollArea } from '@/components/ui/scroll-area';

const AdminPanel: React.FC = () => {
  const { currentUser, users, activeUsers, operators, isAdmin, resetPassword, updateUserRole, createUser, archiveUser } = useAuth();
  const { 
    getPendingAdminApproval, 
    getApprovedSwaps, 
    adminApproveSwap, 
    swapRequests, 
    scheduleData, 
    updateSchedule,
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
  
  const [selectedMonth, setSelectedMonth] = useState<number>(1); // January 2026
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  
  // Import state
  const [importMonth, setImportMonth] = useState<number>(() => new Date().getMonth() + 2); // Next month
  const [importYear, setImportYear] = useState<number>(2026);
  const [importedStats, setImportedStats] = useState<{name: string; totalDays: number; weekendDays: number}[] | null>(null);
  const [csvValidation, setCsvValidation] = useState<CSVValidationResult | null>(null);
  const [isProcessingCSV, setIsProcessingCSV] = useState(false);
  
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
    updateSchedule(updatedSchedule);
    setEditingEntry(null);
    setEditForm({ meioPeriodo: '', fechamento: '' });
    toast.success('Escala atualizada com sucesso!');
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
      
      // Get registered employees from active users
      const registeredEmployees = activeUsers.map(u => u.name);
      
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
    const result = importNewSchedule(importMonth, importYear, csvValidation.data, currentUser.name);
    
    if (result.success) {
      toast.success(result.message);
      
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
      </div>

      {/* Tabs */}
      <Tabs defaultValue="swaps" className="space-y-4">
        <TabsList className="grid grid-cols-4 w-full">
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
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">
                          <span className="text-primary">{request.requesterName}</span>
                          <span className="text-muted-foreground mx-2">⇄</span>
                          <span className="text-secondary">{request.targetName}</span>
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          Data: {request.originalDate}
                        </div>
                        <div className="text-xs text-success mt-1">
                          ✓ Aceito pelo colega
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleApproveSwap(request.id)}
                        className="bg-success hover:bg-success/90"
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

            <div className="divide-y divide-border/30 max-h-[300px] overflow-y-auto">
              {approvedSwaps.length === 0 && rejectedSwaps.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground text-sm">
                  Nenhuma troca no histórico
                </div>
              ) : (
                <>
                  {approvedSwaps.map(request => (
                    <div key={request.id} className="p-4 flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-sm mb-1">
                          {request.requesterName} ⇄ {request.targetName}
                        </div>
                        <div className="text-xs text-muted-foreground space-y-0.5">
                          <div>
                            <span className="font-medium">Data:</span> {request.originalDate}
                          </div>
                          <div>
                            <span className="font-medium">Turno solicitado:</span> {getShiftName(request.originalShift)}
                          </div>
                          <div>
                            <span className="font-medium">Aceito por:</span> {request.targetName}
                          </div>
                          {request.adminApprovedBy && (
                            <div>
                              <span className="font-medium">Aprovado por:</span> {request.adminApprovedBy}
                            </div>
                          )}
                        </div>
                      </div>
                      <span className="badge-accepted ml-4">Aprovada</span>
                    </div>
                  ))}
                  {rejectedSwaps.map(request => (
                    <div key={request.id} className="p-4 flex items-center justify-between opacity-60">
                      <div className="flex-1">
                        <div className="font-medium text-sm mb-1">
                          {request.requesterName} ⇄ {request.targetName}
                        </div>
                        <div className="text-xs text-muted-foreground space-y-0.5">
                          <div>
                            <span className="font-medium">Data:</span> {request.originalDate}
                          </div>
                          <div>
                            <span className="font-medium">Turno solicitado:</span> {getShiftName(request.originalShift)}
                          </div>
                          <div>
                            <span className="font-medium">Aceito por:</span> {request.targetName}
                          </div>
                        </div>
                      </div>
                      <span className="badge-rejected ml-4">Recusada</span>
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

              {/* CSV Format Info */}
              <div className="bg-muted/30 rounded-lg p-3 text-xs">
                <p className="font-medium mb-1">Formato esperado do CSV:</p>
                <code className="bg-background/50 px-2 py-1 rounded block">
                  data, posto, colaborador
                </code>
                <p className="text-muted-foreground mt-2">
                  <strong>posto:</strong> meio_periodo ou fechamento | 
                  <strong> colaborador:</strong> nome cadastrado no sistema
                </p>
                <p className="text-muted-foreground mt-1">
                  <strong>Nota:</strong> O dia da semana é calculado automaticamente pela data
                </p>
              </div>

              {/* Month Selection */}
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
                  <p className="text-xs text-warning mt-2 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    Atenção: Um novo mês será adicionado ao sistema!
                  </p>
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
                    <div className="w-3 h-3 rounded-full bg-secondary" />
                    <span className="text-muted-foreground">Meio Período</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-warning" />
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
                              <SelectTrigger className="h-6 text-[10px] bg-secondary/20 px-1">
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
                              <SelectTrigger className="h-6 text-[10px] bg-warning/20 px-1">
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
                            <div className="text-[10px] px-1 py-0.5 rounded truncate bg-secondary/20 text-secondary">
                              {getFirstName(entry.meioPeriodo)}
                            </div>
                            <div className="text-[10px] px-1 py-0.5 rounded truncate bg-warning/20 text-warning">
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
                            toast.success(`Visualizando escala de ${getMonthName(schedule.month)}/${schedule.year}`);
                          }}
                          className="border-primary/50 text-primary hover:bg-primary/10"
                        >
                          <Calendar className="w-4 h-4 mr-1" />
                          Visualizar
                        </Button>
                        <Button
                          size="sm"
                          variant={schedule.isActive !== false ? "default" : "outline"}
                          onClick={() => {
                            if (toggleScheduleActivation(schedule.month, schedule.year)) {
                              const newStatus = schedule.isActive === false ? "ativada" : "desativada";
                              toast.success(`Escala de ${getMonthName(schedule.month)}/${schedule.year} ${newStatus}`);
                            }
                          }}
                          className={schedule.isActive !== false ? "bg-success hover:bg-success/90" : "border-warning/50 text-warning hover:bg-warning/10"}
                        >
                          {schedule.isActive !== false ? (
                            <><Power className="w-4 h-4 mr-1" />Ativa</>
                          ) : (
                            <><PowerOff className="w-4 h-4 mr-1" />Inativa</>
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
                <User className="w-10 h-10 mx-auto mb-3 opacity-50" />
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
                          ${user.role === 'administrador' ? 'bg-primary/20' : 'bg-muted/50'}
                        `}>
                          {user.role === 'administrador' ? (
                            <Shield className="w-5 h-5 text-primary" />
                          ) : (
                            <User className="w-5 h-5 text-muted-foreground" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-xs text-muted-foreground flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded-full ${
                              user.role === 'administrador' 
                                ? 'bg-primary/20 text-primary' 
                                : 'bg-secondary/20 text-secondary'
                            }`}>
                              {user.role === 'administrador' ? 'Administrador' : 'Operador'}
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
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Total:</span>
                <span className="font-mono font-bold">{users.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Operadores:</span>
                <span className="font-mono font-bold text-secondary">
                  {users.filter(u => u.role === 'operador' && u.status === 'ativo').length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Admins:</span>
                <span className="font-mono font-bold text-primary">
                  {users.filter(u => u.role === 'administrador' && u.status === 'ativo').length}
                </span>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPanel;

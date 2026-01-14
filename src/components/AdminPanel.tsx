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
  Edit3, Save, X, Plus, Users, Archive, UserPlus, BarChart3
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const AdminPanel: React.FC = () => {
  const { currentUser, users, activeUsers, isAdmin, resetPassword, updateUserRole, createUser, archiveUser } = useAuth();
  const { getPendingAdminApproval, getApprovedSwaps, adminApproveSwap, swapRequests } = useSwap();
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [scheduleData, setScheduleData] = useState<ScheduleEntry[]>(() => {
    const saved = localStorage.getItem('escala_scheduleData');
    return saved ? JSON.parse(saved) : initialScheduleData;
  });
  const [editingEntry, setEditingEntry] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ meioPeriodo: '', fechamento: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Import state
  const [importMonth, setImportMonth] = useState<number>(() => new Date().getMonth() + 2); // Next month
  const [importYear, setImportYear] = useState<number>(2026);
  const [importedStats, setImportedStats] = useState<{name: string; totalDays: number; weekendDays: number}[] | null>(null);
  
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
    const updatedSchedule = scheduleData.map(entry =>
      entry.date === date
        ? { ...entry, meioPeriodo: editForm.meioPeriodo.toUpperCase(), fechamento: editForm.fechamento.toUpperCase() }
        : entry
    );
    setScheduleData(updatedSchedule);
    localStorage.setItem('escala_scheduleData', JSON.stringify(updatedSchedule));
    setEditingEntry(null);
    toast.success('Escala atualizada!');
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv'
    ];
    
    if (!validTypes.includes(file.type) && !file.name.endsWith('.csv') && !file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      toast.error('Formato inválido. Use arquivos .xlsx, .xls ou .csv');
      return;
    }

    // Calculate and show stats for current schedule
    const stats = calculateScheduleStats(scheduleData);
    setImportedStats(stats);
    
    toast.success(`Arquivo "${file.name}" selecionado para ${getMonthName(importMonth)}/${importYear}`);
    toast.info('Verifique as estatísticas antes de confirmar a importação');
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
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

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const daysInMonth = 31;
  const firstDayOfMonth = new Date(2026, 0, 1).getDay();
  const calendarDays = Array.from({ length: firstDayOfMonth }, () => null).concat(
    Array.from({ length: daysInMonth }, (_, i) => i + 1)
  );

  const getScheduleForDay = (day: number): ScheduleEntry | undefined => {
    const dateStr = `${String(day).padStart(2, '0')}/01/2026`;
    return scheduleData.find(s => s.date === dateStr);
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
        <TabsList className="grid grid-cols-3 w-full">
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
                      <div>
                        <div className="font-medium text-sm">
                          {request.requesterName} ⇄ {request.targetName}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {request.originalDate} • Aprovado por {request.adminApprovedBy}
                        </div>
                      </div>
                      <span className="badge-accepted">Aprovada</span>
                    </div>
                  ))}
                  {rejectedSwaps.map(request => (
                    <div key={request.id} className="p-4 flex items-center justify-between opacity-60">
                      <div>
                        <div className="font-medium text-sm">
                          {request.requesterName} ⇄ {request.targetName}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {request.originalDate}
                        </div>
                      </div>
                      <span className="badge-rejected">Recusada</span>
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
                    Importar Escala
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Importe uma nova escala a partir de arquivo Excel ou CSV
                  </p>
                </div>
              </div>

              {/* Month Selection */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
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
                <div className="col-span-2 sm:col-span-1 flex items-end">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full bg-primary hover:bg-primary/90"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Importar Excel
                  </Button>
                </div>
              </div>

              {/* Import Stats Preview */}
              {importedStats && (
                <div className="glass-card p-4 bg-muted/20">
                  <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-primary" />
                    Estatísticas da Escala - {getMonthName(importMonth)}/{importYear}
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
                    <Button size="sm" className="bg-success hover:bg-success/90">
                      <Check className="w-4 h-4 mr-1" />
                      Confirmar Importação
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setImportedStats(null)}>
                      Cancelar
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Calendar Edit View */}
          <div className="glass-card-elevated overflow-hidden">
            <div className="p-4 border-b border-border/50 flex items-center justify-between">
              <h3 className="font-semibold flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Janeiro 2026 - Editar Escala
              </h3>
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
                            <Input
                              value={editForm.meioPeriodo}
                              onChange={(e) => setEditForm(f => ({ ...f, meioPeriodo: e.target.value }))}
                              className="h-6 text-[10px] p-1 bg-secondary/20"
                              placeholder="Meio Período"
                            />
                            <Input
                              value={editForm.fechamento}
                              onChange={(e) => setEditForm(f => ({ ...f, fechamento: e.target.value }))}
                              className="h-6 text-[10px] p-1 bg-warning/20"
                              placeholder="Fechamento"
                            />
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

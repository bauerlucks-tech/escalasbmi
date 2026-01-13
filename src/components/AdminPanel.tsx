import React, { useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSwap } from '@/contexts/SwapContext';
import { scheduleData as initialScheduleData, ScheduleEntry } from '@/data/scheduleData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, Key, User, Check, AlertTriangle, Calendar, Upload, 
  FileSpreadsheet, ArrowLeftRight, CheckCircle, XCircle, Clock,
  Edit3, Save, X, Plus
} from 'lucide-react';
import { toast } from 'sonner';

const AdminPanel: React.FC = () => {
  const { currentUser, users, resetPassword } = useAuth();
  const { getPendingAdminApproval, getApprovedSwaps, adminApproveSwap, swapRequests } = useSwap();
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [scheduleData, setScheduleData] = useState<ScheduleEntry[]>(() => {
    const saved = localStorage.getItem('escala_scheduleData');
    return saved ? JSON.parse(saved) : initialScheduleData;
  });
  const [editingEntry, setEditingEntry] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ shift1: '', shift2: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!currentUser?.isAdmin) {
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
    adminApproveSwap(requestId, currentUser.name);
    toast.success('Troca aprovada com sucesso!');
  };

  const handleEditEntry = (entry: ScheduleEntry) => {
    setEditingEntry(entry.date);
    setEditForm({ shift1: entry.shift1, shift2: entry.shift2 });
  };

  const handleSaveEntry = (date: string) => {
    const updatedSchedule = scheduleData.map(entry =>
      entry.date === date
        ? { ...entry, shift1: editForm.shift1.toUpperCase(), shift2: editForm.shift2.toUpperCase() }
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

    // Check file type
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv'
    ];
    
    if (!validTypes.includes(file.type) && !file.name.endsWith('.csv') && !file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      toast.error('Formato inválido. Use arquivos .xlsx, .xls ou .csv');
      return;
    }

    // For now, show a message about the expected format
    toast.info('Importação de Excel: funcionalidade será implementada com integração backend');
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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
            <div className="text-2xl font-bold text-muted-foreground">{users.length}</div>
            <div className="text-xs text-muted-foreground">Usuários</div>
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
            <Key className="w-4 h-4" />
            Senhas
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
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="border-primary/50 text-primary hover:bg-primary/10"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Importar Excel
                </Button>
              </div>
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
                  <span className="text-muted-foreground">Turno 1</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-warning" />
                  <span className="text-muted-foreground">Turno 2</span>
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
                              value={editForm.shift1}
                              onChange={(e) => setEditForm(f => ({ ...f, shift1: e.target.value }))}
                              className="h-6 text-[10px] p-1 bg-secondary/20"
                              placeholder="Turno 1"
                            />
                            <Input
                              value={editForm.shift2}
                              onChange={(e) => setEditForm(f => ({ ...f, shift2: e.target.value }))}
                              className="h-6 text-[10px] p-1 bg-warning/20"
                              placeholder="Turno 2"
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
                              {getFirstName(entry.shift1)}
                            </div>
                            <div className="text-[10px] px-1 py-0.5 rounded truncate bg-warning/20 text-warning">
                              {getFirstName(entry.shift2)}
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
        <TabsContent value="users">
          <div className="glass-card overflow-hidden">
            <div className="p-4 border-b border-border/50">
              <h3 className="font-semibold flex items-center gap-2">
                <Key className="w-4 h-4 text-primary" />
                Gerenciar Senhas
              </h3>
            </div>

            <div className="divide-y divide-border/30">
              {users.map(user => (
                <div key={user.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`
                        w-10 h-10 rounded-full flex items-center justify-center
                        ${user.isAdmin ? 'bg-primary/20' : 'bg-muted/50'}
                      `}>
                        {user.isAdmin ? (
                          <Shield className="w-5 h-5 text-primary" />
                        ) : (
                          <User className="w-5 h-5 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {user.isAdmin ? 'Administrador' : 'Colaborador'}
                        </div>
                      </div>
                    </div>

                    {selectedUser === user.id ? (
                      <div className="flex items-center gap-2">
                        <Input
                          type="password"
                          placeholder="Nova senha"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-32 h-9 text-sm bg-muted/50"
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
                          Cancelar
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
                        Resetar Senha
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* System Info */}
          <div className="glass-card p-4 mt-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Total de usuários:</span>
              <span className="font-mono font-bold text-primary">{users.length}</span>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPanel;
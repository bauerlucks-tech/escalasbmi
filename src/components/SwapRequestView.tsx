import React, { useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSwap } from '@/contexts/SwapContext';
import { ScheduleEntry } from '@/data/scheduleData';
import { Button } from '@/components/ui/button';
import { ArrowLeftRight, Calendar, User, AlertCircle, Check, Clock, ArrowRight, Sun, Sunset, Users } from 'lucide-react';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type ShiftType = 'meioPeriodo' | 'fechamento';

const SwapRequestView: React.FC = () => {
  const { currentUser, users } = useAuth();
  const { createSwapRequest, getMyRequests, scheduleData } = useSwap();
  
  // Step 1: Select my day to give away
  const [selectedMyDay, setSelectedMyDay] = useState<string | null>(null);
  const [selectedMyShift, setSelectedMyShift] = useState<ShiftType | null>(null);
  
  // Step 2: Select target day
  const [selectedTargetDay, setSelectedTargetDay] = useState<string | null>(null);
  
  // Step 3: Select target operator and shift
  const [selectedOperator, setSelectedOperator] = useState<string | null>(null);
  const [selectedTargetShift, setSelectedTargetShift] = useState<ShiftType | null>(null);

  if (!currentUser) return null;

  const myRequests = getMyRequests(currentUser.id);

  // Helper function to convert date string (DD/MM/YYYY) to timestamp
  const convertDateToTime = (dateStr: string): number => {
    const [day, month, year] = dateStr.split('/').map(Number);
    return new Date(year, month - 1, day).getTime();
  };

  // Helper function to check if date is today or in the future
  const isDateTodayOrFuture = (dateStr: string): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dateTime = convertDateToTime(dateStr);
    return dateTime >= today.getTime();
  };

  // Get available operators (other active users) - DEFINIR PRIMEIRO
  const availableOperators = useMemo(() => {
    return users.filter(u => 
      u.id !== currentUser.id && 
      u.status === 'ativo' && 
      u.role === 'operador'
    );
  }, [users, currentUser.id]);

  // Get days where user is scheduled (from today onwards)
  const myScheduledDays = useMemo(() => {
    return scheduleData.filter(entry => 
      (entry.meioPeriodo === currentUser.name || entry.fechamento === currentUser.name) &&
      isDateTodayOrFuture(entry.date)
    );
  }, [scheduleData, currentUser.name]);

  // Get all available days (from today onwards) to select target day
  const availableDays = useMemo(() => {
    return scheduleData.filter(entry => isDateTodayOrFuture(entry.date));
  }, [scheduleData]);

  // Get operators available on the selected target day
  const operatorsOnTargetDay = useMemo(() => {
    if (!selectedTargetDay) return [];
    const targetEntry = scheduleData.find(e => e.date === selectedTargetDay);
    if (!targetEntry) return [];
    
    return availableOperators.filter(op => 
      op.name === targetEntry.meioPeriodo || 
      op.name === targetEntry.fechamento
    );
  }, [selectedTargetDay, availableOperators, scheduleData]);

  const getScheduleByDate = (dateStr: string): ScheduleEntry | undefined => {
    return scheduleData.find(s => s.date === dateStr);
  };

  const getMyShiftsForDay = (entry: ScheduleEntry): ShiftType[] => {
    const shifts: ShiftType[] = [];
    if (entry.meioPeriodo === currentUser.name) shifts.push('meioPeriodo');
    if (entry.fechamento === currentUser.name) shifts.push('fechamento');
    return shifts;
  };

  const getOperatorShiftsForDay = (entry: ScheduleEntry, operator: string): ShiftType[] => {
    const shifts: ShiftType[] = [];
    if (entry.meioPeriodo === operator) shifts.push('meioPeriodo');
    if (entry.fechamento === operator) shifts.push('fechamento');
    return shifts;
  };

  const getShiftLabel = (shift: ShiftType): string => {
    return shift === 'meioPeriodo' ? 'Meio Período' : 'Fechamento';
  };

  const getDayNumber = (dateStr: string): string => {
    return dateStr.split('/')[0];
  };

  const selectedMyEntry = selectedMyDay ? getScheduleByDate(selectedMyDay) : null;
  const selectedTargetEntry = selectedTargetDay ? getScheduleByDate(selectedTargetDay) : null;

  const handleSubmit = () => {
    if (!selectedMyDay || !selectedMyShift || !selectedOperator || !selectedTargetDay || !selectedTargetShift) {
      toast.error('Preencha todos os campos para solicitar a troca');
      return;
    }

    const targetUser = users.find(u => u.name === selectedOperator);
    
    if (!targetUser) {
      toast.error('Operador não encontrado');
      return;
    }

    createSwapRequest({
      requesterId: currentUser.id,
      requesterName: currentUser.name,
      targetId: targetUser.id,
      targetName: selectedOperator,
      originalDate: selectedMyDay,
      originalShift: selectedMyShift,
      targetDate: selectedTargetDay,
      targetShift: selectedTargetShift,
      status: 'pending',
    });

    toast.success('Solicitação de troca enviada!');
    resetForm();
  };

  const resetForm = () => {
    setSelectedMyDay(null);
    setSelectedMyShift(null);
    setSelectedOperator(null);
    setSelectedTargetDay(null);
    setSelectedTargetShift(null);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="badge-pending">Aguardando colega</span>;
      case 'accepted':
        return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-warning/20 text-warning">Aguardando admin</span>;
      case 'approved':
        return <span className="badge-accepted">Aprovada</span>;
      case 'rejected':
        return <span className="badge-rejected">Recusada</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Main Swap Card */}
      <div className="glass-card-elevated overflow-hidden">
        <div className="p-4 border-b border-border/50">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <ArrowLeftRight className="w-5 h-5 text-primary" />
            Solicitar Troca de Turno
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Selecione o dia/turno que você quer ceder, o operador e o dia/turno que você quer assumir
          </p>
        </div>

        <div className="p-4 space-y-6">
          {/* Step 1: Select my day and shift */}
          <div className="space-y-3">
            <label className="text-sm font-medium flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">1</div>
              Qual dia e turno você quer ceder?
            </label>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Day Selection */}
              <Select 
                value={selectedMyDay || ''} 
                onValueChange={(v) => {
                  setSelectedMyDay(v);
                  setSelectedMyShift(null);
                  setSelectedOperator(null);
                  setSelectedTargetDay(null);
                  setSelectedTargetShift(null);
                }}
              >
                <SelectTrigger className="w-full h-auto py-3 bg-muted/30">
                  <SelectValue placeholder="Selecione o dia">
                    {selectedMyEntry && (
                      <div className="flex items-center gap-2 text-left">
                        <Calendar className="w-4 h-4 text-primary" />
                        <span className="font-medium">Dia {getDayNumber(selectedMyDay!)}</span>
                        <span className="text-muted-foreground">- {selectedMyEntry.dayOfWeek}</span>
                      </div>
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {myScheduledDays.map(entry => (
                    <SelectItem key={entry.date} value={entry.date} className="py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                          <span className="text-primary font-bold">{getDayNumber(entry.date)}</span>
                        </div>
                        <div>
                          <div className="font-medium">{entry.dayOfWeek}</div>
                          <div className="text-xs text-muted-foreground flex items-center gap-2">
                            {entry.meioPeriodo === currentUser.name && (
                              <span className="flex items-center gap-1 text-secondary">
                                <Sun className="w-3 h-3" /> Meio Período
                              </span>
                            )}
                            {entry.fechamento === currentUser.name && (
                              <span className="flex items-center gap-1 text-warning">
                                <Sunset className="w-3 h-3" /> Fechamento
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Shift Selection */}
              {selectedMyDay && selectedMyEntry && (
                <Select 
                  value={selectedMyShift || ''} 
                  onValueChange={(v) => setSelectedMyShift(v as ShiftType)}
                >
                  <SelectTrigger className="w-full h-auto py-3 bg-muted/30">
                    <SelectValue placeholder="Selecione o turno">
                      {selectedMyShift && (
                        <div className="flex items-center gap-2 text-left">
                          {selectedMyShift === 'meioPeriodo' 
                            ? <Sun className="w-4 h-4 text-secondary" />
                            : <Sunset className="w-4 h-4 text-warning" />
                          }
                          <span className="font-medium">{getShiftLabel(selectedMyShift)}</span>
                        </div>
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {getMyShiftsForDay(selectedMyEntry).map(shift => (
                      <SelectItem key={shift} value={shift} className="py-3">
                        <div className="flex items-center gap-2">
                          {shift === 'meioPeriodo' 
                            ? <Sun className="w-4 h-4 text-secondary" />
                            : <Sunset className="w-4 h-4 text-warning" />
                          }
                          <span>{getShiftLabel(shift)}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>

          {/* Arrow Divider */}
          {selectedMyDay && selectedMyShift && (
            <div className="flex justify-center">
              <div className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center animate-fade-in">
                <ArrowRight className="w-5 h-5 text-muted-foreground" />
              </div>
            </div>
          )}

          {/* Step 2: Select target day */}
          {selectedMyDay && selectedMyShift && (
            <div className="space-y-3 animate-fade-in">
              <label className="text-sm font-medium flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center text-xs font-bold">2</div>
                Qual data você quer trocar?
              </label>
              
              <Select 
                value={selectedTargetDay || ''} 
                onValueChange={(v) => {
                  setSelectedTargetDay(v);
                  setSelectedOperator(null);
                  setSelectedTargetShift(null);
                }}
              >
                <SelectTrigger className="w-full h-auto py-3 bg-muted/30">
                  <SelectValue placeholder="Selecione o dia">
                    {selectedTargetEntry && (
                      <div className="flex items-center gap-2 text-left">
                        <Calendar className="w-4 h-4 text-success" />
                        <span className="font-medium">Dia {getDayNumber(selectedTargetDay!)}</span>
                        <span className="text-muted-foreground">- {selectedTargetEntry.dayOfWeek}</span>
                      </div>
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {availableDays.map(entry => (
                    <SelectItem key={entry.date} value={entry.date} className="py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-success/20 flex items-center justify-center">
                          <span className="text-success font-bold">{getDayNumber(entry.date)}</span>
                        </div>
                        <div>
                          <div className="font-medium">{entry.dayOfWeek}</div>
                          <div className="text-xs text-muted-foreground flex items-center gap-2">
                            {entry.meioPeriodo && (
                              <span className="flex items-center gap-1 text-secondary">
                                <Sun className="w-3 h-3" /> {entry.meioPeriodo}
                              </span>
                            )}
                            {entry.fechamento && (
                              <span className="flex items-center gap-1 text-warning">
                                <Sunset className="w-3 h-3" /> {entry.fechamento}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Arrow Divider */}
          {selectedTargetDay && (
            <div className="flex justify-center">
              <div className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center animate-fade-in">
                <ArrowRight className="w-5 h-5 text-muted-foreground" />
              </div>
            </div>
          )}

          {/* Step 3: Select operator and shift */}
          {selectedTargetDay && selectedTargetEntry && (
            <div className="space-y-3 animate-fade-in">
              <label className="text-sm font-medium flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-success text-success-foreground flex items-center justify-center text-xs font-bold">3</div>
                Qual turno/operador você quer assumir no dia {getDayNumber(selectedTargetDay)}?
              </label>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Operator Selection */}
                <Select 
                  value={selectedOperator || ''} 
                  onValueChange={(v) => {
                    setSelectedOperator(v);
                    setSelectedTargetShift(null);
                  }}
                >
                  <SelectTrigger className="w-full h-auto py-3 bg-muted/30">
                    <SelectValue placeholder="Selecione o operador">
                      {selectedOperator && (
                        <div className="flex items-center gap-2 text-left">
                          <User className="w-4 h-4 text-success" />
                          <span className="font-medium">{selectedOperator}</span>
                        </div>
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {[selectedTargetEntry.meioPeriodo, selectedTargetEntry.fechamento]
                      .filter((name, index, self) => name && self.indexOf(name) === index)
                      .map(operatorName => (
                        <SelectItem key={operatorName} value={operatorName} className="py-3">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-success" />
                            <span className="font-medium">{operatorName}</span>
                          </div>
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>

                {/* Shift Selection */}
                {selectedOperator && (
                  <Select 
                    value={selectedTargetShift || ''} 
                    onValueChange={(v) => setSelectedTargetShift(v as ShiftType)}
                  >
                    <SelectTrigger className="w-full h-auto py-3 bg-muted/30">
                      <SelectValue placeholder="Selecione o turno">
                        {selectedTargetShift && (
                          <div className="flex items-center gap-2 text-left">
                            {selectedTargetShift === 'meioPeriodo' 
                              ? <Sun className="w-4 h-4 text-secondary" />
                              : <Sunset className="w-4 h-4 text-warning" />
                            }
                            <span className="font-medium">{getShiftLabel(selectedTargetShift)}</span>
                          </div>
                        )}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {getOperatorShiftsForDay(selectedTargetEntry, selectedOperator).map(shift => (
                        <SelectItem key={shift} value={shift} className="py-3">
                          <div className="flex items-center gap-2">
                            {shift === 'meioPeriodo' 
                              ? <Sun className="w-4 h-4 text-secondary" />
                              : <Sunset className="w-4 h-4 text-warning" />
                            }
                            <span>{getShiftLabel(shift)}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>
          )}

          {/* Confirmation Summary */}
          {selectedMyDay && selectedMyShift && selectedOperator && selectedTargetDay && selectedTargetShift && selectedMyEntry && selectedTargetEntry && (
            <div className="glass-card p-4 bg-muted/20 animate-fade-in">
              <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                <Check className="w-4 h-4 text-success" />
                Resumo da Troca
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-primary/10 border border-primary/30">
                  <div className="text-xs text-muted-foreground mb-1">Você vai ceder</div>
                  <div className="font-bold text-primary text-lg">Dia {getDayNumber(selectedMyDay)}</div>
                  <div className="text-sm text-muted-foreground">{selectedMyEntry.dayOfWeek}</div>
                  <div className="text-xs mt-2 flex items-center gap-1">
                    {selectedMyShift === 'meioPeriodo' 
                      ? <Sun className="w-3 h-3 text-secondary" />
                      : <Sunset className="w-3 h-3 text-warning" />
                    }
                    Turno: {getShiftLabel(selectedMyShift)}
                  </div>
                </div>
                
                <div className="p-3 rounded-lg bg-success/10 border border-success/30">
                  <div className="text-xs text-muted-foreground mb-1">Você vai assumir</div>
                  <div className="font-bold text-success text-lg">Dia {getDayNumber(selectedTargetDay)}</div>
                  <div className="text-sm text-muted-foreground">{selectedTargetEntry.dayOfWeek}</div>
                  <div className="text-xs mt-2 flex items-center gap-1">
                    {selectedTargetShift === 'meioPeriodo' 
                      ? <Sun className="w-3 h-3 text-secondary" />
                      : <Sunset className="w-3 h-3 text-warning" />
                    }
                    Turno de: {selectedOperator}
                  </div>
                </div>
              </div>

              <p className="text-xs text-muted-foreground mt-4">
                <strong>{selectedOperator}</strong> será notificado e precisará aceitar. 
                Após o aceite, o administrador aprovará e o calendário será atualizado automaticamente.
              </p>

              <div className="flex gap-2 mt-4">
                <Button 
                  onClick={handleSubmit}
                  className="flex-1 bg-primary hover:bg-primary/90 glow-primary"
                >
                  <ArrowLeftRight className="w-4 h-4 mr-2" />
                  Confirmar Solicitação
                </Button>
                <Button 
                  variant="outline" 
                  onClick={resetForm}
                >
                  Limpar
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* My Requests History */}
      <div className="glass-card overflow-hidden">
        <div className="p-4 border-b border-border/50">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Minhas Solicitações
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Fluxo: Solicitação → Aceite do colega → Aprovação do administrador → Calendário atualizado
          </p>
        </div>

        {myRequests.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <AlertCircle className="w-10 h-10 mx-auto mb-3 opacity-50" />
            <p>Você ainda não fez nenhuma solicitação de troca.</p>
          </div>
        ) : (
          <div className="divide-y divide-border/30">
            {myRequests.map(request => (
              <div key={request.id} className="flex items-center justify-between p-4">
                <div>
                  <div className="font-medium text-sm flex items-center gap-2 flex-wrap">
                    <span className="flex items-center gap-1 px-2 py-0.5 bg-primary/20 text-primary rounded text-xs">
                      Dia {request.originalDate.split('/')[0]}
                      {request.originalShift === 'meioPeriodo' ? (
                        <Sun className="w-3 h-3 text-secondary" />
                      ) : (
                        <Sunset className="w-3 h-3 text-warning" />
                      )}
                      <span className="font-bold">{request.originalShift === 'meioPeriodo' ? 'MP' : 'FE'}</span>
                    </span>
                    <ArrowRight className="w-3 h-3 text-muted-foreground" />
                    <span className="flex items-center gap-1 px-2 py-0.5 bg-success/20 text-success rounded text-xs">
                      Dia {request.targetDate?.split('/')[0] || '??'}
                      {request.targetShift === 'meioPeriodo' ? (
                        <Sun className="w-3 h-3 text-secondary" />
                      ) : (
                        <Sunset className="w-3 h-3 text-warning" />
                      )}
                      <span className="font-bold">{request.targetShift === 'meioPeriodo' ? 'MP' : 'FE'}</span>
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Troca com: <span className="text-foreground">{request.targetName}</span>
                  </div>
                  {request.adminApprovedBy && (
                    <div className="text-xs text-success mt-0.5">
                      ✓ Aprovado por: {request.adminApprovedBy} - Calendário atualizado
                    </div>
                  )}
                </div>
                {getStatusBadge(request.status)}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SwapRequestView;

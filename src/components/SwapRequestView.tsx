import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSwap } from '@/contexts/SwapContext';
import { ScheduleEntry, getCurrentSchedules, getMonthName } from '@/data/scheduleData';
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
  const { currentUser, users, isAdmin } = useAuth();
  const { createSwapRequest, getMyRequests, currentSchedules, switchToSchedule } = useSwap();
  const currentUserId = currentUser?.id ?? '';
  const currentUserName = currentUser?.name ?? '';
  
  // Check if current user is admin
  const isCurrentUserAdmin = currentUser ? isAdmin(currentUser) : false;
  
  // Step 0: Select month for original shift
  const [selectedMonth, setSelectedMonth] = useState<{month: number, year: number} | null>(null);
  
  // Step 0.5: Select month for target shift
  const [selectedTargetMonth, setSelectedTargetMonth] = useState<{month: number, year: number} | null>(null);
  
  // Step 1: Select my day to give away
  const [selectedMyDay, setSelectedMyDay] = useState<string | null>(null);
  const [selectedMyShift, setSelectedMyShift] = useState<ShiftType | null>(null);
  
  // Step 2: Select target day
  const [selectedTargetDay, setSelectedTargetDay] = useState<string | null>(null);
  
  // Step 3: Select target operator and shift
  const [selectedOperator, setSelectedOperator] = useState<string | null>(null);
  const [selectedTargetShift, setSelectedTargetShift] = useState<ShiftType | 'ambos' | null>(null);

  const myRequests = currentUser ? getMyRequests(currentUserId) : [];

  // Helper function to convert date string (DD/MM/YYYY) to timestamp
  const convertDateToTime = (dateStr: string): number => {
    const [day, month, year] = dateStr.split('/').map(Number);
    return new Date(year, month - 1, day).getTime();
  };

  // Helper function to check if date is today or in the future
  const isDateTodayOrFuture = useCallback((dateStr: string): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dateTime = convertDateToTime(dateStr);
    return dateTime >= today.getTime();
  }, []);

  // Get available months for selection
  const availableMonths = useMemo(() => {
    return currentSchedules.map(schedule => ({
      month: schedule.month,
      year: schedule.year,
      label: `${getMonthName(schedule.month)}/${schedule.year}`,
      entries: schedule.entries
    }));
  }, [currentSchedules]);
  
  // Get schedule data for selected month (original)
  const currentScheduleData = useMemo(() => {
    if (!selectedMonth) return [];
    const schedule = currentSchedules.find(s => s.month === selectedMonth.month && s.year === selectedMonth.year);
    return schedule ? schedule.entries : [];
  }, [selectedMonth, currentSchedules]);

  // Get schedule data for selected target month
  const targetScheduleData = useMemo(() => {
    if (!selectedTargetMonth) return [];
    const schedule = currentSchedules.find(s => s.month === selectedTargetMonth.month && s.year === selectedTargetMonth.year);
    return schedule ? schedule.entries : [];
  }, [selectedTargetMonth, currentSchedules]);

  // Get available operators (other active users) - DEFINIR PRIMEIRO
  const availableOperators = useMemo(() => {
    return users.filter(u => 
      u.id !== currentUserId && 
      u.status === 'ativo' && 
      u.role === 'operador' &&
      !u.hideFromSchedule
    );
  }, [users, currentUserId]);

  // Get days where user is scheduled (from today onwards)
  // For admins, show all available days to allow them to request any shift
  const myScheduledDays = useMemo(() => {
    if (isCurrentUserAdmin) {
      // Admins can see all available days to request any shift
      return targetScheduleData.filter(entry => isDateTodayOrFuture(entry.date));
    }
    return currentScheduleData.filter(entry => 
      (entry.meioPeriodo === currentUserName || entry.fechamento === currentUserName) &&
      isDateTodayOrFuture(entry.date)
    );
  }, [currentScheduleData, targetScheduleData, currentUserName, isCurrentUserAdmin, isDateTodayOrFuture]);

  // Get all available days (from today onwards) to select target day
  const availableDays = useMemo(() => {
    return targetScheduleData.filter(entry => isDateTodayOrFuture(entry.date));
  }, [targetScheduleData, isDateTodayOrFuture]);

  // Get operators available on the selected target day
  const operatorsOnTargetDay = useMemo(() => {
    if (!selectedTargetDay) return [];
    const targetEntry = targetScheduleData.find(e => e.date === selectedTargetDay);
    if (!targetEntry) return [];
    
    const shifts: ShiftType[] = getOperatorShiftsForDay(targetEntry, selectedOperator);
    return users.filter(u => 
      u.id !== currentUserId && 
      u.status === 'ativo' && 
      u.role === 'operador' &&
      !u.hideFromSchedule &&
      (shifts as unknown[]).includes(getOperatorShiftsForDay(targetEntry, u.name))
    );
  }, [users, currentUserId, selectedTargetDay, selectedOperator, targetScheduleData]);

  // Get days where selected operator is scheduled (from today onwards)
  const operatorScheduledDays = useMemo(() => {
    if (!selectedOperator) return [];
    return targetScheduleData.filter(entry => 
      (entry.meioPeriodo === selectedOperator || entry.fechamento === selectedOperator) &&
      isDateTodayOrFuture(entry.date)
    );
  }, [targetScheduleData, selectedOperator, isDateTodayOrFuture]);

  const getScheduleByDate = (dateStr: string, useTargetSchedule: boolean = false): ScheduleEntry | undefined => {
    const scheduleData = useTargetSchedule ? targetScheduleData : currentScheduleData;
    return scheduleData.find(s => s.date === dateStr);
  };

  const getMyShiftsForDay = (entry: ScheduleEntry): ShiftType[] => {
    const shifts: ShiftType[] = [];
    
    if (isCurrentUserAdmin) {
      // Admins can request any available shift
      if (entry.meioPeriodo) shifts.push('meioPeriodo');
      if (entry.fechamento) shifts.push('fechamento');
    } else {
      // Regular users can only request their own shifts
      if (entry.meioPeriodo === currentUserName) shifts.push('meioPeriodo');
      if (entry.fechamento === currentUserName) shifts.push('fechamento');
    }
    
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

  const selectedMyEntry = selectedMyDay ? getScheduleByDate(selectedMyDay, false) : null;
  const selectedTargetEntry = selectedTargetDay ? getScheduleByDate(selectedTargetDay, true) : null;

  if (!currentUser) return null;

  const handleSubmit = async () => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/8a5dff31-3ebe-4884-b937-ab042c00d6b1',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'SwapRequestView.tsx:handleSubmit:start',message:'handleSubmit called',data:{hasMyDay:!!selectedMyDay,hasMyShift:!!selectedMyShift,hasOperator:!!selectedOperator,hasTargetDay:!!selectedTargetDay,hasTargetShift:!!selectedTargetShift},timestamp:Date.now(),runId:'pre-fix',hypothesisId:'H1'})}).catch(()=>{});
    // #endregion
    if (!selectedMyDay || !selectedMyShift || !selectedOperator || !selectedTargetDay || !selectedTargetShift) {
      toast.error('Preencha todos os campos para solicitar a troca');
      return;
    }

    const targetUser = users.find(u => u.name === selectedOperator);
    
    if (!targetUser) {
      toast.error('Operador não encontrado');
      return;
    }

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/8a5dff31-3ebe-4884-b937-ab042c00d6b1',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'SwapRequestView.tsx:handleSubmit:beforeCreate',message:'Preparing swap request payload',data:{originalDate:!!selectedMyDay,targetDate:!!selectedTargetDay,originalShift:selectedMyShift,targetShift:selectedTargetShift},timestamp:Date.now(),runId:'pre-fix',hypothesisId:'H2'})}).catch(()=>{});
    // #endregion

    await createSwapRequest({
      requesterId: currentUser.id,
      requesterName: currentUser.name,
      targetId: targetUser.id,
      targetName: selectedOperator,
      originalDate: selectedMyDay,
      originalShift: selectedMyShift,
      targetDate: selectedTargetDay,
      targetShift: selectedTargetShift === 'ambos' ? 'meioPeriodo' : selectedTargetShift,
      status: 'pending',
    });

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/8a5dff31-3ebe-4884-b937-ab042c00d6b1',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'SwapRequestView.tsx:handleSubmit:end',message:'Swap request created',data:{},timestamp:Date.now(),runId:'pre-fix',hypothesisId:'H3'})}).catch(()=>{});
    // #endregion

    toast.success('Solicitação de troca enviada!');
    resetForm();
  };

  const resetForm = () => {
    setSelectedMonth(null);
    setSelectedTargetMonth(null);
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
        return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-warning/20 text-warning">Aguardando aprovação</span>;
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
          {/* Step 0: Select month */}
          <div className="space-y-3">
            <label className="text-sm font-medium flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">0</div>
              Selecione o mês da escala
            </label>
            
            <Select 
              value={selectedMonth ? `${selectedMonth.month}/${selectedMonth.year}` : ''} 
              onValueChange={(v) => {
                const [month, year] = v.split('/').map(Number);
                setSelectedMonth({ month, year });
                setSelectedMyDay(null);
                setSelectedMyShift(null);
                setSelectedOperator(null);
                setSelectedTargetDay(null);
                setSelectedTargetShift(null);
                setSelectedTargetMonth(null);
              }}
            >
              <SelectTrigger className="w-full h-auto py-3 bg-muted/30">
                <SelectValue placeholder="Selecione o mês">
                  {selectedMonth && (
                    <div className="flex items-center gap-2 text-left">
                      <Calendar className="w-4 h-4 text-primary" />
                      <span className="font-medium">{getMonthName(selectedMonth.month)}/{selectedMonth.year}</span>
                    </div>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {availableMonths.map(month => (
                  <SelectItem key={`${month.month}/${month.year}`} value={`${month.month}/${month.year}`}>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-primary" />
                      <span>{month.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Step 1: Select my day and shift */}
          <div className="space-y-3 animate-scale-in">
            <label className="text-sm font-medium flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold animate-pulse-slow">1</div>
              {selectedMonth && <span className="text-muted-foreground">{getMonthName(selectedMonth.month)}/{selectedMonth.year} - </span>}
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
                disabled={!selectedMonth}
              >
                <SelectTrigger className="w-full h-auto py-3 bg-muted/30 btn-interactive">
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
                            {isCurrentUserAdmin ? (
                              <>
                                {entry.meioPeriodo && (
                                  <span className="flex items-center gap-1 text-meioPeriodo">
                                    <Sun className="w-3 h-3" /> {entry.meioPeriodo}
                                  </span>
                                )}
                                {entry.fechamento && (
                                  <span className="flex items-center gap-1 text-fechamento">
                                    <Sunset className="w-3 h-3" /> {entry.fechamento}
                                  </span>
                                )}
                              </>
                            ) : (
                              <>
                                {entry.meioPeriodo === currentUser.name && (
                                  <span className="flex items-center gap-1 text-meioPeriodo">
                                    <Sun className="w-3 h-3" /> Meio Período
                                  </span>
                                )}
                                {entry.fechamento === currentUser.name && (
                                  <span className="flex items-center gap-1 text-fechamento">
                                    <Sunset className="w-3 h-3" /> Fechamento
                                  </span>
                                )}
                              </>
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
                            ? <Sun className="w-4 h-4 text-meioPeriodo" />
                            : <Sunset className="w-4 h-4 text-fechamento" />
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
                            ? <Sun className="w-4 h-4 text-meioPeriodo" />
                            : <Sunset className="w-4 h-4 text-fechamento" />
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

          {/* Step 2: Select target month */}
          {selectedMyDay && selectedMyShift && (
            <div className="space-y-3 animate-fade-in">
              <label className="text-sm font-medium flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center text-xs font-bold">2</div>
                Selecione o mês para a troca
              </label>
              
              <Select 
                value={selectedTargetMonth ? `${selectedTargetMonth.month}/${selectedTargetMonth.year}` : ''} 
                onValueChange={(v) => {
                  const [month, year] = v.split('/').map(Number);
                  setSelectedTargetMonth({ month, year });
                  setSelectedTargetDay(null);
                  setSelectedOperator(null);
                  setSelectedTargetShift(null);
                }}
              >
                <SelectTrigger className="w-full h-auto py-3 bg-muted/30">
                  <SelectValue placeholder="Selecione o mês da troca">
                    {selectedTargetMonth && (
                      <div className="flex items-center gap-2 text-left">
                        <Calendar className="w-4 h-4 text-success" />
                        <span className="font-medium">{getMonthName(selectedTargetMonth.month)}/{selectedTargetMonth.year}</span>
                      </div>
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {availableMonths.map(month => (
                    <SelectItem key={`${month.month}/${month.year}`} value={`${month.month}/${month.year}`}>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-success" />
                        <span>{month.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Arrow Divider */}
          {selectedTargetMonth && (
            <div className="flex justify-center">
              <div className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center animate-fade-in">
                <ArrowRight className="w-5 h-5 text-muted-foreground" />
              </div>
            </div>
          )}

          {/* Step 3: Select target day */}
          {selectedTargetMonth && (
            <div className="space-y-3 animate-fade-in">
              <label className="text-sm font-medium flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center text-xs font-bold">3</div>
                {selectedTargetMonth && <span className="text-muted-foreground">{getMonthName(selectedTargetMonth.month)}/{selectedTargetMonth.year} - </span>}
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
                              <span className="flex items-center gap-1 text-meioPeriodo">
                                <Sun className="w-3 h-3" /> {entry.meioPeriodo}
                              </span>
                            )}
                            {entry.fechamento && (
                              <span className="flex items-center gap-1 text-fechamento">
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

          {/* Step 4: Select operator and shift */}
          {selectedTargetDay && selectedTargetEntry && (
            <div className="space-y-3 animate-fade-in">
              <label className="text-sm font-medium flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-success text-success-foreground flex items-center justify-center text-xs font-bold">4</div>
                {selectedTargetMonth && <span className="text-muted-foreground">{getMonthName(selectedTargetMonth.month)}/{selectedTargetMonth.year} - </span>}
                Qual turno/operador você quer assumir no dia {getDayNumber(selectedTargetDay)}?
              </label>
              
              <div className="grid grid-cols-1 gap-3">
                {/* Combined Operator and Shift Selection */}
                <Select 
                  value={selectedTargetShift ? `${selectedOperator}-${selectedTargetShift}` : ''} 
                  onValueChange={(v) => {
                    if (v === 'ambos') {
                      const [operator] = v.split('-');
                      setSelectedOperator(selectedTargetEntry.meioPeriodo || selectedTargetEntry.fechamento);
                      setSelectedTargetShift('ambos');
                    } else {
                      const [operator, shift] = v.split('-');
                      setSelectedOperator(operator);
                      setSelectedTargetShift(shift as ShiftType);
                    }
                  }}
                >
                  <SelectTrigger className="w-full h-auto py-3 bg-muted/30">
                    <SelectValue placeholder="Selecione o operador e turno">
                      {selectedOperator && selectedTargetShift && (
                        <div className="flex items-center gap-2 text-left">
                          <User className="w-4 h-4 text-success" />
                          <span className="font-medium">{selectedOperator}</span>
                          {selectedTargetShift === 'ambos' ? (
                            <span className="text-xs text-muted-foreground ml-1">
                              <span className="flex items-center gap-1">
                                <Sun className="w-3 h-3 text-meioPeriodo" /> MP
                                <Sunset className="w-3 h-3 text-fechamento" /> FE
                              </span>
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground ml-1">
                              ({getShiftLabel(selectedTargetShift)})
                            </span>
                          )}
                        </div>
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {[selectedTargetEntry.meioPeriodo, selectedTargetEntry.fechamento]
                      .filter((name, index, self) => name && self.indexOf(name) === index)
                      .filter(operatorName => operatorName !== currentUser?.name) // Impedir auto-seleção
                      .map(operatorName => {
                        const shifts = getOperatorShiftsForDay(selectedTargetEntry, operatorName);
                        return (
                          <React.Fragment key={operatorName}>
                            {shifts.map(shift => (
                              <SelectItem key={`${operatorName}-${shift}`} value={`${operatorName}-${shift}`} className="py-3">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-success/20 flex items-center justify-center">
                                    <Users className="w-4 h-4 text-success" />
                                  </div>
                                  <div>
                                    <div className="font-medium">{operatorName}</div>
                                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                                      {shift === 'meioPeriodo' ? (
                                        <span className="flex items-center gap-1 text-meioPeriodo">
                                          <Sun className="w-3 h-3" /> Meio Período
                                        </span>
                                      ) : (
                                        <span className="flex items-center gap-1 text-fechamento">
                                          <Sunset className="w-3 h-3" /> Fechamento
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </SelectItem>
                            ))}
                            {shifts.length === 2 && (
                              <SelectItem key={`${operatorName}-ambos`} value={`${operatorName}-ambos`} className="py-3">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-success/20 flex items-center justify-center">
                                    <Users className="w-4 h-4 text-success" />
                                  </div>
                                  <div>
                                    <div className="font-medium">{operatorName}</div>
                                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                                      <span className="flex items-center gap-1 text-meioPeriodo">
                                        <Sun className="w-3 h-3" /> MP
                                      </span>
                                      <span className="flex items-center gap-1 text-fechamento">
                                        <Sunset className="w-3 h-3" /> FE
                                      </span>
                                      <span className="ml-1 font-medium">Ambos</span>
                                    </div>
                                  </div>
                                </div>
                              </SelectItem>
                            )}
                          </React.Fragment>
                        );
                      })}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Confirmation Summary */}
          {selectedMyDay && selectedMyShift && selectedOperator && selectedTargetDay && selectedTargetShift && selectedMyEntry && selectedTargetEntry && (
            <div className="glass-card p-4 bg-muted/20 animate-fade-in">
              <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                <Check className="w-4 h-4 text-success" />
                Resumo da Troca
                {selectedMonth && <span className="text-muted-foreground"> - Original: {getMonthName(selectedMonth.month)}/{selectedMonth.year}</span>}
                {selectedTargetMonth && selectedTargetMonth.month !== selectedMonth?.month && <span className="text-muted-foreground"> | Troca: {getMonthName(selectedTargetMonth.month)}/{selectedTargetMonth.year}</span>}
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
                      ? <Sun className="w-3 h-3 text-meioPeriodo" />
                      : selectedTargetShift === 'fechamento'
                      ? <Sunset className="w-3 h-3 text-fechamento" />
                      : <><Sun className="w-3 h-3 text-meioPeriodo" /><Sunset className="w-3 h-3 text-fechamento" /></>
                    }
                    Turno de: {selectedOperator} {selectedTargetShift === 'ambos' ? '(Ambos)' : `(${getShiftLabel(selectedTargetShift)})`}
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
            {myRequests.map(request => {
              const getMonthFromRequest = (dateStr: string) => {
                const [day, month, year] = dateStr.split('/').map(Number);
                return `${getMonthName(month)}/${year}`;
              };
              
              return (
                <div key={request.id} className="flex items-center justify-between p-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium">{getMonthFromRequest(request.originalDate)}</span>
                      {getStatusBadge(request.status)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <div className="flex items-center gap-2 mb-1">
                        <span>Você cede:</span>
                        <span className="font-medium">Dia {request.originalDate.split('/')[0]} ({getShiftLabel(request.originalShift)})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>Assume:</span>
                        <span className="font-medium">Dia {request.targetDate.split('/')[0]} ({getShiftLabel(request.targetShift)}) de {request.targetName}</span>
                      </div>
                    </div>
                  </div>
                <div>
                  <div className="font-medium text-sm flex items-center gap-2 flex-wrap">
                    <span className="flex items-center gap-1 px-2 py-0.5 bg-primary/20 text-primary rounded text-xs">
                      Dia {request.originalDate.split('/')[0]}
                      {request.originalShift === 'meioPeriodo' ? (
                        <Sun className="w-3 h-3 text-meioPeriodo" />
                      ) : (
                        <Sunset className="w-3 h-3 text-fechamento" />
                      )}
                      <span className="font-bold">{request.originalShift === 'meioPeriodo' ? 'MP' : 'FE'}</span>
                    </span>
                    <ArrowRight className="w-3 h-3 text-muted-foreground" />
                    <span className="flex items-center gap-1 px-2 py-0.5 bg-success/20 text-success rounded text-xs">
                      Dia {request.targetDate?.split('/')[0] || '??'}
                      {request.targetShift === 'meioPeriodo' ? (
                        <Sun className="w-3 h-3 text-meioPeriodo" />
                      ) : (
                        <Sunset className="w-3 h-3 text-fechamento" />
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
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default SwapRequestView;

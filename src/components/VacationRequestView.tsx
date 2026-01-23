import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarIcon, Plane, Clock, CheckCircle, XCircle, AlertCircle, Users } from 'lucide-react';
import { format, addDays, differenceInDays, isAfter, isBefore, startOfDay, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { VacationRequest, VacationStatus, addVacationRequest, getVacationRequestsByOperator, getVacationRequests } from '@/data/scheduleData';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const VacationRequestView: React.FC = () => {
  const { currentUser } = useAuth();
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [reason, setReason] = useState('');
  const [myVacations, setMyVacations] = useState<VacationRequest[]>([]);
  const [approvedVacations, setApprovedVacations] = useState<VacationRequest[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [selectedDays, setSelectedDays] = useState<number | null>(null);
  const [showFullCalendar, setShowFullCalendar] = useState(false);

  useEffect(() => {
    // Load user's vacation requests
    loadMyVacations();
    loadApprovedVacations();
  }, []);

  const loadMyVacations = () => {
    if (!currentUser) return;
    
    try {
      const vacations = getVacationRequestsByOperator(currentUser.id);
      setMyVacations(vacations);
    } catch (error) {
      console.error('Error loading vacations:', error);
    }
  };

  const loadApprovedVacations = () => {
    try {
      const allVacations = getVacationRequests();
      const approved = allVacations.filter(v => v.status === 'approved');
      setApprovedVacations(approved);
    } catch (error) {
      console.error('Error loading approved vacations:', error);
    }
  };

  const calculateTotalDays = () => {
    if (!startDate || !endDate) return 0;
    return differenceInDays(endDate, startDate) + 1;
  };

  const handleDaysSelection = (days: number) => {
    setSelectedDays(days);
    // Reset dates when changing days selection
    setStartDate(undefined);
    setEndDate(undefined);
  };

  const getMaxEndDate = (start: Date): Date => {
    if (!selectedDays) return start;
    return addDays(start, selectedDays - 1);
  };

  const checkDateConflicts = (date: Date): { hasConflict: boolean; conflicts: VacationRequest[] } => {
    if (!currentUser) return { hasConflict: false, conflicts: [] };
    
    const dateStr = format(date, 'yyyy-MM-dd');
    const conflicts = approvedVacations.filter(vacation => {
      if (vacation.operatorId === currentUser.id) return false;
      
      const vacationStart = new Date(vacation.startDate);
      const vacationEnd = new Date(vacation.endDate);
      
      return date >= vacationStart && date <= vacationEnd;
    });
    
    return { hasConflict: conflicts.length > 0, conflicts };
  };

  const getVacationInfoForDate = (date: Date): VacationRequest[] => {
    return approvedVacations.filter(vacation => {
      const vacationStart = new Date(vacation.startDate);
      const vacationEnd = new Date(vacation.endDate);
      return date >= vacationStart && date <= vacationEnd;
    });
  };

  const getVacationColor = (vacation: VacationRequest): string => {
    // Generate consistent colors based on operator name
    const colors = [
      'bg-blue-100 text-blue-800 border-blue-300',
      'bg-green-100 text-green-800 border-green-300',
      'bg-purple-100 text-purple-800 border-purple-300',
      'bg-orange-100 text-orange-800 border-orange-300',
      'bg-pink-100 text-pink-800 border-pink-300',
      'bg-teal-100 text-teal-800 border-teal-300',
      'bg-indigo-100 text-indigo-800 border-indigo-300',
      'bg-yellow-100 text-yellow-800 border-yellow-300',
    ];
    
    const hash = vacation.operatorName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  const isDateDisabled = (date: Date): boolean => {
    if (isBefore(date, startOfDay(new Date()))) return true;
    
    const { hasConflict } = checkDateConflicts(date);
    if (hasConflict) return true;
    
    // Limit selection based on selected days
    if (startDate && selectedDays) {
      const maxDate = getMaxEndDate(startDate);
      return isAfter(date, maxDate);
    }
    
    return false;
  };

  const getDateClassName = (date: Date): string => {
    const { hasConflict } = checkDateConflicts(date);
    
    if (hasConflict) {
      return 'bg-destructive/10 text-destructive border-destructive/30 line-through';
    }
    
    return '';
  };

  const getStatusBadge = (status: VacationStatus) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">
            <Clock className="w-3 h-3 mr-1" />
            Pendente
          </Badge>
        );
      case 'approved':
        return (
          <Badge variant="outline" className="bg-success/10 text-success border-success/20">
            <CheckCircle className="w-3 h-3 mr-1" />
            Aprovado
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">
            <XCircle className="w-3 h-3 mr-1" />
            Rejeitado
          </Badge>
        );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) {
      toast.error('Usuário não autenticado');
      return;
    }

    if (!selectedDays) {
      toast.error('Selecione a quantidade de dias de férias');
      return;
    }

    if (!startDate || !endDate) {
      toast.error('Selecione as datas de início e fim');
      return;
    }

    if (isBefore(endDate, startDate)) {
      toast.error('A data de fim deve ser posterior à data de início');
      return;
    }

    if (isBefore(startDate, startOfDay(new Date()))) {
      toast.error('A data de início não pode ser no passado');
      return;
    }

    // Verify selected days matches the range
    const actualDays = calculateTotalDays();
    if (actualDays !== selectedDays) {
      toast.error(`Selecione exatamente ${selectedDays} dias (selecionados: ${actualDays})`);
      return;
    }

    // Check for conflicts with approved vacations
    const conflicts: string[] = [];
    let currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const { conflicts: dateConflicts } = checkDateConflicts(currentDate);
      
      dateConflicts.forEach(conflict => {
        conflicts.push(`${format(currentDate, 'dd/MM/yyyy')} - ${conflict.operatorName}`);
      });
      
      currentDate = addDays(currentDate, 1);
    }
    
    if (conflicts.length > 0) {
      toast.error(`Conflito com férias aprovadas: ${conflicts.join(', ')}`);
      return;
    }

    setIsSubmitting(true);

    try {
      const vacationRequest = addVacationRequest(
        currentUser.id,
        currentUser.name,
        format(startDate, 'yyyy-MM-dd'),
        format(endDate, 'yyyy-MM-dd'),
        reason || undefined
      );

      toast.success('Solicitação de férias enviada com sucesso!');
      
      // Reset form
      setSelectedDays(null);
      setStartDate(undefined);
      setEndDate(undefined);
      setReason('');
      setIsCalendarOpen(false);
      
      // Reload vacations
      loadMyVacations();
      
    } catch (error) {
      toast.error('Erro ao enviar solicitação de férias');
      console.error('Error submitting vacation:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (date: Date) => {
    return format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Full Calendar View */}
      <Card className="glass-card-elevated">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-primary" />
                Calendário de Férias
              </CardTitle>
              <CardDescription>
                Visualize todas as férias aprovadas da equipe
              </CardDescription>
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFullCalendar(!showFullCalendar)}
              className="flex items-center gap-2"
            >
              <CalendarIcon className="w-4 h-4" />
              {showFullCalendar ? 'Ocultar' : 'Mostrar'} Calendário
            </Button>
          </div>
        </CardHeader>
        
        {showFullCalendar && (
          <CardContent>
            <div className="space-y-4">
              {/* Legend */}
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-destructive/10 border border-destructive/30 line-through"></div>
                  <span className="text-muted-foreground">Indisponível (outras férias)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-blue-100 text-blue-800 border border-blue-300"></div>
                  <span className="text-muted-foreground">Férias aprovadas</span>
                </div>
              </div>

              {/* Calendar */}
              <div className="border border-border/50 rounded-lg p-4">
                <Calendar
                  mode="single"
                  locale={ptBR}
                  className="rounded-md"
                  modifiers={{
                    disabled: isDateDisabled,
                    vacation: (date) => getVacationInfoForDate(date).length > 0
                  }}
                  modifiersStyles={{
                    disabled: {
                      backgroundColor: 'hsl(var(--destructive) / 0.1)',
                      color: 'hsl(var(--destructive))',
                      border: '1px solid hsl(var(--destructive) / 0.3)',
                      textDecoration: 'line-through'
                    },
                    vacation: {
                      backgroundColor: 'hsl(var(--primary) / 0.1)',
                      border: '1px solid hsl(var(--primary) / 0.3)'
                    }
                  }}
                  components={{
                    DayContent: ({ date, displayMonth, activeModifiers, ...props }) => {
                      const vacations = getVacationInfoForDate(date);
                      const hasConflict = checkDateConflicts(date).hasConflict;
                      
                      return (
                        <div className="relative w-full h-full">
                          <div {...(props as any)} />
                          {vacations.length > 0 && !hasConflict && (
                            <div className="absolute bottom-0 left-0 right-0 flex flex-wrap gap-1 p-1">
                              {vacations.slice(0, 2).map((vacation, idx) => (
                                <div
                                  key={vacation.id}
                                  className={`w-2 h-2 rounded-full ${getVacationColor(vacation).split(' ')[0]}`}
                                  title={`${vacation.operatorName}: ${format(new Date(vacation.startDate), 'dd/MM')} a ${format(new Date(vacation.endDate), 'dd/MM')}`}
                                />
                              ))}
                              {vacations.length > 2 && (
                                <div className="w-2 h-2 rounded-full bg-gray-400" title={`+${vacations.length - 2} mais`} />
                              )}
                            </div>
                          )}
                        </div>
                      );
                    }
                  }}
                />
              </div>

              {/* Vacation Details */}
              {approvedVacations.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Férias Aprovadas:</h4>
                  <div className="grid gap-2">
                    {approvedVacations.map((vacation) => (
                      <div
                        key={vacation.id}
                        className={`flex items-center justify-between p-2 rounded-lg border ${getVacationColor(vacation)}`}
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-current opacity-60"></div>
                          <span className="font-medium text-sm">{vacation.operatorName}</span>
                        </div>
                        <div className="text-sm">
                          {format(new Date(vacation.startDate), "dd/MM")} - {format(new Date(vacation.endDate), "dd/MM/yyyy")}
                          <span className="ml-2 text-xs opacity-75">({vacation.totalDays} dias)</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Request Form */}
      <Card className="glass-card-elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plane className="w-5 h-5 text-primary" />
            Solicitar Férias
          </CardTitle>
          <CardDescription>
            Selecione no calendário o período de férias desejado
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Days Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Quantos dias de férias?</label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {[7, 10, 15, 20, 30].map((days) => (
                  <Button
                    key={days}
                    type="button"
                    variant={selectedDays === days ? "default" : "outline"}
                    onClick={() => handleDaysSelection(days)}
                    className="h-12"
                  >
                    {days} dias
                  </Button>
                ))}
              </div>
            </div>

            {/* Date Selection - Only show after days selection */}
            {selectedDays && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Data de Início</label>
                    <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {startDate ? formatDate(startDate) : "Selecione a data"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="range"
                          selected={{
                            from: startDate,
                            to: endDate
                          }}
                          onSelect={(range) => {
                            if (range?.from) {
                              setStartDate(range.from);
                              // Auto-calculate end date based on selected days
                              const autoEndDate = addDays(range.from, selectedDays - 1);
                              setEndDate(autoEndDate);
                              setIsCalendarOpen(false);
                            }
                          }}
                          disabled={isDateDisabled}
                          locale={ptBR}
                          modifiers={{
                            disabled: isDateDisabled,
                            booked: (date) => checkDateConflicts(date).hasConflict
                          }}
                          modifiersStyles={{
                            booked: {
                              backgroundColor: 'hsl(var(--destructive) / 0.1)',
                              color: 'hsl(var(--destructive))',
                              border: '1px solid hsl(var(--destructive) / 0.3)',
                              textDecoration: 'line-through'
                            }
                          }}
                        />
                        
                        {/* Conflict Legend */}
                        <div className="p-3 border-t border-border/50">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <div className="w-3 h-3 rounded bg-destructive/10 border border-destructive/30 line-through"></div>
                            <span>Dia indisponível (férias aprovadas)</span>
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Data de Fim</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                          disabled={!startDate}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {endDate ? formatDate(endDate) : "Selecione a data"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={endDate}
                          onSelect={(date) => {
                            if (date) {
                              setEndDate(date);
                            }
                          }}
                          disabled={(date) => {
                            if (!startDate) return true;
                            return isBefore(date, startDate) || isDateDisabled(date);
                          }}
                          locale={ptBR}
                          initialFocus
                        />
                        
                        {/* Conflict Legend */}
                        <div className="p-3 border-t border-border/50">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <div className="w-3 h-3 rounded bg-destructive/10 border border-destructive/30 line-through"></div>
                            <span>Dia indisponível (férias aprovadas)</span>
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                {/* Total Days Display */}
                {startDate && endDate && (
                  <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium">
                        Total de dias: <span className="text-primary">{calculateTotalDays()}</span>
                        {selectedDays && calculateTotalDays() !== selectedDays && (
                          <span className="text-warning ml-2">
                            (esperado: {selectedDays})
                          </span>
                        )}
                      </span>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Reason */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Motivo (opcional)</label>
              <Textarea
                placeholder="Descreva o motivo das férias (opcional)"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
              />
            </div>

            {/* Submit Button */}
            <Button 
              type="submit" 
              className="w-full"
              disabled={isSubmitting || !selectedDays || !startDate || !endDate}
            >
              {isSubmitting ? 'Enviando...' : 'Enviar Solicitação'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* My Vacations */}
      <Card className="glass-card-elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-primary" />
            Minhas Solicitações de Férias
          </CardTitle>
          <CardDescription>
            Acompanhe o status das suas solicitações
          </CardDescription>
        </CardHeader>
        <CardContent>
          {myVacations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Plane className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma solicitação de férias encontrada</p>
            </div>
          ) : (
            <div className="space-y-4">
              {myVacations.map((vacation) => (
                <div key={vacation.id} className="p-4 border border-border/50 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {format(new Date(vacation.startDate), "dd 'de' MMMM", { locale: ptBR })} - {format(new Date(vacation.endDate), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                        </span>
                        {getStatusBadge(vacation.status)}
                      </div>
                      
                      <div className="text-sm text-muted-foreground">
                        <span>{vacation.totalDays} dia{vacation.totalDays > 1 ? 's' : ''}</span>
                        <span className="mx-2">•</span>
                        <span>Solicitado em {format(new Date(vacation.requestedAt), "dd/MM/yyyy", { locale: ptBR })}</span>
                      </div>

                      {vacation.reason && (
                        <div className="text-sm">
                          <span className="font-medium">Motivo:</span> {vacation.reason}
                        </div>
                      )}

                      {vacation.status === 'approved' && vacation.approvedBy && (
                        <div className="text-sm text-success">
                          <span className="font-medium">Aprovado por:</span> {vacation.approvedBy}
                          {vacation.approvedAt && (
                            <>
                              <span className="mx-2">•</span>
                              <span>{format(new Date(vacation.approvedAt), "dd/MM/yyyy", { locale: ptBR })}</span>
                            </>
                          )}
                        </div>
                      )}

                      {vacation.status === 'rejected' && vacation.rejectionReason && (
                        <div className="text-sm text-destructive">
                          <span className="font-medium">Motivo da rejeição:</span> {vacation.rejectionReason}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VacationRequestView;

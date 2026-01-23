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

  const isDateDisabled = (date: Date): boolean => {
    if (isBefore(date, startOfDay(new Date()))) return true;
    
    const { hasConflict } = checkDateConflicts(date);
    return hasConflict;
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

    const totalDays = calculateTotalDays();
    if (totalDays < 1) {
      toast.error('Selecione pelo menos 1 dia de férias');
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
            {/* Date Selection */}
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
                          if (range.to) {
                            setEndDate(range.to);
                            setIsCalendarOpen(false);
                          }
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
                <Input
                  type="date"
                  value={endDate ? format(endDate, 'yyyy-MM-dd') : ''}
                  onChange={(e) => {
                    if (e.target.value) {
                      setEndDate(new Date(e.target.value));
                    } else {
                      setEndDate(undefined);
                    }
                  }}
                  min={startDate ? format(startDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd')}
                />
              </div>
            </div>

            {/* Total Days Display */}
            {startDate && endDate && (
              <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">
                    Total de dias: <span className="text-primary">{calculateTotalDays()}</span>
                  </span>
                </div>
              </div>
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
              disabled={isSubmitting || !startDate || !endDate}
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

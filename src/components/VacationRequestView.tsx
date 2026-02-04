import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarIcon, Plane, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { format, addDays, differenceInDays, isAfter, isBefore, startOfDay, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { VacationStatus } from '@/data/scheduleData';
import { useAuth } from '@/contexts/AuthContext';
import { useVacation } from '@/contexts/VacationContext';
import { toast } from 'sonner';

const VacationRequestView: React.FC = () => {
  const { currentUser } = useAuth();
  const { 
    createVacationRequest, 
    getVacationsByOperator, 
    isDateRangeAvailable,
    vacationRequests,
    loading 
  } = useVacation();
  
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [selectedDays, setSelectedDays] = useState<number | null>(null);

  // Load user's vacation requests
  const myVacations = currentUser ? getVacationsByOperator(currentUser.id) : [];
  const approvedVacations = vacationRequests.filter(v => v.status === 'approved');

  const calculateTotalDays = () => {
    if (!startDate || !endDate) return 0;
    return differenceInDays(endDate, startDate) + 1;
  };

  const handleDaysSelection = (days: number) => {
    setSelectedDays(days);
    if (startDate) {
      const newEndDate = addDays(startDate, days - 1);
      setEndDate(newEndDate);
    }
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;
    
    const today = startOfDay(new Date());
    if (isBefore(date, today)) {
      toast.error('Não é possível selecionar datas no passado');
      return;
    }
    
    setStartDate(date);
    if (selectedDays) {
      const newEndDate = addDays(date, selectedDays - 1);
      setEndDate(newEndDate);
    }
  };

  const isDateUnavailable = (date: Date) => {
    if (!currentUser) return false;
    
    const dateStr = format(date, 'yyyy-MM-dd');
    
    // Check if date is in approved vacations
    return approvedVacations.some(vacation => {
      const start = new Date(vacation.startDate);
      const end = new Date(vacation.endDate);
      return date >= start && date <= end;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser || !startDate || !endDate) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Check if date range is available
      const startDateStr = format(startDate, 'yyyy-MM-dd');
      const endDateStr = format(endDate, 'yyyy-MM-dd');
      
      if (!isDateRangeAvailable(startDateStr, endDateStr)) {
        toast.error('Este período já possui férias aprovadas para outro operador');
        return;
      }

      // Create vacation request
      await createVacationRequest({
        operatorId: currentUser.id,
        operatorName: currentUser.name,
        startDate: startDateStr,
        endDate: endDateStr,
        totalDays: calculateTotalDays(),
        reason: reason || 'Férias',
        status: 'pending',
        month: startDate.getMonth() + 1,
        year: startDate.getFullYear()
      });

      toast.success('Solicitação de férias enviada com sucesso!');
      
      // Reset form
      setSelectedDays(null);
      setStartDate(undefined);
      setEndDate(undefined);
      setReason('');
      setIsCalendarOpen(false);
      
    } catch (error) {
      console.error('Error submitting vacation request:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao enviar solicitação');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: VacationStatus) => {
    switch (status) {
      case 'pending':
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-warning/20 text-warning">Pendente</span>;
      case 'approved':
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-success/20 text-success">Aprovada</span>;
      case 'rejected':
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-destructive/20 text-destructive">Rejeitada</span>;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="glass-card-elevated">
        <div className="p-6 border-b border-border/50">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Plane className="w-5 h-5 text-primary" />
            Solicitar Férias
          </h2>
          <p className="text-muted-foreground mt-1">
            Solicite seu período de férias para aprovação do administrador
          </p>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Date Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Data de Início</label>
                <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                      disabled={isSubmitting}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, 'PPP', { locale: ptBR }) : 'Selecione a data'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={handleDateSelect}
                      disabled={isDateUnavailable}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Data de Término</label>
                <div className="p-3 border rounded-md bg-muted/30">
                  {endDate ? format(endDate, 'PPP', { locale: ptBR }) : 'Selecione a data de início'}
                </div>
              </div>
            </div>

            {/* Days Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Quantidade de Dias</label>
              <div className="flex gap-2 flex-wrap">
                {[5, 7, 10, 15, 20, 30].map(days => (
                  <Button
                    key={days}
                    type="button"
                    variant={selectedDays === days ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleDaysSelection(days)}
                    disabled={isSubmitting}
                  >
                    {days} dias
                  </Button>
                ))}
              </div>
            </div>

            {/* Reason */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Motivo (Opcional)</label>
              <Textarea
                placeholder="Descreva o motivo das suas férias..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                disabled={isSubmitting}
                rows={3}
              />
            </div>

            {/* Submit Button */}
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isSubmitting || !startDate || !endDate}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Enviando...
                </>
              ) : (
                <>
                  <Plane className="w-4 h-4 mr-2" />
                  Enviar Solicitação
                </>
              )}
            </Button>
          </form>
        </div>
      </div>

      {/* My Vacation Requests */}
      <div className="glass-card-elevated">
        <div className="p-6 border-b border-border/50">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Minhas Solicitações
          </h3>
        </div>

        <div className="p-6">
          {myVacations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Plane className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Você ainda não solicitou férias</p>
            </div>
          ) : (
            <div className="space-y-4">
              {myVacations.map((vacation) => (
                <div key={vacation.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getStatusBadge(vacation.status)}
                        <span className="font-medium">{vacation.totalDays} dias</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">
                        {format(new Date(vacation.startDate), 'dd/MM/yyyy')} até {format(new Date(vacation.endDate), 'dd/MM/yyyy')}
                      </p>
                      {vacation.reason && (
                        <p className="text-sm">{vacation.reason}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Approved Vacations */}
      <div className="glass-card-elevated">
        <div className="p-6 border-b border-border/50">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-success" />
            Férias Aprovadas
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Períodos indisponíveis para novas solicitações
          </p>
        </div>

        <div className="p-6">
          {approvedVacations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Nenhuma férias aprovada no momento</p>
            </div>
          ) : (
            <div className="space-y-4">
              {approvedVacations.map((vacation) => (
                <div key={vacation.id} className="p-4 border rounded-lg bg-success/5 border-success/20">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getStatusBadge(vacation.status)}
                        <span className="font-medium">{vacation.operatorName}</span>
                        <span className="text-sm text-muted-foreground">({vacation.totalDays} dias)</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">
                        {format(new Date(vacation.startDate), 'dd/MM/yyyy')} até {format(new Date(vacation.endDate), 'dd/MM/yyyy')}
                      </p>
                      {vacation.approvedBy && (
                        <p className="text-xs text-muted-foreground">
                          Aprovado por {vacation.approvedBy}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VacationRequestView;

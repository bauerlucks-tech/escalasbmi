import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSwap } from '@/contexts/SwapContext';
import { getMonthName } from '@/data/scheduleData';
import { Button } from '@/components/ui/button';
import { Check, X, Bell, Calendar, User, Inbox, ArrowRight, CalendarDays } from 'lucide-react';
import { toast } from 'sonner';
import { format, parse, startOfMonth, getMonth, getYear, getDaysInMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const RequestsView: React.FC = () => {
  const { currentUser } = useAuth();
  const { getRequestsForMe, respondToSwap, swapRequests, currentSchedules } = useSwap();

  if (!currentUser) return null;

  const pendingRequests = getRequestsForMe(currentUser.name);
  const allMyIncoming = swapRequests.filter(r => r.targetName === currentUser.name);

  const getMiniCalendar = (dateStr: string, shift: string, isOriginal: boolean) => {
    const [day, month, year] = dateStr.split('/').map(Number);
    const date = new Date(year, month - 1, day);
    const monthStart = startOfMonth(date);
    const monthEnd = new Date(year, month - 1, getDaysInMonth(date));
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
    const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
    
    // Obter escalas do usuário para este mês
    const monthSchedule = currentSchedules.find(s => s.month === month && s.year === year);
    const userSchedule = monthSchedule?.entries || [];
    
    return (
      <div className="bg-muted/30 border border-border/30 rounded-lg p-3">
        <div className="flex items-center gap-2 mb-2">
          <CalendarDays className="w-4 h-4 text-muted-foreground" />
          <div className="text-xs font-medium text-muted-foreground">
            {format(monthStart, 'MMMM yyyy', { locale: ptBR })}
          </div>
        </div>
        
        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 text-xs">
          {/* Week headers */}
          {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((day, i) => (
            <div key={i} className="text-center text-muted-foreground font-medium p-1">
              {day}
            </div>
          ))}
          
          {/* Calendar days */}
          {calendarDays.map((calendarDay, index) => {
            const isCurrentMonth = isSameMonth(calendarDay, date);
            const isTargetDay = isSameDay(calendarDay, date);
            const dayNumber = calendarDay.getDate();
            const dayStr = `${dayNumber.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year}`;
            
            // Verificar se usuário está escalado neste dia
            const daySchedule = userSchedule.find(entry => entry.date === dayStr);
            const hasMeioPeriodo = daySchedule?.meioPeriodo === currentUser.name;
            const hasFechamento = daySchedule?.fechamento === currentUser.name;
            const isScheduled = hasMeioPeriodo || hasFechamento;
            
            return (
              <div
                key={index}
                className={`
                  text-center p-1 rounded
                  ${!isCurrentMonth ? 'text-muted-foreground/30' : 'text-muted-foreground'}
                  ${isTargetDay ? (
                    isOriginal 
                      ? 'bg-primary/20 text-primary font-bold' 
                      : 'bg-success/20 text-success font-bold'
                  ) : ''}
                  ${isScheduled && !isTargetDay ? 'bg-secondary/20 text-secondary font-medium' : ''}
                `}
              >
                {dayNumber}
                {isTargetDay && (
                  <div className="text-xs mt-1">
                    {shift === 'meioPeriodo' ? 'MP' : shift === 'fechamento' ? 'FE' : 'AB'}
                  </div>
                )}
                {isScheduled && !isTargetDay && (
                  <div className="text-xs mt-1">
                    {hasMeioPeriodo && hasFechamento ? 'AB' : hasMeioPeriodo ? 'MP' : 'FE'}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        <div className="mt-2 text-xs text-muted-foreground border-t border-border/20 pt-2">
          <div className="flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full ${
              isOriginal ? 'bg-primary/20' : 'bg-success/20'
            }`}></span>
            <span>Dia {day} ({shift === 'meioPeriodo' ? 'MP' : shift === 'fechamento' ? 'FE' : 'AB'})</span>
          </div>
        </div>
      </div>
    );
  };

  const handleRespond = async (requestId: string, accept: boolean) => {
    await respondToSwap(requestId, accept);
    toast.success(accept ? 'Troca aceita! Aguardando aprovação do administrador.' : 'Troca recusada');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="badge-pending">Pendente</span>;
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
      {/* Pending Requests */}
      <div className="glass-card-elevated overflow-hidden">
        <div className="p-4 border-b border-border/50 flex items-center justify-between">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            Solicitações Pendentes
          </h2>
          {pendingRequests.length > 0 && (
            <span className="px-2 py-1 rounded-full bg-primary text-primary-foreground text-xs font-bold">
              {pendingRequests.length}
            </span>
          )}
        </div>

        {pendingRequests.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <Inbox className="w-10 h-10 mx-auto mb-3 opacity-50" />
            <p>Nenhuma solicitação pendente no momento.</p>
          </div>
        ) : (
          <div className="divide-y divide-border/30">
            {pendingRequests.map(request => (
              <div key={request.id} className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                        <User className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <span className="font-semibold text-primary">{request.requesterName}</span>
                        <span className="text-sm text-muted-foreground ml-2">
                          quer trocar escala com você
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground ml-10">
                      <Calendar className="w-4 h-4" />
                      <span>Vou ceder: Dia {request.originalDate.split('/')[0]} de {getMonthName(parseInt(request.originalDate.split('/')[1]))} ({request.originalShift === 'meioPeriodo' ? 'MP' : 'FE'})</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground ml-10">
                      <ArrowRight className="w-4 h-4" />
                      <span>Vou assumir: Dia {request.targetDate.split('/')[0]} de {getMonthName(parseInt(request.targetDate.split('/')[1]))} ({request.targetShift === 'meioPeriodo' ? 'MP' : 'FE'})</span>
                    </div>
                    
                    {/* Mini Calendar View */}
                    <div className="flex items-center gap-3 ml-10 mt-2">
                      {getMiniCalendar(request.originalDate, request.originalShift, true)}
                      <ArrowRight className="w-4 h-4 text-muted-foreground" />
                      {getMiniCalendar(request.targetDate, request.targetShift, false)}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleRespond(request.id, true)}
                      className="bg-success hover:bg-success/90"
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Aceitar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRespond(request.id, false)}
                      className="border-destructive/50 text-destructive hover:bg-destructive/10"
                    >
                      <X className="w-4 h-4 mr-1" />
                      Recusar
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* History */}
      <div className="glass-card overflow-hidden">
        <div className="p-4 border-b border-border/50">
          <h2 className="text-lg font-semibold">Histórico de Solicitações Recebidas</h2>
        </div>

        {allMyIncoming.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <p>Nenhuma solicitação recebida ainda.</p>
          </div>
        ) : (
          <div className="divide-y divide-border/30">
            {allMyIncoming.filter(r => r.status !== 'pending').map(request => (
              <div key={request.id} className="flex items-center justify-between p-4">
                <div>
                  <div className="font-medium text-sm">
                    <span className="text-primary">{request.requesterName}</span> solicitou troca
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    Data: {request.originalDate}
                  </div>
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

export default RequestsView;

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSwap } from '@/contexts/SwapContext';
import { scheduleData, ScheduleEntry } from '@/data/scheduleData';
import { Button } from '@/components/ui/button';
import { ArrowLeftRight, Calendar, User, AlertCircle, Check, X, Sun, Sunset, Clock, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { parse, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const SwapRequestView: React.FC = () => {
  const { currentUser, users } = useAuth();
  const { createSwapRequest, getMyRequests } = useSwap();
  const [selectedMyDay, setSelectedMyDay] = useState<number | null>(null);
  const [selectedTargetDay, setSelectedTargetDay] = useState<number | null>(null);
  const [step, setStep] = useState<'select-my-day' | 'select-target-day'>('select-my-day');

  if (!currentUser) return null;

  const myRequests = getMyRequests(currentUser.id);

  // Calendar setup
  const daysInMonth = 31;
  const firstDayOfMonth = new Date(2026, 0, 1).getDay();
  const calendarDays = Array.from({ length: firstDayOfMonth }, () => null).concat(
    Array.from({ length: daysInMonth }, (_, i) => i + 1)
  );
  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  const parseDate = (dateStr: string) => parse(dateStr, 'dd/MM/yyyy', new Date());

  const getScheduleForDay = (day: number): ScheduleEntry | undefined => {
    const dateStr = `${String(day).padStart(2, '0')}/01/2026`;
    return scheduleData.find(s => s.date === dateStr);
  };

  const isMyShift = (day: number): boolean => {
    const entry = getScheduleForDay(day);
    if (!entry) return false;
    return entry.meioPeriodo === currentUser.name || entry.fechamento === currentUser.name;
  };

  const isNotMyShift = (day: number): boolean => {
    const entry = getScheduleForDay(day);
    if (!entry) return false;
    return entry.meioPeriodo !== currentUser.name && entry.fechamento !== currentUser.name;
  };

  const getColleagueForTargetDay = (day: number): string | null => {
    const entry = getScheduleForDay(day);
    if (!entry) return null;
    // Return any colleague working that day
    if (entry.meioPeriodo !== currentUser.name) return entry.meioPeriodo;
    if (entry.fechamento !== currentUser.name) return entry.fechamento;
    return null;
  };

  const getFirstName = (name: string) => name.split(' ')[0];

  const selectedMyEntry = selectedMyDay ? getScheduleForDay(selectedMyDay) : null;
  const selectedTargetEntry = selectedTargetDay ? getScheduleForDay(selectedTargetDay) : null;

  const handleSelectMyDay = (day: number) => {
    if (isMyShift(day)) {
      setSelectedMyDay(day);
      setSelectedTargetDay(null);
      setStep('select-target-day');
    }
  };

  const handleSelectTargetDay = (day: number) => {
    if (isNotMyShift(day) && day !== selectedMyDay) {
      setSelectedTargetDay(day);
    }
  };

  const handleSubmit = () => {
    if (!selectedMyDay || !selectedTargetDay) {
      toast.error('Selecione os dois dias para a troca');
      return;
    }

    const targetEntry = getScheduleForDay(selectedTargetDay);
    if (!targetEntry) {
      toast.error('Dia de destino não encontrado');
      return;
    }

    // Find the colleague working on the target day
    const colleagueName = targetEntry.meioPeriodo !== currentUser.name 
      ? targetEntry.meioPeriodo 
      : targetEntry.fechamento;
    
    const targetUser = users.find(u => u.name === colleagueName);
    if (!targetUser) {
      toast.error('Usuário não encontrado');
      return;
    }

    const myDateStr = `${String(selectedMyDay).padStart(2, '0')}/01/2026`;
    const targetDateStr = `${String(selectedTargetDay).padStart(2, '0')}/01/2026`;

    createSwapRequest({
      requesterId: currentUser.id,
      requesterName: currentUser.name,
      targetId: targetUser.id,
      targetName: colleagueName,
      originalDate: myDateStr,
      targetDate: targetDateStr,
      status: 'pending',
    });

    toast.success('Solicitação de troca enviada!');
    setSelectedMyDay(null);
    setSelectedTargetDay(null);
    setStep('select-my-day');
  };

  const handleReset = () => {
    setSelectedMyDay(null);
    setSelectedTargetDay(null);
    setStep('select-my-day');
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
      {/* Instructions */}
      <div className="glass-card p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
            <ArrowLeftRight className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">Solicitar Troca de Dia</h3>
            <p className="text-xs text-muted-foreground">
              {step === 'select-my-day' 
                ? '1. Selecione um dia que você está escalado (destacado em verde)'
                : '2. Agora selecione o dia que você deseja trabalhar no lugar'
              }
            </p>
          </div>
        </div>

        {/* Selection Summary */}
        {selectedMyDay && (
          <div className="mt-4 p-3 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Meu dia:</span>
                <span className="px-2 py-1 bg-primary/20 text-primary rounded font-medium text-sm">
                  {selectedMyDay}/01 - {selectedMyEntry?.dayOfWeek}
                </span>
              </div>
              {selectedTargetDay && (
                <>
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Trocar para:</span>
                    <span className="px-2 py-1 bg-secondary/20 text-secondary rounded font-medium text-sm">
                      {selectedTargetDay}/01 - {selectedTargetEntry?.dayOfWeek}
                    </span>
                  </div>
                </>
              )}
              <Button variant="ghost" size="sm" onClick={handleReset} className="ml-auto">
                <X className="w-4 h-4 mr-1" />
                Limpar
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Calendar with full view like main page */}
      <div className="glass-card-elevated overflow-hidden">
        <div className="p-4 border-b border-border/50 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Janeiro 2026
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              {step === 'select-my-day' 
                ? 'Clique em um dia que você trabalha para iniciar a troca'
                : 'Clique em um dia que você NÃO trabalha para trocar'
              }
            </p>
          </div>
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

          {/* Calendar grid with names */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, index) => {
              if (day === null) {
                return <div key={`empty-${index}`} className="min-h-[80px]" />;
              }

              const myShift = isMyShift(day);
              const notMyShift = isNotMyShift(day);
              const entry = getScheduleForDay(day);
              const isSelectedMy = selectedMyDay === day;
              const isSelectedTarget = selectedTargetDay === day;
              const isWeekend = index % 7 === 0 || index % 7 === 6;

              // Determine clickability based on step
              const isClickable = step === 'select-my-day' 
                ? myShift 
                : (notMyShift && day !== selectedMyDay);

              return (
                <button
                  key={day}
                  onClick={() => {
                    if (step === 'select-my-day') {
                      handleSelectMyDay(day);
                    } else {
                      handleSelectTargetDay(day);
                    }
                  }}
                  disabled={!isClickable}
                  className={`
                    min-h-[80px] rounded-lg p-1.5 flex flex-col
                    transition-all relative
                    ${isClickable 
                      ? 'cursor-pointer hover:scale-[1.02]' 
                      : 'cursor-not-allowed opacity-50'
                    }
                    ${isSelectedMy 
                      ? 'bg-primary ring-2 ring-primary ring-offset-2 ring-offset-background' 
                      : isSelectedTarget
                        ? 'bg-secondary ring-2 ring-secondary ring-offset-2 ring-offset-background'
                        : myShift && step === 'select-my-day'
                          ? 'bg-gradient-to-br from-primary/30 to-primary/10 border-2 border-primary/60 hover:border-primary' 
                          : notMyShift && step === 'select-target-day'
                            ? 'bg-gradient-to-br from-secondary/30 to-secondary/10 border-2 border-secondary/60 hover:border-secondary'
                            : 'bg-muted/30 border border-border/30'
                    }
                    ${isWeekend && !myShift && !isSelectedTarget ? 'bg-muted/50' : ''}
                  `}
                >
                  <span className={`
                    text-xs font-bold mb-1
                    ${isSelectedMy || isSelectedTarget ? 'text-white' : myShift ? 'text-primary' : 'text-muted-foreground'}
                  `}>
                    {day}
                  </span>
                  
                  {entry && (
                    <div className="flex flex-col gap-0.5 flex-1">
                      <div className={`
                        text-[10px] px-1 py-0.5 rounded truncate
                        ${isSelectedMy || isSelectedTarget
                          ? 'bg-white/20 text-white'
                          : entry.meioPeriodo === currentUser?.name 
                            ? 'bg-secondary text-secondary-foreground font-bold' 
                            : 'bg-secondary/20 text-secondary'
                        }
                      `}>
                        {getFirstName(entry.meioPeriodo)}
                      </div>
                      <div className={`
                        text-[10px] px-1 py-0.5 rounded truncate
                        ${isSelectedMy || isSelectedTarget
                          ? 'bg-white/20 text-white'
                          : entry.fechamento === currentUser?.name 
                            ? 'bg-warning text-warning-foreground font-bold' 
                            : 'bg-warning/20 text-warning'
                        }
                      `}>
                        {getFirstName(entry.fechamento)}
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Selected Days Details */}
      {selectedMyDay && selectedTargetDay && selectedMyEntry && selectedTargetEntry && (
        <div className="glass-card-elevated overflow-hidden animate-fade-in">
          <div className="p-4 border-b border-border/50">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <ArrowLeftRight className="w-5 h-5 text-primary" />
              Confirmar Troca de Dias
            </h2>
          </div>

          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              {/* My Day */}
              <div className="p-4 rounded-xl bg-primary/10 border-2 border-primary/50">
                <div className="text-xs text-muted-foreground mb-2">Seu dia (vai ceder)</div>
                <div className="text-2xl font-bold text-primary">{selectedMyDay}/01</div>
                <div className="text-sm text-muted-foreground">{selectedMyEntry.dayOfWeek}</div>
                <div className="mt-3 space-y-1">
                  <div className="flex items-center gap-2 text-xs">
                    <Sun className="w-3 h-3 text-secondary" />
                    <span className={selectedMyEntry.meioPeriodo === currentUser.name ? 'font-bold text-secondary' : ''}>
                      {selectedMyEntry.meioPeriodo}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <Sunset className="w-3 h-3 text-warning" />
                    <span className={selectedMyEntry.fechamento === currentUser.name ? 'font-bold text-warning' : ''}>
                      {selectedMyEntry.fechamento}
                    </span>
                  </div>
                </div>
              </div>

              {/* Arrow */}
              <div className="flex justify-center">
                <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center">
                  <ArrowLeftRight className="w-6 h-6 text-muted-foreground" />
                </div>
              </div>

              {/* Target Day */}
              <div className="p-4 rounded-xl bg-secondary/10 border-2 border-secondary/50">
                <div className="text-xs text-muted-foreground mb-2">Dia desejado (vai assumir)</div>
                <div className="text-2xl font-bold text-secondary">{selectedTargetDay}/01</div>
                <div className="text-sm text-muted-foreground">{selectedTargetEntry.dayOfWeek}</div>
                <div className="mt-3 space-y-1">
                  <div className="flex items-center gap-2 text-xs">
                    <Sun className="w-3 h-3 text-secondary" />
                    <span>{selectedTargetEntry.meioPeriodo}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <Sunset className="w-3 h-3 text-warning" />
                    <span>{selectedTargetEntry.fechamento}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 p-3 bg-muted/30 rounded-lg text-sm">
              <p className="text-muted-foreground">
                Você está solicitando trocar seu dia <strong className="text-primary">{selectedMyDay}/01</strong> pelo dia <strong className="text-secondary">{selectedTargetDay}/01</strong>.
                {' '}O colega <strong>{selectedTargetEntry.meioPeriodo !== currentUser.name ? selectedTargetEntry.meioPeriodo : selectedTargetEntry.fechamento}</strong> será notificado e precisará aceitar a troca.
              </p>
            </div>

            <div className="flex gap-2 mt-4">
              <Button 
                onClick={handleSubmit}
                className="flex-1 bg-primary hover:bg-primary/90 glow-primary"
              >
                <ArrowLeftRight className="w-4 h-4 mr-2" />
                Solicitar Troca
              </Button>
              <Button variant="outline" onClick={handleReset}>
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* My Requests History */}
      <div className="glass-card overflow-hidden">
        <div className="p-4 border-b border-border/50">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Minhas Solicitações
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Fluxo: Solicitação → Aceite do colega → Aprovação do administrador
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
                  <div className="font-medium text-sm">
                    Dia {request.originalDate} <ArrowRight className="w-3 h-3 inline mx-1" /> {request.targetDate}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    Troca com: <span className="text-primary">{request.targetName}</span>
                  </div>
                  {request.adminApprovedBy && (
                    <div className="text-xs text-success mt-0.5">
                      Aprovado por: {request.adminApprovedBy}
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
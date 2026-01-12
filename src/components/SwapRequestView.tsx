import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSwap } from '@/contexts/SwapContext';
import { scheduleData, ScheduleEntry } from '@/data/scheduleData';
import { Button } from '@/components/ui/button';
import { ArrowLeftRight, Calendar, User, AlertCircle, Check, X, Sun, Moon } from 'lucide-react';
import { toast } from 'sonner';
import { parse, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const SwapRequestView: React.FC = () => {
  const { currentUser, users } = useAuth();
  const { createSwapRequest, getMyRequests } = useSwap();
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedColleague, setSelectedColleague] = useState<string | null>(null);

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
    return entry.shift1 === currentUser.name || entry.shift2 === currentUser.name;
  };

  const getColleaguesForDay = (day: number): string[] => {
    const entry = getScheduleForDay(day);
    if (!entry) return [];
    const colleagues: string[] = [];
    if (entry.shift1 !== currentUser.name && entry.shift1) colleagues.push(entry.shift1);
    if (entry.shift2 !== currentUser.name && entry.shift2 && entry.shift2 !== entry.shift1) {
      colleagues.push(entry.shift2);
    }
    // Add colleague if they're on the same shift
    if (entry.shift1 === currentUser.name && entry.shift2 !== currentUser.name) {
      if (!colleagues.includes(entry.shift2)) colleagues.push(entry.shift2);
    }
    if (entry.shift2 === currentUser.name && entry.shift1 !== currentUser.name) {
      if (!colleagues.includes(entry.shift1)) colleagues.push(entry.shift1);
    }
    return [...new Set(colleagues)];
  };

  const selectedEntry = selectedDay ? getScheduleForDay(selectedDay) : null;
  const availableColleagues = selectedDay ? getColleaguesForDay(selectedDay) : [];

  const handleSubmit = () => {
    if (!selectedDay || !selectedColleague) {
      toast.error('Selecione a data e o colega para a troca');
      return;
    }

    const targetUser = users.find(u => u.name === selectedColleague);
    if (!targetUser) {
      toast.error('Usuário não encontrado');
      return;
    }

    const dateStr = `${String(selectedDay).padStart(2, '0')}/01/2026`;

    createSwapRequest({
      requesterId: currentUser.id,
      requesterName: currentUser.name,
      targetId: targetUser.id,
      targetName: selectedColleague,
      originalDate: dateStr,
      status: 'pending',
    });

    toast.success('Solicitação de troca enviada!');
    setSelectedDay(null);
    setSelectedColleague(null);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="badge-pending">Pendente</span>;
      case 'accepted':
        return <span className="badge-accepted">Aceita</span>;
      case 'rejected':
        return <span className="badge-rejected">Recusada</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calendar Selection */}
        <div className="glass-card-elevated overflow-hidden">
          <div className="p-4 border-b border-border/50">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Selecione o dia para trocar
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              Clique em um dia que você está escalado
            </p>
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
                  return <div key={`empty-${index}`} className="aspect-square" />;
                }

                const myShift = isMyShift(day);
                const entry = getScheduleForDay(day);
                const isSelected = selectedDay === day;

                return (
                  <button
                    key={day}
                    onClick={() => myShift && setSelectedDay(day)}
                    disabled={!myShift}
                    className={`
                      aspect-square rounded-lg p-1 flex flex-col items-center justify-center
                      transition-all relative
                      ${myShift 
                        ? 'cursor-pointer hover:scale-105' 
                        : 'cursor-not-allowed opacity-40'
                      }
                      ${isSelected 
                        ? 'bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2 ring-offset-background' 
                        : myShift 
                          ? 'bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 hover:border-primary' 
                          : 'bg-muted/30'
                      }
                    `}
                  >
                    <span className="text-sm font-medium">{day}</span>
                    {myShift && entry && (
                      <div className="flex gap-0.5 mt-0.5">
                        {entry.shift1 === currentUser.name && (
                          <Sun className="w-2.5 h-2.5 text-secondary" />
                        )}
                        {entry.shift2 === currentUser.name && (
                          <Moon className="w-2.5 h-2.5 text-warning" />
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Day Details & Colleague Selection */}
        <div className="glass-card-elevated overflow-hidden">
          <div className="p-4 border-b border-border/50">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              {selectedDay ? `Escalados em ${selectedDay}/01` : 'Detalhes do Dia'}
            </h2>
          </div>

          <div className="p-4">
            {!selectedDay ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Selecione um dia no calendário</p>
                <p className="text-xs mt-1">para ver quem está escalado</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Selected day info */}
                <div className="glass-card p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="text-2xl font-bold">{selectedDay}</div>
                      <div className="text-sm text-muted-foreground">
                        {selectedEntry?.dayOfWeek}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedDay(null);
                        setSelectedColleague(null);
                      }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  {selectedEntry && (
                    <div className="grid grid-cols-2 gap-3">
                      <div className={`
                        p-3 rounded-lg text-center
                        ${selectedEntry.shift1 === currentUser.name 
                          ? 'bg-secondary/20 ring-2 ring-secondary' 
                          : 'bg-muted/50'
                        }
                      `}>
                        <Sun className="w-5 h-5 mx-auto mb-1 text-secondary" />
                        <div className="text-xs text-muted-foreground">Turno 1</div>
                        <div className="font-semibold text-sm">{selectedEntry.shift1}</div>
                      </div>
                      <div className={`
                        p-3 rounded-lg text-center
                        ${selectedEntry.shift2 === currentUser.name 
                          ? 'bg-warning/20 ring-2 ring-warning' 
                          : 'bg-muted/50'
                        }
                      `}>
                        <Moon className="w-5 h-5 mx-auto mb-1 text-warning" />
                        <div className="text-xs text-muted-foreground">Turno 2</div>
                        <div className="font-semibold text-sm">{selectedEntry.shift2}</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Colleague Selection */}
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">
                    Trocar com qual colega?
                  </label>
                  <div className="grid gap-2">
                    {availableColleagues.length === 0 ? (
                      <div className="text-sm text-muted-foreground text-center py-4">
                        Você é o único escalado neste dia
                      </div>
                    ) : (
                      availableColleagues.map(colleague => (
                        <button
                          key={colleague}
                          onClick={() => setSelectedColleague(colleague)}
                          className={`
                            p-4 rounded-lg text-left transition-all flex items-center justify-between
                            ${selectedColleague === colleague 
                              ? 'bg-primary text-primary-foreground' 
                              : 'bg-muted/50 hover:bg-muted'
                            }
                          `}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`
                              w-10 h-10 rounded-full flex items-center justify-center
                              ${selectedColleague === colleague 
                                ? 'bg-primary-foreground/20' 
                                : 'bg-primary/20'
                              }
                            `}>
                              <User className={`w-5 h-5 ${selectedColleague === colleague ? '' : 'text-primary'}`} />
                            </div>
                            <span className="font-medium">{colleague}</span>
                          </div>
                          {selectedColleague === colleague && (
                            <Check className="w-5 h-5" />
                          )}
                        </button>
                      ))
                    )}
                  </div>
                </div>

                {/* Submit Button */}
                <Button 
                  onClick={handleSubmit}
                  className="w-full bg-primary hover:bg-primary/90 glow-primary"
                  disabled={!selectedColleague}
                >
                  <ArrowLeftRight className="w-4 h-4 mr-2" />
                  Solicitar Troca com {selectedColleague || '...'}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* My Requests History */}
      <div className="glass-card overflow-hidden">
        <div className="p-4 border-b border-border/50">
          <h2 className="text-lg font-semibold">Minhas Solicitações</h2>
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
                    Troca com <span className="text-primary">{request.targetName}</span>
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

export default SwapRequestView;

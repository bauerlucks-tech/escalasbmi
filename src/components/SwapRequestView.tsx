import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSwap } from '@/contexts/SwapContext';
import { scheduleData, ScheduleEntry } from '@/data/scheduleData';
import { Button } from '@/components/ui/button';
import { ArrowLeftRight, Calendar, User, AlertCircle, Check, X, Sun, Moon, Clock } from 'lucide-react';
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

  const getFirstName = (name: string) => name.split(' ')[0];

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
      {/* Calendar with full view like main page */}
      <div className="glass-card-elevated overflow-hidden">
        <div className="p-4 border-b border-border/50 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Janeiro 2026 - Selecione o dia para trocar
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              Clique em um dia que você está escalado (destacado)
            </p>
          </div>
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

          {/* Calendar grid with names */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, index) => {
              if (day === null) {
                return <div key={`empty-${index}`} className="min-h-[80px]" />;
              }

              const myShift = isMyShift(day);
              const entry = getScheduleForDay(day);
              const isSelected = selectedDay === day;
              const isWeekend = index % 7 === 0 || index % 7 === 6;

              return (
                <button
                  key={day}
                  onClick={() => myShift && setSelectedDay(day)}
                  disabled={!myShift}
                  className={`
                    min-h-[80px] rounded-lg p-1.5 flex flex-col
                    transition-all relative
                    ${myShift 
                      ? 'cursor-pointer hover:scale-[1.02]' 
                      : 'cursor-not-allowed opacity-50'
                    }
                    ${isSelected 
                      ? 'bg-primary ring-2 ring-primary ring-offset-2 ring-offset-background' 
                      : myShift 
                        ? 'bg-gradient-to-br from-primary/30 to-primary/10 border-2 border-primary/60 hover:border-primary' 
                        : 'bg-muted/30 border border-border/30'
                    }
                    ${isWeekend && !myShift ? 'bg-muted/50' : ''}
                  `}
                >
                  <span className={`
                    text-xs font-bold mb-1
                    ${isSelected ? 'text-primary-foreground' : myShift ? 'text-primary' : 'text-muted-foreground'}
                  `}>
                    {day}
                  </span>
                  
                  {entry && (
                    <div className="flex flex-col gap-0.5 flex-1">
                      <div className={`
                        text-[10px] px-1 py-0.5 rounded truncate
                        ${isSelected 
                          ? 'bg-primary-foreground/20 text-primary-foreground'
                          : entry.shift1 === currentUser?.name 
                            ? 'bg-secondary text-secondary-foreground font-bold' 
                            : 'bg-secondary/20 text-secondary'
                        }
                      `}>
                        {getFirstName(entry.shift1)}
                      </div>
                      <div className={`
                        text-[10px] px-1 py-0.5 rounded truncate
                        ${isSelected 
                          ? 'bg-primary-foreground/20 text-primary-foreground'
                          : entry.shift2 === currentUser?.name 
                            ? 'bg-warning text-warning-foreground font-bold' 
                            : 'bg-warning/20 text-warning'
                        }
                      `}>
                        {getFirstName(entry.shift2)}
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Selected Day Details */}
      {selectedDay && selectedEntry && (
        <div className="glass-card-elevated overflow-hidden animate-fade-in">
          <div className="p-4 border-b border-border/50 flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Dia {selectedDay}/01 - {selectedEntry.dayOfWeek}
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedDay(null);
                setSelectedColleague(null);
              }}
            >
              <X className="w-4 h-4 mr-1" />
              Fechar
            </Button>
          </div>

          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Dupla do dia */}
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-3">Dupla escalada neste dia:</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className={`
                    p-4 rounded-xl text-center
                    ${selectedEntry.shift1 === currentUser.name 
                      ? 'bg-secondary/30 ring-2 ring-secondary' 
                      : 'bg-muted/50'
                    }
                  `}>
                    <Sun className="w-8 h-8 mx-auto mb-2 text-secondary" />
                    <div className="text-xs text-muted-foreground mb-1">Turno 1</div>
                    <div className="font-bold text-lg">{selectedEntry.shift1}</div>
                    {selectedEntry.shift1 === currentUser.name && (
                      <div className="text-xs text-secondary mt-1">(Você)</div>
                    )}
                  </div>
                  <div className={`
                    p-4 rounded-xl text-center
                    ${selectedEntry.shift2 === currentUser.name 
                      ? 'bg-warning/30 ring-2 ring-warning' 
                      : 'bg-muted/50'
                    }
                  `}>
                    <Moon className="w-8 h-8 mx-auto mb-2 text-warning" />
                    <div className="text-xs text-muted-foreground mb-1">Turno 2</div>
                    <div className="font-bold text-lg">{selectedEntry.shift2}</div>
                    {selectedEntry.shift2 === currentUser.name && (
                      <div className="text-xs text-warning mt-1">(Você)</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Seleção de colega */}
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-3">Trocar com qual colega?</h3>
                <div className="space-y-2">
                  {availableColleagues.length === 0 ? (
                    <div className="text-sm text-muted-foreground text-center py-4 bg-muted/30 rounded-lg">
                      Você é o único escalado neste dia
                    </div>
                  ) : (
                    availableColleagues.map(colleague => (
                      <button
                        key={colleague}
                        onClick={() => setSelectedColleague(colleague)}
                        className={`
                          w-full p-4 rounded-lg text-left transition-all flex items-center justify-between
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
                          <div>
                            <span className="font-medium">{colleague}</span>
                            <div className={`text-xs ${selectedColleague === colleague ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                              {selectedEntry.shift1 === colleague ? 'Turno 1' : 'Turno 2'}
                            </div>
                          </div>
                        </div>
                        {selectedColleague === colleague && (
                          <Check className="w-5 h-5" />
                        )}
                      </button>
                    ))
                  )}
                </div>

                {availableColleagues.length > 0 && (
                  <Button 
                    onClick={handleSubmit}
                    className="w-full mt-4 bg-primary hover:bg-primary/90 glow-primary"
                    disabled={!selectedColleague}
                  >
                    <ArrowLeftRight className="w-4 h-4 mr-2" />
                    Solicitar Troca com {selectedColleague || '...'}
                  </Button>
                )}
              </div>
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
                    Troca com <span className="text-primary">{request.targetName}</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    Data: {request.originalDate}
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
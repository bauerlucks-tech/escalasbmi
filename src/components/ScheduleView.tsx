import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getEmployeeSchedule, scheduleData, ScheduleEntry } from '@/data/scheduleData';
import { Calendar, Clock, Sun, Moon, TrendingUp, Coffee, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, parse, isToday, isBefore, isAfter, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const ScheduleView: React.FC = () => {
  const { currentUser } = useAuth();
  
  if (!currentUser) return null;
  
  const mySchedule = getEmployeeSchedule(currentUser.name);
  const today = startOfDay(new Date());

  // Parse dates for comparison
  const parseDate = (dateStr: string) => parse(dateStr, 'dd/MM/yyyy', new Date());

  // Find last worked day and next off day
  const sortedSchedule = [...mySchedule].sort((a, b) => 
    parseDate(a.date).getTime() - parseDate(b.date).getTime()
  );

  const lastWorkedDay = sortedSchedule
    .filter(s => isBefore(parseDate(s.date), today) || isToday(parseDate(s.date)))
    .pop();

  const nextWorkDay = sortedSchedule
    .find(s => isAfter(parseDate(s.date), today));

  // Find days off (days not in schedule)
  const allDates = scheduleData.map(s => s.date);
  const myDates = new Set(mySchedule.map(s => s.date));
  const daysOff = allDates.filter(d => !myDates.has(d) && isAfter(parseDate(d), today));
  const nextDayOff = daysOff.length > 0 ? daysOff[0] : null;

  // Calendar setup
  const daysInMonth = 31;
  const firstDayOfMonth = new Date(2026, 0, 1).getDay(); // Thursday = 4
  const calendarDays = Array.from({ length: firstDayOfMonth }, () => null).concat(
    Array.from({ length: daysInMonth }, (_, i) => i + 1)
  );

  const getScheduleForDay = (day: number): ScheduleEntry | undefined => {
    const dateStr = `${String(day).padStart(2, '0')}/01/2026`;
    return scheduleData.find(s => s.date === dateStr);
  };

  const isMyShift = (day: number): { shift1: boolean; shift2: boolean } => {
    const entry = getScheduleForDay(day);
    if (!entry) return { shift1: false, shift2: false };
    return {
      shift1: entry.shift1 === currentUser.name,
      shift2: entry.shift2 === currentUser.name,
    };
  };

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card-elevated p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center">
              <Clock className="w-6 h-6 text-secondary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Último dia trabalhado</p>
              <p className="font-bold text-lg">
                {lastWorkedDay ? (
                  <>
                    {parseDate(lastWorkedDay.date).getDate()}
                    <span className="text-sm font-normal text-muted-foreground ml-1">
                      {format(parseDate(lastWorkedDay.date), 'EEEE', { locale: ptBR })}
                    </span>
                  </>
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="glass-card-elevated p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Próximo trabalho</p>
              <p className="font-bold text-lg">
                {nextWorkDay ? (
                  <>
                    {parseDate(nextWorkDay.date).getDate()}
                    <span className="text-sm font-normal text-muted-foreground ml-1">
                      {format(parseDate(nextWorkDay.date), 'EEEE', { locale: ptBR })}
                    </span>
                  </>
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="glass-card-elevated p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-success/20 flex items-center justify-center">
              <Coffee className="w-6 h-6 text-success" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Próxima folga</p>
              <p className="font-bold text-lg">
                {nextDayOff ? (
                  <>
                    {parseDate(nextDayOff).getDate()}
                    <span className="text-sm font-normal text-muted-foreground ml-1">
                      {format(parseDate(nextDayOff), 'EEEE', { locale: ptBR })}
                    </span>
                  </>
                ) : (
                  <span className="text-muted-foreground">Sem folgas</span>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar View */}
      <div className="glass-card-elevated overflow-hidden">
        <div className="p-4 border-b border-border/50 flex items-center justify-between">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Janeiro 2026
          </h2>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-secondary" />
              <span className="text-muted-foreground">Turno 1</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-warning" />
              <span className="text-muted-foreground">Turno 2</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-muted" />
              <span className="text-muted-foreground">Folga</span>
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
                return <div key={`empty-${index}`} className="min-h-[80px]" />;
              }

              const shifts = isMyShift(day);
              const hasWork = shifts.shift1 || shifts.shift2;
              const entry = getScheduleForDay(day);
              const isWeekend = index % 7 === 0 || index % 7 === 6;

              // Get first name only for display
              const getFirstName = (name: string) => name.split(' ')[0];

              return (
                <div
                  key={day}
                  className={`
                    min-h-[80px] rounded-lg p-1.5 flex flex-col
                    transition-all cursor-default relative
                    ${hasWork 
                      ? 'bg-gradient-to-br from-primary/20 to-primary/5 border-2 border-primary/50' 
                      : 'bg-muted/30 border border-border/30'
                    }
                    ${isWeekend && !hasWork ? 'bg-muted/50' : ''}
                  `}
                >
                  <span className={`
                    text-xs font-bold mb-1
                    ${hasWork ? 'text-primary' : 'text-muted-foreground'}
                  `}>
                    {day}
                  </span>
                  
                  {entry && (
                    <div className="flex flex-col gap-0.5 flex-1">
                      <div className={`
                        text-[10px] px-1 py-0.5 rounded truncate
                        ${entry.shift1 === currentUser?.name 
                          ? 'bg-secondary text-secondary-foreground font-bold' 
                          : 'bg-secondary/20 text-secondary'
                        }
                      `}>
                        {getFirstName(entry.shift1)}
                      </div>
                      <div className={`
                        text-[10px] px-1 py-0.5 rounded truncate
                        ${entry.shift2 === currentUser?.name 
                          ? 'bg-warning text-warning-foreground font-bold' 
                          : 'bg-warning/20 text-warning'
                        }
                      `}>
                        {getFirstName(entry.shift2)}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-card p-4 text-center">
          <div className="text-3xl font-bold text-primary">{mySchedule.length}</div>
          <div className="text-xs text-muted-foreground mt-1">Dias de Trabalho</div>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="text-3xl font-bold text-muted-foreground">
            {31 - mySchedule.length}
          </div>
          <div className="text-xs text-muted-foreground mt-1">Dias de Folga</div>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="text-3xl font-bold text-secondary">
            {mySchedule.filter(s => s.shift1 === currentUser.name).length}
          </div>
          <div className="text-xs text-muted-foreground mt-1">Turno 1</div>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="text-3xl font-bold text-warning">
            {mySchedule.filter(s => s.shift2 === currentUser.name).length}
          </div>
          <div className="text-xs text-muted-foreground mt-1">Turno 2</div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleView;

import React, { useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSwap } from '@/contexts/SwapContext';
import { getEmployeeSchedule, ScheduleEntry, getCurrentSchedules } from '@/data/scheduleData';
import { format, parse, isToday, isBefore, isAfter, startOfDay, getDate, getDaysInMonth, startOfMonth, addMonths, subMonths, getMonth, getYear, subDays, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const ScheduleView: React.FC = () => {
  const { currentUser, operators } = useAuth();
  const { scheduleData, currentSchedules, switchToSchedule } = useSwap();

  // State for viewing different months - sempre começa com o mês atual
  const [viewingMonth, setViewingMonth] = useState(() => startOfMonth(new Date()));

  // Get available months from current schedules
  const availableMonths = useMemo(() => {
    return currentSchedules.map(schedule => ({
      month: schedule.month,
      year: schedule.year,
      label: `${format(new Date(schedule.year, schedule.month - 1), 'MMMM yyyy', { locale: ptBR })}`,
      entries: schedule.entries
    }));
  }, [currentSchedules]);

  // Update viewing month when schedules change
  React.useEffect(() => {
    // Sempre manter o mês atual, mesmo que não tenha dados
    // O usuário pode escolher outro mês através do select
  }, [availableMonths, viewingMonth]);

  // Check if we're in the last week of the month
  const today = startOfDay(new Date());
  const currentDay = getDate(today);
  const daysInCurrentMonth = getDaysInMonth(today);
  const isLastWeek = currentDay > daysInCurrentMonth - 7;

  // Filter schedule data for the viewing month
  const viewingMonthData = useMemo(() => {
    const month = getMonth(viewingMonth) + 1; // getMonth returns 0-11
    const year = getYear(viewingMonth);

    // Find the schedule for this month
    const monthSchedule = currentSchedules.find(s => s.month === month && s.year === year);
    return monthSchedule ? monthSchedule.entries : [];
  }, [currentSchedules, viewingMonth]);

  // Calculate next and previous months
  const nextMonth = useMemo(() => addMonths(viewingMonth, 1), [viewingMonth]);
  const prevMonth = useMemo(() => subMonths(viewingMonth, 1), [viewingMonth]);

  // Check if next month has data
  const hasNextMonthData = useMemo(() => {
    const month = getMonth(nextMonth) + 1;
    const year = getYear(nextMonth);
    return currentSchedules.some(s => s.month === month && s.year === year);
  }, [currentSchedules, nextMonth]);

  // Check if previous month has data
  const hasPrevMonthData = useMemo(() => {
    const month = getMonth(prevMonth) + 1;
    const year = getYear(prevMonth);
    return currentSchedules.some(s => s.month === month && s.year === year);
  }, [currentSchedules, prevMonth]);

  if (!currentUser) return null;

  const mySchedule = viewingMonthData.filter(
    entry => entry.meioPeriodo === currentUser.name || entry.fechamento === currentUser.name
  );

  // Parse dates for comparison
  const parseDate = (dateStr: string) => parse(dateStr, 'dd/MM/yyyy', new Date());

  // Calculate yesterday, today, and tomorrow workers for RICARDO view
  const yesterday = subDays(today, 1);
  const tomorrow = addDays(today, 1);

  const getWorkersForDate = (date: Date) => {
    const dateStr = format(date, 'dd/MM/yyyy');
    const entry = viewingMonthData.find(s => s.date === dateStr);
    return entry ? { meioPeriodo: entry.meioPeriodo, fechamento: entry.fechamento } : null;
  };

  const yesterdayWorkers = getWorkersForDate(yesterday);
  const todayWorkers = getWorkersForDate(today);
  const tomorrowWorkers = getWorkersForDate(tomorrow);

  // Find last worked day and next off day (for regular users)
  const sortedSchedule = [...mySchedule].sort((a, b) =>
    parseDate(a.date).getTime() - parseDate(b.date).getTime()
  );

  // Get all available schedule data across all months
  const allScheduleData = useMemo(() => {
    const allData: ScheduleEntry[] = [];
    availableMonths.forEach(month => {
      allData.push(...month.entries);
    });
    return allData;
  }, [availableMonths]);

  // Get user's schedule across all months
  const myAllSchedule = allScheduleData.filter(
    entry => entry.meioPeriodo === currentUser.name || entry.fechamento === currentUser.name
  );

  // Sort all schedule data
  const sortedAllSchedule = [...myAllSchedule].sort((a, b) =>
    parseDate(a.date).getTime() - parseDate(b.date).getTime()
  );

  const lastWorkedDay = sortedAllSchedule
    .filter(s => isBefore(parseDate(s.date), today) || isToday(parseDate(s.date)))
    .pop();

  const nextWorkDay = sortedAllSchedule
    .find(s => isAfter(parseDate(s.date), today));

  // Find days off (days not in schedule) and calculate consecutive days off
  const allDates = viewingMonthData.map(s => s.date);
  const myDates = new Set(mySchedule.map(s => s.date));
  const daysOff = allDates.filter(d => !myDates.has(d) && isAfter(parseDate(d), today));
  const nextDayOff = daysOff.length > 0 ? daysOff[0] : null;

  // Calculate consecutive days off until next work day
  const calculateDaysOffUntilNextWork = () => {
    if (!nextDayOff) return { count: 0, nextWorkDate: null };

    let consecutiveDaysOff = 0;
    let currentDate = parseDate(nextDayOff);
    let nextWorkDate = null;

    // Get all available schedules to search across months
    const allSchedules = currentSchedules || [];

    // Count consecutive days off starting from next day off
    while (true) {
      const dateStr = format(currentDate, 'dd/MM/yyyy');
      const month = getMonth(currentDate) + 1;
      const year = getYear(currentDate);

      // Find schedule for current date across all available months
      const scheduleForMonth = allSchedules.find(s => s.month === month && s.year === year);
      let hasWork = false;

      if (scheduleForMonth) {
        const entry = scheduleForMonth.entries.find(e => e.date === dateStr);
        hasWork = entry && (entry.meioPeriodo === currentUser.name || entry.fechamento === currentUser.name);
      }

      if (hasWork) {
        nextWorkDate = currentDate;
        break;
      }

      consecutiveDaysOff++;
      currentDate = addDays(currentDate, 1);

      // Safety limit to prevent infinite loop (increased for cross-month search)
      if (consecutiveDaysOff > 60) break;
    }

    return { count: consecutiveDaysOff, nextWorkDate };
  };

  const { count: daysOffCount, nextWorkDate } = calculateDaysOffUntilNextWork();

  // Calendar setup for viewing month
  const daysInMonth = getDaysInMonth(viewingMonth);
  const firstDayOfMonth = viewingMonth.getDay(); // 0 = Sunday, 6 = Saturday
  const calendarDays = Array.from({ length: firstDayOfMonth }, () => null).concat(
    Array.from({ length: daysInMonth }, (_, i) => i + 1)
  );

  const getScheduleForDay = (day: number): ScheduleEntry | undefined => {
    const month = getMonth(viewingMonth) + 1;
    const year = getYear(viewingMonth);
    const dateStr = `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
    return viewingMonthData.find(s => s.date === dateStr);
  };

  const handleMonthChange = (monthYear: string) => {
    const [monthStr, yearStr] = monthYear.split('/');
    const month = parseInt(monthStr);
    const year = parseInt(yearStr);

    // Switch to the selected schedule
    switchToSchedule(month, year);
    setViewingMonth(new Date(year, month - 1));
  };

  const handlePreviousMonth = () => {
    if (hasPrevMonthData) {
      const month = getMonth(prevMonth) + 1;
      const year = getYear(prevMonth);
      switchToSchedule(month, year);
      setViewingMonth(prevMonth);
    }
  };

  const handleNextMonth = () => {
    if (hasNextMonthData) {
      const month = getMonth(nextMonth) + 1;
      const year = getYear(nextMonth);
      switchToSchedule(month, year);
      setViewingMonth(nextMonth);
    }
  };

  const isMyShift = (day: number): { meioPeriodo: boolean; fechamento: boolean } => {
    const entry = getScheduleForDay(day);
    if (!entry) return { meioPeriodo: false, fechamento: false };
    return {
      meioPeriodo: entry.meioPeriodo === currentUser.name,
      fechamento: entry.fechamento === currentUser.name,
    };
  };

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  // Get first name only for display
  const getFirstName = (name: string) => name.split(' ')[0];

  // Calculate statistics for all operators (for RICARDO view)
  const isRicardo = currentUser?.name === 'RICARDO';

  const operatorStats = isRicardo ? operators
    .filter(op => op.name !== 'RICARDO' && !op.hideFromSchedule)
    .map(operator => {
      const operatorSchedule = viewingMonthData.filter(
        entry => entry.meioPeriodo === operator.name || entry.fechamento === operator.name
      );

      return {
        name: operator.name,
        totalDays: operatorSchedule.length,
        daysOff: daysInMonth - operatorSchedule.length,
        meioPeriodo: operatorSchedule.filter(s => s.meioPeriodo === operator.name).length,
        fechamento: operatorSchedule.filter(s => s.fechamento === operator.name).length,
        weekends: operatorSchedule.filter(s => s.dayOfWeek === 'SABADO' || s.dayOfWeek === 'DOMINGO').length,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name)) : [];

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {isRicardo ? (
          <>
            {/* Yesterday Workers - RICARDO View */}
            <div className="glass-card-elevated p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-muted/20 flex items-center justify-center">
                  <span>🕐</span>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Quem trabalhou ontem</p>
                  <div className="font-bold text-lg">
                    {yesterdayWorkers ? (
                      <div className="text-sm">
                        <div className="flex items-center gap-1">
                          <span>☀️</span>
                          {yesterdayWorkers.meioPeriodo || '-'}
                        </div>
                        <div className="flex items-center gap-1">
                          <span>🌅</span>
                          {yesterdayWorkers.fechamento || '-'}
                        </div>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Sem dados</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Today Workers - RICARDO View */}
            <div className="glass-card-elevated p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                  <span>📅</span>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Quem está hoje</p>
                  <div className="font-bold text-lg">
                    {todayWorkers ? (
                      <div className="text-sm">
                        <div className="flex items-center gap-1">
                          <span>☀️</span>
                          {todayWorkers.meioPeriodo || '-'}
                        </div>
                        <div className="flex items-center gap-1">
                          <span>🌅</span>
                          {todayWorkers.fechamento || '-'}
                        </div>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Sem dados</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Tomorrow Workers - RICARDO View */}
            <div className="glass-card-elevated p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-success/20 flex items-center justify-center">
                  <span>📈</span>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Quem estará amanhã</p>
                  <div className="font-bold text-lg">
                    {tomorrowWorkers ? (
                      <div className="text-sm">
                        <div className="flex items-center gap-1">
                          <span>☀️</span>
                          {tomorrowWorkers.meioPeriodo || '-'}
                        </div>
                        <div className="flex items-center gap-1">
                          <span>🌅</span>
                          {tomorrowWorkers.fechamento || '-'}
                        </div>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Sem dados</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Regular User View */}
            <div className="glass-card-elevated p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-muted/20 flex items-center justify-center">
                  <span className="text-2xl">🕐</span>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Último dia trabalhado</p>
                  <div className="font-bold text-lg">
                    {lastWorkedDay ? (
                      <>
                        <div>
                          {parseDate(lastWorkedDay.date).getDate()}
                          <span className="text-sm font-normal text-muted-foreground ml-1">
                            {format(parseDate(lastWorkedDay.date), 'EEEE', { locale: ptBR })}
                          </span>
                          {(() => {
                            const workDate = parseDate(lastWorkedDay.date);
                            const currentMonth = getMonth(today) + 1;
                            const workMonth = getMonth(workDate) + 1;
                            const currentYear = getYear(today);
                            const workYear = getYear(workDate);

                            return (
                              <span className="text-xs text-muted-foreground ml-1">
                                ({format(workDate, 'MMM/yyyy', { locale: ptBR })})
                              </span>
                            );
                          })()}
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          {lastWorkedDay.meioPeriodo === currentUser.name && (
                            <div className="flex items-center gap-1 text-xs">
                              <span>☀️</span>
                              <span>MP</span>
                            </div>
                          )}
                          {lastWorkedDay.fechamento === currentUser.name && (
                            <div className="flex items-center gap-1 text-xs">
                              <span>🌅</span>
                              <span>FE</span>
                            </div>
                          )}
                          {lastWorkedDay.meioPeriodo === currentUser.name && lastWorkedDay.fechamento === currentUser.name && (
                            <span className="text-xs text-muted-foreground">(2 turnos)</span>
                          )}
                        </div>
                      </>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-card-elevated p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                  <span className="text-2xl">📈</span>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Próximo trabalho</p>
                  <div className="font-bold text-lg">
                    {nextWorkDay ? (
                      <>
                        <div>
                          {parseDate(nextWorkDay.date).getDate()}
                          <span className="text-sm font-normal text-muted-foreground ml-1">
                            {format(parseDate(nextWorkDay.date), 'EEE MMM', { locale: ptBR })}
                          </span>
                          {(() => {
                            const workDate = parseDate(nextWorkDay.date);
                            const currentMonth = getMonth(today) + 1;
                            const workMonth = getMonth(workDate) + 1;
                            const currentYear = getYear(today);
                            const workYear = getYear(workDate);

                            if (workMonth !== currentMonth || workYear !== currentYear) {
                              return (
                                <span className="text-xs text-muted-foreground ml-1">
                                  ({format(workDate, 'MMM/yyyy', { locale: ptBR })})
                                </span>
                              );
                            }
                            return null;
                          })()}
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          {nextWorkDay.meioPeriodo === currentUser.name && (
                            <div className="flex items-center gap-1 text-xs">
                              <span>☀️</span>
                              <span>MP</span>
                            </div>
                          )}
                          {nextWorkDay.fechamento === currentUser.name && (
                            <div className="flex items-center gap-1 text-xs">
                              <span>🌅</span>
                              <span>FE</span>
                            </div>
                          )}
                          {nextWorkDay.meioPeriodo === currentUser.name && nextWorkDay.fechamento === currentUser.name && (
                            <span className="text-xs text-muted-foreground">(2 turnos)</span>
                          )}
                        </div>
                      </>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-card-elevated p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-success/20 flex items-center justify-center">
                  <span className="text-2xl">🛏️</span>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Próxima folga</p>
                  <p className="font-bold text-lg">
                    {nextDayOff ? (
                      <>
                        <div>
                          {parseDate(nextDayOff).getDate()}
                          <span className="text-sm font-normal text-muted-foreground ml-1">
                            {format(parseDate(nextDayOff), 'EEEE', { locale: ptBR })}
                          </span>
                        </div>
                        {daysOffCount > 1 && (
                          <div className="text-xs text-success font-medium mt-1">
                            {daysOffCount} dias seguidos
                          </div>
                        )}
                      </>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Calendar View */}
      <div className="glass-card-elevated overflow-hidden">
        <div className="p-4 border-b border-border/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePreviousMonth}
              disabled={!hasPrevMonthData}
              className={!hasPrevMonthData ? "opacity-50 cursor-not-allowed" : "hover:bg-muted"}
            >
              <span>◀️</span>
            </Button>
            <div className="flex items-center gap-2">
              <span>📅</span>
              {availableMonths.length > 1 ? (
                <Select
                  value={`${getMonth(viewingMonth) + 1}/${getYear(viewingMonth)}`}
                  onValueChange={handleMonthChange}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableMonths.map(month => (
                      <SelectItem key={`${month.month}/${month.year}`} value={`${month.month}/${month.year}`}>
                        {month.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <h2 className="text-lg font-semibold">
                  {format(viewingMonth, "MMMM yyyy", { locale: ptBR })}
                </h2>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleNextMonth}
              disabled={!hasNextMonthData}
              className={!hasNextMonthData ? "opacity-50 cursor-not-allowed" : "hover:bg-muted"}
            >
              <span>▶️</span>
            </Button>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-meioPeriodo" />
              <span className="text-muted-foreground">Meio Período</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-fechamento" />
              <span className="text-muted-foreground">Fechamento</span>
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
              const hasWork = shifts.meioPeriodo || shifts.fechamento;
              const entry = getScheduleForDay(day);
              const isWeekend = index % 7 === 0 || index % 7 === 6;

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
                    ${isToday(parseDate(entry?.date || '')) ? 'ring-2 ring-success ring-offset-2 ring-offset-background' : ''}
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
                        ${entry.meioPeriodo === currentUser?.name 
                          ? 'bg-meioPeriodo text-meioPeriodo-foreground font-bold' 
                          : 'bg-meioPeriodo/20 text-meioPeriodo'
                        }
                      `}>
                        {getFirstName(entry.meioPeriodo)}
                      </div>
                      <div className={`
                        text-[10px] px-1 py-0.5 rounded truncate
                        ${entry.fechamento === currentUser?.name 
                          ? 'bg-fechamento text-fechamento-foreground font-bold' 
                          : 'bg-fechamento/20 text-fechamento'
                        }
                      `}>
                        {getFirstName(entry.fechamento)}
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
      {isRicardo ? (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <span>📈</span>
            Estatísticas dos Operadores - {format(viewingMonth, "MMMM yyyy", { locale: ptBR })}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {operatorStats.map(stat => (
              <div key={stat.name} className="glass-card-elevated p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-lg">{stat.name}</h4>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{stat.totalDays}</div>
                    <div className="text-xs text-muted-foreground mt-1">Dias de Trabalho</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-muted-foreground">{stat.daysOff}</div>
                    <div className="text-xs text-muted-foreground mt-1">Dias de Folga</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-meioPeriodo">{stat.meioPeriodo}</div>
                    <div className="text-xs text-muted-foreground mt-1">Meio Período</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-fechamento">{stat.fechamento}</div>
                    <div className="text-xs text-muted-foreground mt-1">Fechamento</div>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-border/50 text-center">
                  <div className="text-xl font-bold text-helipad-orange">{stat.weekends}</div>
                  <div className="text-xs text-muted-foreground mt-1">Fins de Semana</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          <div className="glass-card p-4 text-center">
            <div className="text-3xl font-bold text-primary">{mySchedule.length}</div>
            <div className="text-xs text-muted-foreground mt-1">Dias de Trabalho</div>
          </div>
        <div className="glass-card p-4 text-center">
          <div className="text-3xl font-bold text-muted-foreground">
            {daysInMonth - mySchedule.length}
          </div>
          <div className="text-xs text-muted-foreground mt-1">Dias de Folga</div>
        </div>
          <div className="glass-card p-4 text-center">
            <div className="text-3xl font-bold text-meioPeriodo">
              {mySchedule.filter(s => s.meioPeriodo === currentUser.name).length}
            </div>
            <div className="text-xs text-muted-foreground mt-1">Meio Período</div>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="text-3xl font-bold text-fechamento">
              {mySchedule.filter(s => s.fechamento === currentUser.name).length}
            </div>
            <div className="text-xs text-muted-foreground mt-1">Fechamento</div>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="text-3xl font-bold text-helipad-orange">
              {mySchedule.filter(s => s.dayOfWeek === 'SABADO' || s.dayOfWeek === 'DOMINGO').length}
            </div>
            <div className="text-xs text-muted-foreground mt-1">Fins de Semana</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleView;

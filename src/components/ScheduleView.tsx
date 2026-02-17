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

  const currentUserName = currentUser?.name ?? '';

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

  const mySchedule = currentUser
    ? viewingMonthData.filter(
        entry => entry.meioPeriodo === currentUserName || entry.fechamento === currentUserName
      )
    : [];

  // Parse dates for comparison
  const parseDate = (dateStr: string) => parse(dateStr, 'dd/MM/yyyy', new Date());

  // Calculate yesterday, today, and tomorrow workers
  const yesterday = subDays(today, 1);
  const tomorrow = addDays(today, 1);

  const getWorkersForDate = (date: Date) => {
    const dateStr = format(date, 'dd/MM/yyyy');
    const month = getMonth(date) + 1;
    const year = getYear(date);
    
    // Find schedule for this specific month
    const scheduleForMonth = currentSchedules.find(s => s.month === month && s.year === year);
    
    if (scheduleForMonth) {
      const entry = scheduleForMonth.entries.find(s => s.date === dateStr);
      return entry ? { meioPeriodo: entry.meioPeriodo, fechamento: entry.fechamento } : null;
    }
    
    return null;
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
  const myAllSchedule = currentUser
    ? allScheduleData.filter(
        entry => entry.meioPeriodo === currentUserName || entry.fechamento === currentUserName
      )
    : [];

  // Sort all schedule data
  const sortedAllSchedule = [...myAllSchedule].sort((a, b) =>
    parseDate(a.date).getTime() - parseDate(b.date).getTime()
  );

  const lastWorkedDay = sortedAllSchedule
    .filter(s => isBefore(parseDate(s.date), today) || isToday(parseDate(s.date)))
    .pop();

  const nextWorkDay = sortedAllSchedule
    .find(s => isAfter(parseDate(s.date), today));

  // Find days off (days not in schedule) across all available months
  const getAllDatesAcrossMonths = () => {
    const allDates: string[] = [];
    currentSchedules.forEach(schedule => {
      allDates.push(...schedule.entries.map(s => s.date));
    });
    return allDates;
  };
  
  const allDates = getAllDatesAcrossMonths();
  const myAllDates = new Set(myAllSchedule.map(s => s.date));
  const daysOff = currentUser
    ? allDates.filter(d => !myAllDates.has(d) && isAfter(parseDate(d), today))
    : [];
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
        hasWork = !!(entry && currentUser && (entry.meioPeriodo === currentUserName || entry.fechamento === currentUserName));
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

  if (!currentUser) return null;

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

  // Calculate statistics for all operators
  const operatorStats = operators
    .filter(op => !op.hideFromSchedule)
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
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="space-y-6">
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

      {/* Statistics Summary */}
      {currentUser && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-card p-4 text-center">
            <div className="text-3xl font-bold text-primary">
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

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getEmployeeSchedule, ScheduleEntry } from '@/data/scheduleData';
import { Calendar, Clock, Sun, Moon, Coffee } from 'lucide-react';

const ScheduleView: React.FC = () => {
  const { currentUser } = useAuth();
  
  if (!currentUser) return null;
  
  const mySchedule = getEmployeeSchedule(currentUser.name);
  
  const getDayType = (dayOfWeek: string) => {
    if (dayOfWeek === 'SÁBADO' || dayOfWeek === 'DOMINGO') return 'weekend';
    return 'weekday';
  };

  const formatDate = (dateStr: string) => {
    const [day, month] = dateStr.split('/');
    return { day, month: month === '01' ? 'JAN' : month };
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-card p-4 text-center">
          <div className="text-3xl font-bold text-primary">{mySchedule.length}</div>
          <div className="text-xs text-muted-foreground mt-1">Dias de Trabalho</div>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="text-3xl font-bold text-seafoam">
            {mySchedule.filter(s => getDayType(s.dayOfWeek) === 'weekend').length}
          </div>
          <div className="text-xs text-muted-foreground mt-1">Finais de Semana</div>
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

      {/* Schedule List */}
      <div className="glass-card overflow-hidden">
        <div className="p-4 border-b border-border/50">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Minha Escala - Janeiro 2026
          </h2>
        </div>
        
        <div className="divide-y divide-border/30">
          {mySchedule.map((entry, index) => {
            const { day, month } = formatDate(entry.date);
            const isWeekend = getDayType(entry.dayOfWeek) === 'weekend';
            const isShift1 = entry.shift1 === currentUser.name;
            const isShift2 = entry.shift2 === currentUser.name;
            
            return (
              <div 
                key={entry.date}
                className={`
                  flex items-center gap-4 p-4 transition-colors hover:bg-muted/30
                  ${isWeekend ? 'bg-primary/5' : ''}
                `}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Date */}
                <div className={`
                  flex flex-col items-center justify-center w-14 h-14 rounded-xl
                  ${isWeekend ? 'bg-primary/20' : 'bg-muted/50'}
                `}>
                  <span className="text-xl font-bold">{day}</span>
                  <span className="text-[10px] text-muted-foreground">{month}</span>
                </div>

                {/* Day info */}
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">{entry.dayOfWeek}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {entry.shift1 === entry.shift2 
                      ? 'Escala dupla (turno 1 e 2)' 
                      : `Parceiro: ${isShift1 ? entry.shift2 : entry.shift1}`
                    }
                  </div>
                </div>

                {/* Shifts */}
                <div className="flex gap-2">
                  {isShift1 && (
                    <span className="flex items-center gap-1 px-2 py-1 rounded-lg bg-secondary/20 text-secondary text-xs font-medium">
                      <Sun className="w-3 h-3" />
                      T1
                    </span>
                  )}
                  {isShift2 && (
                    <span className="flex items-center gap-1 px-2 py-1 rounded-lg bg-warning/20 text-warning text-xs font-medium">
                      <Moon className="w-3 h-3" />
                      T2
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {mySchedule.length === 0 && (
        <div className="glass-card p-12 text-center">
          <Coffee className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Nenhuma escala encontrada</h3>
          <p className="text-sm text-muted-foreground">
            Você não possui escalas registradas para este mês.
          </p>
        </div>
      )}
    </div>
  );
};

export default ScheduleView;

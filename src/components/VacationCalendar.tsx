import React from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { format, eachDayOfInterval, isSameDay, startOfMonth, endOfMonth, getDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { VacationRequest } from '@/data/scheduleData';

interface VacationCalendarProps {
  approvedVacations: VacationRequest[];
}

const VacationCalendar: React.FC<VacationCalendarProps> = ({ approvedVacations }) => {
  // Get all occupied dates from approved vacations
  const getOccupiedDates = () => {
    const occupiedDates: string[] = [];
    const vacationCount = approvedVacations.length;
    
    for (let i = 0; i < vacationCount; i++) {
      const vacation = approvedVacations[i];
      const start = new Date(vacation.startDate);
      const end = new Date(vacation.endDate);
      const days = eachDayOfInterval({ start, end });
      
      for (let j = 0; j < days.length; j++) {
        const day = days[j];
        const dateStr = format(day, 'yyyy-MM-dd');
        
        // Check if date already exists
        let exists = false;
        for (let k = 0; k < occupiedDates.length; k++) {
          if (occupiedDates[k] === dateStr) {
            exists = true;
            break;
          }
        }
        
        if (!exists) {
          occupiedDates[occupiedDates.length] = dateStr;
        }
      }
    }
    
    return occupiedDates;
  };

  const occupiedDates = getOccupiedDates();

  // Function to check if a date is occupied
  const isDateOccupied = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    
    for (let i = 0; i < occupiedDates.length; i++) {
      if (occupiedDates[i] === dateStr) {
        return true;
      }
    }
    
    return false;
  };

  // Function to get vacation info for a specific date
  const getVacationInfo = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const vacationCount = approvedVacations.length;
    
    for (let i = 0; i < vacationCount; i++) {
      const vacation = approvedVacations[i];
      const start = new Date(vacation.startDate);
      const end = new Date(vacation.endDate);
      
      if (date >= start && date <= end) {
        return vacation;
      }
    }
    
    return undefined;
  };

  // Custom day component
  const renderDay = (date: Date) => {
    const isOccupied = isDateOccupied(date);
    const vacation = getVacationInfo(date);
    
    if (!isOccupied) {
      return <div className="w-full h-full flex items-center justify-center">{date.getDate()}</div>;
    }

    return (
      <div className="w-full h-full flex flex-col items-center justify-center relative">
        <div className={`text-sm ${isOccupied ? 'text-destructive font-bold' : ''}`}>
          {date.getDate()}
        </div>
        {vacation && (
          <div className="absolute bottom-0 left-0 right-0">
            <Badge 
              variant="destructive" 
              className="text-xs w-full justify-center rounded-t-none"
            >
              {vacation.operatorName.split(' ')[0]}
            </Badge>
          </div>
        )}
      </div>
    );
  };

  // Custom modifiers for the calendar
  const modifiers = {
    occupied: (date: Date) => isDateOccupied(date),
  };

  const modifiersStyles = {
    occupied: {
      backgroundColor: 'hsl(var(--destructive) / 0.1)',
      borderColor: 'hsl(var(--destructive))',
      borderWidth: '2px',
    },
  };

  if (approvedVacations.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <div className="text-4xl mb-2">📅</div>
        <p>Nenhuma férias aprovada para visualizar</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current Month */}
        <Card>
          <CardContent className="p-4">
            <h3 className="text-sm font-medium mb-4 text-center">
              {format(new Date(), 'MMMM yyyy', { locale: ptBR })}
            </h3>
            <Calendar
              mode="single"
              modifiers={modifiers}
              modifiersStyles={modifiersStyles}
              className="rounded-md border"
              components={{
                Day: ({ date, ...props }) => (
                  <div {...props} className="w-full h-full">
                    {renderDay(date)}
                  </div>
                ),
              }}
            />
          </CardContent>
        </Card>

        {/* Next Month */}
        <Card>
          <CardContent className="p-4">
            <h3 className="text-sm font-medium mb-4 text-center">
              {format(
                new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1),
                'MMMM yyyy',
                { locale: ptBR }
              )}
            </h3>
            <Calendar
              mode="single"
              month={new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1)}
              modifiers={modifiers}
              modifiersStyles={modifiersStyles}
              className="rounded-md border"
              components={{
                Day: ({ date, ...props }) => (
                  <div {...props} className="w-full h-full">
                    {renderDay(date)}
                  </div>
                ),
              }}
            />
          </CardContent>
        </Card>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-destructive bg-destructive/10 rounded"></div>
          <span>Período Ocupado</span>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="destructive" className="text-xs">Operador</Badge>
          <span>Férias Aprovadas</span>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-destructive">{approvedVacations.length}</div>
            <div className="text-sm text-muted-foreground">Férias Aprovadas</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">
              {approvedVacations.reduce((sum, v) => sum + v.totalDays, 0)}
            </div>
            <div className="text-sm text-muted-foreground">Total de Dias</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-success">
              {new Set(approvedVacations.map(v => v.operatorName)).size}
            </div>
            <div className="text-sm text-muted-foreground">Operadores em Férias</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VacationCalendar;

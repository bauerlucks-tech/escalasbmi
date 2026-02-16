/**
 * Componente ScheduleCard
 * Exibe informações resumidas de uma escala mensal
 */
import React from 'react';
import { MonthSchedule } from '@/types';
import { useToggleScheduleActive } from '@/hooks/api/useSchedules';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Users, Power } from 'lucide-react';
import { formatMonthName } from '@/lib/date';

interface ScheduleCardProps {
  schedule: MonthSchedule;
  onView?: (schedule: MonthSchedule) => void;
  onEdit?: (schedule: MonthSchedule) => void;
}

export const ScheduleCard: React.FC<ScheduleCardProps> = ({
  schedule,
  onView,
  onEdit,
}) => {
  const { mutate: toggleActive, isPending } = useToggleScheduleActive();

  const handleToggleActive = () => {
    toggleActive({ month: schedule.month, year: schedule.year });
  };

  const uniqueOperators = new Set(
    schedule.entries.flatMap((e) => [e.meioPeriodo, e.fechamento])
  ).size;

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-lg">
              {formatMonthName(schedule.month)} {schedule.year}
            </h3>
          </div>
          <Badge variant={schedule.isActive ? 'default' : 'secondary'}>
            {schedule.isActive ? 'Ativa' : 'Inativa'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Users className="w-4 h-4" />
          <span className="text-sm">{uniqueOperators} operadores</span>
        </div>

        <div className="flex items-center gap-2 text-muted-foreground">
          <Calendar className="w-4 h-4" />
          <span className="text-sm">{schedule.entries.length} dias</span>
        </div>

        {schedule.importedBy && (
          <div className="text-xs text-muted-foreground">
            Importado por {schedule.importedBy}
          </div>
        )}
      </CardContent>

      <CardFooter className="gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={() => onView?.(schedule)}
        >
          Visualizar
        </Button>

        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={() => onEdit?.(schedule)}
        >
          Editar
        </Button>

        <Button
          variant={schedule.isActive ? 'destructive' : 'default'}
          size="sm"
          onClick={handleToggleActive}
          disabled={isPending}
        >
          <Power className="w-4 h-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

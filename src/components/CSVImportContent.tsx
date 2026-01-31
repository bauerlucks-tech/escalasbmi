import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Upload, FileSpreadsheet, AlertTriangle, CheckCircle, XCircle, Calendar, Users, Edit3, Save, X } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface CSVParsedData {
  date: string;
  post: string;
  collaborator: string;
  line: number;
  error?: string;
}

interface MonthPreview {
  month: number;
  year: number;
  monthName: string;
  days: DaySchedule[];
  errors: CSVParsedData[];
  totalDays: number;
  validDays: number;
}

interface DaySchedule {
  date: string;
  dayOfWeek: string;
  meioPeriodo: string;
  fechamento: string;
}

const CSVImportContent: React.FC = () => {
  const { currentUser } = useAuth();
  const [csvData, setCsvData] = useState<CSVParsedData[]>([]);
  const [parsedMonths, setParsedMonths] = useState<MonthPreview[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [editingErrors, setEditingErrors] = useState<CSVParsedData[]>([]);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  const getDayOfWeek = (dateStr: string) => {
    const days = ['DOMINGO', 'SEGUNDA-FEIRA', 'TERÇA-FEIRA', 'QUARTA-FEIRA', 'QUINTA-FEIRA', 'SEXTA-FEIRA', 'SÁBADO'];
    const [day, month, year] = dateStr.split('/').map(Number);
    const date = new Date(year, month - 1, day);
    return days[date.getDay()];
  };

  const validateDateFormat = (date: string): boolean => {
    const regex = /^\d{2}\/\d{2}\/\d{4}$/;
    if (!regex.test(date)) return false;
    
    const [day, month, year] = date.split('/').map(Number);
    const dateObj = new Date(year, month - 1, day);
    
    return (
      dateObj.getFullYear() === year &&
      dateObj.getMonth() === month - 1 &&
      dateObj.getDate() === day
    );
  };

  const validatePost = (post: string): boolean => {
    return post === 'meio_periodo' || post === 'fechamento' || post === 'Fechamento';
  };

  const parseCSV = (content: string): CSVParsedData[] => {
    const lines = content.split('\n').filter(line => line.trim());
    const parsed: CSVParsedData[] = [];

    lines.forEach((line, index) => {
      const parts = line.split(',').map(part => part.trim());
      
      if (parts.length !== 3) {
        parsed.push({
          date: '',
          post: '',
          collaborator: '',
          line: index + 1,
          error: 'Formato inválido: esperado 3 colunas (data, posto, colaborador)'
        });
        return;
      }

      const [date, post, collaborator] = parts;
      const errors: string[] = [];

      if (!validateDateFormat(date)) {
        errors.push('Data inválida: use formato DD/MM/AAAA');
      }

      if (!validatePost(post)) {
        errors.push('Posto inválido: use meio_periodo ou fechamento');
      }

      if (!collaborator || collaborator.length < 2) {
        errors.push('Colaborador inválido: mínimo 2 caracteres');
      }

      parsed.push({
        date,
        post: post.toLowerCase(),
        collaborator: collaborator.toUpperCase(),
        line: index + 1,
        error: errors.length > 0 ? errors.join('; ') : undefined
      });
    });

    return parsed;
  };

  const groupByMonth = (data: CSVParsedData[]): MonthPreview[] => {
    const monthGroups: { [key: string]: MonthPreview } = {};

    data.filter(item => !item.error).forEach(item => {
      const [day, month, year] = item.date.split('/').map(Number);
      const key = `${month}-${year}`;

      if (!monthGroups[key]) {
        monthGroups[key] = {
          month,
          year,
          monthName: monthNames[month - 1],
          days: [],
          errors: [],
          totalDays: 0,
          validDays: 0
        };
      }

      const existingDay = monthGroups[key].days.find(d => d.date === item.date);
      
      if (existingDay) {
        if (item.post === 'meio_periodo') {
          existingDay.meioPeriodo = item.collaborator;
        } else if (item.post === 'fechamento') {
          existingDay.fechamento = item.collaborator;
        }
      } else {
        monthGroups[key].days.push({
          date: item.date,
          dayOfWeek: getDayOfWeek(item.date),
          meioPeriodo: item.post === 'meio_periodo' ? item.collaborator : '',
          fechamento: item.post === 'fechamento' ? item.collaborator : ''
        });
      }
    });

    // Add errors to respective months
    data.filter(item => item.error).forEach(item => {
      if (item.date) {
        try {
          const [day, month, year] = item.date.split('/').map(Number);
          const key = `${month}-${year}`;
          
          if (monthGroups[key]) {
            monthGroups[key].errors.push(item);
          }
        } catch (e) {
          // Add to first month if date is invalid
          const firstKey = Object.keys(monthGroups)[0];
          if (firstKey) {
            monthGroups[firstKey].errors.push(item);
          }
        }
      }
    });

    // Calculate totals
    Object.values(monthGroups).forEach(month => {
      month.totalDays = month.days.length;
      month.validDays = month.days.filter(day => 
        day.meioPeriodo || day.fechamento
      ).length;
    });

    return Object.values(monthGroups).sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.month - b.month;
    });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast.error('Por favor, selecione um arquivo CSV');
      return;
    }

    setIsProcessing(true);
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsed = parseCSV(content);
        
        if (parsed.length === 0) {
          toast.error('Arquivo CSV vazio');
          setIsProcessing(false);
          return;
        }

        setCsvData(parsed);
        const months = groupByMonth(parsed);
        setParsedMonths(months);
        
        const totalErrors = parsed.filter(item => item.error).length;
        if (totalErrors > 0) {
          toast.warning(`Arquivo processado com ${totalErrors} erro(s). Verifique e corrija antes de importar.`);
        } else {
          toast.success(`Arquivo processado com sucesso! ${months.length} mês(es) encontrado(s).`);
        }
      } catch (error) {
        console.error('Error processing CSV:', error);
        toast.error('Erro ao processar arquivo CSV');
      } finally {
        setIsProcessing(false);
      }
    };

    reader.onerror = () => {
      toast.error('Erro ao ler arquivo');
      setIsProcessing(false);
    };

    reader.readAsText(file);
  };

  const renderCalendar = (month: MonthPreview) => {
    const firstDay = new Date(month.year, month.month - 1, 1);
    const lastDay = new Date(month.year, month.month, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const calendarDays = [];
    
    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      calendarDays.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      calendarDays.push(day);
    }

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-7 gap-1">
          {weekDays.map(day => (
            <div key={day} className="text-center text-xs font-medium py-2 text-muted-foreground">
              {day}
            </div>
          ))}
          {calendarDays.map((day, index) => {
            if (day === null) {
              return <div key={`empty-${index}`} className="min-h-[80px]" />;
            }

            const dateStr = `${day.toString().padStart(2, '0')}/${month.month.toString().padStart(2, '0')}/${month.year}`;
            const dayData = month.days.find(d => d.date === dateStr);

            return (
              <div
                key={day}
                className="min-h-[80px] border rounded-lg p-2 bg-muted/30"
              >
                <div className="text-xs font-bold text-muted-foreground mb-1">{day}</div>
                {dayData && (
                  <div className="space-y-1">
                    {dayData.meioPeriodo && (
                      <div className="text-xs bg-blue-100 text-blue-800 rounded px-1 py-0.5 truncate">
                        MP: {dayData.meioPeriodo}
                      </div>
                    )}
                    {dayData.fechamento && (
                      <div className="text-xs bg-green-100 text-green-800 rounded px-1 py-0.5 truncate">
                        FE: {dayData.fechamento}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Importação de Escalas CSV</h1>
        <p className="text-muted-foreground">
          Faça upload do arquivo CSV para visualizar e corrigir antes de importar
        </p>
      </div>

      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Upload do Arquivo CSV
          </CardTitle>
          <CardDescription>
            Formato esperado: data,posto,colaborador (ex: 01/01/2026,meio_periodo,CARLOS)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="hidden"
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing}
            className="w-full"
          >
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            {isProcessing ? 'Processando...' : 'Selecionar Arquivo CSV'}
          </Button>
        </CardContent>
      </Card>

      {/* Months Preview */}
      {parsedMonths.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Prévia dos Meses</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {parsedMonths.map((month) => (
              <Card key={`${month.month}-${month.year}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      {month.monthName} {month.year}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      {month.errors.length === 0 ? (
                        <div className="flex items-center gap-1 text-success">
                          <CheckCircle className="w-4 h-4" />
                          <span className="text-sm">Sem erros</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-destructive">
                          <XCircle className="w-4 h-4" />
                          <span className="text-sm">{month.errors.length} erros</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <CardDescription>
                    {month.validDays} dias válidos de {month.totalDays} dias totais
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Errors */}
                    {month.errors.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-destructive">Erros encontrados:</h4>
                        <div className="max-h-32 overflow-y-auto space-y-1">
                          {month.errors.map((error, index) => (
                            <div key={index} className="text-xs bg-destructive/10 p-2 rounded">
                              Linha {error.line}: {error.error}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Calendar Preview */}
                    <div>
                      <h4 className="text-sm font-medium mb-2">Prévia do Calendário:</h4>
                      <div className="max-h-96 overflow-y-auto">
                        {renderCalendar(month)}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CSVImportContent;

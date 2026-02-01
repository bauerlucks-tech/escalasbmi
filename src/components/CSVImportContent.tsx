import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSwap } from '@/contexts/SwapContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Upload, FileSpreadsheet, AlertTriangle, CheckCircle, XCircle, Calendar, Users, Edit3, Save, X, Download } from 'lucide-react';
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
  const { importNewSchedule, currentSchedules } = useSwap();
  const [csvData, setCsvData] = useState<CSVParsedData[]>([]);
  const [parsedMonths, setParsedMonths] = useState<MonthPreview[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
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

  const handleImportMonth = async (month: MonthPreview) => {
    if (month.errors.length > 0) {
      toast.error('Corrija os erros antes de importar este mês');
      return;
    }

    if (!currentUser) {
      toast.error('Usuário não autenticado');
      return;
    }

    // Verificar se o mês já existe no sistema
    const existingMonth = currentSchedules.find(s => s.month === month.month && s.year === month.year);
    
    if (existingMonth) {
      // Confirmar substituição do mês existente
      const confirmReplace = window.confirm(
        `⚠️ ATENÇÃO: ${month.monthName} ${month.year} já existe no sistema!\n\n` +
        `Dados existentes:\n` +
        `- ${existingMonth.entries.length} dias\n` +
        `- Importado em: ${new Date(existingMonth.importedAt).toLocaleDateString('pt-BR')}\n` +
        `- Por: ${existingMonth.importedBy}\n\n` +
        `Deseja SUBSTITUIR completamente os dados existentes?\n\n` +
        `Clique em "OK" para substituir ou "Cancelar" para abortar.`
      );
      
      if (!confirmReplace) {
        toast.info('❌ Importação cancelada pelo usuário');
        return;
      }
      
      toast.warning(`🔄 Substituindo ${month.monthName} ${month.year} existente...`);
    }

    setIsImporting(true);

    try {
      // Converter para o formato esperado pelo sistema
      const scheduleData = month.days.map(day => ({
        date: day.date,
        dayOfWeek: day.dayOfWeek,
        meioPeriodo: day.meioPeriodo,
        fechamento: day.fechamento
      }));

      // Importar usando a função existente do sistema
      const result = importNewSchedule(month.month, month.year, scheduleData, currentUser.name, true);
      
      if (result.success) {
        const action = existingMonth ? 'substituído' : 'importado';
        toast.success(`✅ ${month.monthName} ${month.year} ${action} com sucesso!`);
        toast.success('📅 A escala já está disponível para todos os operadores e administradores.');
        
        // Remover mês da lista após importação bem-sucedida
        setParsedMonths(prev => prev.filter(m => !(m.month === month.month && m.year === month.year)));
      } else {
        toast.error(`❌ Erro ao importar ${month.monthName}: ${(result as any).message || 'Erro desconhecido'}`);
      }
    } catch (error) {
      console.error('Error importing month:', error);
      toast.error(`❌ Erro ao importar ${month.monthName}: ${error}`);
    } finally {
      setIsImporting(false);
    }
  };

  const handleImportAllMonths = async () => {
    const monthsWithErrors = parsedMonths.filter(month => month.errors.length > 0);
    
    if (monthsWithErrors.length > 0) {
      toast.error(`Corrija os erros antes de importar. Meses com erros: ${monthsWithErrors.map(m => m.monthName).join(', ')}`);
      return;
    }

    if (!currentUser) {
      toast.error('Usuário não autenticado');
      return;
    }

    // Verificar meses existentes e pedir confirmação
    const existingMonths = parsedMonths.filter(month => 
      currentSchedules.some(s => s.month === month.month && s.year === month.year)
    );

    if (existingMonths.length > 0) {
      const existingMonthsList = existingMonths.map(m => `${m.monthName} ${m.year}`).join(', ');
      const confirmReplace = window.confirm(
        `⚠️ ATENÇÃO: Os seguintes meses já existem no sistema:\n\n` +
        `${existingMonthsList}\n\n` +
        `Deseja SUBSTITUIR todos os meses existentes?\n\n` +
        `Clique em "OK" para substituir todos ou "Cancelar" para abortar.`
      );
      
      if (!confirmReplace) {
        toast.info('❌ Importação em lote cancelada pelo usuário');
        return;
      }
      
      toast.warning(`🔄 Substituindo ${existingMonths.length} meses existentes...`);
    }

    setIsImporting(true);
    let successCount = 0;
    let errorCount = 0;

    try {
      for (const month of parsedMonths) {
        try {
          // Converter para o formato esperado pelo sistema
          const scheduleData = month.days.map(day => ({
            date: day.date,
            dayOfWeek: day.dayOfWeek,
            meioPeriodo: day.meioPeriodo,
            fechamento: day.fechamento
          }));

          // Verificar se este mês existe para mensagem correta
          const isExisting = currentSchedules.some(s => s.month === month.month && s.year === month.year);
          
          // Importar usando a função existente do sistema
          const result = importNewSchedule(month.month, month.year, scheduleData, currentUser.name, true);
          
          if (result.success) {
            successCount++;
            const action = isExisting ? 'substituído' : 'importado';
            toast.success(`✅ ${month.monthName} ${month.year} ${action} com sucesso!`);
          } else {
            errorCount++;
            toast.error(`❌ Erro ao importar ${month.monthName}: ${(result as any).message || 'Erro desconhecido'}`);
          }
        } catch (error) {
          errorCount++;
          console.error('Error importing month:', error);
          toast.error(`❌ Erro ao importar ${month.monthName}: ${error}`);
        }
      }

      if (successCount > 0) {
        toast.success(`🎉 Importação concluída! ${successCount} meses processados com sucesso.`);
        toast.success('📅 As escalas já estão disponíveis para todos os operadores e administradores.');
        setParsedMonths([]);
      }
      
      if (errorCount > 0) {
        toast.error(`❌ ${errorCount} meses falharam na importação.`);
      }
    } catch (error) {
      console.error('Error in batch import:', error);
      toast.error('❌ Erro geral na importação em lote');
    } finally {
      setIsImporting(false);
    }
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

      {/* Import Actions */}
      {parsedMonths.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="w-5 h-5" />
              Ações de Importação
            </CardTitle>
            <CardDescription>
              Importe as escalas validadas para o banco de dados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Button
                onClick={handleImportAllMonths}
                disabled={isImporting || parsedMonths.some(m => m.errors.length > 0)}
                className="flex-1 bg-success hover:bg-success/90"
              >
                <Download className="w-4 h-4 mr-2" />
                {isImporting ? 'Importando...' : `Importar Todos (${parsedMonths.length} meses)`}
              </Button>
            </div>
            <div className="mt-3 text-xs text-muted-foreground">
              <p>⚠️ Após importar, as escalas ficarão disponíveis para todos os operadores e administradores.</p>
              <p>📅 Os operadores poderão visualizar e solicitar trocas das escalas importadas.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Months Preview */}
      {parsedMonths.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Prévia dos Meses</h2>
            <div className="text-sm text-muted-foreground">
              {parsedMonths.filter(m => m.errors.length === 0).length} de {parsedMonths.length} meses prontos para importar
            </div>
          </div>
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
                          <span className="text-sm">Pronto para importar</span>
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
                    {/* Import Button */}
                    <Button
                      onClick={() => handleImportMonth(month)}
                      disabled={isImporting || month.errors.length > 0}
                      className="w-full"
                      variant={month.errors.length === 0 ? "default" : "outline"}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      {isImporting ? 'Importando...' : `Importar ${month.monthName}`}
                    </Button>

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

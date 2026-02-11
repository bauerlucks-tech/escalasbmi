import React, { useState, useEffect } from 'react';
import { Download, RefreshCw, Upload, FileText, Calendar, Users, BarChart3 } from 'lucide-react';

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  description?: string;
  location?: string;
}

const CalendarIntegration: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<'google' | 'outlook' | null>(null);

  useEffect(() => {
    // Check if user has connected calendar
    const savedProvider = localStorage.getItem('calendar_provider');
    if (savedProvider) {
      setSelectedProvider(savedProvider as 'google' | 'outlook');
      setIsConnected(true);
      loadEvents();
    }
  }, []);

  const loadEvents = async () => {
    setLoading(true);
    try {
      // Load events from localStorage or API
      const savedEvents = localStorage.getItem('calendar_events');
      if (savedEvents) {
        const parsed = JSON.parse(savedEvents);
        setEvents(parsed.map((e: any) => ({
          ...e,
          start: new Date(e.start),
          end: new Date(e.end)
        })));
      }
    } catch (error) {
      console.error('Error loading calendar events:', error);
    } finally {
      setLoading(false);
    }
  };

  const connectGoogleCalendar = async () => {
    try {
      // In a real implementation, this would use Google Calendar API
      // For demo purposes, we'll simulate the connection
      setSelectedProvider('google');
      setIsConnected(true);
      localStorage.setItem('calendar_provider', 'google');
      
      // Add some demo events
      const demoEvents: CalendarEvent[] = [
        {
          id: '1',
          title: 'Escala - Meio Período',
          start: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
          end: new Date(Date.now() + 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000), // Tomorrow + 6 hours
          description: 'Turno de meio período - Operações Offshore',
          location: 'Base SBMIBZ'
        },
        {
          id: '2',
          title: 'Escala - Fechamento',
          start: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Day after tomorrow
          end: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000),
          description: 'Turno de fechamento - Operações Offshore',
          location: 'Base SBMIBZ'
        }
      ];
      
      setEvents(demoEvents);
      localStorage.setItem('calendar_events', JSON.stringify(demoEvents));
    } catch (error) {
      console.error('Error connecting to Google Calendar:', error);
    }
  };

  const connectOutlookCalendar = async () => {
    try {
      // In a real implementation, this would use Microsoft Graph API
      setSelectedProvider('outlook');
      setIsConnected(true);
      localStorage.setItem('calendar_provider', 'outlook');
      
      // Add some demo events
      const demoEvents: CalendarEvent[] = [
        {
          id: '3',
          title: 'Reunião de Equipe',
          start: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          end: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
          description: 'Reunião semanal da equipe de operações',
          location: 'Sala de Reuniões - BMI'
        }
      ];
      
      setEvents(demoEvents);
      localStorage.setItem('calendar_events', JSON.stringify(demoEvents));
    } catch (error) {
      console.error('Error connecting to Outlook Calendar:', error);
    }
  };

  const exportToCalendar = () => {
    // Get current user's schedule from localStorage
    const schedulesData = localStorage.getItem('escala_scheduleStorage');
    if (!schedulesData) return;

    try {
      const schedules = JSON.parse(schedulesData);
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();
      
      const currentSchedule = schedules.current?.find((s: any) => 
        s.month === currentMonth && s.year === currentYear
      );

      if (!currentSchedule) return;

      // Convert schedule to calendar events
      const calendarEvents: CalendarEvent[] = currentSchedule.entries.map((entry: any, index: number) => {
        const [day, month, year] = entry.date.split('/').map(Number);
        const date = new Date(year, month - 1, day);
        
        const events: CalendarEvent[] = [];
        
        if (entry.meioPeriodo) {
          events.push({
            id: `meio-${index}`,
            title: `Escala - Meio Período (${entry.meioPeriodo})`,
            start: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 8, 0),
            end: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 14, 0),
            description: `Turno de meio período - ${entry.meioPeriodo}`,
            location: 'Base SBMIBZ'
          });
        }
        
        if (entry.fechamento) {
          events.push({
            id: `fechamento-${index}`,
            title: `Escala - Fechamento (${entry.fechamento})`,
            start: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 14, 0),
            end: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 20, 0),
            description: `Turno de fechamento - ${entry.fechamento}`,
            location: 'Base SBMIBZ'
          });
        }
        
        return events;
      }).flat();

      // Generate ICS file
      const icsContent = generateICSFile(calendarEvents);
      downloadICSFile(icsContent, 'escala-bmi.ics');
    } catch (error) {
      console.error('Error exporting to calendar:', error);
    }
  };

  const generateICSFile = (events: CalendarEvent[]): string => {
    const header = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Escalas BMI//Calendar Export//EN
CALSCALE:GREGORIAN`;
    
    const footer = `END:VCALENDAR`;
    
    const eventStrings = events.map(event => {
      const formatDate = (date: Date) => {
        return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
      };
      
      return `BEGIN:VEVENT
UID:${event.id}@escalasbmi.com
DTSTART:${formatDate(event.start)}
DTEND:${formatDate(event.end)}
SUMMARY:${event.title}
DESCRIPTION:${event.description || ''}
LOCATION:${event.location || ''}
END:VEVENT`;
    }).join('\n');

    return `${header}\n${eventStrings}\n${footer}`;
  };

  const downloadICSFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const disconnect = () => {
    setSelectedProvider(null);
    setIsConnected(false);
    setEvents([]);
    localStorage.removeItem('calendar_provider');
    localStorage.removeItem('calendar_events');
  };

  const formatEventTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatEventDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Calendar className="w-6 h-6 text-primary" />
        <h2 className="text-2xl font-bold">Integração com Calendário</h2>
      </div>

      {/* Connection Status */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold mb-4">Status da Conexão</h3>
        
        {!isConnected ? (
          <div className="space-y-4">
            <p className="text-gray-600 dark:text-gray-400">
              Conecte seu calendário para sincronizar suas escalas e receber lembretes.
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={connectGoogleCalendar}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <div className="w-5 h-5 bg-white rounded flex items-center justify-center">
                  <span className="text-blue-600 text-xs font-bold">G</span>
                </div>
                Google Calendar
              </button>
              
              <button
                onClick={connectOutlookCalendar}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <div className="w-5 h-5 bg-white rounded flex items-center justify-center">
                  <span className="text-blue-500 text-xs font-bold">O</span>
                </div>
                Outlook Calendar
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="font-medium">
                  Conectado a {selectedProvider === 'google' ? 'Google Calendar' : 'Outlook Calendar'}
                </span>
              </div>
              
              <button
                onClick={disconnect}
                className="text-red-600 hover:text-red-700 text-sm"
              >
                Desconectar
              </button>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={loadEvents}
                disabled={loading}
                className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Atualizar
              </button>
              
              <button
                onClick={exportToCalendar}
                className="flex items-center gap-2 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm"
              >
                <Download className="w-4 h-4" />
                Exportar Escala
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Events List */}
      {isConnected && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4">Próximos Eventos</h3>
          
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>Nenhum evento encontrado</p>
            </div>
          ) : (
            <div className="space-y-3">
              {events.map(event => (
                <div key={event.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="flex-shrink-0">
                    <Calendar className="w-5 h-5 text-primary" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white text-sm">
                      {event.title}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {formatEventDate(event.start)} • {formatEventTime(event.start)} - {formatEventTime(event.end)}
                    </p>
                    {event.location && (
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        📍 {event.location}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Instructions */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
        <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Como funciona:</h4>
        <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
          <li>• Conecte sua conta Google Calendar ou Outlook</li>
          <li>• Suas escalas serão sincronizadas automaticamente</li>
          <li>• Exporte sua escala atual para o calendário</li>
          <li>• Receba lembretes dos seus turnos</li>
          <li>• Visualize suas escalas junto com outros compromissos</li>
        </ul>
      </div>
    </div>
  );
};

export default CalendarIntegration;

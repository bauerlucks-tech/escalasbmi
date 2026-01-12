import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSwap } from '@/contexts/SwapContext';
import { getEmployeeSchedule, getUniqueEmployees, scheduleData } from '@/data/scheduleData';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeftRight, Calendar, User, Check, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const SwapRequestView: React.FC = () => {
  const { currentUser, users } = useAuth();
  const { createSwapRequest, getMyRequests } = useSwap();
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedColleague, setSelectedColleague] = useState('');

  if (!currentUser) return null;

  const mySchedule = getEmployeeSchedule(currentUser.name);
  const myRequests = getMyRequests(currentUser.id);
  const employees = getUniqueEmployees().filter(e => e !== currentUser.name);

  const handleSubmit = () => {
    if (!selectedDate || !selectedColleague) {
      toast.error('Selecione a data e o colega para a troca');
      return;
    }

    const targetUser = users.find(u => u.name === selectedColleague);
    if (!targetUser) {
      toast.error('Usuário não encontrado');
      return;
    }

    createSwapRequest({
      requesterId: currentUser.id,
      requesterName: currentUser.name,
      targetId: targetUser.id,
      targetName: selectedColleague,
      originalDate: selectedDate,
      status: 'pending',
    });

    toast.success('Solicitação de troca enviada!');
    setSelectedDate('');
    setSelectedColleague('');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="badge-pending">Pendente</span>;
      case 'accepted':
        return <span className="badge-accepted">Aceita</span>;
      case 'rejected':
        return <span className="badge-rejected">Recusada</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* New Request Form */}
      <div className="glass-card-elevated p-6">
        <h2 className="text-lg font-semibold flex items-center gap-2 mb-6">
          <ArrowLeftRight className="w-5 h-5 text-primary" />
          Nova Solicitação de Troca
        </h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Data da sua escala
            </label>
            <Select value={selectedDate} onValueChange={setSelectedDate}>
              <SelectTrigger className="bg-muted/50 border-border/50">
                <SelectValue placeholder="Selecione a data" />
              </SelectTrigger>
              <SelectContent>
                {mySchedule.map(entry => (
                  <SelectItem key={entry.date} value={entry.date}>
                    {entry.date} - {entry.dayOfWeek}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-muted-foreground flex items-center gap-2">
              <User className="w-4 h-4" />
              Trocar com
            </label>
            <Select value={selectedColleague} onValueChange={setSelectedColleague}>
              <SelectTrigger className="bg-muted/50 border-border/50">
                <SelectValue placeholder="Selecione o colega" />
              </SelectTrigger>
              <SelectContent>
                {employees.map(emp => (
                  <SelectItem key={emp} value={emp}>{emp}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button 
          onClick={handleSubmit}
          className="w-full mt-6 bg-primary hover:bg-primary/90 glow-primary"
          disabled={!selectedDate || !selectedColleague}
        >
          <ArrowLeftRight className="w-4 h-4 mr-2" />
          Enviar Solicitação
        </Button>
      </div>

      {/* My Requests History */}
      <div className="glass-card overflow-hidden">
        <div className="p-4 border-b border-border/50">
          <h2 className="text-lg font-semibold">Minhas Solicitações</h2>
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

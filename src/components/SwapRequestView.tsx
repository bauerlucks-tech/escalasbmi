import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSwap } from '@/contexts/SwapContext';
import { scheduleData, ScheduleEntry } from '@/data/scheduleData';
import { Button } from '@/components/ui/button';
import { ArrowLeftRight, Calendar, User, AlertCircle, Check, Clock, ArrowRight, Sun, Sunset, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const SwapRequestView: React.FC = () => {
  const { currentUser, users } = useAuth();
  const { createSwapRequest, getMyRequests } = useSwap();
  const [selectedMyDay, setSelectedMyDay] = useState<string | null>(null);
  const [selectedTargetDay, setSelectedTargetDay] = useState<string | null>(null);

  if (!currentUser) return null;

  const myRequests = getMyRequests(currentUser.id);

  // Get days where user is scheduled
  const myScheduledDays = scheduleData.filter(entry => 
    entry.meioPeriodo === currentUser.name || entry.fechamento === currentUser.name
  );

  // Get days where user is NOT scheduled
  const availableDays = scheduleData.filter(entry => 
    entry.meioPeriodo !== currentUser.name && entry.fechamento !== currentUser.name
  );

  const getScheduleByDate = (dateStr: string): ScheduleEntry | undefined => {
    return scheduleData.find(s => s.date === dateStr);
  };

  const getMyShiftType = (entry: ScheduleEntry): string => {
    if (entry.meioPeriodo === currentUser.name && entry.fechamento === currentUser.name) {
      return 'Meio Período + Fechamento';
    }
    if (entry.meioPeriodo === currentUser.name) return 'Meio Período';
    if (entry.fechamento === currentUser.name) return 'Fechamento';
    return '';
  };

  const getDayNumber = (dateStr: string): string => {
    return dateStr.split('/')[0];
  };

  const selectedMyEntry = selectedMyDay ? getScheduleByDate(selectedMyDay) : null;
  const selectedTargetEntry = selectedTargetDay ? getScheduleByDate(selectedTargetDay) : null;

  const handleSubmit = () => {
    if (!selectedMyDay || !selectedTargetDay) {
      toast.error('Selecione os dois dias para a troca');
      return;
    }

    const targetEntry = getScheduleByDate(selectedTargetDay);
    if (!targetEntry) {
      toast.error('Dia de destino não encontrado');
      return;
    }

    // Find the colleague working on the target day (prefer meioPeriodo)
    const colleagueName = targetEntry.meioPeriodo;
    const targetUser = users.find(u => u.name === colleagueName);
    
    if (!targetUser) {
      toast.error('Usuário não encontrado');
      return;
    }

    createSwapRequest({
      requesterId: currentUser.id,
      requesterName: currentUser.name,
      targetId: targetUser.id,
      targetName: colleagueName,
      originalDate: selectedMyDay,
      targetDate: selectedTargetDay,
      status: 'pending',
    });

    toast.success('Solicitação de troca enviada!');
    setSelectedMyDay(null);
    setSelectedTargetDay(null);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="badge-pending">Aguardando colega</span>;
      case 'accepted':
        return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-warning/20 text-warning">Aguardando admin</span>;
      case 'approved':
        return <span className="badge-accepted">Aprovada</span>;
      case 'rejected':
        return <span className="badge-rejected">Recusada</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Main Swap Card */}
      <div className="glass-card-elevated overflow-hidden">
        <div className="p-4 border-b border-border/50">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <ArrowLeftRight className="w-5 h-5 text-primary" />
            Solicitar Troca de Dia
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Selecione o dia que você quer ceder e o dia que você quer assumir
          </p>
        </div>

        <div className="p-4 space-y-6">
          {/* Step 1: Select my day */}
          <div className="space-y-3">
            <label className="text-sm font-medium flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">1</div>
              Qual dia você quer trocar?
            </label>
            
            <Select value={selectedMyDay || ''} onValueChange={(v) => {
              setSelectedMyDay(v);
              setSelectedTargetDay(null);
            }}>
              <SelectTrigger className="w-full h-auto py-3 bg-muted/30">
                <SelectValue placeholder="Selecione um dia que você trabalha">
                  {selectedMyEntry && (
                    <div className="flex items-center gap-3 text-left">
                      <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                        <span className="text-primary font-bold">{getDayNumber(selectedMyDay!)}</span>
                      </div>
                      <div>
                        <div className="font-medium">{selectedMyEntry.dayOfWeek}</div>
                        <div className="text-xs text-muted-foreground">
                          Você: {getMyShiftType(selectedMyEntry)}
                        </div>
                      </div>
                    </div>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {myScheduledDays.map(entry => (
                  <SelectItem key={entry.date} value={entry.date} className="py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                        <span className="text-primary font-bold">{getDayNumber(entry.date)}</span>
                      </div>
                      <div>
                        <div className="font-medium">{entry.dayOfWeek}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-2">
                          <span className="flex items-center gap-1">
                            <Sun className="w-3 h-3 text-secondary" />
                            {entry.meioPeriodo}
                          </span>
                          <span className="flex items-center gap-1">
                            <Sunset className="w-3 h-3 text-warning" />
                            {entry.fechamento}
                          </span>
                        </div>
                        <div className="text-xs text-primary font-medium mt-0.5">
                          Você: {getMyShiftType(entry)}
                        </div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Arrow Divider */}
          {selectedMyDay && (
            <div className="flex justify-center">
              <div className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center animate-fade-in">
                <ArrowRight className="w-5 h-5 text-muted-foreground" />
              </div>
            </div>
          )}

          {/* Step 2: Select target day */}
          {selectedMyDay && (
            <div className="space-y-3 animate-fade-in">
              <label className="text-sm font-medium flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center text-xs font-bold">2</div>
                Qual dia você quer assumir?
              </label>
              
              <Select value={selectedTargetDay || ''} onValueChange={setSelectedTargetDay}>
                <SelectTrigger className="w-full h-auto py-3 bg-muted/30">
                  <SelectValue placeholder="Selecione um dia para trocar">
                    {selectedTargetEntry && (
                      <div className="flex items-center gap-3 text-left">
                        <div className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center">
                          <span className="text-secondary font-bold">{getDayNumber(selectedTargetDay!)}</span>
                        </div>
                        <div>
                          <div className="font-medium">{selectedTargetEntry.dayOfWeek}</div>
                          <div className="text-xs text-muted-foreground">
                            Dupla: {selectedTargetEntry.meioPeriodo} / {selectedTargetEntry.fechamento}
                          </div>
                        </div>
                      </div>
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {availableDays.map(entry => (
                    <SelectItem key={entry.date} value={entry.date} className="py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center">
                          <span className="text-secondary font-bold">{getDayNumber(entry.date)}</span>
                        </div>
                        <div>
                          <div className="font-medium">{entry.dayOfWeek}</div>
                          <div className="text-xs text-muted-foreground flex items-center gap-2">
                            <span className="flex items-center gap-1">
                              <Sun className="w-3 h-3 text-secondary" />
                              {entry.meioPeriodo}
                            </span>
                            <span className="flex items-center gap-1">
                              <Sunset className="w-3 h-3 text-warning" />
                              {entry.fechamento}
                            </span>
                          </div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Confirmation Summary */}
          {selectedMyDay && selectedTargetDay && selectedMyEntry && selectedTargetEntry && (
            <div className="glass-card p-4 bg-muted/20 animate-fade-in">
              <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                <Check className="w-4 h-4 text-success" />
                Resumo da Troca
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-primary/10 border border-primary/30">
                  <div className="text-xs text-muted-foreground mb-1">Você vai ceder</div>
                  <div className="font-bold text-primary text-lg">Dia {getDayNumber(selectedMyDay)}</div>
                  <div className="text-sm text-muted-foreground">{selectedMyEntry.dayOfWeek}</div>
                  <div className="text-xs mt-2 flex items-center gap-1">
                    <User className="w-3 h-3" />
                    Seu turno: {getMyShiftType(selectedMyEntry)}
                  </div>
                </div>
                
                <div className="p-3 rounded-lg bg-secondary/10 border border-secondary/30">
                  <div className="text-xs text-muted-foreground mb-1">Você vai assumir</div>
                  <div className="font-bold text-secondary text-lg">Dia {getDayNumber(selectedTargetDay)}</div>
                  <div className="text-sm text-muted-foreground">{selectedTargetEntry.dayOfWeek}</div>
                  <div className="text-xs mt-2 flex items-center gap-1">
                    <User className="w-3 h-3" />
                    Trocar com: {selectedTargetEntry.meioPeriodo}
                  </div>
                </div>
              </div>

              <p className="text-xs text-muted-foreground mt-4">
                <strong>{selectedTargetEntry.meioPeriodo}</strong> será notificado e precisará aceitar. 
                Após o aceite, o administrador aprovará a troca.
              </p>

              <div className="flex gap-2 mt-4">
                <Button 
                  onClick={handleSubmit}
                  className="flex-1 bg-primary hover:bg-primary/90 glow-primary"
                >
                  <ArrowLeftRight className="w-4 h-4 mr-2" />
                  Confirmar Solicitação
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSelectedMyDay(null);
                    setSelectedTargetDay(null);
                  }}
                >
                  Limpar
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* My Requests History */}
      <div className="glass-card overflow-hidden">
        <div className="p-4 border-b border-border/50">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Minhas Solicitações
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Fluxo: Solicitação → Aceite do colega → Aprovação do administrador
          </p>
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
                  <div className="font-medium text-sm flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-primary/20 text-primary rounded text-xs">
                      {request.originalDate.split('/')[0]}/01
                    </span>
                    <ArrowRight className="w-3 h-3 text-muted-foreground" />
                    <span className="px-2 py-0.5 bg-secondary/20 text-secondary rounded text-xs">
                      {request.targetDate?.split('/')[0] || '??'}/01
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Troca com: <span className="text-foreground">{request.targetName}</span>
                  </div>
                  {request.adminApprovedBy && (
                    <div className="text-xs text-success mt-0.5">
                      Aprovado por: {request.adminApprovedBy}
                    </div>
                  )}
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
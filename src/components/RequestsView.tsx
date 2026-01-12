import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSwap } from '@/contexts/SwapContext';
import { Button } from '@/components/ui/button';
import { Check, X, Bell, Calendar, User, Inbox } from 'lucide-react';
import { toast } from 'sonner';

const RequestsView: React.FC = () => {
  const { currentUser } = useAuth();
  const { getRequestsForMe, respondToSwap, swapRequests } = useSwap();

  if (!currentUser) return null;

  const pendingRequests = getRequestsForMe(currentUser.name);
  const allMyIncoming = swapRequests.filter(r => r.targetName === currentUser.name);

  const handleRespond = (requestId: string, accept: boolean) => {
    respondToSwap(requestId, accept);
    toast.success(accept ? 'Troca aceita!' : 'Troca recusada');
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
      {/* Pending Requests */}
      <div className="glass-card-elevated overflow-hidden">
        <div className="p-4 border-b border-border/50 flex items-center justify-between">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            Solicitações Pendentes
          </h2>
          {pendingRequests.length > 0 && (
            <span className="px-2 py-1 rounded-full bg-primary text-primary-foreground text-xs font-bold">
              {pendingRequests.length}
            </span>
          )}
        </div>

        {pendingRequests.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <Inbox className="w-10 h-10 mx-auto mb-3 opacity-50" />
            <p>Nenhuma solicitação pendente no momento.</p>
          </div>
        ) : (
          <div className="divide-y divide-border/30">
            {pendingRequests.map(request => (
              <div key={request.id} className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                        <User className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <span className="font-semibold text-primary">{request.requesterName}</span>
                        <span className="text-sm text-muted-foreground ml-2">
                          quer trocar escala com você
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground ml-10">
                      <Calendar className="w-4 h-4" />
                      <span>Data: {request.originalDate}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleRespond(request.id, true)}
                      className="bg-success hover:bg-success/90"
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Aceitar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRespond(request.id, false)}
                      className="border-destructive/50 text-destructive hover:bg-destructive/10"
                    >
                      <X className="w-4 h-4 mr-1" />
                      Recusar
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* History */}
      <div className="glass-card overflow-hidden">
        <div className="p-4 border-b border-border/50">
          <h2 className="text-lg font-semibold">Histórico de Solicitações Recebidas</h2>
        </div>

        {allMyIncoming.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <p>Nenhuma solicitação recebida ainda.</p>
          </div>
        ) : (
          <div className="divide-y divide-border/30">
            {allMyIncoming.filter(r => r.status !== 'pending').map(request => (
              <div key={request.id} className="flex items-center justify-between p-4">
                <div>
                  <div className="font-medium text-sm">
                    <span className="text-primary">{request.requesterName}</span> solicitou troca
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

export default RequestsView;

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Plane, 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  User,
  ThumbsUp,
  ThumbsDown,
  MessageSquare
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { VacationRequest, VacationStatus, getPendingVacationRequests, getVacationRequests, updateVacationStatus } from '@/data/scheduleData';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const VacationAdminView: React.FC = () => {
  const { currentUser } = useAuth();
  const [pendingRequests, setPendingRequests] = useState<VacationRequest[]>([]);
  const [allRequests, setAllRequests] = useState<VacationRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<VacationRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = () => {
    try {
      const pending = getPendingVacationRequests();
      const all = getVacationRequests();
      setPendingRequests(pending);
      setAllRequests(all);
    } catch (error) {
      console.error('Error loading vacation requests:', error);
    }
  };

  const getStatusBadge = (status: VacationStatus) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">
            <Clock className="w-3 h-3 mr-1" />
            Pendente
          </Badge>
        );
      case 'approved':
        return (
          <Badge variant="outline" className="bg-success/10 text-success border-success/20">
            <CheckCircle className="w-3 h-3 mr-1" />
            Aprovado
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">
            <XCircle className="w-3 h-3 mr-1" />
            Rejeitado
          </Badge>
        );
    }
  };

  const handleApprove = async (requestId: string) => {
    if (!currentUser) return;

    setIsProcessing(true);
    try {
      const success = updateVacationStatus(
        requestId,
        'approved',
        currentUser.name
      );

      if (success) {
        toast.success('Solicitação de férias aprovada com sucesso!');
        loadRequests();
        setSelectedRequest(null);
      } else {
        toast.error('Erro ao aprovar solicitação');
      }
    } catch (error) {
      toast.error('Erro ao aprovar solicitação');
      console.error('Error approving vacation:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async (requestId: string) => {
    if (!currentUser) return;

    if (!rejectionReason.trim()) {
      toast.error('Por favor, informe o motivo da rejeição');
      return;
    }

    setIsProcessing(true);
    try {
      const success = updateVacationStatus(
        requestId,
        'rejected',
        currentUser.name,
        rejectionReason
      );

      if (success) {
        toast.success('Solicitação de férias rejeitada com sucesso!');
        loadRequests();
        setSelectedRequest(null);
        setRejectionReason('');
      } else {
        toast.error('Erro ao rejeitar solicitação');
      }
    } catch (error) {
      toast.error('Erro ao rejeitar solicitação');
      console.error('Error rejecting vacation:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  };

  const RequestCard = ({ request, showActions = false }: { request: VacationRequest; showActions?: boolean }) => (
    <Card className="glass-card hover:shadow-lg transition-all">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-primary" />
              <span className="font-medium">{request.operatorName}</span>
              {getStatusBadge(request.status)}
            </div>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>
                {formatDate(request.startDate)} - {formatDate(request.endDate)}
              </span>
              <span className="text-primary">({request.totalDays} dias)</span>
            </div>

            <div className="text-sm text-muted-foreground">
              <Clock className="w-4 h-4 inline mr-1" />
              Solicitado em {format(new Date(request.requestedAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
            </div>

            {request.reason && (
              <div className="text-sm">
                <MessageSquare className="w-4 h-4 inline mr-1" />
                <span className="font-medium">Motivo:</span> {request.reason}
              </div>
            )}

            {request.status === 'approved' && request.approvedBy && (
              <div className="text-sm text-success">
                <CheckCircle className="w-4 h-4 inline mr-1" />
                <span className="font-medium">Aprovado por:</span> {request.approvedBy}
                {request.approvedAt && (
                  <span className="ml-2">
                    em {format(new Date(request.approvedAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  </span>
                )}
              </div>
            )}

            {request.status === 'rejected' && request.rejectionReason && (
              <div className="text-sm text-destructive">
                <XCircle className="w-4 h-4 inline mr-1" />
                <span className="font-medium">Motivo da rejeição:</span> {request.rejectionReason}
              </div>
            )}
          </div>

          {showActions && request.status === 'pending' && (
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => handleApprove(request.id)}
                disabled={isProcessing}
                className="bg-success hover:bg-success/90"
              >
                <ThumbsUp className="w-4 h-4 mr-1" />
                Aprovar
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setSelectedRequest(request)}
                disabled={isProcessing}
                className="border-destructive/50 text-destructive hover:bg-destructive/10"
              >
                <ThumbsDown className="w-4 h-4 mr-1" />
                Rejeitar
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
    </Card>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass-card">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-warning">{pendingRequests.length}</div>
            <div className="text-xs text-muted-foreground">Pendentes</div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-success">
              {allRequests.filter(r => r.status === 'approved').length}
            </div>
            <div className="text-xs text-muted-foreground">Aprovadas</div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-destructive">
              {allRequests.filter(r => r.status === 'rejected').length}
            </div>
            <div className="text-xs text-muted-foreground">Rejeitadas</div>
          </CardContent>
        </Card>
      </div>

      {/* Requests */}
      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Pendentes
            {pendingRequests.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-warning text-warning-foreground">
                {pendingRequests.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="all" className="flex items-center gap-2">
            <Plane className="w-4 h-4" />
            Todas
          </TabsTrigger>
          <TabsTrigger value="approved" className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Aprovadas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {pendingRequests.length === 0 ? (
            <Card className="glass-card">
              <CardContent className="p-8 text-center text-muted-foreground">
                <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma solicitação pendente</p>
              </CardContent>
            </Card>
          ) : (
            <ScrollArea className="h-[600px]">
              <div className="space-y-4">
                {pendingRequests.map((request) => (
                  <RequestCard key={request.id} request={request} showActions />
                ))}
              </div>
            </ScrollArea>
          )}
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          <ScrollArea className="h-[600px]">
            <div className="space-y-4">
              {allRequests.map((request) => (
                <RequestCard 
                  key={request.id} 
                  request={request} 
                  showActions={request.status === 'pending'} 
                />
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="approved" className="space-y-4">
          <ScrollArea className="h-[600px]">
            <div className="space-y-4">
              {allRequests
                .filter(r => r.status === 'approved')
                .map((request) => (
                  <RequestCard key={request.id} request={request} />
                ))}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>

      {/* Rejection Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md glass-card-elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <XCircle className="w-5 h-5 text-destructive" />
                Rejeitar Solicitação de Férias
              </CardTitle>
              <CardDescription>
                {selectedRequest.operatorName} - {formatDate(selectedRequest.startDate)} a {formatDate(selectedRequest.endDate)}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Motivo da rejeição *</label>
                <Textarea
                  placeholder="Informe o motivo da rejeição..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={4}
                />
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedRequest(null);
                    setRejectionReason('');
                  }}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={() => handleReject(selectedRequest.id)}
                  disabled={isProcessing || !rejectionReason.trim()}
                  className="flex-1 bg-destructive hover:bg-destructive/90"
                >
                  {isProcessing ? 'Processando...' : 'Rejeitar'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default VacationAdminView;

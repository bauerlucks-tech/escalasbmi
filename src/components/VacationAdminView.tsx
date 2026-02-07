import React, { useState } from 'react';
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
import { VacationRequest, VacationStatus } from '@/data/scheduleData';
import { useAuth } from '@/contexts/AuthContext';
import { useVacation } from '@/contexts/VacationContext';
import { toast } from 'sonner';

const VacationAdminView: React.FC = () => {
  const { currentUser } = useAuth();
  const { 
    approveVacationRequest, 
    rejectVacationRequest,
    getPendingVacations,
    vacationRequests,
    loading 
  } = useVacation();
  
  const [selectedRequest, setSelectedRequest] = useState<VacationRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Get pending and all requests
  const pendingRequests = getPendingVacations();
  const allRequests = vacationRequests;

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
      await approveVacationRequest(requestId, currentUser.name);
      toast.success('Solicitação de férias aprovada com sucesso!');
      setSelectedRequest(null);
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
      await rejectVacationRequest(requestId, currentUser.name, rejectionReason);
      toast.success('Solicitação de férias rejeitada com sucesso!');
      setSelectedRequest(null);
      setRejectionReason('');
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
    <Card className="border-0 shadow-xl overflow-hidden bg-white/5 hover:bg-white/10 transition-all duration-300 group"
          style={{ border: '1px solid rgba(255, 255, 255, 0.05)' }}>
      <CardHeader className="p-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#710917]/20 flex items-center justify-center border border-[#710917]/30">
                <User className="w-5 h-5 text-[#ff6b6b]" />
              </div>
              <div>
                <span className="font-bold text-white text-lg block leading-none">{request.operatorName}</span>
                <div className="mt-1">{getStatusBadge(request.status)}</div>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-300">
              <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                <Calendar className="w-4 h-4 text-primary" />
                <span>
                  {formatDate(request.startDate)} até {formatDate(request.endDate)}
                </span>
                <Badge className="bg-[#710917] text-white border-0 ml-1">{request.totalDays} dias</Badge>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Clock className="w-3 h-3" />
              Solicitado em {format(new Date(request.requestedAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
            </div>

            {request.reason && (
              <div className="text-sm bg-black/20 p-3 rounded-xl border border-white/5 text-gray-300 italic">
                <MessageSquare className="w-4 h-4 inline mr-2 text-[#4ecdc4]" />
                <span className="font-medium text-gray-400 not-italic mr-1">Motivo:</span> "{request.reason}"
              </div>
            )}

            {request.status === 'approved' && request.approvedBy && (
              <div className="text-sm bg-success/10 p-3 rounded-xl border border-success/20 text-success-foreground">
                <CheckCircle className="w-4 h-4 inline mr-2" />
                <span className="font-bold">Aprovado por:</span> {request.approvedBy}
                {request.approvedAt && (
                  <span className="ml-2 opacity-70">
                    em {format(new Date(request.approvedAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  </span>
                )}
              </div>
            )}

            {request.status === 'rejected' && request.rejectionReason && (
              <div className="text-sm bg-destructive/10 p-3 rounded-xl border border-destructive/20 text-destructive-foreground">
                <XCircle className="w-4 h-4 inline mr-2" />
                <span className="font-bold">Rejeitado por:</span> {request.approvedBy}
                <div className="mt-1 ml-6 text-xs opacity-80 font-medium">Motivo: {request.rejectionReason}</div>
              </div>
            )}
          </div>

          {showActions && request.status === 'pending' && (
            <div className="flex md:flex-col gap-2 min-w-[140px]">
              <Button
                size="lg"
                onClick={() => handleApprove(request.id)}
                disabled={isProcessing}
                className="flex-1 bg-success hover:bg-success/90 text-white font-bold shadow-lg shadow-success/20"
              >
                <ThumbsUp className="w-4 h-4 mr-2" />
                Aprovar
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => setSelectedRequest(request)}
                disabled={isProcessing}
                className="flex-1 border-destructive/30 text-destructive hover:bg-destructive/10 hover:border-destructive/50"
              >
                <ThumbsDown className="w-4 h-4 mr-2" />
                Rejeitar
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
    </Card>
  );

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-0 shadow-xl overflow-hidden"
              style={{ background: 'rgba(255, 255, 255, 0.03)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-[#feca57] mb-1">{pendingRequests.length}</div>
            <div className="text-xs uppercase tracking-wider text-gray-400 font-medium">Pendentes</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-xl overflow-hidden"
              style={{ background: 'rgba(255, 255, 255, 0.03)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-success mb-1">
              {allRequests.filter(r => r.status === 'approved').length}
            </div>
            <div className="text-xs uppercase tracking-wider text-gray-400 font-medium">Aprovadas</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-xl overflow-hidden"
              style={{ background: 'rgba(255, 255, 255, 0.03)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-destructive mb-1">
              {allRequests.filter(r => r.status === 'rejected').length}
            </div>
            <div className="text-xs uppercase tracking-wider text-gray-400 font-medium">Rejeitadas</div>
          </CardContent>
        </Card>
      </div>

      {/* Requests */}
      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-white/5 border border-white/10 p-1 h-14 rounded-xl">
          <TabsTrigger value="pending" className="rounded-lg data-[state=active]:bg-[#710917] data-[state=active]:text-white">
            <Clock className="w-4 h-4 mr-2" />
            Pendentes
            {pendingRequests.length > 0 && (
              <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-white/20 text-white font-bold">
                {pendingRequests.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="all" className="rounded-lg data-[state=active]:bg-[#710917] data-[state=active]:text-white">
            <Plane className="w-4 h-4 mr-2" />
            Todas
          </TabsTrigger>
          <TabsTrigger value="approved" className="rounded-lg data-[state=active]:bg-[#710917] data-[state=active]:text-white">
            <CheckCircle className="w-4 h-4 mr-2" />
            Aprovadas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4 outline-none">
          {pendingRequests.length === 0 ? (
            <Card className="border-0 bg-white/5 border-white/10 p-12">
              <CardContent className="text-center text-gray-400">
                <Clock className="w-16 h-16 mx-auto mb-4 opacity-20" />
                <p className="text-lg">Nenhuma solicitação pendente</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {pendingRequests.map((request) => (
                <RequestCard key={request.id} request={request} showActions />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="all" className="space-y-4 outline-none">
          <div className="space-y-4">
            {allRequests.map((request) => (
              <RequestCard 
                key={request.id} 
                request={request} 
                showActions={request.status === 'pending'} 
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="approved" className="space-y-4 outline-none">
          <div className="space-y-4">
            {allRequests
              .filter(r => r.status === 'approved')
              .map((request) => (
                <RequestCard key={request.id} request={request} />
              ))}
          </div>
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

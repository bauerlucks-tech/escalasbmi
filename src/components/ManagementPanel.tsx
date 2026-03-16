import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSwap } from '@/contexts/SwapContext';
import { useVacation } from '@/contexts/VacationContext';
import { SupabaseAPI } from '@/lib/supabase';
import { ArrowLeftRight, Clock, CheckCircle, X, Plane, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';

const ManagementPanel: React.FC = () => {
  const { currentUser } = useAuth();
  const { swapRequests, approveSwap, rejectSwap } = useSwap();
  const { vacationRequests, approveVacation, rejectVacation } = useVacation();
  const [activeTab, setActiveTab] = useState('swaps');

  // Filter pending requests
  const pendingSwaps = swapRequests.filter(req => req.status === 'accepted_by_target');
  const pendingVacations = vacationRequests.filter(req => req.status === 'pending');
  
  // Filter completed requests for history
  const completedSwaps = swapRequests.filter(req => ['approved', 'rejected'].includes(req.status));
  const completedVacations = vacationRequests.filter(req => ['approved', 'rejected'].includes(req.status));

  const getShiftName = (shift: string) => {
    const shifts: { [key: string]: string } = {
      'morning': 'Manhã',
      'afternoon': 'Tarde',
      'night': 'Noite',
      'dawn': 'Madrugada'
    };
    return shifts[shift] || shift;
  };

  const handleApproveSwap = async (id: string) => {
    try {
      await approveSwap(id);
    } catch (error) {
      console.error('Erro ao aprovar troca:', error);
    }
  };

  const handleRejectSwap = async (id: string) => {
    try {
      await rejectSwap(id);
    } catch (error) {
      console.error('Erro ao rejeitar troca:', error);
    }
  };

  const handleApproveVacation = async (id: string) => {
    try {
      await approveVacation(id);
    } catch (error) {
      console.error('Erro ao aprovar férias:', error);
    }
  };

  const handleRejectVacation = async (id: string) => {
    try {
      await rejectVacation(id);
    } catch (error) {
      console.error('Erro ao rejeitar férias:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Gestão</h1>
          <p className="text-muted-foreground">Aprovações de trocas e férias</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="px-3 py-1">
            <ArrowLeftRight className="w-4 h-4 mr-1" />
            {pendingSwaps.length} Trocas
          </Badge>
          <Badge variant="outline" className="px-3 py-1">
            <Plane className="w-4 h-4 mr-1" />
            {pendingVacations.length} Férias
          </Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="swaps" className="flex items-center gap-2">
            <ArrowLeftRight className="w-4 h-4" />
            Trocas
            {pendingSwaps.length > 0 && (
              <span className="ml-2 px-2 py-1 bg-warning text-warning-foreground text-xs rounded-full">
                {pendingSwaps.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="vacations" className="flex items-center gap-2">
            <Plane className="w-4 h-4" />
            Férias
            {pendingVacations.length > 0 && (
              <span className="ml-2 px-2 py-1 bg-warning text-warning-foreground text-xs rounded-full">
                {pendingVacations.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Histórico
          </TabsTrigger>
        </TabsList>

        {/* Trocas Tab */}
        <TabsContent value="swaps" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-warning" />
                Aguardando Aprovação
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pendingSwaps.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Nenhuma troca pendente de aprovação</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingSwaps.map(request => (
                    <Card key={request.id} className="border-l-4 border-l-warning">
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="font-medium mb-2">
                              {request.requesterName} ⇄ {request.targetName}
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                              <div className="bg-muted/30 rounded p-3">
                                <div className="text-sm font-medium text-primary mb-1">📍 DE (Origem):</div>
                                <div className="text-xs space-y-1">
                                  <div><span className="font-medium">Data:</span> {request.originalDate}</div>
                                  <div><span className="font-medium">Turno:</span> {getShiftName(request.originalShift)}</div>
                                  <div><span className="font-medium">Operador:</span> {request.requesterName}</div>
                                </div>
                              </div>
                              
                              <div className="bg-muted/30 rounded p-3">
                                <div className="text-sm font-medium text-secondary mb-1">🎯 PARA (Destino):</div>
                                <div className="text-xs space-y-1">
                                  <div><span className="font-medium">Data:</span> {request.targetDate}</div>
                                  <div><span className="font-medium">Turno:</span> {getShiftName(request.targetShift)}</div>
                                  <div><span className="font-medium">Operador:</span> {request.targetName}</div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="text-xs text-success">
                              ✓ Aceito pelo colega
                            </div>
                          </div>
                          
                          <div className="flex gap-2 ml-4">
                            <Button
                              size="sm"
                              onClick={() => handleApproveSwap(request.id)}
                              className="bg-success hover:bg-success/90"
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Aprovar
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRejectSwap(request.id)}
                            >
                              <X className="w-4 h-4 mr-1" />
                              Recusar
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Férias Tab */}
        <TabsContent value="vacations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plane className="w-5 h-5 text-warning" />
                Solicitações de Férias
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pendingVacations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Plane className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Nenhuma solicitação de férias pendente</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingVacations.map(request => (
                    <Card key={request.id} className="border-l-4 border-l-warning">
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="font-medium mb-2">
                              {request.userName}
                            </div>
                            
                            <div className="bg-muted/30 rounded p-3 mb-3">
                              <div className="text-sm space-y-1">
                                <div><span className="font-medium">Período:</span> {request.startDate} até {request.endDate}</div>
                                <div><span className="font-medium">Dias:</span> {request.totalDays} dias</div>
                                <div><span className="font-medium">Motivo:</span> {request.reason || 'Não especificado'}</div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex gap-2 ml-4">
                            <Button
                              size="sm"
                              onClick={() => handleApproveVacation(request.id)}
                              className="bg-success hover:bg-success/90"
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Aprovar
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRejectVacation(request.id)}
                            >
                              <X className="w-4 h-4 mr-1" />
                              Recusar
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Histórico Tab */}
        <TabsContent value="history" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Histórico de Trocas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-success" />
                  Histórico de Trocas
                </CardTitle>
              </CardHeader>
              <CardContent>
                {completedSwaps.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground text-sm">
                    Nenhuma troca no histórico
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {completedSwaps.map(request => (
                      <div key={request.id} className="flex items-center justify-between p-3 bg-muted/30 rounded">
                        <div className="flex-1">
                          <div className="font-medium text-sm">{request.requesterName} ⇄ {request.targetName}</div>
                          <div className="text-xs text-muted-foreground">
                            {request.originalDate} → {request.targetDate}
                          </div>
                        </div>
                        <Badge variant={request.status === 'approved' ? 'default' : 'destructive'}>
                          {request.status === 'approved' ? 'Aprovada' : 'Rejeitada'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Histórico de Férias */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-info" />
                  Histórico de Férias
                </CardTitle>
              </CardHeader>
              <CardContent>
                {completedVacations.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground text-sm">
                    Nenhuma solicitação de férias no histórico
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {completedVacations.map(request => (
                      <div key={request.id} className="flex items-center justify-between p-3 bg-muted/30 rounded">
                        <div className="flex-1">
                          <div className="font-medium text-sm">{request.userName}</div>
                          <div className="text-xs text-muted-foreground">
                            {request.startDate} - {request.endDate} ({request.totalDays} dias)
                          </div>
                        </div>
                        <Badge variant={request.status === 'approved' ? 'default' : 'destructive'}>
                          {request.status === 'approved' ? 'Aprovada' : 'Rejeitada'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ManagementPanel;

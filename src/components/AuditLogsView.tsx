import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Filter, Download, Eye, Calendar, User, Activity, Shield, Clock, CheckCircle, XCircle } from 'lucide-react';
import { AuditLog, getAuditLogs, getAuditLogsByUser, getAuditLogsByAction, getAuditLogsByDateRange } from '@/data/auditLogs';
import { useAuth } from '@/contexts/AuthContext';

const AuditLogsView: React.FC = () => {
  const { currentUser } = useAuth();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAction, setSelectedAction] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [showDetails, setShowDetails] = useState<string | null>(null);

  const loadLogs = () => {
    const allLogs = getAuditLogs();
    setLogs(allLogs);
  };

  const filterLogs = useCallback(() => {
    let filtered = [...logs];

    // Filtro por termo de busca
    if (searchTerm) {
      filtered = filtered.filter(log => 
        log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.action.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro por ação
    if (selectedAction !== 'all') {
      filtered = filtered.filter(log => log.action === selectedAction);
    }

    // Filtro por usuário
    if (selectedUser !== 'all') {
      filtered = filtered.filter(log => log.userId === selectedUser);
    }

    // Filtro por data
    if (dateFilter !== 'all') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      filtered = filtered.filter(log => {
        const logDate = new Date(log.timestamp);
        logDate.setHours(0, 0, 0, 0);
        
        switch (dateFilter) {
          case 'today':
            return logDate.getTime() === today.getTime();
          case 'week': {
            const weekAgo = new Date(today);
            weekAgo.setDate(weekAgo.getDate() - 7);
            return logDate >= weekAgo;
          }
          case 'month':
            return logDate.getMonth() === today.getMonth() && 
                   logDate.getFullYear() === today.getFullYear();
          default:
            return true;
        }
      });
    }

    setFilteredLogs(filtered);
  }, [logs, searchTerm, selectedAction, selectedUser, dateFilter]);

  useEffect(() => {
    loadLogs();
  }, []);

  useEffect(() => {
    filterLogs();
  }, [logs, searchTerm, selectedAction, selectedUser, dateFilter, filterLogs]);

  const getActionBadgeVariant = (action: AuditLog['action']) => {
    switch (action) {
      case 'LOGIN':
      case 'ADMIN_LOGIN':
        return 'default';
      case 'LOGOUT':
        return 'secondary';
      case 'PASSWORD_CHANGE':
        return 'outline';
      case 'SWAP_REQUEST':
        return 'default';
      case 'SWAP_RESPONSE':
        return 'secondary';
      case 'SWAP_APPROVAL':
        return 'default';
      case 'SCHEDULE_IMPORT':
        return 'outline';
      case 'USER_CREATE':
        return 'default';
      case 'USER_UPDATE':
        return 'secondary';
      case 'USER_DELETE':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getActionIcon = (action: AuditLog['action']) => {
    switch (action) {
      case 'LOGIN':
      case 'ADMIN_LOGIN':
        return <User className="h-4 w-4" />;
      case 'LOGOUT':
        return <User className="h-4 w-4" />;
      case 'PASSWORD_CHANGE':
        return <Shield className="h-4 w-4" />;
      case 'SWAP_REQUEST':
      case 'SWAP_RESPONSE':
      case 'SWAP_APPROVAL':
        return <Activity className="h-4 w-4" />;
      case 'SCHEDULE_IMPORT':
        return <Calendar className="h-4 w-4" />;
      case 'USER_CREATE':
      case 'USER_UPDATE':
      case 'USER_DELETE':
        return <User className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const exportLogs = () => {
    const csvContent = [
      ['Data/Hora', 'Usuário', 'Ação', 'Detalhes', 'IP', 'Sucesso'],
      ...filteredLogs.map(log => [
        formatTimestamp(log.timestamp),
        log.userName,
        log.action,
        log.details,
        log.ipAddress || 'N/A',
        log.success ? 'Sim' : 'Não'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit_logs_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const uniqueUsers = Array.from(new Map(logs.map(log => [log.userId, log.userName])).values());

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Logs de Auditoria</h2>
          <p className="text-muted-foreground">
            Visualize todas as atividades do sistema
          </p>
        </div>
        <Button onClick={exportLogs} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Exportar CSV
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedAction} onValueChange={setSelectedAction}>
              <SelectTrigger>
                <SelectValue placeholder="Todas as ações" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as ações</SelectItem>
                <SelectItem value="LOGIN">Login</SelectItem>
                <SelectItem value="LOGOUT">Logout</SelectItem>
                <SelectItem value="PASSWORD_CHANGE">Troca de Senha</SelectItem>
                <SelectItem value="SWAP_REQUEST">Solicitação de Troca</SelectItem>
                <SelectItem value="SWAP_RESPONSE">Resposta de Troca</SelectItem>
                <SelectItem value="SWAP_APPROVAL">Aprovação de Troca</SelectItem>
                <SelectItem value="SCHEDULE_IMPORT">Importação de Escala</SelectItem>
                <SelectItem value="USER_CREATE">Criação de Usuário</SelectItem>
                <SelectItem value="USER_UPDATE">Atualização de Usuário</SelectItem>
                <SelectItem value="USER_DELETE">Exclusão de Usuário</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedUser} onValueChange={setSelectedUser}>
              <SelectTrigger>
                <SelectValue placeholder="Todos os usuários" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os usuários</SelectItem>
                {uniqueUsers.map(user => (
                  <SelectItem key={user} value={user}>{user}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Todas as datas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as datas</SelectItem>
                <SelectItem value="today">Hoje</SelectItem>
                <SelectItem value="week">Últimos 7 dias</SelectItem>
                <SelectItem value="month">Último mês</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Logs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Logs do Sistema ({filteredLogs.length})
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data/Hora</TableHead>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Ação</TableHead>
                  <TableHead>Detalhes</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Nenhum log encontrado com os filtros selecionados
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-mono text-sm">
                        {formatTimestamp(log.timestamp)}
                      </TableCell>
                      <TableCell className="font-medium">
                        {log.userName}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getActionBadgeVariant(log.action)} className="flex items-center gap-1 w-fit">
                          {getActionIcon(log.action)}
                          {log.action.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {log.details}
                      </TableCell>
                      <TableCell>
                        {log.success ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowDetails(showDetails === log.id ? null : log.id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Detalhes do Log */}
          {showDetails && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-sm">Detalhes do Log</CardTitle>
              </CardHeader>
              <CardContent>
                {(() => {
                  const log = filteredLogs.find(l => l.id === showDetails);
                  if (!log) return null;
                  
                  return (
                    <div className="space-y-2 text-sm">
                      <div><strong>ID:</strong> {log.id}</div>
                      <div><strong>Data/Hora:</strong> {formatTimestamp(log.timestamp)}</div>
                      <div><strong>Usuário:</strong> {log.userName} ({log.userId})</div>
                      <div><strong>Ação:</strong> {log.action}</div>
                      <div><strong>Detalhes:</strong> {log.details}</div>
                      <div><strong>IP:</strong> {log.ipAddress || 'N/A'}</div>
                      <div><strong>User Agent:</strong> {log.userAgent || 'N/A'}</div>
                      <div><strong>Status:</strong> {log.success ? 'Sucesso' : 'Falha'}</div>
                      {log.errorMessage && (
                        <div><strong>Erro:</strong> {log.errorMessage}</div>
                      )}
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AuditLogsView;

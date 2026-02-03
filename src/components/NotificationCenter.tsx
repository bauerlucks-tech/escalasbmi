import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSwap } from '@/contexts/SwapContext';
import { Bell, X, CheckCircle, AlertCircle, Clock } from 'lucide-react';

interface Notification {
  id: string;
  type: 'pending_request' | 'accepted_request' | 'approved_request';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

const NotificationCenter: React.FC = () => {
  const { currentUser } = useAuth();
  const { getRequestsForMe, getPendingAdminApproval, getMyNotifications } = useSwap();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!currentUser) return;

    // Buscar notificações para o usuário atual
    const pendingRequests = getRequestsForMe(currentUser.name);
    const pendingApproval = getPendingAdminApproval();
    const myNotifications = getMyNotifications(currentUser.id, currentUser.name);

    const newNotifications: Notification[] = [];

    // Notificações de solicitações para mim
    pendingRequests.forEach(request => {
      newNotifications.push({
        id: `pending_${request.id}`,
        type: 'pending_request',
        title: 'Solicitação de Troca',
        message: `${request.requesterName} quer trocar ${request.originalDate} ⇄ ${request.targetDate}`,
        timestamp: request.createdAt,
        read: false
      });
    });

    // Notificações para admin aprovar
    if (currentUser.role === 'administrador' || currentUser.role === 'super_admin') {
      pendingApproval.forEach(request => {
        newNotifications.push({
          id: `approval_${request.id}`,
          type: 'accepted_request',
          title: 'Aprovação Necessária',
          message: `${request.requesterName} ⇄ ${request.targetName} - ${request.originalDate} ⇄ ${request.targetDate}`,
          timestamp: request.respondedAt || request.createdAt,
          read: false
        });
      });
    }

    // Notificações de minhas solicitações aprovadas
    myNotifications.forEach(request => {
      if (request.status === 'approved') {
        newNotifications.push({
          id: `approved_${request.id}`,
          type: 'approved_request',
          title: 'Troca Aprovada! ✅',
          message: `Sua troca com ${request.targetName} foi aprovada por ${request.adminApprovedBy}`,
          timestamp: request.adminApprovedAt || request.createdAt,
          read: false
        });
      }
    });

    setNotifications(newNotifications);
  }, [currentUser, getRequestsForMe, getPendingAdminApproval, getMyNotifications]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'pending_request':
        return <AlertCircle className="w-4 h-4 text-warning" />;
      case 'accepted_request':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'approved_request':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  if (!currentUser) return null;

  return (
    <div className="relative">
      {/* Botão de notificações */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-muted transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Painel de notificações */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-background border border-border rounded-lg shadow-lg z-50 max-h-96 overflow-hidden">
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Notificações</h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    Marcar todas como lidas
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-muted rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>Nenhuma notificação</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {notifications.map(notification => (
                  <div
                    key={notification.id}
                    className={`p-3 hover:bg-muted/50 cursor-pointer transition-colors ${
                      !notification.read ? 'bg-muted/30' : ''
                    }`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex items-start gap-3">
                      {getIcon(notification.type)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-sm">{notification.title}</p>
                          {!notification.read && (
                            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(notification.timestamp).toLocaleString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;

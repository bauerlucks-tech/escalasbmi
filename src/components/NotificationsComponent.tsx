import React, { useState, useEffect } from 'react';
import { Bell, X, Check, Clock, AlertCircle } from 'lucide-react';

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const NotificationCenter: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const checkForNewNotifications = () => {
    // Check for pending swap requests
    const swapsData = localStorage.getItem('escala_swapRequests');
    const swaps = swapsData ? JSON.parse(swapsData) : [];
    const pendingSwaps = swaps.filter((s: any) => s.status === 'pending');

    // Check for pending vacation requests
    const vacationsData = localStorage.getItem('escala_vacationRequests');
    const vacations = vacationsData ? JSON.parse(vacationsData) : [];
    const pendingVacations = vacations.filter((v: any) => v.status === 'pending');

    // Get current notifications to avoid stale closure
    setNotifications(currentNotifications => {
      // Add notifications for new pending requests
      pendingSwaps.forEach((swap: any) => {
        const existingNotification = currentNotifications.find(n => 
          n.message.includes(swap.id) && n.type === 'warning'
        );
        
        if (!existingNotification) {
          const newNotification = {
            id: Date.now().toString() + Math.random(),
            type: 'warning' as const,
            title: 'Nova Solicitação de Troca',
            message: `${swap.requesterName} solicitou troca com ${swap.targetName}`,
            timestamp: new Date(),
            read: false,
            action: {
              label: 'Ver Detalhes',
              onClick: () => window.location.hash = '#swap'
            }
          };
          currentNotifications = [newNotification, ...currentNotifications];
        }
      });

      pendingVacations.forEach((vacation: any) => {
        const existingNotification = currentNotifications.find(n => 
          n.message.includes(vacation.id) && n.type === 'info'
        );
        
        if (!existingNotification) {
          const newNotification = {
            id: Date.now().toString() + Math.random(),
            type: 'info' as const,
            title: 'Nova Solicitação de Férias',
            message: `${vacation.operatorName} solicitou férias de ${vacation.startDate} a ${vacation.endDate}`,
            timestamp: new Date(),
            read: false,
            action: {
              label: 'Ver Detalhes',
              onClick: () => window.location.hash = '#vacations'
            }
          };
          currentNotifications = [newNotification, ...currentNotifications];
        }
      });

      return currentNotifications.slice(0, 50); // Keep only last 50
    });
  };

  useEffect(() => {
    // Update unread count
    const count = notifications.filter(n => !n.read).length;
    setUnreadCount(count);
    
    // Save to localStorage
    localStorage.setItem('escala_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    // Load notifications from localStorage
    const saved = localStorage.getItem('escala_notifications');
    if (saved) {
      const parsed = JSON.parse(saved);
      setNotifications(parsed.map((n: any) => ({
        ...n,
        timestamp: new Date(n.timestamp)
      })));
    }

    // Check for new notifications every 30 seconds
    const interval = setInterval(checkForNewNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, read: true }))
    );
    // Force immediate update of unread count
    setUnreadCount(0);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success': return <Check className="w-4 h-4 text-green-500" />;
      case 'warning': return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'error': return <X className="w-4 h-4 text-red-500" />;
      default: return <Bell className="w-4 h-4 text-blue-500" />;
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Agora';
    if (minutes < 60) return `${minutes} min`;
    if (hours < 24) return `${hours} h`;
    return `${days} d`;
  };

  return (
    <div className="relative">
      {/* Notification Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-muted transition-colors"
        title="Notificações"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white">Notificações</h3>
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Marcar todas como lidas
                </button>
              )}
              <button
                onClick={clearAll}
                className="text-xs text-red-600 dark:text-red-400 hover:underline"
              >
                Limpar
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>Nenhuma notificação</p>
              </div>
            ) : (
              notifications.map(notification => (
                <div
                  key={notification.id}
                  className={`p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 ${
                    !notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {getIcon(notification.type)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-gray-900 dark:text-white text-sm">
                          {notification.title}
                        </p>
                        <button
                          onClick={() => removeNotification(notification.id)}
                          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 text-xs mt-1">
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-500 dark:text-gray-500">
                          {formatTime(notification.timestamp)}
                        </span>
                        {notification.action && (
                          <button
                            onClick={() => {
                              notification.action!.onClick();
                              setIsOpen(false);
                            }}
                            className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            {notification.action.label}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default NotificationCenter;

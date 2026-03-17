import React, { useEffect } from 'react';
import { toast } from 'sonner';
import { useNotifications } from '@/hooks/useNotifications';
import { useAuth } from '@/contexts/AuthContext';
import { useSwap } from '@/contexts/SwapContext';
import { useVacation } from '@/contexts/VacationContext';

const NotificationsToast: React.FC = () => {
  const { currentUser } = useAuth();
  const { getMyNotifications } = useSwap();
  const { getVacationsByOperator } = useVacation();
  const { 
    permission, 
    requestPermission, 
    showNotification, 
    isSupported 
  } = useNotifications();

  useEffect(() => {
    if (!currentUser || !isSupported) return;

    // Request permission on first load
    if (permission === 'default') {
      requestPermission();
    }

    // Set up notification listeners
    const setupNotifications = () => {
      // Listen for swap updates
      const swapNotifications = getMyNotifications(currentUser.id);
      
      // Listen for vacation updates
      const vacationNotifications = getVacationsByOperator(currentUser.id);

      // Show browser notifications for important events
      if (permission === 'granted') {
        // Notify about new swap requests
        for (const swap of swapNotifications) {
          if (swap.status === 'pending') {
            showNotification('Nova Solicitação de Troca', {
              body: `${swap.targetName} solicitou uma troca com você`,
              icon: '/favicon.ico'
            });
          } else if (swap.status === 'approved') {
            showNotification('Troca Aprovada!', {
              body: 'Sua solicitação de troca foi aprovada pelo administrador',
              icon: '/favicon.ico'
            });
          }
        }

        // Notify about vacation updates
        for (const vacation of vacationNotifications) {
          if (vacation.status === 'approved') {
            showNotification('Férias Aprovadas!', {
              body: `Suas férias de ${vacation.totalDays} dias foram aprovadas`,
              icon: '/favicon.ico'
            });
          }
        }
      }
    };

    // Initial setup
    setupNotifications();

    // Set up interval to check for new notifications
    const interval = setInterval(setupNotifications, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [currentUser, permission, isSupported, getMyNotifications, getVacationsByOperator, showNotification, requestPermission]);

  // This component doesn't render anything visible
  return null;
};

export default NotificationsToast;

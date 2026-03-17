import { useState, useEffect } from 'react';

// Global declarations for browser APIs
declare global {
  interface Window {
    Notification: {
      new (title: string, options?: NotificationOptions): any;
      readonly permission: NotificationPermission;
      requestPermission(): Promise<NotificationPermission>;
    };
  }
  
  var window: Window;
  
  interface Notification {
    new (title: string, options?: NotificationOptions): any;
    readonly permission: NotificationPermission;
    requestPermission(): Promise<NotificationPermission>;
  }
  
  var Notification: {
    new (title: string, options?: NotificationOptions): any;
    readonly permission: NotificationPermission;
    requestPermission(): Promise<NotificationPermission>;
  };
  
  interface Promise<T> {
    then<TResult1 = T, TResult2 = never>(
      onfulfilled?: ((value: T) => TResult1 | any) | null,
      onrejected?: ((reason: any) => TResult2 | any) | null
    ): Promise<TResult1 | TResult2>;
    catch<TResult = never>(
      onrejected?: ((reason: any) => TResult | any) | null
    ): Promise<T | TResult>;
  }
}

// Simplified types for better compatibility
type NotificationPermission = 'default' | 'granted' | 'denied';

interface NotificationOptions {
  body?: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: any;
  requireInteraction?: boolean;
  silent?: boolean;
}

interface UseNotificationsReturn {
  permission: NotificationPermission;
  requestPermission: () => Promise<boolean>;
  showNotification: (title: string, options?: NotificationOptions) => void;
  isSupported: boolean;
}

export const useNotifications = (): UseNotificationsReturn => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // Check if notifications are supported
    const supported = 'Notification' in window;
    setIsSupported(supported);

    if (supported) {
      // Get current permission
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async (): Promise<boolean> => {
    // Check directly instead of relying on stale closure; SSR-safe
    if (typeof window === 'undefined' || !('Notification' in window)) {
      console.warn('Notifications not supported');
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  };

  const showNotification = (title: string, options?: NotificationOptions) => {
    // Check directly instead of relying on stale closure; SSR-safe
    if (typeof window === 'undefined' || typeof Notification === 'undefined' || Notification.permission !== 'granted') {
      console.warn('Notifications not permitted');
      return;
    }

    try {
      new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        ...options
      });
    } catch (error) {
      console.error('Error showing notification:', error);
    }
  };

  return {
    permission,
    requestPermission,
    showNotification,
    isSupported
  };
};

// Global type declarations for browser APIs
declare global {
  interface Window {
    Notification: {
      new (title: string, options?: NotificationOptions): Notification;
      readonly permission: NotificationPermission;
      static requestPermission(): Promise<NotificationPermission>;
    };
  }
  
  interface Navigator {
    // Add navigator methods if needed
  }
  
  interface Notification {
    readonly permission: NotificationPermission;
    close(): void;
  }

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
}

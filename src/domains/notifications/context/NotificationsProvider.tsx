import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import type { HubConnection } from '@microsoft/signalr';
import { notificationsApi } from '../services/notificationsApi';
import { createNotificationHubConnection } from '../services/notificationHub';
import type { Notification } from '../models/notification.model';
import { getActiveCriticalAlerts, getHighestPriorityActiveCriticalAlert, isCriticalNotification } from '../models/notification.model';
import { NotificationsContext } from './NotificationsContext';
import type { NotificationsContextValue } from './NotificationsContext';

const sortByCreatedAtDesc = (items: Notification[]): Notification[] => {
  return [...items].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

const upsertNotificationFirst = (items: Notification[], notification: Notification): Notification[] => {
  const withoutCurrent = items.filter(
    (item) => item.notificationLogId !== notification.notificationLogId,
  );
  return [notification, ...withoutCurrent];
};

export const NotificationsProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const connectionRef = useRef<HubConnection | null>(null);

  const refreshNotifications = useCallback(async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return;
    }

    setIsLoading(true);
    try {
      const data = await notificationsApi.getNotifications();
      setNotifications(sortByCreatedAtDesc(data));
    } catch (error) {
      console.warn('No se pudieron cargar las notificaciones.', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const stopConnection = useCallback(async () => {
    const connection = connectionRef.current;
    connectionRef.current = null;
    setIsConnected(false);

    if (!connection) {
      return;
    }

    try {
      await connection.stop();
    } catch (error) {
      console.warn('No se pudo detener SignalR de notificaciones.', error);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return;
    }

    let isMounted = true;

    const startNotifications = async () => {
      await refreshNotifications();

      if (!isMounted || !localStorage.getItem('authToken')) {
        return;
      }

      const connection = createNotificationHubConnection((notification) => {
        setNotifications((current) => upsertNotificationFirst(current, notification));
      });

      connectionRef.current = connection;

      try {
        await connection.start();
        if (isMounted) {
          setIsConnected(true);
        }
      } catch (error) {
        console.warn('No se pudo iniciar SignalR de notificaciones.', error);
        if (isMounted) {
          setIsConnected(false);
        }
      }
    };

    startNotifications();

    return () => {
      isMounted = false;
      void stopConnection();
    };
  }, [refreshNotifications, stopConnection]);

  const markAsRead = useCallback(async (id: number) => {
    try {
      await notificationsApi.markAsRead(id);
      const readAt = new Date().toISOString();
      setNotifications((current) =>
        current.map((notification) =>
          notification.notificationLogId === id ? { ...notification, readAt } : notification,
        ),
      );
    } catch (error) {
      console.warn(`No se pudo marcar como leída la notificación ${id}.`, error);
    }
  }, []);

  const acknowledge = useCallback(async (id: number) => {
    try {
      await notificationsApi.acknowledge(id);
      const acknowledgedAt = new Date().toISOString();
      setNotifications((current) =>
        current.map((notification) =>
          notification.notificationLogId === id
            ? { ...notification, acknowledgedAt, readAt: notification.readAt || acknowledgedAt }
            : notification,
        ),
      );
    } catch (error) {
      console.warn(`No se pudo confirmar la notificación ${id}.`, error);
    }
  }, []);

  const logoutNotifications = useCallback(async () => {
    await stopConnection();
    setNotifications([]);
  }, [stopConnection]);

  const unreadNotifications = useMemo(() => {
    return notifications.filter((notification) => !notification.readAt);
  }, [notifications]);

  const criticalUnreadNotifications = useMemo(() => {
    return unreadNotifications.filter(isCriticalNotification);
  }, [unreadNotifications]);

  const activeCriticalAlerts = useMemo(() => {
    return getActiveCriticalAlerts(notifications);
  }, [notifications]);

  const activeCriticalAlert = useMemo(() => {
    return getHighestPriorityActiveCriticalAlert(notifications);
  }, [notifications]);

  const value = useMemo<NotificationsContextValue>(() => ({
    notifications,
    unreadCount: unreadNotifications.length,
    criticalUnreadCount: criticalUnreadNotifications.length,
    activeCriticalCount: activeCriticalAlerts.length,
    latestCriticalUnread: criticalUnreadNotifications[0] || null,
    activeCriticalAlert,
    isLoading,
    isConnected,
    markAsRead,
    acknowledge,
    refreshNotifications,
    logoutNotifications,
  }), [
    notifications,
    unreadNotifications.length,
    criticalUnreadNotifications,
    activeCriticalAlerts.length,
    activeCriticalAlert,
    isLoading,
    isConnected,
    markAsRead,
    acknowledge,
    refreshNotifications,
    logoutNotifications,
  ]);

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
};

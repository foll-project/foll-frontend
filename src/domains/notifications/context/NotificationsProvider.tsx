import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import type { HubConnection } from '@microsoft/signalr';
import { notificationsApi } from '../services/notificationsApi';
import { createNotificationHubConnection } from '../services/notificationHub';
import type { DeviceTelemetryRealtime, IncidentResolvedRealtime } from '../services/notificationHub';
import { incidentsApi } from '../../emergencias/services/incidentsApi';
import { getCurrentUserId } from '../../../shared/api/session';
import type { Notification } from '../models/notification.model';
import { getActiveCriticalAlerts, getHighestPriorityActiveCriticalAlert, isCriticalNotification } from '../models/notification.model';
import { NotificationsContext } from './NotificationsContext';
import type { NotificationsContextValue, ResolvedIncidentEvent } from './NotificationsContext';

const sortByCreatedAtDesc = (items: Notification[]): Notification[] => {
  return [...items].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

const upsertNotificationFirst = (items: Notification[], notification: Notification): Notification[] => {
  const withoutCurrent = items.filter(
    (item) => item.notificationLogId !== notification.notificationLogId,
  );
  return [notification, ...withoutCurrent];
};

/**
 * Marca localmente como "atendidas" todas las caídas (FallDetected) sin confirmar
 * de un paciente. Se usa tanto cuando este usuario atiende como cuando otro cuidador
 * lo hace y nos llega el evento incident.resolved.
 */
const acknowledgeFallsForPatient = (items: Notification[], patientId: number): Notification[] => {
  const acknowledgedAt = new Date().toISOString();
  return items.map((notification) =>
    notification.notificationType === 'FallDetected' &&
    notification.patientId === patientId &&
    !notification.acknowledgedAt
      ? { ...notification, acknowledgedAt, readAt: notification.readAt || acknowledgedAt }
      : notification,
  );
};

export const NotificationsProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [deviceTelemetry, setDeviceTelemetry] = useState<Record<number, DeviceTelemetryRealtime>>({});
  const [lastResolvedIncident, setLastResolvedIncident] = useState<ResolvedIncidentEvent | null>(null);
  const connectionRef = useRef<HubConnection | null>(null);

  const handleIncidentResolved = useCallback((event: IncidentResolvedRealtime) => {
    // 1. Limpiamos al instante cualquier alerta de caída activa de ese paciente
    //    (cierra overlays/banners para TODOS los cuidadores).
    setNotifications((current) => acknowledgeFallsForPatient(current, event.patientId));

    // 2. Publicamos el evento para el aviso global "quién atendió".
    const currentUserId = getCurrentUserId();
    setLastResolvedIncident({
      ...event,
      receivedAt: Date.now(),
      resolvedByMe: event.closedByUserId != null && Number(event.closedByUserId) === currentUserId,
    });
  }, []);

  const dismissResolvedIncident = useCallback(() => {
    setLastResolvedIncident(null);
  }, []);

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

      const connection = createNotificationHubConnection({
        onNotificationCreated: (notification) => {
          setNotifications((current) => upsertNotificationFirst(current, notification));
        },
        onDeviceTelemetry: (telemetry) => {
          setDeviceTelemetry((current) => ({ ...current, [telemetry.patientId]: telemetry }));
        },
        onIncidentResolved: handleIncidentResolved,
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
  }, [refreshNotifications, stopConnection, handleIncidentResolved]);

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

  /**
   * Cierra la caída activa de un paciente en el backend. Como varios cuidadores
   * pueden intentar atender a la vez, tratamos 400/404 (incidente ya cerrado por
   * otro) como éxito silencioso. En todos los casos limpiamos el estado local.
   */
  const closeActiveIncident = useCallback(
    async (patientId: number, mode: 'resolve' | 'falsePositive') => {
      try {
        const incident = await incidentsApi.getActiveByPatient(patientId);
        if (incident) {
          if (mode === 'resolve') {
            await incidentsApi.resolve(incident.incidentId);
          } else {
            await incidentsApi.markFalsePositive(incident.incidentId);
          }
        }
      } catch (error) {
        // Si otro cuidador ya lo cerró el backend responde error: lo ignoramos.
        console.warn('No se pudo cerrar el incidente (posiblemente ya atendido por otro).', error);
      } finally {
        // Limpieza local inmediata para quien ejecuta la acción.
        setNotifications((current) => acknowledgeFallsForPatient(current, patientId));
      }
    },
    [],
  );

  const attendFall = useCallback(
    (patientId: number) => closeActiveIncident(patientId, 'resolve'),
    [closeActiveIncident],
  );

  const markFallAsFalseAlarm = useCallback(
    (patientId: number) => closeActiveIncident(patientId, 'falsePositive'),
    [closeActiveIncident],
  );

  const logoutNotifications = useCallback(async () => {
    await stopConnection();
    setNotifications([]);
    setDeviceTelemetry({});
    setLastResolvedIncident(null);
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
    deviceTelemetry,
    lastResolvedIncident,
    dismissResolvedIncident,
    markAsRead,
    acknowledge,
    attendFall,
    markFallAsFalseAlarm,
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
    deviceTelemetry,
    lastResolvedIncident,
    dismissResolvedIncident,
    markAsRead,
    acknowledge,
    attendFall,
    markFallAsFalseAlarm,
    refreshNotifications,
    logoutNotifications,
  ]);

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
};

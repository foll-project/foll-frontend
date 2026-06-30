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
import type { ApiError } from '../../../shared/api/client';

const sortByCreatedAtDesc = (items: Notification[]): Notification[] => {
  return [...items].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

const upsertNotificationFirst = (items: Notification[], notification: Notification): Notification[] => {
  const withoutCurrent = items.filter(
    (item) => item.notificationLogId !== notification.notificationLogId,
  );
  return [notification, ...withoutCurrent];
};

/** Conserva acknowledgedAt local si el payload entrante aún no lo trae. */
const upsertNotificationPreservingAcknowledged = (
  items: Notification[],
  notification: Notification,
): Notification[] => {
  const existing = items.find((n) => n.notificationLogId === notification.notificationLogId);
  const merged =
    existing?.acknowledgedAt && !notification.acknowledgedAt
      ? {
          ...notification,
          acknowledgedAt: existing.acknowledgedAt,
          readAt: notification.readAt || existing.readAt || existing.acknowledgedAt,
        }
      : notification;
  return upsertNotificationFirst(items, merged);
};

const mergeAcknowledgedAt = (remote: string | null | undefined, local: string | null | undefined): string | null | undefined => {
  return remote?.trim() ? remote : local?.trim() ? local : remote;
};

const isApiError = (error: unknown): error is ApiError =>
  typeof error === 'object' && error !== null && 'status' in error;

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

/** Confirma en el servidor las notificaciones FallDetected pendientes de un paciente. */
const acknowledgeRemoteNotificationsForPatient = async (
  patientId: number,
  items: Notification[],
): Promise<void> => {
  const pending = items.filter(
    (n) =>
      n.notificationType === 'FallDetected' &&
      n.patientId === patientId &&
      !n.acknowledgedAt,
  );

  await Promise.all(
    pending.map(async (notification) => {
      try {
        await notificationsApi.acknowledge(notification.notificationLogId);
      } catch (error) {
        if (isApiError(error) && (error.status === 400 || error.status === 404)) {
          return;
        }
        console.warn(
          `No se pudo confirmar la notificación ${notification.notificationLogId} en el servidor.`,
          error,
        );
      }
    }),
  );
};

/**
 * Si hay caídas "activas" en la lista pero el backend ya no tiene incidente abierto,
 * las alinea (atendió otro cuidador, web/mobile previo sin acknowledge, etc.).
 */
const reconcileAttendedFallsWithBackend = async (items: Notification[]): Promise<Notification[]> => {
  let result = [...items];

  const patientIds = [
    ...new Set(
      result
        .filter(
          (n) =>
            n.notificationType === 'FallDetected' &&
            !n.acknowledgedAt &&
            n.patientId != null,
        )
        .map((n) => n.patientId as number),
    ),
  ];

  for (const patientId of patientIds) {
    const hasActiveIncident = await incidentsApi.getActiveByPatient(patientId);
    if (hasActiveIncident === null) {
      await acknowledgeRemoteNotificationsForPatient(patientId, result);
      result = acknowledgeFallsForPatient(result, patientId);
    }
  }

  return result;
};

export const NotificationsProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const notificationsRef = useRef<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [deviceTelemetry, setDeviceTelemetry] = useState<Record<number, DeviceTelemetryRealtime>>({});
  const [lastResolvedIncident, setLastResolvedIncident] = useState<ResolvedIncidentEvent | null>(null);
  const [connection, setConnection] = useState<HubConnection | null>(null);
  const connectionRef = useRef<HubConnection | null>(null);

  useEffect(() => {
    notificationsRef.current = notifications;
  }, [notifications]);

  const handleIncidentResolved = useCallback((event: IncidentResolvedRealtime) => {
    setNotifications((current) => {
      void acknowledgeRemoteNotificationsForPatient(event.patientId, current);
      return acknowledgeFallsForPatient(current, event.patientId);
    });

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
      const remote = await notificationsApi.getNotifications();
      const localById = new Map(
        notificationsRef.current.map((n) => [n.notificationLogId, n]),
      );

      const merged = remote.map((dto) => {
        const local = localById.get(dto.notificationLogId);
        return {
          ...dto,
          acknowledgedAt: mergeAcknowledgedAt(dto.acknowledgedAt, local?.acknowledgedAt),
          readAt: dto.readAt ?? local?.readAt,
        };
      });

      const reconciled = await reconcileAttendedFallsWithBackend(merged);
      setNotifications(sortByCreatedAtDesc(reconciled));
    } catch (error) {
      console.warn('No se pudieron cargar las notificaciones.', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const stopConnection = useCallback(async () => {
    const conn = connectionRef.current;
    connectionRef.current = null;
    setConnection(null);
    setIsConnected(false);

    if (!conn) {
      return;
    }

    try {
      await conn.stop();
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
          setNotifications((current) =>
            upsertNotificationPreservingAcknowledged(current, notification),
          );
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
          setConnection(connection);
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
   * otro) como éxito silencioso. Persiste acknowledge en el servidor para que F5
   * no vuelva a mostrar la alerta.
   */
  const closeActiveIncident = useCallback(
    async (patientId: number, mode: 'resolve' | 'falsePositive') => {
      const snapshot = notificationsRef.current;

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
        console.warn('No se pudo cerrar el incidente (posiblemente ya atendido por otro).', error);
      }

      await acknowledgeRemoteNotificationsForPatient(patientId, snapshot);
      setNotifications((current) => acknowledgeFallsForPatient(current, patientId));
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
    connection,
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
    connection,
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

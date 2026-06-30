import { createContext } from 'react';
import type { Notification } from '../models/notification.model';
import type { ActiveCriticalAlert } from '../models/notification.model';
import type { DeviceTelemetryRealtime, IncidentResolvedRealtime } from '../services/notificationHub';
import type { HubConnection } from '@microsoft/signalr';

export type ResolvedIncidentEvent = IncidentResolvedRealtime & {
  /** Marca temporal local para que el toast pueda re-disparar eventos repetidos. */
  receivedAt: number;
  /** True si la caída la atendió el usuario que tiene esta sesión abierta. */
  resolvedByMe: boolean;
};

export interface NotificationsContextValue {
  notifications: Notification[];
  unreadCount: number;
  criticalUnreadCount: number;
  activeCriticalCount: number;
  latestCriticalUnread: Notification | null;
  activeCriticalAlert: ActiveCriticalAlert | null;
  isLoading: boolean;
  isConnected: boolean;
  connection: HubConnection | null;
  /** Última telemetría por paciente, empujada por SignalR en cada heartbeat. */
  deviceTelemetry: Record<number, DeviceTelemetryRealtime>;
  /** Último evento de caída atendida (para el aviso global en vivo). */
  lastResolvedIncident: ResolvedIncidentEvent | null;
  dismissResolvedIncident: () => void;
  markAsRead: (id: number) => Promise<void>;
  acknowledge: (id: number) => Promise<void>;
  /** Atiende la caída activa de un paciente: cierra el incidente en el backend. */
  attendFall: (patientId: number) => Promise<void>;
  /** Marca la caída activa de un paciente como falsa alarma. */
  markFallAsFalseAlarm: (patientId: number) => Promise<void>;
  refreshNotifications: () => Promise<void>;
  logoutNotifications: () => Promise<void>;
}

export const NotificationsContext = createContext<NotificationsContextValue | null>(null);

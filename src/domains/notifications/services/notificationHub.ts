import * as signalR from '@microsoft/signalr';
import { API_CONFIG } from '../../../shared/api/config';
import type { Notification } from '../models/notification.model';

export const NOTIFICATION_CREATED_EVENT = 'notification.created';
export const DEVICE_TELEMETRY_EVENT = 'device.telemetry';
export const INCIDENT_RESOLVED_EVENT = 'incident.resolved';

/**
 * Telemetría ligera y efímera que el backend empuja en CADA heartbeat del
 * dispositivo (no se persiste). Reemplaza al antiguo polling cada X segundos.
 */
export interface DeviceTelemetryRealtime {
  deviceId: number;
  patientId: number;
  batteryLevel: number;
  isCharging: boolean;
  isOnline: boolean;
  lastHeartbeatAt: string;
}

/**
 * Evento de coordinación que avisa a TODOS los cuidadores que una caída fue
 * atendida/cerrada y POR QUIÉN.
 */
export interface IncidentResolvedRealtime {
  incidentKey: string;
  deviceId: number;
  patientId: number;
  status: string;
  cancellationReason?: string | null;
  closedByUserId?: number | null;
  closedByName?: string | null;
  closedAt: string;
  observation?: string | null;
  fallTypeName: string;
}

export interface NotificationHubHandlers {
  onNotificationCreated: (notification: Notification) => void;
  onDeviceTelemetry?: (telemetry: DeviceTelemetryRealtime) => void;
  onIncidentResolved?: (event: IncidentResolvedRealtime) => void;
}

export const createNotificationHubConnection = (
  handlers: NotificationHubHandlers,
): signalR.HubConnection => {
  const hubUrl = `${API_CONFIG.BASE_URL}/hubs/notifications`;

  const connection = new signalR.HubConnectionBuilder()
    .withUrl(hubUrl, {
      accessTokenFactory: () => localStorage.getItem('authToken') || '',
    })
    .withAutomaticReconnect()
    .configureLogging(signalR.LogLevel.Warning)
    .build();

  connection.on(NOTIFICATION_CREATED_EVENT, (payload: Notification) => {
    handlers.onNotificationCreated(payload);
  });

  connection.on(DEVICE_TELEMETRY_EVENT, (payload: DeviceTelemetryRealtime) => {
    handlers.onDeviceTelemetry?.(payload);
  });

  connection.on(INCIDENT_RESOLVED_EVENT, (payload: IncidentResolvedRealtime) => {
    console.log('[incident.resolved]', payload);
    handlers.onIncidentResolved?.(payload);
  });

  connection.onreconnecting((error) => {
    console.warn('Reconectando SignalR de notificaciones...', error);
  });

  connection.onreconnected(() => {
    console.log('SignalR de notificaciones reconectado.');
  });

  connection.onclose((error) => {
    if (error) {
      console.warn('SignalR de notificaciones cerrado con error.', error);
    }
  });

  return connection;
};

import * as signalR from '@microsoft/signalr';
import { API_CONFIG } from '../../../shared/api/config';
import type { Notification } from '../models/notification.model';

export const NOTIFICATION_CREATED_EVENT = 'notification.created';

export const createNotificationHubConnection = (
  onNotificationCreated: (notification: Notification) => void,
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
    console.log('[notification.created]', payload);
    onNotificationCreated(payload);
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

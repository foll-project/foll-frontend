import * as signalR from '@microsoft/signalr';
import { API_CONFIG } from '../../../shared/api/config';
import type { InvitationRealtimeEvent } from '../models/invitation.model';

export const INVITATION_CHANGED_EVENT = 'invitation.changed';

// Conexión SignalR dedicada a invitaciones. Reutiliza el mismo Hub que las
// notificaciones (/hubs/notifications) pero solo escucha "invitation.changed".
export const createInvitationHubConnection = (
  onInvitationChanged: (event: InvitationRealtimeEvent) => void,
): signalR.HubConnection => {
  const hubUrl = `${API_CONFIG.BASE_URL}/hubs/notifications`;

  const connection = new signalR.HubConnectionBuilder()
    .withUrl(hubUrl, {
      accessTokenFactory: () => localStorage.getItem('authToken') || '',
    })
    .withAutomaticReconnect()
    .configureLogging(signalR.LogLevel.Warning)
    .build();

  connection.on(INVITATION_CHANGED_EVENT, (payload: InvitationRealtimeEvent) => {
    console.log('[invitation.changed]', payload);
    onInvitationChanged(payload);
  });

  connection.onreconnecting((error) => {
    console.warn('Reconectando SignalR de invitaciones...', error);
  });

  connection.onreconnected(() => {
    console.log('SignalR de invitaciones reconectado.');
  });

  connection.onclose((error) => {
    if (error) {
      console.warn('SignalR de invitaciones cerrado con error.', error);
    }
  });

  return connection;
};

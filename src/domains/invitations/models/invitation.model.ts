export type InvitationStatus = 'Pending' | 'Accepted' | 'Rejected';

// Item de invitación devuelto por los endpoints REST (recibidas/enviadas).
export interface Invitation {
  invitationId: number;
  patientId: number;
  patientFirstName: string;
  patientLastName: string;
  patientName: string;
  patientDni: string;
  requesterUserId: number;
  requesterName: string;
  requesterEmail?: string | null;
  relationshipTypeId: number;
  relationshipName: string;
  status: InvitationStatus;
  expiresAt: string;
}

export type InvitationEventKind = 'created' | 'accepted' | 'rejected';

// Evento que llega en tiempo real por SignalR (evento "invitation.changed").
export interface InvitationRealtimeEvent {
  kind: InvitationEventKind;
  invitationId: number;
  patientId: number;
  patientName: string;
  requesterUserId: number;
  requesterName: string;
  relationshipTypeId: number;
  relationshipName: string;
  status: InvitationStatus;
  title: string;
  message: string;
  occurredAt: string;
}

export const isPending = (invitation: Invitation): boolean => invitation.status === 'Pending';

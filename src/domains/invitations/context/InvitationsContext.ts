import { createContext } from 'react';
import type { Invitation, InvitationRealtimeEvent } from '../models/invitation.model';

export interface InvitationsContextValue {
  received: Invitation[];
  sent: Invitation[];
  pendingReceivedCount: number;
  isLoading: boolean;
  isConnected: boolean;
  // Último evento en tiempo real (para toasts en cualquier vista).
  lastEvent: InvitationRealtimeEvent | null;
  dismissEvent: () => void;
  refreshAll: () => Promise<void>;
  accept: (id: number) => Promise<void>;
  reject: (id: number) => Promise<void>;
  createInvitation: (dni: string, relationshipTypeId: number) => Promise<void>;
  logoutInvitations: () => Promise<void>;
}

export const InvitationsContext = createContext<InvitationsContextValue | null>(null);

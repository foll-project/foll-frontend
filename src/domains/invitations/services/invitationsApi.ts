import { apiClient } from '../../../shared/api/client';
import { API_CONFIG } from '../../../shared/api/config';
import type { Invitation } from '../models/invitation.model';

export const invitationsApi = {
  getReceived(): Promise<Invitation[]> {
    return apiClient.get<Invitation[]>(API_CONFIG.INVITATIONS.RECEIVED);
  },

  getSent(): Promise<Invitation[]> {
    return apiClient.get<Invitation[]>(API_CONFIG.INVITATIONS.SENT);
  },

  accept(id: number): Promise<void> {
    return apiClient.post<void>(API_CONFIG.INVITATIONS.ACCEPT(id));
  },

  reject(id: number): Promise<void> {
    return apiClient.post<void>(API_CONFIG.INVITATIONS.REJECT(id));
  },

  create(dni: string, relationshipTypeId: number): Promise<{ invitationId: number }> {
    return apiClient.post<{ invitationId: number }>(API_CONFIG.INVITATIONS.CREATE(dni), {
      relationshipTypeId,
    });
  },
};

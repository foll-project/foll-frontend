import { apiClient } from '../../../shared/api/client';
import type { ApiError } from '../../../shared/api/client';
import { API_CONFIG } from '../../../shared/api/config';

export interface ActiveIncident {
  incidentId: number;
  incidentKey: string;
  deviceId: number;
  patientId: number;
  fallTypeId?: number | null;
  fallType?: {
    id: number;
    name: string;
    description?: string | null;
    severityLevel?: number | null;
  } | null;
  status: string;
  openedAt?: string | null;
  lastSignalAt?: string | null;
  aiConfidenceScore?: number | null;
  latitude?: number | null;
  longitude?: number | null;
  finalObservation?: string | null;
}

const isApiError = (error: unknown): error is ApiError => {
  return typeof error === 'object' && error !== null && 'status' in error;
};

export const incidentsApi = {
  /**
   * Devuelve la caída activa (abierta) de un paciente o `null` si no existe.
   * El backend responde 404 cuando no hay incidente abierto: lo tratamos como null.
   */
  async getActiveByPatient(patientId: number): Promise<ActiveIncident | null> {
    try {
      return await apiClient.get<ActiveIncident>(API_CONFIG.EMERGENCY.ACTIVE_BY_PATIENT(patientId));
    } catch (error) {
      if (isApiError(error) && (error.status === 404 || error.status === 400)) {
        return null;
      }
      throw error;
    }
  },

  resolve(incidentId: number, observation?: string | null): Promise<void> {
    return apiClient.post<void>(API_CONFIG.EMERGENCY.RESOLVE(incidentId), {
      observation: observation ?? null,
    });
  },

  markFalsePositive(incidentId: number, observation?: string | null): Promise<void> {
    return apiClient.post<void>(API_CONFIG.EMERGENCY.FALSE_POSITIVE(incidentId), {
      observation: observation ?? null,
    });
  },
};

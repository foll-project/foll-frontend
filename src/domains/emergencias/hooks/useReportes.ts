import { useState } from 'react';
import { apiClient } from '../../../shared/api/client.ts';
import { API_CONFIG } from '../../../shared/api/config.ts';

export interface IncidentReport {
  incidentId: number;
  incidentKey: string;
  patientId: number;
  deviceId: number;
  fallType: {
    id: number;
    name: string;
    description: string;
    severityLevel: string;
  } | null;
  status: string;
  openedAt: string;
  resolvedAt: string | null;
  cancelledAt: string | null;
  latitude: number | null;
  longitude: number | null;
}

export const useReportes = () => {
  const [incidents, setIncidents] = useState<IncidentReport[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMonthlyFalls = async (patientId: number, month: number, year: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const url = API_CONFIG.PATIENTS.GET_MONTHLY_FALLS(patientId, month, year);
      const response = await apiClient.get<IncidentReport[]>(url);
      setIncidents(response || []);
    } catch (err: any) {
      console.error('Error fetching monthly falls:', err);
      setError(err?.message || 'Error al obtener los incidentes.');
      setIncidents([]);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    incidents,
    isLoading,
    error,
    fetchMonthlyFalls
  };
};

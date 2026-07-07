import type { Anotacion } from '../../iam/models/abuelito.model';

export type TipoEvento = 'Emergencia Real' | 'Falso Positivo';

export type IncidentStatus = 'Open' | 'Resolved' | 'Cancelled';

export interface EventoCaida {
  id: string;
  incidentId: number;
  patientId: number;
  ref: string;
  fecha: string;
  hora: string;
  paciente: string;
  tipo: TipoEvento;
  status: IncidentStatus;
  isActive: boolean;
  tiempoRespuesta?: string;
  ubicacion: string;
  latitude?: number | null;
  longitude?: number | null;
  direccion?: string | null;
  mapaUrl?: string;
  observaciones?: string;
  tipoCaida?: string;
  anotacionesPaciente?: Anotacion[];
}
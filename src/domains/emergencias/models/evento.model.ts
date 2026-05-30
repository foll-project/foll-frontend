import type { Anotacion } from '../../iam/models/abuelito.model';

export type TipoEvento = 'Emergencia Real' | 'Falso Positivo';

export interface EventoCaida {
  id: string;
  ref: string;
  fecha: string;
  hora: string;
  paciente: string;
  tipo: TipoEvento;
  tiempoRespuesta?: string;
  ubicacion: string;
  mapaUrl?: string; // Para la imagen 3D del mapa
  observaciones?: string;
  tipoCaida?: string;
  anotacionesPaciente?: Anotacion[];
}
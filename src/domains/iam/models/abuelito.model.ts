export interface Cuidador {
  id: string;
  nombre: string;
  rol: 'Principal' | 'Invitado';
  email: string;
}

export interface DispositivoInfo {
  id: string;
  bateria: number;
  cargando: boolean;
  estadoGeneral: 'Online' | 'Offline';
}

export interface Abuelito {
  id: string;
  nombre: string;
  rol: 'Principal' | 'Invitado'; // Tu rol respecto a este abuelito
  estadoActual: 'Seguro' | 'Alerta';
  ultimoReporte: string;
  estadoVinculacion: 'Vinculado' | 'Pendiente';
  dispositivo?: DispositivoInfo;
  cuidadores: Cuidador[]; // Lista de todos los que cuidan a este abuelito
  dni?: string;
  edad?: string;
  grupoSanguineo?: string;
  enfermedades?: string[];
  medicamentos?: string[];
  anotaciones?: Anotacion[];
}

export interface Anotacion {
  id: string;
  fecha: string;
  texto: string;
  autor: string;
}
// ... resto de interfaces se mantienen igual

// Interfaz para las solicitudes de acceso (Paso 1 de tus errores)
export interface SolicitudAcceso {
  id: string;
  solicitante: string;
  abuelitoObjetivo: string;
}

// DTO para el formulario de creación (Paso 2 y 3 de tus errores)
export interface RegistrarAbuelitoDTO {
  nombre: string;
  dni: string;
  edad: string;
  grupoSanguineo: string;
  enfermedades: string[];
  medicamentos: string[];
}
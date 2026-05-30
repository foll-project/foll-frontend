export interface DatosPersonales {
  nombres: string;
  apellidos: string;
  correo: string;
  telefono: string;
}

export interface PreferenciasNotificacion {
  alertasInmediatas: boolean;
  resumenDiario: boolean;
  actualizacionesSistema: boolean;
}

export interface PerfilUsuario {
  id: string;
  rol: string;
  estado: string;
  datos: DatosPersonales;
  preferencias: PreferenciasNotificacion;
}
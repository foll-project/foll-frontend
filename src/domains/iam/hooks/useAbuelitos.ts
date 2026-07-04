import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { Abuelito, SolicitudAcceso, RegistrarAbuelitoDTO } from '../models/abuelito.model';

import { apiClient } from '../../../shared/api/client.ts'; 
import { API_CONFIG } from '../../../shared/api/config.ts';
import i18n, { getDateLocale } from '../../../shared/i18n';
import { useNotifications } from '../../notifications/hooks/useNotifications';
import { useInvitations } from '../../invitations/hooks/useInvitations';

export interface CaidaActiva {
  notificationLogId: number;
  patientId: number;
  title: string;
  body: string;
  createdAt: string;
}

interface BackendUser {
  firstName?: string;
  lastName?: string;
  email?: string;
}

interface BackendCaregiver {
  userId?: number;
  user?: BackendUser;
  caregiverKind?: string;
}

interface BackendAnnotation {
  id?: number;
  date?: string;
  text?: string;
  author?: string;
}

interface BackendDevice {
  isLinked?: boolean;
  deviceId?: number;
  status?: string;
  connectivityStatus?: string | null;
  currentBatteryLevel?: number | null;
  isCharging?: boolean | null;
  lastHeartbeatAt?: string | null;
  isOnline?: boolean;
  isLowBattery?: boolean;
  firmwareVersion?: string;
}

interface BackendPatient {
  patientId?: number;
  firstName?: string;
  lastName?: string;
  dni?: string;
  birthDate?: string;
  bloodType?: number;
  medicalConditions?: Record<string, string>;
  medications?: Record<string, string>;
  caregivers?: BackendCaregiver[];
  annotations?: BackendAnnotation[];
  device?: BackendDevice;
  currentGuardianUserId?: number;
}

type BackendPatientResponse = BackendPatient & {
  patient?: BackendPatient;
  caregiverKind?: string;
};



const getUserIdFromToken = (): number | null => {
  const token = localStorage.getItem('authToken');
  if (!token) return null;
  
  try {
    const payloadBase64 = token.split('.')[1];
    const decodedJson = atob(payloadBase64);
    const decoded = JSON.parse(decodedJson);
    return decoded.userId ? parseInt(decoded.userId, 10) : null;
  } catch (error) {
    console.error('Error decodificando el token JWT:', error);
    return null;
  }
};



const BLOOD_TYPE_KEYS = ['unknown', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as const;

const getBloodTypeString = (type: number): string => {
  const key = BLOOD_TYPE_KEYS[type] ?? 'unknown';
  return i18n.t(`bloodTypes.${key}`);
};

const getBloodTypeNumber = (typeString: string): number => {
  const indexByKey = BLOOD_TYPE_KEYS.indexOf(typeString as (typeof BLOOD_TYPE_KEYS)[number]);
  if (indexByKey !== -1) return indexByKey;

  const indexByTranslation = BLOOD_TYPE_KEYS.findIndex(
    (key) => i18n.t(`bloodTypes.${key}`) === typeString,
  );
  return indexByTranslation !== -1 ? indexByTranslation : 1;
};

const calcularEdad = (fechaNacimiento: string): string => {
  if (!fechaNacimiento) return '--';
  const hoy = new Date();
  const cumple = new Date(fechaNacimiento);
  let edad = hoy.getFullYear() - cumple.getFullYear();
  const m = hoy.getMonth() - cumple.getMonth();
  if (m < 0 || (m === 0 && hoy.getDate() < cumple.getDate())) {
    edad--;
  }
  return edad.toString();
};

const formatUltimoReporte = (fecha?: string | null): string => {
  if (!fecha) return i18n.t('abuelitos.telemetry.noReports');
  const date = new Date(fecha);
  if (Number.isNaN(date.getTime())) return i18n.t('abuelitos.telemetry.noReports');

  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return i18n.t('abuelitos.telemetry.justNow');
  if (diffMin < 60) return i18n.t('abuelitos.telemetry.minutesAgo', { count: diffMin });
  const diffHoras = Math.floor(diffMin / 60);
  if (diffHoras < 24) return i18n.t('abuelitos.telemetry.hoursAgo', { count: diffHoras });

  return date.toLocaleDateString(getDateLocale(), {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const mapearAnotacionDesdeBackend = (a: BackendAnnotation) => ({
  id: a.id?.toString() || Math.random().toString(),
  fecha: a.date ? new Date(a.date).toLocaleDateString('es-ES', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
  }) : '',
  texto: a.text || '',
  autor: a.author || ''
});

const mapearValoresDiccionario = (value?: Record<string, string> | null): string[] => {
  if (!value) {
    return [];
  }

  return Object.values(value).filter((item) => item.trim().length > 0);
};

const mapearAbuelitoDesdeBackend = (dataBackend: BackendPatientResponse, currentUserId: number): Abuelito => {
  const patient = dataBackend.patient || dataBackend;

  // Estado real del dispositivo expuesto por el backend (ACL Care -> DeviceManagment)
  const device = patient.device;
  const isLinked = device?.isLinked === true;

  const dispositivo = isLinked
    ? {
        id: device?.deviceId ? `#${device.deviceId}` : i18n.t('common.notAvailable'),
        bateria: device?.currentBatteryLevel ?? 0,
        cargando: device?.isCharging ?? false,
        estadoGeneral: (device?.isOnline ? 'Online' : 'Offline') as 'Online' | 'Offline',
      }
    : undefined;

  return {
    id: patient.patientId?.toString() || '',
    nombre: `${patient.firstName || ''} ${patient.lastName || ''}`.trim(),
    rol: dataBackend.caregiverKind === 'official'
          ? i18n.t('roles.principalOfficial')
          : (patient.currentGuardianUserId === currentUserId
              ? i18n.t('roles.principalGuest')
              : i18n.t('roles.secondary')),
    estadoActual: 'Seguro',
    ultimoReporte: isLinked
      ? formatUltimoReporte(device?.lastHeartbeatAt)
      : i18n.t('abuelitos.telemetry.noDevice'),
    estadoVinculacion: isLinked ? 'Vinculado' : 'Pendiente',
    dispositivo,
    dni: patient.dni || '',
    edad: calcularEdad(patient.birthDate || ''),
    grupoSanguineo: getBloodTypeString(patient.bloodType || 0),
    
    enfermedades: mapearValoresDiccionario(patient.medicalConditions),
    medicamentos: mapearValoresDiccionario(patient.medications),
    
    cuidadores: (patient.caregivers || []).map((c: BackendCaregiver) => ({
      id: c.userId?.toString() || '',
      nombre: c.user
        ? `${c.user.firstName || ''} ${c.user.lastName || ''}`.trim()
        : i18n.t('common.unknownCaregiver'),
      rol: c.caregiverKind === 'official'
            ? i18n.t('roles.principalOfficial')
            : (c.userId === patient.currentGuardianUserId
                ? i18n.t('roles.principalGuest')
                : i18n.t('roles.secondary')),
      email: c.user?.email || '',
      tieneMandoCompartido: c.userId === patient.currentGuardianUserId
    })),
    
    anotaciones: (patient.annotations || []).map(mapearAnotacionDesdeBackend)
  };
};



export const useAbuelitos = () => {
  useTranslation();
  const [abuelitos, setAbuelitos] = useState<Abuelito[]>([]);
  const [solicitudes, setSolicitudes] = useState<SolicitudAcceso[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- ESTADOS DE MODALES ---
  const [isVincularOpen, setIsVincularOpen] = useState(false);
  const [isRegistrarOpen, setIsRegistrarOpen] = useState(false);
  const [isDetallesOpen, setIsDetallesOpen] = useState(false);
  const [isDispositivoOpen, setIsDispositivoOpen] = useState(false);
  const [isVincularHardwareOpen, setIsVincularHardwareOpen] = useState(false);
  const [isAnotacionOpen, setIsAnotacionOpen] = useState(false);
  const [isBitacoraOpen, setIsBitacoraOpen] = useState(false);

  // --- ESTADOS DE VINCULACIÓN HARDWARE ---
  const [vincularIsLoading, setVincularIsLoading] = useState(false);
  const [vincularError, setVincularError] = useState<string | null>(null);

  const [abuelitoSeleccionado, setAbuelitoSeleccionado] = useState<Abuelito | null>(null);

  // --- NOTIFICACIONES Y TELEMETRÍA EN TIEMPO REAL (SignalR) ---
  const { notifications, attendFall, deviceTelemetry, connection } = useNotifications();

  // --- INVITACIONES EN TIEMPO REAL ---
  // Si aprueban una invitación que envié, gano acceso a un nuevo abuelito:
  // refrescamos la lista al instante para que aparezca sin recargar la página.
  const { lastEvent: lastInvitationEvent, createInvitation } = useInvitations();

  // --- REFRESCAR LISTA COMPLETA ---
  // silent=true evita el spinner: se usa para el polling y refrescos por notificaciones.
  const recargarAbuelitos = async () => {
    const currentUserId = getUserIdFromToken();
    if (!currentUserId) return;
    try {
      const response = await apiClient.get<BackendPatientResponse[]>(API_CONFIG.PATIENTS.GET_BY_CAREGIVER(currentUserId));
      const mapeados = response.map(r => mapearAbuelitoDesdeBackend(r, currentUserId));
      // Preservamos las anotaciones que ya se hayan cargado de forma diferida.
      setAbuelitos((prev) =>
        mapeados.map((nuevo) => {
          const anterior = prev.find((a) => a.id === nuevo.id);
          return anterior?.anotaciones?.length
            ? { ...nuevo, anotaciones: anterior.anotaciones }
            : nuevo;
        })
      );
    } catch (error) {
      console.error('Error recargando abuelitos:', error);
    }
  };

  // --- CARGA INICIAL (GET) ---
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const currentUserId = getUserIdFromToken();
        if (!currentUserId) {
          console.warn("Usuario no autenticado");
          return;
        }

        const response = await apiClient.get<BackendPatientResponse[]>(API_CONFIG.PATIENTS.GET_BY_CAREGIVER(currentUserId));
        setAbuelitos(response.map(r => mapearAbuelitoDesdeBackend(r, currentUserId)));
        setSolicitudes([]); // Lógica futura para invitaciones

      } catch (error) {
        console.error('Error al cargar abuelitos:', error);
        setAbuelitos([]); 
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const handleLanguageChanged = () => {
      void recargarAbuelitos();
    };

    i18n.on('languageChanged', handleLanguageChanged);
    return () => {
      i18n.off('languageChanged', handleLanguageChanged);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- TELEMETRÍA EN TIEMPO REAL (SignalR push, sin polling) ---
  // El backend empuja un evento ligero "device.telemetry" en CADA heartbeat solo a
  // los cuidadores del paciente. Fusionamos esa telemetría en el estado local para
  // ver la batería y la conectividad subir/bajar en vivo, sin llamadas periódicas.
  useEffect(() => {
    if (Object.keys(deviceTelemetry).length === 0) return;

    setAbuelitos((prev) =>
      prev.map((abuelito) => {
        const telemetria = deviceTelemetry[Number(abuelito.id)];
        if (!telemetria || !abuelito.dispositivo) return abuelito;

        return {
          ...abuelito,
          ultimoReporte: formatUltimoReporte(telemetria.lastHeartbeatAt),
          dispositivo: {
            ...abuelito.dispositivo,
            bateria: telemetria.batteryLevel,
            cargando: telemetria.isCharging,
            estadoGeneral: telemetria.isOnline ? 'Online' : 'Offline',
          },
        };
      }),
    );
  }, [deviceTelemetry]);

  // --- REFRESH INMEDIATO ANTE UN EVENTO EN TIEMPO REAL ---
  // Cuando llega una notificación (caída, batería, conexión) refrescamos al instante
  // para reflejar el nuevo estado del dispositivo sin esperar al siguiente poll.
  const lastNotificationId = notifications[0]?.notificationLogId ?? 0;
  useEffect(() => {
    if (lastNotificationId > 0) {
      void recargarAbuelitos();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastNotificationId]);

  // --- REFRESH ANTE UN EVENTO DE INVITACIÓN (aceptada/rechazada) ---
  useEffect(() => {
    if (lastInvitationEvent) {
      void recargarAbuelitos();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastInvitationEvent]);

  // --- SINCRONIZACIÓN DEL PACIENTE SELECCIONADO ---
  // Al recargar la lista de abuelitos (ej. por cambiar un rol o eliminar un cuidador), 
  // la copia estática de `abuelitoSeleccionado` en el modal no se actualizaba automáticamente. 
  // Este useEffect mantiene en sincronía la vista del modal en vivo sin recargas.
  useEffect(() => {
    if (abuelitoSeleccionado) {
      const actualizado = abuelitos.find(a => a.id === abuelitoSeleccionado.id);
      if (actualizado) {
        setAbuelitoSeleccionado(actualizado);
      } else {
        // Si el abuelito ya no existe (ej. lo eliminamos), cerramos el modal
        setAbuelitoSeleccionado(null);
        setIsDetallesOpen(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [abuelitos]);

  // --- REFRESH EQUIPO DE CUIDADO EN TIEMPO REAL ---
  useEffect(() => {
    if (!connection || !abuelitoSeleccionado) return;

    const currentPatientId = Number(abuelitoSeleccionado.id);
    
    connection.invoke("JoinPatientGroup", currentPatientId).catch((err) => {
      console.warn("No se pudo unir al grupo del paciente:", err);
    });

    const handleCaregiverUpdated = (updatedPatientId: number) => {
      if (updatedPatientId === currentPatientId) {
        void recargarAbuelitos();
      }
    };

    connection.on("CaregiverListUpdated", handleCaregiverUpdated);
    connection.on("CaregiverRoleChanged", handleCaregiverUpdated);

    return () => {
      connection.off("CaregiverListUpdated", handleCaregiverUpdated);
      connection.off("CaregiverRoleChanged", handleCaregiverUpdated);
      connection.invoke("LeavePatientGroup", currentPatientId).catch((err) => {
        console.warn("No se pudo abandonar el grupo del paciente:", err);
      });
    };
  }, [connection, abuelitoSeleccionado?.id]);

  // --- CAÍDAS ACTIVAS (sin confirmar) POR PACIENTE ---
  const caidasActivas = useMemo(() => {
    const mapa: Record<string, CaidaActiva> = {};
    notifications.forEach((n) => {
      if (n.notificationType !== 'FallDetected' || n.acknowledgedAt || n.patientId == null) return;
      const key = String(n.patientId);
      const existente = mapa[key];
      if (!existente || new Date(n.createdAt).getTime() > new Date(existente.createdAt).getTime()) {
        mapa[key] = {
          notificationLogId: n.notificationLogId,
          patientId: n.patientId,
          title: n.title,
          body: n.body,
          createdAt: n.createdAt,
        };
      }
    });
    return mapa;
  }, [notifications]);

  // Atiende la caída activa de un paciente: cierra el incidente en el backend, lo
  // que dispara el evento "incident.resolved" en tiempo real al resto de cuidadores.
  const atenderCaida = async (patientId: number) => {
    await attendFall(patientId);
  };

  // --- HANDLERS: GESTIÓN DE PERFILES ---

  const handleVincularFamiliar = async (dni: string) => {
    try {
      // relationshipTypeId: 4 (Familiar por defecto, basado en tu RelationshipTypeConfiguration)
      await createInvitation(dni.trim(), 4);
      setIsVincularOpen(false);
    } catch (error) {
      console.error('Error al solicitar vinculación:', error);
    }
  };

  const handleRegistrar = async (datos: RegistrarAbuelitoDTO) => {
    try {
      const payloadBackend = {
        dni: datos.dni,
        firstName: datos.nombre.split(' ')[0],
        lastName: datos.nombre.split(' ').slice(1).join(' ') || '.', 
        birthDate: "1950-01-01", // Default requerido por el backend
        relationshipTypeId: 1, 
        bloodType: getBloodTypeNumber(datos.grupoSanguineo), 
        medicalConditions: datos.enfermedades.reduce((acc, enf) => ({ ...acc, [enf]: "Confirmado" }), {}),
        medications: datos.medicamentos.reduce((acc, med) => ({ ...acc, [med]: "Dosis estándar" }), {})
      };

      await apiClient.post<void>(API_CONFIG.PATIENTS.CREATE, payloadBackend);
      await recargarAbuelitos(); // Refrescamos todo para tener los IDs correctos
      setIsRegistrarOpen(false);
    } catch (error) {
      console.error('Error al registrar abuelito:', error);
    }
  };

  const handleActualizar = async (id: string, datosActualizados: Partial<Abuelito>) => {
    try {
      // 1. Buscamos la data original del paciente para no enviar campos vacíos
      const abuelitoOriginal = abuelitos.find(a => a.id === id);
      if (!abuelitoOriginal) return;

      // 2. Mezclamos la data original 
      const enfermedadesFinales = datosActualizados.enfermedades || abuelitoOriginal.enfermedades || [];
      const medicamentosFinales = datosActualizados.medicamentos || abuelitoOriginal.medicamentos || [];
      const nombreFinal = datosActualizados.nombre || abuelitoOriginal.nombre || '';
      const grupoSanguineoFinal = datosActualizados.grupoSanguineo
        || abuelitoOriginal.grupoSanguineo
        || i18n.t('bloodTypes.unknown');

      const payloadBackend = {
        firstName: nombreFinal.split(' ')[0],
        lastName: nombreFinal.split(' ').slice(1).join(' ') || '.', 
        birthDate: "1950-01-01", // Mantenemos el default hasta que agregues fecha al form
        bloodType: getBloodTypeNumber(grupoSanguineoFinal),
        medicalConditions: enfermedadesFinales.reduce((acc, enf) => ({ ...acc, [enf]: "Confirmado" }), {}),
        medications: medicamentosFinales.reduce((acc, med) => ({ ...acc, [med]: "Dosis estándar" }), {})
      };

      
      await apiClient.put(API_CONFIG.PATIENTS.UPDATE(Number(id)), payloadBackend);
      
      await recargarAbuelitos();
      setIsDetallesOpen(false);
      
    } catch (error) {
      console.error('Error actualizando abuelito:', error);
    }
  };

  const handleEliminar = async (id: string) => {
    try {
      await apiClient.delete(API_CONFIG.PATIENTS.DELETE(Number(id)));
      setAbuelitos(prev => prev.filter(a => a.id !== id));
      setIsDetallesOpen(false);
    } catch (error) {
      console.error('Error eliminando paciente:', error);
    }
  };

  // --- HANDLERS: HARDWARE ---
  const handleVincularHardwareSubmit = async (codigoDispositivo: string) => {
    const abuelito = abuelitoSeleccionado;
    if (!abuelito) return;

    const deviceId = parseInt(codigoDispositivo.trim(), 10);
    if (isNaN(deviceId) || deviceId <= 0) {
      setVincularError(i18n.t('errors.invalidDeviceId'));
      return;
    }

    const patientId = parseInt(abuelito.id, 10);
    if (isNaN(patientId) || patientId <= 0) {
      setVincularError(i18n.t('errors.patientNotDetermined'));
      return;
    }

    setVincularIsLoading(true);
    setVincularError(null);

    try {
      await apiClient.post(API_CONFIG.DEVICES.LINK(deviceId), { patientId });
      setIsVincularHardwareOpen(false);
      setVincularError(null);
      await recargarAbuelitos();
    } catch (error) {
      const msg = error instanceof Error
        ? error.message
        : i18n.t('errors.linkDeviceFailed');
      setVincularError(msg);
    } finally {
      setVincularIsLoading(false);
    }
  };

  // --- HANDLERS: EQUIPO DE CUIDADO ---
  const handleEliminarCuidador = async (abuelitoId: string, cuidadorId: string) => {
    try {
      await apiClient.delete(API_CONFIG.PATIENTS.REMOVE_CAREGIVER(Number(abuelitoId), Number(cuidadorId)));
      await recargarAbuelitos();
    } catch (error) {
      console.error('Error eliminando cuidador:', error);
    }
  };

  const handleCompartirMando = async (abuelitoId: string, cuidadorId: string) => {
    try {
      await apiClient.put(API_CONFIG.PATIENTS.CHANGE_GUARDIAN(Number(abuelitoId)), { 
        newCurrentGuardianUserId: Number(cuidadorId) 
      });
      await recargarAbuelitos();
    } catch (error) {
      console.error('Error compartiendo mando:', error);
    }
  };

  const handleQuitarMando = async (abuelitoId: string, cuidadorId: string) => {
    void cuidadorId;
    try {
      await apiClient.post(API_CONFIG.PATIENTS.RESTORE_GUARDIAN(Number(abuelitoId)));
      await recargarAbuelitos();
    } catch (error) {
      console.error('Error quitando mando:', error);
    }
  };

  // --- HANDLERS: BITÁCORA ---
  const handleAñadirAnotacion = async (abuelitoId: string, texto: string) => {
    try {
      await apiClient.post(API_CONFIG.PATIENTS.CREATE_ANNOTATION(Number(abuelitoId)), { content: texto });
      
      const anotacionesBackend = await apiClient.get<BackendAnnotation[]>(API_CONFIG.PATIENTS.GET_ANNOTATIONS(Number(abuelitoId)));
      const anotacionesMapeadas = anotacionesBackend.map(mapearAnotacionDesdeBackend);

      setAbuelitos(prev => prev.map(a => a.id === abuelitoId ? { ...a, anotaciones: anotacionesMapeadas } : a));
      setIsAnotacionOpen(false);
    } catch (error) {
      console.error('Error al añadir anotación:', error);
    }
  };

  // --- CONTROL DE APERTURA DE MODALES ---

  const abrirDetallesPerfil = (id: string) => {
    const abuelito = abuelitos.find(a => a.id === id);
    if (abuelito) { setAbuelitoSeleccionado(abuelito); setIsDetallesOpen(true); }
  };

  const abrirDetallesDispositivo = (id: string) => {
    const abuelito = abuelitos.find(a => a.id === id);
    if (abuelito) { setAbuelitoSeleccionado(abuelito); setIsDispositivoOpen(true); }
  };

  const abrirVincularHardware = (id: string) => {
    const abuelito = abuelitos.find(a => a.id === id);
    if (abuelito) {
      setAbuelitoSeleccionado(abuelito);
      setVincularError(null);
      setIsVincularHardwareOpen(true);
    }
  };

  const abrirAnotacion = (id: string) => {
    const abuelito = abuelitos.find(a => a.id === id);
    if (abuelito) { setAbuelitoSeleccionado(abuelito); setIsAnotacionOpen(true); }
  };

  const abrirBitacora = async (id: string) => {
    
    const abuelito = abuelitos.find(a => a.id === id);
    if (abuelito) {
      setAbuelitoSeleccionado(abuelito);
      setIsBitacoraOpen(true);

      try {
        
        const anotacionesBackend = await apiClient.get<BackendAnnotation[]>(API_CONFIG.PATIENTS.GET_ANNOTATIONS(Number(id)));
        
        const anotacionesMapeadas = anotacionesBackend.map(mapearAnotacionDesdeBackend);

        // 4. Actualizamos la lista principal de abuelitos
        setAbuelitos(prev => prev.map(a => a.id === id ? { ...a, anotaciones: anotacionesMapeadas } : a));
        
        setAbuelitoSeleccionado(prev => prev ? { ...prev, anotaciones: anotacionesMapeadas } : null);

      } catch (error) {
        console.error('Error al cargar el historial de la bitácora:', error);
      }
    }
  };

  return {
    abuelitos,
    solicitudes,
    isLoading,
    caidasActivas,
    atenderCaida,
    vincular: {
      isLoading: vincularIsLoading,
      error: vincularError,
      clearError: () => setVincularError(null),
    },
    modals: {
      currentUserId: getUserIdFromToken(),
      isVincularOpen, setIsVincularOpen,
      isRegistrarOpen, setIsRegistrarOpen,
      isDetallesOpen, setIsDetallesOpen,
      isDispositivoOpen, setIsDispositivoOpen,
      isVincularHardwareOpen, setIsVincularHardwareOpen,
      isAnotacionOpen, setIsAnotacionOpen,
      isBitacoraOpen, setIsBitacoraOpen
    },
    detalles: {
      abuelitoSeleccionado,
      setAbuelitoSeleccionado
    },
    handlers: {
      handleVincularFamiliar,
      handleRegistrar,
      handleActualizar,
      handleEliminar,
      abrirDetallesPerfil,
      abrirDetallesDispositivo,
      abrirVincularHardware,
      handleVincularHardwareSubmit,
      handleEliminarCuidador,
      handleCompartirMando,
      handleQuitarMando,
      abrirAnotacion,
      abrirBitacora,
      handleAñadirAnotacion
    }
  };
};

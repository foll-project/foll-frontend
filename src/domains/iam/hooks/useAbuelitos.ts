import { useState, useEffect } from 'react';
import type { Abuelito, SolicitudAcceso, RegistrarAbuelitoDTO } from '../models/abuelito.model';

import { apiClient } from '../../../shared/api/client.ts'; 
import { API_CONFIG } from '../../../shared/api/config.ts';



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



const getBloodTypeString = (type: number): string => {
  const types = ['Desconocido', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  return types[type] || 'Desconocido';
};

const getBloodTypeNumber = (typeString: string): number => {
  const types = ['Desconocido', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const index = types.indexOf(typeString);
  return index !== -1 ? index : 1; // Por defecto A+ si no coincide
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

const mapearAbuelitoDesdeBackend = (dataBackend: any): Abuelito => {
  const patient = dataBackend.patient || dataBackend;
  
  // --- MOCK TEMPORAL DE DISPOSITIVO ---
  // por ahora algunos datos siguen simulados
  // hasta que integremos el Bounded Context de DeviceManagement.
  const dispositivoSimulado = {
    id: `ESP32-${patient.patientId || 'MOCK'}`,
    bateria: 85,
    cargando: false,
    estadoGeneral: 'Online' as const
  };

  return {
    id: patient.patientId?.toString() || '',
    nombre: `${patient.firstName} ${patient.lastName}`.trim(),
    rol: dataBackend.caregiverKind === 'official' ? 'Principal' : 'Invitado',
    estadoActual: 'Seguro', 
    ultimoReporte: 'Hace 5 min', // es simulado
    estadoVinculacion: 'Vinculado', // por ahora Forzamos visualmente a 'Vinculado'
    dispositivo: dispositivoSimulado, // Inyectamos el mock
    dni: patient.dni || '',
    edad: calcularEdad(patient.birthDate),
    grupoSanguineo: getBloodTypeString(patient.bloodType),
    
    enfermedades: patient.medicalConditions ? Object.keys(patient.medicalConditions) : [],
    medicamentos: patient.medications ? Object.keys(patient.medications) : [],
    
    cuidadores: (patient.caregivers || []).map((c: any) => ({
      id: c.userId?.toString(),
      nombre: c.user ? `${c.user.firstName} ${c.user.lastName}` : 'Desconocido',
      rol: c.caregiverKind === 'official' ? 'Principal' : 'Invitado',
      email: c.user?.email || ''
    })),
    
    anotaciones: (patient.annotations || []).map((a: any) => ({
      id: a.id?.toString() || Math.random().toString(),
      fecha: a.date ? new Date(a.date).toLocaleDateString('es-ES', { 
        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' 
      }) : '',
      texto: a.text || '',
      autor: a.author || ''
    }))
  };
};



export const useAbuelitos = () => {
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

  const [abuelitoSeleccionado, setAbuelitoSeleccionado] = useState<Abuelito | null>(null);

  // --- REFRESCAR LISTA COMPLETA ---
  const recargarAbuelitos = async () => {
    const currentUserId = getUserIdFromToken();
    if (!currentUserId) return;
    try {
      const response = await apiClient.get<any[]>(API_CONFIG.PATIENTS.GET_BY_CAREGIVER(currentUserId));
      setAbuelitos(response.map(mapearAbuelitoDesdeBackend));
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

        const response = await apiClient.get<any[]>(API_CONFIG.PATIENTS.GET_BY_CAREGIVER(currentUserId));
        setAbuelitos(response.map(mapearAbuelitoDesdeBackend));
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

  // --- HANDLERS: GESTIÓN DE PERFILES ---

  const handleVincularFamiliar = async (dni: string) => {
    try {
      // relationshipTypeId: 4 (Familiar por defecto, basado en tu RelationshipTypeConfiguration)
      await apiClient.post(API_CONFIG.PATIENTS.CREATE_INVITATION(dni), { relationshipTypeId: 4 });
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

      await apiClient.post<any>(API_CONFIG.PATIENTS.CREATE, payloadBackend);
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
      const grupoSanguineoFinal = datosActualizados.grupoSanguineo || abuelitoOriginal.grupoSanguineo || 'Desconocido';

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

  const handleEliminar = (id: string) => {

    // por ahora lo ocultamos visualmente de esta lista.
    console.warn('API: Eliminación visual. El backend retiene el registro.');
    setAbuelitos(prev => prev.filter(a => a.id !== id));
    setIsDetallesOpen(false);
  };

  // --- HANDLERS: HARDWARE ---
  const handleVincularHardwareSubmit = (codigoDispositivo: string) => {
    console.log('API: Pendiente de integrar con BC DeviceManagement ID:', codigoDispositivo);
    setIsVincularHardwareOpen(false);
  };

  // --- HANDLERS: EQUIPO DE CUIDADO ---
  const handleEliminarCuidador = (abuelitoId: string, cuidadorId: string) => {
    console.warn('API: Acción de eliminar cuidador no expuesta aún en el REST controller.');
    setAbuelitos(prev => prev.map(a => a.id === abuelitoId ? { ...a, cuidadores: a.cuidadores.filter(c => c.id !== cuidadorId) } : a));
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
      
      const anotacionesBackend = await apiClient.get<any[]>(API_CONFIG.PATIENTS.GET_ANNOTATIONS(Number(abuelitoId)));
      const anotacionesMapeadas = anotacionesBackend.map((a: any) => ({
        id: a.id?.toString(),
        fecha: new Date(a.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
        texto: a.text,
        autor: a.author
      }));

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
    if (abuelito) { setAbuelitoSeleccionado(abuelito); setIsVincularHardwareOpen(true); }
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
        
        const anotacionesBackend = await apiClient.get<any[]>(API_CONFIG.PATIENTS.GET_ANNOTATIONS(Number(id)));
        
        const anotacionesMapeadas = anotacionesBackend.map((a: any) => ({
          id: a.id?.toString(),
          fecha: new Date(a.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
          texto: a.text,
          autor: a.author
        }));

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
    modals: {
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
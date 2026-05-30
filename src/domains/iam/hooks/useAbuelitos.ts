import { useState, useEffect } from 'react';
import type { Abuelito, SolicitudAcceso, RegistrarAbuelitoDTO } from '../models/abuelito.model';

export const useAbuelitos = () => {
  const [abuelitos, setAbuelitos] = useState<Abuelito[]>([]);
  const [solicitudes, setSolicitudes] = useState<SolicitudAcceso[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- ESTADOS DE MODALES ---
  const [isVincularOpen, setIsVincularOpen] = useState(false); // Vincular Familiar por DNI
  const [isRegistrarOpen, setIsRegistrarOpen] = useState(false); // Registrar nuevo perfil
  const [isDetallesOpen, setIsDetallesOpen] = useState(false); // Detalles del Perfil + Equipo de Cuidado
  const [isDispositivoOpen, setIsDispositivoOpen] = useState(false); // Telemetría/Info Dispositivo
  const [isVincularHardwareOpen, setIsVincularHardwareOpen] = useState(false); // Vincular ID de Hardware
  const [isAnotacionOpen, setIsAnotacionOpen] = useState(false); // Modal para Añadir Anotación Rápida
  const [isBitacoraOpen, setIsBitacoraOpen] = useState(false); // Modal para Ver Bitácora

  // Contexto para los modales
  const [abuelitoSeleccionado, setAbuelitoSeleccionado] = useState<Abuelito | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      // Simulación de latencia de API Gateway
      await new Promise(resolve => setTimeout(resolve, 600));

      const mockData: Abuelito[] = [
        {
          id: '1',
          nombre: 'Roberto Silva',
          rol: 'Principal',
          estadoActual: 'Seguro',
          ultimoReporte: 'Hace 5 min',
          estadoVinculacion: 'Vinculado',
          dispositivo: { id: 'ESP32-A8F9', bateria: 85, cargando: false, estadoGeneral: 'Online' },
          dni: '12345678',
          edad: '78',
          grupoSanguineo: 'O+',
          enfermedades: ['Hipertensión'],
          medicamentos: ['Losartán 50mg'],
          cuidadores: [
            { id: 'u1', nombre: 'María Gonzales', rol: 'Principal', email: 'maria@foll.com' },
            { id: 'u2', nombre: 'Juan Silva', rol: 'Invitado', email: 'juan@foll.com' }
          ],
          anotaciones: [
            { id: 'a1', fecha: '12 Oct 2026, 14:00', texto: 'Le di la pastilla de la presión. Estaba un poco mareado.', autor: 'María Gonzales' },
            { id: 'a2', fecha: '11 Oct 2026, 09:00', texto: 'Se quejó de dolor de cabeza en la mañana.', autor: 'Juan Silva' }
          ]
        },
        {
          id: '2',
          nombre: 'Carmen Ruiz',
          rol: 'Invitado',
          estadoActual: 'Seguro',
          ultimoReporte: 'Hace 1 hr',
          estadoVinculacion: 'Vinculado',
          dispositivo: { id: 'ESP32-B2C1', bateria: 12, cargando: true, estadoGeneral: 'Online' },
          dni: '87654321',
          edad: '82',
          grupoSanguineo: 'A-',
          enfermedades: ['Diabetes Tipo 2'],
          medicamentos: ['Metformina'],
          anotaciones: [],
          cuidadores: [
            { id: 'u3', nombre: 'Ricardo Ruiz', rol: 'Principal', email: 'ricardo@foll.com' },
            { id: 'u1', nombre: 'María Gonzales', rol: 'Invitado', email: 'maria@foll.com' }
          ]
        }
      ];

      setAbuelitos(mockData);
      setSolicitudes([
        { id: '101', solicitante: 'Luis Silva', abuelitoObjetivo: 'Roberto Silva' }
      ]);

      setIsLoading(false);
    };

    fetchData();
  }, []);

  // --- HANDLERS: GESTIÓN DE PERFILES ---

  const handleVincularFamiliar = (dni: string) => {
    console.log('API: Solicitando vinculación con DNI:', dni);
    setIsVincularOpen(false);
  };

  const handleRegistrar = (datos: RegistrarAbuelitoDTO) => {
    console.log('API: Registrando nuevo abuelito:', datos);
    const nuevoAbuelito: Abuelito = {
      id: Math.random().toString(36).substr(2, 9),
      nombre: datos.nombre,
      rol: 'Principal',
      estadoActual: 'Seguro',
      ultimoReporte: '--',
      estadoVinculacion: 'Pendiente', // Inicia sin hardware
      dni: datos.dni,
      edad: datos.edad,
      grupoSanguineo: datos.grupoSanguineo,
      enfermedades: datos.enfermedades,
      medicamentos: datos.medicamentos,
      cuidadores: [
        { id: 'u1', nombre: 'María Gonzales', rol: 'Principal', email: 'maria@foll.com' }
      ]
    };
    setAbuelitos(prev => [nuevoAbuelito, ...prev]);
    setIsRegistrarOpen(false);
  };

  const handleActualizar = (id: string, datosActualizados: Partial<Abuelito>) => {
    console.log('API: Actualizando abuelito ID:', id);
    setAbuelitos(prev => prev.map(a => (a.id === id ? { ...a, ...datosActualizados } : a)));
    setIsDetallesOpen(false);
  };

  const handleEliminar = (id: string) => {
    console.log('API: Eliminando abuelito ID:', id);
    setAbuelitos(prev => prev.filter(a => a.id !== id));
    setIsDetallesOpen(false);
  };

  // --- HANDLERS: HARDWARE ---

  const handleVincularHardwareSubmit = (codigoDispositivo: string) => {
    console.log('API: Vinculando hardware ID:', codigoDispositivo);
    if (abuelitoSeleccionado) {
      setAbuelitos(prev =>
        prev.map(a =>
          a.id === abuelitoSeleccionado.id
            ? {
                ...a,
                estadoVinculacion: 'Vinculado',
                dispositivo: { id: codigoDispositivo, bateria: 100, cargando: true, estadoGeneral: 'Online' }
              }
            : a
        )
      );
    }
    setIsVincularHardwareOpen(false);
  };

  // --- HANDLERS: EQUIPO DE CUIDADO ---

  const handleEliminarCuidador = (abuelitoId: string, cuidadorId: string) => {
    console.log('API: Eliminando cuidador:', cuidadorId);
    setAbuelitos(prev =>
      prev.map(a =>
        a.id === abuelitoId
          ? { ...a, cuidadores: a.cuidadores.filter(c => c.id !== cuidadorId) }
          : a
      )
    );
  };

  const handleCompartirMando = (abuelitoId: string, cuidadorId: string) => {
    console.log('API: Compartiendo mando principal con:', cuidadorId);
    setAbuelitos(prev =>
      prev.map(a => {
        if (a.id !== abuelitoId) return a;
        return {
          ...a,
          cuidadores: a.cuidadores.map(c => 
            c.id === cuidadorId ? { ...c, rol: 'Principal' } : c
          )
        };
      })
    );
  };

  const handleQuitarMando = (abuelitoId: string, cuidadorId: string) => {
    console.log('API: Quitando mando principal a:', cuidadorId);
    setAbuelitos(prev =>
      prev.map(a => {
        if (a.id !== abuelitoId) return a;
        return {
          ...a,
          cuidadores: a.cuidadores.map(c => 
            c.id === cuidadorId ? { ...c, rol: 'Invitado' } : c
          )
        };
      })
    );
  };

  const handleAñadirAnotacion = (abuelitoId: string, texto: string) => {
    console.log('API: Añadiendo anotación para abuelito:', abuelitoId);
    const nuevaAnotacion = {
      id: Math.random().toString(36).substr(2, 9),
      fecha: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      texto,
      autor: 'Cuidador Actual'
    };
    
    setAbuelitos(prev => prev.map(a => 
      a.id === abuelitoId 
        ? { ...a, anotaciones: [nuevaAnotacion, ...(a.anotaciones || [])] }
        : a
    ));
    setIsAnotacionOpen(false);
  };

  // --- CONTROL DE APERTURA DE MODALES ---

  const abrirDetallesPerfil = (id: string) => {
    const abuelito = abuelitos.find(a => a.id === id);
    if (abuelito) {
      setAbuelitoSeleccionado(abuelito);
      setIsDetallesOpen(true);
    }
  };

  const abrirDetallesDispositivo = (id: string) => {
    const abuelito = abuelitos.find(a => a.id === id);
    if (abuelito) {
      setAbuelitoSeleccionado(abuelito);
      setIsDispositivoOpen(true);
    }
  };

  const abrirVincularHardware = (id: string) => {
    const abuelito = abuelitos.find(a => a.id === id);
    if (abuelito) {
      setAbuelitoSeleccionado(abuelito);
      setIsVincularHardwareOpen(true);
    }
  };

  const abrirAnotacion = (id: string) => {
    const abuelito = abuelitos.find(a => a.id === id);
    if (abuelito) {
      setAbuelitoSeleccionado(abuelito);
      setIsAnotacionOpen(true);
    }
  };

  const abrirBitacora = (id: string) => {
    const abuelito = abuelitos.find(a => a.id === id);
    if (abuelito) {
      setAbuelitoSeleccionado(abuelito);
      setIsBitacoraOpen(true);
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
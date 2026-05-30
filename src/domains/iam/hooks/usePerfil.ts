import { useState, useEffect } from 'react';
import type { PerfilUsuario, DatosPersonales, PreferenciasNotificacion } from '../models/perfil.model';

export const usePerfil = () => {
  const [perfil, setPerfil] = useState<PerfilUsuario | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Estados locales para los formularios (para poder editarlos)
  const [formDatos, setFormDatos] = useState<DatosPersonales>({
    nombres: '', apellidos: '', correo: '', telefono: ''
  });
  const [formPreferencias, setFormPreferencias] = useState<PreferenciasNotificacion>({
    alertasInmediatas: false, resumenDiario: false, actualizacionesSistema: false
  });
  const [formPasswords, setFormPasswords] = useState({
    actual: '', nueva: '', confirmar: ''
  });

  useEffect(() => {
    const fetchPerfil = async () => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulación API

      const mockData: PerfilUsuario = {
        id: '1',
        rol: 'Cuidador Principal',
        estado: 'Cuenta Activa',
        datos: {
          nombres: 'María',
          apellidos: 'Gonzales',
          correo: 'correo@ejemplo.com',
          telefono: '+34 660 000 000'
        },
        preferencias: {
          alertasInmediatas: true,
          resumenDiario: true,
          actualizacionesSistema: false
        }
      };

      setPerfil(mockData);
      setFormDatos(mockData.datos);
      setFormPreferencias(mockData.preferencias);
      setIsLoading(false);
    };

    fetchPerfil();
  }, []);

  // Handlers
  const handleCambiarPreferencia = (key: keyof PreferenciasNotificacion) => {
    setFormPreferencias(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleGuardarCambios = () => {
    console.log('Guardando perfil...', { formDatos, formPreferencias, formPasswords });
    // Aquí iría tu fetch al API Gateway (Ej. PUT /api/v1/users/profile)
    alert('Cambios guardados con éxito');
    setFormPasswords({ actual: '', nueva: '', confirmar: '' }); // Limpiamos contraseñas
  };

  return {
    perfil,
    isLoading,
    formularios: {
      formDatos, setFormDatos,
      formPreferencias, handleCambiarPreferencia,
      formPasswords, setFormPasswords
    },
    handlers: {
      handleGuardarCambios
    }
  };
};
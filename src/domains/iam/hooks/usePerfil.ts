import { useState, useEffect } from 'react';
import { i18n } from '../../../shared/i18n';
import type { PerfilUsuario, DatosPersonales, PreferenciasNotificacion } from '../models/perfil.model';
import type { User } from '../models/user.model';

const getStoredUser = (): User | null => {
  const raw = localStorage.getItem('authUser');
  if (!raw) return null;

  try {
    return JSON.parse(raw) as User;
  } catch (err) {
    console.error('Error al parsear authUser desde localStorage:', err);
    localStorage.removeItem('authUser');
    return null;
  }
};

const createPerfilFromUser = (user: User): PerfilUsuario => ({
  id: String(user.userId),
  rol: i18n.t('roles.primaryCaregiver'),
  estado: i18n.t('status.activeAccount'),
  datos: {
    nombres: user.firstName,
    apellidos: user.lastName,
    correo: user.email,
    telefono: user.phoneNumber || ''
  },
  preferencias: {
    alertasInmediatas: true,
    resumenDiario: true,
    actualizacionesSistema: false
  }
});

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

      const storedUser = getStoredUser();
      if (storedUser) {
        const profileData = createPerfilFromUser(storedUser);
        setPerfil(profileData);
        setFormDatos(profileData.datos);
        setFormPreferencias(profileData.preferencias);
        setIsLoading(false);
        return;
      }

      // Si no hay usuario en sesión, usar datos por defecto mientras se carga.
      await new Promise(resolve => setTimeout(resolve, 500));
      const mockData: PerfilUsuario = {
        id: '1',
        rol: i18n.t('roles.primaryCaregiver'),
        estado: i18n.t('status.activeAccount'),
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
    alert(i18n.t('perfil.saveSuccess'));
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
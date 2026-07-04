import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { QuickAccessProfile } from '../../iam/models/user.model';
import type { SecurityStats } from '../models/stats.model';
import { fetchMyPatients } from '../../iam/services/patientsApi';
import { useNotifications } from '../../notifications/hooks/useNotifications';
import i18n, { getDateLocale } from '../../../shared/i18n';

interface InicioData {
  profiles: QuickAccessProfile[];
  stats: SecurityStats;
}

const FALL_TYPES = ['FallDetected'];
const FALSE_POSITIVE_TYPES = ['FallCancelled', 'FallDismissed', 'FalsePositive'];

export const useInicio = () => {
  useTranslation();
  const { notifications } = useNotifications();
  const [profiles, setProfiles] = useState<QuickAccessProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const cargarPerfiles = async () => {
      setIsLoading(true);
      try {
        const pacientes = await fetchMyPatients();
        if (!active) return;

        setProfiles(
          pacientes.map((paciente) => ({
            id: String(paciente.patientId),
            name: paciente.fullName,
            role: paciente.isPrincipal
              ? i18n.t('roles.primaryCaregiver')
              : i18n.t('roles.secondaryCaregiver'),
          }))
        );
      } catch (error) {
        console.error('Error al cargar el panel de inicio:', error);
        if (active) setProfiles([]);
      } finally {
        if (active) setIsLoading(false);
      }
    };

    cargarPerfiles();
    return () => {
      active = false;
    };
  }, []);

  const realFalls = notifications.filter((n) => FALL_TYPES.includes(n.notificationType)).length;
  const falsePositives = notifications.filter((n) =>
    FALSE_POSITIVE_TYPES.includes(n.notificationType)
  ).length;
  const totalEvents = realFalls + falsePositives;

  const stats: SecurityStats = {
    month: new Date().toLocaleDateString(getDateLocale(), { month: 'long', year: 'numeric' }),
    totalEvents,
    realFalls,
    falsePositives,
    summaryMessage:
      totalEvents === 0
        ? i18n.t('inicio.summaryEmpty')
        : i18n.t('inicio.summaryWithEvents', { total: totalEvents, real: realFalls }),
  };

  const data: InicioData = { profiles, stats };

  return { data, isLoading };
};

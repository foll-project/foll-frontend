import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { EventoCaida, TipoEvento } from '../models/evento.model';
import type { Notification } from '../../notifications/models/notification.model';
import { fetchMyPatients } from '../../iam/services/patientsApi';
import { useNotifications } from '../../notifications/hooks/useNotifications';
import i18n, { getDateLocale } from '../../../shared/i18n';

const FALL_TYPES = ['FallDetected'];
const FALSE_POSITIVE_TYPES = ['FallCancelled', 'FallDismissed', 'FalsePositive'];

interface ParsedFallData {
  location?: string;
  fallType?: string;
}

const parseFallData = (dataJson?: string | null): ParsedFallData => {
  if (!dataJson) return {};

  try {
    const data = JSON.parse(dataJson);

    let location: string | undefined;
    if (typeof data.location === 'string') {
      location = data.location;
    } else if (typeof data.address === 'string') {
      location = data.address;
    } else if (data.latitude != null && data.longitude != null) {
      location = `Lat ${data.latitude}, Lng ${data.longitude}`;
    }

    const fallType: string | undefined =
      data.fallType || data.type || data.category || undefined;

    return { location, fallType };
  } catch {
    return {};
  }
};

const mapNotificationToEvento = (
  notification: Notification,
  patientNames: Record<number, string>
): EventoCaida => {
  const date = new Date(notification.createdAt);
  const validDate = !Number.isNaN(date.getTime());
  const dateLocale = getDateLocale();
  const tipo = (
    FALSE_POSITIVE_TYPES.includes(notification.notificationType)
      ? i18n.t('historial.eventTypes.falsePositive')
      : i18n.t('historial.eventTypes.realEmergency')
  ) as TipoEvento;

  const parsed = parseFallData(notification.dataJson);

  const paciente =
    notification.patientId != null && patientNames[notification.patientId]
      ? patientNames[notification.patientId]
      : notification.patientId != null
        ? i18n.t('common.patientNumber', { id: notification.patientId })
        : i18n.t('historial.unknownPatient');

  return {
    id: String(notification.notificationLogId),
    ref: `#EVT-${notification.notificationLogId}`,
    fecha: validDate
      ? date.toLocaleDateString(dateLocale, { day: '2-digit', month: 'short', year: 'numeric' })
      : '--',
    hora: validDate
      ? date.toLocaleTimeString(dateLocale, { hour: '2-digit', minute: '2-digit' })
      : '--',
    paciente,
    tipo,
    ubicacion: parsed.location || i18n.t('historial.locationUnavailable'),
    observaciones: notification.body || '',
    tipoCaida: parsed.fallType,
  };
};

export const useHistorial = () => {
  useTranslation();
  const { notifications } = useNotifications();
  const [patientNames, setPatientNames] = useState<Record<number, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [eventoSeleccionado, setEventoSeleccionado] = useState<EventoCaida | null>(null);

  useEffect(() => {
    let active = true;

    const cargarPacientes = async () => {
      setIsLoading(true);
      try {
        const pacientes = await fetchMyPatients();
        if (!active) return;

        const mapa: Record<number, string> = {};
        pacientes.forEach((paciente) => {
          mapa[paciente.patientId] = paciente.fullName;
        });
        setPatientNames(mapa);
      } catch (error) {
        console.error('Error al cargar pacientes para el historial:', error);
      } finally {
        if (active) setIsLoading(false);
      }
    };

    cargarPacientes();
    return () => {
      active = false;
    };
  }, []);

  const eventos = useMemo<EventoCaida[]>(() => {
    return notifications
      .filter(
        (n) =>
          FALL_TYPES.includes(n.notificationType) ||
          FALSE_POSITIVE_TYPES.includes(n.notificationType)
      )
      .map((n) => mapNotificationToEvento(n, patientNames))
      .sort((a, b) => Number(b.id) - Number(a.id));
  }, [notifications, patientNames, i18n.language]);

  useEffect(() => {
    setEventoSeleccionado((prev) => {
      if (eventos.length === 0) return null;
      if (prev && eventos.some((e) => e.id === prev.id)) return prev;
      return eventos[0];
    });
  }, [eventos]);

  const seleccionarEvento = (evento: EventoCaida) => {
    setEventoSeleccionado(evento);
  };

  return {
    eventos,
    isLoading,
    detalle: {
      eventoSeleccionado,
      seleccionarEvento,
    },
  };
};

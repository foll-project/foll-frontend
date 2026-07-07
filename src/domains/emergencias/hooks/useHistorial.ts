import { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import type { EventoCaida, IncidentStatus, TipoEvento } from '../models/evento.model';
import type { HistorialFocusState } from '../models/historialNavigation.model';
import { fetchMyPatients } from '../../iam/services/patientsApi';
import { incidentsApi, type IncidentRecord } from '../services/incidentsApi';
import { useNotifications } from '../../notifications/hooks/useNotifications';
import i18n, { getDateLocale } from '../../../shared/i18n';

const parseIncidentStatus = (status: string): IncidentStatus => {
  if (status === 'Open' || status === 'Resolved' || status === 'Cancelled') {
    return status;
  }
  return 'Resolved';
};

const mapIncidentToEvento = (
  incident: IncidentRecord,
  patientNames: Record<number, string>,
): EventoCaida => {
  const status = parseIncidentStatus(incident.status);
  const openedAt = incident.openedAt || incident.lastSignalAt || incident.closedAt;
  const date = openedAt ? new Date(openedAt) : new Date(NaN);
  const validDate = !Number.isNaN(date.getTime());
  const dateLocale = getDateLocale();

  const tipo = (
    status === 'Cancelled'
      ? i18n.t('historial.eventTypes.falsePositive')
      : i18n.t('historial.eventTypes.realEmergency')
  ) as TipoEvento;

  const paciente =
    patientNames[incident.patientId] ??
    i18n.t('common.patientNumber', { id: incident.patientId });

  let direccion: string | null = null;
  let ubicacion = i18n.t('historial.locationUnavailable');
  if (incident.address?.trim()) {
    direccion = incident.address.trim();
    ubicacion = direccion;
  } else if (incident.latitude != null && incident.longitude != null) {
    ubicacion = i18n.t('historial.coordinatesFallback', {
      lat: incident.latitude,
      lng: incident.longitude,
    });
  }

  const observaciones =
    incident.finalObservation?.trim() ||
    (status === 'Cancelled' && incident.cancellationReason === 'UserButtonPressed'
      ? i18n.t('historial.cancelledByDeviceButton')
      : '');

  return {
    id: String(incident.incidentId),
    incidentId: incident.incidentId,
    patientId: incident.patientId,
    ref: `#INC-${incident.incidentId}`,
    fecha: validDate
      ? date.toLocaleDateString(dateLocale, { day: '2-digit', month: 'short', year: 'numeric' })
      : '--',
    hora: validDate
      ? date.toLocaleTimeString(dateLocale, { hour: '2-digit', minute: '2-digit' })
      : '--',
    paciente,
    tipo,
    status,
    isActive: status === 'Open',
    ubicacion,
    latitude: incident.latitude ?? null,
    longitude: incident.longitude ?? null,
    direccion,
    observaciones,
    tipoCaida: incident.fallType?.name,
  };
};

export const useHistorial = () => {
  useTranslation();
  const location = useLocation();
  const focusState = location.state as HistorialFocusState | null;
  const { lastResolvedIncident, attendFall, markFallAsFalseAlarm, notifications } =
    useNotifications();
  const [patientNames, setPatientNames] = useState<Record<number, string>>({});
  const [incidents, setIncidents] = useState<IncidentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [eventoSeleccionado, setEventoSeleccionado] = useState<EventoCaida | null>(null);
  const [accionEnCurso, setAccionEnCurso] = useState<'atender' | 'falsa' | null>(null);

  const fallNotificationCount = useMemo(
    () => notifications.filter((n) => n.notificationType === 'FallDetected').length,
    [notifications],
  );

  const cargarIncidentes = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const pacientes = await fetchMyPatients();
      const mapa: Record<number, string> = {};
      pacientes.forEach((paciente) => {
        mapa[paciente.patientId] = paciente.fullName;
      });
      setPatientNames(mapa);

      const historiales = await Promise.all(
        pacientes.map((paciente) => incidentsApi.getHistoryByPatient(paciente.patientId)),
      );

      const merged = historiales
        .flat()
        .sort((a, b) => {
          const ta = new Date(a.openedAt || 0).getTime();
          const tb = new Date(b.openedAt || 0).getTime();
          return tb - ta;
        });

      setIncidents(merged);
    } catch (error) {
      console.error('Error al cargar el historial de incidentes:', error);
      setLoadError(i18n.t('historial.fetchError'));
      setIncidents([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void cargarIncidentes();
  }, [cargarIncidentes]);

  useEffect(() => {
    if (lastResolvedIncident) {
      void cargarIncidentes();
    }
  }, [lastResolvedIncident?.receivedAt, cargarIncidentes]);

  useEffect(() => {
    void cargarIncidentes();
  }, [fallNotificationCount, cargarIncidentes]);

  const eventos = useMemo<EventoCaida[]>(() => {
    return incidents.map((incident) => mapIncidentToEvento(incident, patientNames));
  }, [incidents, patientNames, i18n.language]);

  useEffect(() => {
    if (focusState?.refreshAt) {
      void cargarIncidentes();
    }
  }, [focusState?.refreshAt, cargarIncidentes]);

  useEffect(() => {
    setEventoSeleccionado((prev) => {
      if (eventos.length === 0) return null;

      if (focusState?.selectIncidentId != null) {
        const focused = eventos.find((e) => e.incidentId === focusState.selectIncidentId);
        if (focused) return focused;
      }

      if (prev) {
        const updated = eventos.find((e) => e.incidentId === prev.incidentId);
        if (updated) return updated;
      }

      const activo = eventos.find((e) => e.isActive);
      return activo ?? eventos[0];
    });
  }, [eventos, focusState?.selectIncidentId, focusState?.refreshAt]);

  const seleccionarEvento = (evento: EventoCaida) => {
    setEventoSeleccionado(evento);
  };

  const atenderEventoActivo = useCallback(
    async (evento: EventoCaida) => {
      if (!evento.isActive || accionEnCurso) return;
      setAccionEnCurso('atender');
      try {
        await attendFall(evento.patientId);
        await cargarIncidentes();
      } finally {
        setAccionEnCurso(null);
      }
    },
    [accionEnCurso, attendFall, cargarIncidentes],
  );

  const marcarFalsaAlarma = useCallback(
    async (evento: EventoCaida) => {
      if (!evento.isActive || accionEnCurso) return;
      setAccionEnCurso('falsa');
      try {
        await markFallAsFalseAlarm(evento.patientId);
        await cargarIncidentes();
      } finally {
        setAccionEnCurso(null);
      }
    },
    [accionEnCurso, markFallAsFalseAlarm, cargarIncidentes],
  );

  return {
    eventos,
    isLoading,
    loadError,
    accionEnCurso,
    detalle: {
      eventoSeleccionado,
      seleccionarEvento,
      atenderEventoActivo,
      marcarFalsaAlarma,
    },
  };
};

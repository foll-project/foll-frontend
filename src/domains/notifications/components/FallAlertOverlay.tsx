import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import { getDateLocale } from '../../../shared/i18n';
import { useNotifications } from '../hooks/useNotifications';
import { fetchMyPatients } from '../../iam/services/patientsApi';
import { incidentsApi } from '../../emergencias/services/incidentsApi';
import { buildHistorialFocusState } from '../../emergencias/models/historialNavigation.model';
import {
  hasFallCoordinates,
  parseFallNotificationData,
} from '../utils/parseFallNotificationData';
import type { Notification } from '../models/notification.model';

const formatTime = (createdAt: string, locale: string): string => {
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString(locale, {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

export default function FallAlertOverlay() {
  const { t } = useTranslation();
  const { notifications, attendFall, markFallAsFalseAlarm } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();
  const [patientNames, setPatientNames] = useState<Record<number, string>>({});
  const [dismissedIds, setDismissedIds] = useState<number[]>([]);
  const [accion, setAccion] = useState<'atender' | 'falsa' | null>(null);

  const activeFalls = useMemo<Notification[]>(() => {
    return notifications
      .filter((n) => n.notificationType === 'FallDetected' && !n.acknowledgedAt)
      .filter((n) => !dismissedIds.includes(n.notificationLogId))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [notifications, dismissedIds]);

  const currentFall = activeFalls[0] || null;

  useEffect(() => {
    if (!currentFall || currentFall.patientId == null) return;
    if (patientNames[currentFall.patientId]) return;

    let active = true;
    fetchMyPatients()
      .then((pacientes) => {
        if (!active) return;
        const mapa: Record<number, string> = {};
        pacientes.forEach((p) => {
          mapa[p.patientId] = p.fullName;
        });
        setPatientNames((prev) => ({ ...prev, ...mapa }));
      })
      .catch((err) => console.warn('No se pudieron cargar nombres de pacientes para la alerta.', err));

    return () => {
      active = false;
    };
  }, [currentFall, patientNames]);

  if (!currentFall) return null;

  const fallData = parseFallNotificationData(currentFall.dataJson);
  const patientName =
    currentFall.patientId != null && patientNames[currentFall.patientId]
      ? patientNames[currentFall.patientId]
      : currentFall.patientId != null
        ? t('common.patientNumber', { id: currentFall.patientId })
        : t('common.patient');

  const confidencePct = fallData.confidence
    ? `${Math.round(parseFloat(fallData.confidence) * 100)}%`
    : null;
  const coordsValid = hasFallCoordinates(fallData);
  const addressText =
    fallData.address ||
    (coordsValid
      ? t('historial.coordinatesFallback', {
          lat: parseFloat(fallData.latitude!).toFixed(4),
          lng: parseFloat(fallData.longitude!).toFixed(4),
        })
      : t('historial.locationUnavailable'));

  const isBusy = accion !== null;

  const goToHistorialWithIncident = async (patientId: number) => {
    let incidentId: number | undefined;
    try {
      const active = await incidentsApi.getActiveByPatient(patientId);
      incidentId = active?.incidentId;
    } catch {
      /* el incidente puede haberse cerrado ya */
    }

    if (!incidentId) {
      try {
        const history = await incidentsApi.getHistoryByPatient(patientId);
        incidentId = history[0]?.incidentId;
      } catch {
        /* sin historial */
      }
    }

    setDismissedIds((prev) => [...prev, currentFall.notificationLogId]);
    navigate('/historial', {
      state: buildHistorialFocusState(incidentId),
      replace: location.pathname === '/historial',
    });
  };

  const handleAtender = async () => {
    if (currentFall.patientId == null || isBusy) return;
    setAccion('atender');
    const patientId = currentFall.patientId;
    try {
      const active = await incidentsApi.getActiveByPatient(patientId);
      const incidentId = active?.incidentId;
      await attendFall(patientId);
      setDismissedIds((prev) => [...prev, currentFall.notificationLogId]);
      navigate('/historial', {
        state: buildHistorialFocusState(incidentId),
        replace: location.pathname === '/historial',
      });
    } finally {
      setAccion(null);
    }
  };

  const handleFalsaAlarma = async () => {
    if (currentFall.patientId == null || isBusy) return;
    setAccion('falsa');
    try {
      await markFallAsFalseAlarm(currentFall.patientId);
      await goToHistorialWithIncident(currentFall.patientId);
    } finally {
      setAccion(null);
    }
  };

  const handleVerHistorial = () => {
    if (currentFall.patientId == null) {
      setDismissedIds((prev) => [...prev, currentFall.notificationLogId]);
      navigate('/historial');
      return;
    }
    void goToHistorialWithIncident(currentFall.patientId);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
      <div className="relative w-full max-w-md mx-4 bg-white rounded-3xl shadow-2xl overflow-hidden border-2 border-red-500">
        <div className="bg-red-600 px-6 py-5 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-red-500 animate-pulse opacity-40" />
          <div className="relative flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </span>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest opacity-90">
                {t('notifications.fallOverlay.emergencyAlert')}
              </p>
              <h2 className="text-2xl font-black leading-tight">{t('notifications.fallOverlay.fallDetected')}</h2>
            </div>
          </div>
          {activeFalls.length > 1 && (
            <span className="absolute top-4 right-5 bg-white text-red-700 text-[11px] font-black px-2.5 py-1 rounded-full">
              {t('common.moreAlerts', { count: activeFalls.length - 1 })}
            </span>
          )}
        </div>

        <div className="px-6 py-6 space-y-5">
          <div className="text-center">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
              {t('notifications.fallOverlay.elder')}
            </p>
            <p className="text-2xl font-black text-[#16333F]">{patientName}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#F9F7F1] rounded-xl p-3 text-center">
              <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">{t('notifications.fallOverlay.time')}</p>
              <p className="text-xs font-bold text-[#16333F]">{formatTime(currentFall.createdAt, getDateLocale())}</p>
            </div>
            <div className="bg-[#F9F7F1] rounded-xl p-3 text-center">
              <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">{t('notifications.fallOverlay.fallType')}</p>
              <p className="text-xs font-bold text-[#16333F]">{fallData.fallTypeName || t('common.notSpecified')}</p>
            </div>
            {confidencePct && (
              <div className="bg-[#F9F7F1] rounded-xl p-3 text-center col-span-2">
                <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">{t('notifications.fallOverlay.aiConfidence')}</p>
                <p className="text-xs font-bold text-[#16333F]">{confidencePct}</p>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-[#89BAAF]/40 bg-gradient-to-br from-[#F9F7F1] to-white p-4 flex gap-3.5">
            <div className="shrink-0 flex h-11 w-11 items-center justify-center rounded-full bg-[#16333F]/10 text-[#16333F]">
              <MapPin size={20} strokeWidth={2.25} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                {t('notifications.fallOverlay.location')}
              </p>
              <p className="text-sm font-bold text-[#16333F] leading-snug">{addressText}</p>
              {coordsValid && fallData.address && (
                <p className="text-[10px] font-mono text-gray-500 mt-1.5">
                  {parseFloat(fallData.latitude!).toFixed(5)}, {parseFloat(fallData.longitude!).toFixed(5)}
                </p>
              )}
            </div>
          </div>

          <p className="text-xs text-gray-500 text-center leading-relaxed">
            {currentFall.body}
          </p>

          <div className="space-y-3 pt-1">
            <button
              onClick={handleAtender}
              disabled={isBusy || currentFall.patientId == null}
              className="w-full bg-red-600 hover:bg-red-700 text-white rounded-xl py-3.5 text-sm font-bold transition-colors shadow-md disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {accion === 'atender' ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                  {t('common.attending')}
                </>
              ) : (
                t('notifications.fallOverlay.onMyWay')
              )}
            </button>
            <div className="flex gap-3">
              <button
                onClick={handleVerHistorial}
                disabled={isBusy}
                className="flex-1 border border-[#16333F] text-[#16333F] hover:bg-[#16333F] hover:text-white rounded-xl py-2.5 text-xs font-bold transition-colors disabled:opacity-60"
              >
                {t('common.viewHistory')}
              </button>
              <button
                onClick={handleFalsaAlarma}
                disabled={isBusy || currentFall.patientId == null}
                className="flex-1 border border-gray-300 text-gray-500 hover:bg-gray-50 rounded-xl py-2.5 text-xs font-bold transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {accion === 'falsa' ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-gray-300 border-t-gray-500 rounded-full animate-spin" />
                    {t('common.marking')}
                  </>
                ) : (
                  t('notifications.fallOverlay.falseAlarm')
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNotifications } from '../hooks/useNotifications';
import { fetchMyPatients } from '../../iam/services/patientsApi';

const AUTO_DISMISS_MS = 7000;

export default function IncidentResolvedToast() {
  const { t } = useTranslation();
  const { lastResolvedIncident, dismissResolvedIncident } = useNotifications();
  const [patientNames, setPatientNames] = useState<Record<number, string>>({});

  useEffect(() => {
    if (!lastResolvedIncident) return;
    const timer = window.setTimeout(() => dismissResolvedIncident(), AUTO_DISMISS_MS);
    return () => window.clearTimeout(timer);
  }, [lastResolvedIncident, dismissResolvedIncident]);

  useEffect(() => {
    const patientId = lastResolvedIncident?.patientId;
    if (patientId == null || patientNames[patientId]) return;

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
      .catch((err) => console.warn('No se pudieron cargar nombres de pacientes para el aviso.', err));

    return () => {
      active = false;
    };
  }, [lastResolvedIncident, patientNames]);

  if (!lastResolvedIncident) return null;

  const ev = lastResolvedIncident;
  const patientName =
    ev.patientId != null && patientNames[ev.patientId]
      ? patientNames[ev.patientId]
      : ev.patientId != null
        ? t('common.patientNumber', { id: ev.patientId })
        : t('common.thePatient');

  const isFalseAlarm =
    ev.status === 'FalsePositive' || ev.status === 'Cancelled' || Boolean(ev.cancellationReason);
  const isDeviceButtonCancel =
    ev.cancellationReason === 'UserButtonPressed' && ev.closedByUserId == null;
  const who = ev.resolvedByMe ? t('common.you') : ev.closedByName?.trim() || t('common.otherCaregiver');

  const label = isFalseAlarm
    ? t('notifications.incidentResolved.falseAlarm')
    : t('notifications.incidentResolved.fallAttended');

  let message: string;
  if (isFalseAlarm) {
    if (isDeviceButtonCancel) {
      message = t('notifications.incidentResolved.cancelledByDeviceButton', { name: patientName });
    } else {
      message = ev.resolvedByMe
        ? t('notifications.incidentResolved.markedFalseByMe', { name: patientName })
        : t('notifications.incidentResolved.markedFalseByOther', { who, name: patientName });
    }
  } else {
    message = ev.resolvedByMe
      ? t('notifications.incidentResolved.attendedByMe', { name: patientName })
      : t('notifications.incidentResolved.attendedByOther', { who, name: patientName });
  }

  const accent = isFalseAlarm ? 'bg-amber-500' : 'bg-emerald-500';
  const ring = isFalseAlarm ? 'border-amber-200' : 'border-emerald-200';

  return (
    <div className="fixed bottom-6 right-6 z-[90] w-[380px] max-w-[calc(100vw-3rem)] animate-[slideInResolved_0.3s_ease-out]">
      <div className={`relative overflow-hidden rounded-2xl bg-white shadow-2xl border ${ring}`}>
        <div className={`absolute left-0 top-0 h-full w-1.5 ${accent}`} />
        <div className="p-4 pl-5">
          <div className="flex items-start gap-3">
            <div
              className={`flex-shrink-0 w-10 h-10 rounded-xl ${accent} text-white flex items-center justify-center shadow-md`}
            >
              {isFalseAlarm ? (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              ) : (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-wide text-gray-400">{label}</p>
              <h4 className="text-sm font-bold text-[#16333F] leading-snug">{message}</h4>
              {!isFalseAlarm && ev.fallTypeName && (
                <p className="text-xs text-gray-500 mt-0.5">
                  {t('notifications.incidentResolved.fallTypeLabel', { type: ev.fallTypeName })}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={dismissResolvedIncident}
              className="flex-shrink-0 text-gray-300 hover:text-gray-500 transition-colors"
              aria-label={t('common.close')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideInResolved {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

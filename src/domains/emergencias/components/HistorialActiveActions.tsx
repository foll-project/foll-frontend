import { useTranslation } from 'react-i18next';
import type { EventoCaida } from '../models/evento.model';

interface HistorialActiveActionsProps {
  evento: EventoCaida;
  accionEnCurso: 'atender' | 'falsa' | null;
  isBusy: boolean;
  onAtender: (evento: EventoCaida) => void;
  onFalsaAlarma: (evento: EventoCaida) => void;
  variant?: 'banner' | 'panel' | 'inline';
}

export default function HistorialActiveActions({
  evento,
  accionEnCurso,
  isBusy,
  onAtender,
  onFalsaAlarma,
  variant = 'panel',
}: HistorialActiveActionsProps) {
  const { t } = useTranslation();

  if (!evento.isActive) return null;

  if (variant === 'inline') {
    return (
      <div className="flex flex-col gap-1.5 min-w-[120px]" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          onClick={() => onAtender(evento)}
          disabled={isBusy}
          className="bg-red-600 hover:bg-red-700 text-white rounded-lg px-3 py-1.5 text-[10px] font-bold transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
        >
          {accionEnCurso === 'atender' ? (
            <>
              <span className="w-3 h-3 border-2 border-white/50 border-t-white rounded-full animate-spin" />
              {t('common.attending')}
            </>
          ) : (
            t('historial.attendShort')
          )}
        </button>
        <button
          type="button"
          onClick={() => onFalsaAlarma(evento)}
          disabled={isBusy}
          className="border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 rounded-lg px-3 py-1 text-[10px] font-bold transition-colors disabled:opacity-60"
        >
          {accionEnCurso === 'falsa' ? t('common.marking') : t('historial.falseAlarmShort')}
        </button>
      </div>
    );
  }

  const containerClass =
    variant === 'banner'
      ? 'rounded-2xl border border-red-300 bg-gradient-to-r from-red-50 to-red-50/40 p-4 md:p-5 shadow-sm'
      : 'rounded-2xl border border-red-200 bg-red-50/60 p-4 space-y-3';

  return (
    <div className={containerClass}>
      <div>
        <p className="text-xs font-bold text-red-700">{t('historial.activeActionsTitle')}</p>
        <p className="text-[11px] text-red-600/80 mt-1">
          {variant === 'banner'
            ? t('historial.activeBannerHint', { ref: evento.ref, patient: evento.paciente })
            : t('historial.activeActionsHint')}
        </p>
      </div>
      <div className={variant === 'banner' ? 'flex flex-col sm:flex-row gap-2 mt-3' : 'space-y-3'}>
        <button
          type="button"
          onClick={() => onAtender(evento)}
          disabled={isBusy}
          className={`bg-red-600 hover:bg-red-700 text-white rounded-xl py-3 text-sm font-bold transition-colors shadow-md disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
            variant === 'banner' ? 'sm:flex-1' : 'w-full'
          }`}
        >
          {accionEnCurso === 'atender' ? (
            <>
              <span className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
              {t('common.attending')}
            </>
          ) : (
            t('notifications.fallOverlay.onMyWay')
          )}
        </button>
        <button
          type="button"
          onClick={() => onFalsaAlarma(evento)}
          disabled={isBusy}
          className={`border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 rounded-xl py-2.5 text-xs font-bold transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
            variant === 'banner' ? 'sm:flex-1' : 'w-full'
          }`}
        >
          {accionEnCurso === 'falsa' ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
              {t('common.marking')}
            </>
          ) : (
            t('notifications.fallOverlay.falseAlarm')
          )}
        </button>
      </div>
    </div>
  );
}

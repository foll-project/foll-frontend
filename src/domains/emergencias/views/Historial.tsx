import { useTranslation } from 'react-i18next';
import { useHistorial } from '../hooks/useHistorial';
import IncidentLocationMap from '../components/IncidentLocationMap';
import HistorialActiveActions from '../components/HistorialActiveActions';
import type { IncidentStatus, TipoEvento } from '../models/evento.model';

const AlertIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>;
const EventoBadge = ({ tipo }: { tipo: TipoEvento }) => {
  const { t } = useTranslation();
  const isEmergencia = tipo === t('historial.eventTypes.realEmergency');

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold ${isEmergencia ? 'bg-[#FDF5D3] text-[#DCA646]' : 'bg-[#E0F2E9] text-[#2E7D32]'
      }`}>
      <span className={`w-1.5 h-1.5 rounded-full ${isEmergencia ? 'bg-[#DCA646]' : 'bg-[#2E7D32]'}`}></span>
      {tipo}
    </span>
  );
};

const StatusBadge = ({ status }: { status: IncidentStatus }) => {
  const { t } = useTranslation();

  const label =
    status === 'Open'
      ? t('status.incidentOpen')
      : status === 'Resolved'
        ? t('status.incidentResolved')
        : t('status.incidentFalseAlarm');

  const styles =
    status === 'Open'
      ? 'bg-red-100 text-red-700 ring-1 ring-red-200'
      : status === 'Resolved'
        ? 'bg-green-100 text-green-700'
        : 'bg-gray-100 text-gray-700';

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${styles}`}>
      {status === 'Open' && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />}
      {label}
    </span>
  );
};

export default function Historial() {
  const { t } = useTranslation();
  const { eventos, isLoading, loadError, accionEnCurso, detalle } = useHistorial();

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center font-bold text-[#16333F]">
        {t('historial.loading')}
      </div>
    );
  }

  const ev = detalle.eventoSeleccionado;
  const eventoActivo = eventos.find((e) => e.isActive) ?? null;
  const isRealEmergency = (tipo: TipoEvento) => tipo === t('historial.eventTypes.realEmergency');
  const isBusy = accionEnCurso !== null;

  return (
    <div className="max-w-[1200px] mx-auto space-y-8">

      <div>
        <h1 className="text-3xl font-bold text-[#16333F] mb-2">{t('historial.title')}</h1>
        <p className="text-sm text-gray-500">{t('historial.subtitle')}</p>
        {loadError && (
          <p className="text-sm text-red-600 font-medium mt-2">{loadError}</p>
        )}
      </div>

      {eventoActivo && (
        <HistorialActiveActions
          evento={eventoActivo}
          accionEnCurso={accionEnCurso}
          isBusy={isBusy}
          onAtender={(evento) => {
            detalle.seleccionarEvento(evento);
            void detalle.atenderEventoActivo(evento);
          }}
          onFalsaAlarma={(evento) => {
            detalle.seleccionarEvento(evento);
            void detalle.marcarFalsaAlarma(evento);
          }}
          variant="banner"
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

        <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-[0_8px_30px_-15px_rgba(0,0,0,0.06)] border border-gray-50 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="py-4 px-4 text-xs font-bold text-gray-400">{t('historial.columns.date')}</th>
                <th className="py-4 px-4 text-xs font-bold text-gray-400">{t('historial.columns.time')}</th>
                <th className="py-4 px-4 text-xs font-bold text-gray-400">{t('historial.columns.elder')}</th>
                <th className="py-4 px-4 text-xs font-bold text-gray-400 text-center">{t('historial.columns.eventType')}</th>
                <th className="py-4 px-4 text-xs font-bold text-gray-400 text-center">{t('historial.columns.status')}</th>
                <th className="py-4 px-4 text-xs font-bold text-gray-400 text-center">{t('historial.columns.action')}</th>
              </tr>
            </thead>
            <tbody>
              {eventos.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-sm text-gray-400 font-medium">
                    {t('historial.empty')}
                  </td>
                </tr>
              )}
              {eventos.map((evento) => {
                const isSelected = ev?.id === evento.id;
                return (
                <tr
                  key={evento.id}
                  className={`border-b border-gray-50 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#16333F]/[0.06] shadow-[inset_4px_0_0_0_#16333F] ring-1 ring-[#16333F]/15'
                      : 'hover:bg-gray-50'
                  } ${evento.isActive && !isSelected ? 'bg-red-50/40' : ''}`}
                  onClick={() => detalle.seleccionarEvento(evento)}
                >
                  <td className="py-5 px-4 text-sm text-[#16333F] font-medium">{evento.fecha}</td>
                  <td className="py-5 px-4 text-sm text-gray-500">{evento.hora}</td>
                  <td className="py-5 px-4 text-sm text-[#16333F] font-semibold">{evento.paciente}</td>
                  <td className="py-5 px-4 text-center">
                    <EventoBadge tipo={evento.tipo} />
                  </td>
                  <td className="py-5 px-4 text-center">
                    <StatusBadge status={evento.status} />
                  </td>
                  <td className="py-5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                    {evento.isActive ? (
                      <HistorialActiveActions
                        evento={evento}
                        accionEnCurso={accionEnCurso}
                        isBusy={isBusy}
                        onAtender={(e) => {
                          detalle.seleccionarEvento(e);
                          void detalle.atenderEventoActivo(e);
                        }}
                        onFalsaAlarma={(e) => {
                          detalle.seleccionarEvento(e);
                          void detalle.marcarFalsaAlarma(e);
                        }}
                        variant="inline"
                      />
                    ) : (
                      <button
                        type="button"
                        onClick={() => detalle.seleccionarEvento(evento)}
                        className="border border-[#16333F] text-[#16333F] hover:bg-[#16333F] hover:text-white rounded-lg px-4 py-1.5 text-xs font-bold transition-colors"
                      >
                        {isSelected ? t('historial.viewingReport') : t('historial.viewReport')}
                      </button>
                    )}
                  </td>
                </tr>
              );
              })}
            </tbody>
          </table>
        </div>

        {ev ? (
          <div className="bg-white rounded-3xl shadow-[0_12px_40px_-12px_rgba(22,51,63,0.18)] border-2 border-[#16333F]/20 flex flex-col h-full overflow-hidden ring-1 ring-[#16333F]/10">

            <div className="bg-gradient-to-r from-[#16333F] to-[#1f4a5c] px-6 py-4 text-white">
              <div className="flex justify-between items-start gap-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest opacity-75 mb-1">
                    {t('historial.viewingDetail')}
                  </p>
                  <h3 className="font-black text-lg leading-tight">{ev.ref}</h3>
                  <p className="text-xs opacity-80 mt-1 font-medium">
                    {ev.fecha} · {ev.hora} · {ev.paciente}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <StatusBadge status={ev.status} />
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${isRealEmergency(ev.tipo) ? 'bg-[#FDF5D3] text-[#DCA646]' : 'bg-[#E0F2E9] text-[#2E7D32]'}`}>
                    {isRealEmergency(ev.tipo)
                      ? t('historial.eventTypes.emergencyShort')
                      : t('historial.eventTypes.falseShort')}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-6 flex flex-col flex-1">

            {ev.isActive && (
              <HistorialActiveActions
                evento={ev}
                accionEnCurso={accionEnCurso}
                isBusy={isBusy}
                onAtender={detalle.atenderEventoActivo}
                onFalsaAlarma={detalle.marcarFalsaAlarma}
                variant="panel"
              />
            )}

            <div className={`grid grid-cols-3 gap-4 mb-6 ${ev.isActive ? 'mt-6' : ''}`}>
              <div>
                <p className="text-[10px] font-bold text-gray-400 mb-1">{t('historial.patient')}</p>
                <p className="text-base font-bold text-[#16333F]">
                  {ev.paciente.split(' ')[0]}
                  {ev.paciente.split(' ')[1] ? ` ${ev.paciente.split(' ')[1].charAt(0)}.` : ''}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 mb-1">{t('historial.responseTime')}</p>
                <p className="text-base font-bold text-[#16333F]">{ev.tiempoRespuesta || '--'}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 mb-1">{t('historial.fallType')}</p>
                <p className="text-base font-bold text-[#16333F]">{ev.tipoCaida || '--'}</p>
              </div>
            </div>

            <IncidentLocationMap
              key={ev.incidentId}
              latitude={ev.latitude}
              longitude={ev.longitude}
              address={ev.direccion ?? ev.ubicacion}
              className="mb-6"
            />
            <div className="bg-[#F9F7F1] rounded-xl p-5 mb-6 flex-1 border border-gray-100">
              <h4 className="flex items-center gap-1.5 text-xs font-bold text-[#16333F] mb-3">
                <AlertIcon /> {t('historial.eventObservations')}
              </h4>
              <p className="text-[11px] leading-relaxed text-gray-600">
                {ev.observaciones || t('historial.noObservations')}
              </p>
            </div>

            {ev.anotacionesPaciente && ev.anotacionesPaciente.length > 0 && (
              <div className="mb-6 mt-6">
                <h4 className="flex items-center gap-1.5 text-xs font-bold text-[#16333F] mb-3">
                  {t('historial.recentPatientLog')}
                </h4>
                <div className="space-y-2 max-h-32 overflow-y-auto pr-2">
                  {ev.anotacionesPaciente.map((nota) => (
                    <div key={nota.id} className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                      <p className="text-[10px] text-gray-500 mb-1 font-medium">{nota.fecha} - {nota.autor}</p>
                      <p className="text-[11px] text-[#16333F]">{nota.texto}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-50 flex items-center justify-center h-full min-h-[400px]">
            <p className="text-gray-400 text-sm font-medium">{t('historial.selectEvent')}</p>
          </div>
        )}
      </div>
    </div>
  );
}

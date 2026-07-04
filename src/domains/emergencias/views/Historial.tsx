import { useTranslation } from 'react-i18next';
import { useHistorial } from '../hooks/useHistorial';
import type { TipoEvento } from '../models/evento.model';

const MapPinIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>;
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

export default function Historial() {
  const { t } = useTranslation();
  const { eventos, isLoading, detalle } = useHistorial();

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center font-bold text-[#16333F]">
        {t('historial.loading')}
      </div>
    );
  }

  const ev = detalle.eventoSeleccionado;
  const isRealEmergency = (tipo: TipoEvento) => tipo === t('historial.eventTypes.realEmergency');

  return (
    <div className="max-w-[1200px] mx-auto space-y-8">

      <div>
        <h1 className="text-3xl font-bold text-[#16333F] mb-2">{t('historial.title')}</h1>
        <p className="text-sm text-gray-500">{t('historial.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

        <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-[0_8px_30px_-15px_rgba(0,0,0,0.06)] border border-gray-50 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="py-4 px-4 text-xs font-bold text-gray-400">{t('historial.columns.date')}</th>
                <th className="py-4 px-4 text-xs font-bold text-gray-400">{t('historial.columns.time')}</th>
                <th className="py-4 px-4 text-xs font-bold text-gray-400">{t('historial.columns.elder')}</th>
                <th className="py-4 px-4 text-xs font-bold text-gray-400 text-center">{t('historial.columns.eventType')}</th>
                <th className="py-4 px-4 text-xs font-bold text-gray-400 text-center">{t('historial.columns.action')}</th>
              </tr>
            </thead>
            <tbody>
              {eventos.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-sm text-gray-400 font-medium">
                    {t('historial.empty')}
                  </td>
                </tr>
              )}
              {eventos.map((evento) => (
                <tr
                  key={evento.id}
                  className={`border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer ${ev?.id === evento.id ? 'bg-gray-50' : ''}`}
                  onClick={() => detalle.seleccionarEvento(evento)}
                >
                  <td className="py-5 px-4 text-sm text-[#16333F] font-medium">{evento.fecha}</td>
                  <td className="py-5 px-4 text-sm text-gray-500">{evento.hora}</td>
                  <td className="py-5 px-4 text-sm text-[#16333F] font-semibold">{evento.paciente}</td>
                  <td className="py-5 px-4 text-center">
                    <EventoBadge tipo={evento.tipo} />
                  </td>
                  <td className="py-5 px-4 text-center">
                    <button className="border border-[#16333F] text-[#16333F] hover:bg-[#16333F] hover:text-white rounded-lg px-4 py-1.5 text-xs font-bold transition-colors">
                      {t('historial.viewReport')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {ev ? (
          <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_-15px_rgba(0,0,0,0.06)] border border-gray-50 flex flex-col h-full">

            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-[#16333F] font-bold text-lg mb-1">{t('historial.eventDetail')}</h3>
                <p className="text-xs text-gray-400 font-medium">{t('historial.ref', { ref: ev.ref })}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${isRealEmergency(ev.tipo) ? 'bg-[#FDF5D3] text-[#DCA646]' : 'bg-[#E0F2E9] text-[#2E7D32]'}`}>
                {isRealEmergency(ev.tipo)
                  ? t('historial.eventTypes.emergencyShort')
                  : t('historial.eventTypes.falseShort')}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
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

            <div className="relative rounded-xl overflow-hidden bg-gray-200 h-36 mb-6 flex items-end">
              <div className="absolute inset-0 bg-gradient-to-br from-[#89BAAF]/40 to-[#16333F]/20 flex items-center justify-center">
                <span className="text-[#16333F] opacity-50 font-bold">{t('common.mapPlaceholder')}</span>
              </div>
              <div className="relative w-full bg-white/90 backdrop-blur-sm px-4 py-2 flex items-center gap-2 text-xs font-semibold text-gray-600 border-t border-white/50">
                <MapPinIcon /> {ev.ubicacion}
              </div>
            </div>

            <div className="bg-[#F9F7F1] rounded-xl p-5 mb-6 flex-1 border border-gray-100">
              <h4 className="flex items-center gap-1.5 text-xs font-bold text-[#16333F] mb-3">
                <AlertIcon /> {t('historial.eventObservations')}
              </h4>
              <p className="text-[11px] leading-relaxed text-gray-600">
                {ev.observaciones || t('historial.noObservations')}
              </p>
            </div>

            {ev.anotacionesPaciente && ev.anotacionesPaciente.length > 0 && (
              <div className="mb-6">
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
        ) : (
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-50 flex items-center justify-center h-full min-h-[400px]">
            <p className="text-gray-400 text-sm font-medium">{t('historial.selectEvent')}</p>
          </div>
        )}
      </div>
    </div>
  );
}

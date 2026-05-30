import { useHistorial } from '../hooks/useHistorial';
import type { TipoEvento } from '../models/evento.model';

// Íconos SVG
const MapPinIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>;
//const LockIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></svg>;
const AlertIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>;

// Componente para el Badge de Tipo de Evento
const EventoBadge = ({ tipo }: { tipo: TipoEvento }) => {
  const isEmergencia = tipo === 'Emergencia Real';
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold ${isEmergencia ? 'bg-[#FDF5D3] text-[#DCA646]' : 'bg-[#E0F2E9] text-[#2E7D32]'
      }`}>
      <span className={`w-1.5 h-1.5 rounded-full ${isEmergencia ? 'bg-[#DCA646]' : 'bg-[#2E7D32]'}`}></span>
      {tipo}
    </span>
  );
};

export default function Historial() {
  const { eventos, isLoading, detalle } = useHistorial();

  if (isLoading) return <div className="h-full flex items-center justify-center font-bold text-[#16333F]">Cargando historial...</div>;

  const ev = detalle.eventoSeleccionado;

  return (
    <div className="max-w-[1200px] mx-auto space-y-8">

      {/* Cabecera */}
      <div>
        <h1 className="text-3xl font-bold text-[#16333F] mb-2">Historial de Eventos</h1>
        <p className="text-sm text-gray-500">Revisión detallada de registros de caídas y alertas del sistema.</p>
      </div>

      {/* Layout de 2 Columnas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

        {/* --- COLUMNA IZQUIERDA: Tabla --- */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-[0_8px_30px_-15px_rgba(0,0,0,0.06)] border border-gray-50 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="py-4 px-4 text-xs font-bold text-gray-400">Fecha</th>
                <th className="py-4 px-4 text-xs font-bold text-gray-400">Hora</th>
                <th className="py-4 px-4 text-xs font-bold text-gray-400">Adulto Mayor</th>
                <th className="py-4 px-4 text-xs font-bold text-gray-400 text-center">Tipo de Evento</th>
                <th className="py-4 px-4 text-xs font-bold text-gray-400 text-center">Acción</th>
              </tr>
            </thead>
            <tbody>
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
                      Ver Reporte {'>'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* --- COLUMNA DERECHA: Detalles del Evento --- */}
        {ev ? (
          <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_-15px_rgba(0,0,0,0.06)] border border-gray-50 flex flex-col h-full">

            {/* Header Detalle */}
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-[#16333F] font-bold text-lg mb-1">Detalle del Evento</h3>
                <p className="text-xs text-gray-400 font-medium">Ref: {ev.ref}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${ev.tipo === 'Emergencia Real' ? 'bg-[#FDF5D3] text-[#DCA646]' : 'bg-[#E0F2E9] text-[#2E7D32]'}`}>
                {ev.tipo.split(' ')[0]} {/* Muestra solo "Emergencia" o "Falso" como en el mockup */}
              </span>
            </div>

            {/* Info Rápida */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div>
                <p className="text-[10px] font-bold text-gray-400 mb-1">Paciente</p>
                <p className="text-base font-bold text-[#16333F]">{ev.paciente.split(' ')[0]} {ev.paciente.split(' ')[1].charAt(0)}.</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 mb-1">Tiempo de Respuesta</p>
                <p className="text-base font-bold text-[#16333F]">{ev.tiempoRespuesta || '--'}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 mb-1">Tipo de Caída</p>
                <p className="text-base font-bold text-[#16333F]">{ev.tipoCaida || '--'}</p>
              </div>
            </div>

            {/* Mapa / Ubicación */}
            <div className="relative rounded-xl overflow-hidden bg-gray-200 h-36 mb-6 flex items-end">
              {/* Placeholder para la imagen del mapa 3D */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#89BAAF]/40 to-[#16333F]/20 flex items-center justify-center">
                <span className="text-[#16333F] opacity-50 font-bold">Mapa 3D Placeholder</span>
              </div>
              {/* Etiqueta de ubicación */}
              <div className="relative w-full bg-white/90 backdrop-blur-sm px-4 py-2 flex items-center gap-2 text-xs font-semibold text-gray-600 border-t border-white/50">
                <MapPinIcon /> {ev.ubicacion}
              </div>
            </div>

            {/* Observaciones del Evento */}
            <div className="bg-[#F9F7F1] rounded-xl p-5 mb-6 flex-1 border border-gray-100">
              <h4 className="flex items-center gap-1.5 text-xs font-bold text-[#16333F] mb-3">
                <AlertIcon /> Observaciones del Evento
              </h4>
              <p className="text-[11px] leading-relaxed text-gray-600">
                {ev.observaciones || 'No hay observaciones registradas para este evento.'}
              </p>
            </div>

            {/* Bitácora Reciente del Paciente */}
            {ev.anotacionesPaciente && ev.anotacionesPaciente.length > 0 && (
              <div className="mb-6">
                <h4 className="flex items-center gap-1.5 text-xs font-bold text-[#16333F] mb-3">
                  Bitácora Reciente del Paciente
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

            {/* Botones de Acción 
            <div className="flex gap-3 mt-auto">
              <button className="flex-1 bg-[#3A5664] hover:bg-[#16333F] text-white rounded-xl py-3 text-sm font-bold transition-colors">
                Contactar Familiar
              </button>
              <button className="w-12 flex items-center justify-center border border-gray-200 text-gray-500 hover:text-[#16333F] hover:border-[#16333F] rounded-xl transition-colors">
                <PrinterIcon />
              </button>
            </div>*/}

          </div>
        ) : (
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-50 flex items-center justify-center h-full min-h-[400px]">
            <p className="text-gray-400 text-sm font-medium">Selecciona un evento para ver los detalles</p>
          </div>
        )}
      </div>
    </div>
  );
}
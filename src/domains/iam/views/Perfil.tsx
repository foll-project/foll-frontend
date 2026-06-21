import { usePerfil } from '../hooks/usePerfil';

// Íconos SVG
const IdCardIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="16" rx="2" ry="2"/><circle cx="9" cy="10" r="2"/><path d="M15 8h2M15 12h2M7 16h5"/></svg>;
const LockIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>;
const BellIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>;
const SaveIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>;

// Componente Toggle Switch de Tailwind
const Toggle = ({ isOn, onClick }: { isOn: boolean; onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 ${isOn ? 'bg-[#3A5664]' : 'bg-gray-200'}`}
  >
    <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform shadow-sm ${isOn ? 'translate-x-5' : 'translate-x-0'}`} />
  </button>
);

export default function Perfil() {
  const { perfil, isLoading, formularios, handlers } = usePerfil();

  if (isLoading || !perfil) return <div className="h-full flex items-center justify-center font-bold text-[#16333F]">Cargando perfil...</div>;

  const { formDatos, setFormDatos, formPreferencias, handleCambiarPreferencia, formPasswords, setFormPasswords } = formularios;

  return (
    <div className="max-w-[1200px] mx-auto space-y-8 pb-10">
      
      {/* Cabecera */}
      <div>
        <h1 className="text-3xl font-bold text-[#16333F] mb-2">Mi Perfil</h1>
        <p className="text-sm text-gray-500">Gestiona tu información personal y preferencias de seguridad.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
        
        {/* --- PANEL IZQUIERDO (Info y Seguridad) --- */}
        <div className="lg:col-span-3 bg-gradient-to-br from-white to-[#F9FBFB] rounded-3xl p-8 shadow-[0_8px_30px_-15px_rgba(0,0,0,0.06)] border border-gray-50">
          
          {/* Header del Perfil */}
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-[#16333F] mb-1">{formDatos.nombres} {formDatos.apellidos}</h2>
            <p className="text-sm text-gray-500 mb-3">{perfil.rol}</p>
            <span className="inline-flex items-center gap-1.5 bg-[#E0F2E9] text-[#2E7D32] px-3 py-1 rounded-full text-[10px] font-bold">
              <span className="w-1.5 h-1.5 bg-[#2E7D32] rounded-full"></span>
              {perfil.estado}
            </span>
          </div>

          {/* Sección: Datos Personales */}
          <div className="mb-10">
            <h3 className="flex items-center gap-2 text-[#16333F] font-bold text-sm mb-6">
              <IdCardIcon /> Datos Personales
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 mb-1">Nombres</label>
                <input type="text" value={formDatos.nombres} onChange={e => setFormDatos({...formDatos, nombres: e.target.value})} className="w-full bg-transparent border-b border-gray-200 py-1.5 text-sm text-[#16333F] font-semibold outline-none focus:border-[#16333F] transition-colors" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 mb-1">Apellidos</label>
                <input type="text" value={formDatos.apellidos} onChange={e => setFormDatos({...formDatos, apellidos: e.target.value})} className="w-full bg-transparent border-b border-gray-200 py-1.5 text-sm text-[#16333F] font-semibold outline-none focus:border-[#16333F] transition-colors" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 mb-1">Correo Electrónico</label>
                <input type="email" value={formDatos.correo} onChange={e => setFormDatos({...formDatos, correo: e.target.value})} className="w-full bg-transparent border-b border-gray-200 py-1.5 text-sm text-[#16333F] font-semibold outline-none focus:border-[#16333F] transition-colors" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 mb-1">Teléfono Móvil</label>
                <input type="tel" value={formDatos.telefono} onChange={e => setFormDatos({...formDatos, telefono: e.target.value})} className="w-full bg-transparent border-b border-gray-200 py-1.5 text-sm text-[#16333F] font-semibold outline-none focus:border-[#16333F] transition-colors" />
              </div>
            </div>
          </div>

          {/* Sección: Seguridad y Contraseña */}
          <div>
            <h3 className="flex items-center gap-2 text-[#16333F] font-bold text-sm mb-6">
              <LockIcon /> Seguridad y Contraseña
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <div className="md:col-span-2">
                <label className="block text-[10px] font-bold text-gray-400 mb-1">Contraseña Actual</label>
                <input type="password" placeholder="••••••••" value={formPasswords.actual} onChange={e => setFormPasswords({...formPasswords, actual: e.target.value})} className="w-full md:w-1/2 bg-transparent border-b border-gray-200 py-1.5 text-sm text-[#16333F] font-semibold outline-none focus:border-[#16333F] transition-colors" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 mb-1">Nueva Contraseña</label>
                <input type="password" placeholder="••••••••" value={formPasswords.nueva} onChange={e => setFormPasswords({...formPasswords, nueva: e.target.value})} className="w-full bg-transparent border-b border-gray-200 py-1.5 text-sm text-[#16333F] font-semibold outline-none focus:border-[#16333F] transition-colors" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 mb-1">Confirmar Nueva Contraseña</label>
                <input type="password" placeholder="••••••••" value={formPasswords.confirmar} onChange={e => setFormPasswords({...formPasswords, confirmar: e.target.value})} className="w-full bg-transparent border-b border-gray-200 py-1.5 text-sm text-[#16333F] font-semibold outline-none focus:border-[#16333F] transition-colors" />
              </div>
            </div>
          </div>

        </div>

        {/* --- PANEL DERECHO (Notificaciones y Guardar) --- */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          <div className="bg-gradient-to-b from-[#F2F8F7] to-white rounded-3xl p-8 shadow-[0_8px_30px_-15px_rgba(0,0,0,0.06)] border border-gray-50 flex-1">
            <h3 className="flex items-center gap-2 text-[#16333F] font-bold text-sm mb-8">
              <BellIcon /> Preferencias de Notificación
            </h3>

            <div className="space-y-8">
              {/* Opción 1 */}
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h4 className="text-[#16333F] font-bold text-sm mb-1">Alertas de Caída Inmediatas</h4>
                  <p className="text-[11px] text-gray-500 leading-relaxed pr-4">Recibir SMS y notificaciones push al instante en caso de detección de caída.</p>
                </div>
                <Toggle isOn={formPreferencias.alertasInmediatas} onClick={() => handleCambiarPreferencia('alertasInmediatas')} />
              </div>

              {/* Opción 2 */}
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h4 className="text-[#16333F] font-bold text-sm mb-1">Resumen Diario de Actividad</h4>
                  <p className="text-[11px] text-gray-500 leading-relaxed pr-4">Recibir un correo electrónico diario con el resumen de movimientos y estado.</p>
                </div>
                <Toggle isOn={formPreferencias.resumenDiario} onClick={() => handleCambiarPreferencia('resumenDiario')} />
              </div>

              {/* Opción 3 */}
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h4 className="text-[#16333F] font-bold text-sm mb-1">Actualizaciones del Sistema</h4>
                  <p className="text-[11px] text-gray-500 leading-relaxed pr-4">Notificaciones sobre nuevas funciones y mantenimiento de la plataforma.</p>
                </div>
                <Toggle isOn={formPreferencias.actualizacionesSistema} onClick={() => handleCambiarPreferencia('actualizacionesSistema')} />
              </div>
            </div>
          </div>

          {/* Botones de Acción Globales */}
          <div className="flex gap-4 justify-end">
            <button className="px-6 py-3 border border-gray-300 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors bg-white">
              Cancelar
            </button>
            <button 
              onClick={handlers.handleGuardarCambios}
              className="px-6 py-3 bg-[#3A5664] hover:bg-[#16333F] text-white rounded-xl text-sm font-bold flex items-center gap-2 transition-colors shadow-md"
            >
              <SaveIcon /> Guardar Cambios
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
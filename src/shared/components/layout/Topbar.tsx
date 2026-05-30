/*Íconos
const BellIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>;
const SettingsIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/></svg>;
*/const CheckIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>;

export default function Topbar() {
  // VARIABLES DE ESTADO (Listas para aislarse en un Hook/Context luego)
  const user = {
    name: 'María',
    role: 'Cuidador Principal'
  };

  const systemStatus = {
    isSafe: true, // Si cambia a false, el color del badge debería cambiar a rojo/naranja
    message: 'Todo está tranquilo'
  };

  return (
    <header className="w-full px-12 py-8 flex justify-between items-center bg-[#FCF9F0]">
      {/* Saludo */}
      <div>
        <h2 className="text-xl font-medium text-[#16333F]">
          Hola, <span className="font-bold">{user.name}</span>
        </h2>
      </div>

      {/* Controles y Estado */}
      <div className="flex items-center gap-6">

        {/* Badge de Estado del Sistema */}
        <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold shadow-sm transition-colors
          ${systemStatus.isSafe
            ? 'bg-[#E0F2E9] text-[#2E7D32]' // Verde (Seguro)
            : 'bg-[#FFEBEE] text-[#C62828]' // Rojo (Alerta)
          }`}
        >
          {systemStatus.isSafe && <CheckIcon />}
          {systemStatus.message}
        </div>

        {/* Acciones 
        <div className="flex items-center gap-4 text-gray-500">
          <button className="hover:text-[#16333F] transition-colors relative">
            <BellIcon />
            {/* Punto rojo indicador de nueva notificación (opcional) 
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-[#FCF9F0]"></span>
          </button>
          
          <button className="hover:text-[#16333F] transition-colors">
            <SettingsIcon />
          </button>
        </div>*/}

      </div>
    </header>
  );
}
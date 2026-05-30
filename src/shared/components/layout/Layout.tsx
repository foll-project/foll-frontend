import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { Outlet } from 'react-router-dom';
// Asegúrate de tener estos placeholders creados en las rutas correctas


export default function Layout() {
  return (
    // 'w-screen h-screen' garantiza que ocupe todo el viewport
    <div className="flex w-screen h-screen bg-[#FCF9F0] font-sans text-[#16333F] overflow-hidden">
      {/* Sidebar - Ocupa su ancho y todo el alto */}
      <Sidebar />
      
      {/* Contenedor Derecho (Topbar + Main Content) - Ocupa el resto del ancho y alto */}
      <div className="flex flex-col flex-1 h-full overflow-hidden">
        {/* Topbar - Ocupa su alto y todo el ancho disponible */}
        <Topbar />
        
        {/* Contenido Principal - Ocupa el resto del alto y ancho disponible, con scroll si es necesario */}
        <main className="flex-1 overflow-y-auto p-12 bg-white rounded-tl-3xl shadow-[inset_10px_-10px_20px_-10px_rgba(0,0,0,0.05)]">
          {/* Aquí se inyectarán las vistas de tus dominios */}
          <Outlet /> 
        </main>
      </div>
    </div>
  );
}
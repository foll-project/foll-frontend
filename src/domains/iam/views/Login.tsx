import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
// IMPORTAMOS TU LOGO REAL
import logo from '../../../assets/logo.svg';

export default function Login() {
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login({ email, password }); 
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e8f5e9] via-[#f1f8e9] to-[#e0f2f1] flex items-center justify-center p-4 font-sans">
      <div className="bg-[#FCF9F0] rounded-xl shadow-2xl flex w-full max-w-[900px] overflow-hidden min-h-[500px]">
        
        {/* ================= PANEL IZQUIERDO ================= */}
        <div className="w-1/2 bg-[#16333F] relative flex flex-col justify-center items-center text-white p-10 text-center overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center opacity-80 pointer-events-none">
             <div className="w-64 h-64 bg-gradient-to-tr from-gray-700 to-gray-500 rounded-full blur-3xl opacity-30"></div>
          </div>

          <div className="relative z-10 flex flex-col items-center">
            {/* USAMOS TU LOGO REAL AQUÍ */}
            <div className="w-20 h-20 rounded-full border border-gray-400/50 flex items-center justify-center mb-5 bg-white/5 backdrop-blur-sm shadow-xl p-4">
               <img src={logo} alt="Foll Logo" className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]" />
            </div>
            <h1 className="text-4xl font-bold mb-3 tracking-wide drop-shadow-md">Foll</h1>
            <p className="text-xs font-light text-gray-300 max-w-[200px] leading-relaxed">
              Vigilancia Tranquila. Cuidado constante con tecnología empática.
            </p>
          </div>
        </div>
        
        {/* ================= PANEL DERECHO ================= */}
        <div className="w-1/2 px-12 py-10 flex flex-col bg-[#FCF9F0]">
          {/* ... (El resto del código del panel derecho se mantiene igual) */}
          <div className="flex border-b border-gray-300 mb-8 w-3/4 mx-auto text-sm">
            <button className="flex-1 pb-2 text-center font-semibold text-[#16333F] border-b-2 border-[#16333F]">
              Iniciar Sesión
            </button>
            <Link to="/register" className="flex-1 pb-2 text-center font-medium text-gray-400 hover:text-gray-600 transition-colors">
              Crear Cuenta
            </Link>
          </div>

          <div className="flex-1 flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-[#16333F] mb-1">Bienvenido de nuevo</h2>
              <p className="text-xs text-gray-500">Ingresa tus datos para continuar.</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5 flex-1">
              <div>
                <label className="block text-xs font-bold text-[#16333F] mb-1.5 ml-1">Correo Electrónico</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                      <path d="M22 6l-10 7L2 6"></path>
                    </svg>
                  </div>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ejemplo@correo.com" className="w-full pl-10 pr-4 py-2.5 bg-[#F9F7F1] border border-gray-200 rounded-lg text-sm text-gray-700 outline-none focus:border-[#16333F] focus:ring-1 focus:ring-[#16333F] shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] transition-all" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#16333F] mb-1.5 ml-1">Contraseña</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0110 0v4"></path></svg>
                  </div>
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full pl-10 pr-4 py-2.5 bg-[#F9F7F1] border border-gray-200 rounded-lg text-sm text-gray-700 outline-none focus:border-[#16333F] focus:ring-1 focus:ring-[#16333F] shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] transition-all" />
                </div>
                <div className="flex justify-end mt-2"><a href="#" className="text-[10px] font-bold text-[#4A697A] hover:text-[#16333F] hover:underline">¿Olvidaste tu contraseña?</a></div>
              </div>

              <div className="pt-4">
                <button type="submit" disabled={isLoading} className="w-full bg-[#3D5665] hover:bg-[#16333F] text-white rounded-lg py-3 flex justify-center items-center gap-2 font-medium text-sm transition-colors shadow-md disabled:opacity-70">
                  {isLoading ? 'Ingresando...' : 'Ingresar'}
                  {!isLoading && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
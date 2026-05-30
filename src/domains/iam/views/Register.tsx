import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Input } from '../../../shared/components/inputs/Input';
import { Button } from '../../../shared/components/buttons/Button';
// IMPORTAMOS TU LOGO REAL
import logo from '../../../assets/logo.svg';

// Íconos SVG nativos
const UserIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const MailIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><path d="M22 6l-10 7L2 6"/></svg>;
const PhoneIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.9.339 1.84.573 2.81.7A2 2 0 0122 16.92z"/></svg>;
const DniIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="16" rx="2" ry="2"/><circle cx="9" cy="10" r="2"/><path d="M15 8h2M15 12h2M7 16h5"/></svg>;
const LockIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>;
const ArrowRightIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14m-7-7l7 7-7 7"/></svg>;

export default function Register() {
  const [formData, setFormData] = useState({
    nombres: '', apellidos: '', correo: '', celular: '', dni: '', contraseña: '', confirmarContraseña: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    console.log('Registrando...', formData);
    setTimeout(() => setIsLoading(false), 2000); 
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
            {/* USAMOS TU LOGO REAL AQUÍ TAMBIÉN */}
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
          
          <div className="flex border-b border-gray-300 mb-8 w-3/4 mx-auto text-sm">
            <Link to="/login" className="flex-1 pb-2 text-center font-medium text-gray-400 hover:text-gray-600 transition-colors">
              Iniciar Sesión
            </Link>
            <button className="flex-1 pb-2 text-center font-semibold text-[#16333F] border-b-2 border-[#16333F]">
              Crear Cuenta
            </button>
          </div>

          <div className="flex-1 flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500 h-full overflow-hidden">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-[#16333F] mb-1">Bienvenido</h2>
              <p className="text-xs text-gray-500">Ingresa tus datos para crear tu cuenta.</p>
            </div>

            <form onSubmit={handleRegister} className="space-y-4.5 flex-1 overflow-y-auto pr-2">
              <div className="grid grid-cols-2 gap-4">
                <Input label="Nombres" name="nombres" value={formData.nombres} onChange={handleChange} placeholder="Ej. Juan" icon={<UserIcon />} />
                <Input label="Apellidos" name="apellidos" value={formData.apellidos} onChange={handleChange} placeholder="Ej. Pérez" icon={<UserIcon />} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Correo" name="correo" type="email" value={formData.correo} onChange={handleChange} placeholder="juan@foll.com" icon={<MailIcon />} />
                <Input label="Celular" name="celular" type="tel" value={formData.celular} onChange={handleChange} placeholder="912 345 678" icon={<PhoneIcon />} />
              </div>
              <Input label="DNI" name="dni" value={formData.dni} onChange={handleChange} placeholder="Ej. 12345678" icon={<DniIcon />} />
              <div className="grid grid-cols-2 gap-4">
                <Input label="Contraseña" name="contraseña" type="password" value={formData.contraseña} onChange={handleChange} placeholder="••••••••" icon={<LockIcon />} />
                <Input label="Confirmar Contraseña" name="confirmarContraseña" type="password" value={formData.confirmarContraseña} onChange={handleChange} placeholder="••••••••" icon={<LockIcon />} />
              </div>
              <div className="pt-5 pb-2">
                <Button type="submit" isLoading={isLoading} icon={<ArrowRightIcon />}>
                  Crear Cuenta
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
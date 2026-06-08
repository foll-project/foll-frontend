import { NavLink, useNavigate } from 'react-router-dom';
import { useNotifications } from '../../../domains/notifications/hooks/useNotifications';
import { useInvitations } from '../../../domains/invitations/hooks/useInvitations';
import logo from '../../../assets/logo.svg';

const HomeIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><path d="M9 22V12h6v10"/></svg>;
const WalkingIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="4" r="2"/><path d="M12 8v5"/><path d="M9 19l2-6 2 6"/><path d="M12 13h4l-2-5"/><path d="M16 8h-2"/><path d="M18 21v-8"/></svg>;
const HistoryIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>;
const InviteIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 6l-10 7L2 6"/></svg>;
const UserIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const LogoutIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/></svg>;

export default function Sidebar() {
  const navigate = useNavigate();
  const { logoutNotifications } = useNotifications();
  const { pendingReceivedCount, logoutInvitations } = useInvitations();

  const handleLogout = async () => {
    await Promise.all([logoutNotifications(), logoutInvitations()]);
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    navigate('/login');
  };

  const navItems = [
    { path: '/', label: 'Inicio', icon: <HomeIcon />, badge: 0 },
    { path: '/abuelitos', label: 'Mis Abuelitos', icon: <WalkingIcon />, badge: 0 },
    { path: '/historial', label: 'Registro de Caídas', icon: <HistoryIcon />, badge: 0 },
    { path: '/invitaciones', label: 'Invitaciones', icon: <InviteIcon />, badge: pendingReceivedCount },
    { path: '/perfil', label: 'Mi Perfil', icon: <UserIcon />, badge: 0 },
  ];

  return (
    <aside className="w-[260px] bg-[#16333F] h-full flex flex-col text-white transition-all duration-300 z-20 shadow-2xl">
      <div className="p-8 pb-10 flex items-center gap-4">
        <div className="w-10 h-10 flex items-center justify-center bg-white/5 rounded-xl border border-white/10 shadow-inner">
          <img src={logo} alt="Foll Logo" className="w-6 h-6 object-contain drop-shadow-md" />
        </div>
        <div>
          <h1 className="text-2xl font-bold leading-none tracking-wide">Foll</h1>
          <p className="text-[10px] text-gray-400 font-light mt-1">Vigilancia Tranquila</p>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-white/10 text-white shadow-inner'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`
            }
          >
            {item.icon}
            <span className="flex-1">{item.label}</span>
            {item.badge > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500 text-white">
                {item.badge}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-6">
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-4 px-4 py-3 w-full text-sm font-medium text-gray-400 hover:text-white transition-colors group"
        >
          <span className="group-hover:-translate-x-1 transition-transform">
            <LogoutIcon />
          </span>
          Cerrar Sesión
        </button>
      </div>
    </aside>
  );
}

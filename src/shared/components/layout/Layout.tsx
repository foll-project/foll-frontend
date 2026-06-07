import { Outlet } from 'react-router-dom';
import { NotificationsProvider } from '../../../domains/notifications/context/NotificationsProvider';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function Layout() {
  return (
    <NotificationsProvider>
      <div className="flex w-screen h-screen bg-[#FCF9F0] font-sans text-[#16333F] overflow-hidden">
        <Sidebar />

        <div className="flex flex-col flex-1 h-full overflow-hidden">
          <Topbar />

          <main className="flex-1 overflow-y-auto p-12 bg-white rounded-tl-3xl shadow-[inset_10px_-10px_20px_-10px_rgba(0,0,0,0.05)]">
            <Outlet />
          </main>
        </div>
      </div>
    </NotificationsProvider>
  );
}

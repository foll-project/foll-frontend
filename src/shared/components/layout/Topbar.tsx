import { useState } from 'react';
import { useNotifications } from '../../../domains/notifications/hooks/useNotifications';
import type { Notification } from '../../../domains/notifications/models/notification.model';
import { isCriticalNotification } from '../../../domains/notifications/models/notification.model';
import { getStoredUser } from '../../api/session';

const BellIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>;
const CheckIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>;
const AlertIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><path d="M12 9v4" /><path d="M12 17h.01" /></svg>;

const formatNotificationTime = (createdAt: string) => {
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return date.toLocaleString('es-PE', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const NotificationItem = ({
  notification,
  onRead,
  onAcknowledge,
}: {
  notification: Notification;
  onRead: (id: number) => Promise<void>;
  onAcknowledge: (id: number) => Promise<void>;
}) => {
  const isUnread = !notification.readAt;
  const isCritical = isCriticalNotification(notification);

  return (
    <button
      type="button"
      onClick={() => onRead(notification.notificationLogId)}
      className={`w-full text-left p-4 transition-colors border-b border-gray-100 last:border-b-0 ${
        isUnread ? 'bg-[#F9F7F1] hover:bg-[#F3EFE4]' : 'bg-white hover:bg-gray-50'
      }`}
    >
      <div className="flex items-start gap-3">
        <span className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${
          isCritical ? 'bg-[#C62828]' : isUnread ? 'bg-[#DCA646]' : 'bg-gray-300'
        }`} />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <p className="text-xs font-bold text-[#16333F] leading-snug">
              {notification.title}
            </p>
            <span className="text-[10px] text-gray-400 flex-shrink-0">
              {formatNotificationTime(notification.createdAt)}
            </span>
          </div>
          <p className="text-[11px] text-gray-500 leading-relaxed mt-1 line-clamp-2">
            {notification.body}
          </p>
          <div className="flex items-center justify-between gap-2 mt-3">
            <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${
              isCritical ? 'bg-[#FFEBEE] text-[#C62828]' : 'bg-[#E0F2E9] text-[#2E7D32]'
            }`}>
              {notification.notificationType}
            </span>
            {isCritical && !notification.acknowledgedAt && (
              <span
                role="button"
                tabIndex={0}
                onClick={(event) => {
                  event.stopPropagation();
                  void onAcknowledge(notification.notificationLogId);
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    event.stopPropagation();
                    void onAcknowledge(notification.notificationLogId);
                  }
                }}
                className="text-[10px] font-bold text-[#16333F] border border-[#16333F] px-2 py-1 rounded-lg hover:bg-[#16333F] hover:text-white transition-colors"
              >
                Confirmar
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
};

export default function Topbar() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const {
    notifications,
    unreadCount,
    activeCriticalCount,
    activeCriticalAlert,
    markAsRead,
    acknowledge,
  } = useNotifications();

  const storedUser = getStoredUser();
  const user = {
    name: storedUser?.firstName?.trim() || 'Cuidador',
    role: 'Cuidador Principal',
  };

  const hasActiveCriticalAlert = activeCriticalCount > 0;
  const systemStatus = {
    isSafe: !hasActiveCriticalAlert,
    message: hasActiveCriticalAlert
      ? activeCriticalAlert?.notification.title || 'Alerta pendiente'
      : 'Todo está tranquilo',
  };

  const latestNotifications = notifications.slice(0, 6);

  return (
    <header className="w-full px-12 py-8 flex justify-between items-center bg-[#FCF9F0]">
      <div>
        <h2 className="text-xl font-medium text-[#16333F]">
          Hola, <span className="font-bold">{user.name}</span>
        </h2>
      </div>

      <div className="flex items-center gap-6">
        <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold shadow-sm transition-colors max-w-[320px]
          ${systemStatus.isSafe
            ? 'bg-[#E0F2E9] text-[#2E7D32]'
            : 'bg-[#FFEBEE] text-[#C62828]'
          }`}
        >
          {systemStatus.isSafe ? <CheckIcon /> : <AlertIcon />}
          <span className="truncate">{systemStatus.message}</span>
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => setIsDropdownOpen((current) => !current)}
            className="hover:text-[#16333F] transition-colors relative text-gray-500 bg-white border border-gray-100 rounded-xl w-10 h-10 flex items-center justify-center shadow-sm"
            title="Notificaciones"
          >
            <BellIcon />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 bg-[#C62828] text-white text-[10px] font-bold rounded-full border-2 border-[#FCF9F0] flex items-center justify-center">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 top-12 w-[360px] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[#16333F]">Notificaciones</h3>
                  <p className="text-[10px] text-gray-400">
                    {unreadCount > 0 ? `${unreadCount} sin leer` : 'Sin pendientes'}
                  </p>
                </div>
                {activeCriticalCount > 0 && (
                  <span className="bg-[#FFEBEE] text-[#C62828] text-[10px] font-bold px-2 py-1 rounded-full">
                    {activeCriticalCount} críticas
                  </span>
                )}
              </div>

              <div className="max-h-[420px] overflow-y-auto">
                {latestNotifications.length > 0 ? (
                  latestNotifications.map((notification) => (
                    <NotificationItem
                      key={notification.notificationLogId}
                      notification={notification}
                      onRead={markAsRead}
                      onAcknowledge={acknowledge}
                    />
                  ))
                ) : (
                  <div className="p-8 text-center">
                    <p className="text-sm font-semibold text-[#16333F]">No hay notificaciones</p>
                    <p className="text-xs text-gray-400 mt-1">Las alertas aparecerán aquí.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

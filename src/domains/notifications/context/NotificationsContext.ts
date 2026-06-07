import { createContext } from 'react';
import type { Notification } from '../models/notification.model';
import type { ActiveCriticalAlert } from '../models/notification.model';

export interface NotificationsContextValue {
  notifications: Notification[];
  unreadCount: number;
  criticalUnreadCount: number;
  activeCriticalCount: number;
  latestCriticalUnread: Notification | null;
  activeCriticalAlert: ActiveCriticalAlert | null;
  isLoading: boolean;
  isConnected: boolean;
  markAsRead: (id: number) => Promise<void>;
  acknowledge: (id: number) => Promise<void>;
  refreshNotifications: () => Promise<void>;
  logoutNotifications: () => Promise<void>;
}

export const NotificationsContext = createContext<NotificationsContextValue | null>(null);

export interface Notification {
  notificationLogId: number;
  userId: number;
  notificationType: string;
  notificationChannel: string;
  notificationStatus: string;
  title: string;
  body: string;
  dataJson?: string | null;
  providerMessageId?: string | null;
  errorMessage?: string | null;
  patientId?: number | null;
  deviceId?: number | null;
  sentAt?: string | null;
  readAt?: string | null;
  acknowledgedAt?: string | null;
  createdAt: string;
  updatedAt?: string | null;
}

export type NotificationListResponse = Notification[] | { data?: Notification[]; notifications?: Notification[] };

export const CRITICAL_NOTIFICATION_TYPES = [
  'FallDetected',
  'DeviceDisconnected',
  'LowBattery',
] as const;

type ActiveAlertType = 'FallDetected' | 'DeviceDisconnected' | 'LowBattery';

export interface ActiveCriticalAlert {
  type: ActiveAlertType;
  notification: Notification;
}

export const isCriticalNotification = (notification: Notification): boolean => {
  return CRITICAL_NOTIFICATION_TYPES.includes(
    notification.notificationType as (typeof CRITICAL_NOTIFICATION_TYPES)[number],
  );
};

const getNotificationOrderValue = (notification: Notification): number => {
  const createdAtTime = new Date(notification.createdAt).getTime();
  return Number.isNaN(createdAtTime) ? notification.notificationLogId : createdAtTime;
};

const sortByNewest = (notifications: Notification[]): Notification[] => {
  return [...notifications].sort((a, b) => {
    const byDate = getNotificationOrderValue(b) - getNotificationOrderValue(a);
    return byDate !== 0 ? byDate : b.notificationLogId - a.notificationLogId;
  });
};

const getDeviceAlertKey = (notification: Notification): string => {
  if (notification.deviceId != null) {
    return `device:${notification.deviceId}`;
  }

  if (notification.patientId != null) {
    return `patient:${notification.patientId}`;
  }

  return `notification:${notification.notificationLogId}`;
};

export const getActiveCriticalAlerts = (notifications: Notification[]): ActiveCriticalAlert[] => {
  const orderedNotifications = sortByNewest(notifications);
  const fallAlerts = orderedNotifications
    .filter((notification) => notification.notificationType === 'FallDetected' && !notification.acknowledgedAt)
    .map((notification) => ({ type: 'FallDetected' as const, notification }));

  const latestConnectivityByDevice = new Map<string, Notification>();
  const latestBatteryByDevice = new Map<string, Notification>();

  orderedNotifications.forEach((notification) => {
    if (notification.notificationType === 'DeviceDisconnected' || notification.notificationType === 'DeviceReconnected') {
      const key = getDeviceAlertKey(notification);
      if (!latestConnectivityByDevice.has(key)) {
        latestConnectivityByDevice.set(key, notification);
      }
    }

    if (notification.notificationType === 'LowBattery' || notification.notificationType === 'BatteryRecovered') {
      const key = getDeviceAlertKey(notification);
      if (!latestBatteryByDevice.has(key)) {
        latestBatteryByDevice.set(key, notification);
      }
    }
  });

  const disconnectedAlerts = Array.from(latestConnectivityByDevice.values())
    .filter((notification) => notification.notificationType === 'DeviceDisconnected')
    .map((notification) => ({ type: 'DeviceDisconnected' as const, notification }));

  const lowBatteryAlerts = Array.from(latestBatteryByDevice.values())
    .filter((notification) => notification.notificationType === 'LowBattery')
    .map((notification) => ({ type: 'LowBattery' as const, notification }));

  return [...fallAlerts, ...disconnectedAlerts, ...lowBatteryAlerts];
};

export const getHighestPriorityActiveCriticalAlert = (
  notifications: Notification[],
): ActiveCriticalAlert | null => {
  return getActiveCriticalAlerts(notifications)[0] || null;
};

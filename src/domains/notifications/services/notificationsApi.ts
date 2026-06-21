import { apiClient } from '../../../shared/api/client';
import { API_CONFIG } from '../../../shared/api/config';
import type { Notification, NotificationListResponse } from '../models/notification.model';

const unwrapNotifications = (response: NotificationListResponse): Notification[] => {
  if (Array.isArray(response)) {
    return response;
  }

  return response.notifications || response.data || [];
};

export const notificationsApi = {
  async getNotifications(): Promise<Notification[]> {
    const response = await apiClient.get<NotificationListResponse>(API_CONFIG.NOTIFICATIONS.LIST);
    return unwrapNotifications(response);
  },

  getNotification(id: number): Promise<Notification> {
    return apiClient.get<Notification>(API_CONFIG.NOTIFICATIONS.GET_ONE(id));
  },

  getDeliveryStatus<T = unknown>(id: number): Promise<T> {
    return apiClient.get<T>(API_CONFIG.NOTIFICATIONS.DELIVERY_STATUS(id));
  },

  markAsRead(id: number): Promise<void> {
    return apiClient.post<void>(API_CONFIG.NOTIFICATIONS.MARK_AS_READ(id));
  },

  acknowledge(id: number): Promise<void> {
    return apiClient.post<void>(API_CONFIG.NOTIFICATIONS.ACKNOWLEDGE(id));
  },
};

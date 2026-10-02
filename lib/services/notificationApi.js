"use client"
import api from './apiClient';

const isAuthError = (error) => error?.response?.status === 401;

export const notificationApi = {
  async getNotifications(params = {}) {
    try {
      const response = await api.get('/notifications', { params });
      return response.data;
    } catch (error) {
      if (isAuthError(error)) return { data: [] };
      console.error('Failed to fetch notifications:', error);
      throw error;
    }
  },

  async getUnreadCount() {
    try {
      const response = await api.get('/notifications/unread-count');
      return response.data;
    } catch (error) {
      if (isAuthError(error)) return { data: { count: 0 } };
      console.error('Failed to fetch unread count:', error);
      throw error;
    }
  },

  async markAsRead(id) {
    const response = await api.post(`/notifications/${id}/read`);
    return response.data;
  },

  async markAllAsRead() {
    const response = await api.post('/notifications/mark-all-read');
    return response.data;
  },

  async deleteNotification(id) {
    const response = await api.delete(`/notifications/${id}`);
    return response.data;
  },

  async deleteAllRead() {
    const response = await api.delete('/notifications/delete-all-read');
    return response.data;
  },

  async getStats() {
    const response = await api.get('/notifications/stats');
    return response.data;
  }
};

export default notificationApi;
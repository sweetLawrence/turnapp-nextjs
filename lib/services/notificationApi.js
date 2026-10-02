import api from './apiClient';

export const notificationApi = {
  async getNotifications(params = {}) {
    const response = await api.get('/notifications', { params });
    return response.data;
  },

  async getUnreadCount() {
    const response = await api.get('/notifications/unread-count');
    return response.data;
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
import api from './apiClient';

export const walletApi = {
  async getWallet() {
    const response = await api.get('/dashboard/wallet');
    return response.data;
  },

  async getStatistics() {
    const response = await api.get('/dashboard/wallet/statistics');
    return response.data;
  },

  async getTransactions(params = {}) {
    const response = await api.get('/dashboard/wallet/transactions', { params });
    return response.data;
  },

  async getWithdrawals(params = {}) {
    const response = await api.get('/dashboard/wallet/withdrawals', { params });
    return response.data;
  },

  async getAnalytics() {
    const response = await api.get('/dashboard/wallet/analytics');
    return response.data;
  },

  async refreshBalances() {
    const response = await api.post('/dashboard/wallet/refresh');
    return response.data;
  },

  async requestWithdrawal(data) {
    const response = await api.post('/dashboard/wallet/withdraw', data);
    return response.data;
  },

  async getPaymentMethods() {
    const response = await api.get('/dashboard/wallet/payment-methods');
    return response.data;
  },

  async addPaymentMethod(data) {
    const response = await api.post('/dashboard/wallet/payment-methods', data);
    return response.data;
  },

  async updatePaymentMethod(id, data) {
    const response = await api.put(`/dashboard/wallet/payment-methods/${id}`, data);
    return response.data;
  },

  async deletePaymentMethod(id) {
    const response = await api.delete(`/dashboard/wallet/payment-methods/${id}`);
    return response.data;
  },

  async getEvents() {
    const response = await api.get('/dashboard/wallet/events');
    return response.data;
  },

  async getNotificationPreferences() {
    const response = await api.get('/dashboard/settings/notifications');
    return response.data;
  },

  async updateNotificationPreferences(preferences) {
    const response = await api.put('/dashboard/settings/notifications', preferences);
    return response.data;
  },
};

export default walletApi;

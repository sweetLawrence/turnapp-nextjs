import api from './apiClient';

export const orderApi = {
  async getOrders(params = {}) {
    const response = await api.get('/dashboard/orders', { params });
    return response.data;
  },

  async getOrder(id) {
    const response = await api.get(`/dashboard/orders/${id}`);
    return response.data;
  },

  async getStatistics() {
    const response = await api.get('/dashboard/orders/statistics');
    return response.data;
  },
};

export default orderApi;

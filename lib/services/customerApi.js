import api from './apiClient';

export const customerApi = {
  async getCustomers(params = {}) {
    const response = await api.get('/dashboard/customers', { params });
    return response.data;
  },

  async getCustomer(email) {
    const response = await api.get(`/dashboard/customers/${encodeURIComponent(email)}`);
    return response.data;
  },

  async getStatistics() {
    const response = await api.get('/dashboard/customers/statistics');
    return response.data;
  },
};

export default customerApi;

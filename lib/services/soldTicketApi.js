import api from './apiClient';

export const soldTicketApi = {
  async getSoldTickets(params = {}) {
    const response = await api.get('/dashboard/sold-tickets', { params });
    return response.data;
  },

  async getSoldTicket(id) {
    const response = await api.get(`/dashboard/sold-tickets/${id}`);
    return response.data;
  },

  async getStatistics() {
    const response = await api.get('/dashboard/sold-tickets/statistics');
    return response.data;
  },

  async markAsUsed(id) {
    const response = await api.post(`/dashboard/sold-tickets/${id}/mark-used`);
    return response.data;
  },

  async resendEmail(id) {
    const response = await api.post(`/dashboard/sold-tickets/${id}/resend-email`);
    return response.data;
  },
};

export default soldTicketApi;

import api from './apiClient';

export const complimentaryTicketApi = {
  async getComplimentaryTickets(params = {}) {
    const response = await api.get('/dashboard/complimentary-tickets', { params });
    return response.data;
  },

  async getStatistics() {
    const response = await api.get('/dashboard/complimentary-tickets/statistics');
    return response.data;
  },

  async getEvents() {
    const response = await api.get('/dashboard/complimentary-tickets/events');
    return response.data;
  },

  async sendComplimentaryTickets(data) {
    const response = await api.post('/dashboard/complimentary-tickets', data);
    return response.data;
  },

  async resendComplimentaryTicket(id) {
    const response = await api.post(`/dashboard/complimentary-tickets/${id}/resend`);
    return response.data;
  },
};

export default complimentaryTicketApi;

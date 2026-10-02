import api from './apiClient';

export const campaignApi = {
  async getCampaigns(params = {}) {
    const response = await api.get('/dashboard/campaigns', { params });
    return response.data;
  },

  async createCampaign(data) {
    const response = await api.post('/dashboard/campaigns', data);
    return response.data;
  },

  async getCampaign(id) {
    const response = await api.get(`/dashboard/campaigns/${id}`);
    return response.data;
  },

  async updateCampaign(id, data) {
    const response = await api.put(`/dashboard/campaigns/${id}`, data);
    return response.data;
  },

  async deleteCampaign(id) {
    const response = await api.delete(`/dashboard/campaigns/${id}`);
    return response.data;
  },

  async getInfluencers() {
    const response = await api.get('/dashboard/influencers');
    return response.data;
  },

  async getEnrollments(campaignId) {
    const response = await api.get(`/dashboard/campaigns/${campaignId}/enrollments`);
    return response.data;
  },

  async addInfluencer(campaignId, data) {
    const response = await api.post(`/dashboard/campaigns/${campaignId}/influencers`, data);
    return response.data;
  },

  async removeInfluencer(campaignId, influencerId) {
    const response = await api.delete(`/dashboard/campaigns/${campaignId}/influencers/${influencerId}`);
    return response.data;
  },

  async getAnalytics(campaignId) {
    const response = await api.get(`/dashboard/campaigns/${campaignId}/analytics`);
    return response.data;
  },
};

export default campaignApi;

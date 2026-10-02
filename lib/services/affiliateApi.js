import api from './apiClient';

export const affiliateApi = {
  // Registration & Status
  async getStatus() {
    const response = await api.get('/affiliate/status');
    return response.data;
  },

  async register(data) {
    const response = await api.post('/affiliate/register', data);
    return response.data;
  },

  // Profile
  async getProfile() {
    const response = await api.get('/affiliate/profile');
    return response.data;
  },

  async updateProfile(data) {
    const response = await api.put('/affiliate/profile', data);
    return response.data;
  },

  // Dashboard
  async getDashboard() {
    const response = await api.get('/affiliate/dashboard');
    return response.data;
  },

  // Earnings
  async getEarnings(params = {}) {
    const response = await api.get('/affiliate/earnings', { params });
    return response.data;
  },

  // Browse campaigns
  async getCampaigns(params = {}) {
    const response = await api.get('/affiliate/campaigns', { params });
    return response.data;
  },

  async getCampaign(id) {
    const response = await api.get(`/affiliate/campaigns/${id}`);
    return response.data;
  },

  async enrollInCampaign(id) {
    const response = await api.post(`/affiliate/campaigns/${id}/enroll`);
    return response.data;
  },

  async getReferralLink(campaignId) {
    const response = await api.get(`/affiliate/campaigns/${campaignId}/referral-link`);
    return response.data;
  },

  async getMyCampaigns() {
    const response = await api.get('/affiliate/my-campaigns');
    return response.data;
  },

  // Withdrawals
  async getWithdrawals(params = {}) {
    const response = await api.get('/affiliate/withdrawals', { params });
    return response.data;
  },

  async requestWithdrawal(data) {
    const response = await api.post('/affiliate/withdrawals', data);
    return response.data;
  },

  // Organizer: enrollment management
  async getEnrollments(campaignId, params = {}) {
    const response = await api.get(`/dashboard/affiliate-management/campaigns/${campaignId}/enrollments`, { params });
    return response.data;
  },

  async approveEnrollment(enrollmentId) {
    const response = await api.post(`/dashboard/affiliate-management/enrollments/${enrollmentId}/approve`);
    return response.data;
  },

  async rejectEnrollment(enrollmentId, reason) {
    const response = await api.post(`/dashboard/affiliate-management/enrollments/${enrollmentId}/reject`, { reason });
    return response.data;
  },

  async setCustomCommission(enrollmentId, data) {
    const response = await api.put(`/dashboard/affiliate-management/enrollments/${enrollmentId}/commission`, data);
    return response.data;
  },

  // Organizer: affiliate withdrawals
  async getOrganizerWithdrawals(params = {}) {
    const response = await api.get('/dashboard/affiliate-management/withdrawals', { params });
    return response.data;
  },

  async approveWithdrawal(withdrawalId) {
    const response = await api.post(`/dashboard/affiliate-management/withdrawals/${withdrawalId}/approve`);
    return response.data;
  },

  async rejectWithdrawal(withdrawalId, reason) {
    const response = await api.post(`/dashboard/affiliate-management/withdrawals/${withdrawalId}/reject`, { reason });
    return response.data;
  },
};

export default affiliateApi;

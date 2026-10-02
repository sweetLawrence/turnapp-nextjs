import api from './apiClient';

export const promoCodeApi = {
  /**
   * Get all promo codes
   */
  async getPromoCodes(params = {}) {
    const response = await api.get('/dashboard/promo-codes', { params });
    return response.data;
  },

  /**
   * Create a new promo code
   */
  async createPromoCode(data) {
    const response = await api.post('/dashboard/promo-codes', data);
    return response.data;
  },

  /**
   * Get a single promo code
   */
  async getPromoCode(id) {
    const response = await api.get(`/dashboard/promo-codes/${id}`);
    return response.data;
  },

  /**
   * Update a promo code
   */
  async updatePromoCode(id, data) {
    const response = await api.put(`/dashboard/promo-codes/${id}`, data);
    return response.data;
  },

  /**
   * Delete a promo code
   */
  async deletePromoCode(id) {
    const response = await api.delete(`/dashboard/promo-codes/${id}`);
    return response.data;
  },

  /**
   * Toggle promo code status (activate/deactivate)
   */
  async togglePromoCodeStatus(id) {
    const response = await api.patch(`/dashboard/promo-codes/${id}/toggle-status`);
    return response.data;
  },

  /**
   * Get promo code analytics
   */
  async getPromoCodeAnalytics(id) {
    const response = await api.get(`/dashboard/promo-codes/${id}/analytics`);
    return response.data;
  },
};

export default promoCodeApi;

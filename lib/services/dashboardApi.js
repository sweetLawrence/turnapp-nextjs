import api from './apiClient';

export const dashboardApi = {
  /**
   * Get dashboard statistics
   * @param {Object} params - Query parameters (days, start_date, end_date)
   */
  async getStatistics(params = {}) {
    const response = await api.get('/dashboard/statistics', { params });
    return response.data;
  },

  /**
   * Get category breakdown
   * @param {Object} params - Query parameters (days, start_date, end_date)
   */
  async getCategoryBreakdown(params = {}) {
    const response = await api.get('/dashboard/categories', { params });
    return response.data;
  },

  /**
   * Get sales trend
   * @param {Object} params - Query parameters (days, start_date, end_date)
   */
  async getSalesTrend(params = {}) {
    const response = await api.get('/dashboard/sales-trend', { params });
    return response.data;
  },

  /**
   * Get top events
   * @param {Object} params - Query parameters (days, start_date, end_date)
   */
  async getTopEvents(params = {}) {
    const response = await api.get('/dashboard/top-events', { params });
    return response.data;
  },

  /**
   * Get current/upcoming event with analytics
   * @param {Object} params - Query parameters (days, start_date, end_date)
   */
  async getCurrentEvent(params = {}) {
    const response = await api.get('/dashboard/current-event', { params });
    return response.data;
  },
};

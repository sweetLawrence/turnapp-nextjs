import { createApiClient } from './apiClient';
// Afnog@#123..
// Preserved: attaches the auth token (organizers viewing their own analytics),
// but intentionally has NO 401 redirect — view tracking shouldn't log anyone out.
const api = createApiClient({ handle401: false });

export const pageViewApi = {
  /**
   * Record a page view for an event
   * @param {string|number} eventId - The event ID
   * @returns {Promise<Object>} API response
   */
  recordView: async (eventId) => {
    try {
      const response = await api.post(`/events/${eventId}/view`);
      return response.data;
    } catch (error) {
      console.error('Error recording page view:', error);
      // Don't throw error for page views - it's not critical
      return { success: false, error: error.message };
    }
  },

  /**
   * Get page view analytics for an event (for organizers)
   * @param {string|number} eventId - The event ID
   * @returns {Promise<Object>} API response with analytics
   */
  getAnalytics: async (eventId) => {
    try {
      const response = await api.get(`/dashboard/events/${eventId}/analytics`);
      return response.data;
    } catch (error) {
      console.error('Error fetching page view analytics:', error);
      throw error;
    }
  }
};

import { createApiClient } from './apiClient';

// Preserves auth token attachment (organizers viewing their own analytics),
// but intentionally has NO 401 redirect — view tracking shouldn't log anyone out.
const api = createApiClient({ handle401: false });

export const pageViewApi = {
  recordView: async (eventId) => {
    try {
      const response = await api.post(`/events/${eventId}/view`);
      return response.data;
    } catch (error) {
      return { success: false };
    }
  },

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
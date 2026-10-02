import { API_ROOT_URL, createApiClient } from './apiClient';

export { API_ROOT_URL };

// Preserved: public event listings don't attach an auth token, but a 401
// (e.g. from an authenticated sub-request) still triggers the logout redirect.
const api = createApiClient({ withAuth: false });

export const eventApi = {
  /**
   * Get all events with filters
   * @param {Object} params - Query parameters
   * @returns {Promise}
   */
  async getEvents(params = {}) {
    try {
      const response = await api.get('/events', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching events:', error);
      throw error;
    }
  },

  /**
   * Get single event by ID
   * @param {string|number} id - Event ID or UUID
   * @returns {Promise}
   */
  async getEvent(id) {
    try {
      const response = await api.get(`/events/items/${id}`);
      return response.data;
    } catch (error) {
      const status = error.response?.status;
      const isTransient = !error.response || status === 408 || status === 429 || status >= 500;

      if (isTransient) {
        await new Promise(resolve => setTimeout(resolve, 500));
        const response = await api.get(`/events/items/${id}`);
        return response.data;
      }

      console.error('Error fetching event:', error);
      throw error;
    }
  },

  /**
   * Get featured events
   * @param {number} limit - Number of events to return
   * @returns {Promise}
   */
  async getFeaturedEvents(limit = 6) {
    try {
      const response = await api.get('/events/featured', {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching featured events:', error);
      throw error;
    }
  },

  /**
   * Get upcoming events
   * @param {number} limit - Number of events to return
   * @returns {Promise}
   */
  async getUpcomingEvents(limit = 10) {
    try {
      const response = await api.get('/events/upcoming', {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching upcoming events:', error);
      throw error;
    }
  },

  /**
   * Search events
   * @param {string} searchTerm - Search term
   * @param {Object} additionalParams - Additional query parameters
   * @returns {Promise}
   */
  async searchEvents(searchTerm, additionalParams = {}) {
    try {
      const response = await api.get('/events', {
        params: {
          search: searchTerm,
          ...additionalParams
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error searching events:', error);
      throw error;
    }
  },

  /**
   * Get experiences with filters
   * @param {Object} params - Query parameters
   * @returns {Promise}
   */
  async getExperiences(params = {}) {
    try {
      const response = await api.get('/experiences', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching experiences:', error);
      throw error;
    }
  },

  /**
   * Get combined events and experiences (single endpoint)
   * @param {Object} params - Query parameters
   * @returns {Promise}
   */
  async getCombined(params = {}) {
    try {
      const response = await api.get('/events/combined', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching combined data:', error);
      throw error;
    }
  },
};

export default eventApi;

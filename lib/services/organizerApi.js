import { createApiClient } from './apiClient';

// Preserved: this is a public profile lookup, so no auth token is attached,
// but a 401 still triggers the logout redirect (same as the original file).
const api = createApiClient({ withAuth: false });

export const organizerApi = {
  /**
   * Get organizer profile by user ID
   * @param {string|number} userId - User/Organizer ID
   * @returns {Promise}
   */
  async getOrganizerProfile(userId) {
    try {
      // const response = await api.get(`/organizer/${userId}`);
      const response = await api.get(`/organizers/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching organizer profile:', error);
      throw error;
    }
  },
};

export default organizerApi;

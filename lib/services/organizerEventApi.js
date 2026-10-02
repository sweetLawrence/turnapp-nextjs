import api from './apiClient';

export const organizerEventApi = {
  /**
   * Get organizer's events (or all events for admin)
   */
  async getEvents(params = {}) {
    const response = await api.get('/dashboard/events', { params });
    return response.data;
  },

  /**
   * Delete an event
   */
  async deleteEvent(eventId) {
    const response = await api.delete(`/dashboard/events/${eventId}`);
    return response.data;
  },

  /**
   * Update event status
   */
  async updateEventStatus(eventId, status) {
    const response = await api.patch(`/dashboard/events/${eventId}/status`, { status });
    return response.data;
  },

  /**
   * Toggle event featured status (Admin only)
   */
  async toggleFeatured(eventId) {
    const response = await api.patch(`/dashboard/events/${eventId}/toggle-featured`);
    return response.data;
  },

  /**
   * Get event categories
   */
  async getCategories() {
    const response = await api.get('/dashboard/event-categories');
    return response.data;
  },

  /**
   * Create new event
   */
  async createEvent(formData) {
    const response = await api.post('/dashboard/events/create', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Get a single event for editing
   */
  async getEvent(eventId) {
    const response = await api.get(`/dashboard/events/${eventId}`);
    return response.data;
  },

  /**
   * Update an existing event
   */
  async updateEvent(eventId, formData) {
    const response = await api.post(`/dashboard/events/${eventId}/update`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

export default organizerEventApi;

"use client"

import api from './apiClient';

const isBrowser = () => typeof window !== 'undefined';

export const authService = {
  /**
   * Register a new organizer
   */
  async register(data) {
    const response = await api.post('/auth/register', data);
    if (response.data.success && isBrowser()) {
      localStorage.setItem('auth_token', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
    }
    return response.data;
  },

  /**
   * Login user
   */
  async login(email, password) {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.success && isBrowser()) {
      localStorage.setItem('auth_token', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
    }
    return response.data;
  },

  /**
   * Logout user
   */
  async logout() {
    try {
      await api.post('/auth/logout');
    } finally {
      if (isBrowser()) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
      }
    }
  },

  /**
   * Get current authenticated user
   */
  async getCurrentUser() {
    const response = await api.get('/auth/me');
    if (response.data.success && isBrowser()) {
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
    }
    return response.data;
  },

  /**
   * Get stored token
   */
  getToken() {
    if (!isBrowser()) return null;
    return localStorage.getItem('auth_token');
  },

  /**
   * Get stored user
   */
  getUser() {
    if (!isBrowser()) return null;
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return !!this.getToken();
  },

  /**
   * Check if user is admin
   */
  isAdmin() {
    const user = this.getUser();
    return user?.is_admin === true || user?.user_type?.toLowerCase() === 'admin';
  },

  /**
   * Get user role
   */
  getUserRole() {
    const user = this.getUser();
    return user?.user_type?.toLowerCase() || 'organiser';
  },
};
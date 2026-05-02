import { api } from './api.service.js';

/**
 * Authentication Service
 * Handles all authentication-related API calls
 */

const authService = {
  /**
   * Login user
   */
  login: async (username, password) => {
    try {
      const response = await api.post('/api/auth/login', {
        username,
        password
      });

      // Store token and user data
      if (response.success && response.data.token) {
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('currentUser', JSON.stringify(response.data.user));
      }

      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Logout user
   */
  logout: async () => {
    try {
      await api.post('/api/auth/logout');

      // // Clear local storage
      localStorage.removeItem('authToken');
      localStorage.removeItem('currentUser');

      return { success: true };
    } catch (error) {
      // // Even if API call fails, clear local storage
      localStorage.removeItem('authToken');
      localStorage.removeItem('currentUser');
      throw error;
    }
  },

  /**
   * Verify token
   */
  verifyToken: async (token) => {
    try {
      const response = await api.post('/api/auth/verify', { token });
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get current user profile
   */
  getCurrentUser: async () => {
    try {
      const response = await api.get('/api/auth/me');
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: () => {
    const token = localStorage.getItem('authToken');
    return !!token;
  },

  /**
   * Get stored user data
   */
  getStoredUser: () => {
    const userStr = localStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
  }
};

export default authService;

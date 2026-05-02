import { api } from './api.service.js';

/**
 * User Service
 * Handles all user-related API calls
 */

const userService = {
  /**
   * Get all users
   */
  getAll: async (params = {}) => {
    try {
      const response = await api.get('/api/users', { params });
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get user by ID
   */
  getById: async (userId) => {
    try {
      const response = await api.get(`/api/users/${userId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Create user
   */
  create: async (userData) => {
    try {
      const response = await api.post('/api/users', userData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update user
   */
  update: async (userId, userData) => {
    try {
      const response = await api.put(`/api/users/${userId}`, userData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Delete user
   */
  delete: async (userId) => {
    try {
      const response = await api.delete(`/api/users/${userId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get users by role
   */
  getByRole: async (role, params = {}) => {
    try {
      const response = await api.get(`/api/users/role/${role}`, { params });
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get users by hospital
   */
  getByHospital: async (hospitalId, params = {}) => {
    try {
      const response = await api.get(`/api/users/hospital/${hospitalId}`, { params });
      return response;
    } catch (error) {
      throw error;
    }
  }
};

export default userService;

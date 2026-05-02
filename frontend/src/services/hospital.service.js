import { api } from './api.service.js';

/**
 * Hospital Service
 * Handles all hospital-related API calls
 */

const hospitalService = {
  /**
   * Get all hospitals
   */
  getAll: async (params = {}) => {
    try {
      const response = await api.get('/api/hospitals', { params });
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get hospital by ID
   */
  getById: async (hospitalId) => {
    try {
      const response = await api.get(`/api/hospitals/${hospitalId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Create hospital
   */
  create: async (hospitalData) => {
    try {
      const response = await api.post('/api/hospitals', hospitalData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update hospital
   */
  update: async (hospitalId, hospitalData) => {
    try {
      const response = await api.put(`/api/hospitals/${hospitalId}`, hospitalData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Delete hospital
   */
  delete: async (hospitalId) => {
    try {
      const response = await api.delete(`/api/hospitals/${hospitalId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Branch Management
  
  /**
   * Add branch to hospital
   */
  addBranch: async (hospitalId, branchData) => {
    try {
      const response = await api.post(`/api/hospitals/${hospitalId}/branches`, branchData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update branch
   */
  updateBranch: async (hospitalId, branchId, branchData) => {
    try {
      const response = await api.put(`/api/hospitals/${hospitalId}/branches/${branchId}`, branchData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Delete branch
   */
  deleteBranch: async (hospitalId, branchId) => {
    try {
      const response = await api.delete(`/api/hospitals/${hospitalId}/branches/${branchId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get branch by ID
   */
  getBranchById: async (hospitalId, branchId) => {
    try {
      const response = await api.get(`/api/hospitals/${hospitalId}/branches/${branchId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get doctors and departments by branch
   */
  getDoctorsAndDepartments: async (hospitalTrimmedName, branchId) => {
    try {
      const response = await api.get(`/api/hospitals/${hospitalTrimmedName}/branches/${branchId}/data`);
      return response;
    } catch (error) {
      throw error;
    }
  }
};

export default hospitalService;

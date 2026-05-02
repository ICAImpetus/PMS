import { api } from "./api.service.js";

/**
 * Form Service
 * Handles all form-related API calls
 */

const formService = {
  /**
   * Get all filled forms
   */
  getAll: async (params = {}) => {
    try {
      const response = await api.get("/api/filled-forms", { params });
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get form by ID
   */
  getById: async (formId) => {
    try {
      const response = await api.get(`/api/filled-forms/${formId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Create filled form
   */
  create: async (formData) => {
    try {
      const response = await api.post("/api/filled-forms", formData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update filled form
   */
  update: async (formId, formData) => {
    try {
      const response = await api.put(`/api/filled-forms/${formId}`, formData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Delete filled form
   */
  delete: async (formId) => {
    try {
      const response = await api.delete(`/api/filled-forms/${formId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Statistics and Reports

  /**
   * Get form statistics by agent
   */
  getStatsByAgent: async (agentId, dateFilters = {}) => {
    try {
      const params = { agentId, ...dateFilters };
      const response = await api.get('/api/filled-forms/statistics/agent', { params });
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get agent dashboard counts
   */
  getAgentDashboard: async (agentId) => {
    try {
      const response = await api.get(`/api/filled-forms/counts/${agentId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get total leads
   */
  getTotalLeads: async (filters = {}) => {
    try {
      const response = await api.get('/api/filled-forms/leads/total', {
        params: filters,
      });
      return response;
    } catch (error) {
      throw error;
    }
  },
};

export default formService;

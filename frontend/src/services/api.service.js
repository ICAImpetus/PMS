import axios from 'axios';

/**
 * API Service Base Configuration
 * Centralized Axios configuration with interceptors
 */

// Get base URL from environment or use default
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Create axios instance
const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor - Add auth token to all requests
apiClient.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('authToken');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
apiClient.interceptors.response.use(
  (response) => {
    // Return only the data from the response
    return response.data;
  },
  (error) => {
    // Handle different error scenarios
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;

      // Handle 401 Unauthorized - redirect to login
      if (status === 401) {
        // localStorage.removeItem('authToken');
        // localStorage.removeItem('currentUser');
        // window.location.href = '/login';
      }

      // Handle 403 Forbidden
      if (status === 403) {
        console.error('Access denied');
      }

      // Return error data
      return Promise.reject(data || error.response);
    } else if (error.request) {
      // Request made but no response
      console.error('Network error:', error.message);
      return Promise.reject({
        success: false,
        message: 'Network error. Please check your connection.'
      });
    } else {
      // Something else happened
      console.error('Error:', error.message);
      return Promise.reject({
        success: false,
        message: error.message
      });
    }
  }
);

/**
 * Generic API methods
 */
export const api = {
  get: (url, config = {}) => apiClient.get(url, config),
  post: (url, data, config = {}) => apiClient.post(url, data, config),
  put: (url, data, config = {}) => apiClient.put(url, data, config),
  patch: (url, data, config = {}) => apiClient.patch(url, data, config),
  delete: (url, config = {}) => apiClient.delete(url, config)
};

export default apiClient;

import axios from "axios";

const API_BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://pms-m3i6k.onrender.com/" // <-- Corrected URL for the deployed backend
    : "http://localhost:5000/";


const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

apiClient.interceptors.request.use((config) => {
  const storedUser = localStorage.getItem("current_user");
  if (storedUser) {
    try {
      const { token } = JSON.parse(storedUser);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.warn("Unable to parse stored user for auth header:", error);
    }
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // localStorage.removeItem("current_user");
    }
    return Promise.reject(error);
  }
);

export default apiClient;


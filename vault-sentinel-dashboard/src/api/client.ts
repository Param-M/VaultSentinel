import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

export const apiClient = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
});

// Attach session JWT to every request
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("vs_session_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Redirect to login on 401
apiClient.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("vs_session_token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default apiClient;

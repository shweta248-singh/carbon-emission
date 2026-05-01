import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // Required for HttpOnly cookies
});

// Request interceptor: No longer need to manually inject token from localStorage
API.interceptors.request.use((config) => {
  return config;
});

// Response interceptor: Handle unauthorized errors by cleaning up local state
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear user info from local state (but token is in HttpOnly cookie)
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login' && window.location.pathname !== '/') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const api = API;
export default API;


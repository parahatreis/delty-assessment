import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for cookies
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Only redirect if not already on a public page
      const publicPaths = ['/signin', '/signup'];
      const currentPath = window.location.pathname;
      
      if (!publicPaths.includes(currentPath)) {
        window.location.href = '/signin';
      }
    }
    return Promise.reject(error);
  }
);

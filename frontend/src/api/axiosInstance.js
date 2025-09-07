import axios from 'axios';
import { getAccessToken, setAccessToken, clearAccessToken } from '../api/authToken.js';

const BASE_URL = "http://localhost:5005/api";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

// List of public routes that don't need authentication
const publicRoutes = [
  '/login',
  '/register', 
  '/google-login', 
  '/google-signup',
  '/refresh-token',
  '/logout',
  '/forgot-password',
  '/reset-password',
  '/vehicle/public',
  '/review/public'
];

// Checking if the route is public
const isPublicRoute = (url) => {
  return publicRoutes.some(route => url.includes(route));
};

// Flag to prevent multiple refresh attempts
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

axiosInstance.interceptors.request.use(
  (config) => {
    // Only add auth header for non-public routes
    if (!isPublicRoute(config.url)) {
      const token = getAccessToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If it's a public route, don't try to refresh token
    if (isPublicRoute(originalRequest.url)) {
      return Promise.reject(error);
    }

    // If already retried, don't try again
    if (originalRequest._retry) {
      return Promise.reject(error);
    }

    // Only handle 401 errors for token refresh
    if (error.response?.status === 401) {
      originalRequest._retry = true;

      try {
        // Try to refresh the token using the HTTP-only cookie
        const refreshResponse = await axios.post(
          `${BASE_URL}/refresh-token`, 
          {}, 
          { withCredentials: true }
        );
        
        const newToken = refreshResponse.data.accessToken;
        setAccessToken(newToken);
        
        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return axiosInstance(originalRequest);
        
      } catch (refreshError) {
        // Refresh failed, clear tokens and redirect to login
        clearAccessToken();
        localStorage.removeItem('user');
        
        // Only redirect if we're in a browser environment
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
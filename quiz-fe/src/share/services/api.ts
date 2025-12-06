import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import loadingService from './loadingService';
import { handleProblems } from '../utils/functions';

// Base configuration for API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config: AxiosRequestConfig | any) => {
    // If running in browser, add auth token and show loader
    if (typeof window !== 'undefined') {
      try {
        const token = localStorage.getItem('access_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Show global loader by default unless explicitly skipped
        const skip = config && (config.skipGlobalLoader === true || config.headers?.['X-Skip-Global-Loader'] === 'true');
        if (!skip) {
          try {
            loadingService.show();
            // mark that we showed loader for this request
            (config as any).__globalLoaderShown = true;
          } catch (e) {}
        }
      } catch (e) {}
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    try {
      if (typeof window !== 'undefined') {
        if ((response.config as any)?.__globalLoaderShown) {
          try {
            loadingService.hide();
          } catch (e) {}
        }
      }
    } catch (e) {}
    return response;
  },
  (error) => {
    try {
      if (typeof window !== 'undefined') {
        if (error.config && (error.config as any).__globalLoaderShown) {
          try {
            loadingService.hide();
          } catch (e) {}
        }
      }
    } catch (e) {}
    // Centralized error handling for localization
    try {
      handleProblems(error);
    } catch (e) {}
    // Handle common errors
    if (typeof window !== 'undefined' && error.response?.status === 401) {
      // Handle unauthorized - redirect to login
      try {
        localStorage.removeItem('access_token');
      } catch (e) {}
      try {
        window.location.href = '/login';
      } catch (e) {}
    }
    return Promise.reject(error);
  }
);

export default apiClient;

import axios from 'axios';

import Cookies from 'js-cookie';

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api/v1/operations';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('accessToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Simple error logging interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error(
        `[API Error] ${error.config?.method?.toUpperCase()} ${error.config?.url} → ${error.response.status}`,
        error.response.data
      );
    } else if (error.request) {
      console.error('[API Error] No response received:', error.message);
    }
    return Promise.reject(error);
  }
);

import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach access token
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

// Response interceptor to handle 401s and refresh tokens
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 Unauthorized and not already retrying
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = Cookies.get('refreshToken');

      if (refreshToken) {
        try {
          // Attempt to refresh the token
          const { data } = await axios.post(`${API_URL}/auth/refresh`, {
            refreshToken,
          });

          if (data.success && data.data?.accessToken) {
            // Save new tokens
            Cookies.set('accessToken', data.data.accessToken);
            if (data.data.refreshToken) {
              Cookies.set('refreshToken', data.data.refreshToken);
            }

            // Retry the original request
            return api(originalRequest);
          }
        } catch (refreshError) {
          // If refresh fails, log the user out by clearing cookies
          Cookies.remove('accessToken');
          Cookies.remove('refreshToken');
          // Redirect to login (browser environment only)
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
        }
      } else {
        // No refresh token, force logout
        Cookies.remove('accessToken');
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject(error);
  }
);

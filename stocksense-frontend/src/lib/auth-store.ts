import { create } from 'zustand';
import Cookies from 'js-cookie';
import axios from 'axios';

const AUTH_API_URL = 'http://localhost:3001/api/v1/auth';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'ADMIN' | 'MANAGER' | 'STAFF';
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (firstName: string, lastName: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  login: async (email, password) => {
    try {
      const response = await axios.post(`${AUTH_API_URL}/login`, { email, password });
      const { accessToken, refreshToken, user } = response.data.data ? response.data.data : response.data;
      Cookies.set('accessToken', accessToken);
      Cookies.set('refreshToken', refreshToken);
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      console.error('Login failed', error);
      throw error;
    }
  },

  register: async (firstName, lastName, email, password) => {
    try {
      const response = await axios.post(`${AUTH_API_URL}/register`, { firstName, lastName, email, password });
      const { accessToken, refreshToken, user } = response.data.data ? response.data.data : response.data;
      Cookies.set('accessToken', accessToken);
      Cookies.set('refreshToken', refreshToken);
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      console.error('Register failed', error);
      throw error;
    }
  },

  logout: () => {
    Cookies.remove('accessToken');
    Cookies.remove('refreshToken');
    set({ user: null, isAuthenticated: false, isLoading: false });
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  },

  checkAuth: async () => {
    const token = Cookies.get('accessToken');
    if (!token) {
      set({ user: null, isAuthenticated: false, isLoading: false });
      return;
    }

    try {
      const response = await axios.get(`${AUTH_API_URL}/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      set({
        user: response.data.data ? response.data.data : response.data,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      console.error('Auth check failed', error);
      Cookies.remove('accessToken');
      Cookies.remove('refreshToken');
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },
}));

import { create } from 'zustand';
import Cookies from 'js-cookie';
import { api } from './axios';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
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
    // Mock login for now since auth endpoint is not available
    const mockUser = {
      id: 'mock-user-id',
      email: email,
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin'
    };
    Cookies.set('accessToken', 'mock-access-token');
    Cookies.set('refreshToken', 'mock-refresh-token');
    set({ user: mockUser, isAuthenticated: true, isLoading: false });
  },

  register: async (firstName, lastName, email, password) => {
    const response = await api.post('/auth/register', { firstName, lastName, email, password });
    if (response.data.success) {
      const { accessToken, refreshToken, user } = response.data.data;
      Cookies.set('accessToken', accessToken);
      Cookies.set('refreshToken', refreshToken);
      set({ user, isAuthenticated: true, isLoading: false });
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
      const response = await api.get('/auth/me');
      if (response.data.success) {
        set({
          user: response.data.data,
          isAuthenticated: true,
          isLoading: false,
        });
      }
    } catch (error) {
      console.error('Auth check failed', error);
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },
}));

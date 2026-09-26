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
    // MOCK LOGIN FOR VERCEL DEMO
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    if (email === 'admin@stocksense.com' && password === 'Admin@123') {
      const user: User = { id: '1', email, firstName: 'Admin', lastName: 'User', role: 'ADMIN' };
      Cookies.set('accessToken', 'mock-token-admin');
      set({ user, isAuthenticated: true, isLoading: false });
    } else if (email === 'manager@stocksense.com' && password === 'Manager@123') {
      const user: User = { id: '2', email, firstName: 'Manager', lastName: 'User', role: 'MANAGER' };
      Cookies.set('accessToken', 'mock-token-manager');
      set({ user, isAuthenticated: true, isLoading: false });
    } else {
      // For any other credentials, just let them in as a generic user! (Hackathon friendly)
      const user: User = { id: '3', email, firstName: email.split('@')[0], lastName: '', role: 'STAFF' };
      Cookies.set('accessToken', 'mock-token-staff');
      set({ user, isAuthenticated: true, isLoading: false });
    }
  },

  register: async (firstName, lastName, email, password) => {
    // MOCK REGISTER FOR VERCEL DEMO
    await new Promise(resolve => setTimeout(resolve, 800));
    const user: User = { id: Date.now().toString(), email, firstName, lastName, role: 'STAFF' };
    Cookies.set('accessToken', 'mock-token-new');
    set({ user, isAuthenticated: true, isLoading: false });
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

    // MOCK CHECK AUTH
    // Just restore a fake user if they have a token
    const user: User = { 
      id: 'mock', 
      email: 'demo@stocksense.com', 
      firstName: token === 'mock-token-admin' ? 'Admin' : 'Demo', 
      lastName: 'User', 
      role: token === 'mock-token-admin' ? 'ADMIN' : 'STAFF' 
    };
    set({
      user,
      isAuthenticated: true,
      isLoading: false,
    });
  },
}));

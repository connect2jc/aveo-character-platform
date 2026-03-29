'use client';

import { create } from 'zustand';
import { User } from '@/types';
import { getCurrentUser, login as authLogin, logout as authLogout, register as authRegister } from '@/lib/auth';
import { LoginRequest, RegisterRequest } from '@/types';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (payload: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,

  login: async (credentials) => {
    const user = await authLogin(credentials);
    set({ user, isAuthenticated: true });
  },

  register: async (payload) => {
    const user = await authRegister(payload);
    set({ user, isAuthenticated: true });
  },

  logout: async () => {
    await authLogout();
    set({ user: null, isAuthenticated: false });
  },

  loadUser: async () => {
    set({ isLoading: true });
    const user = await getCurrentUser();
    set({ user, isAuthenticated: !!user, isLoading: false });
  },

  setUser: (user) => {
    set({ user, isAuthenticated: !!user });
  },
}));

'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/stores/auth-store';

export function useAuth() {
  const store = useAuthStore();

  useEffect(() => {
    if (!store.user && store.isLoading) {
      store.loadUser();
    }
  }, [store]);

  return store;
}

export function useRequireAuth() {
  const auth = useAuth();

  useEffect(() => {
    if (!auth.isLoading && !auth.isAuthenticated) {
      window.location.href = '/login';
    }
  }, [auth.isLoading, auth.isAuthenticated]);

  return auth;
}

export function useRequireAdmin() {
  const auth = useRequireAuth();

  useEffect(() => {
    if (!auth.isLoading && auth.user && !auth.user.is_admin) {
      window.location.href = '/dashboard';
    }
  }, [auth.isLoading, auth.user]);

  return auth;
}

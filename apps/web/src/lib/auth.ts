import api, { setTokens, clearTokens, getAccessToken } from './api';
import { AuthTokens, LoginRequest, RegisterRequest, User, ApiResponse } from '@/types';

export async function login(credentials: LoginRequest): Promise<User> {
  const { data } = await api.post<ApiResponse<{ user: User; tokens: AuthTokens }>>(
    '/api/v1/auth/login',
    credentials
  );
  setTokens(data.data.tokens);
  return data.data.user;
}

export async function register(payload: RegisterRequest): Promise<User> {
  const { data } = await api.post<ApiResponse<{ user: User; tokens: AuthTokens }>>(
    '/api/v1/auth/register',
    payload
  );
  setTokens(data.data.tokens);
  return data.data.user;
}

export async function logout(): Promise<void> {
  try {
    await api.post('/api/v1/auth/logout');
  } finally {
    clearTokens();
  }
}

export async function getCurrentUser(): Promise<User | null> {
  const token = getAccessToken();
  if (!token) return null;
  try {
    const { data } = await api.get<ApiResponse<User>>('/api/v1/auth/me');
    return data.data;
  } catch {
    return null;
  }
}

export async function forgotPassword(email: string): Promise<void> {
  await api.post('/api/v1/auth/forgot-password', { email });
}

export function isAuthenticated(): boolean {
  return !!getAccessToken();
}

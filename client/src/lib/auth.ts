import axios, { AxiosResponse } from 'axios';
import { removeCookie } from './cookie';

const API_URL = (import.meta.env.VITE_API_URL as string) || '';

const authApi = axios.create({
  baseURL: `${API_URL}/api/v1/auth`,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const handleUnauthorized = () => {
  clearAuthCookies();
  window.location.href = '/auth?message=session_expired';
};

export const clearAuthCookies = () => {
  removeCookie('token');
  removeCookie('token_type');
};

export interface UserCreate {
  email: string;
  password: string;
  full_name: string;
  education?: string;
  nationality?: string;
}

export interface UserResponse {
  id: number;
  email: string;
  full_name: string;
  is_verified: boolean;
  created_at: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  message?: string;
}

export const register = async (data: UserCreate): Promise<UserResponse> => {
  const response = await authApi.post('/register', data);
  return response.data;
};

export const login = async (email: string, password: string): Promise<TokenResponse> => {
  const formData = new URLSearchParams();
  formData.append('username', email);
  formData.append('password', password);

  const response = await authApi.post('/login', formData, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });

  const data = response.data;
  if (data.access_token) {
    localStorage.setItem('access_token', data.access_token);
    localStorage.setItem('token_type', data.token_type || 'bearer');
  }
  return data;
};

export const logout = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('token_type');
};

export const getAuthHeader = () => {
  const token = localStorage.getItem('access_token');
  const type = localStorage.getItem('token_type') || 'bearer';
  return token ? { Authorization: `${type} ${token}` } : {};
};

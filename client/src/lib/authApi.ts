/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { getCookie } from './cookie';
import { clearAuthCookies } from './auth';

export interface RegisterRequest {
  email: string;
  username: string;
  full_name: string;
  password: string;
  education?: string; // maps to school
  nationality?: string;
  visa_status?: string; // added field
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface UserResponse {
  id: number;
  email: string;
  username: string; 
  full_name: string;
  is_verified: boolean;
  created_at: string;
  education?: string;
  nationality?: string;
  visa_status?: string; // added field
}

const API_BASE: string = (import.meta as any).env?.VITE_API_BASE_URL ?? "http://localhost:8000/api/v1";

function buildHeaders(token?: string, isJson: boolean = true): HeadersInit {
  const headers: Record<string, string> = {};
  if (isJson) headers["Content-Type"] = "application/json";
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const data = await res.json();
      message = (data?.detail as string) ?? message;
    } catch {
      // ignore
    }
    throw new Error(message);
  }
  if (res.status === 401) {
    const { handleUnauthorized } = await import('./auth');
    handleUnauthorized();
    throw new Error('Session expired. Please log in again.');
  }
  return (await res.json()) as T;
}

export async function registerUser(body: RegisterRequest & { username: string, visa_status: string }) {
  const mappedBody = {
    email: body.email,
    password: body.password,
    full_name: body.full_name,
    education: body.education,
    nationality: body.nationality,
    username: body.username,
    visa_status: body.visa_status,
  };

  const res = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: buildHeaders(undefined, true),
    body: JSON.stringify(mappedBody),
  });

  return handleResponse<UserResponse>(res);
}


export async function loginUser(email: string, password: string) {
  const form = new URLSearchParams();
  form.set("username", email);
  form.set("password", password);

  console.log("Attempting login with:", { email });

  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: form.toString(),
  });
  
  const data = await handleResponse<TokenResponse>(res);
  console.log("Login response:", data);
  return data;
}

export async function getCurrentUser() {
  const token = getCookie('token');
  const tokenType = getCookie('token_type') || 'bearer';
  
  if (!token) {
    throw new Error('No authentication token found');
  }

  console.log('Fetching current user with token:', `${tokenType} ${token}`);

  const res = await fetch(`${API_BASE}/auth/me`, {
    method: "GET",
    credentials: 'include',
    headers: {
      'Authorization': `${tokenType} ${token}`
    }
  });
  return handleResponse<UserResponse>(res);
}

export async function verifyEmail(tokenParam: string, authToken: string) {
  const res = await fetch(`${API_BASE}/auth/verify-email?token=${encodeURIComponent(tokenParam)}`, {
    method: "POST",
    headers: buildHeaders(authToken, false),
  });
  return handleResponse<unknown>(res);
}

export async function resendVerification(authToken: string) {
  const res = await fetch(`${API_BASE}/auth/resend-verification`, {
    method: "POST",
    headers: buildHeaders(authToken, false),
  });
  return handleResponse<unknown>(res);
}

export async function logout() {
  const token = getCookie('token');
  if (!token) return;

  try {
    const res = await fetch(`${API_BASE}/auth/logout`, {
      method: "POST",
      headers: buildHeaders(token, false),
    });
    await handleResponse<{ message: string }>(res);
  } finally {
    clearAuthCookies();
  }
}

export interface UpdateUserProfileRequest {
  full_name?: string;
  education?: string;
  nationality?: string;
  visa_status?: string;
}

export async function updateUserProfile(data: UpdateUserProfileRequest) {
  const token = getCookie('token');
  const tokenType = getCookie('token_type') || 'bearer';

  if (!token) {
    throw new Error('No authentication token found');
  }

  const res = await fetch(`${API_BASE}/users/me`, {  // <-- fixed path
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `${tokenType} ${token}`,
    },
    body: JSON.stringify(data),
  });

  return handleResponse<UserResponse>(res);
}
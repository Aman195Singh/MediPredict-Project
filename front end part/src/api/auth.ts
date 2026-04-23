import { apiRequest } from './client';

export interface AuthUser {
  id: number;
  email: string;
  full_name: string;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: AuthUser;
}

export const authAPI = {
  signup: (full_name: string, email: string, password: string) => 
    apiRequest<AuthResponse>('/auth/signup', {
      method: 'POST',
      data: { full_name, email, password }
    }),

  login: (email: string, password: string) => 
    apiRequest<AuthResponse>('/auth/login', {
      method: 'POST',
      data: { email, password }
    }),

  getMe: () => 
    apiRequest<AuthUser>('/auth/me', {
      method: 'GET'
    })
};

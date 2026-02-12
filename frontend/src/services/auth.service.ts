import { ApiClient } from '@/lib/api-client';
import {
  AuthResponse,
  LoginCredentials,
  RegisterCredentials,
} from '@/types/auth.types';

export class AuthService {
  static async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await ApiClient.post<AuthResponse>(
      '/auth/login',
      credentials
    );
    
    if (typeof window !== 'undefined' && response.token) {
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
    }
    
    return response;
  }

  static async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    const response = await ApiClient.post<AuthResponse>(
      '/auth/register',
      credentials
    );
    
    if (typeof window !== 'undefined' && response.token) {
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
    }
    
    return response;
  }

  static logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }

  static getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  }

  static getUser() {
    if (typeof window !== 'undefined') {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    }
    return null;
  }
}
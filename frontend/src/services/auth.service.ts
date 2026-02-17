import { ApiClient } from '@/lib/api-client';
import {
  AuthResponse,
  LoginCredentials,
  RegisterCredentials,
} from '@/types/auth.types';

const ONE_WEEK_IN_SECONDS = 7 * 24 * 60 * 60;

export class AuthService {
  private static setAuthStorage(response: AuthResponse) {
    if (typeof window === 'undefined') return;

    const { token, user } = response;

    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));

    document.cookie = `token=${token}; path=/; max-age=${ONE_WEEK_IN_SECONDS}; secure; samesite=lax`;
  }

  private static clearAuthStorage() {
    if (typeof window === 'undefined') return;

    localStorage.removeItem('token');
    localStorage.removeItem('user');

    document.cookie = 'token=; path=/; max-age=0';
  }

  static async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await ApiClient.post<AuthResponse>(
      '/auth/login',
      credentials
    );

    if (response.token) {
      this.setAuthStorage(response);
    }

    return response;
  }

  static async register(
    credentials: RegisterCredentials
  ): Promise<AuthResponse> {
    const response = await ApiClient.post<AuthResponse>(
      '/auth/register',
      credentials
    );

    if (response.token) {
      this.setAuthStorage(response);
    }

    return response;
  }

  static logout(): void {
    this.clearAuthStorage();
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
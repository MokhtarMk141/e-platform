import { ApiClient } from '@/lib/api-client';
import {
  AuthResponse,
  RefreshResponse,
  LoginCredentials,
  RegisterCredentials,
  ForgotPasswordCredentials,
  ResetPasswordCredentials,
} from '@/types/auth.types';

const ONE_WEEK_IN_SECONDS = 7 * 24 * 60 * 60;

export class AuthService {
  /* ── Storage helpers ── */

  static setAuthStorage(response: AuthResponse) {
    if (typeof window === 'undefined') return;

    const { accessToken, user } = response;

    localStorage.setItem('token', accessToken);
    localStorage.setItem('user', JSON.stringify(user));

    document.cookie = `token=${accessToken}; path=/; max-age=${ONE_WEEK_IN_SECONDS}; secure; samesite=lax`;
  }

  static clearAuthStorage() {
    if (typeof window === 'undefined') return;

    localStorage.removeItem('token');
    localStorage.removeItem('user');

    document.cookie = 'token=; path=/; max-age=0';
  }

  /* ── Auth endpoints ── */

  static async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await ApiClient.post<AuthResponse>(
      '/auth/login',
      credentials
    );

    if (response.accessToken) {
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

    if (response.accessToken) {
      this.setAuthStorage(response);
    }

    return response;
  }

  static async refreshToken(): Promise<string> {
    const response = await ApiClient.post<RefreshResponse>('/auth/refresh');

    if (response.accessToken) {
      localStorage.setItem('token', response.accessToken);
    }

    return response.accessToken;
  }

  static logout(): void {
    this.clearAuthStorage();
  }

  static async forgotPassword(credentials: ForgotPasswordCredentials): Promise<void> {
    await ApiClient.post('/auth/forgot-password', credentials);
  }

  static async resetPassword(credentials: ResetPasswordCredentials): Promise<void> {
    await ApiClient.post('/auth/reset-password', credentials);
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
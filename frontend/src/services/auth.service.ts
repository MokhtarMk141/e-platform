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

  //this function allows the frontend to remeber the logged-in user even if our refresh the page 
  static setAuthStorage(response: AuthResponse) { //this the return of 
    if (typeof window === 'undefined') return;

    const { accessToken, user } = response;

    localStorage.setItem('token', accessToken);
    localStorage.setItem('user', JSON.stringify(user));
//Save token in a cookie
    document.cookie = `token=${accessToken}; path=/; max-age=${ONE_WEEK_IN_SECONDS}; secure; samesite=lax`;
  }
/*token=… → stores the JWT in the cookie.

path=/ → the cookie is available on all pages of your website.

max-age=… → the cookie lasts 1 week. After that, it disappears automatically.

secure → the cookie is sent only over HTTPS (secure connection).

samesite=lax → prevents some attacks from other websites (CSRF protection).*/







  static clearAuthStorage() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    document.cookie = 'token=; path=/; max-age=0';
  }


  /* ── Authenticate the user and store their session  ── */

  static async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await ApiClient.post<AuthResponse>('/auth/login',credentials);
    if (response.accessToken) { 
      this.setAuthStorage(response);
    }
    return response;
  }

/*
User enters email & password → calls login(credentials).

ApiClient.post sends a POST request to /auth/login.

Server returns accessToken + user.

setAuthStorage saves token in localStorage + cookie.

login returns response → app can now use response.user or response.accessToken.
*/


  static async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    const response = await ApiClient.post<AuthResponse>('/auth/register',credentials
    );

    if (response.accessToken) {
      this.setAuthStorage(response);
    }

    return response;
  }


  //To get a new access token from the server when the current one expires and update it on the client
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
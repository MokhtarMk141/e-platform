import { create } from 'zustand';
import { AuthService } from '@/services/auth.service';
import type {
  User,
  LoginCredentials,
  RegisterCredentials,
  AuthResponse,
} from '@/types/auth.types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<AuthResponse>;
  register: (credentials: RegisterCredentials) => Promise<AuthResponse>;
  logout: () => void;
}

const getInitialAuthState = (): Pick<
  AuthState,
  'user' | 'token' | 'isAuthenticated'
> => {
  const token = AuthService.getToken();
  const user = AuthService.getUser();

  if (!token || !user) {
    return {
      user: null,
      token: null,
      isAuthenticated: false,
    };
  }

  return {
    user,
    token,
    isAuthenticated: true,
  };
};

export const useAuthStore = create<AuthState>((set) => ({
  ...getInitialAuthState(),
  loading: false,

  login: async (credentials) => {
    set({ loading: true });
    try {
      const response = await AuthService.login(credentials);

      set({
        user: response.user,
        token: response.token,
        isAuthenticated: true,
        loading: false,
      });

      return response;
    } catch (error) {
      set({ loading: false, isAuthenticated: false });
      throw error;
    }
  },

  register: async (credentials) => {
    set({ loading: true });
    try {
      const response = await AuthService.register(credentials);

      set({
        user: response.user,
        token: response.token,
        isAuthenticated: true,
        loading: false,
      });

      return response;
    } catch (error) {
      set({ loading: false, isAuthenticated: false });
      throw error;
    }
  },

  logout: () => {
    AuthService.logout();
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,
    });
  },
}));

export const useAuth = () => useAuthStore;

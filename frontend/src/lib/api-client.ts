const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

/* ── Token helpers (direct localStorage access) ── */

function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

function setStoredToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('token', token);
}

function clearAuthAndRedirect(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  document.cookie = 'token=; path=/; max-age=0';
  window.location.href = '/login';
}

/* ── Refresh queue (prevents parallel refresh calls) ── */

let isRefreshing = false;
let refreshQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null): void {
  refreshQueue.forEach(({ resolve, reject }) => {
    if (error || !token) reject(error);
    else resolve(token);
  });
  refreshQueue = [];
}

async function refreshAccessToken(): Promise<string> {
  /* If a refresh is already in‑flight, queue this caller */
  if (isRefreshing) {
    return new Promise<string>((resolve, reject) => {
      refreshQueue.push({ resolve, reject });
    });
  }

  isRefreshing = true;

  try {
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',          // send httpOnly refresh cookie
      headers: { 'Content-Type': 'application/json' },
    });

    if (!res.ok) throw new Error('Refresh failed');

    const data = await res.json();
    const newToken: string = data.accessToken;

    setStoredToken(newToken);
    processQueue(null, newToken);
    return newToken;
  } catch (err) {
    processQueue(err, null);
    clearAuthAndRedirect();
    throw err;
  } finally {
    isRefreshing = false;
  }
}

/* ── API Client ── */

export class ApiClient {
  private static async request<T>(
    endpoint: string,
    options: RequestInit = {},
    _isRetry = false
  ): Promise<T> {
    const token = getStoredToken();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
      credentials: 'include',           // always send cookies
    });

    /* ── 401 interceptor ── */
    if (response.status === 401 && !_isRetry) {
      // Don't try to refresh if this IS the refresh call
      if (endpoint === '/auth/refresh') {
        clearAuthAndRedirect();
        throw new Error('Session expired');
      }

      try {
        const newToken = await refreshAccessToken();
        // Retry original request with fresh token
        headers['Authorization'] = `Bearer ${newToken}`;
        const retryResponse = await fetch(`${API_URL}${endpoint}`, {
          ...options,
          headers,
          credentials: 'include',
        });

        const retryData = await retryResponse.json();
        if (!retryResponse.ok) throw retryData;
        return retryData;
      } catch {
        // Refresh failed — clearAuthAndRedirect already called
        throw new Error('Session expired');
      }
    }

    const data = await response.json();

    if (!response.ok) {
      throw data;
    }

    return data;
  }

  static get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  static post<T>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body != null ? JSON.stringify(body) : undefined,
    });
  }

  static put<T>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body != null ? JSON.stringify(body) : undefined,
    });
  }

  static patch<T>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: body != null ? JSON.stringify(body) : undefined,
    });
  }

  static delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}
/*Purpose: Get the saved token from the browser so we can send it with API requests. 
typeof window === 'undefined' → This checks if your code is running on the server (Next.js does server-side rendering).
 If it’s server-side → there’s no localStorage → return null.
  localStorage.getItem('token') → Reads the token stored in the browser.*/
function setStoredToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('token', token);
}

/*Purpose: Save a token in the browser when the user logs in or refreshes the token. 
Again, it checks if window exists to make sure it’s not running on the server. 
localStorage.setItem('token', token) → Saves the token*/
function clearAuthAndRedirect(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('token');
}

//It refreshes the access token
async function refreshAccessToken(): Promise<string> {
  const res = await fetch(`${API_URL}/auth/refresh`, {
    method: 'POST',
    credentials: 'include',  //credentials: 'include' tells fetch to send cookies along with the request, even for cross-origin requests.
  });
  if (!res.ok) {
    clearAuthAndRedirect();
    throw new Error('Session expired');
  }
  const data = await res.json();
  const newToken: string = data.accessToken;
  setStoredToken(newToken);
  return newToken;
}
/*
1/Call the server’s /auth/refresh endpoint

2/It sends the refresh token automatically via the cookie (credentials: 'include')

3/Get a new access token from the server response

4/Save the new access token in localStorage

5/ Return the new access token so pending API requests can retry

6/ Redirect to login if the refresh fails*/


export class ApiClient {

  private static async request<T>(endpoint: string, options: RequestInit = {}, _isRetry = false): Promise<T> {
    const token = getStoredToken(); //Reads the access token from localStorage (stored after login or refresh).
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    let response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
      credentials: 'include',
    });

    // Retry once if 401
    if (response.status === 401 && !_isRetry) {
      try {
        const newToken = await refreshAccessToken();
        headers['Authorization'] = `Bearer ${newToken}`;
        response = await fetch(`${API_URL}${endpoint}`, {
          ...options,
          headers,
          credentials: 'include',
        });
      } catch {
        throw new Error('Session expired');
      }
    }

    const data = await response.json();
    if (!response.ok) throw data;
    return data;
  }







  static get<T>(endpoint: string) {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  static post<T>(endpoint: string, body?: any) {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body != null ? JSON.stringify(body) : undefined,
    });
  }

  static put<T>(endpoint: string, body?: any) {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body != null ? JSON.stringify(body) : undefined,
    });
  }

  static delete<T>(endpoint: string) {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}
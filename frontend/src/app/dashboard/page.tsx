'use client';

import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/hooks/useAuth';
import MegaMenu from '@/app/mega-menu/megaMenu';

/*
  DASHBOARD PAGE
  - Reads user from Zustand store (useAuthStore)
  - Logout clears localStorage + redirects to /login
  - Displays user info: name, email, role
*/

export default function DashboardPage() {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div>
      <MegaMenu />

      <main style={{ maxWidth: 800, margin: '0 auto', padding: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #ddd', paddingBottom: 20, marginBottom: 20 }}>
          <div>
            <h1>Welcome, {user?.name || 'User'}</h1>
            <p style={{ color: '#666' }}>
              Role: <strong>{user?.role || 'N/A'}</strong> | Email: {user?.email}
            </p>
          </div>
          <button
            onClick={handleLogout}
            style={{ padding: '8px 16px', border: '1px solid #ccc', background: '#f5f5f5', cursor: 'pointer' }}
          >
            Logout
          </button>
        </div>

        {/* ── User Info Table ── */}
        <h3>Account Info</h3>
        <table>
          <tbody>
            <tr><th>Name</th><td>{user?.name}</td></tr>
            <tr><th>Email</th><td>{user?.email}</td></tr>
            <tr><th>Role</th><td>{user?.role}</td></tr>
            <tr><th>User ID</th><td style={{ fontFamily: 'monospace', fontSize: 12 }}>{user?.id}</td></tr>
          </tbody>
        </table>

        {/* ── Auth Data in localStorage ── */}
        <h3 style={{ marginTop: 20 }}>How it works</h3>
        <ul style={{ lineHeight: 2, paddingLeft: 20 }}>
          <li><code>localStorage.token</code> — the JWT accessToken from the backend</li>
          <li><code>localStorage.user</code> — JSON-stringified user object (id, name, email, role)</li>
          <li>The <code>ApiClient</code> auto-attaches the token as <code>Authorization: Bearer &lt;token&gt;</code></li>
          <li>If the token expires (401), the client calls <code>POST /auth/refresh</code> automatically</li>
          <li>If refresh also fails, the user is redirected to <code>/login</code></li>
        </ul>
      </main>
    </div>
  );
}

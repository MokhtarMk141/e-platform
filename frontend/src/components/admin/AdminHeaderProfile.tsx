"use client";

import { useAuthStore } from "@/hooks/useAuth";

export default function AdminHeaderProfile() {
  const { user } = useAuthStore();

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '4px 12px 4px 4px',
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 12,
      cursor: 'pointer',
    }}>
      <div style={{
        width: 32, height: 32, borderRadius: 8,
        background: 'linear-gradient(135deg, var(--brand-red) 0%, #ff6633 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#fff', fontWeight: 800, fontSize: 13,
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}>
        {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--foreground)', lineHeight: 1.2, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          {user?.name || 'Admin'}
        </span>
        <span style={{ fontSize: 10.5, color: 'var(--text-dim)', fontWeight: 500, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          Admin
        </span>
      </div>
      <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-dim)', marginLeft: 2 }}>
        <path d="M6 9l6 6 6-6" />
      </svg>
    </div>
  );
}

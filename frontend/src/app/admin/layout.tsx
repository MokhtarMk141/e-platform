import Sidebar from "@/app/sidebar/side-bar";
import ThemeToggle from "@/components/ThemeToggle";
import AdminGuard from "@/components/AdminGuard";
import AdminHeaderProfile from "@/components/admin/AdminHeaderProfile";

/* ── Small SVG icon helper ── */
const Icon = ({ d, size = 16 }: { d: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGuard>
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--background)", transition: "background 0.3s" }}>
      <Sidebar />
      <main style={{ flex: 1, overflowY: "auto", minWidth: 0, display: "flex", flexDirection: "column" }}>

        {/* ── Top Admin Header ── */}
        <header style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 28px",
          background: "var(--background)",
          borderBottom: "1px solid var(--border)",
          position: "sticky",
          top: 0,
          zIndex: 10,
          gap: 16,
        }}>
          {/* Left: Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: 'linear-gradient(135deg, var(--brand-red) 0%, #ff6633 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 800, fontSize: 13,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              boxShadow: '0 4px 12px rgba(255,40,0,0.15)',
            }}>
              A
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--foreground)', letterSpacing: '-0.02em', fontFamily: "'Plus Jakarta Sans', sans-serif", lineHeight: 1.2 }}>Admin Panel</span>
              <span style={{ fontSize: 10, color: 'var(--text-dim)', fontWeight: 600, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>E-Commerce</span>
            </div>
          </div>

          {/* Center: Search bar */}
          <div style={{
            flex: '0 1 420px',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
          }}>
            <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: 14, color: 'var(--text-dim)' }}>
              <path d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
            </svg>
            <input
              placeholder="Search product"
              readOnly
              style={{
                width: '100%',
                padding: '9px 70px 9px 38px',
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 12,
                fontSize: 13.5,
                color: 'var(--foreground)',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                outline: 'none',
                cursor: 'pointer',
              }}
            />
            <span style={{
              position: 'absolute',
              right: 14,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              color: 'var(--text-dim)',
              fontSize: 12,
              fontWeight: 600,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              background: 'var(--background)',
              border: '1px solid var(--border)',
              borderRadius: 6,
              padding: '2px 7px',
            }}>
              K ⌘
            </span>
          </div>

          {/* Right: Icons + Profile + Theme toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* Notification bell */}
            <button style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'var(--surface)', border: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: 'var(--text-muted)', transition: 'border-color 0.2s',
            }}>
              <Icon d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" size={16} />
            </button>

            {/* Help */}
            <button style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'var(--surface)', border: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: 'var(--text-muted)', transition: 'border-color 0.2s',
            }}>
              <Icon d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zM9.09 9a3 3 0 015.83 1c0 2-3 3-3 3M12 17h.01" size={16} />
            </button>

            <ThemeToggle />

            {/* Profile */}
            <AdminHeaderProfile />
          </div>
        </header>

        {children}
      </main>
    </div>
    </AdminGuard>
  );
}

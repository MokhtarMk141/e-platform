'use client';

import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/hooks/useAuth';
import MegaMenu from '@/app/mega-menu/megaMenu';

export default function DashboardPage() {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-background font-sans transition-colors duration-300">
      <MegaMenu />

      <main className="mx-auto max-w-7xl px-8 py-12">
        <div className="flex items-center justify-between border-b border-border pb-8">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
              Welcome back, <span className="text-brand-red">{user?.name || 'User'}</span>
            </h1>
            <p className="mt-2 text-sm text-text-dim">
              {user?.role === 'ADMIN' ? 'Administrator' : 'Customer'} Account
            </p>
            <p className="mt-4 text-lg text-text-muted">
              Manage your orders, profile, and builds from your personalized dashboard.
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-xl bg-foreground px-6 py-3 text-sm font-bold text-background transition-all hover:opacity-90 hover:shadow-lg active:scale-95"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Logout
          </button>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {/* Dashboard Stats / Cards */}
          {[
            { label: 'Active Builds', value: '12', icon: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5' },
            { label: 'Saved Products', value: '45', icon: 'M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78v0z' },
            { label: 'Store Points', value: '1,250', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
          ].map((item, idx) => (
            <div key={idx} className="group overflow-hidden rounded-2xl border border-border bg-background p-8 shadow-sm transition-all hover:border-brand-red hover:shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold uppercase tracking-wider text-text-dim">{item.label}</p>
                  <p className="mt-2 text-3xl font-black text-foreground">{item.value}</p>
                </div>
                <div className="rounded-xl bg-surface p-4 text-text-dim transition-colors group-hover:bg-red-50 group-hover:text-brand-red dark:group-hover:bg-red-900/20">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d={item.icon} />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

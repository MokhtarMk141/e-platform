"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { useOrders } from "@/hooks/useOrders";
import { useAuthStore } from "@/hooks/useAuth";
import MegaMenu from "../mega-menu/megaMenu";

const currency = (value: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "TND", maximumFractionDigits: 2 }).format(value);

const statusTone = (status: string) => {
  if (status === "DELIVERED") return { bg: "rgba(34,197,94,0.08)", fg: "#22c55e", border: "rgba(34,197,94,0.2)" };
  if (status === "SHIPPED") return { bg: "rgba(37,99,235,0.08)", fg: "#2563eb", border: "rgba(37,99,235,0.2)" };
  if (status === "PROCESSING") return { bg: "rgba(234,179,8,0.08)", fg: "#eab308", border: "rgba(234,179,8,0.2)" };
  if (status === "CANCELLED") return { bg: "rgba(239,68,68,0.08)", fg: "#ef4444", border: "rgba(239,68,68,0.2)" };
  return { bg: "rgba(107,114,128,0.08)", fg: "#6b7280", border: "rgba(107,114,128,0.15)" };
};

const Icon = ({ d, size = 16 }: { d: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

export default function OrdersPage() {
  const router = useRouter();
  const { isAuthenticated, syncAuth, user } = useAuthStore();
  const { orders, loading, error, refetch } = useOrders(false);

  useEffect(() => {
    syncAuth();
  }, [syncAuth]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  return (
    <div style={{ background: "var(--background)", minHeight: "100vh", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=DM+Sans:wght@400;500;700&display=swap');
        
        .orders-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 40px 24px;
          animation: fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .premium-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 24px;
          padding: 32px;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .premium-card:hover {
          transform: translateY(-2px);
          border-color: var(--border-strong);
          box-shadow: 0 4px 24px rgba(0,0,0,0.06);
        }

        .btn-premium {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: var(--brand-red);
          color: #fff;
          padding: 12px 24px;
          border: none;
          border-radius: 14px;
          text-decoration: none;
          font-size: 14px;
          font-weight: 800;
          box-shadow: 0 4px 14px rgba(255,40,0,0.25);
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          cursor: pointer;
        }
        .btn-premium:hover {
          background: var(--brand-red-hover);
          transform: translateY(-1px);
          box-shadow: 0 6px 18px rgba(255,40,0,0.32);
        }

        .order-row {
          display: grid;
          grid-template-columns: 1fr;
          gap: 24px;
          margin-top: 32px;
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          padding: 6px 14px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          border: 1.5px solid;
        }

        .hero-glow {
          position: absolute;
          top: -20%;
          right: -10%;
          width: 40%;
          height: 140%;
          background: radial-gradient(circle, rgba(255,40,0,0.04) 0%, transparent 70%);
          pointer-events: none;
          z-index: 0;
        }

        .item-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          border-radius: 16px;
          background: var(--background);
          border: 1px solid var(--border);
          transition: all 0.2s;
        }
        .item-row:hover {
          background: var(--surface-hover);
          border-color: var(--border-strong);
        }
      `}</style>

      <MegaMenu />

      <main className="orders-container">
        <header style={{ position: "relative", marginBottom: 40 }}>
          <div className="hero-glow" />
          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--brand-red)", fontWeight: 900, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 12 }}>
              <div style={{ width: 24, height: 2, background: "var(--brand-red)" }} />
              Customer Dashboard
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 20 }}>
              <div>
                <h1 style={{ fontSize: "clamp(32px, 5vw, 48px)", fontWeight: 900, letterSpacing: "-0.04em", margin: 0, color: "var(--foreground)" }}>My Order History</h1>
                <p style={{ marginTop: 12, color: "var(--text-muted)", fontSize: 16, maxWidth: 500, lineHeight: 1.6, fontFamily: "'DM Sans', sans-serif" }}>
                  Welcome back, <span style={{ color: "var(--foreground)", fontWeight: 700 }}>{user?.name}</span>. Trace your packages and manage your digital workspace receipts.
                </p>
              </div>
              <Link href="/product-page" className="btn-premium">
                Continue Shopping
              </Link>
            </div>
          </div>
        </header>

        <section className="order-row">
          {loading && (
            <div className="premium-card" style={{ textAlign: "center", padding: "60px 40px" }}>
              <div style={{ display: "inline-block", width: 32, height: 32, border: "3px solid rgba(255,40,0,0.1)", borderTopColor: "var(--brand-red)", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
              <p style={{ marginTop: 18, fontWeight: 800, color: "var(--text-muted)", fontSize: 14 }}>Fetching your activity...</p>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          )}

          {error && (
            <div className="premium-card" style={{ border: "1px solid rgba(239,68,68,0.2)", background: "rgba(239,68,68,0.02)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ width: 44, height: 44, borderRadius: "50%", background: "rgba(239,68,68,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#ef4444" }}>
                  <Icon d="M12 8v4m0 4h.01M22 12c0 5.523-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2s10 4.477 10 10z" size={24} />
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: 0, fontSize: 15, fontWeight: 900 }}>Connection Error</h3>
                  <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--text-muted)" }}>{error}</p>
                </div>
                <button onClick={refetch} className="btn-premium" style={{ padding: "8px 16px", fontSize: 12 }}>Refresh</button>
              </div>
            </div>
          )}

          {!loading && !error && orders.length === 0 && (
            <div className="premium-card" style={{ textAlign: "center", padding: "80px 40px" }}>
              <div style={{ width: 80, height: 80, margin: "0 auto 24px", background: "var(--background)", borderRadius: "24px", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-dim)", border: "1px solid var(--border)" }}>
                <Icon d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" size={32} />
              </div>
              <h2 style={{ fontSize: 24, fontWeight: 900, margin: "0 0 12px" }}>Your bag is empty</h2>
              <p style={{ color: "var(--text-muted)", maxWidth: 360, margin: "0 auto 32px", lineHeight: 1.6, fontWeight: 500 }}>You haven't placed any orders yet. Start building your ecosystem today.</p>
              <Link href="/product-page" className="btn-premium">Browse Catalog</Link>
            </div>
          )}

          {orders.map((order, idx) => {
            const tone = statusTone(order.status);
            return (
              <article key={order.id} className="premium-card" style={{ animationDelay: `${idx * 100}ms` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16, marginBottom: 24, paddingBottom: 24, borderBottom: "1px solid var(--border)" }}>
                  <div>
                    <span style={{ fontSize: 10, fontWeight: 900, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.15em" }}>Transaction Ref</span>
                    <h3 style={{ margin: "4px 0 0", fontSize: 20, fontWeight: 900, letterSpacing: "-0.03em" }}>#{order.id.slice(-8).toUpperCase()}</h3>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8, fontSize: 13, color: "var(--text-muted)", fontWeight: 600 }}>
                      <Icon d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" size={14} />
                      {new Date(order.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })} at {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  <span className="status-badge" style={{ backgroundColor: tone.bg, color: tone.fg, borderColor: tone.border }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: tone.fg, marginRight: 8, display: "inline-block" }} />
                    {order.status}
                  </span>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 16, marginBottom: 32 }}>
                  <div style={{ background: "var(--background)", padding: 18, borderRadius: 20, border: "1px solid var(--border)" }}>
                    <p style={{ margin: 0, fontSize: 10, fontWeight: 900, color: "var(--text-dim)", textTransform: "uppercase", marginBottom: 6, letterSpacing: "0.05em" }}>Method</p>
                    <p style={{ margin: 0, fontSize: 15, fontWeight: 800 }}>{order.paymentMethod.replace("_", " ")}</p>
                  </div>
                  <div style={{ background: "var(--background)", padding: 18, borderRadius: 20, border: "1px solid var(--border)" }}>
                    <p style={{ margin: 0, fontSize: 10, fontWeight: 900, color: "var(--text-dim)", textTransform: "uppercase", marginBottom: 6, letterSpacing: "0.05em" }}>Shipping</p>
                    <p style={{ margin: 0, fontSize: 15, fontWeight: 800 }}>{order.deliveryMode}</p>
                  </div>
                  <div style={{ background: "var(--background)", padding: 18, borderRadius: 20, border: "1px solid var(--border)" }}>
                    <p style={{ margin: 0, fontSize: 10, fontWeight: 900, color: "var(--text-dim)", textTransform: "uppercase", marginBottom: 6, letterSpacing: "0.05em" }}>Items</p>
                    <p style={{ margin: 0, fontSize: 15, fontWeight: 800 }}>{order.totalItems} Quantity</p>
                  </div>
                  <div style={{ background: "var(--background)", padding: 18, borderRadius: 20, border: "1px solid var(--border)", borderLeft: "4px solid var(--brand-red)" }}>
                    <p style={{ margin: 0, fontSize: 10, fontWeight: 900, color: "var(--text-dim)", textTransform: "uppercase", marginBottom: 6, letterSpacing: "0.05em" }}>Grand Total</p>
                    <p style={{ margin: 0, fontSize: 18, fontWeight: 900, color: "var(--foreground)" }}>{currency(order.total)}</p>
                  </div>
                </div>

                <div style={{ display: "grid", gap: 12 }}>
                  <h4 style={{ margin: "0 0 4px", fontSize: 11, fontWeight: 900, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Receipt Summary</h4>
                  {order.items.map((item) => (
                    <div key={item.id} className="item-row">
                      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                        <div style={{ width: 44, height: 44, borderRadius: 12, background: "var(--surface)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>📦</div>
                        <div>
                          <p style={{ margin: 0, fontSize: 15, fontWeight: 800 }}>{item.name}</p>
                          <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--text-dim)", fontWeight: 600 }}>Qty: {item.quantity} · Reference: {item.sku}</p>
                        </div>
                      </div>
                      <p style={{ margin: 0, fontSize: 15, fontWeight: 900, color: "var(--brand-red)" }}>{currency(item.lineTotal)}</p>
                    </div>
                  ))}
                </div>
              </article>
            );
          })}
        </section>
      </main>

      <footer style={{ padding: "80px 24px 60px", textAlign: "center", color: "var(--text-dim)", fontSize: 12, fontWeight: 600 }}>
        <p style={{ margin: 0 }}>&copy; {new Date().getFullYear()} Ecommerce Platform. Secured by Enterprise Encryption.</p>
        <div style={{ display: "flex", justifyContent: "center", gap: 24, marginTop: 20 }}>
          <Link href="#" style={{ color: "inherit", textDecoration: "none" }}>Privacy Policy</Link>
          <Link href="#" style={{ color: "inherit", textDecoration: "none" }}>Terms of Service</Link>
          <Link href="#" style={{ color: "inherit", textDecoration: "none" }}>Support Center</Link>
        </div>
      </footer>
    </div>
  );
}

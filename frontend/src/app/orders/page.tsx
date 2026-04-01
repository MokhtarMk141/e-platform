"use client";

import Link from "next/link";
import { useEffect } from "react";
import type { CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { useOrders } from "@/hooks/useOrders";
import { useAuthStore } from "@/hooks/useAuth";

const currency = (value: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(value);

const statusTone = (status: string) => {
  if (status === "DELIVERED") return { bg: "rgba(34,197,94,0.12)", fg: "#16a34a", border: "rgba(34,197,94,0.35)" };
  if (status === "SHIPPED") return { bg: "rgba(37,99,235,0.12)", fg: "#2563eb", border: "rgba(37,99,235,0.35)" };
  if (status === "PROCESSING") return { bg: "rgba(234,179,8,0.12)", fg: "#ca8a04", border: "rgba(234,179,8,0.35)" };
  if (status === "CANCELLED") return { bg: "rgba(239,68,68,0.12)", fg: "#dc2626", border: "rgba(239,68,68,0.35)" };
  return { bg: "rgba(107,114,128,0.12)", fg: "#6b7280", border: "rgba(107,114,128,0.3)" };
};

export default function OrdersPage() {
  const router = useRouter();
  const { isAuthenticated, syncAuth } = useAuthStore();
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
    <main style={pageStyle}>
      <div style={headerStyle}>
        <div>
          <p style={eyebrowStyle}>Account</p>
          <h1 style={{ margin: "4px 0 0", fontSize: 32, fontWeight: 900, letterSpacing: "-0.03em" }}>My Orders</h1>
          <p style={{ margin: "8px 0 0", color: "#d1d5db", fontSize: 14 }}>
            Clear view of your purchases, delivery mode, payment method, and status.
          </p>
        </div>
        <Link href="/product-page" style={continueBtnStyle}>
          Continue Shopping
        </Link>
      </div>

      <section style={{ marginTop: 18, display: "grid", gap: 14 }}>
        {loading && (
          <div style={noticeCardStyle}>
            <p style={{ margin: 0, fontSize: 13 }}>Loading your orders...</p>
          </div>
        )}

        {error && (
          <div style={noticeCardStyle}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
              <span style={{ color: "#dc2626", fontSize: 13 }}>{error}</span>
              <button onClick={refetch} style={retryBtnStyle}>
                Retry
              </button>
            </div>
          </div>
        )}

        {!loading && !error && orders.length === 0 && (
          <div style={noticeCardStyle}>
            <p style={{ margin: 0, fontWeight: 700, fontSize: 15 }}>You have not placed any orders yet.</p>
            <p style={{ margin: "6px 0 0", color: "var(--text-muted)", fontSize: 13 }}>
              Add items to your bag and checkout to see them listed here.
            </p>
          </div>
        )}

        {orders.map((order) => {
          const tone = statusTone(order.status);
          return (
            <article key={order.id} style={{ ...orderCardStyle, borderColor: tone.border }}>
              <div style={orderHeaderStyle}>
                <div style={{ minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: 12, color: "var(--text-dim)", fontWeight: 700 }}>ORDER ID</p>
                  <p style={{ margin: "2px 0 0", fontSize: 14, fontWeight: 800, wordBreak: "break-all" }}>{order.id}</p>
                  <p style={{ margin: "6px 0 0", fontSize: 12, color: "var(--text-muted)" }}>{new Date(order.createdAt).toLocaleString()}</p>
                </div>
                <span style={{ ...statusPillStyle, background: tone.bg, color: tone.fg, borderColor: tone.border }}>{order.status}</span>
              </div>

              <div style={metaGridStyle}>
                <div style={metaCardStyle}>
                  <p style={metaLabelStyle}>Delivery Mode</p>
                  <p style={metaValueStyle}>{order.deliveryMode}</p>
                </div>
                <div style={metaCardStyle}>
                  <p style={metaLabelStyle}>Payment</p>
                  <p style={metaValueStyle}>{order.paymentMethod.replaceAll("_", " ")}</p>
                </div>
                <div style={metaCardStyle}>
                  <p style={metaLabelStyle}>Total Items</p>
                  <p style={metaValueStyle}>{order.totalItems}</p>
                </div>
                <div style={metaCardStyle}>
                  <p style={metaLabelStyle}>Total</p>
                  <p style={metaValueStyle}>{currency(order.total)}</p>
                </div>
              </div>

              <div style={{ marginTop: 12, display: "grid", gap: 9 }}>
                {order.items.map((item) => (
                  <div key={item.id} style={itemCardStyle}>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 800 }}>{item.name}</p>
                      <p style={{ margin: "3px 0 0", color: "var(--text-dim)", fontSize: 11 }}>
                        SKU: {item.sku} | Quantity: {item.quantity}
                      </p>
                    </div>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 800, color: "var(--brand-red)" }}>{currency(item.lineTotal)}</p>
                  </div>
                ))}
              </div>
            </article>
          );
        })}
      </section>
    </main>
  );
}

const pageStyle: CSSProperties = {
  maxWidth: 1120,
  margin: "0 auto",
  padding: "28px 20px 40px",
  fontFamily: "'Plus Jakarta Sans', sans-serif",
};

const headerStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: 12,
  flexWrap: "wrap",
  border: "1px solid #1f2937",
  borderRadius: 16,
  padding: 16,
  background: "linear-gradient(135deg, #111827 0%, #1f2937 62%, #374151 100%)",
  color: "#f9fafb",
};

const eyebrowStyle: CSSProperties = {
  margin: 0,
  color: "#fca5a5",
  textTransform: "uppercase",
  letterSpacing: "0.12em",
  fontSize: 11,
  fontWeight: 800,
};

const continueBtnStyle: CSSProperties = {
  textDecoration: "none",
  border: "1px solid #4b5563",
  background: "#111827",
  color: "#f9fafb",
  borderRadius: 10,
  padding: "10px 14px",
  fontSize: 13,
  fontWeight: 800,
};

const noticeCardStyle: CSSProperties = {
  border: "1px solid #d1d5db",
  borderRadius: 14,
  background: "var(--surface)",
  padding: 16,
};

const retryBtnStyle: CSSProperties = {
  border: "1px solid #d1d5db",
  borderRadius: 8,
  background: "#f3f4f6",
  color: "#111827",
  padding: "7px 11px",
  cursor: "pointer",
  fontWeight: 800,
};

const orderCardStyle: CSSProperties = {
  border: "1px solid #d1d5db",
  borderRadius: 14,
  background: "var(--surface)",
  padding: 14,
  display: "grid",
  gap: 10,
  boxShadow: "0 8px 24px rgba(0,0,0,0.04)",
};

const orderHeaderStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: 12,
  flexWrap: "wrap",
  paddingBottom: 10,
  borderBottom: "1px solid #d1d5db",
};

const statusPillStyle: CSSProperties = {
  border: "1px solid",
  borderRadius: 999,
  padding: "5px 11px",
  fontSize: 12,
  fontWeight: 700,
};

const metaGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
  gap: 10,
};

const metaCardStyle: CSSProperties = {
  border: "1px solid #d1d5db",
  borderRadius: 10,
  background: "#f9fafb",
  padding: "9px 10px",
};

const metaLabelStyle: CSSProperties = {
  margin: 0,
  fontSize: 11,
  color: "#374151",
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  fontWeight: 800,
};

const metaValueStyle: CSSProperties = {
  margin: "4px 0 0",
  fontSize: 13,
  fontWeight: 800,
};

const itemCardStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 12,
  border: "1px solid #d1d5db",
  borderRadius: 10,
  padding: "10px 11px",
  background: "var(--background)",
};

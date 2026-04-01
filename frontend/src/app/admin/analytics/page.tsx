"use client";

import type { CSSProperties } from "react";
import { useAnalytics } from "@/hooks/useAnalytics";

const currency = (value: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(value);

const monthLabel = (key: string) => {
  const [year, month] = key.split("-").map(Number);
  const date = new Date(year, (month || 1) - 1, 1);
  return date.toLocaleString("en-US", { month: "short", year: "2-digit" });
};

export default function AnalyticsPage() {
  const { analytics, loading, error, refetch } = useAnalytics();

  const maxRevenue = Math.max(...(analytics?.monthly.map((m) => m.revenue) ?? [1]), 1);

  return (
    <div style={{ padding: 28, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, letterSpacing: "-0.02em" }}>Analytics</h1>
      <p style={{ marginTop: 6, color: "var(--text-muted)", fontSize: 13 }}>
        Real-time business metrics based on current database records.
      </p>

      {loading && <p style={{ marginTop: 18 }}>Loading analytics...</p>}
      {error && (
        <div style={{ marginTop: 16, color: "#dc2626", display: "flex", alignItems: "center", gap: 10 }}>
          <span>{error}</span>
          <button
            onClick={refetch}
            style={{ border: "1px solid var(--border)", background: "var(--surface)", borderRadius: 8, padding: "6px 10px", cursor: "pointer" }}
          >
            Retry
          </button>
        </div>
      )}

      {analytics && (
        <>
          <div
            style={{
              marginTop: 20,
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 12,
            }}
          >
            <StatCard label="Total Revenue" value={currency(analytics.revenue.gross)} sub="Non-cancelled orders" />
            <StatCard label="Delivered Revenue" value={currency(analytics.revenue.deliveredRevenue)} sub="Delivered orders only" />
            <StatCard label="Average Order Value" value={currency(analytics.revenue.averageOrderValue)} sub="Across all orders" />
            <StatCard label="Total Orders" value={String(analytics.totals.orders)} sub={`${analytics.totals.pendingOrders} pending`} />
            <StatCard label="Users" value={String(analytics.totals.users)} sub={`${analytics.totals.customers} customers · ${analytics.totals.admins} admins`} />
            <StatCard label="Catalog" value={`${analytics.totals.products} products`} sub={`${analytics.totals.categories} categories`} />
            <StatCard label="Discounts" value={String(analytics.totals.discounts)} sub={`${analytics.totals.activeDiscounts} active`} />
            <StatCard
              label="Open Carts"
              value={String(analytics.totals.cartsWithItems)}
              sub={`${analytics.carts.itemsInOpenCarts} items · ${currency(analytics.carts.estimatedOpenCartValue)}`}
            />
          </div>

          <div style={{ marginTop: 20, display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 12 }}>
            <section style={panelStyle}>
              <h2 style={panelTitleStyle}>Monthly Revenue (Last 6 Months)</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(6, minmax(0, 1fr))", gap: 10, alignItems: "end", minHeight: 220 }}>
                {analytics.monthly.map((month) => {
                  const height = Math.max(8, (month.revenue / maxRevenue) * 160);
                  return (
                    <div key={month.month} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                      <div title={currency(month.revenue)} style={{ width: "100%", height, background: "var(--brand-red)", borderRadius: 8, opacity: 0.9 }} />
                      <span style={{ fontSize: 11, color: "var(--text-dim)" }}>{monthLabel(month.month)}</span>
                      <span style={{ fontSize: 11, fontWeight: 700 }}>{currency(month.revenue)}</span>
                    </div>
                  );
                })}
              </div>
            </section>

            <section style={panelStyle}>
              <h2 style={panelTitleStyle}>Top Products by Units Sold</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {analytics.topProducts.length === 0 && <p style={{ margin: 0, color: "var(--text-muted)" }}>No order data yet.</p>}
                {analytics.topProducts.map((product) => (
                  <div key={product.productId} style={{ border: "1px solid var(--border)", borderRadius: 10, padding: 10 }}>
                    <div style={{ fontSize: 13, fontWeight: 800 }}>{product.name}</div>
                    <div style={{ fontSize: 11, color: "var(--text-dim)" }}>{product.sku}</div>
                    <div style={{ marginTop: 6, display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                      <span>{product.unitsSold} units sold</span>
                      <span style={{ fontWeight: 700 }}>{currency(product.revenue)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div style={{ ...panelStyle, minHeight: 108 }}>
      <p style={{ margin: 0, fontSize: 11, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</p>
      <p style={{ margin: "8px 0 4px", fontSize: 24, fontWeight: 900, letterSpacing: "-0.03em" }}>{value}</p>
      <p style={{ margin: 0, fontSize: 12, color: "var(--text-muted)" }}>{sub}</p>
    </div>
  );
}

const panelStyle: CSSProperties = {
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: 14,
  padding: 14,
};

const panelTitleStyle: CSSProperties = {
  margin: "0 0 12px",
  fontSize: 15,
  fontWeight: 800,
  letterSpacing: "-0.01em",
};

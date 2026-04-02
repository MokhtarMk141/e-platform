"use client";

import type { CSSProperties } from "react";
import { useAnalytics } from "@/hooks/useAnalytics";

const currency = (value: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "TND", maximumFractionDigits: 2 }).format(value);

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
            <StatCard label="Realized Profit" value={currency(analytics.revenue.realized)} sub="Delivered orders only" />
            <StatCard label="Potential Revenue" value={currency(analytics.revenue.potential)} sub="All non-cancelled orders" />
            <StatCard label="Average Order Value" value={currency(analytics.revenue.averageOrderValue)} sub="Profit per order" />
            <StatCard label="Total Orders" value={String(analytics.totals.orders)} sub={`${analytics.totals.pendingOrders} pending`} />
            <StatCard label="Users" value={String(analytics.totals.users)} sub={`${analytics.totals.customers} customers`} />
            <StatCard
              label="Open Carts"
              value={String(analytics.totals.cartsWithItems)}
              sub={`${currency(analytics.carts.estimatedOpenCartValue)} potential`}
            />
          </div>

          <div style={{ marginTop: 20, display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 12 }}>
            <section style={panelStyle}>
              <h2 style={panelTitleStyle}>Revenue vs Customer Growth</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(6, minmax(0, 1fr))", gap: 12, alignItems: "end", minHeight: 240, marginTop: 10 }}>
                {analytics.monthly.map((month) => {
                  const barHeight = Math.max(8, (month.revenue / maxRevenue) * 160);
                  return (
                    <div key={month.month} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                      <div style={{ position: "relative", width: "100%", height: barHeight, background: "var(--brand-red)", borderRadius: "6px 6px 0 0", opacity: 0.9 }}>
                        {month.newUsers > 0 && (
                          <div style={{ position: "absolute", top: -20, left: "50%", transform: "translateX(-50%)", fontSize: 10, fontWeight: 800, color: "var(--text-muted)" }}>
                            +{month.newUsers}
                          </div>
                        )}
                      </div>
                      <span style={{ fontSize: 11, color: "var(--text-dim)", fontWeight: 600 }}>{monthLabel(month.month)}</span>
                      <span style={{ fontSize: 11, fontWeight: 700 }}>{currency(month.revenue)}</span>
                    </div>
                  );
                })}
              </div>
            </section>

            <section style={panelStyle}>
              <h2 style={panelTitleStyle}>Order Status Distribution</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {analytics.statusDistribution.map((item) => (
                  <div key={item.status}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 13, fontWeight: 600 }}>
                      <span>{item.status}</span>
                      <span>{item.count}</span>
                    </div>
                    <div style={{ height: 8, background: "var(--surface-hover)", borderRadius: 10, overflow: "hidden" }}>
                      <div
                        style={{
                          height: "100%",
                          width: `${(item.count / analytics.totals.orders) * 100}%`,
                          background: item.status === 'DELIVERED' ? '#16a34a' : item.status === 'CANCELLED' ? '#dc2626' : 'var(--brand-red)'
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            <section style={panelStyle}>
              <h2 style={panelTitleStyle}>Recent Activity</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {analytics.recentOrders.map((order) => (
                  <div key={order.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13, borderBottom: "1px solid var(--border)", paddingBottom: 8 }}>
                    <div>
                      <div style={{ fontWeight: 700 }}>{order.customerName || "Guest"}</div>
                      <div style={{ fontSize: 11, color: "var(--text-dim)" }}>{new Date(order.createdAt).toLocaleDateString()}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontWeight: 800 }}>{currency(order.total)}</div>
                      <div style={{ fontSize: 10, color: "var(--brand-red)", fontWeight: 700 }}>{order.status}</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section style={panelStyle}>
              <h2 style={panelTitleStyle}>Category Performance</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {analytics.categorySales.map((cat) => (
                  <div key={cat.categoryId} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13 }}>
                    <div style={{ fontWeight: 600 }}>{cat.name}</div>
                    <div style={{ textAlign: "right", fontWeight: 700 }}>{currency(cat.revenue)}</div>
                  </div>
                ))}
              </div>
            </section>

            <section style={{ ...panelStyle, borderColor: analytics.lowStockProducts.length > 0 ? "rgba(255,40,0,0.3)" : "var(--border)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <h2 style={{ ...panelTitleStyle, margin: 0 }}>Stock Alerts</h2>
                {analytics.lowStockProducts.length > 0 && (
                  <span style={{ fontSize: 10, padding: "2px 6px", background: "rgba(255,40,0,0.1)", color: "var(--brand-red)", borderRadius: 4, fontWeight: 800 }}>
                    {analytics.lowStockProducts.length} LOW
                  </span>
                )}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {analytics.lowStockProducts.length === 0 && <p style={{ fontSize: 13, color: "var(--text-muted)" }}>All systems normal.</p>}
                {analytics.lowStockProducts.map((p) => (
                  <div key={p.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, alignItems: "center" }}>
                    <div style={{ fontWeight: 600, maxWidth: "160px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</div>
                    <div style={{ color: p.stock <= 2 ? "var(--brand-red)" : "orange", fontWeight: 800 }}>{p.stock} left</div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <section style={{ ...panelStyle, marginTop: 12 }}>
            <h2 style={panelTitleStyle}>Top Selling Products</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
              {analytics.topProducts.map((product) => (
                <div key={product.productId} style={{ border: "1px solid var(--border)", borderRadius: 10, padding: 12, background: "var(--background)" }}>
                  <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 4 }}>{product.name}</div>
                  <div style={{ fontSize: 11, color: "var(--text-dim)", marginBottom: 8 }}>{product.sku}</div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, borderTop: "1px solid var(--border)", paddingTop: 8 }}>
                    <span style={{ color: "var(--text-muted)" }}>{product.unitsSold} units sold</span>
                    <span style={{ fontWeight: 800, color: "var(--foreground)" }}>{currency(product.revenue)}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
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

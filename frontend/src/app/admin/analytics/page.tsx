"use client";

import { useState, useEffect } from "react";
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
  const [performanceMetric, setPerformanceMetric] = useState<"revenue" | "orders">("revenue");
  const [hoveredMonth, setHoveredMonth] = useState<string | null>(null);

  const maxRevenue = Math.max(...(analytics?.monthly.map((m) => m.revenue) ?? [1]), 1);

  return (
    <div style={{ padding: 28, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0% { transform: scale(0.95); opacity: 0.5; } 50% { transform: scale(1.05); opacity: 1; } 100% { transform: scale(0.95); opacity: 0.5; } }
        @keyframes slideRight { from { width: 0; } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        
        .fade-in { animation: fadeIn 0.5s ease-out both; }
        .stat-card:hover { 
          transform: translateY(-2px) !important; 
          border-color: var(--border-strong) !important; 
          box-shadow: 0 4px 20px rgba(0,0,0,0.06) !important; 
        }
        .chart-bar:hover { opacity: 1 !important; filter: brightness(1.1); }
        .live-dot { width: 8px; height: 8px; background: #22c55e; border-radius: 50%; display: inline-block; animation: pulse 2s infinite; }
        
        .btn-premium {
          background: var(--brand-red);
          color: #fff;
          border: none;
          box-shadow: 0 4px 14px rgba(255,40,0,0.25);
          transition: all 0.2s;
        }
        .btn-premium:hover {
          background: var(--brand-red-hover);
          transform: translateY(-1px);
          box-shadow: 0 6px 18px rgba(255,40,0,0.32);
        }
        
        .panel {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 20px;
          padding: 20px;
          position: relative;
          overflow: hidden;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .panel:hover {
          border-color: var(--border-strong);
          box-shadow: 0 4px 20px rgba(0,0,0,0.04);
        }
      `}</style>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 900, letterSpacing: "-0.04em" }}>Analytics Command Center</h1>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
            <span className="live-dot" />
            <p style={{ margin: 0, color: "var(--text-muted)", fontSize: 13, fontWeight: 600 }}>Live Store Insights</p>
          </div>
        </div>
        <button
          onClick={refetch}
          className="btn-premium"
          style={{
            padding: "10px 20px",
            borderRadius: 12,
            fontSize: 13,
            fontWeight: 800,
            cursor: "pointer",
          }}
        >
          Refresh Data
        </button>
      </div>

      {loading && (
        <div style={{ marginTop: 40, textAlign: "center" }}>
          <div style={{ border: "3px solid var(--border)", borderTopColor: "var(--brand-red)", width: 40, height: 40, borderRadius: "50%", margin: "0 auto", animation: "spin 1s linear infinite" }} />
          <p style={{ marginTop: 16, fontWeight: 700, color: "var(--text-muted)" }}>Synchronizing metrics...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {error && (
        <div className="fade-in" style={{ marginTop: 16, background: "rgba(220,38,38,0.05)", border: "1px solid rgba(220,38,38,0.2)", borderRadius: 12, padding: 16, display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 20 }}>⚠️</span>
          <span style={{ color: "#dc2626", fontWeight: 700 }}>{error}</span>
        </div>
      )}

      {analytics && (
        <div className="fade-in">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
            <StatCard label="Realized Profit" value={currency(analytics.revenue.realized)} sub="Net revenue from delivered orders" delay="0s" />
            <StatCard label="Potential Revenue" value={currency(analytics.revenue.potential)} sub="All pending and shipped orders" delay="0.1s" />
            <StatCard label="AOV" value={currency(analytics.revenue.averageOrderValue)} sub="Average value per transaction" delay="0.2s" />
            <StatCard label="Total Orders" value={String(analytics.totals.orders)} sub={`${analytics.totals.pendingOrders} awaiting processing`} delay="0.3s" />
            <StatCard label="Active Customers" value={String(analytics.totals.customers)} sub={`From ${analytics.totals.users} total registered`} delay="0.4s" />
            <StatCard label="Cart Value" value={currency(analytics.carts.estimatedOpenCartValue)} sub={`${analytics.totals.cartsWithItems} carts currently active`} delay="0.5s" />
          </div>

          <div style={{ marginTop: 20, display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 12 }}>
            <section className="panel fade-in">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <h2 style={panelTitleStyle}>Revenue vs Customer Growth</h2>
                <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase" }}>Monthly Performance</div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(6, minmax(0, 1fr))", gap: 12, alignItems: "end", minHeight: 240, marginTop: 10, position: "relative" }}>
                {analytics.monthly.map((month) => {
                  const barHeight = Math.max(8, (month.revenue / maxRevenue) * 160);
                  const isHovered = hoveredMonth === month.month;
                  return (
                    <div
                      key={month.month}
                      style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, cursor: "pointer" }}
                      onMouseEnter={() => setHoveredMonth(month.month)}
                      onMouseLeave={() => setHoveredMonth(null)}
                    >
                      <div style={{
                        position: "relative",
                        width: "100%",
                        height: barHeight,
                        background: isHovered ? "var(--foreground)" : "var(--brand-red)",
                        borderRadius: "8px 8px 0 0",
                        opacity: isHovered ? 1 : 0.85,
                        transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)"
                      }}>
                        {isHovered && (
                          <div style={{
                            position: "absolute", top: -40, left: "50%", transform: "translateX(-50%)",
                            background: "var(--foreground)", color: "var(--background)", padding: "4px 8px", borderRadius: 6, fontSize: 11, fontWeight: 900, whiteSpace: "nowrap", zIndex: 10,
                            boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
                          }}>
                            {currency(month.revenue)}
                          </div>
                        )}
                        {month.newUsers > 0 && (
                          <div style={{ position: "absolute", top: -20, left: "50%", transform: "translateX(-50%)", fontSize: 10, fontWeight: 800, color: "var(--text-dim)" }}>
                            +{month.newUsers}
                          </div>
                        )}
                      </div>
                      <span style={{ fontSize: 11, color: isHovered ? "var(--foreground)" : "var(--text-dim)", fontWeight: 800, transition: "color 0.2s" }}>{monthLabel(month.month)}</span>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="panel fade-in">
              <h2 style={panelTitleStyle}>Order Distribution</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {analytics.statusDistribution.map((item, idx) => (
                  <div key={item.status} style={{ animation: `fadeUp 0.3s ease-out ${idx * 0.05}s both` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 13, fontWeight: 800 }}>
                      <span style={{ color: "var(--text-dim)" }}>{item.status}</span>
                      <span style={{ background: "var(--surface-hover)", padding: "2px 8px", borderRadius: 6 }}>{item.count}</span>
                    </div>
                    <div style={{ height: 10, background: "var(--surface-hover)", borderRadius: 10, overflow: "hidden" }}>
                      <div
                        style={{
                          height: "100%",
                          width: `${(item.count / analytics.totals.orders) * 100}%`,
                          background: item.status === 'DELIVERED' ? '#22c55e' : item.status === 'CANCELLED' ? '#ef4444' : 'linear-gradient(90deg, var(--brand-red), #ff7a00)',
                          borderRadius: 10,
                          animation: "slideRight 1s cubic-bezier(0.16, 1, 0.3, 1) both"
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            <section className="panel fade-in">
              <h2 style={panelTitleStyle}>Recent Activity</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {analytics.recentOrders.map((order, idx) => (
                  <div key={order.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13, borderBottom: "1px solid var(--border)", paddingBottom: 10, animation: `fadeUp 0.3s ease-out ${idx * 0.05}s both` }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 800, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{order.customerName || "Anonymous Guest"}</div>
                      <div style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 2 }}>{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {order.deliveryMode}</div>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div style={{ fontWeight: 900, color: "var(--foreground)" }}>{currency(order.total)}</div>
                      <div style={{ fontSize: 10, color: order.status === 'DELIVERED' ? '#22c55e' : "var(--brand-red)", fontWeight: 800, textTransform: "uppercase" }}>{order.status}</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="panel fade-in">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <h2 style={{ ...panelTitleStyle, margin: 0 }}>Performance Toggles</h2>
                <div style={{ display: "flex", background: "var(--background)", padding: 4, borderRadius: 10, border: "1px solid var(--border)" }}>
                  <button onClick={() => setPerformanceMetric("revenue")} style={{ border: "none", background: performanceMetric === "revenue" ? "var(--foreground)" : "transparent", color: performanceMetric === "revenue" ? "var(--background)" : "var(--text-muted)", padding: "4px 8px", borderRadius: 6, fontSize: 10, fontWeight: 800, cursor: "pointer", transition: "all 0.2s" }}>Revenue</button>
                  <button onClick={() => setPerformanceMetric("orders")} style={{ border: "none", background: performanceMetric === "orders" ? "var(--foreground)" : "transparent", color: performanceMetric === "orders" ? "var(--background)" : "var(--text-muted)", padding: "4px 8px", borderRadius: 6, fontSize: 10, fontWeight: 800, cursor: "pointer", transition: "all 0.2s" }}>Orders</button>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {analytics.categorySales.map((cat, idx) => (
                  <div key={cat.categoryId} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13, animation: `fadeUp 0.3s ease-out ${idx * 0.05}s both` }}>
                    <div style={{ fontWeight: 700 }}>{cat.name}</div>
                    <div style={{ textAlign: "right", fontWeight: 900, color: "var(--brand-red)" }}>
                      {performanceMetric === "revenue" ? currency(cat.revenue) : `${cat.count} Sales`}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="panel fade-in" style={{ borderColor: analytics.lowStockProducts.length > 0 ? "rgba(255,40,0,0.4)" : "var(--border)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h2 style={{ ...panelTitleStyle, margin: 0 }}>Stock Vulnerabilities</h2>
                {analytics.lowStockProducts.length > 0 && (
                  <span style={{ fontSize: 10, padding: "4px 10px", background: "#ef4444", color: "#fff", borderRadius: 20, fontWeight: 900, boxShadow: "0 4px 12px rgba(239,68,68,0.2)" }}>
                    {analytics.lowStockProducts.length} CRITICAL
                  </span>
                )}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {analytics.lowStockProducts.length === 0 && (
                  <div style={{ textAlign: "center", padding: "20px 0" }}>
                    <span style={{ fontSize: 24 }}>🛡️</span>
                    <p style={{ fontSize: 13, color: "var(--text-muted)", margin: "8px 0 0", fontWeight: 700 }}>Inventory Secured.</p>
                  </div>
                )}
                {analytics.lowStockProducts.map((p) => (
                  <div key={p.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, alignItems: "center", padding: "8px 0", borderBottom: "1px dashed var(--border)" }}>
                    <div style={{ fontWeight: 700, maxWidth: "150px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</div>
                    <div style={{ color: p.stock <= 2 ? "#ef4444" : "#f97316", fontWeight: 900, fontSize: 12, padding: "2px 8px", background: "var(--surface-hover)", borderRadius: 6 }}>{p.stock} Unit{p.stock !== 1 ? 's' : ''}</div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <section className="panel fade-in" style={{ marginTop: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={panelTitleStyle}>Top Performing Assets</h2>
              <div style={{ fontSize: 11, fontWeight: 800, color: "var(--text-dim)", textTransform: "uppercase" }}>Best Sellers</div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
              {analytics.topProducts.map((product, idx) => (
                <div key={product.productId} className="panel" style={{ padding: 16, background: "var(--background)", animation: `fadeUp 0.4s ease-out ${idx * 0.1}s both`, cursor: "pointer" }} onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--brand-red)'} onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border)'}>
                  <div style={{ fontSize: 14, fontWeight: 900, marginBottom: 4, letterSpacing: "-0.01em" }}>{product.name}</div>
                  <div style={{ fontSize: 11, color: "var(--text-dim)", marginBottom: 12, fontWeight: 600 }}>SKU: {product.sku}</div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", borderTop: "1px solid var(--border)", paddingTop: 12 }}>
                    <div>
                      <span style={{ fontSize: 10, color: "var(--text-dim)", textTransform: "uppercase", fontWeight: 800 }}>Sold</span>
                      <div style={{ fontSize: 16, fontWeight: 900 }}>{product.unitsSold}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <span style={{ fontSize: 10, color: "var(--text-dim)", textTransform: "uppercase", fontWeight: 800 }}>Revenue</span>
                      <div style={{ fontSize: 16, fontWeight: 900, color: "var(--brand-red)" }}>{currency(product.revenue)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, sub, delay }: { label: string; value: string; sub: string; delay: string }) {
  return (
    <div className="panel stat-card" style={{ minHeight: 115, animation: `fadeIn 0.6s ease-out ${delay} both`, cursor: "default" }}>
      <p style={{ margin: 0, fontSize: 11, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 800 }}>{label}</p>
      <p style={{ margin: "12px 0 6px", fontSize: 26, fontWeight: 900, letterSpacing: "-0.05em", color: "var(--foreground)" }}>{value}</p>
      <p style={{ margin: 0, fontSize: 11, color: "var(--text-muted)", fontWeight: 500 }}>{sub}</p>
    </div>
  );
}

const panelTitleStyle: CSSProperties = {
  margin: "0 0 16px",
  fontSize: 16,
  fontWeight: 900,
  letterSpacing: "-0.02em",
  color: "var(--foreground)",
};

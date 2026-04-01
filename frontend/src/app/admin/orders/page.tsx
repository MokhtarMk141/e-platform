"use client";

import type { CSSProperties } from "react";
import { useMemo, useState } from "react";
import { useOrders } from "@/hooks/useOrders";
import { OrderService } from "@/services/order.service";
import type { Order } from "@/types/order.types";
import { OrderStatus } from "@/types/order.types";
import OrderDetailSidebar from "@/components/admin/OrderDetailSidebar";

const STATUS_OPTIONS: OrderStatus[] = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];

const statusColor = (status: OrderStatus) => {
  if (status === "DELIVERED") return { bg: "rgba(34,197,94,0.12)", fg: "#16a34a" };
  if (status === "SHIPPED") return { bg: "rgba(37,99,235,0.12)", fg: "#2563eb" };
  if (status === "PROCESSING") return { bg: "rgba(234,179,8,0.12)", fg: "#ca8a04" };
  if (status === "CANCELLED") return { bg: "rgba(239,68,68,0.12)", fg: "#dc2626" };
  return { bg: "rgba(107,114,128,0.12)", fg: "#6b7280" };
};

const currency = (value: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(value);

/* ── Initials from name ── */
const getInitials = (name: string | null) => {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

/* ── Generate stable color from string ── */
const nameToColor = (name: string | null) => {
  if (!name) return "#6b7280";
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 55%, 50%)`;
};

export default function AdminOrdersPage() {
  const { orders, loading, error, refetch } = useOrders(true);
  const [savingOrderId, setSavingOrderId] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const stats = useMemo(() => {
    const totalRevenue = orders
      .filter((order) => order.status !== "CANCELLED")
      .reduce((sum, order) => sum + order.total, 0);
    const pending = orders.filter((order) => order.status === "PENDING").length;
    const delivered = orders.filter((order) => order.status === "DELIVERED").length;
    return { totalRevenue, pending, delivered };
  }, [orders]);

  const handleStatusChange = async (orderId: string, status: OrderStatus) => {
    try {
      setSavingOrderId(orderId);
      await OrderService.updateStatus(orderId, status);
      await refetch();
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "message" in err && typeof (err as { message?: unknown }).message === "string"
          ? (err as { message: string }).message
          : "Failed to update order status";
      alert(message);
    } finally {
      setSavingOrderId(null);
    }
  };

  const handleRowClick = (order: Order) => {
    setSelectedOrder(order);
    setSidebarOpen(true);
  };

  const handleCloseSidebar = () => {
    setSidebarOpen(false);
    // Delay clearing selected order until animation finishes
    setTimeout(() => setSelectedOrder(null), 500);
  };

  return (
    <div style={{ padding: 28, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, letterSpacing: "-0.02em" }}>Orders</h1>
      <p style={{ marginTop: 6, color: "var(--text-muted)", fontSize: 13 }}>Manage customer orders and status updates.</p>

      <div style={{ marginTop: 18, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
        <StatCard label="Total Orders" value={String(orders.length)} sub={`${stats.pending} pending`} />
        <StatCard label="Delivered Orders" value={String(stats.delivered)} sub="Completed deliveries" />
        <StatCard label="Revenue" value={currency(stats.totalRevenue)} sub="Excluding cancelled" />
      </div>

      <div style={{ marginTop: 16, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, overflow: "auto" }}>
        {loading ? (
          <p style={{ padding: 16, margin: 0 }}>Loading orders...</p>
        ) : error ? (
          <div style={{ padding: 16, display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ color: "#dc2626" }}>{error}</span>
            <button onClick={refetch} style={btnSecondaryStyle}>Retry</button>
          </div>
        ) : orders.length === 0 ? (
          <p style={{ padding: 16, margin: 0, color: "var(--text-muted)" }}>No orders yet.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 980 }}>
            <thead>
              <tr style={{ background: "var(--background)", borderBottom: "1px solid var(--border)" }}>
                <th style={thStyle}>Order</th>
                <th style={thStyle}>Customer</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Total</th>
                <th style={thStyle}>Date</th>
                <th style={thStyle}>Update</th>
                <th style={{ ...thStyle, width: 40 }}></th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const tone = statusColor(order.status);
                const isSelected = selectedOrder?.id === order.id && sidebarOpen;
                return (
                  <tr
                    key={order.id}
                    onClick={() => handleRowClick(order)}
                    style={{
                      borderBottom: "1px solid var(--border)",
                      cursor: "pointer",
                      background: isSelected ? "var(--surface-hover)" : "transparent",
                      transition: "background 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) (e.currentTarget as HTMLTableRowElement).style.background = "var(--surface-hover)";
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) (e.currentTarget as HTMLTableRowElement).style.background = "transparent";
                    }}
                  >
                    {/* Order ID */}
                    <td style={tdStyle}>
                      <span style={{ fontWeight: 700, fontSize: 13 }}>#{order.id.slice(0, 8)}</span>
                    </td>

                    {/* Customer */}
                    <td style={tdStyle}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        {/* Avatar */}
                        <div
                          style={{
                            width: 34,
                            height: 34,
                            borderRadius: "50%",
                            background: `linear-gradient(135deg, ${nameToColor(order.customerName)}, ${nameToColor(order.customerName)}88)`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#fff",
                            fontSize: 12,
                            fontWeight: 800,
                            fontFamily: "'Plus Jakarta Sans', sans-serif",
                            flexShrink: 0,
                          }}
                        >
                          {getInitials(order.customerName)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 13 }}>{order.customerName || "Unknown"}</div>
                          {order.customerEmail && (
                            <div style={{ color: "var(--text-dim)", fontSize: 11, marginTop: 1 }}>
                              {order.customerEmail}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Status */}
                    <td style={tdStyle}>
                      <span style={{ background: tone.bg, color: tone.fg, padding: "4px 10px", borderRadius: 999, fontSize: 12, fontWeight: 700 }}>
                        {order.status}
                      </span>
                    </td>

                    {/* Total */}
                    <td style={{ ...tdStyle, fontWeight: 700, fontSize: 13 }}>{currency(order.total)}</td>

                    {/* Date */}
                    <td style={tdStyle}>
                      <span style={{ fontSize: 13, color: "var(--text-muted)" }}>
                        {new Date(order.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </span>
                    </td>

                    {/* Update Status */}
                    <td style={tdStyle} onClick={(e) => e.stopPropagation()}>
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                        disabled={savingOrderId === order.id}
                        style={{
                          padding: "7px 10px",
                          borderRadius: 8,
                          border: "1px solid var(--border)",
                          background: "var(--background)",
                          color: "var(--foreground)",
                          fontSize: 12,
                          cursor: "pointer",
                        }}
                      >
                        {STATUS_OPTIONS.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* More icon */}
                    <td style={{ ...tdStyle, textAlign: "center" }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-dim)" strokeWidth="2" strokeLinecap="round">
                        <circle cx="12" cy="5" r="1" />
                        <circle cx="12" cy="12" r="1" />
                        <circle cx="12" cy="19" r="1" />
                      </svg>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Order Detail Sidebar ── */}
      <OrderDetailSidebar
        order={selectedOrder}
        isOpen={sidebarOpen}
        onClose={handleCloseSidebar}
      />
    </div>
  );
}

function StatCard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 14 }}>
      <p style={{ margin: 0, fontSize: 11, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</p>
      <p style={{ margin: "8px 0 4px", fontSize: 22, fontWeight: 900, letterSpacing: "-0.03em" }}>{value}</p>
      <p style={{ margin: 0, fontSize: 12, color: "var(--text-muted)" }}>{sub}</p>
    </div>
  );
}

const thStyle: CSSProperties = {
  padding: "10px 14px",
  textAlign: "left",
  fontSize: 11,
  fontWeight: 700,
  color: "var(--text-dim)",
  textTransform: "uppercase",
  letterSpacing: "0.06em",
};

const tdStyle: CSSProperties = {
  padding: "12px 14px",
  fontSize: 13,
  verticalAlign: "middle",
};

const btnSecondaryStyle: CSSProperties = {
  border: "1px solid var(--border)",
  borderRadius: 8,
  background: "var(--background)",
  padding: "6px 10px",
  cursor: "pointer",
};

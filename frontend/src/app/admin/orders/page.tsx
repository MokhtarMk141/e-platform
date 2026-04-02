"use client";

import type { CSSProperties } from "react";
import { useMemo, useState } from "react";
import { useOrders } from "@/hooks/useOrders";
import { OrderService } from "@/services/order.service";
import type { Order } from "@/types/order.types";
import { OrderStatus } from "@/types/order.types";
import OrderDetailSidebar from "@/components/admin/OrderDetailSidebar";

const statusColor = (status: OrderStatus) => {
  if (status === "DELIVERED") return { bg: "rgba(34,197,94,0.10)", fg: "#16a34a", border: "rgba(34,197,94,0.2)" };
  if (status === "SHIPPED") return { bg: "rgba(37,99,235,0.10)", fg: "#2563eb", border: "rgba(37,99,235,0.2)" };
  if (status === "PROCESSING") return { bg: "rgba(234,179,8,0.10)", fg: "#ca8a04", border: "rgba(234,179,8,0.2)" };
  if (status === "CANCELLED") return { bg: "rgba(239,68,68,0.10)", fg: "#dc2626", border: "rgba(239,68,68,0.2)" };
  return { bg: "rgba(107,114,128,0.10)", fg: "#6b7280", border: "rgba(107,114,128,0.15)" };
};

const currency = (value: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "TND", maximumFractionDigits: 2 }).format(value);

const getInitials = (name: string | null) => {
  if (!name) return "?";
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
};

const nameToColor = (name: string | null) => {
  if (!name) return "#6b7280";
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 60%, 45%)`;
};

export default function AdminOrdersPage() {
  const { orders, loading, error, refetch } = useOrders(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const stats = useMemo(() => {
    const totalRevenue = orders
      .filter((order) => order.status !== "CANCELLED")
      .reduce((sum, order) => sum + order.total, 0);
    const pending = orders.filter((order) => order.status === "PENDING").length;
    const delivered = orders.filter((order) => order.status === "DELIVERED").length;
    return { totalRevenue, pending, delivered };
  }, [orders]);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchStatus = statusFilter === "All" || order.status === statusFilter;
      const s = search.toLowerCase();
      const matchSearch =
        search === "" ||
        order.id.toLowerCase().includes(s) ||
        (order.customerName && order.customerName.toLowerCase().includes(s)) ||
        (order.customerEmail && order.customerEmail.toLowerCase().includes(s)) ||
        (order.customerPhone && order.customerPhone.toLowerCase().includes(s)) ||
        (order.shippingCity && order.shippingCity.toLowerCase().includes(s)) ||
        (order.shippingCountry && order.shippingCountry.toLowerCase().includes(s));
      return matchStatus && matchSearch;
    });
  }, [orders, search, statusFilter]);

  const handleStatusChange = async (orderId: string, status: OrderStatus) => {
    try {
      await OrderService.updateStatus(orderId, status);
      await refetch();
      setSelectedOrder((prev) => (prev && prev.id === orderId ? { ...prev, status } : prev));
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "message" in err && typeof (err as { message?: unknown }).message === "string"
          ? (err as { message: string }).message
          : "Failed to update order status";
      alert(message);
    }
  };

  const handleRowClick = (order: Order) => {
    setSelectedOrder(order);
    setSidebarOpen(true);
  };

  const handleCloseSidebar = () => {
    setSidebarOpen(false);
    setTimeout(() => setSelectedOrder(null), 500);
  };

  return (
    <div style={{ padding: 32, fontFamily: "'Plus Jakarta Sans', sans-serif", background: "var(--background)", minHeight: "100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');

        .page-header { margin-bottom: 28px; }
        .page-title { font-size: 28px; fontWeight: 900; letter-spacing: -0.04em; margin: 0; color: var(--foreground); }
        .page-sub { font-size: 13.5px; color: var(--text-muted); margin-top: 6px; font-weight: 500; }

        .stat-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 18px;
          padding: 22px 24px;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          cursor: default;
        }
        .stat-card:hover {
          transform: translateY(-2px);
          border-color: var(--border-strong);
          box-shadow: 0 4px 20px rgba(0,0,0,0.06);
        }
        .stat-label { font-size: 11px; font-weight: 800; color: var(--text-dim); text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 8px; }
        .stat-value { font-size: 26px; font-weight: 900; letter-spacing: -0.04em; color: var(--foreground); margin: 0; }
        .stat-sub { font-size: 12px; color: var(--text-muted); margin-top: 4px; font-weight: 600; }

        .toolbar { display: flex; gap: 12px; flex-wrap: wrap; align-items: center; margin: 32px 0 20px; }
        
        .search-input {
          flex: 1; min-width: 280px;
          padding: 11px 16px; border-radius: 12px;
          border: 1px solid var(--border); background: var(--surface);
          font-size: 14px; font-family: inherit; font-weight: 500;
          outline: none; transition: all 0.2s;
        }
        .search-input:focus {
          border-color: var(--brand-red);
          box-shadow: 0 0 0 4px rgba(255,40,0,0.08);
        }

        .filter-select {
          padding: 11px 16px; border-radius: 12px;
          border: 1px solid var(--border); background: var(--surface);
          font-size: 14px; font-family: inherit; font-weight: 600;
          cursor: pointer; outline: none; transition: all 0.2s;
        }
        .filter-select:focus {
          border-color: var(--brand-red);
        }

        .table-wrap {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0,0,0,0.02);
        }
        table { width: 100%; border-collapse: collapse; min-width: 850px; }
        thead { background: var(--background); border-bottom: 1px solid var(--border); }
        th {
          padding: 14px 20px; text-align: left;
          font-size: 11.5px; font-weight: 800; color: var(--text-dim);
          text-transform: uppercase; letter-spacing: 0.08em;
        }
        tbody tr { transition: all 0.2s; cursor: pointer; }
        tbody tr:hover { background: var(--surface-hover); }
        tbody tr:last-child { border: none; }
        td { padding: 16px 20px; border-bottom: 1px solid var(--border); vertical-align: middle; }

        .status-badge {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 5px 12px; border-radius: 999px;
          font-size: 11.5px; font-weight: 900; letter-spacing: 0.02em;
          border: 1.5px solid transparent;
        }

        .avatar {
          width: 38px; height: 38px; border-radius: 50%;
          display: flex; alignItems: center; justifyContent: center;
          color: #fff; fontSize: 13px; fontWeight: 900; flex-shrink: 0;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .btn-retry {
          background: var(--brand-red); color: #fff;
          border: none; padding: 8px 16px; border-radius: 10px;
          font-weight: 800; font-size: 13px; cursor: pointer;
          box-shadow: 0 4px 12px rgba(255,40,0,0.2);
          transition: all 0.2s;
        }
        .btn-retry:hover { transform: translateY(-1px); box-shadow: 0 6px 16px rgba(255,40,0,0.3); }
      `}</style>

      <div className="page-header">
        <h1 className="page-title">Orders Command Center</h1>
        <p className="page-sub">Monitor transactions, manage fulfillment, and track customer engagement.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
        <div className="stat-card">
          <p className="stat-label">Volume</p>
          <p className="stat-value">{orders.length}</p>
          <p className="stat-sub">{stats.pending} Awaiting Fulfillment</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Throughput</p>
          <p className="stat-value" style={{ color: "#16a34a" }}>{stats.delivered}</p>
          <p className="stat-sub">Delivered Transactions</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Gross Revenue</p>
          <p className="stat-value" style={{ color: "var(--brand-red)" }}>{currency(stats.totalRevenue)}</p>
          <p className="stat-sub">Realized Performance</p>
        </div>
      </div>

      <div className="toolbar">
        <input
          className="search-input"
          placeholder="Filter by Order ID, Customer, Phone, or Location..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="filter-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="All">All Transactions</option>
          <option value="PENDING">Pending</option>
          <option value="PROCESSING">Processing</option>
          <option value="SHIPPED">Shipped</option>
          <option value="DELIVERED">Delivered</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
        <div style={{ marginLeft: "auto", fontSize: 13, color: "var(--text-muted)", fontWeight: 700 }}>
          {filteredOrders.length} Match{filteredOrders.length !== 1 ? "es" : ""}
        </div>
      </div>

      <div className="table-wrap">
        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)", fontWeight: 700 }}>Synchronizing orders...</div>
        ) : error ? (
          <div style={{ padding: 40, textAlign: "center" }}>
            <p style={{ color: "#dc2626", fontWeight: 800, marginBottom: 16 }}>{error}</p>
            <button onClick={refetch} className="btn-retry">Retry Connection</button>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div style={{ padding: 60, textAlign: "center", color: "var(--text-muted)" }}>
            <span style={{ fontSize: 40 }}>🔎</span>
            <p style={{ fontWeight: 800, fontSize: 16, margin: "16px 0 4px", color: "var(--foreground)" }}>No results found</p>
            <p style={{ fontWeight: 500, fontSize: 14 }}>Try adjusting your search query or filters.</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Reference</th>
                <th>Customer Entity</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Total Amount</th>
                <th>Transaction Date</th>
                <th style={{ width: 40 }}></th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => {
                const tone = statusColor(order.status);
                const isSelected = selectedOrder?.id === order.id && sidebarOpen;
                return (
                  <tr
                    key={order.id}
                    onClick={() => handleRowClick(order)}
                    style={{ background: isSelected ? "var(--surface-hover)" : "transparent" }}
                  >
                    <td>
                      <span style={{ fontWeight: 800, fontSize: 14, color: isSelected ? "var(--brand-red)" : "var(--foreground)" }}>#{order.id.slice(0, 8).toUpperCase()}</span>
                    </td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div className="avatar" style={{ background: `linear-gradient(135deg, ${nameToColor(order.customerName)}, ${nameToColor(order.customerName)}aa)` }}>
                          {getInitials(order.customerName)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 800, fontSize: 14 }}>{order.customerName || "Anonymous Client"}</div>
                          <div style={{ color: "var(--text-dim)", fontSize: 11, fontWeight: 600, marginTop: 2 }}>{order.customerEmail || "No Email Provided"}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="status-badge" style={{ backgroundColor: tone.bg, color: tone.fg, borderColor: tone.border }}>
                        <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: tone.fg }} />
                        {order.status}
                      </span>
                    </td>
                    <td style={{ textAlign: "right", fontWeight: 900, fontSize: 15, color: "var(--foreground)" }}>{currency(order.total)}</td>
                    <td>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-dim)" }}>
                        {new Date(order.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                        {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-dim)" strokeWidth="2.5" strokeLinecap="round" style={{ opacity: 0.5 }}>
                        <circle cx="12" cy="12" r="1" />
                        <circle cx="12" cy="5" r="1" />
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

      <OrderDetailSidebar
        order={selectedOrder}
        isOpen={sidebarOpen}
        onClose={handleCloseSidebar}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}

"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { OrderService } from "@/services/order.service";
import { UserService } from "@/services/user.service";
import type { Order } from "@/types/order.types";
import { OrderStatus } from "@/types/order.types";
import type { User } from "@/types/auth.types";
import OrderDetailSidebar from "@/components/admin/OrderDetailSidebar";
import type { CSSProperties } from "react";

const statusColor = (status: OrderStatus) => {
    if (status === "DELIVERED") return { bg: "rgba(34,197,94,0.12)", fg: "#16a34a" };
    if (status === "SHIPPED") return { bg: "rgba(37,99,235,0.12)", fg: "#2563eb" };
    if (status === "PROCESSING") return { bg: "rgba(234,179,8,0.12)", fg: "#ca8a04" };
    if (status === "CANCELLED") return { bg: "rgba(239,68,68,0.12)", fg: "#dc2626" };
    return { bg: "rgba(107,114,128,0.12)", fg: "#6b7280" };
};

const currency = (value: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "TND", maximumFractionDigits: 2 }).format(value);

export default function CustomerOrdersPage() {
    const { id } = useParams();
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>([]);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [ordersRes, userRes] = await Promise.all([
                    OrderService.getOrdersByUserId(id as string),
                    UserService.getById(id as string),
                ]);
                setOrders(ordersRes.data);
                setUser(userRes.data);
            } catch (err: any) {
                setError(err.message || "Failed to fetch data");
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchData();
    }, [id]);

    const stats = useMemo(() => {
        const totalSpent = orders
            .filter((order) => order.status !== "CANCELLED")
            .reduce((sum, order) => sum + order.total, 0);
        const orderCount = orders.length;
        const pending = orders.filter((order) => order.status === "PENDING").length;
        return { totalSpent, orderCount, pending };
    }, [orders]);

    const handleStatusChange = async (orderId: string, status: OrderStatus) => {
        try {
            await OrderService.updateStatus(orderId, status);
            const ordersRes = await OrderService.getOrdersByUserId(id as string);
            setOrders(ordersRes.data);
            setSelectedOrder((prev) => (prev && prev.id === orderId ? { ...prev, status } : prev));
        } catch (err: any) {
            alert(err.message || "Failed to update status");
        }
    };

    const handleRowClick = (order: Order) => {
        setSelectedOrder(order);
        setSidebarOpen(true);
    };

    if (loading) return <div style={{ padding: 40 }}>Loading orders...</div>;

    return (
        <div style={{ padding: 28, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                <button
                    onClick={() => router.back()}
                    style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        padding: 8,
                        display: "flex",
                        alignItems: "center",
                        color: "var(--text-muted)",
                    }}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="15 18 9 12 15 6" />
                    </svg>
                </button>
                <div>
                    <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, letterSpacing: "-0.02em" }}>
                        Order History: <span style={{ color: "var(--brand-red)" }}>{user?.name}</span>
                    </h1>
                    <p style={{ margin: 0, color: "var(--text-muted)", fontSize: 13 }}>{user?.email}</p>
                </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12, marginBottom: 24 }}>
                <StatCard label="Total Orders" value={String(stats.orderCount)} sub={`${stats.pending} pending`} />
                <StatCard label="Total Spent" value={currency(stats.totalSpent)} sub="Non-cancelled" />
            </div>

            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, overflow: "auto" }}>
                {error ? (
                    <p style={{ padding: 16, color: "#dc2626" }}>{error}</p>
                ) : orders.length === 0 ? (
                    <p style={{ padding: 24, textAlign: "center", color: "var(--text-muted)" }}>This customer has no orders yet.</p>
                ) : (
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                            <tr style={{ background: "var(--background)", borderBottom: "1px solid var(--border)" }}>
                                <th style={thStyle}>Order ID</th>
                                <th style={thStyle}>Status</th>
                                <th style={thStyle}>Total</th>
                                <th style={thStyle}>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((order) => {
                                const tone = statusColor(order.status);
                                return (
                                    <tr
                                        key={order.id}
                                        onClick={() => handleRowClick(order)}
                                        style={{
                                            borderBottom: "1px solid var(--border)",
                                            cursor: "pointer",
                                            transition: "background 0.2s",
                                        }}
                                        onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface-hover)")}
                                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                                    >
                                        <td style={tdStyle}>
                                            <span style={{ fontWeight: 700, fontSize: 13 }}>#{order.id.slice(0, 8)}</span>
                                        </td>
                                        <td style={tdStyle}>
                                            <span style={{ background: tone.bg, color: tone.fg, padding: "4px 10px", borderRadius: 999, fontSize: 12, fontWeight: 700 }}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td style={{ ...tdStyle, fontWeight: 700, fontSize: 13 }}>{currency(order.total)}</td>
                                        <td style={tdStyle}>
                                            <span style={{ fontSize: 13, color: "var(--text-muted)" }}>
                                                {new Date(order.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                            </span>
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
                onClose={() => setSidebarOpen(false)}
                onStatusChange={handleStatusChange}
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

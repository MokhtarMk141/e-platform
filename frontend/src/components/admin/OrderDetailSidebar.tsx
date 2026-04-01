"use client";

import type { CSSProperties } from "react";
import { useEffect, useState } from "react";
import type { Order } from "@/types/order.types";

interface OrderDetailSidebarProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

const statusColor = (status: string) => {
  if (status === "DELIVERED") return { bg: "rgba(34,197,94,0.15)", fg: "#22c55e" };
  if (status === "SHIPPED") return { bg: "rgba(59,130,246,0.15)", fg: "#3b82f6" };
  if (status === "PROCESSING") return { bg: "rgba(234,179,8,0.15)", fg: "#eab308" };
  if (status === "CANCELLED") return { bg: "rgba(239,68,68,0.15)", fg: "#ef4444" };
  return { bg: "rgba(107,114,128,0.15)", fg: "#9ca3af" }; // PENDING
};

const currency = (value: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(value);

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

const formatTime = (dateStr: string) => {
  const d = new Date(dateStr);
  return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
};

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

export default function OrderDetailSidebar({ order, isOpen, onClose }: OrderDetailSidebarProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  if (!mounted) return null;

  const tone = order ? statusColor(order.status) : { bg: "", fg: "" };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(0, 0, 0, 0.45)",
          backdropFilter: "blur(6px)",
          zIndex: 999,
          opacity: isOpen ? 1 : 0,
          visibility: isOpen ? "visible" : "hidden",
          transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      />

      {/* Sidebar Panel */}
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: 400,
          maxWidth: "100vw",
          backgroundColor: "var(--background)",
          borderLeft: "1px solid var(--border)",
          zIndex: 1000,
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
          display: "flex",
          flexDirection: "column",
          boxShadow: "-16px 0 48px rgba(0,0,0,0.15)",
        }}
      >
        {order && (
          <>
            {/* ── Header ── */}
            <div style={headerStyle}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                  <h2 style={titleStyle}>Order #{order.id.slice(0, 8)}</h2>
                  <button onClick={onClose} style={closeButtonStyle} aria-label="Close sidebar">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span
                    style={{
                      background: tone.bg,
                      color: tone.fg,
                      padding: "3px 10px",
                      borderRadius: 999,
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: "0.02em",
                    }}
                  >
                    {order.status}
                  </span>
                  <span style={{ fontSize: 12, color: "var(--text-dim)" }}>
                    {formatDate(order.createdAt)}, {formatTime(order.createdAt)}
                  </span>
                </div>
              </div>
            </div>

            {/* ── Scrollable content ── */}
            <div style={{ flex: 1, overflowY: "auto", padding: "0 24px 24px" }}>
              {/* ── Customer Card ── */}
              <div style={customerCardStyle}>
                {/* Avatar */}
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: "50%",
                    background: `linear-gradient(135deg, ${nameToColor(order.customerName)}, ${nameToColor(order.customerName)}88)`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    fontSize: 22,
                    fontWeight: 800,
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    letterSpacing: "-0.02em",
                    boxShadow: `0 4px 16px ${nameToColor(order.customerName)}44`,
                    margin: "0 auto 10px",
                  }}
                >
                  {getInitials(order.customerName)}
                </div>
                <div style={{ textAlign: "center", marginBottom: 12 }}>
                  <div style={{ fontSize: 16, fontWeight: 800, letterSpacing: "-0.02em" }}>
                    {order.customerName || "Unknown"}
                  </div>
                  {order.customerEmail && (
                    <div style={{ fontSize: 12, color: "var(--text-dim)", marginTop: 2 }}>
                      {order.customerEmail}
                    </div>
                  )}
                </div>

                {/* Contact icons row */}
                <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
                  {order.customerEmail && (
                    <a href={`mailto:${order.customerEmail}`} style={contactIconStyle} title="Send email">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                        <polyline points="22,6 12,13 2,6" />
                      </svg>
                    </a>
                  )}
                  {order.customerPhone && (
                    <a href={`tel:${order.customerPhone}`} style={contactIconStyle} title="Call">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
                      </svg>
                    </a>
                  )}
                  <button style={contactIconStyle} title="Message">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* ── Shipping Address ── */}
              {(order.shippingAddressLine1 || order.shippingCity) && (
                <div style={sectionStyle}>
                  <h3 style={sectionTitleStyle}>Shipping Address</h3>
                  <div style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6 }}>
                    {order.shippingAddressLine1 && <div>{order.shippingAddressLine1}</div>}
                    {order.shippingAddressLine2 && <div>{order.shippingAddressLine2}</div>}
                    <div>
                      {[order.shippingCity, order.shippingState, order.shippingPostalCode].filter(Boolean).join(", ")}
                    </div>
                    {order.shippingCountry && <div>{order.shippingCountry}</div>}
                  </div>
                </div>
              )}

              {/* ── Order Items ── */}
              <div style={sectionStyle}>
                <h3 style={sectionTitleStyle}>Order Items</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {order.items.map((item) => (
                    <div key={item.id} style={itemRowStyle}>
                      {/* Product image */}
                      <div
                        style={{
                          width: 52,
                          height: 52,
                          borderRadius: 10,
                          background: "var(--surface-hover)",
                          border: "1px solid var(--border)",
                          overflow: "hidden",
                          flexShrink: 0,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          />
                        ) : (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-dim)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                            <circle cx="8.5" cy="8.5" r="1.5" />
                            <polyline points="21 15 16 10 5 21" />
                          </svg>
                        )}
                      </div>

                      {/* Item details */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: 13,
                            fontWeight: 700,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            letterSpacing: "-0.01em",
                          }}
                        >
                          {item.name}
                        </div>
                        <div style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 2 }}>
                          Qty: {item.quantity} × {currency(item.unitPrice)}
                        </div>
                      </div>

                      {/* Item total */}
                      <div style={{ fontSize: 14, fontWeight: 800, letterSpacing: "-0.02em", flexShrink: 0 }}>
                        {currency(item.lineTotal)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Order Summary ── */}
              <div style={sectionStyle}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <span style={{ fontSize: 12, color: "var(--text-dim)" }}>Subtotal ({order.totalItems} items)</span>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{currency(order.total)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <span style={{ fontSize: 12, color: "var(--text-dim)" }}>Delivery ({order.deliveryMode})</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-dim)" }}>—</span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    paddingTop: 12,
                    borderTop: "1px solid var(--border)",
                  }}
                >
                  <span style={{ fontSize: 14, fontWeight: 700 }}>Total</span>
                  <span style={{ fontSize: 22, fontWeight: 900, letterSpacing: "-0.03em" }}>
                    {currency(order.total)}
                  </span>
                </div>
              </div>

              {/* ── Order Notes ── */}
              {order.orderNotes && (
                <div style={sectionStyle}>
                  <h3 style={sectionTitleStyle}>Order Notes</h3>
                  <p style={{ fontSize: 13, color: "var(--text-muted)", margin: 0, lineHeight: 1.6 }}>
                    {order.orderNotes}
                  </p>
                </div>
              )}
            </div>

            {/* ── Footer action buttons ── */}
            <div style={footerStyle}>
              <button style={trackButtonStyle}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <circle cx="12" cy="12" r="4" />
                  <line x1="21.17" y1="8" x2="12" y2="8" />
                  <line x1="3.95" y1="6.06" x2="8.54" y2="14" />
                  <line x1="10.88" y1="21.94" x2="15.46" y2="14" />
                </svg>
                Track
              </button>
              <button style={refundButtonStyle}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="1 4 1 10 7 10" />
                  <path d="M3.51 15a9 9 0 102.13-9.36L1 10" />
                </svg>
                Refund
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}

/* ────────────── Styles ────────────── */

const headerStyle: CSSProperties = {
  padding: "20px 24px 16px",
  borderBottom: "1px solid var(--border)",
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
};

const titleStyle: CSSProperties = {
  margin: 0,
  fontSize: 18,
  fontWeight: 900,
  fontFamily: "'Plus Jakarta Sans', sans-serif",
  letterSpacing: "-0.03em",
  flex: 1,
};

const closeButtonStyle: CSSProperties = {
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: 10,
  width: 34,
  height: 34,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  color: "var(--foreground)",
  transition: "all 0.2s",
  flexShrink: 0,
  marginLeft: "auto",
};

const customerCardStyle: CSSProperties = {
  padding: "20px 16px",
  marginTop: 20,
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: 14,
};

const contactIconStyle: CSSProperties = {
  width: 38,
  height: 38,
  borderRadius: 10,
  background: "var(--background)",
  border: "1px solid var(--border)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  color: "var(--text-muted)",
  transition: "all 0.2s",
  textDecoration: "none",
};

const sectionStyle: CSSProperties = {
  marginTop: 20,
  padding: "16px",
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: 14,
};

const sectionTitleStyle: CSSProperties = {
  margin: "0 0 12px",
  fontSize: 13,
  fontWeight: 800,
  letterSpacing: "-0.01em",
  fontFamily: "'Plus Jakarta Sans', sans-serif",
};

const itemRowStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 12,
};

const footerStyle: CSSProperties = {
  padding: "16px 24px",
  borderTop: "1px solid var(--border)",
  display: "flex",
  gap: 10,
};

const trackButtonStyle: CSSProperties = {
  flex: 1,
  padding: "12px 16px",
  borderRadius: 12,
  border: "none",
  background: "var(--brand-red)",
  color: "#fff",
  fontSize: 14,
  fontWeight: 700,
  fontFamily: "'Plus Jakarta Sans', sans-serif",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  transition: "all 0.2s",
  letterSpacing: "-0.01em",
};

const refundButtonStyle: CSSProperties = {
  flex: 1,
  padding: "12px 16px",
  borderRadius: 12,
  border: "1px solid var(--border)",
  background: "var(--surface)",
  color: "var(--foreground)",
  fontSize: 14,
  fontWeight: 700,
  fontFamily: "'Plus Jakarta Sans', sans-serif",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  transition: "all 0.2s",
  letterSpacing: "-0.01em",
};

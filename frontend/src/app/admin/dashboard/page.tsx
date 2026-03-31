"use client";

import Link from "next/link";

export default function AdminDashboardPage() {
  return (
    <section style={{ padding: 28 }}>
      <h1
        style={{
          margin: 0,
          fontSize: 28,
          fontWeight: 800,
          letterSpacing: "-0.02em",
          color: "var(--foreground)",
        }}
      >
        Dashboard
      </h1>
      <p style={{ marginTop: 8, color: "var(--text-muted)", fontSize: 14 }}>
        Welcome to the admin area. Choose where you want to go next.
      </p>

      <div style={{ display: "flex", gap: 12, marginTop: 20, flexWrap: "wrap" }}>
        <Link
          href="/admin/products/getall"
          style={{
            textDecoration: "none",
            padding: "10px 14px",
            borderRadius: 10,
            border: "1px solid var(--border)",
            background: "var(--surface)",
            color: "var(--foreground)",
            fontWeight: 700,
            fontSize: 13,
          }}
        >
          View Products
        </Link>
        <Link
          href="/admin/products/add"
          style={{
            textDecoration: "none",
            padding: "10px 14px",
            borderRadius: 10,
            border: "1px solid var(--brand-red)",
            background: "var(--brand-red)",
            color: "#fff",
            fontWeight: 700,
            fontSize: 13,
          }}
        >
          Add Product
        </Link>
        <Link
          href="/admin/customers"
          style={{
            textDecoration: "none",
            padding: "10px 14px",
            borderRadius: 10,
            border: "1px solid var(--border)",
            background: "var(--surface)",
            color: "var(--foreground)",
            fontWeight: 700,
            fontSize: 13,
          }}
        >
          Manage Customers
        </Link>
      </div>
    </section>
  );
}

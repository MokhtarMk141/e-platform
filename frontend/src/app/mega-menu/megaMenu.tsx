"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuthStore } from "@/hooks/useAuth";

/* ── Simple text-based mega menu ── */
/*
  This component renders a basic <nav> with dropdown menus.
  - "Products" links point to /product-page?category=<slug>&categoryKey=<key>
  - The product page reads these query params and filters by category
*/

const menus: Record<string, { title: string; items: { label: string; key: string; href: string }[] }[]> = {
  Products: [
    {
      title: "Core Components",
      items: [
        { label: "CPUs & Processors", key: "cpu", href: "/product-page?categoryKey=cpu" },
        { label: "Motherboards", key: "motherboard", href: "/product-page?categoryKey=motherboard" },
        { label: "Memory (RAM)", key: "ram", href: "/product-page?categoryKey=ram" },
        { label: "Graphics Cards", key: "gpu", href: "/product-page?categoryKey=gpu" },
        { label: "Storage", key: "storage", href: "/product-page?categoryKey=storage" },
        { label: "Power Supplies", key: "psu", href: "/product-page?categoryKey=psu" },
      ],
    },
    {
      title: "Peripherals & Cooling",
      items: [
        { label: "CPU Cooling", key: "cooling", href: "/product-page?categoryKey=cooling" },
        { label: "PC Cases", key: "case", href: "/product-page?categoryKey=case" },
        { label: "Monitors", key: "monitor", href: "/product-page?categoryKey=monitor" },
        { label: "Keyboards", key: "keyboard", href: "/product-page?categoryKey=keyboard" },
        { label: "Mice", key: "mouse", href: "/product-page?categoryKey=mouse" },
        { label: "Headsets", key: "headset", href: "/product-page?categoryKey=headset" },
      ],
    },
  ],
};

const navLinks = ["Products", "Deals", "Build Guide", "Support"];

export default function MegaMenu() {
  const [active, setActive] = useState<string | null>(null);
  const { isAuthenticated, user, logout } = useAuthStore();

  return (
    <nav
      style={{ borderBottom: "1px solid #ddd", padding: "10px 20px" }}
      onMouseLeave={() => setActive(null)}
    >
      {/* ── Top bar ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <Link href="/" style={{ fontWeight: "bold", fontSize: 18 }}>
            E-Platform
          </Link>

          {navLinks.map((link) => (
            <button
              key={link}
              onMouseEnter={() => setActive(menus[link] ? link : null)}
              style={{
                background: "none", border: "none", padding: "6px 10px",
                fontWeight: active === link ? "bold" : "normal",
                cursor: "pointer", fontSize: 14,
              }}
            >
              {link} {menus[link] ? "▾" : ""}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {isAuthenticated ? (
            <>
              <span style={{ fontSize: 13 }}>
                {user?.name} ({user?.role})
              </span>
              <Link href="/dashboard" style={{ fontSize: 13 }}>Dashboard</Link>
              <button onClick={logout} style={{ fontSize: 13, background: "none", border: "1px solid #ccc", padding: "4px 10px" }}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" style={{ fontSize: 13 }}>Login</Link>
              <Link href="/register" style={{ fontSize: 13 }}>Register</Link>
            </>
          )}
        </div>
      </div>

      {/* ── Dropdown ── */}
      {active && menus[active] && (
        <div style={{ borderTop: "1px solid #eee", padding: "15px 0", display: "flex", gap: 40 }}>
          {menus[active].map((section) => (
            <div key={section.title}>
              <strong style={{ fontSize: 12, textTransform: "uppercase", color: "#888" }}>
                {section.title}
              </strong>
              <ul style={{ listStyle: "none", padding: 0, marginTop: 8 }}>
                {section.items.map((item) => (
                  <li key={item.key} style={{ marginBottom: 4 }}>
                    <Link href={item.href} style={{ fontSize: 13 }}>
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div style={{ marginLeft: "auto" }}>
            <Link href="/product-page" style={{ fontSize: 13, fontWeight: "bold" }}>
              See all products →
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}

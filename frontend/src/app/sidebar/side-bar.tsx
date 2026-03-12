"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "@/app/cartDrawer/ThemeToggle";

/* ── Small SVG icon helper (same pattern as MegaMenu) ── */
const Icon = ({ d, size = 16 }: { d: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

/* ── Icon paths ── */
const iconPaths = {
  dashboard: "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z",
  products: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
  orders: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
  users: "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4-4v2m22-4a4 4 0 100-8 4 4 0 000 8zm-8 0a4 4 0 100-8 4 4 0 000 8z",
  analytics: "M18 20V10M12 20V4M6 20v-6",
  settings: "M12 15a3 3 0 100-6 3 3 0 000 6z M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z",
  addProduct: "M12 5v14M5 12h14",
  editProduct: "M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z",
  categories: "M4 6h16M4 12h16M4 18h7",
  inventory: "M5 8a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H7a2 2 0 01-2-2V8zm3 4h.01M16 12h.01",
  customers: "M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4-4v2m7-6a4 4 0 100-8 4 4 0 000 8zm10 6v-2a4 4 0 00-3-3.87",
  coupons: "M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82zM7 7h.01",
  store: "M3 3h18v4H3V3zm0 4l2 13h14l2-13M10 14h4",
  chevronDown: "M6 9l6 6 6-6",
  chevronRight: "M9 18l6-6-6-6",
  collapse: "M11 19l-7-7 7-7M18 19l-7-7 7-7",
  expand: "M13 5l7 7-7 7M6 5l7 7-7 7",
  logout: "M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9",
};

/* ── Sidebar nav structure ── */
type NavItem = {
  icon: keyof typeof iconPaths;
  label: string;
  href?: string;
  children?: { icon: keyof typeof iconPaths; label: string; href: string }[];
};

const navSections: { title: string; items: NavItem[] }[] = [
  {
    title: "Main",
    items: [
      { icon: "dashboard", label: "Dashboard", href: "/dashboard" },
      { icon: "analytics", label: "Analytics", href: "/admin/analytics" },
    ],
  },
  {
    title: "Catalog",
    items: [
      {
        icon: "products",
        label: "Products",
        children: [
          { icon: "store", label: "All Products", href: "/product-page" },
          { icon: "addProduct", label: "Add Product", href: "/admin/products/add" },
          { icon: "categories", label: "Categories", href: "/admin/categories" },
          { icon: "inventory", label: "Inventory", href: "/admin/inventory" },
        ],
      },
      { icon: "orders", label: "Orders", href: "/admin/orders" },
      { icon: "coupons", label: "Coupons", href: "/admin/coupons" },
    ],
  },
  {
    title: "Management",
    items: [
      { icon: "customers", label: "Customers", href: "/admin/customers" },
      { icon: "settings", label: "Settings", href: "/admin/settings" },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({ Products: true });

  const toggleSubmenu = (label: string) => {
    setOpenMenus((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <aside
      className={collapsed ? "collapsed" : ""}
      style={{
        width: collapsed ? 80 : 280,
        minHeight: "100vh",
        background: "var(--background)",
        borderRight: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        fontFamily: "'Plus Jakarta Sans', 'DM Sans', sans-serif",
        transition: "width 0.3s cubic-bezier(0.16,1,0.3,1)",
        position: "relative",
        flexShrink: 0,
        overflow: "hidden",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=DM+Sans:wght@400;500;600&display=swap');

        .collapsed .sb-logo-area {
          justify-content: center;
          padding: 24px 0 16px;
        }
        .collapsed .sb-section-title {
          display: none;
        }
        .collapsed .sb-bottom-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }

        .sb-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 16px;
          border-radius: 12px;
          text-decoration: none;
          transition: all 0.2s cubic-bezier(0.16,1,0.3,1);
          cursor: pointer;
          border: none;
          background: none;
          width: 100%;
          font-family: 'Plus Jakarta Sans', sans-serif;
          color: var(--text-muted);
          position: relative;
        }
        .collapsed .sb-item {
          justify-content: center;
          padding: 10px 0;
        }
        .sb-item:hover {
          background: var(--surface-hover);
          color: var(--foreground);
        }
        .sb-item.active {
          background: var(--surface-hover);
          color: var(--brand-red);
        }
        .sb-item.active::before {
          content: '';
          position: absolute;
          left: -12px;
          top: 50%;
          transform: translateY(-50%);
          width: 3px;
          height: 20px;
          border-radius: 0 4px 4px 0;
          background: var(--brand-red);
        }

        .sb-icon {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: var(--surface);
          border: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-muted);
          flex-shrink: 0;
          transition: all 0.2s cubic-bezier(0.16,1,0.3,1);
        }
        .sb-item:hover .sb-icon {
          border-color: var(--brand-red);
          color: var(--brand-red);
          background: var(--background);
          box-shadow: 0 4px 14px rgba(255,40,0,0.12);
          transform: translateY(-1px);
        }
        .sb-item.active .sb-icon {
          border-color: var(--brand-red);
          color: #fff;
          background: var(--brand-red);
          box-shadow: 0 4px 12px rgba(255,40,0,0.2);
        }

        /* ── Light Mode Specific Refinements ── */
        :global(:not(.dark)) .sb-icon {
          background: #ffffff;
          border-color: #f0f0f5;
          box-shadow: 0 2px 4px rgba(0,0,0,0.02);
        }
        :global(:not(.dark)) .sb-item:hover {
          background: #f8f8fb;
        }

        .sb-label {
          font-size: 13.5px;
          font-weight: 600;
          letter-spacing: -0.01em;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          transition: opacity 0.15s;
          color: var(--foreground);
        }
        .sb-item:not(.active):hover .sb-label {
          color: var(--foreground);
        }

        .sb-section-title {
          font-size: 10.5px;
          font-weight: 700;
          color: var(--text-dim);
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin: 16px 0 8px;
          padding: 0 16px;
          font-family: 'DM Sans', sans-serif;
          white-space: nowrap;
          overflow: hidden;
          opacity: 0.6;
        }

        .sb-child-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 16px 8px 32px;
          border-radius: 8px;
          text-decoration: none;
          transition: all 0.2s;
          cursor: pointer;
          color: var(--text-muted);
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
        .sb-child-item:hover {
          background: var(--surface-hover);
          color: var(--foreground);
        }
        .sb-child-item.active {
          color: var(--brand-red);
          background: rgba(255,40,0,0.05);
        }

        .sb-child-icon {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--border-strong);
          flex-shrink: 0;
          transition: all 0.2s;
        }
        .sb-child-item:hover .sb-child-icon {
          background: var(--brand-red);
          box-shadow: 0 0 8px rgba(255,40,0,0.3);
        }
        .sb-child-item.active .sb-child-icon {
          background: var(--brand-red);
          box-shadow: 0 0 8px rgba(255,40,0,0.3);
        }

        .sb-child-label {
          font-size: 13px;
          font-weight: 500;
          letter-spacing: -0.01em;
          white-space: nowrap;
        }

        .sb-chevron {
          margin-left: auto;
          transition: transform 0.2s;
          opacity: 0.4;
          flex-shrink: 0;
        }
        .sb-chevron.open {
          transform: rotate(90deg);
          opacity: 0.7;
        }

        .sb-submenu {
          overflow: hidden;
          transition: max-height 0.25s cubic-bezier(0.16,1,0.3,1), opacity 0.2s;
        }

        .sb-collapse-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: 10px;
          border: 1px solid var(--border);
          background: var(--surface);
          color: var(--text-muted);
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.16,1,0.3,1);
          flex-shrink: 0;
        }
        .sb-collapse-btn:hover {
          border-color: var(--brand-red);
          color: var(--brand-red);
          background: var(--background);
          box-shadow: 0 4px 12px rgba(255,40,0,0.1);
          transform: translateY(-1px);
        }
        .collapsed .sb-collapse-btn {
          width: 36px;
          height: 36px;
          margin-top: 12px;
        }

        .sb-divider {
          height: 1px;
          background: var(--border);
          margin: 4px 12px;
        }

        .sb-logo-area {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 20px 16px 16px;
          border-bottom: 1px solid var(--border);
          margin-bottom: 8px;
        }

        .sb-logo-mark {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: linear-gradient(135deg, var(--brand-red) 0%, #ff6633 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          font-weight: 800;
          font-size: 16px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          flex-shrink: 0;
          box-shadow: 0 4px 14px rgba(255,40,0,0.25);
          letter-spacing: -0.02em;
        }

        .sb-logo-text {
          display: flex;
          flex-direction: column;
          white-space: nowrap;
          overflow: hidden;
        }
        .sb-logo-name {
          font-size: 15px;
          font-weight: 800;
          color: var(--foreground);
          letter-spacing: -0.03em;
          font-family: 'Plus Jakarta Sans', sans-serif;
          line-height: 1.2;
        }
        .sb-logo-sub {
          font-size: 11px;
          color: var(--text-dim);
          font-weight: 500;
          font-family: 'DM Sans', sans-serif;
        }

        .sb-bottom-section {
          margin-top: auto;
          padding: 12px;
          border-top: 1px solid var(--border);
        }

        .sb-logout-btn {
          display: flex;
          align-items: center;
          gap: 11px;
          padding: 9px 12px;
          border-radius: 10px;
          text-decoration: none;
          transition: all 0.2s;
          cursor: pointer;
          border: none;
          background: none;
          width: 100%;
          font-family: 'Plus Jakarta Sans', sans-serif;
          color: var(--text-muted);
          font-size: 13.5px;
          font-weight: 600;
          letter-spacing: -0.01em;
        }
        .sb-logout-btn:hover {
          background: rgba(255,40,0,0.06);
          color: var(--brand-red);
        }
        .sb-logout-btn:hover .sb-icon {
          border-color: var(--brand-red);
          color: var(--brand-red);
          background: var(--background);
          box-shadow: 0 4px 12px rgba(255,40,0,0.1);
        }
      `}</style>

      {/* ── Top accent line (matches MegaMenu) ── */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 2,
        background: "linear-gradient(90deg, var(--brand-red) 0%, #ff8000 100%)",
      }} />

      {/* ── Logo & Controls Area ── */}
      <div className="sb-logo-area" style={{ 
        display: 'flex', 
        flexDirection: collapsed ? 'column' : 'row',
        alignItems: 'center', 
        justifyContent: 'space-between',
        padding: collapsed ? '20px 0 16px' : '20px 16px 16px',
        borderBottom: '1px solid var(--border)',
        minHeight: 80
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className="sb-logo-mark" style={{ width: 34, height: 34, fontSize: 16 }}>A</div>
          {!collapsed && (
            <div className="sb-logo-text">
              <span className="sb-logo-name" style={{ fontSize: 16, fontWeight: 800 }}>Admin Panel</span>
              <span className="sb-logo-sub" style={{ opacity: 0.6 }}>E-Commerce</span>
            </div>
          )}
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {!collapsed && (
            <div style={{ transform: 'scale(0.85)', transformOrigin: 'right' }}>
              <ThemeToggle />
            </div>
          )}
          <button
            className="sb-collapse-btn"
            onClick={() => setCollapsed(!collapsed)}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <Icon d={collapsed ? iconPaths.expand : iconPaths.collapse} size={15} />
          </button>
        </div>
      </div>

      {/* ── Nav sections ── */}
      <nav style={{ flex: 1, padding: "8px 12px", overflowY: "auto", overflowX: "hidden" }}>
        {navSections.map((section, sIdx) => (
          <div key={section.title} style={{ marginBottom: 16 }}>
            {/* Section title */}
            {!collapsed && <p className="sb-section-title">{section.title}</p>}
            {collapsed && sIdx > 0 && <div className="sb-divider" />}

            {section.items.map((item) => {
              const hasChildren = item.children && item.children.length > 0;
              const isOpen = openMenus[item.label];
              const active = item.href ? isActive(item.href) : false;

              // Check if any child is active
              const childActive = hasChildren
                ? item.children!.some((c) => isActive(c.href))
                : false;

              return (
                <div key={item.label}>
                  {/* Parent item */}
                  {hasChildren ? (
                    <button
                      className={`sb-item${childActive ? " active" : ""}`}
                      onClick={() => toggleSubmenu(item.label)}
                      title={collapsed ? item.label : undefined}
                    >
                      <div className="sb-icon">
                        <Icon d={iconPaths[item.icon]} size={18} />
                      </div>
                      {!collapsed && (
                        <>
                          <span className="sb-label">{item.label}</span>
                          <svg
                            className={`sb-chevron${isOpen ? " open" : ""}`}
                            width="14" height="14" viewBox="0 0 24 24"
                            fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
                          >
                            <path d={iconPaths.chevronRight} />
                          </svg>
                        </>
                      )}
                    </button>
                  ) : (
                    <Link
                      href={item.href!}
                      className={`sb-item${active ? " active" : ""}`}
                      title={collapsed ? item.label : undefined}
                    >
                      <div className="sb-icon">
                        <Icon d={iconPaths[item.icon]} size={18} />
                      </div>
                      {!collapsed && <span className="sb-label">{item.label}</span>}
                    </Link>
                  )}

                  {/* Children submenu */}
                  {hasChildren && !collapsed && (
                    <div
                      className="sb-submenu"
                      style={{
                        maxHeight: isOpen ? item.children!.length * 42 + 8 : 0,
                        opacity: isOpen ? 1 : 0,
                        marginTop: isOpen ? 2 : 0,
                        marginBottom: isOpen ? 4 : 0,
                      }}
                    >
                      {item.children!.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={`sb-child-item${isActive(child.href) ? " active" : ""}`}
                        >
                          <div className="sb-child-icon" />
                          <span className="sb-child-label">{child.label}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </nav>

      {/* ── Bottom section ── */}
      <div className="sb-bottom-section" style={{ padding: '16px 12px' }}>
        {collapsed && (
           <div style={{ marginBottom: 12 }}>
             <ThemeToggle />
           </div>
        )}
        <button className="sb-logout-btn" title={collapsed ? "Logout" : undefined}>
          <div className="sb-icon">
            <Icon d={iconPaths.logout} size={18} />
          </div>
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}

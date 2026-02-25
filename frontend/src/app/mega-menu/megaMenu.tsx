"use client";

import { useState } from "react";
import logoimg from "../../../public/website_logo.png";
import ThemeToggle from "@/components/ThemeToggle";

const Icon = ({ d, size = 16 }: { d: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const icons = {
  cpu:         "M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18",
  gpu:         "M4 6a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm4 10v2m4-2v2m4-2v2M8 6h.01M12 6h.01M16 6h.01",
  ram:         "M3 7h18M3 12h18M3 17h18M7 3v18M17 3v18",
  storage:     "M5 8a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H7a2 2 0 01-2-2V8zm3 4h.01M16 12h.01",
  psu:         "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
  case:        "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
  cooling:     "M12 3a9 9 0 100 18A9 9 0 0012 3zm0 0v4m0 14v-4M3 12h4m14 0h-4M6.34 6.34l2.83 2.83m5.66 5.66l2.83 2.83M6.34 17.66l2.83-2.83m5.66-5.66l2.83-2.83",
  motherboard: "M9 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V9l-6-6zM9 3v6h6",
  monitor:     "M9 3H5a2 2 0 00-2 2v10a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2h-4M12 17v4m-4 0h8",
  keyboard:    "M4 6a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm4 4h.01M8 14h.01M12 10h.01M12 14h.01M16 10h.01M16 14h.01",
  mouse:       "M12 2C8.7 2 6 4.7 6 8v8c0 3.3 2.7 6 6 6s6-2.7 6-6V8c0-3.3-2.7-6-6-6zm0 0v6",
  headset:     "M3 18v-6a9 9 0 0118 0v6M3 18a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H3v5zm16 0a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3v5z",
  deals:       "M12 8v13m0-13V6a4 4 0 014-4h.5M2 21l10-10",
  bundle:      "M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2zM16 3H8a2 2 0 00-2 2v2h12V5a2 2 0 00-2-2z",
  star:        "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  truck:       "M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h11a2 2 0 012 2v3m0 0h4l2 4v5h-6m0-9H14M17 21a2 2 0 100-4 2 2 0 000 4zm-9 0a2 2 0 100-4 2 2 0 000 4z",
  build:       "M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z",
  chart:       "M18 20V10M12 20V4M6 20v-6",
};

const menus = {
  Products: {
    sections: [
      {
        title: "Core Components",
        items: [
          { icon: "cpu",         label: "CPUs & Processors",  desc: "Intel Core Ultra & AMD Ryzen series" },
          { icon: "motherboard", label: "Motherboards",        desc: "ATX, mATX and Mini-ITX form factors" },
          { icon: "ram",         label: "Memory (RAM)",        desc: "DDR4 & DDR5 up to 192GB kits" },
          { icon: "gpu",         label: "Graphics Cards",      desc: "NVIDIA RTX 5000 & AMD RX 9000 series" },
          { icon: "storage",     label: "Storage",             desc: "NVMe SSDs, HDDs & SATA drives" },
          { icon: "psu",         label: "Power Supplies",      desc: "80+ Gold, Platinum & Titanium PSUs" },
        ],
      },
      {
        title: "Peripherals & Cooling",
        items: [
          { icon: "cooling",  label: "CPU Cooling",   desc: "Air coolers, AIOs & case fans" },
          { icon: "case",     label: "PC Cases",      desc: "Full, mid & mini-tower chassis" },
          { icon: "monitor",  label: "Monitors",      desc: "4K, 240Hz & ultrawide panels" },
          { icon: "keyboard", label: "Keyboards",     desc: "Mechanical & membrane keyboards" },
          { icon: "mouse",    label: "Mice",          desc: "Gaming & productivity mice" },
          { icon: "headset",  label: "Headsets",      desc: "7.1 surround & studio-grade audio" },
        ],
      },
    ],
    featured: {
      badge: "New Launch",
      title: "Build your dream PC",
      desc: "Use our interactive PC Builder to pick compatible parts and get the best price automatically.",
      cta: "Open PC Builder",
    },
  },
  Deals: {
    sections: [
      {
        title: "Current Offers",
        items: [
          { icon: "deals",  label: "Daily Deals",     desc: "Fresh discounts every 24 hours" },
          { icon: "bundle", label: "Bundle Packages", desc: "Save more when buying together" },
          { icon: "star",   label: "Clearance Sale",  desc: "Last chance prices, limited stock" },
          { icon: "truck",  label: "Free Shipping",   desc: "Orders over $99 ship free" },
        ],
      },
      {
        title: "Deals by Category",
        items: [
          { icon: "cpu",     label: "CPU Deals",     desc: "Up to 25% off top processors" },
          { icon: "gpu",     label: "GPU Deals",     desc: "RTX & RX massive price drops" },
          { icon: "ram",     label: "RAM Deals",     desc: "DDR5 kits at record low prices" },
          { icon: "storage", label: "Storage Deals", desc: "NVMe SSDs under $60/TB" },
        ],
      },
    ],
    featured: {
      badge: "This Week",
      title: "Flash Sale — Up to 40% off",
      desc: "Massive savings on Intel, AMD, NVIDIA, Corsair and more top brands.",
      cta: "See All Deals",
    },
  },
  "Build Guide": {
    sections: [
      {
        title: "Build Types",
        items: [
          { icon: "build", label: "Budget Build $400–$600",  desc: "Best performance per dollar" },
          { icon: "build", label: "Mid-Range $800–$1200",    desc: "1440p gaming powerhouse" },
          { icon: "build", label: "High-End $1500–$2500",    desc: "4K ultra settings, no compromise" },
          { icon: "build", label: "Workstation Pro",         desc: "Content creation & 3D rendering" },
        ],
      },
      {
        title: "Resources",
        items: [
          { icon: "motherboard", label: "Compatibility Checker", desc: "Verify your parts work together" },
          { icon: "chart",       label: "Benchmark Database",    desc: "Compare real-world performance" },
          { icon: "star",        label: "Expert Reviews",        desc: "In-depth analysis by our team" },
          { icon: "truck",       label: "Installation Guide",    desc: "Step-by-step video tutorials" },
        ],
      },
    ],
    featured: {
      badge: "Popular",
      title: "PC Builder Tool",
      desc: "Answer a few questions and get a full parts list tailored to your budget and goals.",
      cta: "Start Building",
    },
  },
};

const navLinks = ["Products", "Deals", "Build Guide", "Support"];

type MenuKey = "Products" | "Deals" | "Build Guide";

export default function MegaMenu() {
  const [active, setActive] = useState<MenuKey | null>(null);

  return (
    <div style={{ background: "var(--background)", fontFamily: "'Plus Jakarta Sans', 'DM Sans', sans-serif", borderBottom: "1px solid var(--border)" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=DM+Sans:wght@400;500;600&display=swap');

        * { box-sizing: border-box; }

        .dropdown {
          animation: fadeSlide 0.2s cubic-bezier(0.16,1,0.3,1);
        }
        @keyframes fadeSlide {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .nav-btn {
          color: var(--text-muted);
          font-size: 13.5px;
          font-weight: 600;
          padding: 6px 14px;
          background: none;
          border: none;
          border-bottom: 2px solid transparent;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 5px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          transition: all 0.2s;
          height: 56px;
          letter-spacing: -0.01em;
        }
        .nav-btn:hover { color: var(--foreground); }
        .nav-btn.open  { color: var(--brand-red); border-bottom-color: var(--brand-red); }

        .caret { transition: transform 0.2s; display: inline-block; opacity: 0.5; }
        .caret.open { transform: rotate(180deg); opacity: 1; }

        .menu-item {
          display: flex;
          align-items: flex-start;
          gap: 11px;
          padding: 10px;
          border-radius: 12px;
          text-decoration: none;
          transition: all 0.2s;
          cursor: pointer;
        }
        .menu-item:hover { background: var(--surface-hover); }

        .item-icon {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: var(--surface);
          border: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-muted);
          flex-shrink: 0;
          margin-top: 1px;
          transition: all 0.2s;
        }
        .menu-item:hover .item-icon {
          border-color: var(--brand-red);
          color: var(--brand-red);
          background: var(--background);
          box-shadow: 0 4px 12px rgba(255,40,0,0.1);
        }

        .item-label {
          font-size: 13.5px;
          font-weight: 700;
          color: var(--foreground);
          line-height: 1.3;
          font-family: 'Plus Jakarta Sans', sans-serif;
          transition: color 0.12s;
          letter-spacing: -0.01em;
        }
        .menu-item:hover .item-label { color: var(--brand-red); }

        .item-desc {
          font-size: 11.5px;
          color: var(--text-dim);
          line-height: 1.45;
          margin-top: 2px;
          font-family: 'DM Sans', sans-serif;
          font-weight: 400;
        }

        .section-title {
          font-size: 10.5px;
          font-weight: 700;
          color: var(--text-dim);
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-bottom: 8px;
          font-family: 'DM Sans', sans-serif;
          padding-bottom: 8px;
          border-bottom: 1px solid var(--border);
        }

        .featured-cta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          font-size: 12.5px;
          font-weight: 800;
          color: #fff;
          text-decoration: none;
          font-family: 'Plus Jakarta Sans', sans-serif;
          background: var(--brand-red);
          transition: all 0.2s;
          cursor: pointer;
          letter-spacing: -0.01em;
          box-shadow: 0 4px 14px rgba(255,40,0,0.25);
          border-radius: 8px;
        }
        .featured-cta:hover { 
          background: var(--brand-red-hover); 
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(255,40,0,0.3);
        }

        .bottom-link {
          font-size: 12.5px;
          color: var(--text-muted);
          text-decoration: none;
          font-family: 'DM Sans', sans-serif;
          font-weight: 600;
          transition: color 0.12s;
        }
        .bottom-link:hover { color: var(--brand-red); }

        .see-all {
          font-size: 12.5px;
          font-weight: 800;
          color: var(--foreground);
          text-decoration: none;
          font-family: 'Plus Jakarta Sans', sans-serif;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 6px;
          letter-spacing: -0.01em;
          padding: 6px 12px;
          background: var(--surface-hover);
          border-radius: 6px;
        }
        .see-all:hover { 
          color: #fff; 
          background: var(--foreground);
        }

        .search-box {
          display: flex;
          align-items: center;
          gap: 8px;
          background: var(--surface-hover);
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 7px 11px;
          transition: all 0.2s;
        }
        .search-box:hover { border-color: var(--border-strong); background: var(--surface); }
        .search-box:focus-within { border-color: var(--brand-red); background: var(--background); box-shadow: 0 0 0 4px rgba(255,40,0,0.05); }

        .search-input {
          background: none;
          border: none;
          outline: none;
          font-size: 13px;
          color: var(--foreground);
          width: 160px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-weight: 500;
        }
        .search-input::placeholder { color: var(--text-dim); }

        .kbd {
          font-size: 10px;
          color: var(--text-dim);
          background: var(--background);
          border: 1px solid var(--border);
          border-radius: 4px;
          padding: 1px 5px;
          font-family: 'DM Sans', sans-serif;
          font-weight: 700;
        }

        .sign-in-btn {
          background: none;
          border: none;
          color: var(--foreground);
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          padding: 8px 16px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          transition: all 0.2s;
          letter-spacing: -0.01em;
        }
        .sign-in-btn:hover { color: var(--brand-red); }

        .start-btn {
          background: var(--foreground);
          border: none;
          color: var(--background);
          font-size: 13.5px;
          font-weight: 700;
          padding: 9px 20px;
          border-radius: 10px;
          cursor: pointer;
          font-family: 'Plus Jakarta Sans', sans-serif;
          letter-spacing: -0.01em;
          transition: all 0.2s;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        .start-btn:hover {
          opacity: 0.9;
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(0,0,0,0.15);
        }
      `}</style>

      {/* ── Navbar ── */}
      <nav
        style={{
          background: "var(--background)",
          position: "relative",
          zIndex: 100,
        }}
        onMouseLeave={() => setActive(null)}
      >
        {/* Slim red top line */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 2,
          background: "linear-gradient(90deg, var(--brand-red) 0%, #ff8000 100%)",
        }} />

        <div style={{
          maxWidth: 1400,
          margin: "0 auto",
          padding: "0 32px",
          display: "flex",
          alignItems: "center",
          height: 64,
          gap: 0,
        }}>
          {/* Logo */}
          <a href="/" style={{ display: "flex", alignItems: "center", textDecoration: "none", flexShrink: 0, marginRight: 32 }}>
            <img
              src={logoimg.src}
              alt="Website logo"
              style={{ maxHeight: 38, maxWidth: 150, objectFit: "contain", filter: "var(--foreground) === '#ffffff' ? 'invert(1)' : 'none'" }}
            />
          </a>

          {/* Slim divider */}
          <div style={{ width: 1, height: 24, background: "var(--border)", marginRight: 20 }} />

          {/* Nav links */}
          <div style={{ display: "flex", alignItems: "stretch", height: "100%" }}>
            {navLinks.map((link) => {
              const has = !!(menus as any)[link];
              const isOpen = active === link;
              return (
                <button
                  key={link}
                  className={`nav-btn${isOpen ? " open" : ""}`}
                  onMouseEnter={() => setActive(link as MenuKey)}
                >
                  {link}
                  {has && (
                    <svg
                      className={`caret${isOpen ? " open" : ""}`}
                      width="11" height="11"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    >
                      <path d="M6 9l6 6 6-6"/>
                    </svg>
                  )}
                </button>
              );
            })}
          </div>

          {/* Right */}
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 12 }}>
            <div className="search-box">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ color: "var(--text-dim)" }}>
                <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
              </svg>
              <input className="search-input" type="text" placeholder="Search setups..." />
              <span className="kbd">⌘K</span>
            </div>

            <ThemeToggle />

            <button className="sign-in-btn">Login</button>

            <button className="start-btn">Start Build</button>
          </div>
        </div>

        {/* ── Dropdown ── */}
        {active && (menus as any)[active] && (
          <div
            className="dropdown"
            style={{
              position: "absolute",
              top: "100%",
              left: 0,
              right: 0,
              background: "var(--background)",
              borderTop: "1px solid var(--border)",
              borderBottom: "1px solid var(--border-strong)",
              boxShadow: "0 30px 60px rgba(0,0,0,0.12), 0 10px 20px rgba(0,0,0,0.06)",
            }}
          >
            <div style={{ maxWidth: 1400, margin: "0 auto", padding: "32px", position: "relative" }}>
              <div style={{ display: "flex", gap: 40 }}>

                {/* Sections */}
                <div style={{ display: "flex", gap: 24, flex: 1 }}>
                  {(menus as any)[active].sections.map((section: any) => (
                    <div key={section.title} style={{ flex: 1, minWidth: 0 }}>
                      <p className="section-title">{section.title}</p>
                      <div style={{ display: "grid", gridTemplateColumns: section.items.length > 4 ? "1fr 1fr" : "1fr", gap: "4px" }}>
                        {section.items.map((item: any) => (
                          <a key={item.label} href="/product-page" className="menu-item">
                            <div className="item-icon">
                              <Icon d={(icons as any)[item.icon]} size={14} />
                            </div>
                            <div style={{ minWidth: 0 }}>
                              <p className="item-label">{item.label}</p>
                              <p className="item-desc">{item.desc}</p>
                            </div>
                          </a>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Featured card */}
                <div style={{ width: 260, flexShrink: 0 }}>
                  <div style={{
                    borderRadius: 16,
                    overflow: "hidden",
                    border: "1px solid var(--border)",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    background: "var(--background)",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
                  }}>
                    {/* Card body */}
                    <div style={{
                      flex: 1,
                      background: "linear-gradient(140deg, var(--background) 0%, var(--surface) 100%)",
                      padding: "24px 20px",
                      position: "relative",
                      overflow: "hidden",
                    }}>
                      {/* Soft radial glow */}
                      <div style={{
                        position: "absolute", right: -40, top: -40,
                        width: 200, height: 200,
                        borderRadius: "50%",
                        background: "radial-gradient(circle, rgba(255,40,0,0.1) 0%, transparent 70%)",
                        pointerEvents: "none",
                      }} />

                      <span style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 5,
                        background: "rgba(255,40,0,0.1)",
                        border: "1px solid rgba(255,40,0,0.2)",
                        color: "var(--brand-red)",
                        fontSize: 10,
                        fontWeight: 800,
                        letterSpacing: "0.05em",
                        padding: "4px 10px",
                        borderRadius: 20,
                        marginBottom: 16,
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        textTransform: "uppercase",
                      }}>
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--brand-red)", display: "inline-block" }} />
                        {(menus as any)[active].featured.badge}
                      </span>

                      <h3 style={{
                        color: "var(--foreground)",
                        fontWeight: 800,
                        fontSize: 20,
                        lineHeight: 1.25,
                        margin: "0 0 12px",
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        letterSpacing: "-0.03em",
                      }}>
                        {(menus as any)[active].featured.title}
                      </h3>

                      <p style={{
                        color: "var(--text-muted)",
                        fontSize: 13,
                        lineHeight: 1.6,
                        margin: 0,
                        fontFamily: "'DM Sans', sans-serif",
                      }}>
                        {(menus as any)[active].featured.desc}
                      </p>
                    </div>

                    <div style={{ padding: "0 20px 24px", background: "var(--background)" }}>
                      <a href="#" className="featured-cta">
                        {(menus as any)[active].featured.cta}
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                          <path d="M5 12h14M12 5l7 7-7 7"/>
                        </svg>
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom bar */}
              <div style={{
                marginTop: 24,
                paddingTop: 20,
                borderTop: "1px solid var(--border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}>
                <a href="/product-page" className="see-all">
                  See all products
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </a>
                <div style={{ display: "flex", gap: 28 }}>
                  {["PC Builder", "Compatibility", "Benchmarks", "Expert Reviews"].map((l) => (
                    <a key={l} href="#" className="bottom-link">{l}</a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>
    </div>
  );
}

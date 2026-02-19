"use client";

import { useState } from "react";

const Icon = ({ d, size = 16 }) => (
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
      badge: "NEW LAUNCH",
      title: "Build your dream PC",
      desc: "Use our interactive PC Builder to pick compatible parts and get the best price automatically.",
      cta: "Open PC Builder",
      gradient: "linear-gradient(135deg, #06b6d4 0%, #10b981 100%)",
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
      badge: "THIS WEEK",
      title: "Flash Sale — Up to 40% off",
      desc: "Massive savings on Intel, AMD, NVIDIA, Corsair and more top brands.",
      cta: "See All Deals",
      gradient: "linear-gradient(135deg, #f97316 0%, #ef4444 100%)",
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
      badge: "POPULAR",
      title: "PC Builder Tool",
      desc: "Answer a few questions and get a full parts list tailored to your budget and goals.",
      cta: "Start Building",
      gradient: "linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)",
    },
  },
};

const navLinks = ["Products", "Deals", "Build Guide", "Support"];

export default function MegaMenu() {
  const [active, setActive] = useState(null);

  return (
    <div style={{ minHeight: "100vh", background: "#000", fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

        .dropdown {
          animation: fadeSlide 0.18s cubic-bezier(0.16,1,0.3,1);
        }
        @keyframes fadeSlide {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .nav-btn {
          color: #9ca3af;
          font-size: 13.5px;
          font-weight: 500;
          padding: 6px 14px;
          border-radius: 8px;
          background: none;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 4px;
          position: relative;
          transition: color 0.15s;
        }
        .nav-btn:hover, .nav-btn.open { color: #fff; }

        .caret { transition: transform 0.2s; display: inline-block; }
        .caret.open { transform: rotate(180deg); }

        .menu-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 10px 12px;
          border-radius: 10px;
          text-decoration: none;
          transition: background 0.12s;
        }
        .menu-item:hover { background: #f3f4f6; }

        .item-icon {
          width: 34px;
          height: 34px;
          border-radius: 8px;
          background: #f3f4f6;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #6b7280;
          flex-shrink: 0;
          margin-top: 1px;
          transition: background 0.12s, color 0.12s;
        }
        .menu-item:hover .item-icon {
          background: #fff;
          color: #06b6d4;
        }

        .item-label {
          font-size: 13.5px;
          font-weight: 500;
          color: #111827;
          line-height: 1.3;
        }
        .item-desc {
          font-size: 12px;
          color: #9ca3af;
          line-height: 1.4;
          margin-top: 2px;
        }

        .section-title {
          font-size: 11px;
          font-weight: 600;
          color: #9ca3af;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-bottom: 6px;
        }

        .featured-cta {
          background: #f9fafb;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          font-size: 13px;
          font-weight: 600;
          color: #374151;
          text-decoration: none;
          transition: background 0.12s;
          border-top: 1px solid #f3f4f6;
        }
        .featured-cta:hover { background: #f3f4f6; }

        .bottom-link {
          font-size: 12px;
          color: #9ca3af;
          text-decoration: none;
          transition: color 0.12s;
        }
        .bottom-link:hover { color: #374151; }

        .see-all {
          font-size: 12px;
          font-weight: 600;
          color: #06b6d4;
          text-decoration: none;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          transition: color 0.12s;
        }
        .see-all:hover { color: #0891b2; }

        .search-box {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px;
          padding: 6px 10px;
          transition: border-color 0.15s;
        }
        .search-box:hover { border-color: rgba(255,255,255,0.2); }
        .search-input {
          background: none;
          border: none;
          outline: none;
          font-size: 13px;
          color: #fff;
          width: 160px;
        }
        .search-input::placeholder { color: #6b7280; }

        .kbd {
          font-size: 11px;
          color: #6b7280;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 4px;
          padding: 1px 5px;
        }
      `}</style>

      {/* ── Navbar ── */}
      <nav
        style={{ background: "#000", borderBottom: "1px solid rgba(255,255,255,0.08)", position: "relative", zIndex: 50 }}
        onMouseLeave={() => setActive(null)}
      >
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center", height: 56, gap: 32 }}>

          {/* Logo */}
          <a href="#" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none", flexShrink: 0 }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: "#22d3ee", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/>
                <path d="M9 1v3M15 1v3M9 20v3M15 20v3M1 9h3M1 15h3M20 9h3M20 15h3"/>
              </svg>
            </div>
            <span style={{ color: "#fff", fontWeight: 600, fontSize: 15, letterSpacing: "-0.02em" }}>CoreVault</span>
          </a>

          {/* Nav links */}
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            {navLinks.map((link) => {
              const has = !!menus[link];
              const isOpen = active === link;
              return (
                <button
                  key={link}
                  className={`nav-btn${isOpen ? " open" : ""}`}
                  onMouseEnter={() => setActive(has ? link : null)}
                >
                  {link}
                  {has && (
                    <svg className={`caret${isOpen ? " open" : ""}`} width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
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
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round">
                <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
              </svg>
              <input className="search-input" type="text" placeholder="Search components..." />
              <span className="kbd">⌘K</span>
            </div>

            <button style={{ background: "none", border: "none", color: "#9ca3af", fontSize: 13, fontWeight: 500, cursor: "pointer", padding: "6px 4px" }}
              onMouseEnter={e => e.target.style.color="#fff"} onMouseLeave={e => e.target.style.color="#9ca3af"}>
              Sign In
            </button>

            <button style={{ background: "#22d3ee", border: "none", color: "#000", fontSize: 13, fontWeight: 600, padding: "7px 16px", borderRadius: 8, cursor: "pointer", transition: "background 0.15s" }}
              onMouseEnter={e => e.target.style.background="#67e8f9"} onMouseLeave={e => e.target.style.background="#22d3ee"}>
              Start Building
            </button>
          </div>
        </div>

        {/* ── Dropdown ── */}
        {active && menus[active] && (
          <div className="dropdown" style={{ position: "absolute", top: "100%", left: 0, right: 0, background: "#fff", boxShadow: "0 20px 60px rgba(0,0,0,0.15)", borderTop: "1px solid #f3f4f6" }}>
            <div style={{ maxWidth: 1280, margin: "0 auto", padding: "28px 24px" }}>
              <div style={{ display: "flex", gap: 32 }}>

                {/* Sections */}
                <div style={{ display: "flex", gap: 24, flex: 1 }}>
                  {menus[active].sections.map((section) => (
                    <div key={section.title} style={{ flex: 1, minWidth: 0 }}>
                      <p className="section-title">{section.title}</p>
                      <div>
                        {section.items.map((item) => (
                          <a key={item.label} href="#" className="menu-item">
                            <div className="item-icon">
                              <Icon d={icons[item.icon]} size={16} />
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
                <div style={{ width: 240, flexShrink: 0 }}>
                  <div style={{ borderRadius: 12, overflow: "hidden", border: "1px solid #f3f4f6", height: "100%", display: "flex", flexDirection: "column" }}>
                    <div style={{ background: menus[active].featured.gradient, padding: "20px 18px", flex: 1 }}>
                      <span style={{ display: "inline-block", background: "rgba(0,0,0,0.2)", color: "#fff", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", padding: "3px 8px", borderRadius: 4, marginBottom: 10 }}>
                        {menus[active].featured.badge}
                      </span>
                      <h3 style={{ color: "#fff", fontWeight: 700, fontSize: 16, lineHeight: 1.3, margin: "0 0 8px" }}>
                        {menus[active].featured.title}
                      </h3>
                      <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 12.5, lineHeight: 1.5, margin: 0 }}>
                        {menus[active].featured.desc}
                      </p>
                    </div>
                    <a href="#" className="featured-cta">
                      {menus[active].featured.cta}
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <path d="M5 12h14M12 5l7 7-7 7"/>
                      </svg>
                    </a>
                  </div>
                </div>
              </div>

              {/* Bottom */}
              <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid #f3f4f6", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <a href="#" className="see-all">See all products →</a>
                <div style={{ display: "flex", gap: 20 }}>
                  {["PC Builder", "Compatibility Check", "Price Tracker", "Expert Reviews"].map((l) => (
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
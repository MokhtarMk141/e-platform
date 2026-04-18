"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import MegaMenu from "../../mega-menu/megaMenu";

export default function CheckoutCancelPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");

  return (
    <div style={{ minHeight: "100vh", background: "var(--background)", color: "var(--foreground)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=DM+Sans:wght@400;500;700&display=swap');
      `}</style>
      <MegaMenu />
      <main style={{ maxWidth: 920, margin: "0 auto", padding: "56px 24px 96px" }}>
        <section style={{ borderRadius: 32, border: "1px solid var(--border)", background: "linear-gradient(135deg, rgba(17,24,39,0.04), rgba(255,40,0,0.03))", padding: "48px 40px", boxShadow: "0 24px 60px rgba(0,0,0,0.04)" }}>
          <div style={{ display: "grid", gap: 18 }}>
            <div style={{ width: 72, height: 72, borderRadius: 24, background: "rgba(107,114,128,0.1)", color: "var(--foreground)", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--border)" }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </div>

            <div>
              <p style={{ margin: 0, color: "var(--text-dim)", fontWeight: 900, fontSize: 12, letterSpacing: "0.12em", textTransform: "uppercase" }}>
                Checkout Cancelled
              </p>
              <h1 style={{ margin: "12px 0 0", fontSize: "clamp(34px, 6vw, 56px)", lineHeight: 0.98, letterSpacing: "-0.05em", fontWeight: 900 }}>
                Payment wasn&apos;t completed.
              </h1>
              <p style={{ margin: "18px 0 0", maxWidth: 620, color: "var(--text-muted)", lineHeight: 1.7, fontSize: 16, fontFamily: "'DM Sans', sans-serif" }}>
                No charge was captured. You can head back to checkout and try again when you&apos;re ready.
              </p>
            </div>

            {orderId && (
              <div style={{ padding: "16px 18px", borderRadius: 18, border: "1px solid var(--border)", background: "var(--surface)", fontSize: 13, color: "var(--text-muted)", fontFamily: "'DM Sans', sans-serif" }}>
                Pending order reference: <span style={{ color: "var(--foreground)", fontWeight: 700 }}>{orderId}</span>
              </div>
            )}

            <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
              <Link href="/checkout" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", minWidth: 180, padding: "14px 22px", borderRadius: 16, background: "var(--brand-red)", color: "#fff", textDecoration: "none", fontWeight: 800 }}>
                Return to Checkout
              </Link>
              <Link href="/orders" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", minWidth: 180, padding: "14px 22px", borderRadius: 16, border: "1px solid var(--border)", color: "var(--foreground)", textDecoration: "none", fontWeight: 800, background: "var(--surface)" }}>
                View Orders
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

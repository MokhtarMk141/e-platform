"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useCart } from "@/hooks/useCart";
import MegaMenu from "../../mega-menu/megaMenu";

const FONTS = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=DM+Sans:wght@400;500;700&display=swap');
`;

export default function CheckoutSuccessPage() {
  const { resetCart } = useCart();

  useEffect(() => {
    resetCart();
  }, [resetCart]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--background)",
        color: "var(--foreground)",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
    >
      <style>{`
        ${FONTS}

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(22px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes subtlePulse {
          0%, 100% { transform: scale(1); opacity: 0.12; }
          50% { transform: scale(1.05); opacity: 0.2; }
        }

        @keyframes popIn {
          0% { transform: scale(0.6); opacity: 0; }
          70% { transform: scale(1.08); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }

        @keyframes drawCheck {
          from { stroke-dashoffset: 72; }
          to { stroke-dashoffset: 0; }
        }

        * { box-sizing: border-box; }
        ::selection { background: var(--brand-red); color: #fff; }

        .success-hero {
          position: relative;
          height: 320px;
          overflow: hidden;
          background: linear-gradient(135deg, var(--background) 0%, var(--surface) 100%);
          border-bottom: 1px solid var(--border);
        }

        .success-hero::before {
          content: "";
          position: absolute;
          inset: 0;
          opacity: 0.1;
          background-image: radial-gradient(var(--foreground) 1.2px, transparent 1.2px);
          background-size: 32px 32px;
          pointer-events: none;
        }

        .success-hero-glow {
          position: absolute;
          right: 14%;
          top: 50%;
          width: 520px;
          height: 520px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(255,40,0,0.08) 0%, rgba(34,197,94,0.08) 38%, transparent 72%);
          transform: translateY(-50%);
          animation: subtlePulse 4s ease-in-out infinite;
        }

        .success-hero-inner {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 0 80px;
          max-width: 860px;
          z-index: 10;
        }

        .success-kicker {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
          font-size: 12px;
          letter-spacing: 0.2em;
          color: var(--brand-red);
          font-weight: 800;
          text-transform: uppercase;
        }

        .success-kicker-line {
          width: 30px;
          height: 2px;
          background: var(--brand-red);
          border-radius: 999px;
        }

        .success-heading {
          margin: 0;
          font-size: clamp(46px, 7vw, 70px);
          line-height: 0.98;
          letter-spacing: -0.05em;
          font-weight: 900;
        }

        .success-subheading {
          margin: 18px 0 0;
          max-width: 520px;
          font-size: 16px;
          line-height: 1.7;
          color: var(--text-muted);
          font-family: 'DM Sans', sans-serif;
          font-weight: 500;
        }

        .success-main {
          max-width: 1200px;
          margin: -72px auto 0;
          padding: 0 40px 88px;
          position: relative;
          z-index: 20;
        }

        .success-card {
          max-width: 920px;
          margin: 0 auto;
          border-radius: 30px;
          overflow: hidden;
          border: 1px solid var(--border);
          background: linear-gradient(180deg, var(--background) 0%, var(--surface) 100%);
          box-shadow: 0 24px 60px rgba(0,0,0,0.07);
          animation: fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        .success-top {
          padding: 40px 40px 30px;
          border-bottom: 1px solid var(--border);
          background: linear-gradient(145deg, rgba(255,40,0,0.05), rgba(255,255,255,0));
          display: flex;
          align-items: center;
          gap: 24px;
        }

        .success-icon-wrap {
          position: relative;
          width: 120px;
          height: 120px;
          flex-shrink: 0;
          display: grid;
          place-items: center;
        }

        .success-icon-ring {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(34,197,94,0.2) 0%, rgba(34,197,94,0.08) 48%, transparent 72%);
          animation: subtlePulse 2.6s ease-in-out infinite;
        }

        .success-icon-core {
          position: relative;
          z-index: 2;
          width: 88px;
          height: 88px;
          border-radius: 28px;
          display: grid;
          place-items: center;
          background: linear-gradient(135deg, rgba(34,197,94,0.16), rgba(34,197,94,0.08));
          border: 1px solid rgba(34,197,94,0.22);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.58);
          animation: popIn 0.55s cubic-bezier(0.16, 1, 0.3, 1) 0.12s both;
        }

        .success-check {
          width: 40px;
          height: 40px;
          color: #16a34a;
        }

        .success-check path {
          stroke-dasharray: 72;
          stroke-dashoffset: 72;
          animation: drawCheck 0.6s ease-out 0.24s forwards;
        }

        .success-badge {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 8px 14px;
          border-radius: 999px;
          background: rgba(34,197,94,0.08);
          border: 1px solid rgba(34,197,94,0.18);
          color: #15803d;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        .success-title {
          margin: 16px 0 0;
          font-size: clamp(30px, 5vw, 42px);
          line-height: 1.03;
          letter-spacing: -0.04em;
          font-weight: 900;
        }

        .success-copy {
          margin: 14px 0 0;
          max-width: 520px;
          color: var(--text-muted);
          font-size: 15px;
          line-height: 1.75;
          font-family: 'DM Sans', sans-serif;
        }

        .success-bottom {
          padding: 28px 40px 40px;
          display: grid;
          gap: 24px;
        }

        .success-info {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 16px;
        }

        .success-info-card {
          border-radius: 20px;
          border: 1px solid var(--border);
          background: var(--background);
          padding: 20px;
        }

        .success-info-title {
          margin: 0 0 8px;
          font-size: 14px;
          font-weight: 800;
          letter-spacing: -0.02em;
        }

        .success-info-copy {
          margin: 0;
          color: var(--text-muted);
          font-size: 13px;
          line-height: 1.7;
          font-family: 'DM Sans', sans-serif;
        }

        .success-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 14px;
        }

        .success-cta {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          min-width: 220px;
          min-height: 56px;
          padding: 14px 26px;
          border-radius: 16px;
          text-decoration: none;
          font-size: 14px;
          font-weight: 800;
          transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
        }

        .success-cta-primary {
          background: var(--brand-red);
          color: #fff;
          box-shadow: 0 12px 24px rgba(255,40,0,0.24);
        }

        .success-cta-secondary {
          background: var(--background);
          color: var(--foreground);
          border: 1px solid var(--border);
        }

        .success-cta:hover {
          transform: translateY(-2px);
        }

        .success-cta-secondary:hover {
          border-color: var(--brand-red);
        }

        .success-note {
          padding-top: 20px;
          border-top: 1px solid var(--border);
          color: var(--text-dim);
          font-size: 13px;
          line-height: 1.7;
          font-family: 'DM Sans', sans-serif;
        }

        @media (max-width: 900px) {
          .success-hero-inner {
            padding: 0 32px;
          }

          .success-main {
            padding: 0 24px 72px;
          }

          .success-top,
          .success-bottom {
            padding-left: 24px;
            padding-right: 24px;
          }

          .success-top {
            flex-direction: column;
            align-items: flex-start;
          }

          .success-info {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 640px) {
          .success-hero {
            height: 280px;
          }

          .success-hero-inner {
            padding: 0 24px;
          }

          .success-actions {
            flex-direction: column;
          }

          .success-cta {
            width: 100%;
          }
        }
      `}</style>

      <MegaMenu />

      <section className="success-hero">
        <div className="success-hero-glow" />
        <div className="success-hero-inner">
          <div className="success-kicker">
            <span className="success-kicker-line" />
            Order Complete
          </div>
          <h1 className="success-heading">Payment accepted.</h1>
          <p className="success-subheading">
            Your checkout finished successfully and your cart has been cleared. You can go back to the product page and
            continue shopping anytime.
          </p>
        </div>
      </section>

      <main className="success-main">
        <section className="success-card">
          <div className="success-top">
            <div className="success-icon-wrap">
              <div className="success-icon-ring" />
              <div className="success-icon-core">
                <svg
                  className="success-check"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              </div>
            </div>

            <div>
              <div className="success-badge">Payment Successful</div>
              <h2 className="success-title">Your order is confirmed and your panier is now empty.</h2>
              <p className="success-copy">
                We cleared the cart on the client right away, and the paid order is handled by the backend after checkout.
              </p>
            </div>
          </div>

          <div className="success-bottom">
            <div className="success-info">
              <div className="success-info-card">
                <h3 className="success-info-title">Order confirmed</h3>
                <p className="success-info-copy">The Stripe checkout step finished successfully.</p>
              </div>
              <div className="success-info-card">
                <h3 className="success-info-title">Cart cleared</h3>
                <p className="success-info-copy">The panier was reset so the shopping flow feels fresh again.</p>
              </div>
              <div className="success-info-card">
                <h3 className="success-info-title">Keep browsing</h3>
                <p className="success-info-copy">Use the button below to return to the product page.</p>
              </div>
            </div>

            <div className="success-actions">
              <Link href="/product-page" className="success-cta success-cta-primary">
                Return To Product Page
              </Link>
              <Link href="/orders" className="success-cta success-cta-secondary">
                View Orders
              </Link>
            </div>

            <div className="success-note">
              If the order status takes a moment to refresh, that usually means the payment webhook is still finishing in
              the background.
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

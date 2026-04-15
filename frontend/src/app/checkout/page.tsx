"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { OrderService } from "@/services/order.service";
import { PromotionService } from "@/services/promotion.service";
import { CheckoutRequest, DeliveryMode } from "@/types/order.types";
import MegaMenu from "../mega-menu/megaMenu";

const FONTS = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&display=swap');
`;

const ICONS = {
  user: (props: any) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  mapPin: (props: any) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  ),
  truck: (props: any) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="1" y="3" width="15" height="13" />
      <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
      <circle cx="5.5" cy="18.5" r="2.5" />
      <circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
  ),
  creditCard: (props: any) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
      <line x1="1" y1="10" x2="23" y2="10" />
    </svg>
  ),
  stickyNote: (props: any) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M15.5 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8.5L15.5 3z" />
      <path d="M15 3v6h6" />
    </svg>
  ),
};


const currency = (value: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "TND", maximumFractionDigits: 2 }).format(value);

const DELIVERY_OPTIONS: Array<{ value: DeliveryMode; label: string; description: string }> = [
  { value: "STANDARD", label: "Standard Delivery", description: "3 to 5 business days" },
  { value: "EXPRESS", label: "Express Delivery", description: "1 to 2 business days" },
  { value: "PICKUP", label: "Store Pickup", description: "Collect your order from our pickup point" },
];

/** ── Styles ── **/

const gridTwoCols: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
  gap: 24,
};

const sectionCardStyle: CSSProperties = {
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: 24,
  padding: 32,
  display: "grid",
  boxShadow: "0 8px 30px rgba(0,0,0,0.03)",
};

const inputStyle: CSSProperties = {
  border: "1.5px solid var(--border-strong)",
  borderRadius: 14,
  padding: "14px 16px",
  fontSize: 15,
  background: "var(--background)",
  color: "var(--foreground)",
  fontFamily: "'Plus Jakarta Sans', sans-serif",
  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
  width: '100%',
};

const primaryButtonStyle: CSSProperties = {
  border: "none",
  borderRadius: 16,
  padding: "16px 24px",
  fontSize: 16,
  fontWeight: 800,
  background: "var(--brand-red)",
  color: "#fff",
  cursor: "pointer",
  fontFamily: "'Plus Jakarta Sans', sans-serif",
  boxShadow: '0 8px 20px rgba(255,40,0,0.25)',
  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
  width: '100%',
};

const deliveryOptionStyle: CSSProperties = {
  border: "1.5px solid var(--border)",
  borderRadius: 16,
  padding: "16px 20px",
  display: "flex",
  alignItems: "flex-start",
  gap: 16,
  cursor: "pointer",
  transition: 'all 0.2s ease',
  background: "var(--background)",
};

const activeDeliveryOptionStyle: CSSProperties = {
  ...deliveryOptionStyle,
  borderColor: "var(--brand-red)",
  background: "var(--surface)",
  boxShadow: "0 4px 12px rgba(255,40,0,0.08)",
};

const paymentCardStyle: CSSProperties = {
  border: "1.5px solid rgba(34,197,94,0.2)",
  borderRadius: 16,
  padding: "20px",
  background: "rgba(34,197,94,0.04)",
};

const summaryCardStyle: CSSProperties = {
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: 24,
  padding: 32,
  boxShadow: "0 12px 40px rgba(0,0,0,0.04)",
};

const summaryItemCardStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 16,
};

/** ── Sub-components ── **/

function SectionTitle({ title, subtitle, icon: Icon }: { title: string; subtitle: string; icon: any }) {
  return (
    <div style={{ marginBottom: 32, display: 'flex', gap: 16, alignItems: 'flex-start' }}>
      <div style={{
        width: 44, height: 44, borderRadius: 12, background: 'var(--surface)',
        border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--brand-red)', flexShrink: 0, boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
      }}>
        <Icon />
      </div>
      <div>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 900, letterSpacing: '-0.02em', color: 'var(--foreground)' }}>{title}</h2>
        <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--text-dim)", lineHeight: 1.5, fontFamily: "'DM Sans', sans-serif" }}>{subtitle}</p>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required = false,
  readOnly = false,
  style = {},
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  readOnly?: boolean;
  style?: CSSProperties;
}) {
  return (
    <label style={{ display: 'grid', gap: 10 }}>
      <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        {label} {required ? "*" : ""}
      </span>
      <input
        type={type}
        value={value}
        required={required}
        readOnly={readOnly}
        onChange={(e) => !readOnly && onChange(e.target.value)}
        style={{ ...inputStyle, ...style }}
        autoComplete="off"
      />
    </label>
  );
}

/** ── Main Page ── **/

export default function CheckoutPage() {
  const router = useRouter();
  const { isAuthenticated, syncAuth } = useAuthStore();
  const { cart, loading, fetchCart } = useCart();

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<CheckoutRequest>({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    shippingAddressLine1: "",
    shippingAddressLine2: "",
    shippingCity: "",
    shippingState: "",
    shippingPostalCode: "",
    shippingCountry: "",
    deliveryMode: "STANDARD",
    paymentMethod: "CASH_ON_DELIVERY",
    orderNotes: "",
  });

  const [couponCode, setCouponCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState<{
    code: string;
    amount: number;
    type: string;
  } | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);

  useEffect(() => {
    syncAuth();
  }, [syncAuth]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }
    void fetchCart();
  }, [fetchCart, isAuthenticated, router]);

  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        customerName: user.name || prev.customerName,
        customerEmail: user.email || prev.customerEmail,
        customerPhone: user.phone || prev.customerPhone,
      }));
    }
  }, [user]);

  const isEmpty = useMemo(() => !cart || cart.items.length === 0, [cart]);

  const finalTotal = useMemo(() => {
    if (!cart) return 0;
    return Math.max(0, cart.totalAmount - (appliedDiscount?.amount || 0));
  }, [cart, appliedDiscount]);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim() || !cart) return;
    setError(null);
    setCouponLoading(true);

    try {
      const cartItems = cart.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
      }));

      const res = await PromotionService.validateCoupon(couponCode, cartItems);
      setAppliedDiscount({
        code: res.code,
        amount: res.discountAmount,
        type: res.discountType,
      });
    } catch (err: any) {
      setError(err?.message || "Invalid coupon code");
      setAppliedDiscount(null);
    } finally {
      setCouponLoading(false);
    }
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (isEmpty) {
      setError("Your cart is empty. Please add products before placing an order.");
      return;
    }

    try {
      setSubmitting(true);
      await OrderService.checkout({
        ...form,
        discountCode: appliedDiscount?.code,
        shippingAddressLine2: form.shippingAddressLine2 || undefined,
        shippingState: form.shippingState || undefined,
        shippingPostalCode: form.shippingPostalCode || undefined,
        orderNotes: form.orderNotes || undefined,
      });
      await fetchCart();
      router.push("/orders");
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "message" in err && typeof (err as { message?: unknown }).message === "string"
          ? (err as { message: string }).message
          : "Failed to place order";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div style={{
      fontFamily: "'Plus Jakarta Sans', 'DM Sans', sans-serif",
      background: 'var(--background)', minHeight: '100vh', color: 'var(--foreground)',
    }}>
      <style>{`
        ${FONTS}
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        * { box-sizing: border-box; }
        
        .checkout-layout {
          animation: fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        .section-card {
          transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s ease;
          position: relative;
          overflow: hidden;
        }
        .section-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 3px;
          background: var(--brand-red);
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        .section-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.08) !important;
        }
        .section-card:hover::before {
          opacity: 1;
        }

        .summary-card {
          position: sticky;
          top: 40px;
        }

        input:focus,
        textarea:focus {
          outline: none;
          border-color: var(--brand-red) !important;
          box-shadow: 0 0 0 5px rgba(255, 40, 0, 0.1) !important;
          transform: scale(1.01);
        }

        .add-btn {
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .add-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 24px rgba(255,40,0,0.3) !important;
        }

        .shimmer {
          background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0) 100%);
          background-size: 200% 100%;
          animation: shimmer 2s infinite;
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }

        .stagger-1 { animation-delay: 0.1s; }
        .stagger-2 { animation-delay: 0.2s; }
        .stagger-3 { animation-delay: 0.3s; }
        .stagger-4 { animation-delay: 0.4s; }
        .stagger-5 { animation-delay: 0.5s; }

        .receipt-dashed {
          border-top: 2px dashed var(--border);
          position: relative;
          margin: 24px 0;
        }
        .receipt-dashed::before,
        .receipt-dashed::after {
          content: '';
          position: absolute;
          top: -8px;
          width: 16px; height: 16px;
          background: var(--surface);
          border-radius: 50%;
          border: 1px solid var(--border);
        }
        .receipt-dashed::before { left: -41px; }
        .receipt-dashed::after { right: -41px; }

        @media (max-width: 980px) {
          .checkout-grid {
            grid-template-columns: 1fr !important;
          }
          .summary-card {
            position: relative !important;
            top: 0 !important;
          }
        }
      `}</style>

      <MegaMenu />

      <main style={{ maxWidth: 1400, margin: '0 auto', padding: '40px' }}>
        {/* Breadcrumbs */}
        <div style={{
          marginBottom: 32,
          animation: 'fadeUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) both',
        }}>
          <Link href="/product-page" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            textDecoration: 'none', color: 'var(--text-muted)',
            fontSize: 13, fontWeight: 700,
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back to Shopping
          </Link>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8, marginTop: 12,
            fontSize: 12, color: 'var(--text-dim)', fontWeight: 500,
          }}>
            <span>Cart</span>
            <span>›</span>
            <span style={{ color: 'var(--foreground)', fontWeight: 600 }}>Checkout</span>
          </div>
        </div>

        <div style={{ marginBottom: 48 }}>
          <h1 style={{
            margin: 0, fontSize: 48, fontWeight: 900, letterSpacing: "-0.04em",
            color: 'var(--foreground)', lineHeight: 1,
          }}>
            Checkout
          </h1>
          <p style={{ margin: "16px 0 0", color: "var(--text-muted)", fontSize: 16, maxWidth: 600, lineHeight: 1.6 }}>
            Almost there! Complete your order details below. We currently only offer Cash on Delivery for maximum convenience.
          </p>
        </div>

        <div className="checkout-layout checkout-grid" style={{
          display: 'grid',
          gridTemplateColumns: '1fr 400px',
          gap: 64,
          alignItems: 'start',
        }}>
          <form id="checkout-form" onSubmit={onSubmit} style={{ display: "grid", gap: 32 }}>
            <section className="section-card stagger-1" style={{ ...sectionCardStyle, animation: 'fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both 0.1s' }}>
              <SectionTitle icon={ICONS.user} title="1. Customer Information" subtitle="Who are we delivering to? Ensure your contact info is correct." />
              <div style={gridTwoCols}>
                <Field label="Full Name" value={form.customerName} required onChange={(value) => setForm((prev) => ({ ...prev, customerName: value }))} />
                <Field
                  label="Email (Verified)"
                  value={form.customerEmail}
                  type="email"
                  required
                  readOnly
                  onChange={() => { }} 
                  style={{ background: "var(--surface)", cursor: "not-allowed", color: "var(--text-dim)" }}
                />
              </div>
              <Field label="Phone Number" value={form.customerPhone} required onChange={(value) => setForm((prev) => ({ ...prev, customerPhone: value }))} />
            </section>

            <section className="section-card stagger-2" style={{ ...sectionCardStyle, animation: 'fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both 0.2s' }}>
              <SectionTitle icon={ICONS.mapPin} title="2. Delivery Address" subtitle="Where should we send your package?" />
              <Field
                label="Address Line 1"
                value={form.shippingAddressLine1}
                required
                onChange={(value) => setForm((prev) => ({ ...prev, shippingAddressLine1: value }))}
              />
              <Field
                label="Address Line 2 (Optional)"
                value={form.shippingAddressLine2 ?? ""}
                onChange={(value) => setForm((prev) => ({ ...prev, shippingAddressLine2: value }))}
              />
              <div style={gridTwoCols}>
                <Field label="City" value={form.shippingCity} required onChange={(value) => setForm((prev) => ({ ...prev, shippingCity: value }))} />
                <Field
                  label="State / Region"
                  value={form.shippingState ?? ""}
                  onChange={(value) => setForm((prev) => ({ ...prev, shippingState: value }))}
                />
              </div>
              <div style={gridTwoCols}>
                <Field
                  label="Postal Code"
                  value={form.shippingPostalCode ?? ""}
                  onChange={(value) => setForm((prev) => ({ ...prev, shippingPostalCode: value }))}
                />
                <Field label="Country" value={form.shippingCountry} required onChange={(value) => setForm((prev) => ({ ...prev, shippingCountry: value }))} />
              </div>
            </section>

            <section className="section-card stagger-3" style={{ ...sectionCardStyle, animation: 'fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both 0.3s' }}>
              <SectionTitle icon={ICONS.truck} title="3. Delivery Mode" subtitle="Choose your preferred shipping method." />
              <div style={{ display: "grid", gap: 12 }}>
                {DELIVERY_OPTIONS.map((option) => {
                  const active = form.deliveryMode === option.value;
                  return (
                    <label key={option.value} style={active ? activeDeliveryOptionStyle : deliveryOptionStyle}>
                      <div style={{
                        width: 20, height: 20, borderRadius: '50%', border: `2px solid ${active ? 'var(--brand-red)' : 'var(--border-strong)'}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 2, flexShrink: 0,
                        transition: 'all 0.2s',
                      }}>
                        {active && <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--brand-red)' }} />}
                      </div>
                      <input
                        type="radio"
                        style={{ display: 'none' }}
                        name="deliveryMode"
                        value={option.value}
                        checked={active}
                        onChange={() => setForm((prev) => ({ ...prev, deliveryMode: option.value }))}
                      />
                      <span>
                        <strong style={{ fontSize: 15, color: active ? 'var(--foreground)' : 'var(--text-muted)' }}>{option.label}</strong>
                        <span style={{ display: "block", fontSize: 13, color: "var(--text-dim)", marginTop: 4, fontFamily: "'DM Sans', sans-serif" }}>{option.description}</span>
                      </span>
                    </label>
                  );
                })}
              </div>
            </section>

            <section className="section-card stagger-4" style={{ ...sectionCardStyle, animation: 'fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both 0.4s' }}>
              <SectionTitle icon={ICONS.creditCard} title="4. Payment Method" subtitle="Secure and simple payment options." />
              <div style={paymentCardStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ 
                    width: 44, height: 44, borderRadius: 12, background: 'rgba(34,197,94,0.1)', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#22c55e'
                  }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <rect x="2" y="5" width="20" height="14" rx="2" />
                      <line x1="2" y1="10" x2="22" y2="10" />
                    </svg>
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: 15, fontWeight: 900, color: 'var(--foreground)' }}>Cash on Delivery</p>
                    <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--text-dim)", fontFamily: "'DM Sans', sans-serif" }}>Pay when your order arrives at your door.</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="section-card stagger-5" style={{ ...sectionCardStyle, animation: 'fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both 0.5s' }}>
              <SectionTitle icon={ICONS.stickyNote} title="5. Order Notes" subtitle="Anything else we should know?" />
              <textarea
                rows={4}
                value={form.orderNotes ?? ""}
                onChange={(e) => setForm((prev) => ({ ...prev, orderNotes: e.target.value }))}
                placeholder="e.g. Please leave at the back door or call me upon arrival."
                style={{
                  ...inputStyle,
                  width: '100%',
                  resize: 'none',
                  padding: '16px',
                  minHeight: 120,
                  fontFamily: "'DM Sans', sans-serif",
                }}
              />
            </section>
          </form>

          <aside className="summary-card">
            <div style={summaryCardStyle}>
              <h2 style={{ margin: '0 0 24px', fontSize: 22, fontWeight: 900, letterSpacing: '-0.02em' }}>Order Summary</h2>
              {!cart || cart.items.length === 0 ? (
                <div style={{ 
                  padding: '40px 0', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 
                }}>
                  <div style={{ opacity: 0.1, transform: 'scale(1.5)', marginBottom: 12 }}>
                    <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <circle cx="9" cy="21" r="1" />
                      <circle cx="20" cy="21" r="1" />
                      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                    </svg>
                  </div>
                  <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "var(--text-muted)" }}>Your cart feels lonely.</p>
                  <Link href="/product-page" style={{ 
                    fontSize: 13, fontWeight: 800, color: 'var(--brand-red)', textDecoration: 'none',
                    borderBottom: '1.5px solid var(--brand-red)', paddingBottom: 2
                  }}>
                    Browse Products
                  </Link>
                </div>
              ) : (
                <>
                  <div style={{ display: "grid", gap: 16, marginBottom: 24 }}>
                    {cart.items.map((item) => (
                      <div key={item.id} style={summaryItemCardStyle}>
                        <div style={{ 
                          width: 64, height: 64, borderRadius: 16, background: 'var(--surface)', 
                          border: '1px solid var(--border)', overflow: 'visible', flexShrink: 0,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          position: 'relative',
                        }}>
                          {item.imageUrl ? (
                            <img src={item.imageUrl} alt={item.name} style={{ maxWidth: '80%', maxHeight: '80%', objectFit: 'contain' }} />
                          ) : (
                            <span style={{ fontSize: 20, opacity: 0.2 }}>◈</span>
                          )}
                          <div style={{
                            position: 'absolute', top: -8, right: -8,
                            background: 'var(--foreground)', color: 'var(--background)',
                            width: 22, height: 22, borderRadius: '50%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 10, fontWeight: 900, border: '2px solid var(--surface)',
                          }}>
                            {item.quantity}
                          </div>
                        </div>
                        <div style={{ flex: 1, minWidth: 0, paddingLeft: 8 }}>
                          <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: 'var(--foreground)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {item.name}
                          </p>
                          <p style={{ margin: "4px 0 0", fontSize: 11, color: "var(--text-dim)", fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}>
                            {item.sku}
                          </p>
                        </div>
                        <p style={{ margin: 0, fontSize: 14, fontWeight: 900, color: "var(--foreground)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{currency(item.price * item.quantity)}</p>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'grid', gap: 12, padding: '20px 0', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                      <span style={{ color: "var(--text-dim)", fontWeight: 600 }}>Subtotal</span>
                      <span style={{ fontWeight: 700 }}>{currency(cart.totalAmount)}</span>
                    </div>

                    {appliedDiscount && (
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, color: "#22c55e" }}>
                        <span style={{ fontWeight: 600 }}>Discount ({appliedDiscount.code})</span>
                        <span style={{ fontWeight: 700 }}>-{currency(appliedDiscount.amount)}</span>
                      </div>
                    )}

                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                      <span style={{ color: "var(--text-dim)", fontWeight: 600 }}>Shipping</span>
                      <span style={{ fontWeight: 700, color: '#22c55e' }}>FREE</span>
                    </div>
                  </div>

                  <div style={{ marginTop: 20, display: "flex", justifyContent: "space-between", alignItems: 'center' }}>
                    <span style={{ fontSize: 16, fontWeight: 800 }}>Total</span>
                    <span style={{ fontSize: 28, fontWeight: 900, color: "var(--brand-red)", letterSpacing: '-0.03em' }}>{currency(finalTotal)}</span>
                  </div>

                  <div className="receipt-dashed" />

                  <div style={{ marginTop: 20 }}>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 800, textTransform: "uppercase", color: "var(--text-dim)", marginBottom: 12, letterSpacing: '0.08em' }}>
                      Promo Code
                    </label>
                    <div style={{ display: "flex", gap: 12 }}>
                      <input
                        type="text"
                        placeholder="Enter code"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        style={{ ...inputStyle, flex: 1, padding: "12px 14px", fontSize: 14, borderRadius: 12, borderStyle: 'dashed' }}
                      />
                      <button
                        type="button"
                        onClick={handleApplyCoupon}
                        disabled={couponLoading || !couponCode.trim()}
                        className="add-btn"
                        style={{
                          background: couponCode.trim() ? "var(--foreground)" : "var(--surface)",
                          color: couponCode.trim() ? "var(--background)" : "var(--text-dim)",
                          border: "none", borderRadius: 12, padding: "0 20px", fontSize: 13, fontWeight: 900, cursor: "pointer",
                          transition: 'all 0.2s',
                        }}
                      >
                        {couponLoading ? "..." : "Apply"}
                      </button>
                    </div>
                  </div>
                </>
              )}

              {error && <div style={{ 
                marginTop: 24, padding: '16px 20px', borderRadius: 16, background: 'rgba(239,68,68,0.06)', 
                color: '#ef4444', fontSize: 13, fontWeight: 700, border: '1px solid rgba(239,68,68,0.15)',
                display: 'flex', gap: 12, alignItems: 'center',
                animation: 'fadeUp 0.3s ease-out',
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <div style={{ flex: 1 }}>{error}</div>
              </div>}

              <button 
                form="checkout-form" 
                type="submit" 
                disabled={submitting || loading || isEmpty} 
                className={`add-btn ${!submitting && !loading && !isEmpty ? 'shimmer' : ''}`}
                style={{
                  ...primaryButtonStyle,
                  padding: "18px 24px",
                  marginTop: 32,
                  borderRadius: 18,
                  fontSize: 16,
                  cursor: (submitting || loading || isEmpty) ? 'not-allowed' : 'pointer',
                  opacity: (submitting || loading || isEmpty) ? 0.6 : 1,
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {submitting ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
                    <div style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                    <span>Processing...</span>
                  </div>
                ) : "Confirm & Place Order"}
              </button>
              <p style={{ margin: "16px 0 0", color: "var(--text-dim)", fontSize: 12, lineHeight: 1.6, textAlign: 'center', fontWeight: 500 }}>
                By placing this order, you agree to our terms of service and delivery policies.
              </p>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

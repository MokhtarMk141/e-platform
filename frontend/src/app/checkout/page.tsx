"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { OrderService } from "@/services/order.service";
import { DiscountService } from "@/services/discount.service";
import { CheckoutRequest, DeliveryMode } from "@/types/order.types";

const currency = (value: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "TND", maximumFractionDigits: 2 }).format(value);

const DELIVERY_OPTIONS: Array<{ value: DeliveryMode; label: string; description: string }> = [
  { value: "STANDARD", label: "Standard Delivery", description: "3 to 5 business days" },
  { value: "EXPRESS", label: "Express Delivery", description: "1 to 2 business days" },
  { value: "PICKUP", label: "Store Pickup", description: "Collect your order from our pickup point" },
];

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

      const res = await DiscountService.validateCode(couponCode, cartItems);
      setAppliedDiscount({
        code: res.code,
        amount: res.discountAmount,
        type: res.type,
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
    <main style={pageWrapStyle}>
      <div style={topBarStyle}>
        <div>
          <p style={eyebrowStyle}>Checkout</p>
          <h1 style={{ margin: "4px 0 0", fontSize: 32, fontWeight: 900, letterSpacing: "-0.03em" }}>Place Your Order</h1>
          <p style={{ margin: "8px 0 0", color: "#d1d5db", fontSize: 14, maxWidth: 680 }}>
            Complete the form below to confirm your delivery. Payment is available as Cash on Delivery only.
          </p>
        </div>
        <Link href="/product-page" style={continueBtnStyle}>
          Continue Shopping
        </Link>
      </div>

      <div style={stepsStyle}>
        <span style={stepChipStyle}>1. Your Details</span>
        <span style={stepChipStyle}>2. Delivery Mode</span>
        <span style={stepChipStyle}>3. Confirm Order</span>
      </div>

      <div style={layoutStyle} className="checkout-layout">
        <form id="checkout-form" onSubmit={onSubmit} style={{ display: "grid", gap: 14 }}>
          <section style={sectionCardStyle}>
            <SectionTitle title="Customer Information" subtitle="Use active contact details so we can reach you for delivery updates." />
            <div style={gridTwoCols}>
              <Field label="Full Name" value={form.customerName} required onChange={(value) => setForm((prev) => ({ ...prev, customerName: value }))} />
              <Field
                label="Email Address"
                value={form.customerEmail}
                type="email"
                required
                onChange={(value) => setForm((prev) => ({ ...prev, customerEmail: value }))}
              />
            </div>
            <Field label="Phone Number" value={form.customerPhone} required onChange={(value) => setForm((prev) => ({ ...prev, customerPhone: value }))} />
          </section>

          <section style={sectionCardStyle}>
            <SectionTitle title="Delivery Address" subtitle="Provide your destination address exactly as your courier should see it." />
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
                label="State / Region (Optional)"
                value={form.shippingState ?? ""}
                onChange={(value) => setForm((prev) => ({ ...prev, shippingState: value }))}
              />
            </div>
            <div style={gridTwoCols}>
              <Field
                label="Postal Code (Optional)"
                value={form.shippingPostalCode ?? ""}
                onChange={(value) => setForm((prev) => ({ ...prev, shippingPostalCode: value }))}
              />
              <Field label="Country" value={form.shippingCountry} required onChange={(value) => setForm((prev) => ({ ...prev, shippingCountry: value }))} />
            </div>
          </section>

          <section style={sectionCardStyle}>
            <SectionTitle title="Delivery Mode" subtitle="Select how you want to receive your order." />
            <div style={{ display: "grid", gap: 10 }}>
              {DELIVERY_OPTIONS.map((option) => {
                const active = form.deliveryMode === option.value;
                return (
                  <label key={option.value} style={active ? activeDeliveryOptionStyle : deliveryOptionStyle}>
                    <input
                      type="radio"
                      name="deliveryMode"
                      value={option.value}
                      checked={active}
                      onChange={() => setForm((prev) => ({ ...prev, deliveryMode: option.value }))}
                    />
                    <span>
                      <strong style={{ fontSize: 14 }}>{option.label}</strong>
                      <span style={{ display: "block", fontSize: 12, color: "var(--text-dim)", marginTop: 2 }}>{option.description}</span>
                    </span>
                  </label>
                );
              })}
            </div>
          </section>

          <section style={sectionCardStyle}>
            <SectionTitle title="Payment" subtitle="Only one method is enabled for now." />
            <div style={paymentCardStyle}>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 800 }}>Cash on Delivery</p>
              <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--text-dim)" }}>You pay in cash when the order arrives.</p>
            </div>
          </section>

          <section style={sectionCardStyle}>
            <SectionTitle title="Order Notes (Optional)" subtitle="Add delivery instructions like gate code, floor, or landmark." />
            <div style={fieldCardStyle}>
              <textarea
                rows={4}
                value={form.orderNotes ?? ""}
                onChange={(e) => setForm((prev) => ({ ...prev, orderNotes: e.target.value }))}
                placeholder="Example: Ring apartment 302, leave with receptionist."
                style={inputStyle}
              />
            </div>
          </section>
        </form>

        <aside style={summaryWrapStyle}>
          <div style={summaryCardStyle}>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>Order Summary</h2>
            {!cart || cart.items.length === 0 ? (
              <p style={{ marginTop: 12, fontSize: 13, color: "var(--text-muted)" }}>Your cart is empty.</p>
            ) : (
              <>
                <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
                  {cart.items.map((item) => (
                    <div key={item.id} style={summaryItemCardStyle}>
                      <div style={{ minWidth: 0 }}>
                        <p style={{ margin: 0, fontSize: 13, fontWeight: 700 }}>{item.name}</p>
                        <p style={{ margin: "3px 0 0", fontSize: 11, color: "var(--text-dim)" }}>
                          Qty {item.quantity} | {item.sku}
                        </p>
                      </div>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 800, color: "var(--brand-red)" }}>{currency(item.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>
                <div style={summaryTotalsStyle}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                    <span style={{ color: "var(--text-muted)" }}>Items</span>
                    <strong>{cart.totalItems}</strong>
                  </div>

                  {appliedDiscount && (
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#10b981" }}>
                      <span>Discount ({appliedDiscount.code})</span>
                      <strong>-{currency(appliedDiscount.amount)}</strong>
                    </div>
                  )}

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ color: "var(--text-muted)", fontSize: 13 }}>Total</span>
                    <strong style={{ fontSize: 22, letterSpacing: "-0.03em", color: "var(--brand-red)" }}>{currency(finalTotal)}</strong>
                  </div>
                </div>

                {/* Coupon Code Input */}
                <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px dashed #d1d5db" }}>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 800, textTransform: "uppercase", color: "#6b7280", marginBottom: 6 }}>
                    Have a coupon?
                  </label>
                  <div style={{ display: "flex", gap: 8 }}>
                    <input
                      type="text"
                      placeholder="Enter code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      style={{ ...inputStyle, flex: 1, padding: "8px 10px", fontSize: 13 }}
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      disabled={couponLoading || !couponCode.trim()}
                      style={{
                        background: "#111827",
                        color: "#fff",
                        border: "none",
                        borderRadius: 8,
                        padding: "0 16px",
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      {couponLoading ? "..." : "Apply"}
                    </button>
                  </div>
                </div>
              </>
            )}

            {error && <p style={{ margin: "12px 0 0", color: "#dc2626", fontSize: 13 }}>{error}</p>}

            <button form="checkout-form" type="submit" disabled={submitting || loading || isEmpty} style={primaryButtonStyle}>
              {submitting ? "Placing Order..." : "Place Order"}
            </button>
            <p style={{ margin: "8px 0 0", color: "var(--text-dim)", fontSize: 11, lineHeight: 1.5 }}>
              By placing this order, stock is reserved and your cart will be cleared automatically.
            </p>
          </div>
        </aside>
      </div>

      <style jsx>{`
        input:focus,
        textarea:focus {
          outline: none;
          border-color: var(--brand-red) !important;
          box-shadow: 0 0 0 3px rgba(255, 40, 0, 0.12);
        }

        @media (max-width: 980px) {
          .checkout-layout {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </main>
  );
}

function SectionTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div style={{ marginBottom: 2 }}>
      <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800 }}>{title}</h2>
      <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--text-dim)", lineHeight: 1.6 }}>{subtitle}</p>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <label style={fieldCardStyle}>
      <span style={{ fontSize: 12, fontWeight: 700 }}>
        {label} {required ? "*" : ""}
      </span>
      <input type={type} value={value} required={required} onChange={(e) => onChange(e.target.value)} style={inputStyle} />
    </label>
  );
}

const gridTwoCols: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 12,
};

const pageWrapStyle: CSSProperties = {
  maxWidth: 1200,
  margin: "0 auto",
  padding: "28px 20px 40px",
  fontFamily: "'Plus Jakarta Sans', sans-serif",
};

const topBarStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: 12,
  flexWrap: "wrap",
  border: "1px solid #1f2937",
  borderRadius: 16,
  padding: 16,
  background: "linear-gradient(135deg, #111827 0%, #1f2937 62%, #374151 100%)",
  color: "#f9fafb",
};

const layoutStyle: CSSProperties = {
  marginTop: 18,
  display: "grid",
  gridTemplateColumns: "minmax(0, 1.65fr) minmax(300px, 1fr)",
  gap: 16,
  alignItems: "start",
};

const sectionCardStyle: CSSProperties = {
  background: "var(--surface)",
  border: "1px solid #d1d5db",
  borderRadius: 14,
  padding: 16,
  display: "grid",
  gap: 12,
  boxShadow: "0 8px 24px rgba(0,0,0,0.04)",
};

const inputStyle: CSSProperties = {
  border: "1px solid var(--border)",
  borderRadius: 10,
  padding: "10px 11px",
  fontSize: 14,
  background: "var(--background)",
  color: "var(--foreground)",
  fontFamily: "'Plus Jakarta Sans', sans-serif",
};

const fieldCardStyle: CSSProperties = {
  display: "grid",
  gap: 6,
  border: "1px solid #d1d5db",
  borderRadius: 12,
  background: "var(--background)",
  padding: 10,
};

const primaryButtonStyle: CSSProperties = {
  border: "none",
  borderRadius: 10,
  padding: "13px 14px",
  fontSize: 14,
  fontWeight: 800,
  background: "var(--brand-red)",
  color: "#fff",
  cursor: "pointer",
  fontFamily: "'Plus Jakarta Sans', sans-serif",
  marginTop: 12,
  width: "100%",
};

const continueBtnStyle: CSSProperties = {
  textDecoration: "none",
  border: "1px solid #4b5563",
  background: "#111827",
  color: "#f9fafb",
  borderRadius: 10,
  padding: "10px 14px",
  fontSize: 13,
  fontWeight: 800,
};

const stepsStyle: CSSProperties = {
  marginTop: 14,
  display: "flex",
  gap: 8,
  flexWrap: "wrap",
};

const stepChipStyle: CSSProperties = {
  fontSize: 12,
  fontWeight: 700,
  color: "#374151",
  background: "#f3f4f6",
  border: "1px solid #d1d5db",
  borderRadius: 999,
  padding: "6px 10px",
};

const deliveryOptionStyle: CSSProperties = {
  border: "1px solid var(--border)",
  borderRadius: 10,
  padding: "10px 12px",
  display: "flex",
  alignItems: "flex-start",
  gap: 10,
  cursor: "pointer",
  background: "var(--background)",
};

const activeDeliveryOptionStyle: CSSProperties = {
  ...deliveryOptionStyle,
  border: "1px solid #111827",
  boxShadow: "0 0 0 1px rgba(17,24,39,0.14) inset",
};

const paymentCardStyle: CSSProperties = {
  border: "1px solid rgba(34,197,94,0.35)",
  borderRadius: 10,
  padding: "10px 12px",
  background: "rgba(34,197,94,0.08)",
};

const summaryWrapStyle: CSSProperties = {
  position: "sticky",
  top: 20,
};

const summaryCardStyle: CSSProperties = {
  background: "linear-gradient(180deg, rgba(17,24,39,0.06) 0%, var(--surface) 26%)",
  border: "1px solid #d1d5db",
  borderRadius: 14,
  padding: 16,
  height: "fit-content",
  boxShadow: "0 16px 34px rgba(0,0,0,0.08)",
};

const summaryTotalsStyle: CSSProperties = {
  borderTop: "1px solid #d1d5db",
  marginTop: 12,
  paddingTop: 12,
  display: "grid",
  gap: 8,
};

const summaryItemCardStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: 10,
  border: "1px solid #d1d5db",
  borderRadius: 10,
  background: "var(--background)",
  padding: "10px 11px",
};

const eyebrowStyle: CSSProperties = {
  margin: 0,
  color: "#fca5a5",
  textTransform: "uppercase",
  letterSpacing: "0.12em",
  fontSize: 11,
  fontWeight: 800,
};

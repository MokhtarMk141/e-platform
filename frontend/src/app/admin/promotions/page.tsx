"use client";

import Link from "next/link";

const cards = [
  {
    title: "Product Discounts",
    description: "Target individual products with percentage or fixed promotions.",
    href: "/admin/promotions/product-discounts",
  },
  {
    title: "Category Discounts",
    description: "Apply storewide category pricing rules without editing products one by one.",
    href: "/admin/promotions/category-discounts",
  },
  {
    title: "Flash Sales",
    description: "Launch time-based sales across one or many products with priority over other discounts.",
    href: "/admin/promotions/flash-sales",
  },
  {
    title: "Coupons",
    description: "Create coupon codes with schedule, usage limits, and activation control.",
    href: "/admin/promotions/coupons",
  },
];

export default function PromotionsHomePage() {
  return (
    <div style={{ padding: 32, fontFamily: "'Plus Jakarta Sans', sans-serif", flex: 1 }}>
      <h1 style={{ margin: 0, fontSize: 30, fontWeight: 900, letterSpacing: "-0.04em" }}>Promotions</h1>
      <p style={{ margin: "8px 0 0", color: "var(--text-muted)", maxWidth: 760 }}>
        Centralize discount logic here. Product prices stay clean, while promotions control the storefront dynamically.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 18, marginTop: 28 }}>
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            style={{
              textDecoration: "none",
              color: "inherit",
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 20,
              padding: 24,
              display: "block",
            }}
          >
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>{card.title}</h2>
            <p style={{ margin: "10px 0 0", color: "var(--text-muted)", lineHeight: 1.6 }}>{card.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

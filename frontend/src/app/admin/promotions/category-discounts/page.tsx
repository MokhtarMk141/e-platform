"use client";

import PromotionsManager from "@/components/admin/PromotionsManager";

export default function CategoryDiscountsPage() {
  return (
    <PromotionsManager
      mode="category"
      title="Category Discounts"
      description="Discount every product inside a selected category without modifying individual catalog entries."
    />
  );
}

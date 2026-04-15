"use client";

import PromotionsManager from "@/components/admin/PromotionsManager";

export default function ProductDiscountsPage() {
  return (
    <PromotionsManager
      mode="product"
      title="Product Discounts"
      description="Create targeted promotions for individual products with fixed or percentage values, scheduling, and activation controls."
    />
  );
}

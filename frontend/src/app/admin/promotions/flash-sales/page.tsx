"use client";

import PromotionsManager from "@/components/admin/PromotionsManager";

export default function FlashSalesPage() {
  return (
    <PromotionsManager
      mode="flash"
      title="Flash Sales"
      description="Run time-based promotions across one or multiple products. Flash sales override other discounts automatically."
    />
  );
}

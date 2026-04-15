"use client";

import PromotionsManager from "@/components/admin/PromotionsManager";

export default function CouponsPage() {
  return (
    <PromotionsManager
      mode="coupon"
      title="Coupons"
      description="Create coupon codes with schedule windows, usage limits, and activation controls for checkout."
    />
  );
}

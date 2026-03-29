import { useState, useEffect, useCallback } from "react";
import { DiscountService, Discount } from "@/services/discount.service";

export function useDiscounts() {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDiscounts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await DiscountService.getAll();
      setDiscounts(data || []);
    } catch (err: any) {
      setError(err.message || "Failed to fetch discounts");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDiscounts();
  }, [fetchDiscounts]);

  return { discounts, loading, error, refetch: fetchDiscounts };
}

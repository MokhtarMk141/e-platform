'use client';

import { useCallback, useEffect, useState } from "react";
import { OrderService } from "@/services/order.service";
import { Order } from "@/types/order.types";

export function useOrders(admin = false) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = admin ? await OrderService.getAllOrders() : await OrderService.getMyOrders();
      setOrders(response.data);
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "message" in err && typeof (err as { message?: unknown }).message === "string"
          ? (err as { message: string }).message
          : "Failed to fetch orders";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [admin]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return { orders, loading, error, refetch: fetchOrders };
}

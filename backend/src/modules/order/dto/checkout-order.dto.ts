import { z } from "zod";

export const checkoutOrderSchema = z.object({
  customerName: z.string().min(2, "Full name is required"),
  customerEmail: z.string().email("A valid email is required"),
  customerPhone: z.string().min(7, "Phone number is required"),
  shippingAddressLine1: z.string().min(3, "Address line 1 is required"),
  shippingAddressLine2: z.string().optional(),
  shippingCity: z.string().min(2, "City is required"),
  shippingState: z.string().optional(),
  shippingPostalCode: z.string().optional(),
  shippingCountry: z.string().min(2, "Country is required"),
  deliveryMode: z.enum(["STANDARD", "EXPRESS", "PICKUP"]).default("STANDARD"),
  paymentMethod: z.literal("CASH_ON_DELIVERY").default("CASH_ON_DELIVERY"),
  orderNotes: z.string().max(500).optional(),
});

export type CheckoutOrderDto = z.infer<typeof checkoutOrderSchema>;

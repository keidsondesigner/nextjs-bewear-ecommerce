import { z } from "zod";

export const finishPurchaseSchema = z.object({
  shippingAddressId: z.string().uuid(),
  items: z.array(z.object({
    productVariantId: z.string().uuid(),
    quantity: z.number().min(1),
  })),
});

export type FinishPurchaseSchema = z.infer<typeof finishPurchaseSchema>;
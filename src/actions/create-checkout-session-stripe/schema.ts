import { z } from "zod";

export const createCheckoutSessionStripeSchema = z.object({
  orderId: z.uuid(),
});

export type CreateCheckoutSessionStripeSchema = z.infer<typeof createCheckoutSessionStripeSchema>;
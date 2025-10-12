// arquivo usado para validar os dados da requisição

import { z } from "zod";

export const updateCartShippingAddressSchema = z.object({
  shippingAddressId: z.string().uuid(),
});

export type UpdateCartShippingAddressSchema = z.infer<typeof updateCartShippingAddressSchema>;

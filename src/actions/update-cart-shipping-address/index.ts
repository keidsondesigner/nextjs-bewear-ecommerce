"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { updateCartShippingAddressSchema, UpdateCartShippingAddressSchema } from "./schema";
import { db } from "@/db";
import { cartTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function updateCartShippingAddress(data: UpdateCartShippingAddressSchema) {
  updateCartShippingAddressSchema.parse(data); // Validar os dados da requisição

  const session = await auth.api.getSession({
    headers: await headers(), // Para pegar o header da requisição
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  // Buscar o carrinho do usuário - verifica se o carrinho pertece ao usuario logado
  const cart = await db.query.cartTable.findFirst({
    where: (cart, { eq }) => eq(cart.userId, session.user.id),
  });

  if (!cart) {
    throw new Error("Cart not found");
  }

  // Verificar se o endereço de envio pertence ao usuário
  const shippingAddress = await db.query.shippingAddressTable.findFirst({
    where: (address, { eq, and }) =>
      and(
        eq(address.id, data.shippingAddressId),
        eq(address.userId, session.user.id)
      ),
  });

  if (!shippingAddress) {
    throw new Error("Shipping address not found or does not belong to user");
  }

  // Atualizar o carrinho com o endereço de envio
  const [updatedCart] = await db
    .update(cartTable)
    .set({
      shippingAddressesId: data.shippingAddressId,
    })
    .where(eq(cartTable.id, cart.id))
    .returning();

  return updatedCart;
}

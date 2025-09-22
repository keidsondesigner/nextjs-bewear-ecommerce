"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { cartTable } from "@/db/schema";

export async function getCart() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const cart = await db.query.cartTable.findFirst({
    where: (cart, { eq }) => eq(cart.userId, session.user.id),
    with: {
      cartItem: {
        with: {
          productVariant: {
            with: {
              product: true,
            },
          },
        },
      },
    },
  });

  if (!cart) {
    // Se o carrinho não existe, crio um carrinho e retorno ele
    const [newCart] = await db.insert(cartTable).values({
      userId: session.user.id,
    }).returning();

    return {
      ...newCart,
      cartItem: [],
      totalPriceInCents: 0,
    };
  }

  return {
    ...cart,
    totalPriceInCents: cart.cartItem.reduce((acc, item) => acc + item.productVariant.priceInCents * item.quantity, 0), // Subtotal do carrinho
  };
}
"use server";

import { db } from "@/db";
import { cartItemTable, cartTable, orderItemTable, orderTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";

export async function finishPurchase() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const cart = await db.query.cartTable.findFirst({
    where: eq(cartTable.userId, session.user.id),
    with: {
      shippingAddresses: true,
      cartItem: {
        with: {
          productVariant: true,
        },
      },
    },
  });

  if (!cart) {
    throw new Error("Cart not found");
  }
  if (!cart.shippingAddresses) {
    throw new Error("Shipping address not found");
  }

  const totalPriceInCents = cart.cartItem.reduce((acc, item) => acc + item.productVariant.priceInCents * item.quantity, 0);

  // O transaction, executa as duas operações em uma única transação;
  // Se uma falhar, ele desfaz a execução da outra.
  await db.transaction(async (tx) => {
    const shippingAddress = cart.shippingAddresses!;
    
    const [order] = await tx.insert(orderTable).values({
      userId: session.user.id!,
      shippingAddressId: shippingAddress.id,
      recipientName: shippingAddress.recipientName,
      street: shippingAddress.street,
      number: shippingAddress.number,
      complement: shippingAddress.complement,
      city: shippingAddress.city,
      state: shippingAddress.state,
      neighborhood: shippingAddress.neighborhood,
      zipCode: shippingAddress.zipCode,
      country: shippingAddress.country,
      phone: shippingAddress.phone,
      email: shippingAddress.email,
      cpfOrCnpj: shippingAddress.cpfOrCnpj,
      totalPriceInCents,
    }).returning();

    if (!order) {
      throw new Error("Order not created");
    }
    
    const orderItemsPayload: Array<typeof orderItemTable.$inferInsert> = cart.cartItem.map((item) => ({
      orderId: order.id,
      productVariantId: item.productVariantId,
      quantity: item.quantity,
    }));

    // Inserir os itens do pedido
    await tx.insert(orderItemTable).values(orderItemsPayload);
    // Deletar os itens do carrinho após a compra
    await tx.delete(cartItemTable).where(eq(cartItemTable.cartId, cart.id));
    // Deletar o carrinho após a compra
    await tx.delete(cartTable).where(eq(cartTable.userId, session.user.id!));
  });
}
"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { addCartProductSchema, AddCartProductSchema } from "./schema";
import { db } from "@/db";
import { cartItemTable, cartTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function addCartProduct(data: AddCartProductSchema) {
  addCartProductSchema.parse(data); // Validar os dados da requisição

  const session = await auth.api.getSession({
    headers: await headers(), // Para pegar o header da requisição
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  // Aqui os dados são validados, agora vamos buscar o produto
  const productVariant = await db.query.productVariantTable.findFirst({
    where: (productVariant, { eq }) => eq(productVariant.id, data.productVariantId),
  });

  if (!productVariant) {
    throw new Error("Product variant not found");
  }

  // Agora vamos buscar o carrinho do usuário
  const cart = await db.query.cartTable.findFirst({
    where: (cart, { eq }) => eq(cart.userId, session.user.id),
  });

  let cartId = cart?.id;

  if (!cart) {
    // Se o carrinho não existe, vamos criar um
    const [newCart] = await db.insert(cartTable).values({
      userId: session.user.id,
    }).returning(); // Retorna o carrinho criado como um array

    cartId = newCart.id;
  }

  // Aqui o produto existe, agora vamos verificar se ele já está no carrinho do usuário
  const cartItem = await db.query.cartItemTable.findFirst({
    where: (cartItem, { eq }) => eq(cartItem.cartId, cartId!) && eq(cartItem.productVariantId, data.productVariantId),
  });

  if (cartItem) {
    // Se o produto já existe no carrinho, vamos atualizar a quantidade
    await db.update(cartItemTable).set({
      quantity: cartItem.quantity + data.quantity,
    }).where(eq(cartItemTable.id, cartItem.id));

    return;
  }

  // Se o produto não existe no carrinho, vamos adicionar ele
  await db.insert(cartItemTable).values({
    cartId: cartId!,
    productVariantId: data.productVariantId,
    quantity: data.quantity,
  });
}
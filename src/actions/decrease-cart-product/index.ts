"use server";

import { DecreaseCartProductQuantitySchema, decreaseCartProductQuantitySchema } from "./schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { cartItemTable } from "@/db/schema";
import { eq } from "drizzle-orm";


export async function decreaseCartProductQuantity(data: DecreaseCartProductQuantitySchema) {
  decreaseCartProductQuantitySchema.parse(data); // Validar os dados da requisição

   // verifica se o usuario esta logado
  const session = await auth.api.getSession({
    headers: await headers(), // Para pegar o header da requisição
  });
  if (!session?.user) { // Se o usuário não está logado, retorna um erro
    throw new Error("Unauthorized");
  }

  // Verifica se o produto existe, e está no carrinho do usuário
  const cartItem = await db.query.cartItemTable.findFirst({
    where: (cartItem, { eq }) => eq(cartItem.id, data.cartItemId),
    with: {
      cart: true,
    },
  });
  // Se o item do carrinho não existe, retorna um erro
  if (!cartItem) {
    throw new Error("Cart item not found");
  }

  // Verifica se o item do carrinho é do usuario logado. Se não for, retorna um erro.
  const cartDoesNotBelongToUser = cartItem.cart.userId !== session.user.id
  if (cartDoesNotBelongToUser) {
    throw new Error("Unauthorized");
  }

  // se tiver apenas 1 item no carrinho, deleta o item
  if (cartItem.quantity === 1) {
    await db.delete(cartItemTable).where(eq(cartItemTable.id, cartItem.id));
    // Invalida o cache da página de identificação do carrinho
    revalidatePath("/cart/identification");
    return;
  }
  // se tiver mais de 1 item no carrinho, decrementa a quantidade
  await db.update(cartItemTable).set({
    quantity: cartItem.quantity - 1,
  }).where(eq(cartItemTable.id, cartItem.id));

  // Invalida o cache da página de identificação do carrinho
  revalidatePath("/cart/identification");

}
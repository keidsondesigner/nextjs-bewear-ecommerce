"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { removeCartProductSchema, RemoveCartProductSchema } from "./schema";
import { db } from "@/db";
import { cartItemTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function removeCartProduct(data: RemoveCartProductSchema) {
  removeCartProductSchema.parse(data); // Validar os dados da requisição

   // verifica se o usuario esta logado
  const session = await auth.api.getSession({
    headers: await headers(), // Para pegar o header da requisição
  });
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  // Verifica se o produto existe, e está no carrinho do usuário
  const cartItem = await db.query.cartItemTable.findFirst({
    where: (cartItem, { eq }) => eq(cartItem.id, data.cartItemId),
    with: {
      cart: true,
    },
  });
  // Verifica se o item do carrinho é do usuario logado. Se não for, retorna um erro.
  const cartDoesNotBelongToUser = cartItem?.cart.userId !== session.user.id
  if (cartDoesNotBelongToUser) {
    throw new Error("Unauthorized");
  }
  if (!cartItem) {
    throw new Error("Cart item not found");
  }

  // Deleta o item do carrinho no banco de dados, seje igual ao id do item deletado do carrinho
  await db.delete(cartItemTable).where(eq(cartItemTable.id, cartItem.id));
}
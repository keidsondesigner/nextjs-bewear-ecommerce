"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { createShippingAddressSchema, CreateShippingAddressSchema } from "./schema";
import { db } from "@/db";
import { shippingAddressTable } from "@/db/schema";
import { revalidatePath } from "next/cache";

export async function createShippingAddress(data: CreateShippingAddressSchema) {
  createShippingAddressSchema.parse(data); // Validar os dados da requisição

  const session = await auth.api.getSession({
    headers: await headers(), // Para pegar o header da requisição
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  // Inserir o endereço de envio no banco de dados
  const [newAddress] = await db.insert(shippingAddressTable).values({
    userId: session.user.id,
    recipientName: data.recipientName,
    street: data.street,
    number: data.number,
    complement: data.complement,
    city: data.city,
    state: data.state,
    neighborhood: data.neighborhood,
    zipCode: data.zipCode,
    country: data.country,
    phone: data.phone,
    email: data.email,
    cpfOrCnpj: data.cpfOrCnpj,
  }).returning();

  // revalidatePath é uma função do Next.js que invalida o cache de uma rota específica.
  // Isso significa que, na próxima requisição para "/cart/identification", o Next.js
  // irá buscar os dados mais recentes do servidor, garantindo que o novo endereço
  // de envio criado seja exibido na página de identificação do carrinho.
  revalidatePath("/cart/identification");

  return newAddress;
}

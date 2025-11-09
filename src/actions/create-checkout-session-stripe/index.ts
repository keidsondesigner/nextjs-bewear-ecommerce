"use server";

import { createCheckoutSessionStripeSchema, CreateCheckoutSessionStripeSchema } from "./schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { orderTable, orderItemTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import Stripe from "stripe"; // Class do stripe

export const createCheckoutSessionStripe = async (data: CreateCheckoutSessionStripeSchema) => {
  // Verifica se a chave secreta do stripe está setada
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not set");
  }

  // Verifica se o usuário está logado
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  // Valida os dados
  const{ orderId } = createCheckoutSessionStripeSchema.parse(data);


  // >*********************************   PEDIDO    ***********************************************<

  // Busca o pedido
  const order = await db.query.orderTable.findFirst({
    where: eq(orderTable.id, orderId),
  });

  // Valida se o pedido existe
  if (!order) {
    throw new Error("Order not found");
  }

  // Valida se o pedido pertence ao usuário logado
  if (order.userId !== session.user.id) {
    throw new Error("Unauthorized");
  }


  // >*********************************   ITENS DO PEDIDO    ***********************************************<


  // Busca os itens do pedido
  const orderItems = await db.query.orderItemTable.findMany({
    where: eq(orderItemTable.orderId, order.id),
    with: {
      productVariant: {
        with: {
          product: true,
        },
      },
    },
  });


  // >*********************************   STRIPE    ***********************************************<


  // Cria uma instância do stripe
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  // Cria uma sessão de checkout
  const checkoutSession = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success`, // Página de sucesso da compra
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/cancel`, // Página de cancelamento da compra
    customer_email: session.user.email, // Email do usuário
    metadata: {
      orderId: orderId, // ID do pedido
    },
    line_items: orderItems.map((orderItem) => ({
      price_data: {
        currency: "brl",
        product_data: {
          name: `${orderItem.productVariant.product.name} - ${orderItem.productVariant.name}`,
          description: orderItem.productVariant.product.description,
          images: [orderItem.productVariant.imageUrl],
        },
        // em centavos
        unit_amount: orderItem.productVariant.priceInCents,
      },
      quantity: orderItem.quantity,
    })),
  });

  // Return only plain object properties to avoid passing class instances to client components
  return {
    id: checkoutSession.id,
    url: checkoutSession.url,
  };
}
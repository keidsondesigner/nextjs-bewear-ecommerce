import { db } from "@/db";
import { orderTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import Stripe from 'stripe';

export const POST = async (request: Request) => {

  // Verifica se a chave secreta do stripe está presente
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.error();
  }

  // O evento é enviado pelo stripe e contém a assinatura do evento
  // Verifica se a chave de assinatura do stripe está presente
  const stripeSignature = request.headers.get("stripe-signature");
  if (!stripeSignature) {
      return NextResponse.error();
  }

  // Verifica se o evento é válido
  // Verifica se o evento é do stripe, e se é válido;
  const text = await request.text();
  const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const event = stripeInstance.webhooks.constructEvent(text, stripeSignature, process.env.STRIPE_WEBHOOK_SECRET!);

  //Os eventos possíveis retornados pelo webhook do stripe são:
  // checkout.session.completed -> Notifica quando uma sessão de checkout é completada, pagamento efetuado com sucesso;
  // checkout.session.expired -> Notifica quando uma sessão de checkout expira, pagamento não efetuado;
  // checkout.session.async_payment_succeeded -> Notifica quando um pagamento assíncrono é realizado com sucesso;
  // checkout.session.async_payment_failed -> Notifica quando um pagamento assíncrono é realizado com falha;
  // checkout.session.async_payment_action_required -> Notifica quando um pagamento assíncrono requer uma ação;

  // Processa o evento
  // Se o evento for do tipo "checkout.session.completed", significa que o pagamento foi efetuado com sucesso;
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    // orderId é o id do pedido em server-action createCheckoutSessionStripe que foi passado no metadata em "Cria uma instância do stripe";
    const orderId = session.metadata?.orderId;
    if (!orderId) {
      return NextResponse.error();
    }

    // Se tenho um orderId, e o webhook foi disparado com "checkout.session.completed", significa que o pagamento foi efetuado com sucesso
    // Então devo atualizar o status do pedido para pago
    // Onde o id do pedido, seja igual ao orderId do metadata, passado no createCheckoutSessionStripe;
    await db.update(orderTable).set({
      status: "paid",
    }).where(eq(orderTable.id, orderId));
  }

    // Retorno uma resposta do evento do hebook do stripe como sucesso "received: true",
    // para que ele possa confirmar que o evento foi processado com sucesso;
    // OBS: O stripe precisa confirmar que o evento foi processado com sucesso, para que ele não tente processar o evento novamente;
  return NextResponse.json({ received: true });
}

// Após criar o webhook do stripe na minha aplicação api/stripe/webhook/route.ts;
// OBS: O webhook do Stripe é um endpoint que recebe os eventos do stripe e processa eles;

// Ir no painel do Stripe, devo configurar o webhook para que o stripe possa enviar o evento para a minha aplicação;
// No campo de busca pesquisar por "Webhooks";

// Configurar o CLI do Stripe;
// https://docs.stripe.com/stripe-cli/install?install-method=windows
//
// no terminal "stripe login" e seguir as instruções;
// no terminal "stripe listen --forward-to localhost:3000/api/stripe/webhook";
// copiar a  "webhook signing secret" que foi gerada pelo CLI do Stripe e colar no campo "webhook signing secret" no painel do Stripe;
// criar uma variavel de ambiente no .env com o nome "STRIPE_WEBHOOK_SECRET" e passar o valor da "webhook signing secret";
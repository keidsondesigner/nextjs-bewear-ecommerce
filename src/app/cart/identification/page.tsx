import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { eq } from "drizzle-orm";
import { db } from "@/db";
import { cartTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import Header from "@/components/header";
import Addresses from "./components/addresses";
import SummaryCartOrder from "./components/summary-cart-order";

const CartIdentificationPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user) {
    redirect("/auth");
  }

  // Busca o carrinho do usuário
  const cart = await db.query.cartTable.findFirst({
    where: eq(cartTable.userId, session.user.id),
    with: {
      cartItem: {
        with: {
          productVariant: true,
        },
      },
    },
  });
  // Se o carrinho não existe ou não tem itens, redireciona para a página principal
  if (!cart || cart?.cartItem.length === 0) {
    redirect("/");
  }

  // Subtotal do carrinho - totalPriceInCents
  const cartTotalPriceInCents = cart.cartItem.reduce(
    (acc, item) => acc + item.productVariant.priceInCents * item.quantity, 0
  );

  return (
    <>
      <Header />
      <div className="max-w-[1280px] mx-auto p-5 gap-4">
        <Addresses />
        <SummaryCartOrder
          subtotalInCents={cartTotalPriceInCents}
          totalInCents={cartTotalPriceInCents}
          products={cart.cartItem.map(item => ({
            id: item.id,
            name: item.productVariant.name,
            variantName: item.productVariant.name,
            quantity: item.quantity,
            priceInCents: item.productVariant.priceInCents,
            imageUrl: item.productVariant.imageUrl,
          }))}
        />
      </div>
    </>
  )
}

export default CartIdentificationPage;
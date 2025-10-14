import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { eq } from "drizzle-orm";
import { db } from "@/db";
import { cartTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import Header from "@/components/header";
import SummaryCartOrder from "../components/summary-cart-order";
import Footer from "@/components/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const CartConfirmationPage = async () => {
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
      shippingAddresses: true,
    },
  });
  // Se o carrinho não existe ou não tem itens, redireciona para a página principal
  if (!cart || cart?.cartItem.length === 0) {
    redirect("/");
  }

  // Se não há endereço de envio selecionado, redireciona para a página de identificação
  if (!cart.shippingAddresses) {
    redirect("/cart/identification");
  }

  // Subtotal do carrinho - totalPriceInCents
  const cartTotalPriceInCents = cart.cartItem.reduce(
    (acc, item) => acc + item.productVariant.priceInCents * item.quantity, 0
  );

  return (
    <>
      <Header />
      <div className="max-w-[1280px] mx-auto justify-center p-5 gap-4 flex flex-col md:flex-row">
        <div className="md:w-1/2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Confirmar entrega</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-sm">
                  <p className="font-medium">
                    {cart.shippingAddresses.recipientName}
                  </p>
                  <p className="text-muted-foreground">
                    {cart.shippingAddresses.street}, {cart.shippingAddresses.number} - {cart.shippingAddresses.neighborhood}
                  </p>
                  <p className="text-muted-foreground">
                  {cart.shippingAddresses.complement ? `, ${cart.shippingAddresses.complement}` : ""}
                  </p>
                  <p className="text-muted-foreground">
                    {cart.shippingAddresses.city} - {cart.shippingAddresses.state}
                  </p>
                  <p className="text-muted-foreground">
                    CEP: {cart.shippingAddresses.zipCode}
                  </p>
                  <p className="text-muted-foreground">
                    Contato: {cart.shippingAddresses.phone}
                  </p>
                </div>
                <Button
                  className="w-full mt-4"
                >
                  Finalizar compra
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="md:w-1/2 mt-4 md:mt-0">
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
      </div>
      <Footer />
    </>
  );
};

export default CartConfirmationPage;
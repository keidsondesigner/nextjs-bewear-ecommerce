import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { eq } from "drizzle-orm";
import { db } from "@/db";
import { cartTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import Header from "@/components/header";
import Addresses from "./components/addresses";

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
      cartItem: true,
    },
  });
  // Se o carrinho não existe ou não tem itens, redireciona para a página principal
  if (!cart || cart?.cartItem.length === 0) {
    redirect("/");
  }

  return (
    <>
      <Header />
      <div className="max-w-[1280px] mx-auto p-5">
        <Addresses />
      </div>
    </>
  )
}

export default CartIdentificationPage;
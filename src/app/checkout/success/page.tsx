"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Header from "@/components/header";

const CheckoutSuccessPage = () => {

  return (
    <>
      <Header />
      <Dialog open={true} onOpenChange={() => {}}>
        <DialogContent className="text-center">
          <Image src="/finish-purchase.svg" alt="Compra finalizada com sucesso" width={300} height={300} className="mx-auto" />
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-center">Pedido efetuado!</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            Seu pedido foi efetuado com sucesso.
            <br />
            Você pode acompanhar o status na seção de &quot;Meus Pedidos&quot;.
          </DialogDescription>
          <DialogFooter className="mx-auto">
            <Button>
              <Link href="/orders">Ver meus pedidos</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/">Voltar para a loja</Link>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CheckoutSuccessPage;
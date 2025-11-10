"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Header from "@/components/header";

const CheckoutCancelPage = () => {

  return (
    <>
      <Header />
      <Dialog open={true} onOpenChange={() => {}}>
        <DialogContent className="text-center">
          <Image src="/cancel-purchase.svg" alt="Compra cancelada" width={300} height={300} className="mx-auto" />
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-center">Pagamento cancelado</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            O pagamento foi cancelado ou ocorreu um erro durante o processo.
            <br />
            Você pode tentar novamente ou continuar comprando.
          </DialogDescription>
          <DialogFooter className="mx-auto">
            <Button variant="outline" asChild>
              <Link href="/">Voltar para a loja</Link>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CheckoutCancelPage;

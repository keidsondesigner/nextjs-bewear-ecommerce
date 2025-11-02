"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useFinishPurchaseMutation } from "@/hooks/mutations/use-finish-purchase";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export const FinishPurchaseButton = () => {
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);

  const router = useRouter();
  const { mutate: finishPurchase, isPending } = useFinishPurchaseMutation();

  const handleFinishPurchase = () => {
    finishPurchase(undefined, {
      onSuccess: () => {
        toast.success("Compra finalizada com sucesso!");
        router.push("/");
      },
      onError: (error) => {
        toast.error(error.message || "Erro ao finalizar a compra");
      }
    });
  };

  return (
    <>
      <Button
        className="w-full mt-4"
        onClick={handleFinishPurchase}
        disabled={isPending}
      >
        {isPending ? "Finalizando..." : "Finalizar compra"}
      </Button>


      <Dialog open={successDialogOpen} onOpenChange={setSuccessDialogOpen}>
        <DialogContent className="text-center">
          <Image src="/finish-purchase.svg" alt="Compra finalizada com sucesso" width={300} height={300} className="mx-auto" />
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-center">Pedido efetuado!</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            <p>Seu pedido foi efetuado com sucesso.</p>
            <p>Você pode acompanhar o status na seção de “Meus Pedidos”.</p>
          </DialogDescription>
          <DialogFooter className="mx-auto">
            <Button onClick={() => setSuccessDialogOpen(false)}>Ver meus pedidos</Button>
            <Button variant="outline" asChild>
              <Link href="/">Voltar para a loja</Link>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

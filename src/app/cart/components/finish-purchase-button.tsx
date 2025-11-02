"use client";

import { Button } from "@/components/ui/button";
import { useFinishPurchaseMutation } from "@/hooks/mutations/use-finish-purchase";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export const FinishPurchaseButton = () => {
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
    <Button
      className="w-full mt-4"
      onClick={handleFinishPurchase}
      disabled={isPending}
    >
      {isPending ? "Finalizando..." : "Finalizar compra"}
    </Button>
  );
};

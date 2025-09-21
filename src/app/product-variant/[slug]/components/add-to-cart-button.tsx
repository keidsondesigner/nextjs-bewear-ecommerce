"use client";

import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addCartProduct } from "@/actions/add-cart-product";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface AddToCartButtonProps {
  productVariantId: string;
  quantity: number;
}

// Recebemos o id da variante do produto e a quantidade
const AddToCartButton = ({ productVariantId, quantity }: AddToCartButtonProps) => {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationKey: ["addCartProduct", productVariantId, quantity],
    mutationFn: () => addCartProduct({ // 1. chamamos a action addCartProduct para adicionar o produto no carrinho.
      productVariantId,
      quantity,
    }),
    onSuccess: (data) => {
      console.log("onSuccess executado:", data);
      toast.success("Produto adicionado ao carrinho");
      // 2. o cache da query ["cart"] do carrinho é invalidado, após adicionar o produto no carrinho.
      // 3. isso faz com que a query seja refetchada[recarregar automaticamente], e o carrinho seja atualizado.
      // 4. a query ["cart"] é uma query que busca o carrinho do usuário. queryKey: ["cart"], queryFn: () =>  getCart(),
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
    onError: (error) => {
      console.error("Erro ao adicionar produto ao carrinho:", error);
      toast.error("Erro ao adicionar produto ao carrinho");
    },
  });

  return (
    <Button
      className="rounded-full"
      size="lg"
      variant="outline"
      disabled={isPending}
      onClick={() => {
        console.log("Botão clicado, executando mutation...");
        mutate();
      }}
    >
      {isPending && <Loader2 className="animate-spin" />}
      Adicionar ao carrinho
    </Button>
  );
};

export default AddToCartButton;
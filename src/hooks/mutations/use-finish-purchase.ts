import { useMutation, useQueryClient } from "@tanstack/react-query";
import { finishPurchase } from "@/actions/finish-purchase";
import { getUseCartQueryKey } from "../queries/use-cart";

export const getFinishPurchaseMutationKey = () => {
  return ["finish-purchase"] as const;
}

export const useFinishPurchaseMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: getFinishPurchaseMutationKey(),
    mutationFn: () => finishPurchase(),
    onSuccess: () => {
      // Invalidar os dados do carrinho para recarregar após a compra
      queryClient.invalidateQueries({ queryKey: getUseCartQueryKey() });
    }
  })
};

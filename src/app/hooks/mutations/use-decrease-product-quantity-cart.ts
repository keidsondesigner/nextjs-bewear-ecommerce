import { useMutation, useQueryClient } from "@tanstack/react-query";
import { decreaseCartProductQuantity } from "@/actions/decrease-cart-product";
import { getUseCartQueryKey } from "../queries/use-cart";

export const getDecreaseCartProductQuantityMutationKey = (cartItemId: string) => {
  return ["decrease-cart-product-quantity", cartItemId] as const;
}

// Hook para decrementar a quantidade de um produto no carrinho
export const useDecreaseCartProductQuantityMutation = (cartItemId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: getDecreaseCartProductQuantityMutationKey(cartItemId),
    mutationFn: () => decreaseCartProductQuantity({ cartItemId: cartItemId }),
    onSuccess: () => {
      // carrega os dados do carrinho novament, invalidando os últimos dados, e trazendo o dados mais atualizados;
      queryClient.invalidateQueries({ queryKey: getUseCartQueryKey() });
    }
  })
};
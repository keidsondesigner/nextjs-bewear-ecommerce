import { removeCartProduct } from "@/actions/remove-cart-product";
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getUseCartQueryKey } from "../queries/use-cart";

export const getRemoveProductFromCartMutationKey = (cartItemId: string) => {
  return ["remove-cart-product", cartItemId] as const;
}

// Hook para remover um produto do carrinho
export const useRemoveProductCartMutation = (cartItemId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: getRemoveProductFromCartMutationKey(cartItemId),
    mutationFn: () => removeCartProduct({ cartItemId: cartItemId }),
    onSuccess: () => {
       // carrega os dados do carrinho novament, invalidando os últimos dados, e trazendo o dados mais atualizados;
      queryClient.invalidateQueries({ queryKey: getUseCartQueryKey() });
    }
  });
}
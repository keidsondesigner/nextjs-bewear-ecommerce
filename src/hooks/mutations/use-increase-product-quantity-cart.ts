import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addCartProduct } from "@/actions/add-cart-product";
import { getUseCartQueryKey } from "../queries/use-cart";

export const getIncreaseCartProductQuantityMutationKey = (productVariantId: string) => {
  return ["increase-cart-product-quantity", productVariantId] as const;
}

export const useIncreaseCartProductQuantityMutation = (productVariantId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: getIncreaseCartProductQuantityMutationKey(productVariantId),
    mutationFn: () => addCartProduct({ productVariantId, quantity: 1 }),
    onSuccess: () => {
      // carrega os dados do carrinho novament, invalidando os últimos dados, e trazendo o dados mais atualizados;
      queryClient.invalidateQueries({ queryKey: getUseCartQueryKey() });
    }
  })
};
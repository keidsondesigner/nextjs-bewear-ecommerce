import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateCartShippingAddress } from "@/actions/update-cart-shipping-address";
import { getUseCartQueryKey } from "../queries/use-cart";
import { UpdateCartShippingAddressSchema } from "@/actions/update-cart-shipping-address/schema";

export const getUpdateCartShippingAddressMutationKey = () => {
  return ["update-cart-shipping-address"] as const;
}

export const useUpdateCartShippingAddressMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: getUpdateCartShippingAddressMutationKey(),
    mutationFn: (data: UpdateCartShippingAddressSchema) => updateCartShippingAddress(data),
    onSuccess: () => {
      // Invalidar os dados do carrinho para recarregar com o endereço atualizado
      queryClient.invalidateQueries({ queryKey: getUseCartQueryKey() });
    }
  })
};

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createShippingAddress } from "@/actions/create-shipping-address";
import { getShippingAddressesQueryKey } from "../queries/use-shipping-addresses";
import { CreateShippingAddressSchema } from "@/actions/create-shipping-address/schema";

export const getCreateShippingAddressMutationKey = () => {
  return ["create-shipping-address"] as const;
}

export const useCreateShippingAddressMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: getCreateShippingAddressMutationKey(),
    mutationFn: (data: CreateShippingAddressSchema) => createShippingAddress(data),
    onSuccess: () => {
      // Invalidar os dados dos endereços para recarregar a lista
      queryClient.invalidateQueries({ queryKey: getShippingAddressesQueryKey() });
    }
  })
};

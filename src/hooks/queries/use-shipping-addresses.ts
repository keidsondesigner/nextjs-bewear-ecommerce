import { getShippingAddresses } from "@/actions/get-shipping-addresses";
import { useQuery } from "@tanstack/react-query";

export const getShippingAddressesQueryKey = () => ["shipping-addresses"] as const;

// Hook para buscar os endereços de envio do usuário
export const useShippingAddresses = () => {
  return useQuery({
    queryKey: getShippingAddressesQueryKey(),
    queryFn: () => getShippingAddresses(),
  });
};

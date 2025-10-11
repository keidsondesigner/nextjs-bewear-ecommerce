import { getCart } from "@/actions/get-cart";
import { useQuery } from "@tanstack/react-query";

export const getUseCartQueryKey = () => ["cart"] as const;

// Hook para buscar o carrinho do usuário
export const useCart = () => {
  return useQuery({
    queryKey: getUseCartQueryKey(),
    queryFn: () => getCart(),
  });
};
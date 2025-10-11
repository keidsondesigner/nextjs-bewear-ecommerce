import { getCart } from "@/actions/get-cart";
import { useQuery } from "@tanstack/react-query";

export const USE_CART_QUERY_KEY = ["cart"] as const;

// Hook para buscar o carrinho do usuário
export const useCart = () => {
  return useQuery({
    queryKey: USE_CART_QUERY_KEY,
    queryFn: () => getCart(),
  });
};
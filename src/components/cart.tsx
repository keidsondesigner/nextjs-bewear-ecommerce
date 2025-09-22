import { ShoppingBasketIcon } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "./ui/sheet";
import { Button } from "./ui/button";
import { useQuery } from "@tanstack/react-query";
import { getCart } from "@/actions/get-cart";
import CartItem from "./cart-item";

const Cart = () => {
  const { data: cart, isPending: cartIsLoading } = useQuery({
    queryKey: ["cart"],
    queryFn: () =>  getCart(),
  });

  return (
    <Sheet>
      <SheetTrigger asChild>
          <Button variant="outline" size="icon">
          <ShoppingBasketIcon />
          </Button>
      </SheetTrigger>

      <SheetContent>
        <SheetHeader>
            <SheetTitle>Carrinho</SheetTitle>
          </SheetHeader>
          <div>
            { cartIsLoading && <p className="text-center p-4">Carregando...</p>}

            {cart?.cartItem.map((item) => (
              <CartItem
                key={item.id}
                id={item.id}
                productName={item.productVariant.product.name}
                productVariantName={item.productVariant.name}
                productVariantImageUrl={item.productVariant.imageUrl}
                productVariantPriceInCents={item.productVariant.priceInCents}
                quantity={item.quantity}
              />
            ))}
          </div>
      </SheetContent>
    </Sheet>
  );
};

export default Cart;
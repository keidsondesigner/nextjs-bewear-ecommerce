import { ShoppingBasketIcon } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "./ui/sheet";
import { Button } from "./ui/button";
import { useQuery } from "@tanstack/react-query";
import { getCart } from "@/actions/get-cart";
import Image from "next/image";
import { formatCentsToBRL } from "@/app/helpers/format-money-brl";

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
            { cartIsLoading && <p>Carregando...</p>}

            {cart?.cartItem.map((item) => (
              <div key={item.id}>
                <Image
                  src={item.productVariant.imageUrl}
                  alt={item.productVariant.name}
                  width={100}
                  height={100}
                />
                <p>{item.productVariant.name}</p>
                <p>{item.quantity}</p>
                <p>{formatCentsToBRL(item.productVariant.priceInCents)}</p>
              </div>
            ))}
          </div>
      </SheetContent>
    </Sheet>
  );
};

export default Cart;
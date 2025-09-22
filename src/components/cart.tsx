import { ShoppingBasketIcon } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "./ui/sheet";
import { Button } from "./ui/button";
import { useQuery } from "@tanstack/react-query";
import { getCart } from "@/actions/get-cart";
import CartItem from "./cart-item";
import { ScrollArea } from "./ui/scroll-area";
import { formatCentsToBRL } from "@/app/helpers/format-money-brl";
import { Separator } from "./ui/separator";

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

      <SheetContent className="flex flex-col">
        <SheetHeader>
            <SheetTitle>Carrinho</SheetTitle>
          </SheetHeader>

          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full">
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
            </ScrollArea>
          </div>

          {cart?.cartItem.length && cart?.cartItem.length > 0 && (
            <div className="flex flex-col gap-4 p-4">
              <Separator />
              <div className="flex justify-between items-center text-sm font-medium">
                <p>Subtotal</p>
                <p>
                  {formatCentsToBRL(cart?.totalPriceInCents ?? 0)}
                </p>
              </div>

              <Separator />
              <div className="flex justify-between items-center text-sm font-medium">
                <p>Entrega</p>
                <p>Grátis</p>
              </div>

              <Separator />
              <div className="flex justify-between items-center text-sm font-medium">
                <p>Total</p>
                <p>
                  {formatCentsToBRL(cart?.totalPriceInCents ?? 0)}
                </p>
              </div>

              <Button className="w-full mt-5">
                Finalizar compra
              </Button>
            </div>
          )}
      </SheetContent>
    </Sheet>
  );
};

export default Cart;
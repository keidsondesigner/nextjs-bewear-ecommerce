import { ShoppingBasketIcon } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "./ui/sheet";
import { Button } from "./ui/button";

const Cart = () => {
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
            <p>Cart</p>
          </div>
      </SheetContent>
    </Sheet>
  );
};

export default Cart;
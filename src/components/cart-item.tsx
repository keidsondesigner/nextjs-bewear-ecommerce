import { formatCentsToBRL } from "@/app/helpers/format-money-brl";
import Image from "next/image";
import { Button } from "./ui/button";
import { MinusIcon, PlusIcon, TrashIcon } from "lucide-react";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { removeCartProduct } from "@/actions/remove-cart-product";

interface CartItemProps {
  id: string;
  productName: string;
  productVariantName: string;
  productVariantImageUrl: string;
  productVariantPriceInCents: number;
  quantity: number;
}

const CartItem = ({
  id,
  productName,
  productVariantName,
  productVariantImageUrl,
  productVariantPriceInCents,
  quantity: initialQuantity,
}: CartItemProps) => {

  const queryClient =  useQueryClient();

  const removeProductCartMutation = useMutation({
    mutationKey: ["remove-cart-product", id],
    mutationFn: () => removeCartProduct({ cartItemId: id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    }
  });

  const handleDeleteClick = () => {
    removeProductCartMutation.mutate(undefined, {
      onSuccess: () => {
        toast.success("Produto removido do carrinho.");
      },
      onError: () => {
        toast.error("Erro ao remover item do carrinho.");
      }
    })
  }

  const [quantity, setQuantity] = useState(initialQuantity);

  const handleQuantityChange = (action: "increment" | "decrement") => {
    if (action === "increment") {
      // Devemos evitar mutações de estado diretamente
      // O último valor, pode não está atualizado
      // setQuantity(quantity + 1);
      // com `prev` pegamos realmente o ultimo valor
      setQuantity(prevQuantity => prevQuantity + 1);
    } else {
      setQuantity(prevQuantity => prevQuantity - 1);
    }
  };
  return (
    <div className="flex items-center justify-between p-4">
      <section className="flex items-center gap-3">
        <Image
          className="rounded-lg"
          src={productVariantImageUrl}
          alt={productVariantName}
          width={70}
          height={70}
        />
        <div className="flex flex-col gap-1">
          <p className="text-sm font-semibold">{productName}</p>
          <p className="text-xs font-medium text-muted-foreground">{productVariantName}</p>

          <div className="flex items-center justify-between rounded-lg border">
            <Button
              className="h-4 w-4"
              variant="ghost"
              onClick={() => handleQuantityChange("decrement")}
              disabled={quantity <= 1}
            >
              <MinusIcon />
            </Button>

            <span className="text-xs font-medium">{quantity}</span>

            <Button
              className="h-4 w-4"
              variant="ghost"
              onClick={() => handleQuantityChange("increment")}
            >
              <PlusIcon />
            </Button>
          </div>
        </div>
      </section>

      <section className="flex gap-4 flex-col items-end">
        <p className="text-sm font-semibold">
          {formatCentsToBRL(productVariantPriceInCents)}
        </p>
        <Button
          size="icon"
          variant="outline"
          onClick={handleDeleteClick}
        >
          <TrashIcon />
        </Button>
      </section>
    </div>
  );
};

export default CartItem;
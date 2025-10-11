import Image from "next/image";
import { formatCentsToBRL } from "@/app/helpers/format-money-brl";
import { Button } from "./ui/button";
import { MinusIcon, PlusIcon, TrashIcon } from "lucide-react";

import { useRemoveProductCartMutation } from "@/app/hooks/mutations/use-remove-product-from-cart";
import { useDecreaseCartProductQuantityMutation } from "@/app/hooks/mutations/use-decrease-product-quantity-cart";
import { useIncreaseCartProductQuantityMutation } from "@/app/hooks/mutations/use-increase-product-quantity-cart";

import { toast } from "sonner";

interface CartItemProps {
  id: string;
  productVariantId: string;
  productName: string;
  productVariantName: string;
  productVariantImageUrl: string;
  productVariantPriceInCents: number;
  quantity: number;
}

const CartItem = ({
  id,
  productVariantId,
  productName,
  productVariantName,
  productVariantImageUrl,
  productVariantPriceInCents,
  quantity,
}: CartItemProps) => {

  const increaseCartProductQuantityMutation = useIncreaseCartProductQuantityMutation(productVariantId);
  const decreaseCartProductQuantityMutation = useDecreaseCartProductQuantityMutation(id);
  const removeProductCartMutation = useRemoveProductCartMutation(id);

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

  const handleDecreaseCartProductQuantity = () => {
    decreaseCartProductQuantityMutation.mutate(undefined, {
      onSuccess: () => {
        toast.success("Quantidade do produto decrementada.");
      }
    });
  }

  const handleIncreaseCartProductQuantity = () => {
    increaseCartProductQuantityMutation.mutate(undefined, {
      onSuccess: () => {
        toast.success("Quantidade do produto incrementada.");
      }
    });
  }

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
              onClick={handleDecreaseCartProductQuantity}
              disabled={quantity <= 1}
            >
              <MinusIcon />
            </Button>

            <span className="text-xs font-medium">{quantity}</span>

            <Button
              className="h-4 w-4"
              variant="ghost"
              onClick={handleIncreaseCartProductQuantity}
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
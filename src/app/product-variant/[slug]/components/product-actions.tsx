"use client";

import { Button } from "@/components/ui/button";
import AddToCartButton from "./add-to-cart-button";
import { MinusIcon, PlusIcon } from "lucide-react";
import { useState } from "react";

interface ProductActionsProps {
  productVariantBySlugId: string;
  productDescription: string;
}

const ProductActions = ({ productVariantBySlugId, productDescription }: ProductActionsProps) => {
  const [quantity, setQuantity] = useState(1);

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
    <>
      {/* Quantity selector */}
      <div className="space-y-4">
        <h3 className="text-sm md:text-lg font-medium">Quantidade</h3>
        <div className="flex w-[100px] items-center justify-between rounded-lg border">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => handleQuantityChange("decrement")}
            disabled={quantity <= 1}
          >
            <MinusIcon />
          </Button>

          <span>{quantity}</span>

          <Button
            size="icon"
            variant="ghost"
            onClick={() => handleQuantityChange("increment")}
          >
            <PlusIcon />
          </Button>
        </div>
      </div>

      {/* Add to cart button */}
      <div className="flex flex-col gap-4 mt-8">
        <AddToCartButton
          productVariantId={productVariantBySlugId}
          quantity={quantity}
        />

        <Button
          className="rounded-full"
          size="lg"
          variant="default"
        >
          Comprar agora
        </Button>
    </div>
    <p className="text-sm lg:text-lg font-medium text-muted-foreground my-4">
      {productDescription}
    </p>
  </>
  );
};

export default ProductActions;
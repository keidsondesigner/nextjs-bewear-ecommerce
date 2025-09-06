"use client";

import { Button } from "@/components/ui/button";
import { MinusIcon, PlusIcon } from "lucide-react";
import { useState } from "react";

const QuantitySelector = () => {
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
  );
};

export default QuantitySelector;

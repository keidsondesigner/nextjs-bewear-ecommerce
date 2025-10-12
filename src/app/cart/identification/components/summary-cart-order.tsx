import Image from "next/image";
import { formatCentsToBRL } from "@/app/helpers/format-money-brl";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { MinusIcon, PlusIcon, TrashIcon } from "lucide-react";

interface SummaryCartOrderProps {
  subtotalInCents: number;
  totalInCents: number;
  products: Array<{
    id: string;
    name: string;
    variantName: string;
    quantity: number;
    priceInCents: number;
    imageUrl: string;
  }>;
}

const SummaryCartOrder = ({ subtotalInCents, totalInCents, products }: SummaryCartOrderProps) => {
  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Resumo do pedido</CardTitle>
      </CardHeader>
      <CardContent>
        <section className="flex flex-col gap-2 mb-6">
          <div className="flex justify-between items-center">
            <p className="text-muted-foreground text-lg font-medium">Subtotal</p>
            <p className="text-muted-foreground text-lg font-medium">
              {formatCentsToBRL(subtotalInCents)}
            </p>
          </div>
          <div className="flex justify-between items-center">
            <p className="text-muted-foreground text-lg font-medium">Transporte e Manuseio</p>
            <p className="text-muted-foreground text-lg font-medium">
              Grátis
            </p>
          </div>
          <div className="flex justify-between items-center">
            <p className="text-muted-foreground text-lg font-medium">Taxa Estimada</p>
            <p className="text-muted-foreground text-lg font-medium">
              --
            </p>
          </div>
          <div className="flex justify-between items-center">
            <p className="text-lg font-semibold">Total</p>
            <p className="text-lg font-semibold">
              {formatCentsToBRL(totalInCents)}
            </p>
          </div>
        </section>

        <Separator />

        {products?.map(product => (
          <section className="flex items-center justify-between mt-6" key={product.id}>
            <div className="flex items-center gap-3">
              <Image
                className="rounded-lg"
                src={product.imageUrl}
                alt={product.name}
                width={70}
                height={70}
              />
              <div className="flex flex-col gap-1">
                <p className="text-lg font-medium">{product.name}</p>
                <p className="font-medium text-muted-foreground">{product.variantName}</p>
                <p className="font-medium text-muted-foreground">{product.quantity}x</p>
              </div>
            </div>
            <p className="text-lg font-medium">
              {formatCentsToBRL(product.priceInCents)}
            </p>
          </section>
        ))}

      </CardContent>
    </Card>
  )
}

export default SummaryCartOrder;
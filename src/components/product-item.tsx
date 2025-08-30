"use client";
import Image from "next/image";

import { productTable, productVariantTable } from "@/db/schema";
import Link from "next/link";
import { formatCentsToBRL } from "@/app/helpers/format-money-brl";

// Tipagem uma lista de produtos;
// Cada produto terá uma lista de variantes;
interface ProductListProps {
  product: typeof productTable.$inferSelect & {
    variants: (typeof productVariantTable.$inferSelect)[];
  };
}

export default function ProductItem({ product }: ProductListProps) {
  const firstVariant = product.variants[0];
  return (
    <Link href={`/product-variant/${firstVariant.slug}`}>
      <Image
        src={firstVariant.imageUrl}
        alt={firstVariant.name}
        width={200}
        height={200}
        className="rounded-3xl"
      />
      <div className="flex flex-col gap-1 mt-4">
        <p className="truncate text-sm font-medium">
          {product.name}
        </p>
        <p className="truncate text-xs text-muted-foreground font-medium mb-2">
          {product.description}
        </p>
        <p className="truncate text-sm font-bold">
          {formatCentsToBRL(firstVariant.priceInCents)}
        </p>
      </div>
    </Link>
  )
}
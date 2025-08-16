"use client";
import Image from "next/image";

import { productTable, productVariantTable } from "@/db/schema";
import Link from "next/link";

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
    <Link href={`/product/${firstVariant.productId}`}>
      <Image
        src={firstVariant.imageUrl}
        alt={firstVariant.name}
        width={100}
        height={100}
        className="rounded-3xl"
      />
      <div className="flex flex-col gap-1">
        <p className="truncate text-sm font-medium">
          {product.name}
        </p>
        <p className="truncate text-xs text-muted-foreground font-medium">
          {product.description}
        </p>
      </div>
    </Link>
  )
}
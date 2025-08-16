"use client";

import { productTable, productVariantTable } from "@/db/schema";
import ProductItem from "./product-item";


// Tipagem uma lista de produtos;
// Cada produto terá uma lista de variantes;
interface ProductListProps {
  title: string;
  products: (typeof productTable.$inferSelect & {
    variants: (typeof productVariantTable.$inferSelect)[];
  })[];
}

export default function ProductList({ products, title }: ProductListProps) {
  return (
    <>
      <h3 className="text-base lg:text-2xl font-bold text-gray-900 mb-8">
        {title}
      </h3>
      {products.map((product) => (
        <ProductItem key={product.id} product={product} />
      ))}
    </>
  )
}
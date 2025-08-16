"use client";

import { productTable, productVariantTable } from "@/db/schema";
import ProductItem from "./product-item";

import { useState } from "react";
import { Carousel, CarouselApi, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

// Tipagem uma lista de produtos;
// Cada produto terá uma lista de variantes;
interface ProductListProps {
  title: string;
  products: (typeof productTable.$inferSelect & {
    variants: (typeof productVariantTable.$inferSelect)[];
  })[];
}

export default function ProductList({ products, title }: ProductListProps) {
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();

  return (
    <>
      <h3 className="text-base lg:text-2xl font-bold text-gray-900 mb-8">
        {title}
      </h3>
      <Carousel
        setApi={setCarouselApi}
        opts={{
          align: "start",
          dragFree: true,
        }}
        orientation="horizontal"
        className="w-full"
      >
        <CarouselContent>
          {products.map((product) => (
            <CarouselItem key={product.id} className="basis-1/3 sm:basis-2/14 ml-4 sm:ml-6 md:ml-12">
              <div className="flex flex-col cursor-pointer">
                <ProductItem product={product} />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </>
  )
}
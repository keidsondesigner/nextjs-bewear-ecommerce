"use client"

import { useState } from "react";
import Image from "next/image";

import { Carousel, CarouselApi, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

export default function CarouselUi() {
  const [api, setApi] = useState<CarouselApi>();

  const brands = [
    { name: "Adidas", logo: "/logo-adidas.svg" },
    { name: "Converse", logo: "/logo-converse.svg" },
    { name: "New Balance", logo: "/logo-new-balance.svg" },
    { name: "Nike", logo: "/logo-nike.svg" },
    { name: "Polo", logo: "/logo-polo.svg" },
    { name: "Puma", logo: "/logo-puma.svg" },
    { name: "Zara", logo: "/logo-zara.svg" }
  ];
  return (
    <>
      <Carousel
        setApi={setApi}
        opts={{
          align: "start",
          loop: true,
          dragFree: true,
        }}
        orientation="horizontal"
        plugins={[
          Autoplay({
            delay: 2000,
            stopOnInteraction: false,
            stopOnMouseEnter: false,
          }),
        ]}
        className="w-full"
      >
        <CarouselContent>
          {brands.map((brand, index) => (
            <CarouselItem key={index} className="basis-1/3 sm:basis-2/11">
              <div className="flex flex-col items-center space-y-3 group cursor-pointer">
                <Image
                  className="w-full md:w-fit h-auto"
                  src={brand.logo}
                  alt={brand.name}
                  width={0}
                  height={0}
                  sizes="100vw"
                />
                {/* <span className="text-sm font-medium text-gray-700 group-hover:text-purple-600 transition-colors text-center">
                  {brand.name}
                </span> */}
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </>
  );
}

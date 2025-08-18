
import Image from "next/image";

import Header from "@/components/header";

import { Button } from "@/components/ui/button";
import CarouselUi from "@/components/carousel-ui";
import { db } from "@/db";
import ProductList from '../components/product-list';
import ProductCategorySelector from "@/components/product-category-selector";
import { productTable } from "@/db/schema";
import { desc } from "drizzle-orm";

export default async function Home() {
  const productsList = await db.query.productTable.findMany({
    with: {
      variants: true,
    },
  });
  console.log(productsList, "productsList");

  const productsCategories = await db.query.categoryTable.findMany();
  console.log(productsCategories, "productsCategories");

  // Ordenando os produtos por data de criação (mais recentes primeiro)
  // Isso é útil para a seção de "Novidades"
  const productsNewsAddedList = await db.query.productTable.findMany({
    orderBy: [desc(productTable.createdAt)],
    with: {
      variants: true,
    },
  });
  console.log(productsList, "productsList");

  return (
    <>
      <Header />
      <main className="max-w-[1280px] mx-auto px-5 space-y-6 mb-12">
        {/*HERO SECTION */}
        <section className="relative">
          {/*HERO BANNER || SE MOBILE */}
          <Button
            size="lg"
            className="absolute bottom-0 left-1/2 -translate-x-1/2 mb-10 cursor-pointer bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 text-white font-semibold px-10 py-3 rounded-full transition-all duration-300 hover:scale-105"
          >
            Comprar
          </Button>
          <Image
            className="w-full h-auto block md:hidden"
            src="/mobile-hero-banner2.png"
            alt="hero banner"
            width={0}
            height={0}
            sizes="100vw"
          />
          {/*HERO BANNER || SE DESKTOP */}
          <Image
            className="w-full h-auto hidden md:block"
            src="/desktop-hero-banner2.png"
            alt="hero banner"
            width={0}
            height={0}
            sizes="100vw"
          />
        </section>

        {/* PARTNER BRANDS CAROUSEL SECTION */}
        <section className="mb-14">
          <h3 className="text-base lg:text-2xl font-bold text-gray-900 mb-8">
            Marcas parceiras
          </h3>
          <CarouselUi />
        </section>

        {/* PRODUCTS LIST SECTION */}
        <section className="mb-14">
          <ProductList title="Mais vendidos" products={productsList} />
        </section>

        {/* PRODUCTS CATEGORY SELECTOR SECTION*/}
        <section className="mb-14">
          <ProductCategorySelector title="Categorias" categories={productsCategories}/>
        </section>

        {/*OTHERS-PRODUCTS BANNER || SE MOBILE */}
        <section>
          <h3 className="text-base lg:text-2xl font-bold text-gray-900 mb-8">
            Lançamentos
          </h3>
          <Image
            className="w-full h-auto block md:hidden"
            src="/mobile-other-products-1.png"
            alt="other products"
            width={0}
            height={0}
            sizes="100vw"
          />
          {/*OTHERS-PRODUCTS BANNER || SE DESKTOP */}
          {/*GRID DE OUTROS PRODUTOS */}
          <div className="hidden md:block">
            <div className="grid grid-cols-5 grid-rows-2 gap-6">

              {/* Card tênis preto */}
              <div className="col-span-2 row-start-2 relative">
                <Button
                  size="lg"
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 mb-20 cursor-pointer bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 text-white font-semibold px-10 py-3 rounded-full transition-all duration-300 hover:scale-105"
                >
                  Comprar
                </Button>
                <Image
                  className="w-full h-auto"
                  src="/desktop-other-products-a3.png"
                  alt="Nike Therma FIT Headed - Tênis preto"
                  width={0}
                  height={0}
                  sizes="100vw"
                />
              </div>

              {/* Card grande da jaqueta */}
              <div className="col-span-3 row-span-2 relative">
                <Button
                  size="lg"
                  className="absolute bottom-0 right-0 -translate-x-1/8 mb-5 cursor-pointer bg-blue-300/10 hover:bg-blue-300/20 backdrop-blur-sm border border-blue-300/30 text-black font-semibold px-10 py-3 rounded-full transition-all duration-300 hover:scale-105"
                >
                  Comprar
                </Button>
                <Image
                  className="w-full h-full"
                  src="/desktop-other-products-a1.png"
                  alt="Nike Therma FIT Headed - Jaqueta"
                  width={0}
                  height={0}
                  sizes="100vw"
                />
              </div>

              {/* Card tênis roxo */}
              <div className="col-span-2 row-start-1 relative">
                <Button
                  size="lg"
                  className="absolute bottom-0 right-0 -translate-x-1/8 mb-5 cursor-pointer bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 text-black font-semibold px-10 py-3 rounded-full transition-all duration-300 hover:scale-105"
                >
                  Comprar
                </Button>
                <Image
                  className="w-full h-auto"
                  src="/desktop-other-products-a2.png"
                  alt="Nike Therma FIT Headed - Tênis roxo"
                  width={0}
                  height={0}
                  sizes="100vw"
                />
              </div>

            </div>
          </div>
        </section>

        {/* News Products Added SECTION */}
        <section className="mb-14">
          <ProductList title="Novidades" products={productsNewsAddedList} />
        </section>
      </main>
    </>
  );
}

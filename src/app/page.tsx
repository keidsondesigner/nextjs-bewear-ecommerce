import Image from "next/image";

import Header from "@/components/header";

export default function Home() {
  return (
    <>
      <Header />
      <div className="max-w-[1280px] mx-auto px-5 space-y-6 mb-12">
        {/*HERO BANNER || SE MOBILE */}
        <Image
          className="w-full h-auto block md:hidden"
          src="/mobile-hero-banner.png"
          alt="hero banner"
          width={0}
          height={0}
          sizes="100vw"
        />
        {/*HERO BANNER || SE DESKTOP */}
        <Image
          className="w-full h-auto hidden md:block"
          src="/desktop-hero-banner.png"
          alt="hero banner"
          width={0}
          height={0}
          sizes="100vw"
        />

        {/*OTHERS-PRODUCTS BANNER || SE MOBILE */}
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
            <div className="col-span-2 row-start-2">
              <Image
                className="w-full h-auto"
                src="/desktop-other-products-3.png"
                alt="Nike Therma FIT Headed - Tênis preto"
                width={0}
                height={0}
                sizes="100vw"
              />
            </div>

            {/* Card grande da jaqueta */}
            <div className="col-span-3 row-span-2">
              <Image
                className="w-full h-full"
                src="/desktop-other-products-1.png"
                alt="Nike Therma FIT Headed - Jaqueta"
                width={0}
                height={0}
                sizes="100vw"
              />
            </div>

            {/* Card tênis roxo */}
            <div className="col-span-2 row-start-1">
              <Image
                className="w-full h-auto"
                src="/desktop-other-products-2.png"
                alt="Nike Therma FIT Headed - Tênis roxo"
                width={0}
                height={0}
                sizes="100vw"
              />
            </div>

          </div>
        </div>
      </div>
    </>
  );
}

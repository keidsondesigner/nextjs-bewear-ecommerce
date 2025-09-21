//o [slug] é o produto, slug é como se fosse o id, ele é o nome da pasta, que também é o nome do parâmetro
//Exemplo para acessar o produto "mochila-preta-unico" e suas variantes
//http://localhost:3000/product-variant/mochila-preta-unico

import Image from "next/image";

import { db } from "@/db";
import { productTable, productVariantTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { formatCentsToBRL } from "@/app/helpers/format-money-brl";
import Header from "@/components/header";
import ProductList from "@/components/product-list";
import Footer from "@/components/footer";
import VariantSelector from "./components/variant-selector";
import ProductActions from "./components/product-actions";


interface ProductVariantParamsSlugProps {
  params: Promise<{slug: string}>;
}

const ProductVariantParamsSlug = async ({params}: ProductVariantParamsSlugProps) => {
   // De dentro da rota pego o parametro `slug`;
  const { slug } = await params;
  console.log(slug);

  // Busca o produto com suas variantes
  const productVariantBySlug = await db.query.productVariantTable.findFirst({
    where: eq(productVariantTable.slug, slug),
    with: {
      product: {
        with: {
          variants: true,
        },
      },
    }
  });

  if (!productVariantBySlug) {
    return notFound();
  }


  // Busca produtos `Similares` parecidos;
  // Buscando todos os Produtos da Categoria do Produto Selecionado;
  const productsListSimilar = await db.query.productTable.findMany({
    where: eq(productTable.categoryId, productVariantBySlug.product.categoryId),
    with: {
      variants: true,
    },
  });
  console.log(productsListSimilar, "productsListSimilar");

  return (
    <>
      <Header />
      <div className="max-w-[1280px] mx-auto px-5 space-y-6 mb-12">
        <section className="flex flex-col md:flex-row align-top gap-4 md:gap-12 space-y-6">
          <Image
            className="h-auto w-full md:w-1/2 rounded-3xl"
            src={productVariantBySlug.imageUrl}
            alt={productVariantBySlug.name}
            width={0}
            height={0}
            sizes="100vw"
          />

          <div className="flex flex-col gap-1 mt-4 w-full md:w-1/2">
            <h2 className="truncate text-lg md:text-3xl font-bold">
              {productVariantBySlug.product.name}
            </h2>
            <p className="truncate text-sm md:text-lg font-medium text-muted-foreground mb-2">
              {productVariantBySlug.name}
            </p>
            <h3 className="truncate text-sm md:text-2xl font-bold">
              {formatCentsToBRL(productVariantBySlug.priceInCents)}
            </h3>

            <ProductActions
              productVariantBySlugId={productVariantBySlug.id}
              productDescription={productVariantBySlug.product.description}
            />
          </div>
        </section>

        <section>
          <VariantSelector
            variants={productVariantBySlug.product.variants}
            selectedVariantSlug={productVariantBySlug.slug}
          />
        </section>

        <section className="mb-14">
          <ProductList title="Talvez você goste" products={productsListSimilar} />
        </section>
      </div>
      <Footer />
    </>
  )
}

export default ProductVariantParamsSlug;

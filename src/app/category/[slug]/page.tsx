//o [slug] ] é o nome da pasta, que também é o nome do parâmetro
//Exemplo para acessar a categoria "tenis"
//http://localhost:3000/category/tenis

import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { categoryTable, productTable } from "@/db/schema";

import Header from "@/components/header";
import ProductItem from "@/components/product-item";

interface CategoryParamsSlugProps {
  params: Promise<{slug: string}>;
}

const CategoryParamsSlug = async ({params}: CategoryParamsSlugProps) => {
  // De dentro do params, pego o `slug`;
  const { slug } = await params;
  console.log(slug);

  const category = await db.query.categoryTable.findFirst({
    where: eq(categoryTable.slug, slug),
  });

  if (!category) {
    return notFound();
  };

  const products = await db.query.productTable.findMany({
    where: eq(productTable.categoryId, category.id),
    with: {
      variants: true,
    }
  });

  return (
    <>
      <Header />
      <section className="max-w-[1280px] mx-auto px-5 space-y-6 mb-12">
        <h2 className="text-xl font-semibold">{category.name}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {products.map((product) => (
            <ProductItem key={product.id} product={product} />
          ))}
        </div>
      </section>
    </>
  );
}

export default CategoryParamsSlug;
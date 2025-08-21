import { categoryTable } from "@/db/schema";
import { Button } from "./ui/button";
import Link from "next/link";

interface ProductCategorySelectorProps {
  title: string;
  categories: (typeof categoryTable.$inferSelect)[];
}


export default function ProductCategorySelector( { title, categories }: ProductCategorySelectorProps )  {
  return (
    <>
      <h3 className="text-base lg:text-2xl font-bold text-gray-900 mb-8">
        {title}
      </h3>
      <div className="rounded-lg p-6 text-white font-semibold bg-[#c2c4f263] backdrop-blur-sm border border-[#b4b6f245]">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((category) => (
            <Button
              key={category.id}
              className="rounded-full bg-white font-semibold text-black cursor-pointer hover:text-white transition-all duration-300"
            >
              <Link
                href={`/category/${category.slug}`}
              >
                {category.name}
              </Link>
            </Button>
          ))}
        </div>
      </div>
    </>
  );
}
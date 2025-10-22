import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { productTable, categoryTable, productVariantTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const categorySlug = searchParams.get("category");

    let products;

    if (categorySlug) {
      // Filter by category
      const category = await db.query.categoryTable.findFirst({
        where: eq(categoryTable.slug, categorySlug),
      });

      if (!category) {
        return NextResponse.json({ error: "Category not found" }, { status: 404 });
      }

      products = await db.query.productTable.findMany({
        where: eq(productTable.categoryId, category.id),
        with: {
          category: true,
          variants: true,
        },
      });
    } else {
      // Get all products
      products = await db.query.productTable.findMany({
        with: {
          category: true,
          variants: true,
        },
      });
    }

    return NextResponse.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

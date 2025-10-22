import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { categoryTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const category = await db.query.categoryTable.findFirst({
      where: eq(categoryTable.slug, params.slug),
      with: {
        products: {
          with: {
            variants: true,
          },
        },
      },
    });

    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    return NextResponse.json(category);
  } catch (error) {
    console.error("Error fetching category:", error);
    return NextResponse.json({ error: "Failed to fetch category" }, { status: 500 });
  }
}

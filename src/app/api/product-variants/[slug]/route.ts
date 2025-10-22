import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { productVariantTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const variant = await db.query.productVariantTable.findFirst({
      where: eq(productVariantTable.slug, params.slug),
      with: {
        product: {
          with: {
            category: true,
            variants: true,
          },
        },
      },
    });

    if (!variant) {
      return NextResponse.json({ error: "Product variant not found" }, { status: 404 });
    }

    return NextResponse.json(variant);
  } catch (error) {
    console.error("Error fetching product variant:", error);
    return NextResponse.json({ error: "Failed to fetch product variant" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { cartTable, cartItemTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find or create cart
    let cart = await db.query.cartTable.findFirst({
      where: eq(cartTable.userId, session.user.id),
      with: {
        cartItem: {
          with: {
            productVariant: {
              with: {
                product: {
                  with: {
                    category: true,
                  },
                },
              },
            },
          },
        },
        shippingAddresses: true,
      },
    });

    if (!cart) {
      // Create cart if it doesn't exist
      const [newCart] = await db
        .insert(cartTable)
        .values({
          userId: session.user.id,
        })
        .returning();

      cart = {
        ...newCart,
        cartItem: [],
        shippingAddresses: null,
      };
    }

    // Calculate total price
    const totalPriceInCents = cart.cartItem.reduce(
      (total, item) => total + item.productVariant.priceInCents * item.quantity,
      0
    );

    return NextResponse.json({
      ...cart,
      totalPriceInCents,
    });
  } catch (error) {
    console.error("Error fetching cart:", error);
    return NextResponse.json({ error: "Failed to fetch cart" }, { status: 500 });
  }
}

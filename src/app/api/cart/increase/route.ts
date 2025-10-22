import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { cartTable, cartItemTable } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { productVariantId } = body;

    if (!productVariantId) {
      return NextResponse.json({ error: "Product variant ID is required" }, { status: 400 });
    }

    const cart = await db.query.cartTable.findFirst({
      where: eq(cartTable.userId, session.user.id),
    });

    if (!cart) {
      return NextResponse.json({ error: "Cart not found" }, { status: 404 });
    }

    const cartItem = await db.query.cartItemTable.findFirst({
      where: and(
        eq(cartItemTable.cartId, cart.id),
        eq(cartItemTable.productVariantId, productVariantId)
      ),
    });

    if (!cartItem) {
      return NextResponse.json({ error: "Cart item not found" }, { status: 404 });
    }

    await db
      .update(cartItemTable)
      .set({
        quantity: cartItem.quantity + 1,
      })
      .where(eq(cartItemTable.id, cartItem.id));

    // Fetch updated cart
    const updatedCart = await db.query.cartTable.findFirst({
      where: eq(cartTable.id, cart.id),
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

    const totalPriceInCents = updatedCart!.cartItem.reduce(
      (total, item) => total + item.productVariant.priceInCents * item.quantity,
      0
    );

    return NextResponse.json({
      ...updatedCart,
      totalPriceInCents,
    });
  } catch (error) {
    console.error("Error increasing cart quantity:", error);
    return NextResponse.json({ error: "Failed to increase quantity" }, { status: 500 });
  }
}

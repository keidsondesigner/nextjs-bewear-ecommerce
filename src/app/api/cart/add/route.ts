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
    const { productVariantId, quantity = 1 } = body;

    if (!productVariantId) {
      return NextResponse.json({ error: "Product variant ID is required" }, { status: 400 });
    }

    // Find or create cart
    let cart = await db.query.cartTable.findFirst({
      where: eq(cartTable.userId, session.user.id),
    });

    if (!cart) {
      const [newCart] = await db
        .insert(cartTable)
        .values({
          userId: session.user.id,
        })
        .returning();
      cart = newCart;
    }

    // Check if item already exists in cart
    const existingItem = await db.query.cartItemTable.findFirst({
      where: and(
        eq(cartItemTable.cartId, cart.id),
        eq(cartItemTable.productVariantId, productVariantId)
      ),
    });

    if (existingItem) {
      // Update quantity
      await db
        .update(cartItemTable)
        .set({
          quantity: existingItem.quantity + quantity,
        })
        .where(eq(cartItemTable.id, existingItem.id));
    } else {
      // Add new item
      await db.insert(cartItemTable).values({
        cartId: cart.id,
        productVariantId,
        quantity,
      });
    }

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
    console.error("Error adding to cart:", error);
    return NextResponse.json({ error: "Failed to add to cart" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { cartTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { shippingAddressId } = body;

    const cart = await db.query.cartTable.findFirst({
      where: eq(cartTable.userId, session.user.id),
    });

    if (!cart) {
      return NextResponse.json({ error: "Cart not found" }, { status: 404 });
    }

    await db
      .update(cartTable)
      .set({
        shippingAddressesId: shippingAddressId,
      })
      .where(eq(cartTable.id, cart.id));

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
    console.error("Error updating shipping address:", error);
    return NextResponse.json({ error: "Failed to update shipping address" }, { status: 500 });
  }
}

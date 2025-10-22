import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { shippingAddressTable } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify the address belongs to the user
    const address = await db.query.shippingAddressTable.findFirst({
      where: and(
        eq(shippingAddressTable.id, params.id),
        eq(shippingAddressTable.userId, session.user.id)
      ),
    });

    if (!address) {
      return NextResponse.json({ error: "Shipping address not found" }, { status: 404 });
    }

    await db
      .delete(shippingAddressTable)
      .where(eq(shippingAddressTable.id, params.id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting shipping address:", error);
    return NextResponse.json({ error: "Failed to delete shipping address" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { shippingAddressTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const addresses = await db.query.shippingAddressTable.findMany({
      where: eq(shippingAddressTable.userId, session.user.id),
    });

    return NextResponse.json(addresses);
  } catch (error) {
    console.error("Error fetching shipping addresses:", error);
    return NextResponse.json({ error: "Failed to fetch shipping addresses" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      recipientName,
      street,
      number,
      complement,
      city,
      state,
      neighborhood,
      zipCode,
      country,
      phone,
      email,
      cpfOrCnpj,
    } = body;

    // Validate required fields
    if (!recipientName || !street || !number || !city || !state || !neighborhood || !zipCode || !country || !phone || !email || !cpfOrCnpj) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const [newAddress] = await db
      .insert(shippingAddressTable)
      .values({
        userId: session.user.id,
        recipientName,
        street,
        number,
        complement: complement || null,
        city,
        state,
        neighborhood,
        zipCode,
        country,
        phone,
        email,
        cpfOrCnpj,
      })
      .returning();

    return NextResponse.json(newAddress);
  } catch (error) {
    console.error("Error creating shipping address:", error);
    return NextResponse.json({ error: "Failed to create shipping address" }, { status: 500 });
  }
}

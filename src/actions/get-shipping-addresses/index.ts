"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/db";

export async function getShippingAddresses() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const addresses = await db.query.shippingAddressTable.findMany({
    where: (address, { eq }) => eq(address.userId, session.user.id),
    orderBy: (address, { desc }) => [desc(address.createdAt)],
  });

  return addresses;
}

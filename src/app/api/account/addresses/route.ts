import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-customer";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ loggedIn: false, addresses: [] });

  const addresses = await prisma.address.findMany({
    where: { userId: user.id },
    orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
  });
  return NextResponse.json({ loggedIn: true, email: user.email, addresses });
}

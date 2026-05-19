import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import type { VenueListItem } from "@/lib/types";

export async function GET() {
  const venues = await prisma.venue.findMany({
    include: { _count: { select: { courts: true } } },
    orderBy: { name: "asc" },
  });

  const items: VenueListItem[] = venues.map((v) => ({
    id: v.id,
    name: v.name,
    slug: v.slug,
    city: v.city,
    state: v.state,
    address: v.address,
    description: v.description,
    imageUrl: v.imageUrl,
    provider: v.provider,
    pricePerHour: v.pricePerHour / 100,
    courtsCount: v._count.courts,
  }));

  return NextResponse.json({ venues: items });
}

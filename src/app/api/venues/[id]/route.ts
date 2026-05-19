import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const venue = await prisma.venue.findUnique({
    where: { id },
    include: { courts: { orderBy: { name: "asc" } } },
  });

  if (!venue) {
    return NextResponse.json({ error: "Escola não encontrada" }, { status: 404 });
  }

  return NextResponse.json({
    venue: {
      ...venue,
      pricePerHour: venue.pricePerHour / 100,
      pricePerHourCents: venue.pricePerHour,
    },
  });
}

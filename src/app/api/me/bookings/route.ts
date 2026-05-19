import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const bookings = await prisma.booking.findMany({
    where: {
      OR: [{ userId: session.id }, { playerEmail: session.email }],
    },
    include: {
      court: { include: { venue: true } },
      payment: true,
    },
    orderBy: { startAt: "desc" },
  });

  return NextResponse.json({
    bookings: bookings.map((b) => ({
      id: b.id,
      status: b.status,
      startAt: b.startAt,
      endAt: b.endAt,
      durationHours: b.durationHours,
      amountBrl: b.amountCents / 100,
      venue: b.court.venue.name,
      court: b.court.name,
      paymentStatus: b.payment?.status ?? null,
    })),
  });
}

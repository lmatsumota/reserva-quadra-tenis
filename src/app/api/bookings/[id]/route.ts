import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      payment: true,
      court: { include: { venue: true } },
    },
  });

  if (!booking) {
    return NextResponse.json({ error: "Reserva não encontrada" }, { status: 404 });
  }

  return NextResponse.json({
    booking: {
      id: booking.id,
      status: booking.status,
      startAt: booking.startAt,
      endAt: booking.endAt,
      durationHours: booking.durationHours,
      amountBrl: booking.amountCents / 100,
      playerName: booking.playerName,
      court: booking.court.name,
      venue: booking.court.venue.name,
      payment: booking.payment
        ? { status: booking.payment.status, paidAt: booking.payment.paidAt }
        : null,
    },
  });
}

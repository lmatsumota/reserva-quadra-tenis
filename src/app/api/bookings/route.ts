import { addHours } from "date-fns";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { createCheckoutPreference } from "@/lib/payments/mercadopago";
import { buildProviderContext, getProvider } from "@/lib/providers";
import type { DurationHours } from "@/lib/types";

const bodySchema = z.object({
  courtId: z.string(),
  startAt: z.string().min(10),
  durationHours: z.union([z.literal(1), z.literal(2)]),
  playerName: z.string().min(2),
  playerEmail: z.string().email(),
  playerPhone: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const json = await req.json();
  const parsed = bodySchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const court = await prisma.court.findUnique({
    where: { id: parsed.data.courtId },
    include: { venue: { include: { courts: true } } },
  });

  if (!court) {
    return NextResponse.json({ error: "Quadra não encontrada" }, { status: 404 });
  }

  const startAt = new Date(parsed.data.startAt);
  const endAt = addHours(startAt, parsed.data.durationHours);
  const amountCents =
    court.venue.pricePerHour * parsed.data.durationHours;

  const session = await getSession();
  const provider = getProvider(court.venue.provider);
  const ctx = buildProviderContext(court.venue);

  const booking = await prisma.booking.create({
    data: {
      courtId: court.id,
      userId: session?.id,
      playerName: parsed.data.playerName,
      playerEmail: parsed.data.playerEmail,
      playerPhone: parsed.data.playerPhone,
      startAt,
      endAt,
      durationHours: parsed.data.durationHours,
      amountCents,
      status: "PENDING_PAYMENT",
    },
  });

  try {
    const external = await provider.createBooking(ctx, {
      courtId: court.id,
      startAt,
      durationHours: parsed.data.durationHours as DurationHours,
      playerName: parsed.data.playerName,
      playerEmail: parsed.data.playerEmail,
      playerPhone: parsed.data.playerPhone,
    });

    await prisma.booking.update({
      where: { id: booking.id },
      data: { externalBookingId: external.externalBookingId },
    });
  } catch (e) {
    await prisma.booking.update({
      where: { id: booking.id },
      data: { status: "FAILED" },
    });
    const message = e instanceof Error ? e.message : "Erro ao reservar";
    return NextResponse.json({ error: message }, { status: 502 });
  }

  const checkout = await createCheckoutPreference({
    bookingId: booking.id,
    title: `${court.venue.name} — ${court.name} (${parsed.data.durationHours}h)`,
    amountCents,
    payerEmail: parsed.data.playerEmail,
    payerName: parsed.data.playerName,
  });

  await prisma.payment.create({
    data: {
      bookingId: booking.id,
      preferenceId: checkout.preferenceId,
      status: "PENDING",
    },
  });

  return NextResponse.json({
    bookingId: booking.id,
    amountCents,
    amountBrl: amountCents / 100,
    checkoutUrl: checkout.initPoint,
    demoMode: checkout.demoMode,
  });
}

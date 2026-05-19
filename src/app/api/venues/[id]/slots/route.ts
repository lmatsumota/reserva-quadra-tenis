import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { buildProviderContext, getProvider } from "@/lib/providers";
import type { DurationHours } from "@/lib/types";

const querySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  duration: z.enum(["1", "2"]).default("1"),
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const parsed = querySchema.safeParse(
    Object.fromEntries(req.nextUrl.searchParams)
  );

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Parâmetros inválidos. Use date=YYYY-MM-DD e duration=1|2" },
      { status: 400 }
    );
  }

  const venue = await prisma.venue.findUnique({
    where: { id },
    include: { courts: true },
  });

  if (!venue) {
    return NextResponse.json({ error: "Escola não encontrada" }, { status: 404 });
  }

  const durationHours = Number(parsed.data.duration) as DurationHours;
  const provider = getProvider(venue.provider);
  const ctx = buildProviderContext(venue);
  const slots = await provider.getAvailableSlots(
    ctx,
    parsed.data.date,
    durationHours
  );

  return NextResponse.json({
    date: parsed.data.date,
    durationHours,
    provider: venue.provider,
    slots,
  });
}

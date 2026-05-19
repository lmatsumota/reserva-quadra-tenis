import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { venueFilterForAdmin } from "@/lib/admin";
import { prisma } from "@/lib/db";

const schema = z.object({
  name: z.string().min(1),
  surface: z.string().default("Saibro"),
  externalId: z.string().optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdmin();
    const { id: venueId } = await params;

    const venue = await prisma.venue.findFirst({
      where: { id: venueId, ...venueFilterForAdmin(session) },
    });
    if (!venue) {
      return NextResponse.json({ error: "Escola não encontrada" }, { status: 404 });
    }

    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
    }

    const court = await prisma.court.create({
      data: { venueId, ...parsed.data },
    });

    return NextResponse.json({ court }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erro" }, { status: 500 });
  }
}

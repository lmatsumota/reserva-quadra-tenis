import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { venueFilterForAdmin } from "@/lib/admin";
import { prisma } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdmin();
    const { id } = await params;
    const venue = await prisma.venue.findFirst({
      where: { id, ...venueFilterForAdmin(session) },
      include: { courts: true },
    });
    if (!venue) {
      return NextResponse.json({ error: "Não encontrada" }, { status: 404 });
    }
    return NextResponse.json({ venue });
  } catch {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
}

const patchSchema = z.object({
  name: z.string().min(2).optional(),
  city: z.string().optional(),
  state: z.string().length(2).optional(),
  address: z.string().optional(),
  description: z.string().optional(),
  provider: z.enum(["INTERNAL", "WIX", "SIMPLYBOOK"]).optional(),
  providerConfig: z.record(z.unknown()).optional(),
  pricePerHour: z.number().positive().optional(),
  openHour: z.number().min(0).max(23).optional(),
  closeHour: z.number().min(1).max(24).optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdmin();
    const { id } = await params;
    const existing = await prisma.venue.findFirst({
      where: { id, ...venueFilterForAdmin(session) },
    });
    if (!existing) {
      return NextResponse.json({ error: "Não encontrada" }, { status: 404 });
    }

    const body = await req.json();
    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
    }

    const venue = await prisma.venue.update({
      where: { id },
      data: {
        ...parsed.data,
        state: parsed.data.state?.toUpperCase(),
        pricePerHour: parsed.data.pricePerHour
          ? Math.round(parsed.data.pricePerHour * 100)
          : undefined,
        providerConfig: parsed.data.providerConfig
          ? JSON.stringify(parsed.data.providerConfig)
          : undefined,
      },
    });

    return NextResponse.json({ venue });
  } catch {
    return NextResponse.json({ error: "Erro ao atualizar" }, { status: 500 });
  }
}

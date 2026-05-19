import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { venueFilterForAdmin } from "@/lib/admin";
import { prisma } from "@/lib/db";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdmin();
    const { id } = await params;

    const court = await prisma.court.findUnique({
      where: { id },
      include: { venue: true },
    });
    if (!court) {
      return NextResponse.json({ error: "Quadra não encontrada" }, { status: 404 });
    }

    const allowed = await prisma.venue.findFirst({
      where: { id: court.venueId, ...venueFilterForAdmin(session) },
    });
    if (!allowed) {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
    }

    await prisma.court.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Erro" }, { status: 500 });
  }
}

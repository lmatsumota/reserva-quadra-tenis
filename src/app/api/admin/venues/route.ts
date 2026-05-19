import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin, requireSession } from "@/lib/auth";
import { venueFilterForAdmin } from "@/lib/admin";
import { prisma } from "@/lib/db";
import type { ProviderType } from "@prisma/client";

export async function GET() {
  try {
    const session = await requireAdmin();
    const venues = await prisma.venue.findMany({
      where: venueFilterForAdmin(session),
      include: { _count: { select: { courts: true } } },
      orderBy: { name: "asc" },
    });
    return NextResponse.json({ venues });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erro";
    const status = msg === "UNAUTHORIZED" ? 401 : msg === "FORBIDDEN" ? 403 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}

const createSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/),
  city: z.string().min(2),
  state: z.string().length(2),
  address: z.string().min(5),
  description: z.string().optional(),
  provider: z.enum(["INTERNAL", "WIX", "SIMPLYBOOK"]),
  providerConfig: z.record(z.unknown()).default({}),
  pricePerHour: z.number().positive(),
  openHour: z.number().min(0).max(23).default(7),
  closeHour: z.number().min(1).max(24).default(22),
});

export async function POST(req: NextRequest) {
  try {
    const session = await requireSession();
    if (session.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Apenas super admin" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
    }

    const venue = await prisma.venue.create({
      data: {
        name: parsed.data.name,
        slug: parsed.data.slug,
        city: parsed.data.city,
        state: parsed.data.state.toUpperCase(),
        address: parsed.data.address,
        description: parsed.data.description,
        provider: parsed.data.provider as ProviderType,
        providerConfig: JSON.stringify(parsed.data.providerConfig),
        pricePerHour: Math.round(parsed.data.pricePerHour * 100),
        openHour: parsed.data.openHour,
        closeHour: parsed.data.closeHour,
      },
    });

    return NextResponse.json({ venue }, { status: 201 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erro";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

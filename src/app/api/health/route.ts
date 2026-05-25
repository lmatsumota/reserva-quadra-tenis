import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const hasDb = Boolean(process.env.DATABASE_URL);
  const hasSession = Boolean(process.env.SESSION_SECRET);

  if (!hasDb) {
    return NextResponse.json(
      {
        ok: false,
        error: "DATABASE_URL não configurada na Vercel",
      },
      { status: 500 }
    );
  }

  try {
    const count = await prisma.venue.count();
    return NextResponse.json({
      ok: true,
      venues: count,
      hasSession,
      appUrl: process.env.NEXT_PUBLIC_APP_URL ?? null,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erro de conexão";
    return NextResponse.json(
      {
        ok: false,
        error: message,
        hint: "Use a URL pooled do Neon (com -pooler no host)",
      },
      { status: 500 }
    );
  }
}

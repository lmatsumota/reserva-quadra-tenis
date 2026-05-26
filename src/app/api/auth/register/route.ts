import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import {
  attachSessionCookie,
  createSessionToken,
  hashPassword,
} from "@/lib/auth";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  phone: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
    }

    const exists = await prisma.user.findUnique({
      where: { email: parsed.data.email.toLowerCase() },
    });
    if (exists) {
      return NextResponse.json(
        { error: "E-mail já cadastrado" },
        { status: 409 }
      );
    }

    const user = await prisma.user.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email.toLowerCase(),
        passwordHash: await hashPassword(parsed.data.password),
        phone: parsed.data.phone,
        role: "PLAYER",
      },
    });

    const token = await createSessionToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      venueId: user.venueId,
    });

    const response = NextResponse.json({
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
    return attachSessionCookie(response, token);
  } catch (e) {
    console.error("[auth/register]", e);
    return NextResponse.json(
      { error: "Erro ao cadastrar. Tente novamente." },
      { status: 500 }
    );
  }
}

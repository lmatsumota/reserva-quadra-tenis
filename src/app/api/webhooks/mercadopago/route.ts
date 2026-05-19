import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const type = body?.type ?? req.nextUrl.searchParams.get("type");
  const dataId =
    body?.data?.id ?? req.nextUrl.searchParams.get("data.id");

  if (type === "payment" && dataId) {
    const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
    if (token) {
      const res = await fetch(
        `https://api.mercadopago.com/v1/payments/${dataId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.ok) {
        const payment = (await res.json()) as {
          status: string;
          external_reference?: string;
        };
        const bookingId = payment.external_reference;
        if (bookingId && payment.status === "approved") {
          await prisma.$transaction([
            prisma.payment.updateMany({
              where: { bookingId },
              data: {
                status: "APPROVED",
                mercadoPagoId: String(dataId),
                paidAt: new Date(),
              },
            }),
            prisma.booking.update({
              where: { id: bookingId },
              data: { status: "CONFIRMED" },
            }),
          ]);
        }
      }
    }
  }

  return NextResponse.json({ ok: true });
}

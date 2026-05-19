import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function SuccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ demo?: string; pending?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const isDemo = sp.demo === "1";

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: { court: { include: { venue: true } }, payment: true },
  });

  if (!booking) notFound();

  if (isDemo || !process.env.MERCADOPAGO_ACCESS_TOKEN) {
    await prisma.$transaction([
      prisma.booking.update({
        where: { id },
        data: { status: "CONFIRMED" },
      }),
      prisma.payment.updateMany({
        where: { bookingId: id },
        data: { status: "APPROVED", paidAt: new Date() },
      }),
    ]);
  }

  return (
    <div className="mx-auto max-w-lg rounded-2xl border bg-white p-8 text-center shadow-sm">
      <p className="text-4xl">✅</p>
      <h1 className="mt-4 text-2xl font-bold">Reserva confirmada!</h1>
      <p className="mt-2 text-[var(--muted)]">
        {booking.court.venue.name} · {booking.court.name}
      </p>
      <p className="mt-1 text-sm">
        {booking.startAt.toLocaleString("pt-BR")} — {booking.durationHours}h
      </p>
      <p className="mt-4 font-semibold">
        R$ {(booking.amountCents / 100).toFixed(2)}
      </p>
      {isDemo && (
        <p className="mt-2 text-xs text-amber-700">
          Modo demonstração (Mercado Pago não configurado).
        </p>
      )}
      <Link
        href="/"
        className="mt-6 inline-block rounded-lg bg-emerald-800 px-5 py-2 text-white"
      >
        Nova reserva
      </Link>
    </div>
  );
}

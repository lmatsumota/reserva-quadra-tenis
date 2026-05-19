import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

const statusLabel: Record<string, string> = {
  PENDING_PAYMENT: "Aguardando pagamento",
  CONFIRMED: "Confirmada",
  CANCELLED: "Cancelada",
  FAILED: "Falhou",
};

export default async function MinhasReservasPage() {
  const session = await getSession();
  if (!session) return null;

  const bookings = await prisma.booking.findMany({
    where: {
      OR: [{ userId: session.id }, { playerEmail: session.email }],
    },
    include: { court: { include: { venue: true } }, payment: true },
    orderBy: { startAt: "desc" },
  });

  return (
    <section>
      <h1 className="text-2xl font-bold">Minhas reservas</h1>
      <p className="mt-1 text-[var(--muted)]">Olá, {session.name}</p>

      {bookings.length === 0 ? (
        <p className="mt-8 rounded-xl border border-dashed p-8 text-center text-[var(--muted)]">
          Você ainda não tem reservas.{" "}
          <Link href="/" className="text-emerald-800 underline">
            Reservar quadra
          </Link>
        </p>
      ) : (
        <ul className="mt-6 space-y-3">
          {bookings.map((b) => (
            <li
              key={b.id}
              className="rounded-xl border bg-white p-4 shadow-sm"
            >
              <p className="font-semibold">{b.court.venue.name}</p>
              <p className="text-sm text-[var(--muted)]">
                {b.court.name} · {b.durationHours}h ·{" "}
                {format(b.startAt, "dd/MM/yyyy HH:mm", { locale: ptBR })}
              </p>
              <p className="mt-2 flex flex-wrap items-center justify-between gap-2">
                <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-900">
                  {statusLabel[b.status] ?? b.status}
                </span>
                <strong>R$ {(b.amountCents / 100).toFixed(2)}</strong>
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

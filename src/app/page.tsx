import Link from "next/link";
import { VenueCard } from "@/components/VenueCard";
import { prisma } from "@/lib/db";
import type { VenueListItem } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let items: VenueListItem[] = [];
  let dbError: string | null = null;

  if (!process.env.DATABASE_URL) {
    dbError = "DATABASE_URL não está configurada. Adicione a URL do Neon nas variáveis da Vercel.";
  } else {
    try {
      const venues = await prisma.venue.findMany({
        include: { _count: { select: { courts: true } } },
        orderBy: { name: "asc" },
      });

      items = venues.map((v) => ({
        id: v.id,
        name: v.name,
        slug: v.slug,
        city: v.city,
        state: v.state,
        address: v.address,
        description: v.description,
        imageUrl: v.imageUrl,
        provider: v.provider,
        pricePerHour: v.pricePerHour / 100,
        courtsCount: v._count.courts,
      }));
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Erro ao conectar no banco";
      dbError = `${msg}. Use a connection string pooled do Neon e rode npm run db:seed.`;
    }
  }

  return (
    <div>
      <section className="mb-10 rounded-3xl bg-emerald-900 px-6 py-10 text-white">
        <p className="text-sm uppercase tracking-wide text-emerald-200">
          Locação de quadra
        </p>
        <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
          Reserve sua quadra de tênis em minutos
        </h1>
        <p className="mt-3 max-w-2xl text-emerald-100">
          Horários em tempo real com integração Wix Bookings e SimplyBook.me —
          as plataformas mais usadas por escolas e clubes no Brasil. Pague online
          com Pix ou cartão.
        </p>
        <Link
          href="/baixar"
          className="mt-5 inline-block rounded-lg bg-white px-4 py-2 text-sm font-semibold text-emerald-900"
        >
          Como baixar o app →
        </Link>
      </section>

      {dbError && (
        <section className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <p className="font-semibold">Erro de configuração (produção)</p>
          <p className="mt-2">{dbError}</p>
          <p className="mt-2">
            Teste:{" "}
            <Link href="/api/health" className="underline">
              /api/health
            </Link>
          </p>
        </section>
      )}

      <h2 className="mb-4 text-xl font-semibold">Escolas e clubes</h2>
      {items.length === 0 && !dbError ? (
        <p className="rounded-xl border border-dashed p-8 text-center text-[var(--muted)]">
          Nenhuma escola cadastrada. Rode{" "}
          <code className="rounded bg-gray-100 px-1">npm run db:seed</code> com a
          URL do Neon.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {items.map((v) => (
            <VenueCard key={v.id} venue={v} />
          ))}
        </div>
      )}
    </div>
  );
}

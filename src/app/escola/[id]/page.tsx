import Link from "next/link";
import { notFound } from "next/navigation";
import { BookingForm } from "@/components/BookingForm";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

const providerLabels: Record<string, string> = {
  INTERNAL: "Agenda própria (demo)",
  WIX: "Wix Bookings",
  SIMPLYBOOK: "SimplyBook.me",
};

export default async function VenuePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const venue = await prisma.venue.findUnique({
    where: { id },
    include: { courts: true },
  });

  if (!venue) notFound();

  return (
    <>
      <Link href="/" className="text-sm text-emerald-800 hover:underline">
        ← Voltar
      </Link>
      <header className="mt-4">
        <p className="text-sm text-[var(--muted)]">
          {providerLabels[venue.provider]}
        </p>
        <h1 className="text-3xl font-bold">{venue.name}</h1>
        <p className="mt-1 text-[var(--muted)]">
          {venue.address} · {venue.city}, {venue.state}
        </p>
        {venue.description && (
          <p className="mt-3 max-w-2xl">{venue.description}</p>
        )}
      </header>

      <section className="mt-6 flex flex-wrap gap-2">
        {venue.courts.map((c) => (
          <span
            key={c.id}
            className="rounded-full bg-white px-3 py-1 text-sm border"
          >
            {c.name} · {c.surface}
          </span>
        ))}
      </section>

      <div className="mt-8">
        <BookingForm
          venueId={venue.id}
          venueName={venue.name}
          pricePerHour={venue.pricePerHour / 100}
        />
      </div>
    </>
  );
}

import Link from "next/link";
import type { VenueListItem } from "@/lib/types";

const providerLabels: Record<string, string> = {
  INTERNAL: "Demo",
  WIX: "Wix Bookings",
  SIMPLYBOOK: "SimplyBook",
};

export function VenueCard({ venue }: { venue: VenueListItem }) {
  return (
    <Link
      href={`/escola/${venue.id}`}
      className="group block rounded-2xl border border-emerald-900/10 bg-white p-5 shadow-sm transition hover:border-emerald-700/30 hover:shadow-md"
    >
      <section className="flex items-start justify-between gap-3">
        <section>
          <h2 className="text-lg font-semibold text-emerald-950 group-hover:text-emerald-800">
            {venue.name}
          </h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            {venue.city}, {venue.state}
          </p>
        </section>
        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-800">
          {providerLabels[venue.provider] ?? venue.provider}
        </span>
      </section>
      <p className="mt-3 text-sm text-[var(--muted)] line-clamp-2">
        {venue.description ?? venue.address}
      </p>
      <p className="mt-4 flex items-center justify-between text-sm">
        <span>{venue.courtsCount} quadra(s)</span>
        <span className="font-semibold text-[var(--court-clay)]">
          R$ {venue.pricePerHour.toFixed(0)}/h
        </span>
      </p>
    </Link>
  );
}

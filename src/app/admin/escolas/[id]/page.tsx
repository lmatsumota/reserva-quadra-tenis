import Link from "next/link";
import { VenueAdminPanel } from "@/components/admin/VenueAdminPanel";

export default async function AdminVenuePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <section>
      <Link href="/admin/escolas" className="text-sm text-emerald-800 hover:underline">
        ← Escolas
      </Link>
      <VenueAdminPanel venueId={id} />
    </section>
  );
}

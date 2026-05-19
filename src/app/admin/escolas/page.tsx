import Link from "next/link";
import { getSession, isAdmin } from "@/lib/auth";
import { venueFilterForAdmin } from "@/lib/admin";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { CreateVenueForm } from "@/components/admin/CreateVenueForm";

export const dynamic = "force-dynamic";

export default async function AdminEscolasPage() {
  const session = await getSession();
  if (!session || !isAdmin(session.role)) redirect("/entrar?redirect=/admin/escolas");

  const venues = await prisma.venue.findMany({
    where: venueFilterForAdmin(session),
    include: { _count: { select: { courts: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <section>
      <Link href="/admin" className="text-sm text-emerald-800 hover:underline">
        ← Admin
      </Link>
      <h1 className="mt-2 text-2xl font-bold">Escolas</h1>

      <ul className="mt-6 space-y-2">
        {venues.map((v) => (
          <li key={v.id}>
            <Link
              href={`/admin/escolas/${v.id}`}
              className="flex justify-between rounded-lg border bg-white px-4 py-3 hover:border-emerald-600"
            >
              <span>{v.name}</span>
              <span className="text-sm text-[var(--muted)]">
                {v._count.courts} quadras · {v.provider}
              </span>
            </Link>
          </li>
        ))}
      </ul>

      {session.role === "SUPER_ADMIN" && (
        <section className="mt-10 rounded-xl border bg-white p-4">
          <h2 className="font-semibold">Nova escola</h2>
          <CreateVenueForm />
        </section>
      )}
    </section>
  );
}

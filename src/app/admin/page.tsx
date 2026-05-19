import Link from "next/link";
import { getSession, isAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminHomePage() {
  const session = await getSession();
  if (!session || !isAdmin(session.role)) redirect("/entrar?redirect=/admin");

  return (
    <section>
      <h1 className="text-2xl font-bold">Painel administrativo</h1>
      <p className="mt-1 text-[var(--muted)]">
        Gerencie escolas, quadras e credenciais de integração.
      </p>
      <ul className="mt-6 grid gap-3 sm:grid-cols-2">
        <li>
          <Link
            href="/admin/escolas"
            className="block rounded-xl border bg-white p-5 hover:border-emerald-600"
          >
            <strong>Escolas e quadras</strong>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Cadastro, preços, Wix / SimplyBook
            </p>
          </Link>
        </li>
        <li>
          <Link
            href="/"
            className="block rounded-xl border bg-white p-5 hover:border-emerald-600"
          >
            <strong>Ver app do jogador</strong>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Como o cliente vê as reservas
            </p>
          </Link>
        </li>
      </ul>
    </section>
  );
}

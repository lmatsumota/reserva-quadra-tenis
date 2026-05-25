import Link from "next/link";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function StatusPage() {
  const hasDb = Boolean(process.env.DATABASE_URL);
  const hasSession = Boolean(process.env.SESSION_SECRET);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "(não definida)";

  let dbOk = false;
  let venues = 0;
  let error: string | null = null;

  if (!hasDb) {
    error = "DATABASE_URL não configurada na Vercel";
  } else {
    try {
      venues = await prisma.venue.count();
      dbOk = true;
    } catch (e) {
      error = e instanceof Error ? e.message : "Erro ao conectar no banco";
    }
  }

  return (
    <article className="mx-auto max-w-lg rounded-2xl border bg-white p-6 shadow-sm">
      <h1 className="text-xl font-bold">Status do sistema</h1>
      <ul className="mt-4 space-y-2 text-sm">
        <li>
          <strong>DATABASE_URL:</strong> {hasDb ? "✅ definida" : "❌ ausente"}
        </li>
        <li>
          <strong>SESSION_SECRET:</strong>{" "}
          {hasSession ? "✅ definida" : "❌ ausente"}
        </li>
        <li>
          <strong>NEXT_PUBLIC_APP_URL:</strong> {appUrl}
        </li>
        <li>
          <strong>Banco (escolas):</strong>{" "}
          {dbOk ? `✅ conectado — ${venues} escola(s)` : `❌ ${error ?? "falhou"}`}
        </li>
      </ul>

      {!dbOk && (
        <section className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
          <p className="font-medium">Como corrigir</p>
          <ol className="mt-2 list-decimal pl-5 space-y-1">
            <li>Vercel → Settings → Environment Variables</li>
            <li>
              <code className="text-xs">DATABASE_URL</code> = URL{" "}
              <strong>pooled</strong> do Neon (com -pooler)
            </li>
            <li>No PC: <code className="text-xs">npm run db:seed</code> com essa URL</li>
            <li>Redeploy na Vercel</li>
          </ol>
        </section>
      )}

      <Link href="/" className="mt-6 inline-block text-emerald-800 underline">
        ← Voltar ao app
      </Link>
    </article>
  );
}

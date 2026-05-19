import Link from "next/link";

export default function BaixarPage() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  return (
    <article className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold">Baixar o app</h1>
        <p className="mt-2 max-w-2xl text-[var(--muted)]">
          O Reserva Quadra é um aplicativo web que você pode instalar no celular
          (PWA) ou acessar pelo navegador. Não há loja da App Store / Play Store
          ainda — veja as opções abaixo.
        </p>
      </header>

      <section className="rounded-2xl border bg-white p-6">
        <h2 className="text-xl font-semibold">1. Instalar no celular (recomendado)</h2>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Após publicar o site (ex.: Vercel), abra{" "}
          <strong>{appUrl}</strong> no Chrome (Android) ou Safari (iPhone):
        </p>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm">
          <li>
            <strong>Android:</strong> menu ⋮ → &quot;Instalar app&quot; ou
            &quot;Adicionar à tela inicial&quot;
          </li>
          <li>
            <strong>iPhone:</strong> botão Compartilhar → &quot;Adicionar à Tela
            de Início&quot;
          </li>
        </ul>
        <Link
          href="/"
          className="mt-4 inline-block rounded-lg bg-emerald-800 px-4 py-2 text-white"
        >
          Abrir o app agora
        </Link>
      </section>

      <section className="rounded-2xl border bg-white p-6">
        <h2 className="text-xl font-semibold">2. App nativo (Expo)</h2>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Na pasta <code className="rounded bg-gray-100 px-1">mobile/</code> há
          um projeto React Native. Para gerar APK/IPA para as lojas:
        </p>
        <pre className="mt-3 overflow-x-auto rounded-lg bg-gray-900 p-4 text-xs text-emerald-100">
{`cd mobile
npm install
npx expo start
# Publicar: npx eas build --platform android`}
        </pre>
      </section>

      <section className="rounded-2xl border bg-amber-50 p-6">
        <h2 className="text-xl font-semibold">3. Rodar no computador (desenvolvimento)</h2>
        <pre className="mt-3 overflow-x-auto rounded-lg bg-gray-900 p-4 text-xs text-emerald-100">
{`cd reserva-quadra-tenis
npm install
npm run db:push
npm run db:seed
npm run dev`}
        </pre>
        <p className="mt-3 text-sm">
          Acesse <a href="http://localhost:3000" className="underline">localhost:3000</a>
        </p>
      </section>
    </article>
  );
}

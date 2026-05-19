"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
};

export function SiteHeader() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => setUser(d.user));
  }, []);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  }

  const isAdmin = user?.role === "SUPER_ADMIN" || user?.role === "VENUE_ADMIN";

  return (
    <header className="border-b border-emerald-900/10 bg-white/80 backdrop-blur sticky top-0 z-10">
      <Wrapper className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-4">
        <Link href="/" className="flex items-center gap-2 font-semibold text-emerald-900">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-emerald-800 text-lg text-white">
            🎾
          </span>
          Reserva Quadra
        </Link>
        <nav className="flex flex-wrap items-center gap-3 text-sm">
          <Link href="/baixar" className="text-emerald-800 hover:underline">
            Baixar app
          </Link>
          {user ? (
            <>
              <Link href="/minhas-reservas" className="hover:underline">
                Minhas reservas
              </Link>
              {isAdmin && (
                <Link href="/admin" className="font-medium text-emerald-800 hover:underline">
                  Admin
                </Link>
              )}
              <span className="text-[var(--muted)]">{user.name.split(" ")[0]}</span>
              <button
                type="button"
                onClick={logout}
                className="rounded-lg border px-2 py-1 hover:bg-gray-50"
              >
                Sair
              </button>
            </>
          ) : (
            <Link
              href="/entrar"
              className="rounded-lg bg-emerald-800 px-3 py-1.5 font-medium text-white hover:bg-emerald-900"
            >
              Entrar
            </Link>
          )}
        </nav>
      </Wrapper>
    </header>
  );
}

function Wrapper({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <section className={className}>{children}</section>;
}

"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";

export function AuthForm() {
  const params = useSearchParams();
  const redirect = params.get("redirect") ?? "/";
  const [mode, setMode] = useState<"login" | "register">("login");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const url = mode === "login" ? "/api/auth/login" : "/api/auth/register";
    const body =
      mode === "login"
        ? { email, password }
        : { name, email, password, phone: phone || undefined };

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      let data: { error?: string } = {};
      const text = await res.text();
      if (text) {
        try {
          data = JSON.parse(text) as { error?: string };
        } catch {
          setError("Resposta inválida do servidor. O app está rodando?");
          return;
        }
      }

      if (!res.ok) {
        setError(data.error ?? `Erro ${res.status}`);
        return;
      }

      window.location.href = redirect;
    } catch {
      setError(
        "Não foi possível conectar ao servidor. Rode npm run dev e tente de novo."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md rounded-2xl border bg-white p-6 shadow-sm">
      <div className="flex gap-2 border-b pb-4">
        <button
          type="button"
          onClick={() => setMode("login")}
          className={`flex-1 rounded-lg py-2 text-sm font-medium ${
            mode === "login" ? "bg-emerald-800 text-white" : "bg-gray-100"
          }`}
        >
          Entrar
        </button>
        <button
          type="button"
          onClick={() => setMode("register")}
          className={`flex-1 rounded-lg py-2 text-sm font-medium ${
            mode === "register" ? "bg-emerald-800 text-white" : "bg-gray-100"
          }`}
        >
          Criar conta
        </button>
      </div>

      <form onSubmit={submit} className="mt-4 space-y-3">
        {mode === "register" && (
          <label className="block text-sm">
            Nome
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-lg border px-3 py-2"
            />
          </label>
        )}
        <label className="block text-sm">
          E-mail
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-lg border px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          Senha
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-lg border px-3 py-2"
          />
        </label>
        {mode === "register" && (
          <label className="block text-sm">
            Telefone (opcional)
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-1 w-full rounded-lg border px-3 py-2"
            />
          </label>
        )}
        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-emerald-800 py-3 font-semibold text-white disabled:opacity-50"
        >
          {loading ? "Aguarde…" : mode === "login" ? "Entrar" : "Cadastrar"}
        </button>
      </form>

      <p className="mt-4 text-center text-xs text-[var(--muted)]">
        Demo admin: admin@reservaquadra.com / admin123
        <br />
        Demo jogador: jogador@test.com / jogador123
      </p>
    </div>
  );
}

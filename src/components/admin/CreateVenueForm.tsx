"use client";

import { useState } from "react";

export function CreateVenueForm() {
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/admin/venues", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: fd.get("name"),
        slug: fd.get("slug"),
        city: fd.get("city"),
        state: fd.get("state"),
        address: fd.get("address"),
        description: fd.get("description"),
        provider: fd.get("provider"),
        pricePerHour: Number(fd.get("pricePerHour")),
        providerConfig: {},
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Erro");
      return;
    }
    window.location.href = `/admin/escolas/${data.venue.id}`;
  }

  return (
    <form onSubmit={submit} className="mt-4 grid gap-3 sm:grid-cols-2">
      <input name="name" placeholder="Nome" required className="rounded border px-3 py-2" />
      <input name="slug" placeholder="slug-url" required className="rounded border px-3 py-2" />
      <input name="city" placeholder="Cidade" required className="rounded border px-3 py-2" />
      <input name="state" placeholder="UF" maxLength={2} required className="rounded border px-3 py-2" />
      <input name="address" placeholder="Endereço" required className="sm:col-span-2 rounded border px-3 py-2" />
      <input name="description" placeholder="Descrição" className="sm:col-span-2 rounded border px-3 py-2" />
      <select name="provider" className="rounded border px-3 py-2">
        <option value="INTERNAL">INTERNAL</option>
        <option value="WIX">WIX</option>
        <option value="SIMPLYBOOK">SIMPLYBOOK</option>
      </select>
      <input name="pricePerHour" type="number" placeholder="Preço/hora R$" required className="rounded border px-3 py-2" />
      {error && <p className="sm:col-span-2 text-sm text-red-600">{error}</p>}
      <button type="submit" className="sm:col-span-2 rounded-lg bg-emerald-800 py-2 text-white">
        Criar escola
      </button>
    </form>
  );
}

"use client";

import { useEffect, useState } from "react";

type Venue = {
  id: string;
  name: string;
  slug: string;
  city: string;
  state: string;
  provider: string;
  pricePerHour: number;
  providerConfig: string;
  openHour: number;
  closeHour: number;
  courts: { id: string; name: string; surface: string }[];
};

export function VenueAdminPanel({ venueId }: { venueId: string }) {
  const [venue, setVenue] = useState<Venue | null>(null);
  const [configJson, setConfigJson] = useState("{}");
  const [price, setPrice] = useState("");
  const [courtName, setCourtName] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  async function load() {
    const res = await fetch(`/api/admin/venues/${venueId}`);
    const data = await res.json();
    if (res.ok) {
      setVenue(data.venue);
      setConfigJson(
        JSON.stringify(JSON.parse(data.venue.providerConfig), null, 2)
      );
      setPrice(String(data.venue.pricePerHour / 100));
    }
  }

  useEffect(() => {
    load();
  }, [venueId]);

  async function saveVenue(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    let providerConfig: Record<string, unknown>;
    try {
      providerConfig = JSON.parse(configJson);
    } catch {
      setMsg("JSON de integração inválido");
      return;
    }
    const res = await fetch(`/api/admin/venues/${venueId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pricePerHour: Number(price),
        providerConfig,
      }),
    });
    setMsg(res.ok ? "Salvo!" : "Erro ao salvar");
    if (res.ok) load();
  }

  async function addCourt(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch(`/api/admin/venues/${venueId}/courts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: courtName }),
    });
    if (res.ok) {
      setCourtName("");
      load();
    }
  }

  async function removeCourt(id: string) {
    if (!confirm("Remover quadra?")) return;
    await fetch(`/api/admin/courts/${id}`, { method: "DELETE" });
    load();
  }

  if (!venue) return <p>Carregando…</p>;

  return (
    <section className="space-y-6">
      <h2 className="text-xl font-bold">{venue.name}</h2>
      <p className="text-sm text-[var(--muted)]">
        {venue.city}, {venue.state} · {venue.provider}
      </p>

      <form onSubmit={saveVenue} className="rounded-xl border bg-white p-4 space-y-3">
        <h3 className="font-semibold">Preço e integração</h3>
        <label className="block text-sm">
          Preço/hora (R$)
          <input
            type="number"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="mt-1 w-full rounded border px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          providerConfig (JSON)
          <textarea
            rows={8}
            value={configJson}
            onChange={(e) => setConfigJson(e.target.value)}
            className="mt-1 w-full rounded border px-3 py-2 font-mono text-xs"
          />
        </label>
        <button
          type="submit"
          className="rounded-lg bg-emerald-800 px-4 py-2 text-white"
        >
          Salvar
        </button>
        {msg && <p className="text-sm text-emerald-700">{msg}</p>}
      </form>

      <section className="rounded-xl border bg-white p-4">
        <h3 className="font-semibold">Quadras</h3>
        <ul className="mt-2 space-y-2">
          {venue.courts.map((c) => (
            <li key={c.id} className="flex justify-between text-sm">
              <span>
                {c.name} ({c.surface})
              </span>
              <button
                type="button"
                onClick={() => removeCourt(c.id)}
                className="text-red-600 hover:underline"
              >
                Remover
              </button>
            </li>
          ))}
        </ul>
        <form onSubmit={addCourt} className="mt-4 flex gap-2">
          <input
            placeholder="Nome da quadra"
            value={courtName}
            onChange={(e) => setCourtName(e.target.value)}
            className="flex-1 rounded border px-3 py-2 text-sm"
            required
          />
          <button
            type="submit"
            className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-50"
          >
            Adicionar
          </button>
        </form>
      </section>
    </section>
  );
}

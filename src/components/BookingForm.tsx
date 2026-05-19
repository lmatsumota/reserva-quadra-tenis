"use client";

import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useEffect, useState } from "react";
import type { DurationHours, TimeSlot } from "@/lib/types";

type Props = {
  venueId: string;
  venueName: string;
  pricePerHour: number;
};

export function BookingForm({ venueId, venueName, pricePerHour }: Props) {
  const [date, setDate] = useState(() => format(new Date(), "yyyy-MM-dd"));
  const [duration, setDuration] = useState<DurationHours>(1);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [selected, setSelected] = useState<TimeSlot | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (d.user) {
          setName(d.user.name);
          setEmail(d.user.email);
        }
      });
  }, []);

  async function loadSlots() {
    setLoading(true);
    setError(null);
    setSelected(null);
    try {
      const res = await fetch(
        `/api/venues/${venueId}/slots?date=${date}&duration=${duration}`
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao carregar horários");
      setSlots(data.slots);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro desconhecido");
      setSlots([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleBook(e: React.FormEvent) {
    e.preventDefault();
    if (!selected) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courtId: selected.courtId,
          startAt: selected.start,
          durationHours: duration,
          playerName: name,
          playerEmail: email,
          playerPhone: phone || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao reservar");
      window.location.href = data.checkoutUrl;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao reservar");
      setLoading(false);
    }
  }

  const total = pricePerHour * duration;

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-emerald-900/10 bg-white p-5">
        <h2 className="text-lg font-semibold">Horários em {venueName}</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <label className="flex flex-col gap-1 text-sm">
            Data
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="rounded-lg border px-3 py-2"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Duração
            <select
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value) as DurationHours)}
              className="rounded-lg border px-3 py-2"
            >
              <option value={1}>1 hora</option>
              <option value={2}>2 horas</option>
            </select>
          </label>
          <div className="flex items-end">
            <button
              type="button"
              onClick={loadSlots}
              disabled={loading}
              className="rounded-lg bg-emerald-800 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-900 disabled:opacity-50"
            >
              {loading ? "Carregando…" : "Ver horários"}
            </button>
          </div>
        </div>

        {slots.length > 0 && (
          <div className="mt-4 grid gap-2 sm:grid-cols-2 md:grid-cols-3">
            {slots.map((slot) => {
              const label = `${format(parseISO(slot.start), "HH:mm", { locale: ptBR })} — ${slot.courtName}`;
              const active = selected?.start === slot.start && selected.courtId === slot.courtId;
              return (
                <button
                  key={`${slot.courtId}-${slot.start}`}
                  type="button"
                  onClick={() => setSelected(slot)}
                  className={`rounded-xl border px-3 py-2 text-left text-sm transition ${
                    active
                      ? "border-emerald-700 bg-emerald-50 ring-2 ring-emerald-600"
                      : "border-gray-200 hover:border-emerald-400"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        )}

        {slots.length === 0 && !loading && (
          <p className="mt-4 text-sm text-[var(--muted)]">
            Selecione a data e clique em &quot;Ver horários&quot;.
          </p>
        )}
      </section>

      {selected && (
        <form
          onSubmit={handleBook}
          className="rounded-2xl border border-emerald-900/10 bg-white p-5"
        >
          <h3 className="font-semibold">Confirmar reserva</h3>
          <p className="mt-1 text-sm text-[var(--muted)]">
            {format(parseISO(selected.start), "EEEE, d 'de' MMMM · HH:mm", {
              locale: ptBR,
            })}{" "}
            · {selected.courtName} · {duration}h
          </p>
          <p className="mt-2 text-lg font-bold text-[var(--court-clay)]">
            Total: R$ {total.toFixed(2)}
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-sm">
              Nome
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="rounded-lg border px-3 py-2"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              E-mail
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-lg border px-3 py-2"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm sm:col-span-2">
              Telefone (opcional)
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="rounded-lg border px-3 py-2"
              />
            </label>
          </div>

          {error && (
            <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-4 w-full rounded-xl bg-[var(--court-clay)] py-3 font-semibold text-white hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Processando…" : "Pagar e confirmar (Mercado Pago)"}
          </button>
          <p className="mt-2 text-center text-xs text-[var(--muted)]">
            Pix, cartão e boleto via Mercado Pago. Sem token configurado, o app
            simula o pagamento em modo demo.
          </p>
        </form>
      )}
    </div>
  );
}

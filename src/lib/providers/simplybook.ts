import { addHours, format, parseISO } from "date-fns";
import type { DurationHours, TimeSlot } from "@/lib/types";
import type { ProviderConfig } from "@/lib/types";
import type {
  BookingProvider,
  BookingProviderContext,
  ExternalBookingResult,
} from "./types";
import { internalProvider } from "./internal";

const LOGIN_URL = "https://user-api.simplybook.me/login";
const API_URL = "https://user-api.simplybook.me";

async function getSimplyBookToken(companyLogin: string): Promise<string> {
  const apiKey = process.env.SIMPLYBOOK_API_KEY;
  if (!apiKey) throw new Error("SIMPLYBOOK_API_KEY não configurada");

  const res = await fetch(LOGIN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method: "getToken",
      params: [companyLogin, apiKey],
      id: 1,
    }),
  });

  const json = (await res.json()) as { result?: string; error?: { message: string } };
  if (json.error) throw new Error(json.error.message);
  if (!json.result) throw new Error("Token SimplyBook inválido");
  return json.result;
}

async function sbCall<T>(
  companyLogin: string,
  token: string,
  method: string,
  params: unknown[] = []
): Promise<T> {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Company-Login": companyLogin,
      "X-Token": token,
    },
    body: JSON.stringify({ jsonrpc: "2.0", method, params, id: 1 }),
  });

  const json = (await res.json()) as { result?: T; error?: { message: string } };
  if (json.error) throw new Error(json.error.message);
  return json.result as T;
}

function getSbConfig(ctx: BookingProviderContext) {
  const cfg = ctx.providerConfig as ProviderConfig;
  if (!cfg.simplybook?.companyLogin) {
    throw new Error("Configuração SimplyBook incompleta");
  }
  return cfg.simplybook;
}

export const simplyBookProvider: BookingProvider = {
  name: "simplybook",

  async getAvailableSlots(ctx, date, durationHours) {
    const cfg = getSbConfig(ctx);
    if (!process.env.SIMPLYBOOK_API_KEY) {
      return internalProvider.getAvailableSlots(ctx, date, durationHours);
    }

    const eventId =
      durationHours === 1 ? cfg.eventId1h : cfg.eventId2h;

    try {
      const token = await getSimplyBookToken(cfg.companyLogin);
      const startDate = date;
      const endDate = date;

      const times = await sbCall<Record<string, string[]>>(
        cfg.companyLogin,
        token,
        "getStartTimeMatrix",
        [eventId, startDate, endDate, cfg.unitId ?? null]
      );

      const slots: TimeSlot[] = [];
      const dayTimes = times[date] ?? [];

      for (const court of ctx.courts) {
        for (const time of dayTimes) {
          const start = parseISO(`${date}T${time}:00`);
          const end = addHours(start, durationHours);
          slots.push({
            courtId: court.id,
            courtName: court.name,
            start: start.toISOString(),
            end: end.toISOString(),
            available: true,
          });
        }
      }

      return slots;
    } catch {
      return internalProvider.getAvailableSlots(ctx, date, durationHours);
    }
  },

  async createBooking(ctx, params): Promise<ExternalBookingResult> {
    const cfg = getSbConfig(ctx);
    if (!process.env.SIMPLYBOOK_API_KEY) {
      return internalProvider.createBooking(ctx, params);
    }

    const token = await getSimplyBookToken(cfg.companyLogin);
    const eventId =
      params.durationHours === 1 ? cfg.eventId1h : cfg.eventId2h;

    const id = await sbCall<number>(cfg.companyLogin, token, "book", [
      eventId,
      cfg.unitId ?? 1,
      format(params.startAt, "yyyy-MM-dd HH:mm:ss"),
      {
        name: params.playerName,
        email: params.playerEmail,
        phone: params.playerPhone ?? "",
      },
      1,
      params.durationHours,
    ]);

    return { externalBookingId: String(id) };
  },
};

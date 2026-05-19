import { addHours, parseISO } from "date-fns";
import type { DurationHours, TimeSlot } from "@/lib/types";
import type { ProviderConfig } from "@/lib/types";
import type {
  BookingProvider,
  BookingProviderContext,
  ExternalBookingResult,
} from "./types";
import { internalProvider } from "./internal";

const WIX_API = "https://www.wixapis.com";

async function wixFetch<T>(
  path: string,
  body: Record<string, unknown>
): Promise<T> {
  const apiKey = process.env.WIX_API_KEY;
  if (!apiKey) throw new Error("WIX_API_KEY não configurada");

  const res = await fetch(`${WIX_API}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: apiKey,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Wix API ${res.status}: ${text}`);
  }

  return res.json() as Promise<T>;
}

function getWixConfig(ctx: BookingProviderContext) {
  const cfg = ctx.providerConfig as ProviderConfig;
  if (!cfg.wix?.serviceId1h || !cfg.wix?.serviceId2h) {
    throw new Error("Configuração Wix incompleta no cadastro da escola");
  }
  return cfg.wix;
}

function serviceIdForDuration(
  cfg: ProviderConfig["wix"],
  durationHours: DurationHours
) {
  return durationHours === 1 ? cfg!.serviceId1h : cfg!.serviceId2h;
}

export const wixProvider: BookingProvider = {
  name: "wix",

  async getAvailableSlots(ctx, date, durationHours) {
    if (!process.env.WIX_API_KEY) {
      return internalProvider.getAvailableSlots(ctx, date, durationHours);
    }

    const wix = getWixConfig(ctx);
    const serviceId = serviceIdForDuration(wix, durationHours);

    try {
      const data = await wixFetch<{
        timeSlots?: { startDate: string; endDate: string; openSpots?: number }[];
      }>("/bookings/v2/time-slots/query", {
        query: {
          filter: {
            serviceId,
            startDate: `${date}T00:00:00.000Z`,
            endDate: `${date}T23:59:59.999Z`,
          },
        },
      });

      const slots: TimeSlot[] = [];
      const defaultCourt = ctx.courts[0];
      if (!defaultCourt) return [];

      for (const slot of data.timeSlots ?? []) {
        const open = (slot.openSpots ?? 1) > 0;
        slots.push({
          courtId: defaultCourt.id,
          courtName: defaultCourt.name,
          start: slot.startDate,
          end: slot.endDate,
          available: open,
        });
      }

      return slots.filter((s) => s.available);
    } catch {
      return internalProvider.getAvailableSlots(ctx, date, durationHours);
    }
  },

  async createBooking(ctx, params): Promise<ExternalBookingResult> {
    if (!process.env.WIX_API_KEY) {
      return internalProvider.createBooking(ctx, params);
    }

    const wix = getWixConfig(ctx);
    const serviceId = serviceIdForDuration(wix, params.durationHours);
    const endAt = addHours(params.startAt, params.durationHours);

    const data = await wixFetch<{ booking?: { id: string } }>(
      "/bookings/v2/bookings",
      {
        booking: {
          bookedEntity: { serviceId },
          startDate: params.startAt.toISOString(),
          endDate: endAt.toISOString(),
          contactDetails: {
            firstName: params.playerName.split(" ")[0],
            lastName: params.playerName.split(" ").slice(1).join(" ") || "-",
            email: params.playerEmail,
            phone: params.playerPhone,
          },
        },
      }
    );

    return {
      externalBookingId: data.booking?.id ?? `wix-pending-${Date.now()}`,
    };
  },
};

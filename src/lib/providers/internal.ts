import { addHours, format, parseISO, setHours, setMinutes } from "date-fns";
import { prisma } from "@/lib/db";
import type { DurationHours, TimeSlot } from "@/lib/types";
import type {
  BookingProvider,
  BookingProviderContext,
  ExternalBookingResult,
} from "./types";

function dayBounds(dateStr: string, openHour: number, closeHour: number) {
  const day = parseISO(`${dateStr}T12:00:00`);
  const slots: Date[] = [];
  for (let h = openHour; h + 1 <= closeHour; h++) {
    slots.push(setMinutes(setHours(day, h), 0));
  }
  return slots;
}

export const internalProvider: BookingProvider = {
  name: "internal",

  async getAvailableSlots(ctx, date, durationHours) {
    const starts = dayBounds(date, ctx.openHour, ctx.closeHour);
    const rangeEnd = addHours(
      parseISO(`${date}T${String(ctx.closeHour).padStart(2, "0")}:00:00`),
      0
    );

    const existing = await prisma.booking.findMany({
      where: {
        court: { venueId: ctx.venueId },
        status: { in: ["PENDING_PAYMENT", "CONFIRMED"] },
        startAt: {
          gte: parseISO(`${date}T00:00:00`),
          lt: parseISO(`${date}T23:59:59`),
        },
      },
      select: { courtId: true, startAt: true, endAt: true },
    });

    const result: TimeSlot[] = [];

    for (const court of ctx.courts) {
      for (const start of starts) {
        const end = addHours(start, durationHours);
        if (end > rangeEnd) continue;

        const overlaps = existing.some(
          (b) =>
            b.courtId === court.id &&
            start < b.endAt &&
            end > b.startAt
        );

        result.push({
          courtId: court.id,
          courtName: court.name,
          start: start.toISOString(),
          end: end.toISOString(),
          available: !overlaps,
        });
      }
    }

    return result.filter((s) => s.available);
  },

  async createBooking(ctx, params): Promise<ExternalBookingResult> {
    return { externalBookingId: `internal-${params.courtId}-${params.startAt.toISOString()}` };
  },
};

export function formatSlotTime(iso: string) {
  return format(parseISO(iso), "HH:mm");
}

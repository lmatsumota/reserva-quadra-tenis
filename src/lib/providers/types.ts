import type { DurationHours, TimeSlot } from "@/lib/types";

export interface BookingProviderContext {
  venueId: string;
  providerConfig: Record<string, unknown>;
  openHour: number;
  closeHour: number;
  courts: { id: string; name: string; externalId: string | null }[];
}

export interface ExternalBookingResult {
  externalBookingId: string;
}

export interface BookingProvider {
  readonly name: string;
  getAvailableSlots(
    ctx: BookingProviderContext,
    date: string,
    durationHours: DurationHours
  ): Promise<TimeSlot[]>;
  createBooking(
    ctx: BookingProviderContext,
    params: {
      courtId: string;
      startAt: Date;
      durationHours: DurationHours;
      playerName: string;
      playerEmail: string;
      playerPhone?: string;
    }
  ): Promise<ExternalBookingResult>;
}

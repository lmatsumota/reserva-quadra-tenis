import type { ProviderType } from "@prisma/client";
import { internalProvider } from "./internal";
import { simplyBookProvider } from "./simplybook";
import type { BookingProvider } from "./types";
import { wixProvider } from "./wix";

const providers: Record<ProviderType, BookingProvider> = {
  INTERNAL: internalProvider,
  WIX: wixProvider,
  SIMPLYBOOK: simplyBookProvider,
};

export function getProvider(type: ProviderType): BookingProvider {
  return providers[type] ?? internalProvider;
}

export function buildProviderContext(venue: {
  id: string;
  providerConfig: string;
  openHour: number;
  closeHour: number;
  courts: { id: string; name: string; externalId: string | null }[];
}) {
  let config: Record<string, unknown> = {};
  try {
    config = JSON.parse(venue.providerConfig) as Record<string, unknown>;
  } catch {
    config = {};
  }

  return {
    venueId: venue.id,
    providerConfig: config,
    openHour: venue.openHour,
    closeHour: venue.closeHour,
    courts: venue.courts,
  };
}

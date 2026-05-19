export type DurationHours = 1 | 2;

export interface TimeSlot {
  start: string;
  end: string;
  available: boolean;
  courtId: string;
  courtName: string;
}

export interface VenueListItem {
  id: string;
  name: string;
  slug: string;
  city: string;
  state: string;
  address: string;
  description: string | null;
  imageUrl: string | null;
  provider: string;
  pricePerHour: number;
  courtsCount: number;
}

export interface CreateBookingInput {
  courtId: string;
  startAt: string;
  durationHours: DurationHours;
  playerName: string;
  playerEmail: string;
  playerPhone?: string;
}

export interface ProviderConfig {
  wix?: {
    siteId: string;
    serviceId1h: string;
    serviceId2h: string;
    resourceId?: string;
  };
  simplybook?: {
    companyLogin: string;
    eventId1h: string;
    eventId2h: string;
    unitId?: string;
  };
}

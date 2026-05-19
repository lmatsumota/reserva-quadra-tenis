import type { SessionUser } from "@/lib/auth";

export function venueFilterForAdmin(session: SessionUser) {
  if (session.role === "SUPER_ADMIN") return {};
  if (session.role === "VENUE_ADMIN" && session.venueId) {
    return { id: session.venueId };
  }
  return { id: "__none__" };
}

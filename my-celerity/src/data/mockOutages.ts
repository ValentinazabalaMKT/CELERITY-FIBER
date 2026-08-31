import type { ServiceOutage } from "@/types";

// Keyed by property id. Empty array = no active or recent outage to show.
export const mockOutages: Record<string, ServiceOutage[]> = {
  prop_grande: [],
  prop_wave: [
    {
      id: "outage_wave_1",
      propertyId: "prop_wave",
      status: "identified",
      startedAt: "2026-08-31T09:37:00-04:00",
      estimatedRestoration: "2026-08-31T11:45:00-04:00",
      affectedArea: "The Wave – Building B",
      timeline: [
        { status: "investigating", label: "Outage reported by monitoring system", timestamp: "2026-08-31T09:37:00-04:00" },
        { status: "identified", label: "Technicians investigating a fiber cut near Building B", timestamp: "2026-08-31T10:05:00-04:00" },
      ],
    },
  ],
};

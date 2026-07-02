import type { FreshnessStatus } from "@/types/ingestion";

const dayInMs = 24 * 60 * 60 * 1000;

export function dateFromDaysAgo(now: Date, daysAgo: number) {
  return new Date(now.getTime() - daysAgo * dayInMs).toISOString();
}

export function getListingAgeDays(lastSeenAt: string, now: Date) {
  const observedAt = new Date(lastSeenAt).getTime();

  if (!Number.isFinite(observedAt)) {
    return Number.POSITIVE_INFINITY;
  }

  return Math.max(0, Math.floor((now.getTime() - observedAt) / dayInMs));
}

export function getFreshnessStatus(lastSeenAt: string, now: Date): FreshnessStatus {
  const ageDays = getListingAgeDays(lastSeenAt, now);

  if (ageDays <= 2) {
    return "fresh";
  }

  if (ageDays <= 7) {
    return "aging";
  }

  return "stale";
}

export function getFreshnessLabel(status: FreshnessStatus) {
  if (status === "fresh") {
    return "Fresh";
  }

  if (status === "aging") {
    return "Aging";
  }

  return "Stale";
}

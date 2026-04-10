import type {
  CareerFirstWaveReadinessOccupationAdapter,
  CareerFirstWaveReadinessSummaryAdapter,
  CareerJobIndexCardAdapter,
  CareerSearchResultCardAdapter,
} from "@/lib/career/adapters/types";
import { isJobCardStableExposable } from "@/lib/career/jobExposurePolicy";

type JobFacingCard = CareerJobIndexCardAdapter | CareerSearchResultCardAdapter;

export function getFirstWaveReadinessOccupation(
  summary: CareerFirstWaveReadinessSummaryAdapter | null,
  slug: string | null | undefined
): CareerFirstWaveReadinessOccupationAdapter | null {
  const normalizedSlug = String(slug ?? "").trim().toLowerCase();
  if (!summary || !normalizedSlug) {
    return null;
  }

  return summary.occupationsBySlug[normalizedSlug] ?? null;
}

export function isFirstWavePublishReadySlug(
  summary: CareerFirstWaveReadinessSummaryAdapter | null,
  slug: string | null | undefined
): boolean {
  return getFirstWaveReadinessOccupation(summary, slug)?.status === "publish_ready";
}

export function isJobFacingCardExposableByFirstWaveSummary(
  summary: CareerFirstWaveReadinessSummaryAdapter | null,
  card: JobFacingCard
): boolean {
  if (!summary) {
    return false;
  }

  const readiness = getFirstWaveReadinessOccupation(summary, card.identity.canonicalSlug);

  if (!readiness) {
    return isJobCardStableExposable(card);
  }

  return readiness.status === "publish_ready" && isJobCardStableExposable(card);
}

export function filterJobFacingCardsByFirstWaveSummary<T extends JobFacingCard>(
  summary: CareerFirstWaveReadinessSummaryAdapter | null,
  cards: T[]
): T[] {
  return cards.filter((card) => isJobFacingCardExposableByFirstWaveSummary(summary, card));
}

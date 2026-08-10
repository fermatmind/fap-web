import { hasAnalyticsConsent } from "@/lib/consent/store";
import type {
  PublicTopicEdgeEntityType,
  PublicTopicEdgeItem,
  PublicTopicEdgeLocale,
  PublicTopicEdgeRelationType,
} from "@/lib/cms/publicTopicEdges";

export const PUBLIC_TOPIC_EDGE_CLICK_EVENT = "public_topic_edge_click";
export const PUBLIC_TOPIC_EDGE_DEDUP_WINDOW_MS = 2000;

export type PublicTopicEdgeEntrySurface =
  | "article_detail"
  | "content_page_detail"
  | "personality_detail"
  | "topic_detail";
export type PublicTopicEdgePositionBucket = "first" | "early" | "middle" | "late";

export type PublicTopicEdgeClickPayload = {
  edge_id: string;
  locale: PublicTopicEdgeLocale;
  source_surface: PublicTopicEdgeEntityType;
  target_surface: PublicTopicEdgeEntityType;
  relation_type: PublicTopicEdgeRelationType;
  display_region: "public_topic_edges";
  position_bucket: PublicTopicEdgePositionBucket;
  target_action: "open_public_edge";
  entry_surface: PublicTopicEdgeEntrySurface;
};

type AnalyticsWindow = Window & {
  gtag?: (...args: unknown[]) => void;
};

const recentDispatches = new Map<string, number>();

export function publicTopicEdgePositionBucket(index: number): PublicTopicEdgePositionBucket {
  if (index <= 0) return "first";
  if (index <= 2) return "early";
  if (index <= 5) return "middle";
  return "late";
}

export function buildPublicTopicEdgeClickPayload(
  item: PublicTopicEdgeItem,
  index: number,
  entrySurface: PublicTopicEdgeEntrySurface,
): PublicTopicEdgeClickPayload {
  return {
    edge_id: item.identity,
    locale: item.sourceLocale,
    source_surface: item.sourceType,
    target_surface: item.targetType,
    relation_type: item.relationType,
    display_region: "public_topic_edges",
    position_bucket: publicTopicEdgePositionBucket(index),
    target_action: "open_public_edge",
    entry_surface: entrySurface,
  };
}

function dedupKey(payload: PublicTopicEdgeClickPayload): string {
  return [
    payload.edge_id,
    payload.source_surface,
    payload.display_region,
    payload.position_bucket,
    payload.target_action,
  ].join("|");
}

function pruneRecentDispatches(now: number): void {
  for (const [key, timestamp] of recentDispatches.entries()) {
    if (now - timestamp > PUBLIC_TOPIC_EDGE_DEDUP_WINDOW_MS) {
      recentDispatches.delete(key);
    }
  }
}

export function resetPublicTopicEdgeClickDedupForTests(): void {
  recentDispatches.clear();
}

export function trackPublicTopicEdgeClick(payload: PublicTopicEdgeClickPayload): boolean {
  if (typeof window === "undefined" || !hasAnalyticsConsent()) return false;

  const analyticsWindow = window as AnalyticsWindow;
  if (typeof analyticsWindow.gtag !== "function") return false;

  const now = Date.now();
  pruneRecentDispatches(now);
  const key = dedupKey(payload);
  const previous = recentDispatches.get(key);
  if (previous !== undefined && now - previous <= PUBLIC_TOPIC_EDGE_DEDUP_WINDOW_MS) {
    return false;
  }

  try {
    analyticsWindow.gtag("event", PUBLIC_TOPIC_EDGE_CLICK_EVENT, payload);
    recentDispatches.set(key, now);
    return true;
  } catch {
    return false;
  }
}

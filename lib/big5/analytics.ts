import { trackEvent } from "@/lib/analytics";
import { computeManifestHash } from "@/lib/big5/manifest";

type Big5TrackingContext = {
  scale_code?: string;
  pack_version?: string;
  manifest_hash?: string;
  norms_version?: string;
  quality_level?: string;
  locked?: boolean;
  variant?: string;
  sku_id?: string;
  locale?: string;
};

export async function buildBig5TrackingContext(payload: {
  scaleCode?: string;
  packVersion?: string;
  manifestHash?: string | null;
  normsVersion?: string | null;
  qualityLevel?: string | null;
  locked?: boolean;
  variant?: string | null;
  skuId?: string | null;
  packId?: string | null;
  dirVersion?: string | null;
  contentPackageVersion?: string | null;
  locale?: string;
}): Promise<Big5TrackingContext> {
  const manifestHash = await computeManifestHash({
    manifestHash: payload.manifestHash,
    packId: payload.packId,
    dirVersion: payload.dirVersion,
    contentPackageVersion: payload.contentPackageVersion,
  });

  return {
    scale_code: payload.scaleCode ?? "BIG5_OCEAN",
    pack_version: payload.packVersion ?? payload.contentPackageVersion ?? payload.dirVersion ?? "unknown",
    manifest_hash: manifestHash,
    norms_version: payload.normsVersion ?? "unknown",
    quality_level: payload.qualityLevel ?? "unknown",
    ...(typeof payload.locked === "boolean" ? { locked: payload.locked } : {}),
    variant: payload.variant ?? "unknown",
    sku_id: payload.skuId ?? "",
    locale: payload.locale,
  };
}

export function trackBig5Event(
  eventName:
    | "landing_view"
    | "start_click"
    | "question_answer"
    | "submit_click"
    | "report_view_free"
    | "paywall_view"
    | "checkout_start"
    | "pay_success"
    | "unlock_success"
    | "pdf_download"
    | "retake_blocked",
  payload: Record<string, unknown>
): void {
  trackEvent(eventName, payload);
}

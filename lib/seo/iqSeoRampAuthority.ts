import { getCmsLandingSurface } from "@/lib/cms/landing-surfaces";
import type { Locale } from "@/lib/i18n/locales";
import {
  IQ_LAUNCH_CANONICAL_SLUG,
  resolveIqLaunchSeoGuard,
  type IqSeoRampAuthority,
} from "@/lib/seo/testDetailAuthority";

type IqSeoRampPayload = {
  seo?: {
    iq_ramp_authority?: unknown;
  };
};

const authorityCache = new Map<Locale, Promise<IqSeoRampAuthority | null>>();

function readRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function readString(value: unknown): string {
  return typeof value === "string" || typeof value === "number" ? String(value).trim() : "";
}

function readBoolean(value: unknown): boolean | null {
  return typeof value === "boolean" ? value : null;
}

function readStringRecord(value: unknown): Record<string, string> {
  const record = readRecord(value);
  const out: Record<string, string> = {};
  for (const [key, item] of Object.entries(record)) {
    const text = readString(item);
    if (text) out[key] = text;
  }
  return out;
}

export function normalizeIqSeoRampAuthority(value: unknown): IqSeoRampAuthority | null {
  const record = readRecord(value);
  if (!record.schema && !record.authority_source) {
    return null;
  }

  const media = readRecord(record.media);
  const claimPolicy = readRecord(record.claim_policy);

  return {
    schema: readString(record.schema),
    authoritySource: readString(record.authority_source),
    locale: readString(record.locale),
    testSlug: readString(record.test_slug),
    scaleCode: readString(record.scale_code),
    formCode: readString(record.form_code),
    canonicalPath: readString(record.canonical_path),
    localizedPaths: readStringRecord(record.localized_paths),
    robots: readString(record.robots),
    isIndexable: readBoolean(record.is_indexable),
    sitemapEligible: readBoolean(record.sitemap_eligible),
    llmsEligible: readBoolean(record.llms_eligible),
    llmsFullEligible: readBoolean(record.llms_full_eligible),
    jsonLdEligible: readBoolean(record.jsonld_eligible),
    media: {
      cardAssetKey: readString(media.card_asset_key),
      ogAssetKey: readString(media.og_asset_key),
      reportCoverAssetKey: readString(media.report_cover_asset_key),
      authority: readString(media.authority),
      source: readString(media.source),
      fallbackAllowed: readBoolean(media.fallback_allowed),
    },
    claimPolicy: {
      normAuthorityRequired: readBoolean(claimPolicy.norm_authority_required),
      normAuthorityPr: readString(claimPolicy.norm_authority_pr),
      publicCopyIqEstimateClaimsEnabled: readBoolean(claimPolicy.public_copy_iq_estimate_claims_enabled),
      publicCopyPercentileClaimsEnabled: readBoolean(claimPolicy.public_copy_percentile_claims_enabled),
      resultContextIqEstimateRequiresBackendReport: readBoolean(
        claimPolicy.result_context_iq_estimate_requires_backend_report
      ),
      paidReportClaimsRequireBackendEntitlement: readBoolean(claimPolicy.paid_report_claims_require_backend_entitlement),
      copyBoundary: readString(claimPolicy.copy_boundary),
    },
  };
}

export async function getIqSeoRampAuthorityForLocale(locale: Locale): Promise<IqSeoRampAuthority | null> {
  if (!authorityCache.has(locale)) {
    authorityCache.set(
      locale,
      getCmsLandingSurface<IqSeoRampPayload>("tests", locale)
        .then((surface) => normalizeIqSeoRampAuthority(surface.payloadJson?.seo?.iq_ramp_authority))
        .catch(() => null)
    );
  }

  return authorityCache.get(locale) ?? null;
}

export function isIqSeoRampDiscoverable(input: {
  slug: string;
  scaleCode?: string | null;
  title?: string | null;
  description?: string | null;
  authority: IqSeoRampAuthority | null;
  surface: "sitemap" | "llms" | "llms-full" | "jsonld" | "metadata";
}): boolean {
  const guard = resolveIqLaunchSeoGuard({
    slug: input.slug,
    scaleCode: input.scaleCode,
    hasSeoTitle: Boolean(input.title),
    hasSeoDescription: Boolean(input.description),
    title: input.title,
    description: input.description,
    seoRampAuthority: input.authority,
  });

  if (!guard.applies) {
    return true;
  }

  if (input.slug !== IQ_LAUNCH_CANONICAL_SLUG) {
    return false;
  }

  if (input.surface === "llms-full") {
    return guard.llmsFullExpansionAllowed;
  }

  if (input.surface === "jsonld") {
    return guard.jsonLdExpansionAllowed;
  }

  if (input.surface === "metadata") {
    return !guard.shouldNoindex;
  }

  return guard.sitemapLlmsExpansionAllowed;
}

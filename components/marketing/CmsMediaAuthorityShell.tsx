import type { Locale } from "@/lib/i18n/locales";
import {
  hasUsableCmsMediaAuthority,
  type CmsMediaAuthorityMetadata,
} from "@/lib/cms/media";

export function CmsMediaAuthorityShell({
  media,
  locale,
  surface,
  visible = true,
}: {
  media?: CmsMediaAuthorityMetadata | null;
  locale: Locale;
  surface: string;
  visible?: boolean;
}) {
  if (!visible) {
    return null;
  }

  const assetKey = typeof media?.asset_key === "string" ? media.asset_key.trim() : "";
  const usable = hasUsableCmsMediaAuthority(media);
  const copy = usable
    ? locale === "zh"
      ? "CMS 媒体已登记"
      : "CMS media registered"
    : locale === "zh"
      ? "CMS 媒体待后台配置"
      : "CMS media pending backend authority";

  return (
    <div
      data-testid={usable ? "cms-media-authority-shell" : "cms-media-minimal-shell"}
      data-media-state={usable ? "metadata-only" : "authority-missing"}
      data-asset-key={assetKey || "missing"}
      data-surface={surface}
      className="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50/70 px-3 py-2 text-xs font-medium text-slate-500"
      aria-label={copy}
    >
      <span>{copy}</span>
      {assetKey ? <span className="sr-only">{assetKey}</span> : null}
    </div>
  );
}

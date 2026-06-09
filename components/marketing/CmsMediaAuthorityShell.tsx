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
  void locale;

  return (
    <span
      data-testid={usable ? "cms-media-authority-shell" : "cms-media-minimal-shell"}
      data-media-state={usable ? "metadata-only" : "authority-missing"}
      data-asset-key={assetKey || "missing"}
      data-surface={surface}
      className="sr-only"
      aria-hidden="true"
    />
  );
}

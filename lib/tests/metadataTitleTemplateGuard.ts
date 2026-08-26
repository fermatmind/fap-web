import type { Metadata } from "next";

export function applyTestDetailMetadataTitleTemplateGuard(
  metadata: Metadata,
  sourceTitle: string,
): Metadata {
  const normalized = sourceTitle.replace(/\s+/g, " ").trim();
  const suffixPattern = /(?:\s*\|\s*FermatMind)+$/i;
  if (!suffixPattern.test(normalized)) {
    return metadata;
  }

  const baseTitle = normalized.replace(suffixPattern, "").trim();
  return {
    ...metadata,
    title: {
      absolute: baseTitle ? `${baseTitle} | FermatMind` : "FermatMind",
    },
  };
}

import type { Metadata } from "next";

export function applyPersonalityMetadataTitleTemplateGuard(
  metadata: Metadata,
  sourceTitle: string,
): Metadata {
  const title = sourceTitle.replace(/\s+/g, " ").trim();
  if (!/\|\s*FermatMind\s*$/i.test(title)) {
    return metadata;
  }

  return {
    ...metadata,
    title: {
      absolute: title,
    },
  };
}

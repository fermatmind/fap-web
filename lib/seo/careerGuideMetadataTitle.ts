import type { Metadata } from "next";

/** Keep a CMS-owned brand suffix from receiving the locale layout suffix again. */
export function resolveCareerGuideMetadataTitle(sourceTitle: string): Metadata["title"] {
  const title = sourceTitle.trim();
  if (!/[|｜]\s*(?:FermatMind|费马测试)\s*$/i.test(title)) return sourceTitle;

  return {
    absolute: title.replace(/(?:\s*[|｜]\s*(?:FermatMind|费马测试))+\s*$/i, " | FermatMind"),
  };
}

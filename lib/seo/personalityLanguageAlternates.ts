import type { Metadata } from "next";
import type { TraditionalPersonalityLanguageAlternates } from "@/lib/personality/traditionalLanguageAlternates";
import { canonicalUrl, isConfiguredStagingSiteUrl } from "@/lib/site";

export function withTraditionalPersonalityLanguageAlternates(
  metadata: Metadata,
  languages: TraditionalPersonalityLanguageAlternates | undefined,
): Metadata {
  if (!languages || isConfiguredStagingSiteUrl() ||
    (typeof metadata.robots === "object" && metadata.robots?.index === false)) {
    return metadata;
  }

  return {
    ...metadata,
    alternates: {
      ...metadata.alternates,
      languages: {
        ...metadata.alternates?.languages,
        en: canonicalUrl(languages.en),
        "zh-CN": canonicalUrl(languages["zh-CN"]),
        "zh-TW": canonicalUrl(languages["zh-TW"]),
      },
    },
  };
}

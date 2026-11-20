import type { ReportResponse } from "@/lib/api/v0_3";
export const fixedSampleLoaders = {
  mbti: {zh: () => import("./fixed-samples/zh-mbti_144.json"), en: () => import("./fixed-samples/en-mbti_144.json")},
  big5: {zh: () => import("./fixed-samples/zh-big5_120.json"), en: () => import("./fixed-samples/en-big5_120.json")},
  enneagram: {zh: () => import("./fixed-samples/zh-enneagram_likert_105.json"), en: () => import("./fixed-samples/en-enneagram_likert_105.json")},
  iq30: {zh: () => import("./fixed-samples/zh-IQ_OWNER_ORIGINAL_30.json"), en: () => import("./fixed-samples/en-IQ_OWNER_ORIGINAL_30.json")},
  iq40: {zh: () => import("./fixed-samples/zh-IQ_MERGED_40.json"), en: () => import("./fixed-samples/en-IQ_MERGED_40.json")},
  eq: {zh: () => import("./fixed-samples/zh-eq_60.json"), en: () => import("./fixed-samples/en-eq_60.json")},
  archetypes: {zh: () => import("./fixed-samples/zh-jung_archetypes_48.json"), en: () => import("./fixed-samples/en-jung_archetypes_48.json")},
  cognitive: {zh: () => import("./fixed-samples/zh-jung_cognitive_functions_64.json"), en: () => import("./fixed-samples/en-jung_cognitive_functions_64.json")},
  disc: {zh: () => import("./fixed-samples/zh-disc_24.json"), en: () => import("./fixed-samples/en-disc_24.json")},
};
export async function loadFixedSample(test: string, locale: "zh" | "en"): Promise<ReportResponse | null> {
 const loader = fixedSampleLoaders[test as keyof typeof fixedSampleLoaders]?.[locale];
 return loader ? (await loader()).default as unknown as ReportResponse : null;
}

export async function loadFixedMbtiSampleContent(locale: import("@/lib/i18n/locales").DisplayLocale) {
 const { normalizeDesktopCloneResponse } = await import("@/lib/cms/personality-desktop-clone");
 const { projectTraditionalResultDisplay } = await import("@/lib/tests/traditionalAssessmentDisplay");
 const source = locale === "en" ? await import("./fixed-samples/en-mbti-content.json") : await import("./fixed-samples/zh-mbti-content.json");
 const content = normalizeDesktopCloneResponse(source.default, "ISFJ-T", locale === "en" ? "en" : "zh-CN", true);
 const projected = await projectTraditionalResultDisplay({mbti_pdf_content: content}, locale);
 const localized = projected.mbti_pdf_content;
 if (!localized) return null;
 // Use the same repository chapter artwork as the interactive production page.
 const chapters = new Set(["traits-illustration", "career-illustration", "growth-illustration", "relationships-illustration"]);
 return {...localized, assetSlots: localized.assetSlots.filter(slot => !chapters.has(slot.slotId))};
}

import pack from "./content.zh-CN.json";
import identities from "./identities.zh-CN.json";
import { applyLocalizedContent } from "./localized-content";
import { resultCodes } from "./chinese-content";
import type { DisplayLocale } from "@/lib/i18n/locales";
import type { PersonalityDesktopCloneContentPayload, PersonalityDesktopCloneAssetSlot } from "@/lib/cms/personality-desktop-clone";
import type { MbtiDesktopCloneContent, MbtiDesktopCloneAssetSlotId } from "@/components/result/mbti/clone/mbtiDesktopClone.slots";

/** Shared editorial text. Never selects or replaces attempt scores, type, access or form metadata. */
export function getMbtiResultContent(fullCode: string, language: DisplayLocale) {
  // Older attempts may carry only a base type. Use shared chapter copy without
  // assigning an A/T result or presenting either variant's hero narrative.
  const baseOnly = /^[EI][SN][TF][JP]$/.test(fullCode);
  const contentCode = baseOnly ? `${fullCode}-A` : fullCode;
  if (!resultCodes.includes(contentCode)) return null;
  const hero = (identities as Record<string, MbtiDesktopCloneContent["hero"]>)[contentCode];
  if (!hero) return null;
  const base = fullCode.slice(0, 4).toLowerCase();
  const body = language === "en" ? "Read each preference alongside its score and your actual experience." : "结合每组偏好、分数与实际经历理解结果。";
  const chapters = (pack.types as unknown as Record<string, { chapters: MbtiDesktopCloneContent["chapters"] }>)[fullCode.slice(0, 4)].chapters;
  const data: PersonalityDesktopCloneContentPayload = {
    templateKey: "mbti_desktop_clone_v1", schemaVersion: "v1", fullCode: contentCode, baseCode: fullCode.slice(0, 4), locale: "zh-CN", meta: null,
    content: {
      hero, intro: { paragraphs: [body, body] },
      traits: { summaryPane: { eyebrow: "", title: "", value: "", body }, body: [body, body] },
      chapters,
      finalOffer: { eyebrow: "", headline: "", body: "", priceLabel: "", ctaLabel: "", guarantee: "" },
    },
    assetSlots: [
      ["hero-illustration", `/images/mbti/result-portraits/${base}.webp`, "3 / 4"],
      ...["traits", "career", "growth", "relationships"].map((key) => [`${key}-illustration`, `/images/mbti/result-chapters/${base}/${key}.webp`, base === "estp" && key === "traits" ? "9 / 5" : "3 / 2"]),
    ].map(([slotId, url, aspectRatio]): PersonalityDesktopCloneAssetSlot => ({
      slotId: slotId as MbtiDesktopCloneAssetSlotId, label: "", aspectRatio, status: "ready", alt: "", meta: { decorative: true },
      assetRef: { provider: "internal", path: url, url, version: null, checksum: null },
    })),
  };
  const localized = applyLocalizedContent(data, language);
  if (baseOnly) {
    const other = (identities as Record<string, MbtiDesktopCloneContent["hero"]>)[`${fullCode}-T`];
    const identity = localized.data.content.hero.profileIdentity!;
    localized.data.fullCode = fullCode;
    localized.data.content.hero = {
      summary: "",
      profileIdentity: { ...identity, code: fullCode, nickname: "", introduction: undefined,
        keywords: language === "en" ? identity.keywords : identity.keywords.filter((key) => other.profileIdentity?.keywords.includes(key)) },
    };
  }
  return localized;
}

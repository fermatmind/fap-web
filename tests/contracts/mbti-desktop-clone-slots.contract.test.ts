import { describe, expect, it } from "vitest";
import { MBTI_DESKTOP_CLONE_CONTENT_ZH } from "@/components/result/mbti/clone/content";
import { MBTI_BASE_CODES } from "@/components/result/mbti/clone/mbtiDesktopClone.slots";
import { MBTI_DESKTOP_CLONE_PLACEHOLDER_SLOTS_ZH } from "@/components/result/mbti/clone/mbtiDesktopClone.placeholders";
import { resolveMbtiDesktopCloneSlots } from "@/components/result/mbti/clone/mbtiDesktopClone.resolve";
import type { MbtiSectionUnlock, RichResultHeadline } from "@/components/result/RichResultReport";
import type { ReportResponse } from "@/lib/api/v0_3";
import type { Locale } from "@/lib/i18n/locales";
import { buildMbtiResultProjectionViewModel } from "@/lib/mbti/publicProjection";
import { applyMbtiPhase2Fixture } from "@/tests/helpers/mbtiPhase2Fixture";
import reportReadyMbtiProjectionFixture from "@/tests/fixtures/report_ready.mbti.projection.json";

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function mutateFixtureType(reportData: ReportResponse, typeCode: string, typeName: string) {
  const fullCode = typeCode.toUpperCase();
  const baseCode = (fullCode.match(/([A-Z]{4})/)?.[1] ?? fullCode).toUpperCase();
  const report = asRecord(reportData.report);
  const identityCard = asRecord(report.identity_card);
  const profile = asRecord(report.profile);
  const projection = asRecord(reportData.mbti_public_projection_v1);
  const projectionProfile = asRecord(projection.profile);
  const summaryCard = asRecord(projection.summary_card);
  const meta = asRecord(projection._meta);
  const personalization = asRecord(meta.personalization);

  identityCard.type_code = fullCode;
  identityCard.title = typeName;
  profile.type_code = fullCode;
  profile.type_name = typeName;
  report.identity_card = identityCard;
  report.profile = profile;
  reportData.report = report;

  projection.runtime_type_code = fullCode;
  projection.canonical_type_code = baseCode;
  projection.display_type = fullCode;
  projectionProfile.type_name = typeName;
  projectionProfile.hero_summary = `${typeName} runtime hero summary`;
  projectionProfile.keywords = [`${baseCode} runtime trait`, `${baseCode} desktop`, `type:${fullCode}`];
  summaryCard.title = typeName;
  summaryCard.subtitle = `${fullCode} runtime subtitle`;
  summaryCard.summary = `${typeName} runtime summary`;
  personalization.type_code = fullCode;
  meta.personalization = personalization;
  projection.profile = projectionProfile;
  projection.summary_card = summaryCard;
  projection._meta = meta;
  reportData.mbti_public_projection_v1 = projection;

  return reportData;
}

function createHeadline(typeCode: string, typeName: string): RichResultHeadline {
  return {
    badge: "MBTI",
    typeCode,
    displayName: typeName,
    supportingLine: `${typeCode} supporting line`,
    summary: `${typeName} headline summary`,
    rarity: "test rarity",
  };
}

function createSectionUnlocks(): Record<string, MbtiSectionUnlock> {
  return {
    traits: {
      teaser: "traits teaser",
      benefits: ["benefit one"],
      offer: null,
    },
    career: {
      teaser: "career teaser",
      benefits: ["career benefit"],
      offer: null,
    },
    growth: {
      teaser: "growth teaser",
      benefits: ["growth benefit"],
      offer: null,
    },
    relationships: {
      teaser: "relationships teaser",
      benefits: ["relationships benefit"],
      offer: null,
    },
  };
}

function resolveSlotsForType(typeCode: string, typeName: string, locale: Locale = "zh") {
  const reportData = mutateFixtureType(
    applyMbtiPhase2Fixture(structuredClone(reportReadyMbtiProjectionFixture) as ReportResponse),
    typeCode,
    typeName,
  );
  const projectionViewModel = buildMbtiResultProjectionViewModel(reportData);

  return resolveMbtiDesktopCloneSlots({
    locale,
    headline: createHeadline(typeCode, typeName),
    dimensions: [],
    highlights: [],
    sections: [],
    sectionUnlocks: createSectionUnlocks(),
    offers: [],
    projectionViewModel,
  });
}

describe("MBTI desktop clone slots contract", () => {
  it("resolves zh registry content for all 16 base codes", () => {
    MBTI_BASE_CODES.forEach((baseCode, index) => {
      const fullCode = `${baseCode}-${index % 2 === 0 ? "T" : "A"}`;
      const slots = resolveSlotsForType(fullCode, `${baseCode} 类型`);
      const content = MBTI_DESKTOP_CLONE_CONTENT_ZH[baseCode];

      expect(slots.meta.baseCode).toBe(baseCode);
      expect(slots.meta.fullCode).toBe(fullCode);
      expect(slots.hero.summary).toBe(content.hero.summary);
      expect(slots.intro.paragraphs).toEqual(content.intro.paragraphs);
      expect(slots.traits.summaryPane).toMatchObject(content.traits.summaryPane);
      expect(slots.traits.body).toEqual(content.traits.body);
      expect(slots.chapters.career.intro).toEqual(content.chapters.career.intro);
      expect(slots.chapters.growth.visibleBlocks).toEqual(content.chapters.growth.visibleBlocks);
      expect(slots.chapters.relationships.lockedBlocks).toEqual(content.chapters.relationships.lockedBlocks);
      expect(slots.finalOffer.headline).toBe(content.finalOffer.headline);
      expect(slots.finalOffer.guarantee).toBe(content.finalOffer.guarantee);
    });
  });

  it("keeps non-zh locales on the structured placeholder path", () => {
    const infjSlots = resolveSlotsForType("INFJ-A", "INFJ 类型", "en");

    expect(infjSlots.meta.baseCode).toBe("INFJ");
    expect(infjSlots.meta.fullCode).toBe("INFJ-A");
    expect(infjSlots.hero.summary).toBe(MBTI_DESKTOP_CLONE_PLACEHOLDER_SLOTS_ZH.hero.summary);
    expect(infjSlots.intro.paragraphs).toEqual(MBTI_DESKTOP_CLONE_PLACEHOLDER_SLOTS_ZH.intro.paragraphs);
    expect(infjSlots.chapters.career.lockedBlocks).toEqual(MBTI_DESKTOP_CLONE_PLACEHOLDER_SLOTS_ZH.chapters.career.lockedBlocks);
    expect(infjSlots.finalOffer.headline).toBe(MBTI_DESKTOP_CLONE_PLACEHOLDER_SLOTS_ZH.finalOffer.headline);
  });
});

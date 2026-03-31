import { describe, expect, it } from "vitest";
import { MBTI_DESKTOP_CLONE_PILOT_CONTENT_ZH } from "@/components/result/mbti/clone/content";
import { MBTI_DESKTOP_CLONE_PLACEHOLDER_SLOTS_ZH } from "@/components/result/mbti/clone/mbtiDesktopClone.placeholders";
import { resolveMbtiDesktopCloneSlots } from "@/components/result/mbti/clone/mbtiDesktopClone.resolve";
import type { MbtiSectionUnlock, RichResultHeadline } from "@/components/result/RichResultReport";
import type { ReportResponse } from "@/lib/api/v0_3";
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
  projectionProfile.hero_summary = `${typeName} resolver contract hero summary`;
  projectionProfile.keywords = [`${baseCode} resolver trait`, `${baseCode} desktop`, `type:${fullCode}`];
  summaryCard.title = typeName;
  summaryCard.subtitle = `${fullCode} resolver contract subtitle`;
  summaryCard.summary = `${typeName} resolver contract summary`;
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

function resolveSlotsForType(typeCode: string, typeName: string) {
  const reportData = mutateFixtureType(
    applyMbtiPhase2Fixture(structuredClone(reportReadyMbtiProjectionFixture) as ReportResponse),
    typeCode,
    typeName,
  );
  const projectionViewModel = buildMbtiResultProjectionViewModel(reportData);

  return resolveMbtiDesktopCloneSlots({
    locale: "zh",
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
  it("normalizes INFJ/ENTJ full codes to base codes and resolves zh pilot content", () => {
    const infjSlots = resolveSlotsForType("INFJ-T", "INFJ 试点");
    const entjSlots = resolveSlotsForType("ENTJ-A", "ENTJ 试点");

    expect(infjSlots.meta.baseCode).toBe("INFJ");
    expect(infjSlots.meta.fullCode).toBe("INFJ-T");
    expect(infjSlots.meta.isPilot).toBe(true);
    expect(infjSlots.hero.summary).toBe(MBTI_DESKTOP_CLONE_PILOT_CONTENT_ZH.INFJ.hero.summary);
    expect(infjSlots.intro.paragraphs).toEqual(MBTI_DESKTOP_CLONE_PILOT_CONTENT_ZH.INFJ.intro.paragraphs);
    expect(infjSlots.chapters.career.intro).toEqual(MBTI_DESKTOP_CLONE_PILOT_CONTENT_ZH.INFJ.chapters.career.intro);
    expect(infjSlots.finalOffer.headline).toBe(MBTI_DESKTOP_CLONE_PILOT_CONTENT_ZH.INFJ.finalOffer.headline);

    expect(entjSlots.meta.baseCode).toBe("ENTJ");
    expect(entjSlots.meta.fullCode).toBe("ENTJ-A");
    expect(entjSlots.meta.isPilot).toBe(true);
    expect(entjSlots.hero.summary).toBe(MBTI_DESKTOP_CLONE_PILOT_CONTENT_ZH.ENTJ.hero.summary);
    expect(entjSlots.intro.paragraphs).toEqual(MBTI_DESKTOP_CLONE_PILOT_CONTENT_ZH.ENTJ.intro.paragraphs);
    expect(entjSlots.chapters.growth.intro).toEqual(MBTI_DESKTOP_CLONE_PILOT_CONTENT_ZH.ENTJ.chapters.growth.intro);
    expect(entjSlots.finalOffer.headline).toBe(MBTI_DESKTOP_CLONE_PILOT_CONTENT_ZH.ENTJ.finalOffer.headline);
  });

  it("keeps non-pilot types on the structured placeholder path", () => {
    const isfpSlots = resolveSlotsForType("ISFP-T", "ISFP 非试点");

    expect(isfpSlots.meta.baseCode).toBe("ISFP");
    expect(isfpSlots.meta.fullCode).toBe("ISFP-T");
    expect(isfpSlots.meta.isPilot).toBe(false);
    expect(isfpSlots.hero.summary).toBe(MBTI_DESKTOP_CLONE_PLACEHOLDER_SLOTS_ZH.hero.summary);
    expect(isfpSlots.intro.paragraphs).toEqual(MBTI_DESKTOP_CLONE_PLACEHOLDER_SLOTS_ZH.intro.paragraphs);
    expect(isfpSlots.chapters.career.lockedBlocks).toEqual(MBTI_DESKTOP_CLONE_PLACEHOLDER_SLOTS_ZH.chapters.career.lockedBlocks);
    expect(isfpSlots.finalOffer.headline).toBe(MBTI_DESKTOP_CLONE_PLACEHOLDER_SLOTS_ZH.finalOffer.headline);
  });
});

import { describe, expect, it } from "vitest";
import { adaptCareerDisplaySurface, buildCareerDisplayFAQPageJsonLd } from "@/lib/career/displaySurface";
import {
  buildActorsDisplaySurfaceFixture,
  buildSelectedCareerDisplaySurfaceFixture,
} from "@/tests/contracts/careerDisplaySurface.fixture";

describe("career display schema contract", () => {
  it("builds FAQPage only from visible FAQ items", () => {
    const surface = adaptCareerDisplaySurface(buildActorsDisplaySurfaceFixture(), "en");
    const faqJsonLd = buildCareerDisplayFAQPageJsonLd(surface);

    expect(faqJsonLd?.["@type"]).toBe("FAQPage");
    expect(faqJsonLd?.mainEntity).toHaveLength(surface?.faqItems.length ?? 0);
    expect(JSON.stringify(faqJsonLd)).toContain("Is acting a good career for creative people?");
    expect(JSON.stringify(faqJsonLd)).not.toContain("Hidden FAQ should not be trusted");
  });

  it("does not produce FAQPage from hidden structured FAQ when no visible FAQ exists", () => {
    const fixture = buildActorsDisplaySurfaceFixture();
    fixture.page.en.sections = fixture.page.en.sections.filter((section) => section.component !== "CareerFAQBlock");
    const surface = adaptCareerDisplaySurface(fixture, "en");

    expect(surface?.faqItems).toHaveLength(0);
    expect(buildCareerDisplayFAQPageJsonLd(surface)).toBeNull();
  });

  it("keeps visible FAQPage mainEntity count aligned with rendered FAQ", () => {
    const surface = adaptCareerDisplaySurface(buildActorsDisplaySurfaceFixture(), "zh");
    const faqJsonLd = buildCareerDisplayFAQPageJsonLd(surface);

    expect(faqJsonLd?.mainEntity).toHaveLength(2);
    expect(surface?.faqItems.map((item) => item.question)).toEqual([
      "普通人想做演员，应该先去横店跑组吗？",
      "没有表演院校背景，可以做演员吗？",
    ]);
  });

  it("builds selected non-Actors FAQPage from component-keyed visible FAQ only", () => {
    const surface = adaptCareerDisplaySurface(
      buildSelectedCareerDisplaySurfaceFixture({ slug: "data-scientists", titleEn: "Data Scientists" }),
      "en"
    );
    const faqJsonLd = buildCareerDisplayFAQPageJsonLd(surface);
    const serialized = JSON.stringify(faqJsonLd);

    expect(faqJsonLd?.["@type"]).toBe("FAQPage");
    expect(faqJsonLd?.mainEntity).toHaveLength(2);
    expect(serialized).toContain("Is Data Scientists a good career fit?");
    expect(serialized).not.toContain("Hidden FAQ should not be trusted");
  });

  it("builds D5 FAQPage from visible FAQ only", () => {
    const surface = adaptCareerDisplaySurface(
      buildSelectedCareerDisplaySurfaceFixture({ slug: "biomedical-engineers", titleEn: "Biomedical Engineers" }),
      "en"
    );
    const faqJsonLd = buildCareerDisplayFAQPageJsonLd(surface);
    const serialized = JSON.stringify(faqJsonLd);

    expect(faqJsonLd?.["@type"]).toBe("FAQPage");
    expect(faqJsonLd?.mainEntity).toHaveLength(2);
    expect(serialized).toContain("Is Biomedical Engineers a good career fit?");
    expect(serialized).not.toContain("Hidden FAQ should not be trusted");
    expect(serialized).not.toContain("Product");
  });

  it("does not locally produce Product or Occupation schema", () => {
    const surface = adaptCareerDisplaySurface(buildActorsDisplaySurfaceFixture(), "en");
    const faqJsonLd = buildCareerDisplayFAQPageJsonLd(surface);
    const serialized = JSON.stringify(faqJsonLd);

    expect(serialized).toContain("FAQPage");
    expect(serialized).not.toContain("Product");
    expect(serialized).not.toContain("Occupation");
  });

  it("keeps forbidden schema terms out of emitted JSON-LD", () => {
    const surface = adaptCareerDisplaySurface(buildActorsDisplaySurfaceFixture(), "en");
    const faqJsonLd = buildCareerDisplayFAQPageJsonLd(surface);
    const serialized = JSON.stringify(faqJsonLd);

    expect(serialized).not.toContain("China industry proxy wage");
    expect(serialized).not.toContain("AI Exposure");
    expect(serialized).not.toContain("job-posting sample");
    expect(serialized).not.toContain("raw_ai_exposure_score");
    expect(serialized).not.toContain("tracking_json");
  });
});

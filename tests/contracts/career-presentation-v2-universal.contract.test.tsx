import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CareerDisplaySurface } from "@/components/career/display/CareerDisplaySurface";
import {
  adaptCareerDisplaySurface,
  buildCareerDisplayFAQPageJsonLd,
} from "@/lib/career/displaySurface";
import { CAREER_VISUAL_GROUP_IDS } from "@/lib/career/careerVisualGroups";
import {
  buildCareerPresentationV2Fixture,
  buildSelectedCareerDisplaySurfaceFixture,
} from "@/tests/contracts/careerDisplaySurface.fixture";

const REPRESENTATIVE_CAREERS = [
  ["accountants-and-auditors", "Accountants and Auditors", "会计师和审计师"],
  ["actuaries", "Actuaries", "精算师"],
  ["actors", "Actors", "演员"],
  ["registered-nurses", "Registered Nurses", "注册护士"],
  ["software-developers", "Software Developers", "软件开发者"],
] as const;

describe("career presentation_v2 universal dossier contract", () => {
  it.each(REPRESENTATIVE_CAREERS)("adapts %s in both locales with contract-declared groups", (slug, titleEn, titleZh) => {
    for (const locale of ["zh", "en"] as const) {
      const fixture = buildSelectedCareerDisplaySurfaceFixture({
        slug,
        locale,
        titleEn,
        titleZh,
        presentationV2: slug === "accountants-and-auditors" ? "enhanced" : "legacy",
      });
      const surface = adaptCareerDisplaySurface(fixture, locale);

      expect(surface?.presentationV2?.locale).toBe(locale === "zh" ? "zh-CN" : "en");
      expect(surface?.presentationV2?.groups.map((group) => group.id)).toEqual(CAREER_VISUAL_GROUP_IDS);
      expect(surface?.presentationV2?.groups.every((group) =>
        group.contentState === (slug === "accountants-and-auditors" ? "enhanced" : "legacy")
      )).toBe(true);
    }
  });

  it("preserves legacy authoritative body text and renders only nosnippet enrichment notices", () => {
    const fixture = buildSelectedCareerDisplaySurfaceFixture({
      slug: "accountants-and-auditors",
      locale: "zh",
      titleEn: "Accountants and Auditors",
      titleZh: "会计师和审计师",
      presentationV2: "legacy",
    });
    const surface = adaptCareerDisplaySurface(fixture, "zh");
    render(<CareerDisplaySurface surface={surface} />);

    expect(screen.getByText("会计师和审计师 负责把职业任务转化为可验证的工作结果。")).toBeInTheDocument();
    const notices = document.querySelectorAll("[data-career-pending-enrichment='true']");
    expect(notices.length).toBeGreaterThan(0);
    notices.forEach((notice) => expect(notice).toHaveAttribute("data-nosnippet"));
    expect(JSON.stringify(buildCareerDisplayFAQPageJsonLd(surface))).not.toContain("内容待升级");
  });

  it("accepts the old API without presentation_v2 and fails closed on a declared invalid v2", () => {
    const oldFixture = buildSelectedCareerDisplaySurfaceFixture({ slug: "actors", locale: "en" });
    expect(adaptCareerDisplaySurface(oldFixture, "en")?.presentationV2).toBeNull();

    const invalidFixture = buildSelectedCareerDisplaySurfaceFixture({ slug: "actors", locale: "en" });
    const invalidPresentation = buildCareerPresentationV2Fixture({
      locale: "en",
      title: "Actors",
      href: "/en/tests/holland-career-interest-test-riasec",
      contentState: "legacy",
    });
    (invalidPresentation.groups[0] as { content_state: string }).content_state = "invented";
    Object.assign(invalidFixture, { presentation_v2: invalidPresentation });

    expect(adaptCareerDisplaySurface(invalidFixture, "en")).toBeNull();
  });

  it("accepts optional component subsets while retaining their declared order", () => {
    const fixture = buildSelectedCareerDisplaySurfaceFixture({
      slug: "actors",
      locale: "en",
      presentationV2: "legacy",
    });
    const omitted = new Set(["career_ai_description_block", "review_validity_card"]);
    fixture.component_order = fixture.component_order.filter((componentId) => !omitted.has(componentId));
    const presentationV2 = buildCareerPresentationV2Fixture({
      locale: "en",
      title: "Actors",
      href: "/en/tests/holland-career-interest-test-riasec",
      contentState: "legacy",
      componentOrder: fixture.component_order,
    });
    Object.assign(fixture, { presentation_v2: presentationV2 });

    const surface = adaptCareerDisplaySurface(fixture, "en");
    expect(surface?.componentOrder).toEqual(fixture.component_order);
    expect(surface?.presentationV2?.groups.flatMap((group) => group.componentIds)).toEqual(fixture.component_order);
  });

  it("keeps English compatibility boundaries human-readable when legacy component evidence is incomplete", () => {
    const fixture = buildSelectedCareerDisplaySurfaceFixture({
      slug: "accountants-and-auditors",
      locale: "en",
      titleEn: "Accountants and Auditors",
      presentationV2: "enhanced",
    });
    const surface = adaptCareerDisplaySurface(fixture, "en");
    render(<CareerDisplaySurface surface={surface} />);

    expect(screen.getByRole("heading", { name: "Career quick answers" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "O*NET structured fields" })).toBeInTheDocument();
    expect(document.body.textContent).not.toContain("career_quick_answers_block");
    expect(document.body.textContent).not.toContain("onet_structured_fields_block");
  });
});

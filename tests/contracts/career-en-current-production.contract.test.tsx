import { existsSync, readFileSync } from "node:fs";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CareerDisplaySurface } from "@/components/career/display/CareerDisplaySurface";
import { CAREER_VISUAL_GROUP_IDS } from "@/lib/career/careerVisualGroups";
import { adaptCareerDisplaySurface } from "@/lib/career/displaySurface";
import { buildSelectedCareerDisplaySurfaceFixture } from "@/tests/contracts/careerDisplaySurface.fixture";

function buildEnglishCurrentProjection(slug: string, titleEn: string) {
  const fixture = buildSelectedCareerDisplaySurfaceFixture({ slug, titleEn, locale: "zh" });
  delete (fixture as Record<string, unknown>).presentation_v1;
  fixture.page.locale = "en";
  const content = fixture.page.content as Record<string, unknown>;
  content.path = `/en/career/jobs/${slug}`;
  content.breadcrumb = { label: titleEn, slug };
  content.hero = {
    h1: titleEn,
    title: titleEn,
    quick_answer: `${titleEn} API quick answer.`,
  };
  content.primary_cta = {
    ...fixture.page.content.primary_cta,
    href: "/en/tests/holland-career-interest-test-riasec",
    label: "Measure my career interests",
  };
  content.final_cta = {
    ...fixture.page.content.final_cta,
    href: "/en/tests/holland-career-interest-test-riasec",
    label: "Measure my career interests",
  };
  content.career_quick_answers_block = {
    availability: "unavailable",
    reason_code: "source_locale_unavailable",
  };
  content.onet_structured_fields_block = {
    availability: "unavailable",
    reason_code: "source_locale_unavailable",
  };
  return fixture;
}

describe("career English Current production renderer", () => {
  it("adapts the sealed EN-F2B projection when local authority evidence is available", () => {
    const projectionPath = "/private/tmp/fap-api-en-f2b.oRs65H/plan-a/projections/en/accountants-and-auditors.json";
    if (!existsSync(projectionPath)) return;

    const projection = JSON.parse(readFileSync(projectionPath, "utf8")) as Record<string, unknown>;
    projection.subject = { canonical_slug: "accountants-and-auditors", soc_code: "13-2011", onet_code: "13-2011.00" };
    projection.claim_permissions = {
      integrity_state: "full",
      allow_strong_claim: true,
      allow_ai_strategy: true,
      allow_salary_comparison: true,
      allow_market_signal: true,
      allow_local_proxy_wage: true,
      blocked_claims: [],
      warnings: [],
      evidence_basis: { salary: "official", ai_exposure: "central_score", market_signal: "sample", crosswalk: "direct" },
    };

    const surface = adaptCareerDisplaySurface(projection, "en", {}, "accountants-and-auditors", "Accountants and auditors");
    expect(surface?.publishedComponents).not.toBeNull();
    expect(surface?.presentationV1).toBeNull();

    render(<CareerDisplaySurface surface={surface} />);
    expect(document.querySelectorAll("[data-career-visual-group]")).toHaveLength(12);
    expect(document.querySelectorAll("[data-career-component-id]")).toHaveLength(26);
    expect(document.querySelectorAll("[data-career-api-component]")).toHaveLength(26);
    const chromeText = [...document.querySelectorAll("h1, h2, h3, h4, th, summary")]
      .map((element) => element.textContent ?? "")
      .join(" ");
    expect(chromeText).not.toMatch(/[\u3400-\u9fff]/u);
  });

  it.each([
    ["actuaries", "Actuaries"],
    ["registered-nurses", "Registered Nurses"],
    ["accountants-and-auditors", "Accountants and Auditors"],
  ] as const)("renders %s through the shared 12-group renderer from API components only", (slug, titleEn) => {
    const surface = adaptCareerDisplaySurface(buildEnglishCurrentProjection(slug, titleEn), "en", {}, slug, titleEn);

    expect(surface?.publishedComponents).not.toBeNull();
    expect(surface?.presentationV1).toBeNull();

    render(
      <CareerDisplaySurface
        surface={surface}
        salarySlot={<div data-testid="forbidden-en-salary-sidecar" />}
        aiImpactSlot={<div data-testid="forbidden-en-ai-sidecar" />}
      />
    );

    expect(screen.getByTestId("career-display-surface")).toHaveTextContent(titleEn);
    expect([...document.querySelectorAll("[data-career-visual-group]")].map((group) => group.getAttribute("data-career-visual-group")))
      .toEqual(CAREER_VISUAL_GROUP_IDS);
    expect(document.querySelectorAll("[data-career-component-id]")).toHaveLength(26);
    expect(document.querySelectorAll("[data-career-api-component]")).toHaveLength(26);
    expect(document.querySelectorAll('[data-career-api-field^="presentation_v1."]')).toHaveLength(0);
    expect(screen.queryByTestId("forbidden-en-salary-sidecar")).not.toBeInTheDocument();
    expect(screen.queryByTestId("forbidden-en-ai-sidecar")).not.toBeInTheDocument();
    expect(document.querySelectorAll("section:empty, article:empty, aside:empty")).toHaveLength(0);
  });

  it("gates sidecar requests with the shared production-surface contract instead of a slug allowlist", () => {
    const route = readFileSync("app/(localized)/[locale]/career/jobs/[slug]/page.tsx", "utf8");
    expect(route).toContain("const isProductionTemplate = isCareerProductionDisplaySurface(displaySurface);");
    expect(route).not.toContain("const isProductionTemplate = isZhProductionTemplate || job.slug === CAREER_DISPLAY_ACCOUNTANTS_SLUG;");
  });
});

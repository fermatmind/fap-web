import { existsSync, readFileSync } from "node:fs";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CareerDisplaySurface } from "@/components/career/display/CareerDisplaySurface";
import { CAREER_VISUAL_GROUP_IDS } from "@/lib/career/careerVisualGroups";
import {
  adaptCareerDisplaySurface,
  isCareerProductionDisplaySurface,
} from "@/lib/career/displaySurface";
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
    availability: "published",
    schema_version: "career.quick_answers.v1",
    heading: "Career quick answers",
    items: ["qa3", "qa2", "qa1"].map((key) => ({
      key,
      question: `${titleEn} ${key} question`,
      answer: `${titleEn} ${key} answer comes from the published backend projection.`,
      table: {
        rows: [
          { label: "Dimension", value: `${key} primary value`, alternate_value: null, secondary_value: null },
          { label: "Comparison", value: "Primary", alternate_value: "Alternate", secondary_value: "Secondary" },
        ],
      },
    })),
  };
  content.onet_structured_fields_block = {
    availability: "published",
    schema_version: "career.onet_structured_fields.v1",
    heading: "O*NET structured fields",
    rows: [
      { label: "O*NET-SOC Code", value: "15-0000.00", alternate_value: null, secondary_value: null },
      { label: "Job family", value: "Published occupational family", alternate_value: "Related classification", secondary_value: null },
    ],
  };
  return fixture;
}

describe("career English Current production renderer", () => {
  it("routes the complete 1046-slug bilingual inventory through the shared production renderer", () => {
    const sitemap = readFileSync("tests/contracts/fixtures/seo/public-sitemap-snapshot.xml", "utf8");
    const inventory = new Map<"en" | "zh", Set<string>>([
      ["en", new Set<string>()],
      ["zh", new Set<string>()],
    ]);

    for (const match of sitemap.matchAll(/<loc>https:\/\/fermatmind\.com\/(en|zh)\/career\/jobs\/([^<]+)<\/loc>/g)) {
      inventory.get(match[1] as "en" | "zh")?.add(match[2]);
    }

    expect(inventory.get("en")?.size).toBe(1046);
    expect(inventory.get("zh")?.size).toBe(1046);
    expect(inventory.get("en")).toEqual(inventory.get("zh"));

    for (const slug of inventory.get("en") ?? []) {
      const title = slug.split("-").map((part) => `${part[0]?.toUpperCase() ?? ""}${part.slice(1)}`).join(" ");
      const enSurface = adaptCareerDisplaySurface(buildEnglishCurrentProjection(slug, title), "en", {}, slug, title);
      const zhSurface = adaptCareerDisplaySurface(
        buildSelectedCareerDisplaySurfaceFixture({ slug, locale: "zh", titleEn: title, titleZh: title }),
        "zh",
        {},
        slug,
        title,
      );

      expect(enSurface && isCareerProductionDisplaySurface(enSurface), `en:${slug}`).toBe(true);
      expect(zhSurface && isCareerProductionDisplaySurface(zhSurface), `zh:${slug}`).toBe(true);
    }
  });

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
    expect(surface?.componentOrder).toEqual(projection.component_order);

    render(<CareerDisplaySurface surface={surface} />);
    expect(document.querySelectorAll("[data-career-visual-group]")).toHaveLength(12);
    const visibleComponentCount = surface?.componentOrder.filter((componentId) =>
      !["boundary_notice", "review_validity_card", "final_cta"].includes(componentId)
    ).length ?? 0;
    expect(document.querySelectorAll("[data-career-component-id]")).toHaveLength(visibleComponentCount);
    expect(document.querySelectorAll("[data-career-api-component]")).toHaveLength(visibleComponentCount);
    expect([...document.querySelectorAll("[data-career-quick-answer-key]")].map((item) =>
      item.getAttribute("data-career-quick-answer-key")
    )).toEqual(["qa3", "qa2", "qa1"]);
    expect(screen.getByRole("heading", { name: "Career quick answers" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "O*NET structured fields" })).toBeInTheDocument();
    expect(document.querySelector('#career-component-career_quick_answers_block [data-career-table-wrap]')).toHaveClass("overflow-x-auto");
    expect(document.querySelector('#career-component-onet_structured_fields_block [data-career-table-wrap]')).toHaveClass("overflow-x-auto");
    const structuredComponentText = [
      document.querySelector("#career-component-career_quick_answers_block")?.textContent ?? "",
      document.querySelector("#career-component-onet_structured_fields_block")?.textContent ?? "",
    ].join(" ");
    expect(structuredComponentText).not.toMatch(/[\u3400-\u9fff]/u);
    expect(structuredComponentText).not.toMatch(/source locale unavailable|等待后端|fallback/i);
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
    const projection = buildEnglishCurrentProjection(slug, titleEn);
    const surface = adaptCareerDisplaySurface(projection, "en", {}, slug, titleEn);

    expect(surface?.publishedComponents).not.toBeNull();
    expect(surface?.presentationV1).toBeNull();
    expect(surface?.componentOrder).toEqual(projection.component_order);

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
    const visibleComponentCount = surface?.componentOrder.filter((componentId) =>
      !["boundary_notice", "review_validity_card", "final_cta"].includes(componentId)
    ).length ?? 0;
    expect(document.querySelectorAll("[data-career-component-id]")).toHaveLength(visibleComponentCount);
    expect(document.querySelectorAll("[data-career-api-component]")).toHaveLength(visibleComponentCount);
    const hiddenPrimaryCta = document.querySelector('#career-component-primary_cta[data-career-component-id="primary_cta"]');
    expect(hiddenPrimaryCta).toHaveClass("hidden");
    expect(hiddenPrimaryCta?.querySelector('[data-career-api-component="primary_cta"]')).toHaveAttribute(
      "data-api-label",
      "Measure my career interests",
    );
    expect(hiddenPrimaryCta?.querySelector('[data-career-api-component="primary_cta"]')).toHaveAttribute(
      "data-api-href",
      "/en/tests/holland-career-interest-test-riasec",
    );
    expect([...document.querySelectorAll("[data-career-quick-answer-key]")].map((item) =>
      item.getAttribute("data-career-quick-answer-key")
    )).toEqual(["qa3", "qa2", "qa1"]);
    expect(screen.getByRole("heading", { name: "Career quick answers" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "O*NET structured fields" })).toBeInTheDocument();
    expect(document.querySelector('#career-component-career_quick_answers_block [data-career-table-wrap]')).toHaveClass("overflow-x-auto");
    expect(document.querySelector('#career-component-onet_structured_fields_block [data-career-table-wrap]')).toHaveClass("overflow-x-auto");
    const structuredComponentText = [
      document.querySelector("#career-component-career_quick_answers_block")?.textContent ?? "",
      document.querySelector("#career-component-onet_structured_fields_block")?.textContent ?? "",
    ].join(" ");
    expect(structuredComponentText).not.toMatch(/[\u3400-\u9fff]/u);
    expect(structuredComponentText).not.toMatch(/source locale unavailable|等待后端|fallback/i);
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

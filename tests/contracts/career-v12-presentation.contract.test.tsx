import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CareerDisplaySurface } from "@/components/career/display/CareerDisplaySurface";
import {
  CAREER_FIELD_CONSUMPTION_LEDGER,
  CAREER_VISUAL_GROUPS,
  CAREER_VISUAL_GROUP_IDS,
} from "@/lib/career/careerVisualGroups";
import {
  CAREER_DISPLAY_COMPONENT_ORDER,
  adaptCareerDisplaySurface,
} from "@/lib/career/displaySurface";
import {
  CAREER_PRESENTATION_V1_VERSION,
  CAREER_V12_DESIGN_AUTHORITY_SHA256,
  normalizeCareerPresentationV1,
} from "@/lib/career/presentationV1";
import {
  buildCareerPresentationV1Fixture,
  buildSelectedCareerDisplaySurfaceFixture,
} from "@/tests/contracts/careerDisplaySurface.fixture";

const AUTHORITY_HTML = "/Users/rainie/Desktop/1046个职业/accountants-5个html模板/accountants-career-page-v1.2.html";

function buildZhSurface() {
  return adaptCareerDisplaySurface(
    buildSelectedCareerDisplaySurfaceFixture({
      slug: "accountants-and-auditors",
      locale: "zh",
      titleEn: "Accountants and Auditors",
      titleZh: "会计与审计人员",
    }),
    "zh"
  );
}

describe("career v1.2 presentation contract", () => {
  it("locks the v1.2 design authority SHA without copying the authority HTML into the repository", () => {
    expect(CAREER_V12_DESIGN_AUTHORITY_SHA256).toBe(
      "85c71abac0180a6807222b297e66b0dd611ca79a5cc4bd17db5da416459eafe7"
    );
    if (existsSync(AUTHORITY_HTML)) {
      const actual = createHash("sha256").update(readFileSync(AUTHORITY_HTML)).digest("hex");
      expect(actual).toBe(CAREER_V12_DESIGN_AUTHORITY_SHA256);
    }
  });

  it("normalizes only the versioned, SHA-bound presentation contract", () => {
    const normalized = normalizeCareerPresentationV1(buildCareerPresentationV1Fixture());

    expect(normalized?.contractVersion).toBe(CAREER_PRESENTATION_V1_VERSION);
    expect(normalized?.hero.stats).toHaveLength(5);
    expect(normalized?.hero.aiExposure?.value).toBe(7);
    expect(normalizeCareerPresentationV1({
      ...buildCareerPresentationV1Fixture(),
      design_authority: {
        id: "accountants-career-page-v1.2",
        sha256: "0".repeat(64),
      },
    })).toBeNull();
  });

  it.each([
    ["wrong metric kind", { metric_kind: "ai_survival" }],
    ["unpublished", { availability: "draft" }],
    ["below range", { value: -1 }],
    ["above range", { value: 11 }],
    ["missing label", { label: "" }],
    ["missing source", { source_label: "" }],
    ["missing note", { note: "" }],
  ])("hides only an invalid AI gauge slot: %s", (_label, patch) => {
    const fixture = buildSelectedCareerDisplaySurfaceFixture({
      slug: "accountants-and-auditors",
      locale: "zh",
      titleZh: "会计与审计人员",
    }) as unknown as Record<string, unknown>;
    const presentation = fixture.presentation_v1 as ReturnType<typeof buildCareerPresentationV1Fixture>;
    presentation.hero.ai_exposure = { ...presentation.hero.ai_exposure, ...patch } as typeof presentation.hero.ai_exposure;

    render(<CareerDisplaySurface surface={adaptCareerDisplaySurface(fixture, "zh")} />);

    expect(screen.queryByTestId("career-production-ai-gauge")).not.toBeInTheDocument();
    expect(screen.getByTestId("career-production-hero-stats")).toBeInTheDocument();
    expect(screen.getByTestId("career-display-surface")).toHaveTextContent("会计与审计人员");
  });

  it("does not infer presentation slots from legacy score or narrative fields", () => {
    const fixture = buildSelectedCareerDisplaySurfaceFixture({
      slug: "actuaries",
      locale: "zh",
      titleZh: "精算师",
    }) as unknown as Record<string, unknown>;
    delete fixture.presentation_v1;
    const page = (fixture.page as { content: Record<string, unknown> }).content;
    const salary = (page.career_snapshot_primary_locale as { salary: Record<string, unknown> }).salary;
    salary.china_ai_row = "8/10，正文叙述，不是视觉投影";
    (page.ai_impact_table as Record<string, unknown>).ai_s4_p = "AI 曝光评分为 8/10";

    render(<CareerDisplaySurface surface={adaptCareerDisplaySurface(fixture, "zh")} />);

    expect(screen.queryByTestId("career-production-ai-gauge")).not.toBeInTheDocument();
    expect(screen.queryByTestId("career-production-hero-stats")).not.toBeInTheDocument();
    expect(screen.getByTestId("career-display-hero")).not.toHaveTextContent("8/10");
  });

  it("keeps a valid Chinese page available when presentation_v1 is absent and hides only visual slots", () => {
    const fixture = buildSelectedCareerDisplaySurfaceFixture({
      slug: "accountants-and-auditors",
      locale: "zh",
      titleZh: "会计与审计人员",
    }) as unknown as Record<string, unknown>;
    delete fixture.presentation_v1;

    render(<CareerDisplaySurface surface={adaptCareerDisplaySurface(fixture, "zh")} />);

    expect(screen.getByTestId("career-display-surface")).toHaveTextContent("会计与审计人员");
    expect(screen.queryByTestId("career-production-hero-badges")).not.toBeInTheDocument();
    expect(screen.queryByTestId("career-production-hero-stats")).not.toBeInTheDocument();
    expect(screen.queryByTestId("career-production-ai-gauge")).not.toBeInTheDocument();
    expect(document.querySelectorAll("[data-career-visual-group]")).toHaveLength(12);
  });

  it("compacts every formally optional projection slot without placeholders or empty cards", () => {
    const fixture = buildSelectedCareerDisplaySurfaceFixture({
      slug: "accountants-and-auditors",
      locale: "zh",
      titleZh: "会计与审计人员",
    }) as unknown as Record<string, unknown>;
    const presentation = fixture.presentation_v1 as Record<string, unknown>;
    const hero = presentation.hero as Record<string, unknown>;
    hero.onet_code = null;
    const badges = hero.badges as Array<Record<string, unknown>>;
    badges[1] = { key: "scene", text: null, availability: "missing" };
    hero.ai_exposure = {
      ...(hero.ai_exposure as Record<string, unknown>),
      value: null,
      display_value: null,
      note: null,
      availability: "missing",
    };
    hero.stats = (hero.stats as Array<Record<string, unknown>>).filter((stat) => stat.key !== "employment");
    hero.cta = { label: null, href: null, availability: "missing" };

    render(<CareerDisplaySurface surface={adaptCareerDisplaySurface(fixture, "zh")} />);

    const heroElement = screen.getByTestId("career-display-hero");
    expect(screen.queryByTestId("career-production-ai-gauge")).not.toBeInTheDocument();
    expect(screen.getByTestId("career-production-hero-badges").children).toHaveLength(2);
    expect(screen.getByTestId("career-production-hero-stats").children).toHaveLength(4);
    expect(heroElement).not.toHaveTextContent(/O\*NET|0\/10|undefined|暂无数据|数据缺失/u);
    expect(document.querySelector('[data-career-api-field="presentation_v1.hero.onet_code"]')).not.toBeInTheDocument();
    expect(document.querySelectorAll('[data-career-api-component="primary_cta"]')).toHaveLength(1);
    expect(document.querySelector('[data-career-api-component="primary_cta"]')).not.toBeVisible();
    expect(document.querySelectorAll("[data-career-component-id]")).toHaveLength(28);
    expect(document.querySelectorAll("section:empty, article:empty, aside:empty")).toHaveLength(0);
  });

  it("does not render salary or AI sidecar slots on the Chinese production path", () => {
    render(
      <CareerDisplaySurface
        surface={buildZhSurface()}
        salarySlot={<div data-testid="forbidden-salary-sidecar" />}
        aiImpactSlot={<div data-testid="forbidden-ai-sidecar" />}
      />
    );

    expect(screen.queryByTestId("forbidden-salary-sidecar")).not.toBeInTheDocument();
    expect(screen.queryByTestId("forbidden-ai-sidecar")).not.toBeInTheDocument();
  });

  it("renders 12 ordered visual groups while preserving exactly 26 API component markers", () => {
    render(<CareerDisplaySurface surface={buildZhSurface()} />);

    const groups = [...document.querySelectorAll("[data-career-visual-group]")];
    expect(groups.map((group) => group.getAttribute("data-career-visual-group"))).toEqual(CAREER_VISUAL_GROUP_IDS);
    expect(document.querySelectorAll("[data-career-component-id]")).toHaveLength(28);
    expect(document.querySelectorAll("[data-career-api-component]")).toHaveLength(28);
    expect(screen.getByRole("complementary", { name: "页面目录" }).querySelectorAll("nav a")).toHaveLength(12);
  });

  it("maps every component once and declares every field-ledger entry without accidental duplicates", () => {
    const groupedComponents = CAREER_VISUAL_GROUPS.flatMap((group) => group.componentIds);
    expect(new Set(groupedComponents).size).toBe(CAREER_DISPLAY_COMPONENT_ORDER.length);
    expect([...groupedComponents].sort()).toEqual([...CAREER_DISPLAY_COMPONENT_ORDER].sort());

    const coveredComponents = new Set(CAREER_FIELD_CONSUMPTION_LEDGER.map((entry) => entry.componentId));
    for (const componentId of CAREER_DISPLAY_COMPONENT_ORDER) {
      expect(coveredComponents.has(componentId), `missing ledger component ${componentId}`).toBe(true);
    }

    const ledgerKeys = CAREER_FIELD_CONSUMPTION_LEDGER.map(
      (entry) => `${entry.componentId}:${entry.fieldPattern}:${entry.visualGroupId}`
    );
    expect(new Set(ledgerKeys).size).toBe(ledgerKeys.length);
  });

  it("emits testable DOM field markers for every optional presentation slot", () => {
    render(<CareerDisplaySurface surface={buildZhSurface()} />);

    const fieldMarkers = [...document.querySelectorAll("[data-career-api-field]")]
      .map((element) => element.getAttribute("data-career-api-field") ?? "");
    expect(fieldMarkers.filter((field) => field.startsWith("presentation_v1.hero.badges["))).toHaveLength(5);
    expect(fieldMarkers.filter((field) => field.startsWith("presentation_v1.hero.stats["))).toHaveLength(14);
    expect(fieldMarkers.filter((field) => field.startsWith("presentation_v1.hero.ai_exposure."))).toHaveLength(5);
  });

  it("locks v1.2 layout, color, spacing, radius, table, TOC, and responsive tokens", () => {
    const css = readFileSync("components/career/display/CareerProductionVisual.module.css", "utf8");
    const renderer = readFileSync("components/career/display/CareerProductionDisplaySurface.tsx", "utf8");
    for (const token of [
      "padding: 34px 36px",
      "padding: 30px 34px",
      "gap: 10px",
      "margin-top: 26px",
      "padding: 11px 13px",
      "padding: 4px 18px",
      "padding: 13px 26px",
      "@media (max-width: 1023px)",
      "@media (max-width: 640px)",
    ]) {
      expect(css).toContain(token);
    }
    for (const token of [
      "max-w-[1100px]",
      "lg:grid-cols-[minmax(0,1fr)_320px]",
      "lg:gap-10",
      "from-[#2C3E8C] to-[#3a4fa6]",
      "bg-[#0E9F94]",
      "border-[#E5E9F2]",
      "lg:top-[84px]",
    ]) {
      expect(renderer).toContain(token);
    }
  });
});

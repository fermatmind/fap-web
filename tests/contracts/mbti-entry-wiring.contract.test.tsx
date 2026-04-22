import fs from "node:fs";
import path from "node:path";
import type { ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CTASticky } from "@/components/business/CTASticky";
import { TestCard } from "@/components/business/TestCard";
import { HighlightedTestsSection } from "@/components/marketing/HighlightedTestsSection";

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children?: ReactNode;
  }) => <a href={href} {...props}>{children}</a>,
}));

vi.mock("@/components/assessment-cards/DataGlyph", () => ({
  DataGlyph: () => <div data-testid="mock-data-glyph" />,
}));

function expectHref(name: string, href: string) {
  expect(screen.getByRole("link", { name })).toHaveAttribute("href", href);
}

function read(relPath: string): string {
  return fs.readFileSync(path.join(process.cwd(), relPath), "utf8");
}

describe("mbti entry wiring contract", () => {
  it("renders dual mbti CTAs in the tests grid card", () => {
    render(
      <TestCard
        slug="mbti-personality-test-16-personality-types"
        title="MBTI 性格测试"
        description="desc"
        coverImage=""
        questions={144}
        timeMinutes={15}
        scaleCode="MBTI"
        locale="zh"
      />
    );

    expectHref(
      "开始深度版",
      "/zh/tests/mbti-personality-test-16-personality-types/take?form=mbti_144"
    );
    expectHref(
      "开始快速版",
      "/zh/tests/mbti-personality-test-16-personality-types/take?form=mbti_93"
    );
  });

  it("renders dual mbti CTAs in the home highlighted card", () => {
    render(
      <HighlightedTestsSection
        locale="zh"
        cards={[
          {
            kind: "live",
            slug: "mbti-personality-test-16-personality-types",
            title: "MBTI 性格测试",
            description: "desc",
            category: "人格与领导决策",
            tags: ["主导风格", "沟通模式", "协作角色"],
            questionsCount: 144,
            timeMinutes: 15,
            footnote: "144 items / 15 min / role-fit",
          },
        ]}
      />
    );

    expectHref(
      "开始深度版",
      "/zh/tests/mbti-personality-test-16-personality-types/take?form=mbti_144"
    );
    expectHref(
      "开始快速版",
      "/zh/tests/mbti-personality-test-16-personality-types/take?form=mbti_93"
    );
  });

  it("uses the 93-question denominator when resuming a cached mbti_93 draft on the home card", () => {
    window.localStorage.setItem(
      "fm_quiz_v4_mbti-personality-test-16-personality-types_anon-home_mbti_93",
      JSON.stringify({
        version: 4,
        state: {
          version: 4,
          state: {
            slug: "mbti-personality-test-16-personality-types",
            anonId: "anon-home",
            formCode: "mbti_93",
            currentIndex: 9,
            answers: {
              q1: "A",
              q2: "A",
              q3: "A",
              q4: "A",
              q5: "A",
              q6: "A",
              q7: "A",
              q8: "A",
              q9: "A",
            },
          },
        },
      })
    );

    render(
      <HighlightedTestsSection
        locale="zh"
        cards={[
          {
            kind: "live",
            slug: "mbti-personality-test-16-personality-types",
            title: "MBTI 性格测试",
            description: "desc",
            category: "人格与领导决策",
            tags: ["主导风格", "沟通模式", "协作角色"],
            questionsCount: 144,
            timeMinutes: 15,
            footnote: "144 items / 15 min / role-fit",
          },
        ]}
      />
    );

    expect(screen.getByText("继续上次 10%")).toBeInTheDocument();
  });

  it("renders dual mbti CTAs in the landing sticky CTA surface", () => {
    render(
      <CTASticky
        slug="mbti-personality-test-16-personality-types"
        title="MBTI 性格测试"
        questions={144}
        minutes={15}
        scaleCode="MBTI"
        locale="zh"
      />
    );

    const links144 = screen.getAllByRole("link", { name: /开始深度版/ });
    const links93 = screen.getAllByRole("link", { name: /开始快速版/ });

    expect(
      links144.some((link) => {
        const href = link.getAttribute("href") ?? "";
        return href.startsWith("/zh/tests/mbti-personality-test-16-personality-types/take?")
          && href.includes("form=mbti_144")
          && href.includes("entry_surface=mbti_test_landing");
      })
    ).toBe(true);
    expect(
      links93.some((link) => {
        const href = link.getAttribute("href") ?? "";
        return href.startsWith("/zh/tests/mbti-personality-test-16-personality-types/take?")
          && href.includes("form=mbti_93")
          && href.includes("entry_surface=mbti_test_landing");
      })
    ).toBe(true);
  });

  it("wires the highlighted home section directly to MBTI form-aware take routes", () => {
    const source = read("components/marketing/HighlightedTestsSection.tsx");

    expect(source).toContain('buildMbtiTakeHref(card.slug, locale, form.formCode)');
    expect(source).toContain('getMbtiStartLabel(form.formCode, locale)');
  });

  it("renders dual big5 CTAs in landing sticky CTA surface", () => {
    render(
      <CTASticky
        slug="big-five-personality-test-ocean-model"
        title="大五人格测试"
        questions={120}
        minutes={20}
        scaleCode="BIG5_OCEAN"
        locale="zh"
      />
    );

    const links120 = screen.getAllByRole("link", { name: /开始深度版/ });
    const links90 = screen.getAllByRole("link", { name: /开始快速版/ });

    expect(links120.some((link) => link.getAttribute("href") === "/zh/tests/big-five-personality-test-ocean-model/take?form=big5_120")).toBe(true);
    expect(links90.some((link) => link.getAttribute("href") === "/zh/tests/big-five-personality-test-ocean-model/take?form=big5_90")).toBe(true);
  });

  it("renders dual riasec CTAs in landing sticky CTA surface", () => {
    render(
      <CTASticky
        slug="holland-career-interest-test-riasec"
        title="霍兰德职业兴趣测试"
        questions={60}
        minutes={8}
        scaleCode="RIASEC"
        locale="zh"
      />
    );

    const links60 = screen.getAllByRole("link", { name: /开始标准版/ });
    const links140 = screen.getAllByRole("link", { name: /开始增强版/ });

    expect(links60.some((link) => link.getAttribute("href") === "/zh/tests/holland-career-interest-test-riasec/take?form=riasec_60")).toBe(true);
    expect(links140.some((link) => link.getAttribute("href") === "/zh/tests/holland-career-interest-test-riasec/take?form=riasec_140")).toBe(true);
  });

  it("keeps homepage free of direct big5 version-entry wiring", () => {
    const source = read("components/marketing/HomePageExperience.tsx");

    expect(source).not.toContain("buildBig5TakeHref");
    expect(source).not.toContain("getBig5VariantLabel");
    expect(source).not.toContain("listBig5FormMetas");
  });
});

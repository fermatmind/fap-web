import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { normalizeIqQuestionsForTake } from "@/lib/iq/take";
import type { IqQuestion } from "@/lib/iq/contracts";
import { iqResultCopy } from "@/lib/iq/resultCopy";
import { IqResultShell } from "@/components/result/iq/IqResultShell";
import type { ReportResponse } from "@/lib/api/v0_3";

const han = /\p{Script=Han}/u;
afterEach(cleanup);

describe("IQ locale completeness", () => {
  it("selects the requested prompt, option text and image description when both languages exist", () => {
    const items = [{ question_id: "Q1", prompt: "Generic fallback", stem: { prompt_zh: "选择缺失图形", prompt_en: "Choose the missing shape.",
      image: { src: "/iq/q1.webp", alt_zh: "第一题图", alt_en: "Question one diagram" } },
      options: [{ code: "A", text_zh: "选项一", text_en: "First option", image: { src: "/iq/a.webp", alt_zh: "选项图", alt_en: "Option diagram" } }],
    }] as unknown as IqQuestion[];
    const en = normalizeIqQuestionsForTake({ items, locale: "en" })[0];
    const zh = normalizeIqQuestionsForTake({ items, locale: "zh" })[0];
    expect(en.title).toBe("Choose the missing shape.");
    expect(en.options[0].text).toBe("First option");
    expect(en.stem?.image?.alt).toBe("Question one diagram");
    expect(en.options[0].image?.alt).toBe("Option diagram");
    expect(JSON.stringify(en)).not.toMatch(han);
    expect(zh.title).toBe("选择缺失图形");
    expect(zh.options[0].text).toBe("选项一");
    expect(en.id).toBe(zh.id);
  });

  it("makes missing English explicit without translating, stripping or hiding Chinese source text", () => {
    const items = [{ question_id: "Q1", title: "选择缺失图形", stem: { image: { src: "/iq/q1.webp", accessibility_label: "中文题图" } },
      options: [{ code: "A", text: "中文选项" }] }] as unknown as IqQuestion[];
    const [en] = normalizeIqQuestionsForTake({ items, locale: "en" });
    expect(en.title).toContain("English instructions unavailable");
    expect(en.options[0].text).toContain("English option text unavailable");
    expect(en.stem?.image?.alt).toBe("English image description unavailable.");
    expect(JSON.stringify(en)).not.toMatch(han);
    expect(normalizeIqQuestionsForTake({ items, locale: "zh" })[0].title).toBe("选择缺失图形");
    expect(items[0].title).toBe("选择缺失图形");
  });

  it.each([73, 79, 80, 99, 100, 115, 116, 145, null])("renders complete English result copy at score %s", (score) => {
    const copy = iqResultCopy(score, "en");
    expect(copy.title).not.toMatch(han);
    expect(copy.description).not.toMatch(han);
    expect(copy.description.length).toBeGreaterThan(40);
    const report = { ok: true, schema_version: "iq.report.v1", scale_code: "IQ_INTELLIGENCE_QUOTIENT",
      summary: { raw_score: 7, question_count: 30, beta_reference: score === null ? null : {
        status: "available", source_kind: "designed_reference", model_version: "owner30_design_anchors_2026_10_14_v1",
        standard_score: score, display_score: score, percentile: 60.51, production_normed: false, population_percentile_eligible: false,
      } }, dimensions: { visual_spatial_insight: { item_count: 13, correct_count: 3 },
        visual_spatial_pattern_reasoning: { item_count: 14, correct_count: 3 }, numerical_pattern_reasoning: { item_count: 3, correct_count: 1 } },
    } as unknown as ReportResponse;
    const { container } = render(<IqResultShell locale="en" reportData={report} resultData={null} accessView={null} />);
    expect(container.textContent).not.toMatch(han);
    for (const element of container.querySelectorAll("[aria-label], [alt], [title]")) {
      expect([element.getAttribute("aria-label"), element.getAttribute("alt"), element.getAttribute("title")].join(" ")).not.toMatch(han);
    }
  });
});

import { describe, expect, it } from "vitest";
import { assessmentDisplayLocale, assessmentDisplayPath, projectTraditionalQuestionDisplay, projectTraditionalResultDisplay } from "@/lib/tests/traditionalAssessmentDisplay";
import { normalizeQuizQuestions } from "@/lib/quiz/normalizeQuestions";
import { NextRequest } from "next/server";
import { proxy } from "@/proxy";
import { traditionalEquivalent, traditionalPath } from "@/lib/i18n/traditionalRoutes";

describe("Traditional assessment display", () => {
  it("converts the field consumed by the Chinese reader while retaining the scoring payload", async () => {
    const source = {
      ok: true,
      locale: "zh-CN",
      region: "CN_MAINLAND",
      pack_id: "original_pack",
      form_code: "riasec_60",
      manifest_hash: "original_hash",
      questions: { items: [{
        question_id: "Q01",
        text: "这是一条备用题目",
        text_zh: "我愿意安装软件和修理设备",
        text_en: "I am willing to install software and repair equipment",
        direction: -1,
        order: 1,
        options: [
          { code: "A", text: "备用选项", text_zh: "非常喜欢", score: 2 },
          { code: "B", text: "不喜欢", text_zh: "不喜欢", score: 0 },
        ],
        stem: { prompt_zh: "请选择一个答案", image: { src: "/iq/test.svg", alt: "示例图片" } },
      }] },
      meta: { option_anchors: [{ code: "A", label: "非常喜欢" }], disclaimer_hash: "unchanged" },
    };
    const original = structuredClone(source);
    const displayed = await projectTraditionalQuestionDisplay(source, "zh-TW");
    expect(source).toEqual(original);
    expect(displayed).toMatchObject({ locale: "zh-CN", region: "CN_MAINLAND", pack_id: "original_pack", form_code: "riasec_60", manifest_hash: "original_hash" });
    expect(displayed.questions.items[0]).toMatchObject({
      question_id: "Q01",
      direction: -1,
      order: 1,
      text_zh: "我願意安裝軟體和修理裝置",
      text_en: source.questions.items[0].text_en,
      options: [{ code: "A", text_zh: "非常喜歡", score: 2 }, { code: "B", text_zh: "不喜歡", score: 0 }],
      stem: { image: { src: "/iq/test.svg", alt: "示例圖片" } },
    });
    const [quiz] = normalizeQuizQuestions({ items: displayed.questions.items, locale: "zh" });
    expect(quiz.title).toBe("我願意安裝軟體和修理裝置");
    expect(quiz.options[0]).toMatchObject({ id: "A", text: "非常喜歡" });
    expect(displayed.meta).toEqual({ option_anchors: [{ code: "A", label: "非常喜歡" }], disclaimer_hash: "unchanged" });
    expect(await projectTraditionalQuestionDisplay(source, "zh")).toBe(source);
    expect(await projectTraditionalQuestionDisplay(source, "en")).toBe(source);
  });

  it("keeps existing route behavior and uses the exact Traditional prefix for the Traditional reader", () => {
    expect(assessmentDisplayLocale("/zh-TW/tests/mbti/take")).toBe("zh-TW");
    expect(assessmentDisplayLocale("/en/tests/mbti/take")).toBe("en");
    expect(assessmentDisplayPath("/result/a?keep=1", "zh-TW", "zh")).toBe("/zh-TW/result/a?keep=1");
    expect(assessmentDisplayPath("/result/a", "zh", "zh")).toBe("/zh/result/a");
  });
  it("localizes authorized narrative while preserving scores, eligibility, price and source authority", async () => {
    const input = {
      type_code: "INTJ",
      locked: true,
      modules_allowed: ["preview"],
      currency: "CNY",
      price: 999,
      report: {
        locale: "zh-CN",
        summary: "用软件整理结果。",
        dimensions: [{ code: "E", label: "外向倾向", score: 61 }],
        sections: [{ id: "preview", title: "阅读结果", bullets: ["选择两项活动。"] }],
        source: { label: "原文的来源名称" },
      },
      mbti_preview_v1: { mode: "module_preview", sections: [{ visible_preview_cards: [{ id: "card", title: "认识自己", access_level: "preview" }] }] },
      meta: { locale: "zh-CN", source_hash: "original", market: "CN_MAINLAND" },
      offer: { sku: "original", currency: "CNY", price_cents: 999 },
    };
    const out = await projectTraditionalResultDisplay(input, "zh-TW");
    expect(out).toMatchObject({
      type_code: "INTJ", locked: true, modules_allowed: ["preview"], currency: "CNY", price: 999,
      meta: input.meta, offer: input.offer,
      report: {
        locale: "zh-CN", summary: "用軟體整理結果。",
        dimensions: [{ code: "E", label: "外向傾向", score: 61 }],
        sections: [{ id: "preview", title: "閱讀結果", bullets: ["選擇兩項活動。"] }],
        source: input.report.source,
      },
      mbti_preview_v1: { mode: "module_preview", sections: [{ visible_preview_cards: [{ id: "card", title: "認識自己", access_level: "preview" }] }] },
    });
    expect(await projectTraditionalResultDisplay(input, "zh")).toBe(input);
  });

  it("keeps Traditional result routes private and limits take routes to the core cohort", async () => {
    const path = "/zh-TW/result/00000000-0000-4000-8000-000000000001";
    const response = await proxy(new NextRequest(`https://example.com${path}`));
    expect(response.status).toBe(200);
    expect(response.headers.get("x-robots-tag")).toContain("noindex");
    expect(response.headers.get("cache-control")).toContain("no-store");
    expect(response.headers.get("referrer-policy")).toBe("no-referrer");
    expect(response.headers.get("x-middleware-request-x-fm-private-analytics-suppressed")).toBe("true");
    expect(response.headers.get("x-middleware-request-x-anon-id")).toBeTruthy();
    expect(traditionalEquivalent(path)).toBeNull();
    expect(traditionalPath("/zh-TW/tests/holland-career-interest-test-riasec/take")).toBe("/zh-TW/tests/holland-career-interest-test-riasec/take");
    expect(traditionalPath("/zh-TW/tests/non-core/take")).toBeNull();
  });

});

import TraditionalPricingPage, { metadata } from "@/app/(traditional)/zh-TW/pricing/page";
import { traditionalEquivalent } from "@/lib/i18n/traditionalRoutes";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { MbtiPricingDetails, MbtiPricingNotice } from "@/components/commerce/MbtiPricing";

describe("public planned MBTI pricing", () => {
  for (const locale of ["zh", "en"] as const) {
    it(`${locale}: anonymous readers can see prices, one-time scope and policy links without a payment action`, () => {
      const html = renderToStaticMarkup(<MbtiPricingDetails locale={locale} />);
      const document = new DOMParser().parseFromString(html, "text/html");
      expect(document.body.textContent).toContain("9.99");
      expect(document.body.textContent).toContain("1.99");
      expect(document.body.textContent).toContain(locale === "zh" ? "尚未开售" : "Not on sale yet");
      expect(document.body.textContent).toContain(locale === "zh" ? "不自动续费" : "No automatic renewal");
      expect(document.body.textContent).toContain(locale === "zh" ? "基础结果继续免费" : "Basic results remain free");
      expect(document.body.textContent).toContain(locale === "zh" ? "台湾" : "Taiwan");
      for (const path of ["help/payment-refund", "terms", "support", "tests/mbti-personality-test-16-personality-types"]) {
        expect(document.querySelector(`a[href="/${locale}/${path}"]`)).not.toBeNull();
      }
      expect(document.querySelector("form, button, [href*='checkout'], [href*='/orders/']")).toBeNull();
    });

    it(`${locale}: assessment and private readers use a public pricing URL without private query data`, () => {
      const html = renderToStaticMarkup(<MbtiPricingNotice locale={locale} />);
      const document = new DOMParser().parseFromString(html, "text/html");
      expect(document.querySelector("a")?.getAttribute("href")).toBe(`/${locale}/pricing`);
      expect(document.body.textContent).toContain("9.99");
      expect(document.body.textContent).toContain("1.99");
      expect(document.querySelector("form, button")).toBeNull();
    });
  }
});

it("renders Taiwan pricing disclosures without changing prices or creating a purchase action", () => {
  const html = renderToStaticMarkup(<TraditionalPricingPage />);
  for (const copy of ["¥9.99", "US$1.99", "尚未開賣", "不會自動續訂", "Waffo Pancake", "支付寶付款管道", "過往已購買的權益", "目前尚未開放購買或實際扣款"]) {
    expect(html).toContain(copy);
  }
  expect(html).toContain('href="/zh-TW/terms"');
  expect(html).toContain('href="/zh-TW/tests/mbti-personality-test-16-personality-types"');
  expect(html).toContain('href="/zh/help/payment-refund"');
  expect(html).toContain("（簡體中文）");
  expect(html).not.toMatch(/href="[^"]*(?:checkout|pay\/|purchase)/i);
  expect(metadata).toMatchObject({ robots: { index: false }, alternates: { canonical: "/zh-TW/pricing" } });
  expect(traditionalEquivalent("/zh-TW/pricing")).toBeNull();
});

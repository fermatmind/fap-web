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

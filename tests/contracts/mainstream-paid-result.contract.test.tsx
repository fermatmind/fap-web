import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MainstreamPaidResult } from "@/components/commerce/MainstreamPaidResult";
import type { RiasecPurchase } from "@/lib/api/v0_3";
vi.mock("@/app/(localized)/[locale]/career/assessment/Career94Purchase", () => ({ Career94Checkout: ({ displayLocale }: {displayLocale: string}) => <p>Checkout {displayLocale}</p> }));
vi.mock("@/components/commerce/CareerRefundPanel", () => ({ CareerRefundPanel: ({ onRefunded }: {onRefunded: () => void}) => <button onClick={onRefunded}>Refund synchronized</button> }));
beforeEach(() => { vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null); });
const purchase: RiasecPurchase = { attempt_id: "owned-attempt", unlocked: false, order_no: null, payment_state: null, offers: [{ provider: "alipay", sku: "MBTI_WEB_REPORT_CNY_299", currency: "CNY", amount_cents: 299 }] };
describe("mainstream per-attempt full report purchase", () => {
  it.each(["zh", "zh-TW", "en"] as const)("keeps full content out of the unpaid render in %s", locale => {
    render(<MainstreamPaidResult data={{ok:true, meta:{scale_code:"MBTI"}, result:{type_code:"INTJ", scores_pct:{EI:75}}}} purchase={purchase} locale={locale}><p>Private full report</p></MainstreamPaidResult>);
    expect(screen.queryByText("Private full report")).not.toBeInTheDocument();
    expect(screen.getByText("INTJ")).toBeVisible();
    expect(screen.getByText(`Checkout ${locale}`)).toBeVisible();
  });
  it("retains the native report and stops displaying it when a refund completes", () => {
    render(<MainstreamPaidResult data={{ok:true, meta:{scale_code:"MBTI"}}} purchase={{...purchase, unlocked:true, order_no:"owned-order",payment_state:"paid"}} locale="en"><p>Private full report</p></MainstreamPaidResult>);
    expect(screen.getByText("Private full report")).toBeVisible();
    fireEvent.click(screen.getByText("Refund synchronized"));
    expect(screen.queryByText("Private full report")).not.toBeInTheDocument();
    expect(screen.getByText(/This order was refunded/)).toBeVisible();
    expect(screen.queryByText("Checkout en")).not.toBeInTheDocument();
  });
  it("uses one fixed sample for all MBTI results and prevents orders in design preview", () => {
    render(<MainstreamPaidResult data={{ok:true, meta:{scale_code:"MBTI"}, result:{type_code:"INTJ", scores_pct:{EI:75}}}} purchase={purchase} locale="zh-TW" preview />);
    expect(screen.queryByText("Checkout zh-TW")).not.toBeInTheDocument();
    expect(screen.getByRole("link", {name:/查看完整示例報告/})).toHaveAttribute("href", "/zh-TW/reports/samples/mbti");
    expect(screen.getAllByRole("button").every(button => button.hasAttribute("disabled"))).toBe(true);
  });

  it.each(["zh", "zh-TW", "en"] as const)("links EQ design previews to the matching report language in %s", locale => {
    const href = `/${locale}/dev/eq-result?result=aware_but_unregulated`;
    render(<MainstreamPaidResult data={{ok:true, meta:{scale_code:"EQ_60"}}} purchase={purchase} locale={locale} preview previewSampleHref={href} />);
    const name = locale === "en" ? /View the complete sample report/ : locale === "zh-TW" ? /查看完整示例報告/ : /查看完整示例报告/;
    expect(screen.getByRole("link", {name})).toHaveAttribute("href", href);
    expect(screen.getAllByRole("button").every(button => button.hasAttribute("disabled"))).toBe(true);
  });
  it("keeps live report links and checkout independent of the development destination", () => {
    render(<MainstreamPaidResult data={{ok:true, meta:{scale_code:"EQ_60"}}} purchase={purchase} locale="en" previewSampleHref="/en/dev/eq-result" />);
    expect(screen.getByRole("link", {name:/View the complete sample report/})).toHaveAttribute("href", "/en/reports/samples/eq");
    expect(screen.getByText("Checkout en")).toBeVisible();
  });

  it.each(["zh", "zh-TW", "en"] as const)("uses actual EQ overview scores without disabling checkout in %s", locale => {
    const dimensions = Object.fromEntries(["zh-CN", "zh-TW", "en"].map(language => [language, ["SA", "ER", "EM", "RM"].map((code,i) => ({code,name:code,score:111-i*5,band_label:"competent"}))]));
    const data = {ok:true,meta:{scale_code:"EQ_60"},eq60_unlock_v1:{schema:"eq60.unlock.v1",low_confidence:false,dimensions}};
    render(<MainstreamPaidResult data={data} purchase={purchase} locale={locale}/>);
    expect(screen.getByText(`Checkout ${locale}`)).toBeVisible();
    expect(screen.getByRole("heading", {level:1})).toHaveTextContent(locale === "en" ? "Self-awareness" : locale === "zh-TW" ? "自我覺察" : "自我觉察");
    expect(screen.getAllByText(/111/).length).toBeGreaterThan(0);
    expect(document.querySelector('a[href*="/dev/"]')).toBeNull();
    expect(screen.queryByText("Private full report")).not.toBeInTheDocument();
  });

  it.each([
    ["zh", "IQ_RAVEN", 30, 9, "30%", "30 题中答对 9 题"],
    ["zh-TW", "IQ_RAVEN", 30, 9, "30%", "30 題中答對 9 題"],
    ["en", "IQ_RAVEN", 30, 9, "30%", "9 correct out of 30 questions"],
    ["zh", "IQ_INTELLIGENCE_QUOTIENT", 40, 9, "22.5%", "40 题中答对 9 题"],
    ["zh-TW", "IQ_INTELLIGENCE_QUOTIENT", 40, 9, "22.5%", "40 題中答對 9 題"],
    ["en", "IQ_INTELLIGENCE_QUOTIENT", 40, 9, "22.5%", "9 correct out of 40 questions"],
  ] as const)("shows the complete locked IQ result in %s for %s", (locale, scale, total, correct, accuracy, sentence) => {
    const data = { ok: true, meta: { scale_code: scale }, result: { summary: { correct, total, percent_correct: 99, duration_ms: 30000 } } };
    render(<MainstreamPaidResult data={data} purchase={purchase} locale={locale}><p>Private full report</p></MainstreamPaidResult>);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(accuracy);
    expect(screen.getByText(new RegExp(sentence))).toBeVisible();
    expect(screen.getByText(/0[.,]5/)).toBeVisible();
    expect(screen.getByText(`Checkout ${locale}`)).toBeVisible();
    expect(document.querySelector(`a[href="/${locale}/reports/samples/iq${total}"]`)).not.toBeNull();
    expect(screen.queryByText(/JobCannon|Private full report|131 IQ/)).not.toBeInTheDocument();
    expect(screen.queryByTestId("iq-score-marker")).not.toBeInTheDocument();
    expect(document.querySelector("a[href='#mainstream-purchase']")).not.toBeNull();
    const sections = ["reasoning-reading-guide", "reasoning-counts", "reasoning-composition", "reasoning-profile", "reasoning-categories", "reasoning-reading", "career-preview", "insight-preview", "mainstream-purchase", "result-share", "continue-exploring"];
    const inOrder = sections.map(id => document.getElementById(id));
    for (const [index, element] of inOrder.entries()) {
      expect(element).toBeVisible();
      if (index > 0) expect(inOrder[index - 1]?.compareDocumentPosition(element!)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    }
    expect(document.querySelector('[aria-labelledby="reasoning-counts"] [data-current]')).toHaveTextContent(`${correct} / ${total}`);
    expect(document.querySelector('[aria-labelledby="reasoning-composition"]')).toHaveTextContent(accuracy);
    expect(document.querySelectorAll('[aria-labelledby="reasoning-categories"] li').length).toBe(4);
    expect(document.querySelector('#result-share a[href*="owned-attempt"]')).toBeNull();
    expect(document.querySelector('a[href$="/help/payment-refund"]')).toBeVisible();

  });

  it("renders a zero result from a legacy numeric summary without guessing the form from the scale", () => {
    const data = { ok: true, meta: { scale_code: "IQ_INTELLIGENCE_QUOTIENT" }, result: { summary: { raw_score: "0", total: "30" } } };
    render(<MainstreamPaidResult data={data} purchase={purchase} locale="en" />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("0%");
    expect(screen.getByRole("link", { name: /View the complete sample report/ })).toHaveAttribute("href", "/en/reports/samples/iq30");
  });

  it("keeps checkout for a missing or invalid IQ summary", () => {
    const data = { ok: true, meta: { scale_code: "IQ_RAVEN" }, result: { summary: { correct: 31, total: 30 } } };
    render(<MainstreamPaidResult data={data} purchase={purchase} locale="en" />);
    expect(screen.queryByTestId("reasoning-preview-score")).not.toBeInTheDocument();
    expect(document.getElementById("result-share")).toBeNull();
    expect(screen.getByText("Checkout en")).toBeVisible();
  });

  it("renders the full IQ report content when purchased", () => {
    const data = { ok: true, meta: { scale_code: "IQ_RAVEN" }, result: { summary: { correct: 9, total: 30 } } };
    render(<MainstreamPaidResult data={data} purchase={{ ...purchase, unlocked: true }} locale="en"><p>Full IQ report</p></MainstreamPaidResult>);
    expect(screen.getByText("Full IQ report")).toBeVisible();
    expect(screen.queryByTestId("reasoning-preview-score")).not.toBeInTheDocument();
  });

});

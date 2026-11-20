import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MainstreamPaidResult } from "@/components/commerce/MainstreamPaidResult";
import type { RiasecPurchase } from "@/lib/api/v0_3";
vi.mock("@/app/(localized)/[locale]/career/assessment/Career94Purchase", () => ({ Career94Checkout: ({ displayLocale }: {displayLocale: string}) => <p>Checkout {displayLocale}</p> }));
vi.mock("@/components/commerce/CareerRefundPanel", () => ({ CareerRefundPanel: ({ onRefunded }: {onRefunded: () => void}) => <button onClick={onRefunded}>Refund synchronized</button> }));
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
});

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { RiasecPaidResult } from "@/components/result/riasec/RiasecPaidResult";
import type { RiasecPurchase } from "@/lib/api/v0_3";
vi.mock("@/components/career/UnlockReportExperience", () => ({ UnlockReportExperience: ({ purchase, sampleHref }: { purchase: React.ReactNode; sampleHref: string }) => <div><a href={sampleHref}>Sample</a>{purchase}</div> }));
vi.mock("@/components/result/riasec/RiasecReadingReport", () => ({ RiasecReadingReport: () => <p>Authorized full report</p> }));
vi.mock("@/app/(localized)/[locale]/career/assessment/Career94Purchase", () => ({ Career94Checkout: ({ offers, displayLocale }: { offers: unknown[]; displayLocale: string }) => <p>Checkout {displayLocale}: {offers.length}</p> }));
vi.mock("@/components/commerce/CareerRefundPanel", () => ({ CareerRefundPanel: ({ onRefunded }: { onRefunded: () => void }) => <button onClick={onRefunded}>Refund synchronized</button> }));
const purchase: RiasecPurchase = { attempt_id: "sample-id", unlocked: false, order_no: null, payment_state: null, offers: [{ provider: "waffo", sku: "RIASEC60_REPORT_USD_299", currency: "USD", amount_cents: 299 }] };
describe("Holland 60 official paid result", () => {
  it.each(["zh", "zh-TW", "en"] as const)("uses server offers and a fixed independent sample in %s", locale => {
    render(<RiasecPaidResult data={{ok:true}} purchase={purchase} locale={locale} />);
    expect(screen.queryByText("Authorized full report")).not.toBeInTheDocument();
    expect(screen.getByText(`Checkout ${locale}: 1`)).toBeVisible();
    expect(screen.getByRole("link", {name:"Sample"})).toHaveAttribute("href", `/${locale}/tests/holland-career-interest-test-riasec/sample`);
  });
  it("shows the actual report only after server verification and removes it after refund", () => {
    render(<RiasecPaidResult data={{ok:true}} purchase={{...purchase, unlocked:true, order_no:"owned-order", payment_state:"paid"}} locale="en" />);
    expect(screen.getByText("Authorized full report")).toBeVisible();
    fireEvent.click(screen.getByRole("button", {name:"Refund synchronized"}));
    expect(screen.queryByText("Authorized full report")).not.toBeInTheDocument();
    expect(screen.getByText("This order was refunded.")).toBeVisible();
  });
});

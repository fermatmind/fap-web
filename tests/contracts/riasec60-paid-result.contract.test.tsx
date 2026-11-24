import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { RiasecPaidResult } from "@/components/result/riasec/RiasecPaidResult";
import type { RiasecPurchase } from "@/lib/api/v0_3";
vi.mock("@/components/career/UnlockReportExperience", () => ({ UnlockReportExperience: ({ purchase, sampleHref }: { purchase: React.ReactNode; sampleHref: string }) => <div><a href={sampleHref}>Sample</a>{purchase}</div> }));
vi.mock("@/components/result/riasec/RiasecReadingReport", () => ({ RiasecReadingReport: () => <p>Authorized full report</p> }));
vi.mock("@/app/(localized)/[locale]/career/assessment/Career94Purchase", () => ({ Career94Checkout: ({ offers, displayLocale }: { offers: unknown[]; displayLocale: string }) => <p>Checkout {displayLocale}: {offers.length}</p> }));
vi.mock("@/components/commerce/CareerRefundPanel", () => ({ CareerRefundPanel: () => <h2>Refund request</h2> }));
const purchase: RiasecPurchase = { attempt_id: "sample-id", unlocked: false, order_no: null, payment_state: null, offers: [{ provider: "waffo", sku: "RIASEC60_REPORT_USD_299", currency: "USD", amount_cents: 299 }] };
describe("Holland 60 official paid result", () => {
  it.each(["zh", "zh-TW", "en"] as const)("uses server offers and a fixed independent sample in %s", locale => {
    render(<RiasecPaidResult data={{ok:true}} purchase={purchase} locale={locale} />);
    expect(screen.queryByText("Authorized full report")).not.toBeInTheDocument();
    expect(screen.getByText(`Checkout ${locale}: 1`)).toBeVisible();
    expect(screen.getByRole("link", {name:"Sample"})).toHaveAttribute("href", `/${locale}/reports/samples/holland`);
  });
  it("keeps refunds out of the report and follows the server access decision", () => {
    const paid = { ...purchase, unlocked: true, order_no: "owned-order", payment_state: "paid" } satisfies RiasecPurchase;
    const { rerender } = render(<RiasecPaidResult data={{ok:true}} purchase={paid} locale="en" />);
    expect(screen.getByText("Authorized full report")).toBeVisible();
    expect(screen.queryByRole("heading", {name:"Refund request"})).not.toBeInTheDocument();
    rerender(<RiasecPaidResult data={{ok:true}} purchase={{...paid, unlocked:false, payment_state:"refunded"}} locale="en" />);
    expect(screen.queryByText("Authorized full report")).not.toBeInTheDocument();
    expect(screen.getByText("This order was refunded.")).toBeVisible();
  });
});

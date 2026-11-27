import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { RiasecPaidResult } from "@/components/result/riasec/RiasecPaidResult";
import type { RiasecPurchase } from "@/lib/api/v0_3";

const { observe } = vi.hoisted(() => ({ observe: vi.fn() }));
vi.mock("@/hooks/useReportPurchaseObservation", () => ({
  useReportPurchaseObservation: () => observe,
}));
vi.mock("@/app/(localized)/[locale]/career/assessment/Career94Purchase", () => ({
  Career94Checkout: ({ onPaymentClick }: { onPaymentClick: () => void }) =>
    <button type="button" onClick={onPaymentClick}>Checkout fixture</button>,
}));

const purchase: RiasecPurchase = {
  attempt_id: "synthetic",
  unlocked: false,
  order_no: null,
  payment_state: null,
  offers: [{ provider: "waffo", sku: "RIASEC60_REPORT_CNY_299", currency: "CNY", amount_cents: 299 }],
};

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("Simplified Chinese Holland mobile purchase entry", () => {
  it("lands at the full offer, keeps the sample accessible, and preserves both click observations", () => {
    render(<RiasecPaidResult data={{ ok: true }} purchase={purchase} locale="zh" />);
    const link = screen.getByRole("link", { name: "¥2.99 解锁完整报告" });
    expect(link).toHaveAttribute("data-report-purchase-entry");
    expect(link).toHaveAttribute("href", "#unlock-purchase");
    const offer = screen.getByRole("region", { name: "霍兰德职业兴趣深度报告" });
    expect(offer).toHaveAttribute("id", "unlock-purchase");
    expect(within(offer).getAllByRole("listitem")).toHaveLength(4);
    expect(document.querySelector("#unlock-payment-options button")).toBeInTheDocument();

    const entry = link.parentElement!;
    expect(within(entry).getByText("看岗位任务怎么比、下一步可以先试什么")).toBeInTheDocument();
    expect(within(entry).getByRole("link", { name: "查看完整示例报告" })).toHaveAttribute("href", "/zh/reports/samples/holland");
    fireEvent.click(link);
    fireEvent.click(screen.getByRole("button", { name: "Checkout fixture" }));
    expect(observe.mock.calls).toEqual([["entry_clicked"], ["payment_clicked"]]);
  });

  it.each(["en", "zh-TW"] as const)("preserves the existing entry destination in %s", (locale) => {
    render(<RiasecPaidResult data={{ ok: true }} purchase={purchase} locale={locale} />);
    expect(document.querySelector("[data-report-purchase-entry]")).toHaveAttribute("href", "#unlock-payment-options");
    expect(screen.queryByText("看岗位任务怎么比、下一步可以先试什么")).toBeNull();
  });

  it("keeps the mobile purchase entry absent when there is an existing pending order", () => {
    render(<RiasecPaidResult data={{ ok: true }} purchase={{ ...purchase, order_no: "synthetic-order", payment_state: "pending" }} locale="zh" />);
    expect(document.querySelector("[data-report-purchase-entry]")).toBeNull();
  });
});

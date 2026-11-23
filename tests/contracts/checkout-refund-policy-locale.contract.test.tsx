import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Career94Checkout } from "@/app/(localized)/[locale]/career/assessment/Career94Purchase";

vi.mock("next/navigation", () => ({ useRouter: () => ({push: vi.fn()}) }));
vi.mock("@/lib/api/v0_3", () => ({createCheckoutOrOrder: vi.fn()}));

describe("guest checkout refund-policy locale", () => {
  it.each([["zh", "zh"], ["zh", "zh-TW"], ["en", "en"]] as const)("%s / %s links directly to the published policy", (locale, displayLocale) => {
    render(<Career94Checkout locale={locale} displayLocale={displayLocale} attemptId="owned-attempt" offers={[{provider:"alipay",sku:"MBTI_WEB_REPORT_CNY_299",currency:"CNY",amount_cents:299}]} />);
    expect(screen.getByRole("link", {name: /退款政策|refund policy/i})).toHaveAttribute("href", `/${displayLocale}/support/payment-refund`);
    expect(screen.getByRole("button", {name: /2\.99/})).toBeEnabled();
  });
});

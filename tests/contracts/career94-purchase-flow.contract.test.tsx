import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Career94SaveResult } from "@/app/(localized)/[locale]/career/assessment/Career94Purchase";
import type { Career94Offer, Career94Result } from "@/app/(localized)/[locale]/career/assessment/career94-api";

const mocks = vi.hoisted(() => ({ account: vi.fn(), checkout: vi.fn(), push: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: mocks.push }) }));
vi.mock("@/lib/account/storage", () => ({ isAccountSession: mocks.account }));
vi.mock("@/lib/api/v0_3", () => ({ createCheckoutOrOrder: mocks.checkout }));

const offer: Career94Offer = { provider: "waffo", sku: "CAREER94_REPORT_CNY_299", currency: "CNY", amount_cents: 299 };
const id = "674254eb-6f6c-40d6-beea-2306f6abc9e3";
const saved = { attempt_id: id, unlocked: false, order_no: null, offers: [offer] } as Career94Result;

describe("Career94 single-click purchase", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.sessionStorage.clear();
    mocks.account.mockReturnValue(true);
    mocks.checkout.mockResolvedValue({ ok: true, order_no: "ord_career94_one_click", status: "pending" });
  });

  it("saves and creates the selected checkout with one click and no intermediate result screen", async () => {
    const save = vi.fn().mockResolvedValue(saved);
    render(<Career94SaveResult locale="zh" offers={[offer]} onSave={save} />);
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "微信支付 · ¥2.99" }));
    await waitFor(() => expect(mocks.checkout).toHaveBeenCalledWith({ attemptId: id, sku: offer.sku, provider: "waffo" }));
    expect(save).toHaveBeenCalledWith("CN_MAINLAND");
    await waitFor(() => expect(mocks.push).toHaveBeenCalledWith("/zh/pay/wait?order_no=ord_career94_one_click"));
    expect(mocks.push).not.toHaveBeenCalledWith(`/zh/career/assessment/result/${id}`);
  });

  it("allows a guest to save and purchase without a login or registration screen", async () => {
    mocks.account.mockReturnValue(false);
    const save = vi.fn().mockResolvedValue(saved);
    render(<Career94SaveResult locale="zh" offers={[offer]} onSave={save} />);
    fireEvent.click(screen.getByRole("button", { name: "微信支付 · ¥2.99" }));
    await waitFor(() => expect(mocks.checkout).toHaveBeenCalled());
    expect(save).toHaveBeenCalledWith("CN_MAINLAND");
    expect(screen.queryByRole("link", { name: "登录账户" })).not.toBeInTheDocument();
  });

  it("opens an existing report without creating another checkout", async () => {
    const save = vi.fn().mockResolvedValue({ ...saved, unlocked: true });
    render(<Career94SaveResult locale="zh" offers={[offer]} onSave={save} />);
    fireEvent.click(screen.getByRole("button", { name: "微信支付 · ¥2.99" }));
    await waitFor(() => expect(mocks.push).toHaveBeenCalledWith(`/zh/career/assessment/result/${id}`));
    expect(mocks.checkout).not.toHaveBeenCalled();
  });
});

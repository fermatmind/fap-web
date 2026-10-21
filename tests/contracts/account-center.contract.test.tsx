import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import AccountCenter, {
  completedTests,
} from "@/components/account/AccountCenter";
import {
  clearAccountSession,
  readOwnershipProofs,
  saveAccountSession,
  saveOwnershipProof,
} from "@/lib/account/storage";
import { getFmToken } from "@/lib/auth/fmToken";
import type { MeAttemptItem } from "@/lib/api/v0_3";

const mocks = vi.hoisted(() => ({
  search: "",
  history: vi.fn(),
  account: vi.fn(),
  challenge: vi.fn(),
  replace: vi.fn(),
  orders: vi.fn(),
}));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mocks.replace }),
  useSearchParams: () => new URLSearchParams(mocks.search),
}));
vi.mock("next/script", () => ({ default: () => null }));
vi.mock("@/lib/auth/authRetry", () => ({
  ensureFmTokenReady: vi
    .fn()
    .mockResolvedValue("fm_aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee"),
}));
vi.mock("@/lib/api/v0_3", () => ({ getMyAttempts: mocks.history }));
vi.mock("@/lib/account/api", () => ({
  getAccount: mocks.account,
  getLoginChallenge: mocks.challenge,
  getAccountOrders: mocks.orders,
  updateAccount: vi.fn(),
  acceptAccountSession: vi.fn(),
  googleLogin: vi.fn(),
  logoutAccount: vi.fn(),
  requestAccountRecovery: vi.fn(),
  requestGoogleAccountLink: vi.fn(),
  confirmAccountEmail: vi.fn(),
  downloadAccountPdf: vi.fn(),
}));

function row(code: string, patch: Partial<MeAttemptItem> = {}): MeAttemptItem {
  return {
    attempt_id: `attempt-${code}`,
    scale_code: code,
    has_result: true,
    submitted_at: "2026-10-20T12:00:00Z",
    question_count: 60,
    scale_version: "v1",
    access_summary: {
      access_state: "ready",
      report_state: "ready",
      pdf_state: "ready",
      actions: {
        page_href: `/result/attempt-${code}`,
        pdf_href: `/api/v0.3/attempts/attempt-${code}/report.pdf`,
      },
    },
    ...patch,
  } as MeAttemptItem;
}

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  mocks.search = "";
  mocks.account.mockResolvedValue({
    account: {
      id: "42",
      name: "Preview User",
      email: "preview@example.test",
      google_connected: true,
      locale: "zh",
    },
    preview: true,
  });
  mocks.challenge.mockResolvedValue({ configured: false });
  mocks.history.mockResolvedValue({ items: [], meta: { last_page: 1 } });
  mocks.orders.mockResolvedValue({ items: [], meta: { last_page: 1 } });
});

describe("account center", () => {
  it("counts completion across six scales without mixing scores or counting draft attempts", () => {
    const done = completedTests([
      row("MBTI"),
      row("MBTI"),
      row("IQ_RAVEN"),
      row("EQ_60"),
      row("BIG5_OCEAN", { has_result: false, type_code: "" }),
    ]);
    expect([...done]).toEqual(["MBTI", "IQ", "EQ_60"]);
  });

  it("shows six core assessments, account navigation and completion-only map", async () => {
    mocks.history.mockResolvedValue({
      items: [row("EQ_60"), row("IQ_RAVEN")],
      meta: { last_page: 1 },
    });
    render(<AccountCenter locale="zh" />);
    await screen.findByRole("heading", { name: "已完成 2 项测评" });
    expect(
      screen.getByRole("img", { name: /颜色只表示完成状态/ }),
    ).toBeInTheDocument();
    expect(
      within(screen.getByRole("navigation", { name: "账号导航" })).getByRole(
        "button",
        { name: "我的报告" },
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /智商测试 已完成/ }),
    ).toHaveAttribute("href", "/zh/account?section=reports&scale=IQ");
  });

  it("fetches all pages and includes EQ and IQ in the unified report list", async () => {
    mocks.search = "section=reports";
    mocks.history
      .mockResolvedValueOnce({ items: [row("EQ_60")], meta: { last_page: 2 } })
      .mockResolvedValueOnce({
        items: [row("IQ_INTELLIGENCE_QUOTIENT")],
        meta: { last_page: 2 },
      });
    render(<AccountCenter locale="en" />);
    await screen.findByRole("heading", { name: "Emotional intelligence" });
    expect(
      screen.getByRole("heading", { name: "IQ assessment" }),
    ).toBeInTheDocument();
    expect(mocks.history).toHaveBeenCalledWith(
      expect.objectContaining({ page: 2 }),
    );
    expect(
      screen.getAllByRole("button", { name: "Download PDF" }),
    ).toHaveLength(2);
  });

  it("uses the report filter from the completion link and never invents a PDF permission", async () => {
    mocks.search = "section=reports&scale=EQ_60";
    mocks.history.mockResolvedValue({
      items: [
        row("EQ_60", {
          access_summary: {
            access_state: "locked",
            report_state: "pending",
            pdf_state: "none",
            actions: { page_href: "/result/attempt-EQ_60", pdf_href: null },
          } as MeAttemptItem["access_summary"],
        }),
        row("IQ_RAVEN"),
      ],
      meta: { last_page: 1 },
    });
    render(<AccountCenter locale="zh" />);
    await screen.findByRole("heading", { name: "情商测试" });
    expect(
      screen.queryByRole("heading", { name: "智商测试" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "下载 PDF" }),
    ).not.toBeInTheDocument();
    expect(screen.getByText("报告生成中")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("筛选测评"), {
      target: { value: "all" },
    });
    expect(
      screen.getByRole("heading", { name: "智商测试" }),
    ).toBeInTheDocument();
  });

  it("supports arrow-key tabs with focus and selection", async () => {
    render(<AccountCenter locale="zh" />);
    const self = await screen.findByRole("tab", { name: /认识自己/ });
    fireEvent.keyDown(self, { key: "ArrowRight" });
    const career = screen.getByRole("tab", { name: /职业探索/ });
    expect(career).toHaveAttribute("aria-selected", "true");
    expect(career).toHaveFocus();
    expect(screen.getByRole("tabpanel")).toHaveAttribute(
      "aria-labelledby",
      "career-tab",
    );
    fireEvent.keyDown(career, { key: "Home" });
    expect(self).toHaveFocus();
    expect(self).toHaveAttribute("aria-selected", "true");
  });

  it("keeps email recovery available when Google is unconfigured", async () => {
    mocks.account.mockResolvedValue({ account: null, preview: true });
    render(<AccountCenter locale="zh" />);
    await screen.findByText(/Google 登录配置尚未就绪/);
    expect(
      screen.getByRole("link", { name: /用邮箱找回结果/ }),
    ).toHaveAttribute("href", "/zh/results/lookup");
  });

  it("renders an actionable error and clears rows on failure", async () => {
    mocks.history.mockRejectedValue(new Error("network"));
    render(<AccountCenter locale="en" />);
    await screen.findByRole("alert");
    expect(screen.getByRole("button", { name: "Retry" })).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Download PDF" }),
    ).not.toBeInTheDocument();
  });

  it("clears private account state on sign-out while preserving consent and language", () => {
    saveAccountSession("fm_aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee");
    saveOwnershipProof("test-attempt", "resume-proof");
    expect(readOwnershipProofs()).toHaveLength(1);
    localStorage.setItem("fm_big5_last_report_v1", "private-report");
    sessionStorage.setItem("fm_pending_order_v1", "private-order");
    localStorage.setItem("fm_consent", "necessary");
    localStorage.setItem("locale", "en");
    clearAccountSession();
    expect(getFmToken()).toBeNull();
    expect(readOwnershipProofs()).toEqual([]);
    expect(localStorage.getItem("fm_big5_last_report_v1")).toBeNull();
    expect(sessionStorage.getItem("fm_pending_order_v1")).toBeNull();
    expect(localStorage.getItem("fm_consent")).toBe("necessary");
    expect(localStorage.getItem("locale")).toBe("en");
  });
});

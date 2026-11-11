import { createEvent, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ResultEmailLookupForm } from "@/components/support/ResultEmailLookupForm";
import { NextRequest } from "next/server";
import TraditionalResultLookupPage, { metadata } from "@/app/(traditional)/zh-TW/results/lookup/page";
import { traditionalEquivalent, traditionalPath } from "@/lib/i18n/traditionalRoutes";
import { proxy } from "@/proxy";

const hoisted = vi.hoisted(() => ({
  lookupResultsByEmail: vi.fn(),
  captureError: vi.fn(),
}));

vi.mock("@/lib/api/v0_3", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api/v0_3")>("@/lib/api/v0_3");

  return {
    ...actual,
    lookupResultsByEmail: hoisted.lookupResultsByEmail,
  };
});

vi.mock("@/lib/observability/sentry", () => ({
  captureError: hoisted.captureError,
}));

describe("ResultEmailLookupForm contract", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.sessionStorage.clear();
  });

  function fireStoredTokenClick(element: HTMLElement): void {
    const event = createEvent.click(element, { button: 0 });
    event.preventDefault();
    fireEvent(element, event);
  }

  it("keeps the lookup form compact without redundant recovery headings", () => {
    render(<ResultEmailLookupForm locale="zh" />);

    expect(screen.queryByText("通过邮箱找回结果")).toBeNull();
    expect(screen.getByText("输入保存结果时使用的邮箱。若当前会话无法直接显示结果，我们会向该邮箱发送安全访问链接。")).toBeInTheDocument();
  });

  it("looks up normalized email and renders clean result links without exposing bearer tokens", async () => {
    hoisted.lookupResultsByEmail.mockResolvedValueOnce({
      ok: true,
      items: [
        {
          attempt_id: "attempt-email-lookup-1",
          result_id: "result-email-lookup-1",
          scale_code_legacy: "MBTI",
          type_code: "INTJ-A",
          submitted_at: "2026-05-05T08:30:00Z",
          result_url: "/en/result/attempt-email-lookup-1?access_token=result_lookup_token_1",
          result_access_token: "result_lookup_token_1",
          result_access_token_expires_at: "2026-05-05T09:00:00Z",
        },
      ],
    });

    render(<ResultEmailLookupForm locale="en" />);

    fireEvent.change(screen.getByTestId("result-email-lookup-input"), {
      target: { value: " Owner@Example.Test " },
    });
    fireEvent.click(screen.getByTestId("result-email-lookup-submit"));

    await waitFor(() => {
      expect(hoisted.lookupResultsByEmail).toHaveBeenCalledWith({
        email: "owner@example.test",
        locale: "en",
      });
    });

    expect(screen.getByTestId("result-email-lookup-results")).toHaveTextContent("Saved results found");
    expect(screen.getByTestId("result-email-lookup-item")).toHaveTextContent("MBTI");
    expect(screen.getByTestId("result-email-lookup-item")).toHaveTextContent("INTJ-A");
    const openLink = screen.getByTestId("result-email-lookup-open");
    expect(openLink).toHaveAttribute("href", "/en/result/attempt-email-lookup-1");
    expect(openLink.getAttribute("href")).not.toContain("access_token");
    fireStoredTokenClick(openLink);
    expect(window.sessionStorage.getItem("fm.result_access_token.attempt-email-lookup-1")).toBe("result_lookup_token_1");
    expect(screen.queryByText("Access link expires")).not.toBeInTheDocument();
    expect(screen.queryByText("result_lookup_token_1")).not.toBeInTheDocument();
  });

  it("stores split result access token data without appending it to first-party result URLs", async () => {
    hoisted.lookupResultsByEmail.mockResolvedValueOnce({
      ok: true,
      items: [
        {
          attempt_id: "attempt-email-lookup-split-token",
          scale_code_legacy: "MBTI",
          result_url: "/en/result/attempt-email-lookup-split-token",
          result_access_token: "result_lookup_token_split",
        },
      ],
    });

    render(<ResultEmailLookupForm locale="en" />);

    fireEvent.change(screen.getByTestId("result-email-lookup-input"), {
      target: { value: "owner@example.test" },
    });
    fireEvent.click(screen.getByTestId("result-email-lookup-submit"));

    await waitFor(() => {
      expect(screen.getByTestId("result-email-lookup-open")).toHaveAttribute(
        "href",
        "/en/result/attempt-email-lookup-split-token"
      );
    });

    fireStoredTokenClick(screen.getByTestId("result-email-lookup-open"));
    expect(window.sessionStorage.getItem("fm.result_access_token.attempt-email-lookup-split-token")).toBe(
      "result_lookup_token_split"
    );
    expect(screen.getByTestId("result-email-lookup-open").getAttribute("href")).not.toContain("access_token");
    expect(screen.queryByText("result_lookup_token_split")).not.toBeInTheDocument();
  });

  it("returns a blind recovery state without revealing whether an email matched", async () => {
    hoisted.lookupResultsByEmail.mockResolvedValueOnce({
      ok: true,
      items: [],
      email_verification_required: true,
      recovery_email_requested: true,
    });

    render(<ResultEmailLookupForm locale="en" />);

    fireEvent.change(screen.getByTestId("result-email-lookup-input"), {
      target: { value: "missing@example.test" },
    });
    fireEvent.click(screen.getByTestId("result-email-lookup-submit"));

    await waitFor(() => {
      expect(screen.getByTestId("result-email-lookup-results")).toHaveTextContent(
        "If matching saved results exist, secure access links will be sent to that email."
      );
    });
  });

  it("does not render unsafe external result urls", async () => {
    hoisted.lookupResultsByEmail.mockResolvedValueOnce({
      ok: true,
      items: [
        {
          attempt_id: "attempt-email-lookup-unsafe",
          scale_code_legacy: "BIG5_OCEAN",
          result_url: "https://example.org/result/attempt-email-lookup-unsafe?access_token=bad",
        },
      ],
    });

    render(<ResultEmailLookupForm locale="en" />);

    fireEvent.change(screen.getByTestId("result-email-lookup-input"), {
      target: { value: "owner@example.test" },
    });
    fireEvent.click(screen.getByTestId("result-email-lookup-submit"));

    await waitFor(() => {
      expect(screen.getByTestId("result-email-lookup-item")).toHaveTextContent("Result link unavailable");
    });
    expect(screen.queryByTestId("result-email-lookup-open")).not.toBeInTheDocument();
  });
});

describe("Taiwan Traditional result lookup route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.sessionStorage.clear();
  });

  it("uses the real private route and clean language links", async () => {
    const path = "/zh-TW/results/lookup";
    render(<TraditionalResultLookupPage />);
    expect(screen.getByRole("heading", { name: "找回測驗結果" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "English" })).toHaveAttribute("href", "/en/results/lookup");
    expect(screen.getByRole("link", { name: "简体中文" })).toHaveAttribute("href", "/zh/results/lookup");
    expect(metadata.alternates).toEqual({ canonical: path });
    expect(metadata.robots).toMatchObject({ index: false, follow: false });
    expect(traditionalPath("/zh/results/lookup")).toBe(path);
    expect(traditionalEquivalent(path)).toBeNull();
    const response = await proxy(new NextRequest("https://fermatmind.com" + path));
    expect(response.status).toBe(200);
    expect(response.headers.get("X-Robots-Tag")).toContain("noindex");
    expect(response.headers.get("Cache-Control")).toContain("no-store");
    expect(response.headers.get("Referrer-Policy")).toBe("no-referrer");
    const unavailable = await proxy(new NextRequest("https://fermatmind.com/zh-TW/results/lookup/private"));
    expect(unavailable.status).toBe(404);
  });

  it("requests a Taiwan email and keeps the guest response non-identifying", async () => {
    hoisted.lookupResultsByEmail.mockResolvedValueOnce({ ok: true, items: [], email_verification_required: true });
    render(<TraditionalResultLookupPage />);
    fireEvent.change(screen.getByRole("textbox", { name: "電子郵件地址" }), { target: { value: " Owner@Example.Test " } });
    fireEvent.click(screen.getByRole("button", { name: "查詢結果" }));
    expect(await screen.findByTestId("result-email-lookup-results")).toHaveTextContent("如果有符合的已儲存結果");
    expect(hoisted.lookupResultsByEmail).toHaveBeenCalledWith({ email: "owner@example.test", locale: "zh-TW" });
    expect(screen.queryByTestId("result-email-lookup-open")).toBeNull();
  });

  it.each([
    ["MBTI", "/zh/result/tw-lookup-attempt?access_token=synthetic-tw-token", "/zh-TW/result/tw-lookup-attempt", "開啟結果"],
    ["RIASEC", null, "/zh-TW/result/tw-lookup-attempt", "開啟結果"],
    ["BIG5_OCEAN", "/en/result/tw-lookup-attempt", "/en/result/tw-lookup-attempt", "開啟結果（英文）"],
    ["EQ_SJT_16", "/zh/result/tw-lookup-attempt", "/zh/result/tw-lookup-attempt", "開啟結果（簡體中文）"],
  ])("uses the available result display for %s without changing token handoff", async (scale, source, expected, label) => {
    hoisted.lookupResultsByEmail.mockResolvedValueOnce({ ok: true, items: [{
      attempt_id: "tw-lookup-attempt",
      scale_code: scale,
      result_url: source,
      result_access_token: "synthetic-tw-token",
    }] });
    render(<TraditionalResultLookupPage />);
    fireEvent.change(screen.getByRole("textbox", { name: "電子郵件地址" }), { target: { value: "owner@example.test" } });
    fireEvent.click(screen.getByRole("button", { name: "查詢結果" }));
    const link = await screen.findByRole("link", { name: label, exact: true });
    expect(link).toHaveAttribute("href", expected);
    const click = createEvent.click(link, { button: 0 });
    click.preventDefault();
    fireEvent(link, click);
    expect(window.sessionStorage.getItem("fm.result_access_token.tw-lookup-attempt")).toBe("synthetic-tw-token");
  });

  it("labels the original-language result handoff and keeps the token out of the href", async () => {
    hoisted.lookupResultsByEmail.mockResolvedValueOnce({ ok: true, items: [{
      attempt_id: "tw-lookup-attempt",
      result_url: "/zh/result/tw-lookup-attempt?access_token=synthetic-tw-token",
      result_access_token: "synthetic-tw-token",
    }] });
    render(<TraditionalResultLookupPage />);
    fireEvent.change(screen.getByRole("textbox", { name: "電子郵件地址" }), { target: { value: "owner@example.test" } });
    fireEvent.click(screen.getByRole("button", { name: "查詢結果" }));
    const link = await screen.findByRole("link", { name: "開啟結果（簡體中文）" });
    expect(link).toHaveAttribute("href", "/zh/result/tw-lookup-attempt");
    const click = createEvent.click(link, { button: 0 });
    click.preventDefault();
    fireEvent(link, click);
    expect(window.sessionStorage.getItem("fm.result_access_token.tw-lookup-attempt")).toBe("synthetic-tw-token");
  });
});

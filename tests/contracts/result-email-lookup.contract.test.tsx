import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ResultEmailLookupForm } from "@/components/support/ResultEmailLookupForm";

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
  });

  it("keeps the lookup form compact without redundant recovery headings", () => {
    render(<ResultEmailLookupForm locale="zh" />);

    expect(screen.queryByText("通过邮箱找回结果")).toBeNull();
    expect(screen.getByText("输入邮箱即可找回该邮箱下保存的结果，请使用你自己的邮箱。")).toBeInTheDocument();
  });

  it("looks up normalized email and opens backend-issued result access token links", async () => {
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
    expect(screen.getByTestId("result-email-lookup-open")).toHaveAttribute(
      "href",
      "/en/result/attempt-email-lookup-1?access_token=result_lookup_token_1"
    );
  });

  it("returns a blind empty state for unmatched emails", async () => {
    hoisted.lookupResultsByEmail.mockResolvedValueOnce({
      ok: true,
      items: [],
    });

    render(<ResultEmailLookupForm locale="en" />);

    fireEvent.change(screen.getByTestId("result-email-lookup-input"), {
      target: { value: "missing@example.test" },
    });
    fireEvent.click(screen.getByTestId("result-email-lookup-submit"));

    await waitFor(() => {
      expect(screen.getByTestId("result-email-lookup-results")).toHaveTextContent(
        "No saved results were found for that email."
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

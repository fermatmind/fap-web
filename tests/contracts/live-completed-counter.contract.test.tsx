import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LiveCompletedCounter } from "@/components/marketing/LiveCompletedCounter";

describe("LiveCompletedCounter contract", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("renders the baseline plus the backend cumulative successful attempts without a ticker", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        ok: true,
        test_metrics_summary: {
          cumulative_successful_attempts: 1183,
        },
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<LiveCompletedCounter suffix="+" />);

    expect(screen.getByText("1,200,000+")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("1,201,183+")).toBeInTheDocument();
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});

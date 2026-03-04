import { resolveResultAttemptId } from "@/lib/attempt/resolveResultAttemptId";

describe("resolveResultAttemptId", () => {
  it("prefers top-level attempt_id", () => {
    const response = {
      attempt_id: "attempt_top",
      result: { attempt_id: "attempt_result" },
      meta: { attempt_id: "attempt_meta" },
      report: { attempt_id: "attempt_report" },
    };

    expect(resolveResultAttemptId(response, "fallback")).toBe("attempt_top");
  });

  it("falls back through result/meta/report nodes", () => {
    expect(
      resolveResultAttemptId(
        {
          result: { attempt_id: "attempt_result" },
        },
        "fallback"
      )
    ).toBe("attempt_result");

    expect(
      resolveResultAttemptId(
        {
          result: { attempt_id: " " },
          meta: { attempt_id: "attempt_meta" },
        },
        "fallback"
      )
    ).toBe("attempt_meta");

    expect(
      resolveResultAttemptId(
        {
          result: { attempt_id: null },
          meta: { attempt_id: null },
          report: { attempt_id: "attempt_report" },
        },
        "fallback"
      )
    ).toBe("attempt_report");
  });

  it("returns fallback attempt id when response does not provide a usable id", () => {
    expect(
      resolveResultAttemptId(
        {
          attempt_id: null,
          result: { attempt_id: "" },
          meta: { attempt_id: 12345 },
          report: { attempt_id: undefined },
        },
        "fallback_attempt"
      )
    ).toBe("fallback_attempt");
  });
});

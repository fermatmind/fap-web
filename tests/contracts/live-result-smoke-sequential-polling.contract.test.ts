import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";

import { waitForResult } from "../../scripts/ops/check-live-result-smoke.mjs";

type SmokeResponse = {
  ok: boolean;
  status: number;
  payload: Record<string, unknown>;
};

const baseOptions = {
  apiOrigin: "https://api.example.test",
  token: "fm_test",
  anonId: "anon_test",
  attemptId: "attempt_test",
  scale: { label: "Enneagram" },
  reportTimeoutMs: 90_000,
  reportPollMs: null,
};

function response(status: number, payload: Record<string, unknown> = {}): SmokeResponse {
  return {
    ok: status >= 200 && status < 300,
    status,
    payload,
  };
}

describe("live result smoke sequential polling", () => {
  it("keeps workflow runs single-instance without cancelling an active smoke", () => {
    const workflow = readFileSync(".github/workflows/live-result-smoke.yml", "utf8");
    const script = readFileSync("scripts/ops/check-live-result-smoke.mjs", "utf8");

    expect(workflow).toContain("group: live-result-smoke");
    expect(workflow).toContain("cancel-in-progress: false");
    expect(workflow).not.toContain("RESULT_SMOKE_REPORT_POLL_MS");
    expect(script).not.toContain("Promise.all([");
  });

  it("waits for result before polling report and honors retry_after_seconds", async () => {
    const calls: string[] = [];
    const responses = [
      response(202, { retry_after_seconds: 3 }),
      response(200),
      response(202, { meta: { retry_after_seconds: 5 } }),
      response(200),
    ];
    const requestJson = vi.fn(async ({ path }: { path: string }) => {
      calls.push(path);
      return responses.shift()!;
    });
    const sleep = vi.fn(async (delay: number) => {
      expect(delay).toBeGreaterThan(0);
    });

    const ready = await waitForResult(baseOptions, {
      requestJson,
      sleep,
      now: () => 0,
    });

    expect(calls).toEqual([
      "/attempts/attempt_test/result",
      "/attempts/attempt_test/result",
      "/attempts/attempt_test/report",
      "/attempts/attempt_test/report",
    ]);
    expect(sleep.mock.calls.map(([delay]) => delay)).toEqual([3000, 5000]);
    expect(ready).toMatchObject({
      resultStatus: 200,
      reportStatus: 200,
      diagnostics: {
        result: { polls: 2, transient_retries: 0 },
        report: { polls: 2, transient_retries: 0 },
      },
    });
  });

  it("uses bounded 2s, 5s, 10s fallback and fails permanently pending stages at the total timeout", async () => {
    let currentTime = 0;
    const sleep = vi.fn(async (delay: number) => {
      currentTime += delay;
    });
    const requestJson = vi.fn(async () => response(202));

    await expect(
      waitForResult(
        {
          ...baseOptions,
          reportTimeoutMs: 17_000,
        },
        {
          requestJson,
          sleep,
          now: () => currentTime,
        }
      )
    ).rejects.toThrow(
      "Enneagram polling timed out: stage=result status=202 polls=3 transient_retries=0"
    );

    expect(sleep.mock.calls.map(([delay]) => delay)).toEqual([2000, 5000, 10_000]);
    expect(requestJson).toHaveBeenCalledTimes(3);
  });

  it("retries 502/503/504 at most three times and records diagnostics", async () => {
    const responses = [response(504), response(503), response(502), response(200), response(200)];
    const requestJson = vi.fn(async () => responses.shift()!);
    const sleep = vi.fn(async (delay: number) => {
      expect(delay).toBeGreaterThan(0);
    });

    const ready = await waitForResult(baseOptions, {
      requestJson,
      sleep,
      now: () => 0,
    });

    expect(ready.diagnostics.result).toMatchObject({
      polls: 4,
      transient_retries: 3,
      last_status: 200,
    });
    expect(ready.diagnostics.report).toMatchObject({
      polls: 1,
      transient_retries: 0,
      last_status: 200,
    });
    expect(sleep.mock.calls.map(([delay]) => delay)).toEqual([2000, 5000, 10_000]);
  });

  it("fails after the third transient retry instead of creating an unbounded request loop", async () => {
    const requestJson = vi.fn(async () => response(504));

    await expect(
      waitForResult(baseOptions, {
        requestJson,
        sleep: async () => undefined,
        now: () => 0,
      })
    ).rejects.toThrow(
      "Enneagram transient retries exhausted: stage=result status=504 polls=4 transient_retries=3"
    );

    expect(requestJson).toHaveBeenCalledTimes(4);
  });

  it.each([
    [404, "", "status=404"],
    [401, "UNAUTHENTICATED", "status=401"],
    [403, "FORBIDDEN", "status=403"],
    [503, "REPORT_SNAPSHOT_FAILED", "error_code=REPORT_SNAPSHOT_FAILED"],
  ])("fails immediately for non-retryable status %s", async (status, errorCode, expected) => {
    const requestJson = vi.fn(async () =>
      response(status, errorCode ? { error_code: errorCode } : {})
    );

    await expect(
      waitForResult(baseOptions, {
        requestJson,
        sleep: async () => undefined,
        now: () => 0,
      })
    ).rejects.toThrow(expected);

    expect(requestJson).toHaveBeenCalledTimes(1);
  });

  it("retries transport failures only within the same bounded budget", async () => {
    const requestJson = vi
      .fn()
      .mockRejectedValueOnce(new Error("socket reset"))
      .mockResolvedValueOnce(response(200))
      .mockResolvedValueOnce(response(200));

    const ready = await waitForResult(baseOptions, {
      requestJson,
      sleep: async () => undefined,
      now: () => 0,
    });

    expect(ready.diagnostics.result).toMatchObject({
      polls: 2,
      transient_retries: 1,
    });
    expect(requestJson).toHaveBeenCalledTimes(3);
  });
});

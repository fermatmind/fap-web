import fs from "node:fs";
import path from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  ensureRiasecGuestTokenReady,
  startRiasecAttempt,
  submitRiasecAttempt,
} from "@/lib/riasec/api";

const ROOT = process.cwd();

const hoisted = vi.hoisted(() => ({
  callOrder: [] as string[],
  ensureFmTokenReady: vi.fn(async ({ anonId }: { anonId?: string }) => {
    hoisted.callOrder.push(`ensure:${anonId ?? ""}`);
    return "issued" as const;
  }),
  runWithGuestTokenRetry: vi.fn(async ({
    runner,
    anonId,
  }: {
    runner: () => Promise<unknown>;
    anonId?: string;
  }) => {
    hoisted.callOrder.push(`retry:${anonId ?? ""}`);
    return runner();
  }),
  fetchScaleQuestions: vi.fn(),
  getAttemptReport: vi.fn(),
  getMyAttempts: vi.fn(),
  startAttempt: vi.fn(async ({ anonId }: { anonId?: string }) => {
    hoisted.callOrder.push(`start:${anonId ?? ""}`);
    return {
      ok: true,
      attempt_id: "attempt-riasec-token-parity",
      scale_code: "RIASEC",
    };
  }),
  submitAttempt: vi.fn(async ({ anonId }: { anonId?: string }) => {
    hoisted.callOrder.push(`submit:${anonId ?? ""}`);
    return {
      ok: true,
      attempt_id: "attempt-riasec-token-parity",
      submission_state: "generating",
    };
  }),
}));

vi.mock("@/lib/anon", () => ({
  getOrCreateAnonId: () => "anon_riasec_browser",
}));

vi.mock("@/lib/auth/authRetry", () => ({
  ensureFmTokenReady: hoisted.ensureFmTokenReady,
  runWithGuestTokenRetry: hoisted.runWithGuestTokenRetry,
}));

vi.mock("@/lib/api/v0_3", () => ({
  fetchScaleQuestions: hoisted.fetchScaleQuestions,
  getAttemptReport: hoisted.getAttemptReport,
  getMyAttempts: hoisted.getMyAttempts,
  startAttempt: hoisted.startAttempt,
  submitAttempt: hoisted.submitAttempt,
}));

function readSource(relativePath: string): string {
  return fs.readFileSync(path.join(ROOT, relativePath), "utf8");
}

describe("RIASEC guest token parity contract", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    hoisted.callOrder = [];
  });

  it("ensures current-anon guest token readiness before RIASEC attempts/start", async () => {
    await startRiasecAttempt({
      anonId: "anon_riasec_take",
      locale: "zh-CN",
      formCode: "riasec_60",
      meta: { source: "tests_take_page", slug: "holland-career-interest-test-riasec" },
    });

    expect(hoisted.ensureFmTokenReady).toHaveBeenCalledWith({
      anonId: "anon_riasec_take",
      locale: "zh-CN",
      forceRefresh: true,
    });
    expect(hoisted.startAttempt).toHaveBeenCalledWith(expect.objectContaining({
      scaleCode: "RIASEC",
      formCode: "riasec_60",
      anonId: "anon_riasec_take",
      locale: "zh-CN",
    }));
    expect(hoisted.callOrder.indexOf("ensure:anon_riasec_take")).toBeLessThan(
      hoisted.callOrder.indexOf("start:anon_riasec_take")
    );
  });

  it("keeps RIASEC submit on the same anon context without adding email or PII", async () => {
    await submitRiasecAttempt({
      attemptId: "attempt-riasec-token-parity",
      anonId: "anon_riasec_take",
      durationMs: 120000,
      answers: [
        {
          question_id: "riasec-q1",
          code: "5",
          question_index: 0,
        },
      ],
    });

    expect(hoisted.runWithGuestTokenRetry).toHaveBeenCalledWith(expect.objectContaining({
      anonId: "anon_riasec_take",
    }));
    expect(hoisted.submitAttempt).toHaveBeenCalledWith(expect.objectContaining({
      attemptId: "attempt-riasec-token-parity",
      anonId: "anon_riasec_take",
      durationMs: 120000,
    }));
    expect(JSON.stringify(hoisted.submitAttempt.mock.calls[0]?.[0] ?? {})).not.toContain("email");
  });

  it("exposes a reusable RIASEC guest-token readiness helper bound to the supplied anon id", async () => {
    await ensureRiasecGuestTokenReady({
      anonId: "anon_riasec_take",
      locale: "en",
    });

    expect(hoisted.ensureFmTokenReady).toHaveBeenCalledWith({
      anonId: "anon_riasec_take",
      locale: "en",
      forceRefresh: true,
    });
  });

  it("keeps result email-bind on the caller anon identity instead of email-only ownership", () => {
    const resultClient = readSource("app/(localized)/[locale]/(app)/result/[id]/ResultClient.tsx");
    const apiClient = readSource("lib/api/v0_3.ts");

    expect(resultClient).toContain("bindAttemptEmail({");
    expect(resultClient).toContain("anonId,");
    expect(resultClient).toContain('surface: "result_gate"');
    expect(apiClient).toContain("export async function bindAttemptEmail");
    expect(apiClient).toContain("const resolvedAnonId = resolveAnonId(anonId);");
    expect(apiClient).toContain("...anonHeader(resolvedAnonId),");
  });

  it("documents attribution as sidecar by not changing RIASEC UTM policy in this PR", () => {
    const riasecApi = readSource("lib/riasec/api.ts");
    const riasecTake = readSource("app/(localized)/[locale]/tests/[slug]/take/RiasecTakeClient.tsx");

    expect(riasecApi).not.toContain("utm:");
    expect(riasecTake).not.toContain("utm_source");
  });
});

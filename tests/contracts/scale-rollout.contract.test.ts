import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";
import { createScaleRolloutEnvSnapshot, resolveScaleRollout } from "@/lib/rollout/scaleRollout";
import { proxy as proxyHandler } from "@/proxy";
import { isCurrentRiasecPack12AllowedFile } from "./helpers/currentPrScope";

const ROOT = process.cwd();

function readSource(file: string): string {
  return fs.readFileSync(path.join(ROOT, file), "utf8");
}

function proxy(request: NextRequest) {
  const response = proxyHandler(request);
  if (response instanceof Promise) {
    throw new Error("Expected rollout proxy paths to stay synchronous.");
  }
  return response;
}

function currentChangedFiles(): string[] {
  return execFileSync("git", ["diff", "--name-only", "HEAD"], {
    cwd: ROOT,
    encoding: "utf8",
  })
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function forwardedAnonSeed(pathname: string): string | null {
  const response = proxy(
    new NextRequest(`https://example.com${pathname}`, {
      headers: {
        cookie: "fap_anonymous_id_v1=anon-b-seed",
      },
    })
  );

  return response.headers.get("x-middleware-request-x-anon-id");
}

describe("scale rollout identity bucketing contract", () => {
  it("uses stable request identity seeds for percentage rollout buckets", () => {
    const envSnapshot = createScaleRolloutEnvSnapshot({
      ENABLE_MBTI: "true",
      ROLLOUT_PERCENT_MBTI: "50",
    });

    const blockedIdentity = resolveScaleRollout({
      scaleCode: "MBTI",
      identitySeed: "anon-a",
      envSnapshot,
    });
    const allowedIdentity = resolveScaleRollout({
      scaleCode: "MBTI",
      identitySeed: "anon-b",
      envSnapshot,
    });
    const fallbackIdentity = resolveScaleRollout({
      scaleCode: "MBTI",
      envSnapshot,
    });

    expect(blockedIdentity.bucket).toBe(97);
    expect(blockedIdentity.percentEnabled).toBe(false);
    expect(blockedIdentity.reasons).toContain("percent_filtered");
    expect(allowedIdentity.bucket).toBe(40);
    expect(allowedIdentity.percentEnabled).toBe(true);
    expect(fallbackIdentity.bucket).toBe(26);
  });

  it("supports backend-gated EQ-SJT rollout without frontend content authority", () => {
    const envSnapshot = createScaleRolloutEnvSnapshot({
      ENABLE_EQ_SJT_16: "true",
      ROLLOUT_PERCENT_EQ_SJT_16: "100",
    });

    const decision = resolveScaleRollout({
      scaleCode: "EQ_SJT_16",
      capabilities: {
        enabled_in_prod: true,
        paywall_mode: "free_only",
      },
      identitySeed: "eq-sjt-available-seed",
      envSnapshot,
    });

    expect(decision.scaleCode).toBe("EQ_SJT_16");
    expect(decision.assessmentEnabled).toBe(true);
    expect(decision.commerceEnabled).toBe(false);
    expect(decision.paywallMode).toBe("free_only");
  });

  it("keeps the static landing free of request headers while the take gate uses the proxy identity", () => {
    const landingSource = readSource("app/(localized)/[locale]/tests/[slug]/page.tsx");
    const takeSource = readSource("app/(localized)/[locale]/tests/[slug]/take/page.tsx");

    expect(landingSource).not.toContain('from "next/headers"');
    expect(landingSource).not.toContain("x-anon-id");
    expect(landingSource).toMatch(/resolveScaleRollout\(\{[\s\S]*?identitySeed: null,[\s\S]*?\}\)/);
    expect(takeSource).toContain("x-anon-id");
    expect(takeSource).toMatch(/resolveScaleRollout\(\{[\s\S]*?identitySeed: await readRolloutIdentitySeed\(\),[\s\S]*?\}\)/);
  });

  it("keeps request-specific percentage rollout enforcement on the take route", () => {
    const landingSeed = forwardedAnonSeed("/en/tests/mbti-personality-test-16-personality-types");
    const takeSeed = forwardedAnonSeed("/en/tests/mbti-personality-test-16-personality-types/take");
    const envSnapshot = createScaleRolloutEnvSnapshot({
      ENABLE_MBTI: "true",
      ROLLOUT_PERCENT_MBTI: "50",
    });

    expect(landingSeed).toBe("anon-b-seed");
    expect(takeSeed).toBe("anon-b-seed");

    const staticLandingDecision = resolveScaleRollout({
      scaleCode: "MBTI",
      identitySeed: null,
      envSnapshot,
    });
    const takeDecision = resolveScaleRollout({
      scaleCode: "MBTI",
      identitySeed: takeSeed,
      envSnapshot,
    });

    expect(staticLandingDecision.bucket).toBe(26);
    expect(takeDecision.bucket).toBe(90);
    expect(takeDecision.percentEnabled).toBe(false);
    expect(takeDecision.reasons).toContain("percent_filtered");
  });

  it("documents the PR-WEB-SEC-32 scope boundary", () => {
    const changed = currentChangedFiles();

    expect(changed.every(isCurrentRiasecPack12AllowedFile), changed.join("\n")).toBe(true);
  });
});

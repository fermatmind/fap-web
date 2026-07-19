import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  isCareerAssetMaster,
  isCareerClaimPermissions,
  isCareerScoreResult,
  isCareerTrustManifest,
  normalizeCareerTrustManifest,
} from "@/lib/career/contracts";

const ROOT = process.cwd();

function readJson<T = unknown>(relPath: string): T {
  const source = fs.readFileSync(path.join(ROOT, relPath), "utf8");
  return JSON.parse(source) as T;
}

function read(relPath: string): string {
  return fs.readFileSync(path.join(ROOT, relPath), "utf8");
}

describe("career canonical protocol contract", () => {
  it("exports runtime guards that accept normalized canonical shapes and reject raw legacy trust", () => {
    const asset = readJson("tests/fixtures/career/career-asset-master.fixture.json");
    const trustManifest = readJson("tests/fixtures/career/trust-manifest.fixture.json");
    const claimPermissions = readJson("tests/fixtures/career/claim-permissions.fixture.json");
    const scoreResult = readJson("tests/fixtures/career/score-result.fixture.json");

    expect(isCareerAssetMaster(asset)).toBe(true);
    expect(isCareerTrustManifest(trustManifest)).toBe(false);
    expect(isCareerTrustManifest(normalizeCareerTrustManifest(trustManifest))).toBe(true);
    expect(isCareerClaimPermissions(claimPermissions)).toBe(true);
    expect(isCareerScoreResult(scoreResult)).toBe(true);
  });

  it("keeps truth, trust, score, and permissions as separate contract objects", () => {
    const asset = readJson<Record<string, unknown>>("tests/fixtures/career/career-asset-master.fixture.json");
    const trustManifest = readJson<Record<string, unknown>>("tests/fixtures/career/trust-manifest.fixture.json");

    expect(asset).toHaveProperty("truth_layer");
    expect(asset).toHaveProperty("derived_signals");
    expect(asset).toHaveProperty("claim_permissions");
    expect(asset).toHaveProperty("trust_contract");
    expect(asset).toHaveProperty("scoring");
    expect(asset).not.toHaveProperty("trust_manifest");

    expect(trustManifest).toHaveProperty("source_trace");
    expect(trustManifest).toHaveProperty("quality");
    expect(trustManifest).not.toHaveProperty("truth_layer");
    expect(trustManifest).not.toHaveProperty("claim_permissions");
  });

  it("keeps Career claim_permissions independent from MBTI personality-hub claim_permissions naming", () => {
    const careerContracts = read("lib/career/contracts/index.ts");
    const personalityHubTypes = read("lib/mbti/personalityHub.types.ts");

    expect(careerContracts).not.toContain("personalityHub.types");
    expect(personalityHubTypes).toContain("claim_permissions?: string[]");
  });

  it("marks legacy recommendation types as adapter-only instead of protocol authority", () => {
    const legacyTypes = read("lib/career/types.ts");
    const recommendationAdapter = read("lib/cms/career-recommendations.ts");
    const careerJobAdapter = read("lib/cms/career-jobs.ts");

    expect(legacyTypes).toContain("Legacy adapter-only");
    expect(recommendationAdapter).toContain("canonical protocol authority now lives under `lib/career/contracts`");
    expect(careerJobAdapter).toContain("canonical protocol authority now lives under `lib/career/contracts`");
  });
});

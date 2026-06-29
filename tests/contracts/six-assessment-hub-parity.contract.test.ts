import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import {
  SIX_ASSESSMENT_SCALES,
  SIX_ASSESSMENT_SURFACES,
  buildConfig,
} from "../../scripts/seo/check-six-assessment-hub-parity.mjs";

const ROOT = process.cwd();
const SCRIPT_PATH = path.join(ROOT, "scripts/seo/check-six-assessment-hub-parity.mjs");
const DOC_PATH = path.join(ROOT, "docs/seo/six-assessment-hub-parity.md");
const ARTIFACT_PATH = path.join(ROOT, "docs/seo/generated/six-assessment-hub-parity.v1.json");
const PACKAGE_JSON_PATH = path.join(ROOT, "package.json");

describe("six-assessment hub parity verifier", () => {
  it("keeps the six-scale plan and checked-in artifact in sync", () => {
    expect(SIX_ASSESSMENT_SCALES.map((item) => item.scale_code)).toEqual([
      "MBTI",
      "BIG5",
      "ENNEAGRAM",
      "RIASEC",
      "IQ",
      "EQ",
    ]);

    expect(SIX_ASSESSMENT_SURFACES).toHaveLength(12);
    expect(
      SIX_ASSESSMENT_SURFACES.map((item) => item.route).sort()
    ).toEqual([
      "/en/tests/big-five-personality-test-ocean-model",
      "/en/tests/enneagram-personality-test-nine-types",
      "/en/tests/eq-test-emotional-intelligence-assessment",
      "/en/tests/holland-career-interest-test-riasec",
      "/en/tests/iq-test-intelligence-quotient-assessment",
      "/en/tests/mbti-personality-test-16-personality-types",
      "/zh/tests/big-five-personality-test-ocean-model",
      "/zh/tests/enneagram-personality-test-nine-types",
      "/zh/tests/eq-test-emotional-intelligence-assessment",
      "/zh/tests/holland-career-interest-test-riasec",
      "/zh/tests/iq-test-intelligence-quotient-assessment",
      "/zh/tests/mbti-personality-test-16-personality-types",
    ]);

    const generated = JSON.parse(
      execFileSync("node", ["scripts/seo/check-six-assessment-hub-parity.mjs", "--plan", "--json"], {
        cwd: ROOT,
        encoding: "utf8",
      })
    );
    const artifact = JSON.parse(fs.readFileSync(ARTIFACT_PATH, "utf8"));

    expect(generated).toEqual(artifact);
    expect(artifact.version).toBe("seo.six_assessment_hub_parity.v1");
    expect(artifact.surface_count).toBe(12);
  });

  it("keeps the live verifier fail-closed and checking all shared authority surfaces", () => {
    expect(buildConfig({} as NodeJS.ProcessEnv)).toMatchObject({
      siteBaseUrl: "https://fermatmind.com",
      apiBaseUrl: "https://api.fermatmind.com",
      allowedHosts: ["fermatmind.com", "api.fermatmind.com"],
    });

    expect(() =>
      buildConfig({
        SIX_ASSESSMENT_PARITY_SITE_BASE_URL: "https://example.com",
        SIX_ASSESSMENT_PARITY_API_BASE_URL: "https://api.fermatmind.com",
      } as unknown as NodeJS.ProcessEnv)
    ).toThrow("unexpected_monitor_host=example.com");

    const source = fs.readFileSync(SCRIPT_PATH, "utf8");
    expect(source).toContain("/sitemap.xml");
    expect(source).toContain("/llms.txt");
    expect(source).toContain("/llms-full.txt");
    expect(source).toContain("/api/v0.3/scales/lookup");
    expect(source).toContain("/api/v0.3/scales/sitemap-source?locale=");
    expect(source).toContain("manual_review_required");
    expect(source).toContain("process.exit(result.ok ? 0 : 1)");
  });

  it("documents scope boundaries, commands, and IQ review handling", () => {
    const doc = fs.readFileSync(DOC_PATH, "utf8");
    const artifact = JSON.parse(fs.readFileSync(ARTIFACT_PATH, "utf8"));

    expect(doc).toContain("Scope: `FA30-WEB-01`");
    expect(doc).toContain("pnpm seo:check-six-assessment-hub-parity");
    expect(doc).toContain("llms-full.txt");
    expect(doc).toContain("manual_review_required");
    expect(artifact.out_of_scope).toContain("frontend runtime changes");
    expect(artifact.out_of_scope).toContain("CMS writes");
    expect(artifact.commands.live_check).toBe("pnpm seo:check-six-assessment-hub-parity");
  });

  it("registers the package script for operator and CI use", () => {
    const packageJson = JSON.parse(fs.readFileSync(PACKAGE_JSON_PATH, "utf8"));
    expect(packageJson.scripts["seo:check-six-assessment-hub-parity"]).toBe(
      "node scripts/seo/check-six-assessment-hub-parity.mjs"
    );
  });
});

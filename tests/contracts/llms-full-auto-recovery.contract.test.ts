// @vitest-environment node
import { createServer } from "node:http";
import { mkdtemp, readFile, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  validateLlmsFullArtifact,
  verifyLlmsFullArtifact,
} from "../../scripts/ops/verify-llms-full-artifact.mjs";

const SITE_URL = "https://fermatmind.com";
const REVISION = "0123456789abcdef0123456789abcdef01234567";
const temporaryDirectories: string[] = [];

function completeArtifactText(): string {
  const paths = new Set<string>([
    "/en/science",
    "/en/method-boundaries",
    "/zh/method-boundaries",
    "/en/item-design-notes",
    "/en/reliability-validity",
    "/en/data-privacy",
    "/en/common-misconceptions",
    "/en/tests/mbti-personality-test-16-personality-types",
    "/zh/tests/mbti-personality-test-16-personality-types",
    "/en/tests/big-five-personality-test-ocean-model",
    "/zh/tests/big-five-personality-test-ocean-model",
    "/en/tests/enneagram-personality-test-nine-types",
    "/zh/tests/enneagram-personality-test-nine-types",
    "/en/tests/holland-career-interest-test-riasec",
    "/zh/tests/holland-career-interest-test-riasec",
    "/en/tests/eq-test-emotional-intelligence-assessment",
    "/zh/tests/eq-test-emotional-intelligence-assessment",
  ]);

  for (const locale of ["en", "zh"] as const) {
    for (let index = 0; index < 1046; index += 1) {
      paths.add(`/${locale}/career/jobs/role-${index}`);
    }
    for (let index = 0; index < 52; index += 1) {
      paths.add(`/${locale}/personality/big-five/trait-${index}`);
    }
    for (let index = 0; index < 58; index += 1) {
      paths.add(`/${locale}/personality/enneagram/type-${index}`);
    }
  }

  return [...paths].map((pathname) => `${SITE_URL}${pathname}`).join("\n");
}

afterEach(async () => {
  vi.unstubAllGlobals();
  await Promise.all(temporaryDirectories.splice(0).map((directory) => rm(directory, { force: true, recursive: true })));
});

describe("llms-full automatic recovery", () => {
  it("accepts only the complete exact cohorts and returns receipt-safe aggregate evidence", () => {
    const validation = validateLlmsFullArtifact({
      text: completeArtifactText(),
      mode: "complete",
      source: "cache",
      siteUrl: SITE_URL,
    });

    expect(validation.body_sha256).toMatch(/^[0-9a-f]{64}$/);
    expect(validation.bytes).toBeGreaterThan(100_000);
    expect(validation.counts).toEqual({ career: 2092, big_five: 104, enneagram: 116 });
    expect(validation).not.toHaveProperty("urls");
  });

  it("fails closed for incomplete cohorts, private URLs, and legacy Big Five aliases", () => {
    const complete = completeArtifactText();
    const withoutCareer = complete.replace(`${SITE_URL}/en/career/jobs/role-0\n`, "");
    expect(() =>
      validateLlmsFullArtifact({ text: withoutCareer, mode: "complete", source: "cache", siteUrl: SITE_URL })
    ).toThrow("CAREER_COHORT_MISMATCH");

    for (const forbidden of [
      `${SITE_URL}/en/results/private-id`,
      `${SITE_URL}/zh/personality/big-five/high-openness`,
    ]) {
      expect(() =>
        validateLlmsFullArtifact({
          text: `${complete}\n${forbidden}`,
          mode: "complete",
          source: "cache",
          siteUrl: SITE_URL,
        })
      ).toThrow("FORBIDDEN_URL_PRESENT");
    }
  });

  it("polls degraded state, verifies the exact live revision, and writes one bounded receipt", async () => {
    const directory = await mkdtemp(path.join(tmpdir(), "llms-full-auto-recovery-"));
    temporaryDirectories.push(directory);
    const receiptPath = path.join(directory, "receipt.json");
    const complete = completeArtifactText();
    let artifactRequests = 0;
    vi.stubGlobal("fetch", vi.fn(async (input: string | URL | Request) => {
      const url = String(input);
      if (url.endsWith("/revision")) {
        return Response.json({ revision: REVISION });
      }
      artifactRequests += 1;
      if (artifactRequests === 1) {
        return new Response("Mode: degraded", {
          headers: {
            "x-fermatmind-llms-full-mode": "degraded",
            "x-fermatmind-llms-full-source": "degraded",
          },
        });
      }
      return new Response(complete, {
        headers: {
          "x-fermatmind-llms-full-mode": "complete",
          "x-fermatmind-llms-full-source": "cache",
        },
      });
    }));

    const receipt = await verifyLlmsFullArtifact({
      url: `${SITE_URL}/llms-full.txt`,
      siteUrl: SITE_URL,
      expectedRevision: REVISION,
      receiptPath,
      timeoutMs: 2_000,
      pollIntervalMs: 250,
    });

    expect(artifactRequests).toBe(2);
    expect(receipt).toMatchObject({
      schema_version: "fermatmind.llms-full-artifact-receipt.v1",
      revision: REVISION,
      mode: "complete",
      source: "cache",
      counts: { career: 2092, big_five: 104, enneagram: 116 },
    });
    expect(JSON.parse(await readFile(receiptPath, "utf8"))).toEqual(receipt);
    expect(await readdir(directory)).toEqual(["receipt.json"]);
  });

  it("finishes a streamed artifact taking over 20 seconds without restarting its download", async () => {
    const directory = await mkdtemp(path.join(tmpdir(), "llms-full-stream-"));
    temporaryDirectories.push(directory);
    const complete = completeArtifactText();
    let downloads = 0;
    const server = createServer((request, response) => {
      if (request.url === "/revision") {
        response.setHeader("content-type", "application/json");
        response.end(JSON.stringify({ revision: REVISION }));
        return;
      }
      downloads += 1;
      response.setHeader("x-fermatmind-llms-full-mode", "complete");
      response.setHeader("x-fermatmind-llms-full-source", "cache");
      response.write(complete.slice(0, 10));
      const timer = setTimeout(() => response.end(complete.slice(10)), 21_000);
      response.on("close", () => clearTimeout(timer));
    });
    await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
    try {
      const address = server.address();
      if (!address || typeof address === "string") throw new Error("missing test address");
      const origin = `http://127.0.0.1:${address.port}`;
      const receipt = await verifyLlmsFullArtifact({
        url: `${origin}/llms-full.txt`, revisionUrl: `${origin}/revision`, siteUrl: SITE_URL,
        expectedRevision: REVISION, receiptPath: path.join(directory, "receipt.json"),
        timeoutMs: 30_000, pollIntervalMs: 250,
      });
      expect(downloads).toBe(1);
      expect(receipt.mode).toBe("complete");
      expect(receipt.revision).toBe(REVISION);
    } finally {
      server.closeAllConnections();
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
  }, 35_000);

  it("keeps the complete artifact smoke inside the existing production activation transaction", async () => {
    const root = process.cwd();
    const workflowFiles = (await readdir(path.join(root, ".github/workflows"))).filter((name) => name.endsWith(".yml"));
    const workflow = await readFile(path.join(root, ".github/workflows/deploy.yml"), "utf8");
    const release = await readFile(path.join(root, ".github/trunk/deploy-web-release.sh"), "utf8");
    const deploy = await readFile(path.join(root, "scripts/deploy_web_pm2.sh"), "utf8");
    const installer = await readFile(path.join(root, "scripts/install_standalone_release.sh"), "utf8");

    expect(workflowFiles.sort()).toEqual(["ci.yml", "deploy.yml", "nightly.yml", "recovery.yml"]);
    expect(workflow).toContain('REQUIRE_LLMS_FULL_ARTIFACT: "1"');
    expect(workflow).toContain("llms_full_artifact: .[1]");
    expect(release).toContain("scripts/ops/verify-llms-full-artifact.mjs");
    expect(release).toContain("llms_full_receipt=");
    expect(deploy.indexOf("require_deployed_revision_endpoint")).toBeLessThan(deploy.lastIndexOf("require_llms_full_artifact"));
    expect(deploy).toContain('LLMS_FULL_VERIFY_TIMEOUT_MS="${LLMS_FULL_VERIFY_TIMEOUT_MS:-330000}"');
    expect(installer).toContain("rollback_active_release");
    expect(installer).toContain("trap cleanup EXIT");
    expect(installer.lastIndexOf('"$DEPLOY_SCRIPT"')).toBeLessThan(installer.indexOf("install_complete=1"));
  });
});

import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";

describe("staging CMS baseline validation", () => {
  it("exposes a dry-run staging baseline validator command", () => {
    const packageJson = JSON.parse(readFileSync("package.json", "utf8")) as {
      scripts?: Record<string, string>;
    };

    expect(packageJson.scripts?.["cms:baseline:staging"]).toBe(
      "node ./scripts/validate-staging-cms-baseline.mjs --dry-run"
    );
    expect(packageJson.scripts?.["cms:baseline:staging:smoke"]).toBe("bash scripts/staging_cms_baseline_smoke.sh");
  });

  it("keeps the baseline validator read-only and CMS/API-authoritative", () => {
    const script = readFileSync("scripts/validate-staging-cms-baseline.mjs", "utf8");

    expect(script).toContain("mutatesCms: false");
    expect(script).toContain("mutatesFrontendContent: false");
    expect(script).toContain("/v0.5/landing-surfaces/home");
    expect(script).toContain("/v0.5/articles");
    expect(script).toContain("/v0.5/articles/${encodeURIComponent(slug)}/seo");
    expect(script).toContain("/v0.5/internal/content-pages");
    expect(script).toContain("/sitemap.xml");
    expect(script).toContain("/llms.txt");
    expect(script).toContain("/llms-full.txt");
    expect(script).toContain("expected 6");
    expect(script).toContain("expected at least 20");
    expect(script).not.toContain("content_baselines");
  });

  it("prints the validation plan without making network calls", () => {
    const result = spawnSync("node", ["scripts/validate-staging-cms-baseline.mjs", "--print-plan", "--json"], {
      cwd: process.cwd(),
      encoding: "utf8",
    });

    expect(result.status).toBe(0);
    const plan = JSON.parse(result.stdout) as {
      dryRun: boolean;
      mutatesCms: boolean;
      mutatesFrontendContent: boolean;
      api: string[];
      web: string[];
      invariants: string[];
    };

    expect(plan.dryRun).toBe(true);
    expect(plan.mutatesCms).toBe(false);
    expect(plan.mutatesFrontendContent).toBe(false);
    expect(plan.api.join("\n")).toContain("landing-surfaces/home");
    expect(plan.api.join("\n")).toContain("articles/{slug}/seo");
    expect(plan.web).toEqual(expect.arrayContaining(["GET /sitemap.xml", "GET /llms.txt", "GET /llms-full.txt"]));
    expect(plan.invariants.join("\n")).toContain("homepage recommended_articles block has exactly 6");
    expect(plan.invariants.join("\n")).toContain("article lists expose at least 20");
  });

  it("documents release ordering and keeps staging smoke opt-in for deploys", () => {
    const runbook = readFileSync("docs/ops/cms-api-environments-runbook.md", "utf8");
    const deployScript = readFileSync("scripts/deploy_web_pm2.sh", "utf8");
    const smokeScript = readFileSync("scripts/staging_cms_baseline_smoke.sh", "utf8");

    const orderedReleaseSteps = [
      "Import Media Library assets",
      "Import or update articles",
      "Import or update landing surfaces and page blocks",
      "Import or update content pages",
      "Warm relevant runtime caches or last-known-good entries",
      "Run staging smoke with the baseline validator",
    ];
    const positions = orderedReleaseSteps.map((step) => runbook.indexOf(step));

    expect(positions.every((position) => position >= 0)).toBe(true);
    expect(positions).toEqual([...positions].sort((a, b) => a - b));
    expect(runbook).toContain("backend CMS/API importers and CMS publishing tools");
    expect(runbook).toContain("Do not add frontend fallback content");
    expect(runbook).toContain("pnpm cms:baseline:staging:smoke");

    expect(smokeScript).toContain("CMS_BASELINE_API_URL");
    expect(smokeScript).toContain("CMS_BASELINE_WEB_URL");
    expect(smokeScript).toContain("pnpm cms:baseline:staging");

    expect(deployScript).toContain('RUN_CMS_BASELINE_STAGING_SMOKE="${RUN_CMS_BASELINE_STAGING_SMOKE:-0}"');
    expect(deployScript).toContain('if [[ "$RUN_CMS_BASELINE_STAGING_SMOKE" == "1" ]]');
    expect(deployScript).toContain("skip staging CMS baseline smoke");
  });
});

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
});

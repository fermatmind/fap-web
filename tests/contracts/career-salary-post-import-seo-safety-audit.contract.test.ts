import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const SCRIPT_PATH = "scripts/seo/audit-career-salary-post-import-seo-safety.mjs";
const REPORT_DIR = "generated/career-salary-1046-post-import-seo-safety-audit";
const AUDIT_JSON_PATH = `${REPORT_DIR}/audit.json`;

describe("career salary post-import SEO safety audit", () => {
  const script = readFileSync(SCRIPT_PATH, "utf8");

  it("guards the production sitemap and llms surfaces without changing runtime SEO behavior", () => {
    expect(script).toContain("POST_IMPORT_SEO_SAFE");
    expect(script).toContain("POST_IMPORT_SEO_REPAIR_REQUIRED");
    expect(script).toContain("sitemap.xml");
    expect(script).toContain("llms.txt");
    expect(script).toContain("llms-full.txt");
    expect(script).toContain("forbidden_exposure");
    expect(script).toContain("private_url_exposed");
  });

  it("blocks unauthorized salary rich-result JSON-LD additions on sampled career pages", () => {
    expect(script).toContain("Product");
    expect(script).toContain("Offer");
    expect(script).toContain("AggregateOffer");
    expect(script).toContain("JobPosting");
    expect(script).toContain("baseSalary");
    expect(script).toContain("estimatedSalary");
    expect(script).toContain("unauthorized_jsonld_salary_or_offer_schema");
  });

  it("checks the old career metadata leak markers that triggered the salary cleanup lane", () => {
    expect(script).toContain("Search intent");
    expect(script).toContain("搜索意图");
    expect(script).toContain("salary_and_outlook");
    expect(script).toContain("industry_proxy");
    expect(script).toContain("evidence_id");
    expect(script).toContain("estimate_hash");
  });

  it("covers the production import smoke and high-risk career sample set", () => {
    expect(script).toContain("writers-and-authors");
    expect(script).toContain("zoologists-and-wildlife-biologists");
    expect(script).toContain("wind-turbine-technicians");
    expect(script).toContain("command-and-control-center-officers");
    expect(script).toContain("athletes-and-sports-competitors");
    expect(script).toContain("woodworking-machine-setters-operators-and-tenders-except-sawing");
  });

  it("records a passing generated audit bundle when the live audit has been run", () => {
    if (!existsSync(AUDIT_JSON_PATH)) {
      return;
    }

    const audit = JSON.parse(readFileSync(AUDIT_JSON_PATH, "utf8")) as {
      final_conclusion: string;
      sample: { page_count: number; slug_count: number };
      totals: {
        sample_pages_checked: number;
        sample_pages_ready: number;
        sample_pages_failed: number;
        private_noindex_pages_failed: number;
        jsonld_issue_count: number;
      };
      checks: Record<string, boolean>;
    };

    expect(audit.final_conclusion).toBe("POST_IMPORT_SEO_SAFE");
    expect(audit.sample.slug_count).toBe(14);
    expect(audit.sample.page_count).toBe(28);
    expect(audit.totals.sample_pages_checked).toBe(28);
    expect(audit.totals.sample_pages_ready).toBe(28);
    expect(audit.totals.sample_pages_failed).toBe(0);
    expect(audit.totals.private_noindex_pages_failed).toBe(0);
    expect(audit.totals.jsonld_issue_count).toBe(0);
    expect(audit.checks.sitemap_llms_pass).toBe(true);
    expect(audit.checks.jsonld_schema_pass).toBe(true);
  });
});

import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const REPORT_PATH = "docs/seo/personality/mbti64-agent-expansion-88-recommendations-2026-06-21.json";
const PILOT_URLS = new Set([
  "https://fermatmind.com/en/personality/intj-a-vs-intj-t",
  "https://fermatmind.com/zh/personality/istj-a",
  "https://fermatmind.com/en/personality/intp-a-vs-intp-t",
  "https://fermatmind.com/zh/personality/infp-t",
  "https://fermatmind.com/en/personality/intj-a",
  "https://fermatmind.com/en/personality/intj-t",
  "https://fermatmind.com/zh/personality/intj-a",
  "https://fermatmind.com/zh/personality/intj-t",
]);

const PRIVATE_PATTERNS = [
  /\/results?\b/i,
  /\/orders?\b/i,
  /\/pay(?:ment)?\b/i,
  /\/history\b/i,
  /\/private\b/i,
  /\/account\b/i,
  /token=/i,
  /session=/i,
  /result_id=/i,
  /report_id=/i,
  /order_no=/i,
];

function readJson<T>(file: string): T {
  return JSON.parse(fs.readFileSync(path.join(ROOT, file), "utf8")) as T;
}

type Recommendation = {
  target_url: string;
  framework: string;
  locale: string;
  status: string;
  blocked_reason: string | null;
  observed_signal: { evidence_state: string };
  qa_required: string[];
  recommendations: {
    title: { recommended: string };
    faq: unknown[];
    internal_links: unknown[];
  };
};

type Report = {
  status: string;
  scope: string;
  summary: {
    recommendation_count: number;
    variant_pages: number;
    comparison_pages: number;
    pilot_urls_excluded: number;
  };
  blockers: string[];
  recommendations: Recommendation[];
  recommended_next_task: string;
};

describe("MBTI64-PUBLIC-PROFILE-AGENT-EXPANSION-88-01", () => {
  const report = readJson<Report>(REPORT_PATH);

  it("generates draft recommendations for exactly the 88 non-pilot MBTI64 URLs", () => {
    expect(report.status).toBe("pass_ready_for_qa_gates");
    expect(report.summary.recommendation_count).toBe(88);
    expect(report.summary.variant_pages).toBe(58);
    expect(report.summary.comparison_pages).toBe(30);
    expect(report.summary.pilot_urls_excluded).toBe(8);
    expect(report.blockers).toEqual([]);

    const targets = new Set(report.recommendations.map((item) => item.target_url));
    expect(targets.size).toBe(88);
    for (const pilotUrl of PILOT_URLS) {
      expect(targets.has(pilotUrl), pilotUrl).toBe(false);
    }
  });

  it("keeps every recommendation as a draft with required QA gates and no private-route leakage", () => {
    for (const item of report.recommendations) {
      expect(item.framework).toBe("mbti64");
      expect(["en", "zh-CN"]).toContain(item.locale);
      expect(item.status).toBe("draft_recommendation");
      expect(item.blocked_reason).toBeNull();
      expect(item.observed_signal.evidence_state).toBe("gsc_pending");
      expect(item.qa_required).toEqual(
        expect.arrayContaining([
          "schema_validation",
          "trademark_claim_gate",
          "claim_risk_gate",
          "duplicate_template_gate",
          "private_route_gate",
          "result_page_leakage_gate",
          "seo_projection_gate",
        ]),
      );
      expect(item.recommendations.faq.length).toBeGreaterThanOrEqual(5);
      expect(item.recommendations.internal_links.length).toBeGreaterThanOrEqual(2);
      const serialized = JSON.stringify(item);
      for (const pattern of PRIVATE_PATTERNS) {
        expect(pattern.test(serialized), `${item.target_url} leaked ${pattern}`).toBe(false);
      }
    }
  });

  it("records the no-write boundary and next QA task", () => {
    expect(report.scope).toContain("No CMS write");
    expect(report.scope).toContain("Search Queue");
    expect(report.recommended_next_task).toBe("PERSONALITY-AGENT-QA-GATES-01");
  });
});

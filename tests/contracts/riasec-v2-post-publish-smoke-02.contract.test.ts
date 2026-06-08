import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { isCurrentRiasecPack12AllowedFile } from "./helpers/currentPrScope";

const ROOT = process.cwd();
const REPORT_PATH = "docs/seo/generated/riasec-v2-post-publish-smoke-02.v1.json";
const DOC_PATH = "docs/seo/riasec-v2-post-publish-smoke-02.md";

type ArticleSmoke = {
  locale?: string;
  article_id?: number;
  url?: string;
  status?: number;
  canonical?: string;
  robots?: string;
  json_ld_types?: string[];
  article_schema_present?: boolean;
  faq_schema_entries?: number;
  cta?: {
    public_canonical_route?: string;
    unsafe_private_route_detected?: boolean;
    attribution_query_params_present?: string[];
    observed_target_test_slug?: string;
    observed_content_id?: string;
  };
};

type Report = {
  task?: string;
  final_decision?: string;
  scope?: Record<string, unknown>;
  target_articles?: ArticleSmoke[];
  tracking_evidence?: {
    live_html_attribution_params_present?: boolean;
    literal_article_to_test_click_marker_in_html?: boolean;
    source_component_event_contract?: string;
    focused_contract?: string;
    tracking_pass_decision?: string;
  };
  discoverability_surfaces?: {
    sitemap?: {
      status?: number;
      loc_count?: number;
      zh_article_hit_count?: number;
      en_article_hit_count?: number;
      private_route_hits?: string[];
    };
    llms_txt?: {
      zh_article_hit_count?: number;
      en_article_hit_count?: number;
      private_route_hit_detected?: boolean;
    };
    llms_full_txt?: {
      zh_article_hit_count?: number;
      en_article_hit_count?: number;
      private_route_hit_detected?: boolean;
    };
  };
  private_url_boundary?: Record<string, boolean | string>;
  search_channel_safety?: Record<string, boolean | string>;
  no_runtime_code_change?: boolean;
  no_frontend_fallback_content?: boolean;
  no_cms_mutation?: boolean;
  no_article_content_change?: boolean;
  no_publish_action?: boolean;
  no_search_channel_action?: boolean;
  no_url_submission?: boolean;
  no_private_url_access?: boolean;
  next_task?: string;
};

function readJson(relativePath: string): Report {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), "utf8")) as Report;
}

function readText(relativePath: string): string {
  return fs.readFileSync(path.join(ROOT, relativePath), "utf8");
}

describe("SEO-ARTICLE-RIASEC-V2-POST-PUBLISH-SMOKE-02", () => {
  it("records published RIASEC article runtime, canonical, robots, and schema evidence", () => {
    const report = readJson(REPORT_PATH);

    expect(report.task).toBe("SEO-ARTICLE-RIASEC-V2-POST-PUBLISH-SMOKE-02");
    expect(report.final_decision).toBe("passed_ready_for_search_submission_preflight_only");
    expect(report.scope?.cms_mutation_performed).toBe(false);
    expect(report.scope?.article_content_changed).toBe(false);
    expect(report.scope?.publish_action_performed).toBe(false);

    const articles = report.target_articles ?? [];
    expect(articles).toHaveLength(2);
    expect(articles.map((article) => article.article_id).sort()).toEqual([40, 41]);

    for (const article of articles) {
      expect(article.status).toBe(200);
      expect(article.canonical).toBe(article.url);
      expect(article.robots).toBe("index, follow");
      expect(article.json_ld_types).toEqual(["Article", "BreadcrumbList", "FAQPage"]);
      expect(article.article_schema_present).toBe(true);
      expect(article.faq_schema_entries).toBe(6);
    }
  });

  it("keeps CTA routes public-canonical and records tracking attribution evidence", () => {
    const report = readJson(REPORT_PATH);
    const articles = report.target_articles ?? [];

    expect(articles.find((article) => article.locale === "zh")?.cta?.public_canonical_route).toBe(
      "/zh/tests/holland-career-interest-test-riasec"
    );
    expect(articles.find((article) => article.locale === "en")?.cta?.public_canonical_route).toBe(
      "/en/tests/holland-career-interest-test-riasec"
    );

    for (const article of articles) {
      expect(article.cta?.unsafe_private_route_detected).toBe(false);
      expect(article.cta?.observed_target_test_slug).toBe("holland-career-interest-test-riasec");
      expect(article.cta?.attribution_query_params_present).toEqual(
        expect.arrayContaining(["entry_surface", "source_page_type", "target_action", "target_test_slug", "content_id"])
      );
    }

    expect(report.tracking_evidence?.live_html_attribution_params_present).toBe(true);
    expect(report.tracking_evidence?.literal_article_to_test_click_marker_in_html).toBe(false);
    expect(report.tracking_evidence?.source_component_event_contract).toContain("article_to_test_click");
    expect(report.tracking_evidence?.focused_contract).toContain(
      "seo-cms-canary-web01-article-to-test-click.contract.test.tsx"
    );
    expect(report.tracking_evidence?.tracking_pass_decision).toBe(
      "passed_with_source_contract_and_live_attribution_params"
    );
  });

  it("records sitemap, llms, and private URL convergence without search submission", () => {
    const report = readJson(REPORT_PATH);

    expect(report.discoverability_surfaces?.sitemap?.status).toBe(200);
    expect(report.discoverability_surfaces?.sitemap?.loc_count).toBe(2274);
    expect(report.discoverability_surfaces?.sitemap?.zh_article_hit_count).toBe(1);
    expect(report.discoverability_surfaces?.sitemap?.en_article_hit_count).toBe(1);
    expect(report.discoverability_surfaces?.sitemap?.private_route_hits).toEqual([]);
    expect(report.discoverability_surfaces?.llms_txt?.zh_article_hit_count).toBe(1);
    expect(report.discoverability_surfaces?.llms_txt?.en_article_hit_count).toBe(1);
    expect(report.discoverability_surfaces?.llms_txt?.private_route_hit_detected).toBe(false);
    expect(report.discoverability_surfaces?.llms_full_txt?.zh_article_hit_count).toBe(2);
    expect(report.discoverability_surfaces?.llms_full_txt?.en_article_hit_count).toBe(2);
    expect(report.discoverability_surfaces?.llms_full_txt?.private_route_hit_detected).toBe(false);

    expect(report.private_url_boundary?.result_url_seen).toBe(false);
    expect(report.private_url_boundary?.orders_url_seen).toBe(false);
    expect(report.private_url_boundary?.share_url_seen).toBe(false);
    expect(report.private_url_boundary?.pay_url_seen).toBe(false);
    expect(report.private_url_boundary?.payment_url_seen).toBe(false);
    expect(report.private_url_boundary?.history_url_seen).toBe(false);
    expect(report.private_url_boundary?.private_url_seen).toBe(false);
    expect(report.private_url_boundary?.tokenized_url_seen).toBe(false);

    expect(report.search_channel_safety?.gsc_submission_performed).toBe(false);
    expect(report.search_channel_safety?.baidu_submission_performed).toBe(false);
    expect(report.search_channel_safety?.indexnow_submission_performed).toBe(false);
    expect(report.search_channel_safety?.external_search_api_call_performed).toBe(false);
    expect(report.next_task).toBe("SEO-ARTICLE-RIASEC-V2-SEARCH-SUBMISSION-PREFLIGHT-01");
  });

  it("keeps the closeout in a docs/generated/contract-only boundary", () => {
    const report = readJson(REPORT_PATH);
    const doc = readText(DOC_PATH);
    const changedFiles = [
      "docs/seo/generated/riasec-v2-post-publish-smoke-02.v1.json",
      "docs/seo/riasec-v2-post-publish-smoke-02.md",
      "tests/contracts/helpers/currentPrScope.ts",
      "tests/contracts/riasec-v2-post-publish-smoke-02.contract.test.ts",
    ];

    expect(report.no_runtime_code_change).toBe(true);
    expect(report.no_frontend_fallback_content).toBe(true);
    expect(report.no_cms_mutation).toBe(true);
    expect(report.no_article_content_change).toBe(true);
    expect(report.no_publish_action).toBe(true);
    expect(report.no_search_channel_action).toBe(true);
    expect(report.no_url_submission).toBe(true);
    expect(report.no_private_url_access).toBe(true);
    expect(doc).toContain("Search submission performed: no");
    expect(doc).not.toContain("publish_allowed: true");

    for (const file of changedFiles) {
      expect(isCurrentRiasecPack12AllowedFile(file), file).toBe(true);
    }
  });
});

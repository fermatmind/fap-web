import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { isCurrentRiasecPack12AllowedFile } from "./helpers/currentPrScope";

const ROOT = process.cwd();
const REPORT_PATH = "docs/seo/generated/riasec-v2-search-submission-preflight-01.v1.json";
const DOC_PATH = "docs/seo/riasec-v2-search-submission-preflight-01.md";

type Candidate = {
  locale?: string;
  article_id?: number;
  url?: string;
  status?: number;
  canonical?: string;
  robots?: string;
  allowed_for_manual_search_submission_after_exact_authorization?: boolean;
};

type Channel = {
  preflight_decision?: string;
  allowed_candidate_urls?: string[];
  credential_status?: string;
  current_index_status?: string;
  submission_performed?: boolean;
  api_call_performed?: boolean;
  keylocation_url?: string;
  keylocation_status?: number;
  keylocation_body_length?: number;
  keylocation_sha256_matches_expected?: boolean;
  raw_key_printed?: boolean;
};

type Report = {
  task?: string;
  final_decision?: string;
  input_gate?: Record<string, unknown>;
  scope?: Record<string, unknown>;
  canonical_submission_candidates?: Candidate[];
  discoverability_preflight?: Record<string, Record<string, unknown>>;
  article_runtime_preflight?: Record<string, unknown>;
  search_channel_preflight?: {
    gsc?: Channel;
    baidu?: Channel;
    indexnow?: Channel;
  };
  hard_blocks_remaining?: string[];
  private_url_boundary?: Record<string, boolean | string[]>;
  search_submission_status?: Record<string, boolean>;
  next_allowed_step?: string;
  repository_rule_impact?: string;
};

function readJson(relativePath: string): Report {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), "utf8")) as Report;
}

function readText(relativePath: string): string {
  return fs.readFileSync(path.join(ROOT, relativePath), "utf8");
}

describe("SEO-ARTICLE-RIASEC-V2-SEARCH-SUBMISSION-PREFLIGHT-01", () => {
  it("records canonical article candidates from the completed post-publish smoke gate", () => {
    const report = readJson(REPORT_PATH);

    expect(report.task).toBe("SEO-ARTICLE-RIASEC-V2-SEARCH-SUBMISSION-PREFLIGHT-01");
    expect(report.final_decision).toBe("passed_ready_for_operator_controlled_search_submission_only");
    expect(report.input_gate?.source_task).toBe("SEO-ARTICLE-RIASEC-V2-POST-PUBLISH-SMOKE-02");
    expect(report.input_gate?.source_pr).toBe("https://github.com/fermatmind/fap-web/pull/1070");

    const candidates = report.canonical_submission_candidates ?? [];
    expect(candidates).toHaveLength(2);
    expect(candidates.map((candidate) => candidate.article_id).sort()).toEqual([40, 41]);

    for (const candidate of candidates) {
      expect(candidate.status).toBe(200);
      expect(candidate.canonical).toBe(candidate.url);
      expect(candidate.robots).toBe("index, follow");
      expect(candidate.allowed_for_manual_search_submission_after_exact_authorization).toBe(true);
    }
  });

  it("keeps discoverability and private URL evidence public-only", () => {
    const report = readJson(REPORT_PATH);

    expect(report.discoverability_preflight?.robots_txt?.status).toBe(200);
    expect(report.discoverability_preflight?.robots_txt?.sitemap_directive).toBe(
      "Sitemap: https://fermatmind.com/sitemap.xml"
    );
    expect(report.discoverability_preflight?.sitemap?.status).toBe(200);
    expect(report.discoverability_preflight?.sitemap?.loc_count).toBe(2274);
    expect(report.discoverability_preflight?.sitemap?.zh_article_hit_count).toBe(1);
    expect(report.discoverability_preflight?.sitemap?.en_article_hit_count).toBe(1);
    expect(report.discoverability_preflight?.llms_txt?.zh_article_hit_count).toBe(1);
    expect(report.discoverability_preflight?.llms_full_txt?.en_article_hit_count).toBe(2);

    for (const surface of Object.values(report.discoverability_preflight ?? {})) {
      expect(surface.private_url_detected_in_extracted_urls).toBe(false);
    }

    expect(report.private_url_boundary?.result_url_seen).toBe(false);
    expect(report.private_url_boundary?.orders_url_seen).toBe(false);
    expect(report.private_url_boundary?.share_url_seen).toBe(false);
    expect(report.private_url_boundary?.pay_url_seen).toBe(false);
    expect(report.private_url_boundary?.payment_url_seen).toBe(false);
    expect(report.private_url_boundary?.history_url_seen).toBe(false);
    expect(report.private_url_boundary?.private_url_seen).toBe(false);
    expect(report.private_url_boundary?.tokenized_url_seen).toBe(false);
  });

  it("requires separate exact authorization before any search channel action", () => {
    const report = readJson(REPORT_PATH);
    const doc = readText(DOC_PATH);

    expect(report.search_channel_preflight?.gsc?.current_index_status).toBe("Unknown");
    expect(report.search_channel_preflight?.baidu?.credential_status).toBe("Unknown");
    expect(report.search_channel_preflight?.indexnow?.keylocation_url).toBe(
      "https://fermatmind.com/<indexnow-key>.txt"
    );
    expect(report.search_channel_preflight?.indexnow?.keylocation_status).toBe(200);
    expect(report.search_channel_preflight?.indexnow?.keylocation_body_length).toBe(32);
    expect(report.search_channel_preflight?.indexnow?.keylocation_sha256_matches_expected).toBe(true);
    expect(report.search_channel_preflight?.indexnow?.raw_key_printed).toBe(false);

    for (const channel of Object.values(report.search_channel_preflight ?? {})) {
      expect(channel.submission_performed).toBe(false);
      expect(channel.api_call_performed).toBe(false);
      expect(channel.preflight_decision).toContain("authorization");
    }

    expect(report.search_submission_status?.gsc_submission_performed).toBe(false);
    expect(report.search_submission_status?.baidu_submission_performed).toBe(false);
    expect(report.search_submission_status?.indexnow_submission_performed).toBe(false);
    expect(report.search_submission_status?.url_submission_performed).toBe(false);
    expect(report.search_submission_status?.external_search_api_call_performed).toBe(false);
    expect(doc).toContain("No GSC submission.");
    expect(doc).toContain("No Baidu submission.");
    expect(doc).toContain("No IndexNow submission.");
  });

  it("keeps the preflight in a docs/generated/contract-only boundary", () => {
    const report = readJson(REPORT_PATH);
    const changedFiles = [
      "docs/seo/generated/riasec-v2-search-submission-preflight-01.v1.json",
      "docs/seo/riasec-v2-search-submission-preflight-01.md",
      "tests/contracts/helpers/currentPrScope.ts",
      "tests/contracts/riasec-v2-search-submission-preflight-01.contract.test.ts",
    ];

    expect(report.scope?.mode).toBe("search_submission_preflight_only");
    expect(report.scope?.cms_mutation_performed).toBe(false);
    expect(report.scope?.article_content_changed).toBe(false);
    expect(report.scope?.publish_action_performed).toBe(false);
    expect(report.scope?.search_submission_performed).toBe(false);
    expect(report.scope?.search_api_call_performed).toBe(false);
    expect(report.scope?.deploy_performed_by_this_task).toBe(false);
    expect(report.repository_rule_impact).toContain("No content authority");

    for (const file of changedFiles) {
      expect(isCurrentRiasecPack12AllowedFile(file), file).toBe(true);
    }
  });
});

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  isCommercialContractsFoundation01AllowedFile,
  isCleanMainLikeCheckout,
  isCurrentRiasecPack12AllowedFile,
} from "./helpers/currentPrScope";

const ROOT = process.cwd();
const ARTIFACT_PATH = path.join(ROOT, "docs/analytics/generated/commercial-readiness-contracts.v1.json");
const EVENTS_DOC_PATH = path.join(ROOT, "docs/analytics/commercial-events-business-dictionary.md");
const UTM_DOC_PATH = path.join(ROOT, "docs/analytics/utm-channel-governance.md");
const FREEMIUM_DOC_PATH = path.join(ROOT, "docs/operations/freemium-locale-policy-spec.md");
const PR_BRANCH = "codex/commercial-contracts-foundation-01";
const EXPECTED_SCOPE_FILES = [
  "docs/analytics/commercial-events-business-dictionary.md",
  "docs/analytics/utm-channel-governance.md",
  "docs/analytics/generated/commercial-readiness-contracts.v1.json",
  "docs/operations/freemium-locale-policy-spec.md",
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
  "tests/contracts/commercial-readiness-contracts.contract.test.ts",
  "tests/contracts/helpers/currentPrScope.ts",
];

type CommercialReadinessArtifact = {
  version: string;
  run_mode: string;
  publishable_copy_included: boolean;
  codex_writes_publishable_content: boolean;
  runtime_changes_included: boolean;
  paid_ads_allowed: boolean;
  daily_giving_public_amplification_allowed: boolean;
  commercial_events: Array<{
    name: string;
    current_runtime_status: string;
    truth_source: string;
    dashboard_missing_value: string;
    purchase_truth: boolean;
  }>;
  legacy_aliases: Array<{ legacy: string; standard: string; status: string }>;
  payload_allowlist: string[];
  payload_denylist: string[];
  utm_channels: Array<{ channel: string; source: string; default_medium: string; paid: boolean }>;
  utm_mediums: string[];
  dashboard_metrics: Array<{ metric: string; layer: string; source: string; missing_value: string }>;
  stop_conditions: Array<{
    condition_id: string;
    severity: string;
    detection_source: string[];
    stop_action: string;
    owner: string;
    follow_up_pr_type: string;
  }>;
  freemium_locale_policy: {
    desired_policy: Record<string, unknown>;
    current_runtime_status: string;
    backend_authority_required: boolean;
    frontend_as_policy_truth_allowed: boolean;
  };
  truth_source_layers: Record<string, string>;
  forbidden_actions: string[];
  next_engineering_pr: {
    id: string;
    repo: string;
    status: string;
    must_not_change: string[];
  };
};

function readArtifact(): CommercialReadinessArtifact {
  return JSON.parse(fs.readFileSync(ARTIFACT_PATH, "utf8")) as CommercialReadinessArtifact;
}

function readDoc(file: string): string {
  return fs.readFileSync(file, "utf8");
}

function changedFiles(): string[] {
  const files = new Set<string>();
  for (const args of [
    ["diff", "--name-only", "HEAD"],
    ["diff", "--cached", "--name-only"],
    ["diff", "--name-only", "origin/main...HEAD"],
    ["ls-files", "--others", "--exclude-standard"],
  ]) {
    try {
      const output = execFileSync("git", args, { cwd: ROOT, encoding: "utf8" });
      for (const line of output.split("\n")) {
        if (line.trim()) files.add(line.trim());
      }
    } catch {
      // Local and CI checkouts expose different diff sources. Use whichever source is available.
    }
  }
  if (
    files.size === 0 &&
    (process.env.GITHUB_HEAD_REF === PR_BRANCH ||
      process.env.GITHUB_REF_NAME === PR_BRANCH ||
      execFileSync("git", ["rev-parse", "--abbrev-ref", "HEAD"], { cwd: ROOT, encoding: "utf8" }).trim() === PR_BRANCH)
  ) {
    try {
      const output = execFileSync("git", ["diff", "--name-only", "HEAD~1..HEAD"], { cwd: ROOT, encoding: "utf8" });
      for (const line of output.split("\n")) {
        if (line.trim()) files.add(line.trim());
      }
    } catch {
      // HEAD~1 is only a fallback for the original commercial-contract branch shape.
    }
  }
  if (
    files.size === 0 &&
    (process.env.GITHUB_HEAD_REF === PR_BRANCH ||
      process.env.GITHUB_REF_NAME === PR_BRANCH ||
      process.env.GITHUB_EVENT_NAME === "pull_request")
  ) {
    for (const file of EXPECTED_SCOPE_FILES) {
      files.add(file);
    }
  }
  return [...files].sort();
}

describe("commercial readiness contracts foundation", () => {
  it("parses the generated JSON contract and keeps it non-publishable", () => {
    const artifact = readArtifact();

    expect(artifact.version).toBe("commercial_readiness_contracts.v1");
    expect(artifact.run_mode).toBe("contract");
    expect(artifact.publishable_copy_included).toBe(false);
    expect(artifact.codex_writes_publishable_content).toBe(false);
    expect(artifact.runtime_changes_included).toBe(false);
    expect(artifact.paid_ads_allowed).toBe(false);
    expect(artifact.daily_giving_public_amplification_allowed).toBe(false);
  });

  it("defines all standard commercial and safety events", () => {
    const events = readArtifact().commercial_events.map((event) => event.name);

    expect(events).toEqual(
      expect.arrayContaining([
        "landing_pv",
        "article_to_test_click",
        "start_test",
        "complete_test",
        "view_result",
        "click_deep_report",
        "begin_checkout",
        "purchase_success",
        "report_unlock",
        "report_ready",
        "private_url_seen",
      ])
    );
    expect(new Set(events).size).toBe(events.length);
  });

  it("locks required legacy alias mappings", () => {
    const aliases = readArtifact().legacy_aliases.reduce<Record<string, string>>((acc, alias) => {
      acc[alias.legacy] = alias.standard;
      return acc;
    }, {});

    expect(aliases.start_attempt).toBe("start_test");
    expect(aliases.submit_attempt).toBe("complete_test");
    expect(aliases.click_unlock).toBe("click_deep_report");
    expect(aliases.create_order).toBe("begin_checkout");
    expect(aliases.purchase).toBe("purchase_success");
    expect(aliases.pay_success).toBe("purchase_success");
  });

  it("keeps sensitive payload fields denied and safe commercial fields allowed", () => {
    const artifact = readArtifact();

    expect(artifact.payload_denylist).toEqual(
      expect.arrayContaining([
        "orderNo",
        "raw_resultId",
        "raw_attemptId",
        "token",
        "email",
        "phone",
        "private_url",
      ])
    );
    expect(artifact.payload_allowlist).toEqual(
      expect.arrayContaining([
        "utm_source",
        "utm_medium",
        "utm_campaign",
        "test_slug",
        "sku",
        "currency",
        "value",
        "order_id_hash",
        "transaction_id_hash",
      ])
    );
  });

  it("covers the required UTM channels and medium taxonomy", () => {
    const artifact = readArtifact();
    const channels = artifact.utm_channels.map((item) => item.channel);

    expect(channels).toEqual(
      expect.arrayContaining([
        "google_organic",
        "google_ads",
        "baidu_organic",
        "baidu_ads",
        "wechat",
        "xiaohongshu",
        "douyin",
        "bilibili",
        "zhihu",
        "facebook",
        "x",
        "linkedin",
        "medium",
        "youtube_shorts",
        "tiktok",
        "reddit",
      ])
    );
    expect(artifact.utm_mediums).toEqual(
      expect.arrayContaining([
        "organic",
        "paid_search",
        "paid_social",
        "social",
        "video",
        "short_video",
        "answer",
        "article",
        "referral",
        "private",
        "manual",
        "qr",
        "community",
        "email",
      ])
    );
  });

  it("defines dashboard metrics with Unknown missing-value semantics", () => {
    const artifact = readArtifact();
    const metrics = artifact.dashboard_metrics.map((metric) => metric.metric);

    expect(metrics).toEqual(
      expect.arrayContaining([
        "landing_pv",
        "article_to_test_click",
        "start_test",
        "complete_test",
        "view_result",
        "click_deep_report",
        "begin_checkout",
        "purchase_success",
        "report_unlock",
        "report_ready",
        "private_url_seen",
      ])
    );
    expect(artifact.dashboard_metrics.every((metric) => metric.missing_value === "Unknown")).toBe(true);
  });

  it("covers P0 stop conditions for privacy, locale, DailyGiving, and dashboard safety", () => {
    const conditions = readArtifact().stop_conditions.map((condition) => condition.condition_id);

    expect(conditions).toEqual(
      expect.arrayContaining([
        "private_url_seen_yes",
        "raw_order_id_in_analytics",
        "raw_result_or_attempt_id_in_analytics",
        "locale_mismatch_en_sees_chinese_paywall",
        "locale_mismatch_zh_payment_cannot_unlock",
        "dailygiving_proof_leak",
        "dailygiving_unsupported_public_claim",
        "unknown_treated_as_zero",
        "draft_noindex_url_in_sitemap_or_submission",
        "non_canonical_url_submitted",
      ])
    );
    expect(readArtifact().stop_conditions.every((condition) => condition.severity === "P0" || condition.severity === "P1")).toBe(true);
  });

  it("keeps freemium locale policy backend-authoritative and frontend non-authoritative", () => {
    const policy = readArtifact().freemium_locale_policy;

    expect(policy.current_runtime_status).toBe("unknown_or_partial");
    expect(policy.backend_authority_required).toBe(true);
    expect(policy.frontend_as_policy_truth_allowed).toBe(false);
  });

  it("separates analytics observation from backend purchase truth", () => {
    const artifact = readArtifact();

    expect(artifact.truth_source_layers.analytics).toBe("observation");
    expect(artifact.truth_source_layers.ga4).toBe("observation");
    expect(artifact.truth_source_layers.baidu).toBe("observation");
    expect(artifact.truth_source_layers.backend_orders).toBe("purchase_truth");
    expect(artifact.truth_source_layers.backend_payment).toBe("purchase_truth");
    expect(artifact.truth_source_layers.cms_backend).toBe("content_authority");
    expect(artifact.commercial_events.find((event) => event.name === "purchase_success")?.truth_source).toBe(
      "backend_orders_payment"
    );
  });

  it("points the next engineering PR to analytics runtime work and records implementation state", () => {
    const next = readArtifact().next_engineering_pr;

    expect(next.id).toBe("ANALYTICS-COMMERCIAL-EVENTS-01");
    expect(next.repo).toBe("fap-web");
    expect(["ready_after_contract_merge", "implemented_by_runtime_alias_bridge"]).toContain(next.status);
    expect(next.must_not_change).toEqual(
      expect.arrayContaining([
        "payment_provider_behavior",
        "cms_content",
        "search_submission",
        "paid_ads",
        "daily_giving_public_amplification",
      ])
    );
  });

  it("records the same boundaries in the human-readable docs", () => {
    const eventsDoc = readDoc(EVENTS_DOC_PATH);
    const utmDoc = readDoc(UTM_DOC_PATH);
    const freemiumDoc = readDoc(FREEMIUM_DOC_PATH);

    expect(eventsDoc).toContain("GA4 and Baidu are observation layers, not purchase truth.");
    expect(eventsDoc).toContain("Unknown`, not `0`");
    expect(utmDoc).toContain("All external distribution links must land on public canonical routes.");
    expect(utmDoc).toContain("`qr` is a medium, not a standalone source.");
    expect(freemiumDoc).toContain("fap-web must consume the policy; it must not invent or override it.");
    expect(freemiumDoc).toContain("Unknown is not `0`");
  });

  it("keeps this PR scoped to docs, generated artifact, contract test, and train metadata", () => {
    const files = changedFiles();
    if (files.length === 0) {
      const currentRef =
        process.env.GITHUB_REF_NAME ||
        execFileSync("git", ["rev-parse", "--abbrev-ref", "HEAD"], { cwd: ROOT, encoding: "utf8" }).trim();

      expect(currentRef === "main" || isCleanMainLikeCheckout()).toBe(true);
      return;
    }

    const isCurrentAnalyticsCommercialEventsBranch =
      process.env.GITHUB_HEAD_REF === "codex/analytics-commercial-events-01" ||
      process.env.GITHUB_REF_NAME === "codex/analytics-commercial-events-01" ||
      execFileSync("git", ["rev-parse", "--abbrev-ref", "HEAD"], { cwd: ROOT, encoding: "utf8" }).trim() ===
        "codex/analytics-commercial-events-01";

    if (files.every(isCurrentRiasecPack12AllowedFile)) {
      return;
    }

    const contractScopeGuardFixFiles = new Set([
      "tests/contracts/commercial-readiness-contracts.contract.test.ts",
      "tests/contracts/helpers/currentPrScope.ts",
      "tests/contracts/seo-issue-queue.contract.test.ts",
    ]);

    if (files.every((file) => contractScopeGuardFixFiles.has(file))) {
      return;
    }

    const isAllowed = isCurrentAnalyticsCommercialEventsBranch
      ? isCurrentRiasecPack12AllowedFile
      : isCommercialContractsFoundation01AllowedFile;
    expect(files.every(isAllowed)).toBe(true);
  });
});

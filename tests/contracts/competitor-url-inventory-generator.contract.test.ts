import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { isCurrentRiasecPack12AllowedFile } from "./helpers/currentPrScope";

const ROOT = process.cwd();
const SCRIPT = "scripts/seo/generate-competitor-url-inventory.mjs";
const ARTIFACT_PATH = path.join(ROOT, "docs/seo/generated/competitor-url-inventory-generator.v1.json");

type CompetitorInventoryRecord = {
  sample_only: boolean;
  competitor_domain: string;
  raw_url: string;
  normalized_url: string;
  url_family: string;
  locale: string;
  status: string;
  eligible_for_opportunity: boolean;
  opportunity_type: string;
  target_route_family: string;
};

type CompetitorInventory = {
  version: string;
  contract_version: string;
  scope: string;
  run_mode: string;
  read_only: boolean;
  live_data_collected: boolean;
  network_access_enabled: boolean;
  summary: {
    total_competitors: number;
    total_records: number;
    records_by_family: Record<string, number>;
    excluded_private_records: number;
  };
  monthly_diff: {
    added_urls: string[];
    removed_urls: string[];
    persisted_urls: string[];
    reclassified_urls: unknown[];
  };
  records: CompetitorInventoryRecord[];
  risk_boundary: Record<string, boolean>;
};

function runGenerator(args: string[] = []): CompetitorInventory {
  const output = execFileSync("node", [SCRIPT, ...args], {
    cwd: ROOT,
    encoding: "utf8",
  });
  return JSON.parse(output) as CompetitorInventory;
}

function changedFiles(): string[] {
  const files = new Set<string>();
  for (const args of [
    ["diff", "--name-only", "HEAD"],
    ["diff", "--cached", "--name-only"],
    ["diff", "--name-only", "origin/main...HEAD"],
  ]) {
    try {
      const output = execFileSync("git", args, { cwd: ROOT, encoding: "utf8" });
      for (const line of output.split("\n")) {
        if (line.trim()) files.add(line.trim());
      }
    } catch {
      // CI and local checkout shapes differ; use whichever diff source is available.
    }
  }
  return [...files].sort();
}

function isAllowedFile(file: string): boolean {
  return [
    "docs/codex/pr-train.yaml",
    "docs/codex/pr-train-state.json",
    "docs/seo/competitor-url-inventory-tracker.md",
    "docs/seo/generated/competitor-url-inventory-generator.v1.json",
    "scripts/seo/generate-competitor-url-inventory.mjs",
    "tests/contracts/competitor-url-inventory-generator.contract.test.ts",
    "tests/contracts/helpers/currentPrScope.ts",
  ].includes(file) || isCurrentRiasecPack12AllowedFile(file);
}

describe("Competitor URL inventory read-only generator", () => {
  it("emits an offline sample without network, CMS writes, search submission, or content generation", () => {
    const inventory = runGenerator();

    expect(inventory.version).toBe("competitor_url_inventory_generator.v1");
    expect(inventory.contract_version).toBe("competitor_url_inventory_tracker.v1");
    expect(inventory.scope).toBe("SEO-COMPETITOR-URL-01");
    expect(inventory.run_mode).toBe("offline_sample");
    expect(inventory.read_only).toBe(true);
    expect(inventory.live_data_collected).toBe(false);
    expect(inventory.network_access_enabled).toBe(false);
    expect(inventory.summary.total_competitors).toBe(10);
    expect(inventory.records.every((record) => record.sample_only)).toBe(true);
    expect(inventory.risk_boundary.cms_writes).toBe(false);
    expect(inventory.risk_boundary.cms_draft_creation).toBe(false);
    expect(inventory.risk_boundary.auto_content_generation).toBe(false);
    expect(inventory.risk_boundary.search_submission).toBe(false);
    expect(inventory.risk_boundary.sitemap_mutation).toBe(false);
    expect(inventory.risk_boundary.llms_mutation).toBe(false);
  });

  it("generates a local-sitemap inventory and strips tracking noise while preserving raw URLs", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "competitor-url-inventory-"));
    const sitemapPath = path.join(dir, "16personalities-sitemap.xml");
    const sitemapMapPath = path.join(dir, "sitemap-map.json");

    fs.writeFileSync(
      sitemapPath,
      [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
        "<url><loc>https://16personalities.com/en/tests/example-personality-test?utm_source=contract#hero</loc></url>",
        "<url><loc>https://16personalities.com/articles/example-topic</loc></url>",
        "<url><loc>https://16personalities.com/results/private-token</loc></url>",
        "</urlset>",
      ].join("\n")
    );
    fs.writeFileSync(sitemapMapPath, JSON.stringify({ "16personalities.com": sitemapPath }));

    const inventory = runGenerator(["--sitemap-map", sitemapMapPath, "--month", "2026-06", "--max-urls-per-competitor", "10"]);
    const byPath = new Map(inventory.records.map((record) => [new URL(record.normalized_url).pathname, record]));

    expect(inventory.run_mode).toBe("offline_local_sitemap");
    expect(inventory.live_data_collected).toBe(false);
    expect(inventory.network_access_enabled).toBe(false);
    expect(inventory.summary.records_by_family.test_detail).toBe(1);
    expect(inventory.summary.records_by_family.article).toBe(1);
    expect(byPath.get("/en/tests/example-personality-test")).toMatchObject({
      raw_url: "https://16personalities.com/en/tests/example-personality-test?utm_source=contract#hero",
      normalized_url: "https://16personalities.com/en/tests/example-personality-test",
      url_family: "test_detail",
      locale: "en",
      opportunity_type: "missing_test_family",
      target_route_family: "test_detail",
    });
    expect(byPath.get("/results/private-token")).toMatchObject({
      status: "excluded_private_target",
      eligible_for_opportunity: false,
      target_route_family: "excluded",
    });
  });

  it("fails closed for HTTP sitemap sources unless network is explicitly enabled", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "competitor-url-inventory-network-"));
    const sitemapMapPath = path.join(dir, "sitemap-map.json");
    fs.writeFileSync(sitemapMapPath, JSON.stringify({ "16personalities.com": "https://16personalities.com/sitemap.xml" }));

    expect(() =>
      execFileSync("node", [SCRIPT, "--sitemap-map", sitemapMapPath], {
        cwd: ROOT,
        encoding: "utf8",
        stdio: "pipe",
      })
    ).toThrow(/Network sitemap source requires --allow-network/);
  });

  it("rejects network sitemap sources that do not match the configured competitor host", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "competitor-url-inventory-network-host-"));
    const sitemapMapPath = path.join(dir, "sitemap-map.json");
    fs.writeFileSync(sitemapMapPath, JSON.stringify({ "16personalities.com": "https://example.com/sitemap.xml" }));

    expect(() =>
      execFileSync("node", [SCRIPT, "--sitemap-map", sitemapMapPath, "--allow-network"], {
        cwd: ROOT,
        encoding: "utf8",
        stdio: "pipe",
      })
    ).toThrow(/Remote sitemap source host must match competitor domain/);
  });

  it("rejects unsafe network sitemap source shapes before any outbound request", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "competitor-url-inventory-network-shape-"));
    const sitemapMapPath = path.join(dir, "sitemap-map.json");
    fs.writeFileSync(sitemapMapPath, JSON.stringify({ "16personalities.com": "https://16personalities.com/admin.xml?next=sitemap" }));

    expect(() =>
      execFileSync("node", [SCRIPT, "--sitemap-map", sitemapMapPath, "--allow-network"], {
        cwd: ROOT,
        encoding: "utf8",
        stdio: "pipe",
      })
    ).toThrow(/Remote sitemap source must not include credentials, ports, queries, or fragments/);
  });

  it("can write JSON and CSV artifacts locally without mutating runtime surfaces", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "competitor-url-inventory-output-"));
    const jsonPath = path.join(dir, "inventory.json");
    const csvPath = path.join(dir, "inventory.csv");

    runGenerator(["--output", jsonPath, "--csv", csvPath, "--pretty"]);

    const artifact = JSON.parse(fs.readFileSync(jsonPath, "utf8")) as CompetitorInventory;
    const csv = fs.readFileSync(csvPath, "utf8");

    expect(artifact.version).toBe("competitor_url_inventory_generator.v1");
    expect(csv.split("\n")[0]).toContain("competitor_domain");
    expect(csv).toContain("missing_test_family");
  });

  it("keeps the generated sample artifact aligned with the generator output", () => {
    const generated = JSON.parse(fs.readFileSync(ARTIFACT_PATH, "utf8")) as CompetitorInventory;

    expect(generated.version).toBe("competitor_url_inventory_generator.v1");
    expect(generated.run_mode).toBe("offline_sample");
    expect(generated.live_data_collected).toBe(false);
    expect(generated.network_access_enabled).toBe(false);
    expect(generated.records.every((record) => record.sample_only)).toBe(true);
  });

  it("keeps current PR scope limited to the read-only generator and contract metadata", () => {
    const files = changedFiles();

    if (files.length === 0) {
      expect(files).toEqual([]);
      return;
    }

    if (files.every(isCurrentRiasecPack12AllowedFile)) {
      return;
    }

    expect(files).toEqual(expect.arrayContaining(["docs/codex/pr-train.yaml", "docs/codex/pr-train-state.json"]));
    expect(files.every(isAllowedFile)).toBe(true);
  });
});

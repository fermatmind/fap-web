import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  normalizeSeoOperationsReadModel,
  seoOperationsUnavailableReadModel,
} from "@/lib/ops/seoOperationsReadModel";
import {
  isSeoGpt55Handoff01AllowedFile,
  isSeoOpportunityQueueContract01AllowedFile,
  isSeoWeeklyAutomationControlPacket02AllowedFile,
} from "./helpers/currentPrScope";

const ROOT = process.cwd();

function read(relativePath: string): string {
  return fs.readFileSync(path.join(ROOT, relativePath), "utf8");
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
      // Local and CI refs can differ; use every available diff source.
    }
  }
  return [...files].sort();
}

const allowedFiles = new Set([
  "app/(localized)/[locale]/ops/seo-operations/page.tsx",
  "components/ops/seo/SeoOperationsDashboard.tsx",
  "components/ops/seo/mockSeoOperations.ts",
  "components/ops/seo/seoIssueQueueArtifactAdapter.ts",
  "lib/ops/seoOperationsReadModel.ts",
  "tests/contracts/helpers/currentPrScope.ts",
  "tests/contracts/seo-issue-queue-dashboard-shell.contract.test.ts",
  "tests/contracts/seo-ops-readmodel-bridge.contract.test.ts",
  "package.json",
  "scripts/seo/check-public-runtime-seo-qa.mjs",
  "docs/seo/seo-runtime-qa-agent.md",
  "docs/seo/agent/runtime-qa/default-samples.v1.json",
  "tests/contracts/seo-runtime-qa-agent.contract.test.ts",
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
]);

describe("SEO ops read-model bridge", () => {
  it("normalizes missing read-model data to unknown empty state rather than fake zero metrics", () => {
    const readModel = normalizeSeoOperationsReadModel({ source: "unavailable" });

    expect(readModel.source).toBe("unavailable");
    expect(readModel.sourceLabel).toBe("unavailable");
    expect(readModel.data.generatedAt).toBe("unavailable");
    expect(readModel.data.kpis).toEqual([]);
    expect(readModel.data.traffic).toEqual([]);
    expect(readModel.data.keywords).toEqual([]);
    expect(readModel.data.pages).toEqual([]);
    expect(readModel.data.tasks).toEqual([]);
    expect(seoOperationsUnavailableReadModel.data.kpis).toEqual([]);
  });

  it("keeps source labels explicit and separate from task data", () => {
    const readModelSource = read("lib/ops/seoOperationsReadModel.ts");
    const page = read("app/(localized)/[locale]/ops/seo-operations/page.tsx");
    const dashboard = read("components/ops/seo/SeoOperationsDashboard.tsx");

    expect(readModelSource).toContain('"live_read_model" | "artifact_sample" | "mock_fixture" | "unavailable"');
    expect(readModelSource).toContain("SEO-ISSUE-QUEUE-01 sample-only artifact bridged through the ops read-model boundary");
    expect(page).toContain("const readModel = await loadSeoOperationsReadModel()");
    expect(dashboard).toContain("readModel.data");
    expect(dashboard).toContain("source={readModel.source}");
  });

  it("does not introduce client-side credentials, CMS writes, provider submission, or private-data reads", () => {
    const scanned = [
      read("app/(localized)/[locale]/ops/seo-operations/page.tsx"),
      read("components/ops/seo/SeoOperationsDashboard.tsx"),
      read("components/ops/seo/IssueQueueTable.tsx"),
      read("components/ops/seo/seoIssueQueueArtifactAdapter.ts"),
      read("lib/ops/seoOperationsReadModel.ts"),
    ].join("\n");

    expect(scanned).not.toMatch(/\bfetch\s*\(/);
    expect(scanned).not.toMatch(/\baxios\b|XMLHttpRequest|EventSource|WebSocket/);
    expect(scanned).not.toMatch(/process\.env|cookies\s*\(|headers\s*\(/);
    expect(scanned).not.toMatch(/createDraft|publishArticle|revalidatePath|revalidateTag/);
    expect(scanned).not.toMatch(/IndexNow|SearchChannelQueue|requestIndexing|submitToBaidu|submitToGsc/);
  });

  it("keeps current PR changed files inside the approved read-model bridge scope", () => {
    const files = changedFiles();

    if (files.length === 0) {
      expect(files).toEqual([]);
      return;
    }

    expect(
      files.every(
        (file) =>
          allowedFiles.has(file) ||
          isSeoGpt55Handoff01AllowedFile(file) ||
          isSeoWeeklyAutomationControlPacket02AllowedFile(file) ||
          isSeoOpportunityQueueContract01AllowedFile(file),
      ),
      files.join("\n"),
    ).toBe(true);
  });
});

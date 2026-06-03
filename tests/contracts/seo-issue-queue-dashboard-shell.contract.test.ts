import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import issueQueueArtifact from "@/docs/seo/generated/seo-issue-queue.v1.json";
import { seoIssueQueueArtifactOperationsData } from "@/components/ops/seo/seoIssueQueueArtifactAdapter";
import { isCurrentRiasecPack12AllowedFile } from "./helpers/currentPrScope";

const ROOT = process.cwd();
const DASHBOARD_PATH = path.join(ROOT, "components/ops/seo/SeoOperationsDashboard.tsx");
const ADAPTER_PATH = path.join(ROOT, "components/ops/seo/seoIssueQueueArtifactAdapter.ts");
const TABLE_PATH = path.join(ROOT, "components/ops/seo/IssueQueueTable.tsx");

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

function isAllowedFile(file: string): boolean {
  return (
    [
      "components/ops/seo/IssueQueueTable.tsx",
      "components/ops/seo/SeoOperationsDashboard.tsx",
      "components/ops/seo/mockSeoOperations.ts",
      "components/ops/seo/seoIssueQueueArtifactAdapter.ts",
      "docs/codex/pr-train.yaml",
      "docs/codex/pr-train-state.json",
      "tests/contracts/helpers/currentPrScope.ts",
      "tests/contracts/seo-issue-queue-dashboard-shell.contract.test.ts",
    ].includes(file) || isCurrentRiasecPack12AllowedFile(file)
  );
}

describe("SEO issue queue dashboard shell artifact adapter", () => {
  it("maps the checked-in issue queue artifact into dashboard tasks and KPI cards", () => {
    const issueCount = issueQueueArtifact.sample_issues.length;
    const blockedCount = seoIssueQueueArtifactOperationsData.tasks.filter((task) => task.status === "blocked").length;

    expect(seoIssueQueueArtifactOperationsData.generatedAt).toBe("SEO-ISSUE-QUEUE-01 artifact");
    expect(seoIssueQueueArtifactOperationsData.tasks).toHaveLength(issueCount);
    expect(seoIssueQueueArtifactOperationsData.tasks.every((task) => task.source === "issue_queue_artifact")).toBe(true);
    expect(seoIssueQueueArtifactOperationsData.tasks.every((task) => task.path.startsWith("/"))).toBe(true);
    expect(seoIssueQueueArtifactOperationsData.tasks.some((task) => task.focus === "robots")).toBe(true);
    expect(seoIssueQueueArtifactOperationsData.tasks.some((task) => task.focus === "growth")).toBe(true);
    expect(seoIssueQueueArtifactOperationsData.tasks.some((task) => task.type === "article")).toBe(true);
    expect(seoIssueQueueArtifactOperationsData.tasks.some((task) => task.type === "landing_surface")).toBe(true);

    const issuesKpi = seoIssueQueueArtifactOperationsData.kpis.find((kpi) => kpi.id === "issues");
    const blockedKpi = seoIssueQueueArtifactOperationsData.kpis.find((kpi) => kpi.id === "blocked");

    expect(issuesKpi).toMatchObject({
      value: String(issueQueueArtifact.generated_queue.summary.total_issues),
      trend: "artifact",
      tone: "info",
    });
    expect(blockedKpi).toMatchObject({
      value: String(blockedCount),
      trend: "只读",
    });
  });

  it("keeps the dashboard labeled as a contract-backed ops shell instead of an authority system", () => {
    const dashboard = fs.readFileSync(DASHBOARD_PATH, "utf8");
    const adapter = fs.readFileSync(ADAPTER_PATH, "utf8");
    const table = fs.readFileSync(TABLE_PATH, "utf8");

    expect(dashboard).toContain("Contract-backed mock");
    expect(dashboard).toContain("任务队列读取本地 issue queue artifact");
    expect(dashboard).toContain("SEO-ISSUE-QUEUE-01 sample-only artifact");
    expect(dashboard).toContain("批量动作只提交后台任务");
    expect(adapter).toContain("docs/seo/generated/seo-issue-queue.v1.json");
    expect(adapter).toContain("must not write CMS content");
    expect(table).toContain("issue_queue_artifact");
  });

  it("does not introduce runtime integrations, CMS writes, search submission, or deployment hooks", () => {
    const scanned = [
      read("components/ops/seo/SeoOperationsDashboard.tsx"),
      read("components/ops/seo/IssueQueueTable.tsx"),
      read("components/ops/seo/mockSeoOperations.ts"),
      read("components/ops/seo/seoIssueQueueArtifactAdapter.ts"),
    ].join("\n");

    expect(scanned).not.toMatch(/\bfetch\s*\(/);
    expect(scanned).not.toMatch(/\baxios\b|XMLHttpRequest|EventSource|WebSocket/);
    expect(scanned).not.toMatch(/process\.env|cookies\s*\(|headers\s*\(/);
    expect(scanned).not.toMatch(/IndexNow|search_submission_allowed:\s*true|publish_allowed:\s*true/);
    expect(scanned).not.toMatch(/createDraft|publishArticle|revalidatePath|revalidateTag/);
  });

  it("keeps current PR scope limited to the dashboard shell artifact adapter", () => {
    const files = changedFiles();

    if (files.length === 0) {
      expect(files).toEqual([]);
      return;
    }

    if (files.every(isCurrentRiasecPack12AllowedFile)) {
      return;
    }

    expect(files).toEqual(expect.arrayContaining(["docs/codex/pr-train.yaml", "docs/codex/pr-train-state.json"]));
    expect(files.every(isAllowedFile), files.join("\n")).toBe(true);
  });
});

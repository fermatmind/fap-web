import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

function readText(relativePath: string): string {
  return fs.readFileSync(path.join(process.cwd(), relativePath), "utf8");
}

function containsForbiddenClaimOutsideBoundary(doc: string, snippet: string): boolean {
  const lowerSnippet = snippet.toLowerCase();
  let inNoGoSection = false;

  for (const rawLine of doc.split("\n")) {
    const line = rawLine.trim().toLowerCase();

    if (line.startsWith("## ")) {
      inNoGoSection = line === "## no-go conditions";
    }

    if (!line.includes(lowerSnippet)) {
      continue;
    }

    if (inNoGoSection) {
      continue;
    }

    if (
      ["does not", "must not", "there is no", "more accurate instead of more specific"].some((marker) =>
        line.includes(marker),
      )
    ) {
      continue;
    }

    return true;
  }

  return false;
}

describe("RIASEC full content pack 14 smoke acceptance", () => {
  const docPath = "docs/codex/riasec-full-content-pack-14-smoke-acceptance.md";
  const doc = readText(docPath);

  it("documents all required lifecycle smoke surfaces and release boundaries", () => {
    expect(doc).toContain("# RIASEC Full Content Pack 14 Smoke Acceptance and Release Freeze");
    expect(doc).toContain("## Runtime Surfaces Covered");
    expect(doc).toContain("## Release Freeze Boundaries");
    expect(doc).toContain("## Manual Live Smoke Checklist");
    expect(doc).toContain("## Deferred Frontend Decisions");
    expect(doc).toContain("## Deployment Approval Phrase Template");

    for (const surface of ["Result page", "Report page", "Public share", "PDF", "History", "Technical Note"]) {
      expect(doc).toContain(surface);
    }

    for (const boundary of [
      "Examples, not Matches",
      "does not mutate `measured_holland_code`, scores, report snapshots, share payloads, PDF payloads, or history payloads",
      "Share remains public-safe by default",
      "PDF remains snapshot-bound after download",
      "Frontend fallback copy remains disallowed",
    ]) {
      expect(doc).toContain(boundary);
    }
  });

  it("keeps deployment operational and out of implementation scope", () => {
    expect(doc).toContain("This PR does not execute them.");
    expect(doc).toContain("obtain readiness first");
    expect(doc).toContain("Do not improvise deployment commands from this document.");
  });

  it("references the frozen smoke and boundary contract set", () => {
    const requiredContractFiles = [
      "tests/contracts/riasec-trusted-result-v15-smoke-acceptance.contract.test.ts",
      "tests/contracts/riasec-deep-copy-v11-smoke-acceptance.contract.test.tsx",
      "tests/contracts/riasec-technical-note-route.contract.test.tsx",
      "tests/contracts/riasec-lifecycle-feedback-boundary.contract.test.tsx",
      "tests/contracts/riasec-full-content-freeze.contract.test.tsx",
    ];

    for (const file of requiredContractFiles) {
      expect(fs.existsSync(path.join(process.cwd(), file))).toBe(true);
      expect(doc).toContain(file);
    }
  });

  it("does not turn the smoke doc into unsupported runtime claims", () => {
    const forbiddenSnippets = [
      "career match",
      "job fit",
      "occupation ranking",
      "success prediction",
      "140Q more accurate",
      "raw score delta",
      "更准确",
      "职业匹配",
      "岗位匹配",
      "成功概率",
    ];

    for (const snippet of forbiddenSnippets) {
      expect(containsForbiddenClaimOutsideBoundary(doc, snippet)).toBe(false);
    }
  });
});

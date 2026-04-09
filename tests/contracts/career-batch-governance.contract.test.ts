import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const SOP_PATH = path.join(ROOT, "docs/codex/career-batch-production-sop.md");
const CHECKLIST_PATH = path.join(ROOT, "docs/codex/career-batch-review-checklist.md");

function readFile(filePath: string): string {
  return fs.readFileSync(filePath, "utf8");
}

function normalize(value: string): string {
  return value.toLowerCase();
}

describe("career batch governance contract", () => {
  it("ships the required governance docs", () => {
    expect(fs.existsSync(SOP_PATH)).toBe(true);
    expect(fs.existsSync(CHECKLIST_PATH)).toBe(true);
  });

  it("keeps the SOP aligned to the truth boundary", () => {
    const sop = normalize(readFile(SOP_PATH));

    expect(sop).toContain("source of truth");
    expect(sop).toContain("codex drafts, backend computes truth");
    expect(sop).toContain("codex may draft structure, alias candidates, and editorial placeholders");
    expect(sop).toContain("laravel and other authority-layer backend pipelines remain the source of truth");
    expect(sop).toContain("truth, score, trust, and claim");
    expect(sop).toContain("first-wave frozen artifacts are reference-only");
  });

  it("keeps the checklist aligned to the same governance boundary", () => {
    const checklist = normalize(readFile(CHECKLIST_PATH));

    expect(checklist).toContain("codex drafts, backend computes truth");
    expect(checklist).toContain("source of truth");
    expect(checklist).toContain("truth, score, trust, and claim");
    expect(checklist).toContain("first-wave frozen artifacts");
    expect(checklist).toContain("no truth invention");
    expect(checklist).toContain("no claim invention");
    expect(checklist).toContain("no score invention");
  });

  it("guards against recommendation and job page flattening in review guidance", () => {
    const sop = normalize(readFile(SOP_PATH));
    const checklist = normalize(readFile(CHECKLIST_PATH));

    expect(sop).toContain("no flattening across page classes is allowed");
    expect(checklist).toContain("recommendation pages were not flattened into job pages");
  });
});

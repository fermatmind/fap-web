import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();

const FILES = [
  ".agents/skills/public-profile-seo-asset-factory/schemas/public-profile-agent-recommendation.schema.json",
  ".agents/skills/public-profile-seo-asset-factory/runbooks/personality-public-profile-agent-runner.md",
  ".agents/skills/public-profile-seo-asset-factory/prompts/public-profile-agent-recommendation.md",
  "docs/research/personality/personality-public-profile-agent-runner-01/00-executive-summary.md",
];

type JsonSchemaObject = {
  additionalProperties?: boolean;
  required?: string[];
  properties: {
    framework: { enum: string[] };
    recommendations: { required: string[] };
  };
};

function read(file: string): string {
  return fs.readFileSync(path.join(ROOT, file), "utf8");
}

function readJson<T = unknown>(file: string): T {
  return JSON.parse(read(file)) as T;
}

describe("PERSONALITY-PUBLIC-PROFILE-AGENT-RUNNER-01", () => {
  it("defines a strict recommendation schema for the three public personality frameworks", () => {
    const schema = readJson<JsonSchemaObject>(
      ".agents/skills/public-profile-seo-asset-factory/schemas/public-profile-agent-recommendation.schema.json",
    );

    expect(schema.additionalProperties).toBe(false);
    expect(schema.required).toEqual(
      expect.arrayContaining([
        "target_url",
        "framework",
        "locale",
        "source_inputs",
        "current_surface",
        "observed_signal",
        "reference_patterns_used",
        "recommendations",
        "qa_required",
        "blocked_reason",
        "status",
      ]),
    );
    expect(schema.properties.framework.enum).toEqual(["mbti64", "big_five", "enneagram"]);
    expect(schema.properties.recommendations.required).toEqual(
      expect.arrayContaining(["title", "description", "h1", "quick_answer", "faq", "internal_links", "differentiation_notes"]),
    );
  });

  it("documents the runner inputs, outputs, QA gates, and no-write boundaries", () => {
    const runbook = read(".agents/skills/public-profile-seo-asset-factory/runbooks/personality-public-profile-agent-runner.md");
    const prompt = read(".agents/skills/public-profile-seo-asset-factory/prompts/public-profile-agent-recommendation.md");
    const summary = read("docs/research/personality/personality-public-profile-agent-runner-01/00-executive-summary.md");

    for (const text of [runbook, prompt]) {
      expect(text).toContain("target_url");
      expect(text).toMatch(/current CMS\/API/i);
      expect(text).toMatch(/reference pack/i);
      expect(text).toContain("SEO");
      expect(text).toMatch(/source ledger/i);
      expect(text).toContain("Do not write CMS");
      expect(text).toContain("Do not publish");
      expect(text).toContain("Search Queue");
      expect(text).toContain("Trademark");
      expect(text).toContain("private result");
    }

    expect(summary).toContain("No CMS writes");
    expect(summary).toContain("MBTI64-PUBLIC-PROFILE-AGENT-EXPANSION-88-01");
  });

  it("keeps the current contract scoped to agent docs, schema, prompt, and tests", () => {
    for (const file of FILES) {
      expect(fs.existsSync(path.join(ROOT, file)), file).toBe(true);
    }
  });
});

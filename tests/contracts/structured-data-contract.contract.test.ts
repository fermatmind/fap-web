import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const FIXTURE_PATH = path.join(
  ROOT,
  "tests/contracts/fixtures/discoverability-foundation/structured-data-contract.v1.json"
);

type StructuredDataPageFamily = {
  name: string;
  source: string;
  authority: string;
  allowedTypes: string[];
  requiredTokens: string[];
  forbiddenTokens: string[];
};

type StructuredDataContractFixture = {
  version: string;
  requiredSchemaTypes: string[];
  rules: Record<string, string>;
  pageFamilies: StructuredDataPageFamily[];
  privateFlowSources: string[];
  forbiddenPrivateFlowTokens: string[];
};

function read(relPath: string): string {
  return fs.readFileSync(path.join(ROOT, relPath), "utf8");
}

function readFixture(): StructuredDataContractFixture {
  return JSON.parse(fs.readFileSync(FIXTURE_PATH, "utf8")) as StructuredDataContractFixture;
}

describe("structured data contract", () => {
  it("documents the reconciled runtime schema authority for Discoverability Foundation", () => {
    const fixture = readFixture();
    const spec = read("docs/seo/structured-data-spec.md");

    expect(fixture.version).toBe("discoverability.structured_data_contract.v1");
    expect(spec).toContain(fixture.version);
    expect(fixture.requiredSchemaTypes).toEqual(
      expect.arrayContaining(["Quiz", "FAQPage", "Dataset", "WebPage", "BreadcrumbList"])
    );

    for (const schemaType of fixture.requiredSchemaTypes) {
      expect(spec).toContain(schemaType);
    }

    expect(fixture.rules).toMatchObject({
      quizRuntimeState: "not_emitted",
      faqPageSource: "visible_faq_or_answer_surface_only",
      datasetSource: "dedicated_dataset_or_backend_dataset_bundle_only",
      careerJobOccupationAuthority: "backend_seo_surface_v1_structured_data_keys",
      privateFlows: "no_jsonld",
    });
    expect(spec).toContain("`Quiz` is not emitted by the current runtime");
    expect(spec).toContain("`FAQPage` must be derived from visible FAQ");
    expect(spec).toContain("Backend-owned career JSON-LD");
  });

  it("keeps runtime source tokens aligned with the structured data page-family matrix", () => {
    const fixture = readFixture();

    for (const family of fixture.pageFamilies) {
      const source = read(family.source);

      for (const token of family.requiredTokens) {
        expect(source, `${family.name} must contain ${token}`).toContain(token);
      }

      for (const token of family.forbiddenTokens) {
        expect(source, `${family.name} must not contain ${token}`).not.toContain(token);
      }
    }
  });

  it("does not render JSON-LD from private flow route files", () => {
    const fixture = readFixture();

    for (const relPath of fixture.privateFlowSources) {
      const source = read(relPath);

      for (const token of fixture.forbiddenPrivateFlowTokens) {
        expect(source, `${relPath} must not contain ${token}`).not.toContain(token);
      }
    }
  });
});

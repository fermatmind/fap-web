import fs from "node:fs";
import path from "node:path";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  MENTAL_HEALTH_NON_MEDICAL_DISCLAIMER,
  MENTAL_HEALTH_SCREENING_TEST_SLUGS,
  MentalHealthDisclaimer,
  isMentalHealthScreeningTest,
} from "@/components/compliance/MentalHealthDisclaimer";
import { buildWebPageJsonLd } from "@/lib/seo/generateSchema";

const ROOT = process.cwd();
const FORBIDDEN_MEDICAL_SCHEMA_TYPES = [
  "MedicalWebPage",
  "MedicalCondition",
  "MedicalTherapy",
  "DiagnosticProcedure",
  "MedicalTest",
] as const;

function read(relPath: string): string {
  return fs.readFileSync(path.join(ROOT, relPath), "utf8");
}

function collectSchemaTypes(value: unknown): string[] {
  if (!value || typeof value !== "object") return [];
  if (Array.isArray(value)) return value.flatMap(collectSchemaTypes);

  const record = value as Record<string, unknown>;
  return [
    typeof record["@type"] === "string" ? record["@type"] : "",
    ...Object.values(record).flatMap(collectSchemaTypes),
  ].filter(Boolean);
}

describe("mental-health disclaimer gate", () => {
  it("discovers the current public mental-health screening test slugs", () => {
    expect(MENTAL_HEALTH_SCREENING_TEST_SLUGS).toEqual([
      "depression-screening-test-standard-edition",
      "clinical-depression-anxiety-assessment-professional-edition",
    ]);

    expect(
      isMentalHealthScreeningTest({
        slug: "depression-screening-test-standard-edition",
        scaleCode: "SDS_20",
      })
    ).toBe(true);
    expect(
      isMentalHealthScreeningTest({
        slug: "clinical-depression-anxiety-assessment-professional-edition",
        scaleCode: "CLINICAL_COMBO_68",
      })
    ).toBe(true);
    expect(
      isMentalHealthScreeningTest({
        slug: "big-five-personality-test-ocean-model",
        scaleCode: "BIG5_OCEAN",
      })
    ).toBe(false);
  });

  it("renders the required English and Chinese non-medical disclaimers as visible HTML", () => {
    render(
      <>
        <MentalHealthDisclaimer locale="en" />
        <MentalHealthDisclaimer locale="zh" />
      </>
    );

    expect(screen.getByText("Non-medical screening note")).toBeInTheDocument();
    expect(screen.getByText("非医疗诊断说明")).toBeInTheDocument();
    expect(screen.getByText(MENTAL_HEALTH_NON_MEDICAL_DISCLAIMER.en)).toBeInTheDocument();
    expect(screen.getByText(MENTAL_HEALTH_NON_MEDICAL_DISCLAIMER.zh)).toBeInTheDocument();
    expect(screen.getAllByTestId("mental-health-disclaimer")).toHaveLength(2);
  });

  it("wires the visible disclaimer into the test detail page without changing schema ownership", () => {
    const source = read("app/(localized)/[locale]/tests/[slug]/page.tsx");

    expect(source).toContain("isMentalHealthScreeningTest");
    expect(source).toContain("showsMentalHealthDisclaimer ? <MentalHealthDisclaimer locale={locale} /> : null");
    expect(source).toContain("buildWebPageJsonLd");
    expect(source).toContain("buildFAQPageJsonLd");
  });

  it("does not emit misleading medical schema types for mental-health test detail pages", () => {
    const schema = buildWebPageJsonLd({
      path: "/en/tests/depression-screening-test-standard-edition",
      title: "Depression Screening Test",
      description: "Educational self-reflection screening.",
      locale: "en",
    });
    const schemaTypes = collectSchemaTypes(schema);

    expect(schemaTypes).toContain("WebPage");
    for (const type of FORBIDDEN_MEDICAL_SCHEMA_TYPES) {
      expect(schemaTypes).not.toContain(type);
    }

    const schemaSource = read("lib/seo/generateSchema.ts");
    const pageSource = read("app/(localized)/[locale]/tests/[slug]/page.tsx");
    for (const type of FORBIDDEN_MEDICAL_SCHEMA_TYPES) {
      expect(schemaSource).not.toContain(type);
      expect(pageSource).not.toContain(type);
    }
  });
});

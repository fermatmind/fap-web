import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const quizTakeClientSource = readFileSync(
  path.join(process.cwd(), "app/(localized)/[locale]/tests/[slug]/take/QuizTakeClient.tsx"),
  "utf8"
);

describe("take frontend locale contract", () => {
  it("passes the resolved route locale to generic question and start requests", () => {
    const localeAssignments = quizTakeClientSource.match(/locale: testKpiMetadata\.apiLocale,/g) ?? [];

    expect(localeAssignments.length).toBeGreaterThanOrEqual(2);
    expect(quizTakeClientSource).not.toContain("...(isRiasecScale ? { locale: toApiLocale(locale) } : {})");
  });

  it("keeps RIASEC-only channel metadata scoped to RIASEC", () => {
    expect(quizTakeClientSource).toContain('...(isRiasecScale ? { clientPlatform: "web", channel: "web" } : {})');
  });
});

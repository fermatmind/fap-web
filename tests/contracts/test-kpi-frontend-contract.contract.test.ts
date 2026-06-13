import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  buildTestKpiMetadata,
  buildTestKpiTrackingPayload,
  resolveTestKpiFormCode,
} from "@/lib/tracking/testKpiMetadata";
import { isTestKpiFrontendContract06AllowedFile } from "./helpers/currentPrScope";

const ROOT = process.cwd();

function readText(relativePath: string): string {
  return fs.readFileSync(path.join(ROOT, relativePath), "utf8");
}

describe("TEST-KPI-FRONTEND-CONTRACT-06 test KPI metadata contract", () => {
  it("normalizes current form-backed tests to scale/form/locale fields for KPI events", () => {
    expect(buildTestKpiMetadata({ scaleCode: "mbti", locale: "zh" })).toMatchObject({
      scaleCode: "MBTI",
      scale_code: "MBTI",
      formCode: "mbti_144",
      form_code: "mbti_144",
      locale: "zh",
      apiLocale: "zh-CN",
    });
    expect(buildTestKpiMetadata({ scaleCode: "BIG5_OCEAN", formCode: "90", locale: "en" })).toMatchObject({
      scale_code: "BIG5_OCEAN",
      form_code: "big5_90",
      locale: "en",
      apiLocale: "en",
    });
    expect(buildTestKpiMetadata({ scaleCode: "ENNEAGRAM", formCode: "forced-choice-144", locale: "zh" })).toMatchObject({
      scale_code: "ENNEAGRAM",
      form_code: "enneagram_forced_choice_144",
    });
    expect(buildTestKpiMetadata({ scaleCode: "RIASEC", formCode: null, locale: "zh" })).toMatchObject({
      scale_code: "RIASEC",
      form_code: "riasec_60",
    });
  });

  it("preserves future form codes without inventing backend-only forms", () => {
    expect(resolveTestKpiFormCode({ scaleCode: "EQ_SJT_16", formCode: " eq_sjt_16_public " })).toBe(
      "eq_sjt_16_public"
    );
    expect(resolveTestKpiFormCode({ scaleCode: "EQ_SJT_16" })).toBeUndefined();
  });

  it("makes KPI metadata authoritative over unsafe or stale event payload fields", () => {
    const metadata = buildTestKpiMetadata({
      scaleCode: "riasec",
      formCode: "riasec_140",
      locale: "zh",
    });

    expect(
      buildTestKpiTrackingPayload(metadata, {
        scale_code: "WRONG",
        form_code: "wrong_form",
        locale: "en",
        attempt_id: "attempt-123",
      })
    ).toEqual({
      scale_code: "RIASEC",
      form_code: "riasec_140",
      locale: "zh",
      attempt_id: "attempt-123",
    });
  });

  it("keeps take-flow clients wired to the shared KPI metadata helper", () => {
    const quizTake = readText("app/(localized)/[locale]/tests/[slug]/take/QuizTakeClient.tsx");
    const big5Take = readText("app/(localized)/[locale]/tests/[slug]/take/Big5TakeClient.tsx");
    const enneagramTake = readText("app/(localized)/[locale]/tests/[slug]/take/EnneagramTakeClient.tsx");
    const clinicalTake = readText("app/(localized)/[locale]/tests/[slug]/take/ClinicalTakeClient.tsx");

    for (const source of [quizTake, big5Take, enneagramTake, clinicalTake]) {
      expect(source).toContain("buildTestKpiMetadata");
      expect(source).toContain("buildTestKpiTrackingPayload");
      expect(source).toContain("testKpiMetadata.apiLocale");
    }

    expect(quizTake).toContain("resolveTestKpiFormCode");
    expect(quizTake).toContain("trackObservableFunnelEvent(\"start_attempt\"");
    expect(quizTake).toContain("trackObservableFunnelEvent(\"submit_attempt\"");
  });

  it("declares the PR6 diff as current-branch scope for legacy scope guards", () => {
    for (const file of [
      "app/(localized)/[locale]/tests/[slug]/take/Big5TakeClient.tsx",
      "app/(localized)/[locale]/tests/[slug]/take/ClinicalTakeClient.tsx",
      "app/(localized)/[locale]/tests/[slug]/take/EnneagramTakeClient.tsx",
      "app/(localized)/[locale]/tests/[slug]/take/QuizTakeClient.tsx",
      "lib/tracking/testKpiMetadata.ts",
      "tests/contracts/helpers/currentPrScope.ts",
      "tests/contracts/take-frontend-locale-contract.contract.test.ts",
      "tests/contracts/test-kpi-frontend-contract.contract.test.ts",
    ]) {
      expect(isTestKpiFrontendContract06AllowedFile(file), file).toBe(true);
    }
  });
});

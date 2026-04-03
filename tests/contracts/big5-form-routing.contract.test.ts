import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

function read(relPath: string): string {
  return fs.readFileSync(path.join(process.cwd(), relPath), "utf8");
}

describe("big5 form routing contract", () => {
  it("wires take client requests to backend with explicit big5 form_code", () => {
    const source = read("app/(localized)/[locale]/tests/[slug]/take/Big5TakeClient.tsx");

    expect(source).toContain("normalizeBig5FormCode");
    expect(source).toContain("fetchBig5Questions({");
    expect(source).toContain("formCode: resolvedFormCode");
    expect(source).toContain("startBig5Attempt({");
    expect(source).toContain("setSessionContext({");
  });

  it("keeps big5 api layer form-aware for both questions and attempt start", () => {
    const source = read("lib/big5/api.ts");

    expect(source).toContain("fetchBig5Questions({");
    expect(source).toContain("startBig5Attempt({");
    expect(source).toContain("fetchScaleQuestions({");
    expect(source).toContain("startAttempt({");
    expect(source).toContain("formCode");
  });

  it("isolates big5 draft persistence by slug + identity + form code", () => {
    const source = read("lib/big5/attemptStore.ts");

    expect(source).toContain("fm_big5_attempt_v2");
    expect(source).toContain("buildStorageKey");
    expect(source).toContain("setSessionContext");
    expect(source).toContain("BIG5_LEGACY_STORAGE_KEY");
  });
});

import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { initialQuestionnaireScripts } from "@/lib/questionnaires/initialScripts";

const roots: string[] = [];
afterEach(() => { for (const root of roots.splice(0)) rmSync(root, { recursive: true }); });

function build(chunks: unknown[] = ["/_next/static/chunks/current-tool.js"]) {
  const root = mkdtempSync(join(tmpdir(), "questionnaire-entry-scripts-")); roots.push(root);
  mkdirSync(join(root, ".next"));
  writeFileSync(join(root, ".next/build-manifest.json"), JSON.stringify({ rootMainFiles: ["static/chunks/bootstrap.js"] }));
  const dir = join(root, ".next/server/app/(localized)/[locale]/tests/explore/disc");
  mkdirSync(dir, { recursive: true });
  const manifest = { clientModules: {
    "[project]/components/questionnaires/BasicQuestionnaireClient.tsx": { chunks },
    "[project]/app/global-error.tsx": { chunks: ["/_next/static/chunks/error-document.js"] },
  } };
  writeFileSync(join(dir, "page_client-reference-manifest.js"), `globalThis.__RSC_MANIFEST = globalThis.__RSC_MANIFEST || {};\nglobalThis.__RSC_MANIFEST["/(localized)/[locale]/tests/explore/disc/page"] = ${JSON.stringify(manifest)};`);
  return root;
}

describe("Initial questionnaire script hints", () => {
  it("keeps every SSR dependency, including the global error bootstrap, and deduplicates chunks", () => {
    expect(initialQuestionnaireScripts("disc", build(["/_next/static/chunks/current-tool.js", "/_next/static/chunks/bootstrap.js"]))).toEqual(["/_next/static/chunks/bootstrap.js", "/_next/static/chunks/current-tool.js", "/_next/static/chunks/error-document.js"]);
  });
  it.each(["https://other.example/script.js", "static/chunks/../../outside.js", "static/chunks/style.css"])("never emits an unsafe build path: %s", chunk => {
    expect(initialQuestionnaireScripts("disc", build([chunk]))).toEqual([]);
  });
  it("leaves the normal loader in place when a route manifest is unavailable", () => {
    expect(initialQuestionnaireScripts("cognitive-functions-test", build())).toEqual([]);
    expect(initialQuestionnaireScripts("career-match" as never, build())).toEqual([]);
  });
});

import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { expect, it } from "vitest";
import { llmsGeneratorFingerprint } from "../../scripts/release/llms-generator-fingerprint.mjs";

it("binds imported generator inputs and dependencies while ignoring unrelated UI changes", () => {
  const root = mkdtempSync(path.join(tmpdir(), "llms-generator-"));
  const write = (name: string, body: string) => {
    mkdirSync(path.dirname(path.join(root, name)), { recursive: true });
    writeFileSync(path.join(root, name), body);
  };
  try {
    write("lib/seo/llmsFullRoute.ts", 'import { source } from "@/lib/source"; export const text = source;');
    write("lib/source.ts", 'export const source = "one";');
    for (const name of ["package.json", "pnpm-lock.yaml", "tsconfig.json", "scripts/release/llms-generator-fingerprint.mjs"]) write(name, "{}");
    const initial = llmsGeneratorFingerprint(root);
    write("components/button.tsx", "export const Button = () => null;");
    expect(llmsGeneratorFingerprint(root)).toBe(initial);
    write("lib/source.ts", 'export const source = "two";');
    expect(llmsGeneratorFingerprint(root)).not.toBe(initial);
    const sourceChanged = llmsGeneratorFingerprint(root);
    write("pnpm-lock.yaml", "changed-dependency");
    expect(llmsGeneratorFingerprint(root)).not.toBe(sourceChanged);
    write("lib/seo/llmsFullRoute.ts", 'import "@/lib/missing";');
    expect(() => llmsGeneratorFingerprint(root)).toThrow("Unresolved llms generator dependency");
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

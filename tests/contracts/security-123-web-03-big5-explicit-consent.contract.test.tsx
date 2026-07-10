import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { isSecurity123Web03AllowedFile } from "./helpers/currentPrScope";

const SOURCE_PATH = "app/(localized)/[locale]/tests/[slug]/take/Big5TakeClient.tsx";
const CONTRACT_GENERATED_ARTIFACTS = new Set([
  "docs/seo/generated/metadata-surface-inventory.v1.csv",
  "docs/seo/generated/metadata-surface-inventory.v1.json",
  "docs/seo/personality/mbti-cms-04-top-profile-content-assets-2026-07-04.json",
  "docs/seo/personality/mbti-cms-04-top-profile-content-assets-2026-07-04.md",
]);

function changedFiles(): string[] {
  const files = new Set<string>();
  for (const args of [
    ["diff", "--name-only", "HEAD"],
    ["diff", "--cached", "--name-only"],
    ["diff", "--name-only", "origin/main...HEAD"],
    ["ls-files", "--others", "--exclude-standard"],
  ]) {
    try {
      for (const file of execFileSync("git", args, { encoding: "utf8" }).split("\n")) {
        if (file.trim()) files.add(file.trim());
      }
    } catch {
      // CI merge refs may not expose every local diff base.
    }
  }
  return [...files].filter((file) => !CONTRACT_GENERATED_ARTIFACTS.has(file)).sort();
}

describe("SECURITY-123-WEB-03 Big Five explicit disclaimer consent", () => {
  const source = readFileSync(SOURCE_PATH, "utf8");

  it("renders and gates on the current server disclaimer snapshot", () => {
    expect(source).toContain("serverDisclaimerText");
    expect(source).toContain("serverDisclaimerVersion");
    expect(source).toContain("serverDisclaimerHash");
    expect(source).toContain("BigFiveDisclaimerGate");
    expect(source).toContain("I have read and agree to the disclaimer.");
    expect(source).toContain("accepted_version: serverDisclaimerVersion");
    expect(source).toContain("accepted_hash: serverDisclaimerHash");
    expect(source).toContain("accepted_at: acceptedAt");
    expect(source).toContain("isValidDisclaimerTimestamp(disclaimerAcceptedAt)");
    expect(source).not.toContain("const acceptedAt = new Date().toISOString()");
  });

  it("fails closed when consent is absent or no longer matches the server snapshot", () => {
    expect(source).toContain("if (!hasAcceptedCurrentDisclaimer || !isValidDisclaimerTimestamp(disclaimerAcceptedAt))");
    expect(source).toContain("if (!hasAcceptedCurrentDisclaimer)");
    expect(source).toContain("clearAttemptMeta();");
    expect(source).toContain("disabled={!hasAcceptedCurrentDisclaimer");
  });

  it("keeps the complete PR diff inside the declared WEB-03 scope", () => {
    const changed = changedFiles();
    expect(changed.length).toBeGreaterThan(0);
    expect(changed.every(isSecurity123Web03AllowedFile), changed.join("\n")).toBe(true);
  });
});

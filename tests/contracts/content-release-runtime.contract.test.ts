import { chmodSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { resolveContentReleaseRuntime } from "@/lib/security/contentReleaseRuntime";

const values = { CONTENT_RELEASE_REVALIDATE_SECRET: "fixture-shared-secret-with-entropy", CONTENT_RELEASE_REVALIDATE_REDIS_URL: "https://redis.example.test", CONTENT_RELEASE_REVALIDATE_REDIS_TOKEN: "fixture-token" };
describe("release-bound revalidation credentials for systemd and PM2", () => {
  it("reads the active release privately and drops inherited credentials on legacy rollback", () => {
    const root = mkdtempSync(path.join(tmpdir(), "revalidation-runtime-"));
    try {
      writeFileSync(path.join(root, "REVISION"), "a".repeat(40));
      const file = path.join(root, ".content-release-runtime.json");
      expect(Object.values(resolveContentReleaseRuntime(root, values))).toEqual(["", "", ""]);
      writeFileSync(file, JSON.stringify(values), { mode: 0o600 });
      expect(resolveContentReleaseRuntime(root, { ...values, CONTENT_RELEASE_REVALIDATE_SECRET: "stale" })).toEqual(values);
      chmodSync(file, 0o644);
      expect(() => resolveContentReleaseRuntime(root, values)).toThrow("REJECTED");
      rmSync(file); symlinkSync(path.join(root, "REVISION"), file);
      expect(() => resolveContentReleaseRuntime(root, values)).toThrow("REJECTED");
    } finally { rmSync(root, { recursive: true, force: true }); }
  });
  it("permits environment configuration only outside deployed releases and rejects malformed authority", () => {
    const root = mkdtempSync(path.join(tmpdir(), "revalidation-development-"));
    try {
      expect(resolveContentReleaseRuntime(root, values)).toEqual(values);
      writeFileSync(path.join(root, "REVISION"), "invalid");
      expect(() => resolveContentReleaseRuntime(root, values)).toThrow("REJECTED");
    } finally { rmSync(root, { recursive: true, force: true }); }
  });
  it("rejects writable or redirected release authority even with valid private credentials", () => {
    const root = mkdtempSync(path.join(tmpdir(), "revalidation-authority-"));
    const revision = path.join(root, "REVISION");
    try {
      writeFileSync(revision, "a".repeat(40));
      writeFileSync(path.join(root, ".content-release-runtime.json"), JSON.stringify(values), { mode: 0o600 });
      chmodSync(root, 0o770);
      expect(() => resolveContentReleaseRuntime(root, values)).toThrow("REJECTED");
      chmodSync(root, 0o700);
      chmodSync(revision, 0o664);
      expect(() => resolveContentReleaseRuntime(root, values)).toThrow("REJECTED");
      rmSync(revision);
      writeFileSync(path.join(root, "other-revision"), "a".repeat(40));
      symlinkSync(path.join(root, "other-revision"), revision);
      expect(() => resolveContentReleaseRuntime(root, values)).toThrow("REJECTED");
    } finally { rmSync(root, { recursive: true, force: true }); }
  });
});

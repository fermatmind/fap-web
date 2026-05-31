import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const LEDGER_PATH = "docs/audits/iq-fe/20_iq_production_launch_readiness_ledger.md";
const MANIFEST_PATH = "docs/codex/pr-train.yaml";

function read(path: string): string {
  return readFileSync(path, "utf8");
}

describe("IQ release readiness ledger", () => {
  it("records every IQ production train item before release", () => {
    const ledger = read(LEDGER_PATH);

    for (const id of [
      "IQ-NORM-01",
      "IQ-NORM-02",
      "IQ-NORM-03",
      "IQ-PAID-REPORT-01",
      "IQ-PAID-REPORT-02",
      "IQ-CMS-MEDIA-01",
      "IQ-CMS-MEDIA-02",
      "IQ-SEO-RAMP-01",
      "IQ-SEO-RAMP-02",
      "IQ-LIVE-RAMP-01",
      "IQ-OBS-01",
    ]) {
      expect(ledger).toContain(id);
    }

    for (const pr of ["#1799", "#1802", "#1810", "#1812", "#1817", "#1821", "#1823", "#943", "#944", "#946", "#947"]) {
      expect(ledger).toContain(pr);
    }
  });

  it("keeps release boundary documentation strict", () => {
    const ledger = read(LEDGER_PATH);

    expect(ledger).toContain("Release disposition: controlled launch ready; production deploy not executed.");
    expect(ledger).toContain("Norm authority remains backend-only");
    expect(ledger).toContain("No frontend editorial fallback content");
    expect(ledger).toContain("No public static media fallback");
    expect(ledger).toContain("MyIQ.Science remains behind license verification gate");
    expect(ledger).toContain("no third-party IQ question replication");
    expect(ledger).toContain("No real user data, bearer token, answer key, answer text, or paid report private field is committed.");
    expect(ledger).toContain("This ledger is not a production deployment approval by itself.");
  });

  it("registers IQ-RELEASE-01 as docs-only train closure", () => {
    const manifest = read(MANIFEST_PATH);
    const releaseStart = manifest.indexOf("  - id: IQ-RELEASE-01");
    expect(releaseStart).toBeGreaterThan(-1);
    const release = manifest.slice(releaseStart);

    expect(release).toContain("repo: fap-web");
    expect(release).toContain("branch: codex/iq-release-01-launch-readiness-ledger");
    expect(release).toContain('title: "IQ-RELEASE-01 finalize production launch readiness ledger"');
    expect(release).toContain("      - IQ-OBS-01");
    expect(release).toContain("    next_task: null");

    for (const file of [
      "docs/audits/iq-fe/20_iq_production_launch_readiness_ledger.md",
      "docs/codex/pr-train.yaml",
      "docs/codex/pr-train-state.json",
      "tests/contracts/helpers/currentPrScope.ts",
      "tests/contracts/iq-release-readiness-ledger.contract.test.ts",
    ]) {
      expect(release).toContain(file);
    }

    for (const boundary of [
      "runtime behavior changes",
      "production deploys, rollbacks, or environment mutation",
      "frontend editorial fallback content",
      "public static media fallback assets",
      "copied third-party IQ questions or copied item wording",
      "real user data, bearer tokens, answer keys, or paid report private fields",
    ]) {
      expect(release).toContain(boundary);
    }
  });
});

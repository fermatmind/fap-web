import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";

const SCRIPT = path.resolve("scripts/release/standalone-release.mjs");
const SHA = "0123456789abcdef0123456789abcdef01234567";
const BUILD_ENV = {
  ...process.env,
  NEXT_PUBLIC_ANALYTICS_ALLOWED_HOSTS: "fermatmind.com,www.fermatmind.com",
  NEXT_PUBLIC_ANALYTICS_ENABLED: "true",
  NEXT_PUBLIC_ANALYTICS_ENV: "production",
  NEXT_PUBLIC_API_URL: "https://api.fermatmind.com",
  NEXT_PUBLIC_BAIDU_TONGJI_ID: "bbbbbbbbbbbbbbbb",
  NEXT_PUBLIC_GA_MEASUREMENT_ID: "G-ABCD1234",
  NEXT_PUBLIC_RELEASE: SHA,
  NEXT_PUBLIC_SITE_URL: "https://fermatmind.com",
  NEXT_PUBLIC_USE_SAME_ORIGIN_API_PROXY: "false",
};
const tempDirectories: string[] = [];

function tempDirectory(): string {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "fap-web-standalone-release-"));
  tempDirectories.push(directory);
  return directory;
}

function createStandalone(root: string): string {
  const standalone = path.join(root, "standalone");
  fs.mkdirSync(path.join(standalone, ".next/static"), { recursive: true });
  fs.mkdirSync(path.join(standalone, "public"), { recursive: true });
  fs.writeFileSync(path.join(standalone, "server.js"), "console.log('standalone');\n");
  fs.writeFileSync(path.join(standalone, ".next/static/app.js"), "immutable-static\n");
  fs.writeFileSync(path.join(standalone, "public/brand.txt"), "FermatMind\n");
  fs.symlinkSync("brand.txt", path.join(standalone, "public/brand-link.txt"));
  return standalone;
}

function packageArtifact(source: string, output: string): void {
  execFileSync(
    process.execPath,
    [
      SCRIPT,
      "package",
      `--source=${source}`,
      `--output=${output}`,
      `--git-sha=${SHA}`,
      "--build-timestamp=2026-07-29T01:02:03Z",
      "--workflow-run-id=12345",
      "--workflow-run-attempt=2",
      "--require-production-config",
    ],
    { env: BUILD_ENV, encoding: "utf8" },
  );
}

function verifyArtifact(artifact: string) {
  return spawnSync(process.execPath, [SCRIPT, "verify", `--artifact=${artifact}`], {
    env: BUILD_ENV,
    encoding: "utf8",
  });
}

afterEach(() => {
  for (const directory of tempDirectories.splice(0)) {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});

describe("immutable standalone release artifact", () => {
  it("binds the exact revision and produces a deterministic manifest without exposing config values", () => {
    const root = tempDirectory();
    const source = createStandalone(root);
    const first = path.join(root, "first");
    const second = path.join(root, "second");

    packageArtifact(source, first);
    packageArtifact(source, second);

    expect(fs.readFileSync(path.join(first, "REVISION"), "utf8")).toBe(`${SHA}\n`);
    expect(fs.readFileSync(path.join(first, "RELEASE_MANIFEST.json"), "utf8")).toBe(
      fs.readFileSync(path.join(second, "RELEASE_MANIFEST.json"), "utf8"),
    );
    const manifest = fs.readFileSync(path.join(first, "RELEASE_MANIFEST.json"), "utf8");
    expect(manifest).toContain('"schema": "fermatmind.web.standalone.v1"');
    expect(manifest).toContain(`"git_sha": "${SHA}"`);
    expect(manifest).not.toContain("G-ABCD1234");
    expect(manifest).not.toContain("bbbbbbbbbbbbbbbb");

    const metadata = JSON.parse(fs.readFileSync(path.join(first, "REVISION_METADATA.json"), "utf8"));
    expect(metadata).toMatchObject({
      git_sha: SHA,
      build_timestamp: "2026-07-29T01:02:03Z",
      workflow_run_id: "12345",
      workflow_run_attempt: "2",
    });
    expect(fs.lstatSync(path.join(first, "public/brand-link.txt")).isSymbolicLink()).toBe(true);
    expect(verifyArtifact(first).status).toBe(0);
  });

  it("fails closed after content tampering or an uncovered file is added", () => {
    const root = tempDirectory();
    const source = createStandalone(root);
    const artifact = path.join(root, "artifact");
    packageArtifact(source, artifact);

    fs.writeFileSync(path.join(artifact, ".next/static/app.js"), "tampered\n");
    const tampered = verifyArtifact(artifact);
    expect(tampered.status).not.toBe(0);
    expect(tampered.stderr).toContain("SHA256 verification failed");

    packageArtifact(source, artifact);
    fs.writeFileSync(path.join(artifact, "unexpected.txt"), "not covered\n");
    const uncovered = verifyArtifact(artifact);
    expect(uncovered.status).not.toBe(0);
    expect(uncovered.stderr).toContain("protected path set does not match");
  });

  it("rejects environment and private-key files before packaging", () => {
    const root = tempDirectory();
    const source = createStandalone(root);
    fs.writeFileSync(path.join(source, ".env.production.local"), "SECRET=value\n");

    const result = spawnSync(
      process.execPath,
      [
        SCRIPT,
        "package",
        `--source=${source}`,
        `--output=${path.join(root, "artifact")}`,
        `--git-sha=${SHA}`,
        "--build-timestamp=2026-07-29T01:02:03Z",
        "--workflow-run-id=12345",
        "--workflow-run-attempt=1",
      ],
      { env: BUILD_ENV, encoding: "utf8" },
    );

    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain("forbidden secret or private configuration files");
  });

  it("keeps the CI release candidate on one build and outside deploy workflows", () => {
    const ci = fs.readFileSync(".github/workflows/ci.yml", "utf8");

    expect(ci.match(/(?:^|\s)pnpm build(?:\s|$)/gm)).toHaveLength(1);
    expect(ci).toContain("--require-production-config");
    expect(ci).toContain("--sort=name --mtime='UTC 1970-01-01'");
    expect(ci).toContain("subject-path: .next/release/fap-web-${{ github.sha }}.tar.gz");
    expect(ci).not.toContain("deploy_web_pm2.sh");
    expect(ci).not.toContain("ssh ");
  });
});

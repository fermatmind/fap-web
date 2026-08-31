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
const STAGING_BUILD_ENV = {
  ...BUILD_ENV,
  NEXT_PUBLIC_ANALYTICS_ALLOWED_HOSTS: "staging.fermatmind.com",
  NEXT_PUBLIC_ANALYTICS_ENV: "staging",
  NEXT_PUBLIC_API_URL: "https://staging-api.fermatmind.com",
  NEXT_PUBLIC_BAIDU_TONGJI_ID: "",
  NEXT_PUBLIC_GA_MEASUREMENT_ID: "",
  NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_ID: "",
  NEXT_PUBLIC_GOOGLE_ADS_PURCHASE_CONVERSION_LABEL: "",
  NEXT_PUBLIC_SITE_URL: "https://staging.fermatmind.com",
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

function verifyArtifact(
  artifact: string,
  args: string[] = [],
  env: NodeJS.ProcessEnv = BUILD_ENV,
) {
  return spawnSync(process.execPath, [SCRIPT, "verify", `--artifact=${artifact}`, ...args], {
    env,
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
    expect(uncovered.stderr).toContain("non-runtime standalone content is not permitted");
  });

  it("fails closed on requested revision or build-configuration incompatibility", () => {
    const root = tempDirectory();
    const source = createStandalone(root);
    const artifact = path.join(root, "artifact");
    packageArtifact(source, artifact);

    const revisionMismatch = verifyArtifact(artifact, [
      "--expected-git-sha=ffffffffffffffffffffffffffffffffffffffff",
    ]);
    expect(revisionMismatch.status).not.toBe(0);
    expect(revisionMismatch.stderr).toContain("does not match the requested exact git SHA");

    const compatible = verifyArtifact(artifact, [
      `--expected-git-sha=${SHA}`,
      "--require-production-config",
    ]);
    expect(compatible.status).toBe(0);

    const incompatible = verifyArtifact(
      artifact,
      [`--expected-git-sha=${SHA}`, "--require-production-config"],
      { ...BUILD_ENV, NEXT_PUBLIC_API_URL: "https://staging-api.fermatmind.com" },
    );
    expect(incompatible.status).not.toBe(0);
    expect(incompatible.stderr).toContain("production build configuration is unsafe");

    const stagingArtifact = path.join(root, "staging-artifact");
    const stagingPackage = spawnSync(
      process.execPath,
      [
        SCRIPT,
        "package",
        `--source=${source}`,
        `--output=${stagingArtifact}`,
        `--git-sha=${SHA}`,
        "--build-timestamp=2026-07-29T01:02:03Z",
        "--workflow-run-id=12345",
        "--workflow-run-attempt=1",
        "--require-staging-config",
      ],
      { env: STAGING_BUILD_ENV, encoding: "utf8" },
    );
    expect(stagingPackage.status).toBe(0);
    expect(verifyArtifact(stagingArtifact, ["--require-staging-config"], STAGING_BUILD_ENV).status).toBe(0);
    expect(verifyArtifact(stagingArtifact, ["--require-production-config"], BUILD_ENV).status).not.toBe(0);
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

  it("rejects repository-only skills, docs, and tests from the runtime artifact", () => {
    for (const forbiddenPath of [".agents/SKILL.md", "docs/runbook.md", "tests/fixture.ts"]) {
      const root = tempDirectory();
      const source = createStandalone(root);
      const target = path.join(source, forbiddenPath);
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.writeFileSync(target, "repository-only\n");

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
      expect(result.stderr).toContain("non-runtime standalone content is not permitted");
    }
  });

  it("keeps environment-bound CI release candidates outside deploy workflows", () => {
    const ci = fs.readFileSync(".github/workflows/ci.yml", "utf8");
    const deploy = fs.readFileSync(".github/workflows/deploy.yml", "utf8");
    const prepareArtifact = fs.readFileSync(".github/trunk/prepare-web-artifact.sh", "utf8");

    expect(ci.match(/(?:^|\s)pnpm build(?:\s|$)/gm)).toHaveLength(2);
    expect(ci).toContain('NEXT_PUBLIC_ANALYTICS_ENABLED: "true"');
    expect(ci).toMatch(/NEXT_PUBLIC_GA_MEASUREMENT_ID: G-[A-Z0-9]{4,32}/);
    expect(ci).toMatch(/NEXT_PUBLIC_BAIDU_TONGJI_ID: [a-f0-9]{16,64}/);
    expect(ci).not.toContain("secrets.WEB_NEXT_PUBLIC_ANALYTICS");
    expect(ci).toContain("--require-production-config");
    expect(ci).toContain("--sort=name --mtime='UTC 1970-01-01'");
    expect(ci).toContain("id: upload-release");
    expect(ci).toContain("subject-name: fap-web-standalone-${{ github.sha }}.zip");
    expect(ci).toContain("subject-digest: sha256:${{ steps.upload-release.outputs.artifact-digest }}");
    expect(ci).toContain("name: fap-web-standalone-staging-${{ github.sha }}");
    expect(ci).toContain("NEXT_PUBLIC_API_URL: https://staging-api.fermatmind.com");
    expect(ci).toContain("--require-staging-config");
    expect(ci).toContain("subject-digest: sha256:${{ steps.upload-staging-release.outputs.artifact-digest }}");
    expect(ci).not.toContain("deploy_web_pm2.sh");
    expect(ci).not.toContain("ssh ");
    expect(deploy).toContain("ARTIFACT_ID: ${{ needs.policy.outputs.staging_release_id }}");
    expect(deploy).toContain("ARTIFACT_VARIANT: staging");
    expect(deploy).toContain("ARTIFACT_DIGEST: ${{ needs.policy.outputs.staging_release_digest }}");
    expect(deploy).toContain("STAGING_RELEASE_ID: ${{ steps.artifacts.outputs.staging_release_id }}");
    expect(prepareArtifact).toContain('verification_flag="--require-staging-config"');
    expect(prepareArtifact).toContain('verification_flag="--require-production-config"');
    expect(prepareArtifact).toContain('release_basename="fap-web-${DEPLOY_SHA}"');
    expect(prepareArtifact).toContain('archive="$root/fap-web-${DEPLOY_SHA}.tar.gz"');
  });
});

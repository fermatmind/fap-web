import { createHash } from "node:crypto";
import { execFileSync, spawnSync } from "node:child_process";
import fs, { readFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("staging standalone artifact deployment boundary", () => {
  const workflow = readFileSync(".github/workflows/deploy-staging.yml", "utf8");
  const installer = readFileSync("scripts/install_standalone_release.sh", "utf8");

  it("selects one successful exact-SHA CI artifact and rejects mutable or ambiguous identities", () => {
    expect(workflow).toContain('workflow_id: "ci.yml"');
    expect(workflow).toContain('candidate.head_sha === sha && candidate.event === "push"');
    expect(workflow).toContain('run?.status === "completed" && run.conclusion === "success"');
    expect(workflow).toContain("matches.length !== 1");
    expect(workflow).toContain("artifact.name === expectedName && !artifact.expired");
    expect(workflow).toContain('core.setOutput("artifact-digest", artifact.digest)');
    expect(workflow).not.toContain("standalone-latest");
  });

  it("installs into digest-addressed release directories with an atomic switch and rollback boundary", () => {
    expect(installer).toContain('release_dir="${releases_dir}/${DEPLOY_SHA}-${artifact_hex}"');
    expect(installer).toContain('actual_archive_sha256="$(sha256sum "$RELEASE_ARCHIVE"');
    expect(installer).toContain('actual_manifest_digest="sha256:$(sha256sum');
    expect(installer).toContain('mv -Tf "$source" "$target"');
    expect(installer).toContain('atomic_replace_link "${active_link}.next" "$active_link"');
    expect(installer).toContain("rollback_active_release");
    expect(installer).toContain(
      'atomic_replace_link "${releases_dir}/.previous.next" "${releases_dir}/previous"',
    );
    expect(installer).not.toContain("pnpm install");
    expect(installer).not.toContain("npm install");
    expect(installer).not.toContain("next build");
    expect(installer).toContain('RELEASES_TO_KEEP="${RELEASES_TO_KEEP:-3}"');
    expect(installer).toContain("cleanup_release_history");
    expect(installer).toContain("cleanup_transport_history");
  });

  it("writes a secret-free success receipt binding source and content digests", () => {
    for (const field of [
      "source_sha",
      "artifact_digest",
      "release_manifest_digest",
      "deploy_run_id",
      "deploy_run_attempt",
      'environment: "staging"',
      'result: "success"',
    ]) {
      expect(workflow).toContain(field);
    }
    expect(workflow).toContain("fap-web-staging-receipt-${{ env.DEPLOY_SHA }}");
    expect(workflow).not.toContain("SSH_PRIVATE_KEY,");
    expect(workflow).not.toContain("SSH_KNOWN_HOSTS,");
  });

  it("activates a digest-addressed fixture and rejects transfer tampering before mutation", () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "fap-web-staging-install-"));
    try {
      const sha = "0123456789abcdef0123456789abcdef01234567";
      const artifactDigest = `sha256:${"a".repeat(64)}`;
      const sourceRoot = path.join(root, "source");
      const releaseName = `fap-web-${sha}`;
      const release = path.join(sourceRoot, releaseName);
      const appDir = path.join(root, "app");
      const archive = path.join(root, `${releaseName}.tar.gz`);
      const deployController = path.join(root, "deploy.sh");
      const rollingController = path.join(root, "rolling.sh");

      fs.mkdirSync(release, { recursive: true });
      fs.mkdirSync(appDir, { recursive: true });
      fs.writeFileSync(path.join(release, "server.js"), "// fixture\n");
      fs.writeFileSync(path.join(release, "REVISION"), `${sha}\n`);
      fs.writeFileSync(path.join(release, "RELEASE_MANIFEST.json"), '{"schema":"fixture"}\n');
      fs.writeFileSync(deployController, "#!/usr/bin/env bash\nset -euo pipefail\ntest -f \"$APP_DIR/.next/standalone/server.js\"\n");
      fs.writeFileSync(rollingController, "#!/usr/bin/env bash\nexit 0\n");
      fs.chmodSync(deployController, 0o755);
      fs.chmodSync(rollingController, 0o755);
      execFileSync("tar", ["-czf", archive, "-C", sourceRoot, releaseName]);

      const digest = (file: string) =>
        createHash("sha256").update(fs.readFileSync(file)).digest("hex");
      const baseEnv = {
        ...process.env,
        APP_DIR: appDir,
        APP_USER: os.userInfo().username,
        DEPLOY_SHA: sha,
        ARTIFACT_DIGEST: artifactDigest,
        ARCHIVE_SHA256: digest(archive),
        RELEASE_MANIFEST_DIGEST: `sha256:${digest(path.join(release, "RELEASE_MANIFEST.json"))}`,
        RELEASE_ARCHIVE: archive,
        DEPLOY_SCRIPT: deployController,
        ROLLING_RELOAD_SCRIPT: rollingController,
      };

      const success = spawnSync("bash", ["scripts/install_standalone_release.sh"], {
        encoding: "utf8",
        env: baseEnv,
      });
      expect(success.status, `${success.stdout}\n${success.stderr}`).toBe(0);
      expect(fs.lstatSync(path.join(appDir, ".next/standalone")).isSymbolicLink()).toBe(true);
      expect(fs.readFileSync(path.join(appDir, ".next/standalone/REVISION"), "utf8")).toBe(`${sha}\n`);

      for (let index = 0; index < 4; index += 1) {
        const oldRelease = path.join(appDir, "releases", `old-${index}`);
        fs.mkdirSync(oldRelease);
      }
      const secondSuccess = spawnSync("bash", ["scripts/install_standalone_release.sh"], {
        encoding: "utf8",
        env: baseEnv,
      });
      expect(secondSuccess.status, `${secondSuccess.stdout}\n${secondSuccess.stderr}`).toBe(0);
      const retainedReleases = fs
        .readdirSync(path.join(appDir, "releases"), { withFileTypes: true })
        .filter((entry) => entry.isDirectory() && !entry.name.startsWith(".incoming."));
      expect(retainedReleases.length).toBeLessThanOrEqual(3);

      const untouchedApp = path.join(root, "untouched");
      fs.mkdirSync(untouchedApp);
      const tampered = spawnSync("bash", ["scripts/install_standalone_release.sh"], {
        encoding: "utf8",
        env: { ...baseEnv, APP_DIR: untouchedApp, ARCHIVE_SHA256: "b".repeat(64) },
      });
      expect(tampered.status).not.toBe(0);
      expect(`${tampered.stdout}${tampered.stderr}`).toContain("release archive digest mismatch");
      expect(fs.existsSync(path.join(untouchedApp, ".next/standalone"))).toBe(false);
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });
});

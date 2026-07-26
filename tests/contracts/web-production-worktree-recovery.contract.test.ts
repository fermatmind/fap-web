import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const workflow = readFileSync(".github/workflows/web-production-worktree-recovery.yml", "utf8");
const deployWorkflow = readFileSync(".github/workflows/deploy-production.yml", "utf8");
const script = readFileSync("scripts/ops/web-production-worktree-recovery.sh", "utf8");
const scriptPath = join(process.cwd(), "scripts/ops/web-production-worktree-recovery.sh");
const targetPath = "app/(localized)/[locale]/tests/[slug]/page.tsx";

function git(cwd: string, ...args: string[]): string {
  return execFileSync("git", args, { cwd, encoding: "utf8" }).trim();
}

function createDirtyFixture(): { repo: string; activeSha: string } {
  const repo = mkdtempSync(join(tmpdir(), "fap-web-worktree-recovery-"));
  git(repo, "init");
  git(repo, "config", "user.name", "Recovery Contract");
  git(repo, "config", "user.email", "recovery-contract@example.test");
  mkdirSync(join(repo, "app/(localized)/[locale]/tests/[slug]"), { recursive: true });
  writeFileSync(join(repo, targetPath), "committed\n");
  git(repo, "add", targetPath);
  git(repo, "commit", "-m", "fixture");
  const activeSha = git(repo, "rev-parse", "HEAD");
  writeFileSync(join(repo, targetPath), "production residue\n");
  return { repo, activeSha };
}

describe("web production worktree recovery", () => {
  it("keeps preflight read-only and apply bound to exact control, active, and residue SHAs", () => {
    expect(workflow).toContain("test \"$(git rev-parse origin/main)\" = \"$EXPECTED_CONTROL_PLANE_SHA\"");
    expect(workflow).toContain(
      "APPROVE_FAP_WEB_PRODUCTION_WORKTREE_RECOVERY:${EXPECTED_CONTROL_PLANE_SHA}:${EXPECTED_ACTIVE_SHA}:${EXPECTED_RESIDUE_SET_SHA256}",
    );
    expect(workflow).toContain("group: fap-web-production-mutation");
    expect(deployWorkflow).toContain("group: fap-web-production-mutation");
    for (const setting of [
      "WEB_NODE1_DEPLOY_HOST",
      "WEB_NODE1_DEPLOY_USER",
      "WEB_NODE1_DEPLOY_PORT",
    ]) {
      expect(workflow).toContain(setting);
      expect(deployWorkflow).toContain(setting);
    }
    expect(workflow).not.toMatch(/WEB_NODE1_(?:HOST|USER|SSH_PORT)\b/);
    expect(workflow).toContain("environment:\n      name: production");
    expect(workflow).toContain("if [[ \"$MODE\" == \"preflight\" ]]");
    expect(workflow).not.toContain("git reset --hard");
  });

  it("allows exactly one known tracked path and preserves a verified backup before restore", () => {
    expect(script).toContain("TARGET_PATH='app/(localized)/[locale]/tests/[slug]/page.tsx'");
    expect(script).toContain('[[ "${#tracked_paths[@]}" -eq 1 ]]');
    expect(script).toContain('[[ "${tracked_paths[0]}" == "$TARGET_PATH" ]]');
    expect(script).toContain('git diff --cached --quiet || fail "staged changes are not allowed"');
    expect(script).toContain('cp -p "$TARGET_PATH" "$backup_dir/original-page.tsx"');
    expect(script).toContain('git diff --binary -- "$TARGET_PATH" > "$backup_dir/worktree.patch"');
    expect(script).toContain('[[ "$backup_file_sha256" == "$file_sha256" ]]');
    expect(script).toContain('[[ "$backup_patch_sha256" == "$patch_sha256" ]]');
    expect(script).toContain('git restore --worktree --source=HEAD -- "$TARGET_PATH"');
  });

  it("does not deploy, restart processes, publish, or mutate content authority", () => {
    for (const forbidden of [
      "pm2 ",
      "systemctl",
      "deploy_web_pm2.sh",
      "artisan",
      "sitemap submission",
      "llms submission",
      "search submission",
    ]) {
      expect(`${workflow}\n${script}`).not.toContain(forbidden);
    }
  });

  it("preflights exact hashes, preserves a verified backup, and restores only the target", () => {
    const { repo, activeSha } = createDirtyFixture();
    const env = { ...process.env, APP_DIR: repo, EXPECTED_ACTIVE_SHA: activeSha };
    const receipt = JSON.parse(execFileSync("bash", [scriptPath, "preflight"], {
      env,
      encoding: "utf8",
    }));

    expect(receipt).toMatchObject({
      mode: "preflight",
      state: "dirty_exact_single_path",
      active_sha: activeSha,
      target_path: targetPath,
    });
    expect(receipt.file_sha256).toMatch(/^[0-9a-f]{64}$/);
    expect(receipt.patch_sha256).toMatch(/^[0-9a-f]{64}$/);
    expect(receipt.residue_set_sha256).toMatch(/^[0-9a-f]{64}$/);

    const applied = JSON.parse(execFileSync("bash", [scriptPath, "apply"], {
      env: {
        ...env,
        EXPECTED_FILE_SHA256: receipt.file_sha256,
        EXPECTED_PATCH_SHA256: receipt.patch_sha256,
        EXPECTED_RESIDUE_SET_SHA256: receipt.residue_set_sha256,
        RELEASE_ID: "contract-fixture",
      },
      encoding: "utf8",
    }));

    expect(applied.state).toBe("cleaned_exact_single_path");
    expect(readFileSync(join(repo, targetPath), "utf8")).toBe("committed\n");
    expect(readFileSync(applied.backup_dir + "/original-page.tsx", "utf8")).toBe("production residue\n");
    expect(git(repo, "status", "--short", "--untracked-files=no")).toBe("");
  });

  it("fails closed when any second tracked path is dirty", () => {
    const { repo, activeSha } = createDirtyFixture();
    writeFileSync(join(repo, "second.txt"), "committed\n");
    git(repo, "add", "second.txt");
    git(repo, "commit", "-m", "second fixture");
    writeFileSync(join(repo, "second.txt"), "also dirty\n");
    const currentSha = git(repo, "rev-parse", "HEAD");

    expect(() => execFileSync("bash", [scriptPath, "preflight"], {
      env: { ...process.env, APP_DIR: repo, EXPECTED_ACTIVE_SHA: currentSha },
      encoding: "utf8",
      stdio: "pipe",
    })).toThrow();
    expect(activeSha).not.toBe(currentSha);
  });
});

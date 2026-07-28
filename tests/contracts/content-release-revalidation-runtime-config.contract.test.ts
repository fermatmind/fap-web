import { execFileSync } from "node:child_process";
import {
  chmodSync,
  mkdtempSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const workflow = readFileSync(
  ".github/workflows/content-release-revalidation-runtime-config.yml",
  "utf8",
);
const runner = readFileSync(
  "scripts/content_release_revalidation_runtime_config.sh",
  "utf8",
);
const runnerPath = join(
  process.cwd(),
  "scripts/content_release_revalidation_runtime_config.sh",
);
const CONTROL_SHA = "a".repeat(40);
const FRONTEND_SHA = "b".repeat(40);
const SECRET = "shared_secret_with_sufficient_entropy_123456";
const REDIS_URL = "https://redis.example.test";
const REDIS_TOKEN = "redis_token_with_sufficient_entropy_123456";

function fixture() {
  const root = mkdtempSync(join(tmpdir(), "fap-web-revalidation-runtime-config-"));
  const bin = join(root, "bin");
  mkdirSync(bin);
  writeFileSync(join(root, "REVISION"), `${FRONTEND_SHA}\n`);
  writeFileSync(
    join(bin, "curl"),
    "#!/usr/bin/env bash\nprintf '{\"result\":null}\\n'\n",
  );
  writeFileSync(
    join(bin, "pm2"),
    `#!/usr/bin/env bash
if [[ "\${1:-}" == "jlist" ]]; then
  jq -cn \
    --arg secret "\${CONTENT_RELEASE_REVALIDATE_SECRET:-}" \
    --arg redis_url "\${CONTENT_RELEASE_REVALIDATE_REDIS_URL:-}" \
    --arg redis_token "\${CONTENT_RELEASE_REVALIDATE_REDIS_TOKEN:-}" \
    --arg app_dir "\${APP_DIR:-}" \
    '[{name:"fap-web",pm2_env:{status:"online",pm_cwd:$app_dir,pm_exec_path:($app_dir + "/.next/standalone/server.js"),exec_mode:"cluster_mode",CONTENT_RELEASE_REVALIDATE_SECRET:$secret,CONTENT_RELEASE_REVALIDATE_REDIS_URL:$redis_url,CONTENT_RELEASE_REVALIDATE_REDIS_TOKEN:$redis_token}}]'
  exit 0
fi
if [[ "\${1:-}" == "reload" ]]; then
  printf 'reloaded\\n' > "\${APP_DIR}/reload.marker"
  exit 0
fi
[[ "\${1:-}" == "save" ]]
`,
  );
  for (const path of [join(bin, "curl"), join(bin, "pm2")]) {
    chmodSync(path, 0o755);
  }
  return { root, bin };
}

function run(
  root: string,
  bin: string,
  extra: Record<string, string> = {},
): Record<string, unknown> {
  const output = execFileSync("bash", [runnerPath], {
    env: {
      ...process.env,
      PATH: `${bin}:${process.env.PATH}`,
      MODE: "preflight",
      APP_DIR: root,
      MANAGED_APP_DIR: root,
      APP_NAME: "fap-web",
      EXPECTED_CONTROL_PLANE_SHA: CONTROL_SHA,
      EXPECTED_FRONTEND_SHA: FRONTEND_SHA,
      CONTENT_RELEASE_REVALIDATE_SECRET: SECRET,
      CONTENT_RELEASE_REVALIDATE_REDIS_URL: REDIS_URL,
      CONTENT_RELEASE_REVALIDATE_REDIS_TOKEN: REDIS_TOKEN,
      ...extra,
    },
    encoding: "utf8",
  });
  return JSON.parse(output) as Record<string, unknown>;
}

describe("content-release revalidation runtime config control plane", () => {
  it("binds apply to latest main, green checks, an immutable preflight, and exact runtime state", () => {
    expect(workflow).toContain('test "$(git rev-parse origin/main)" = "$EXPECTED_CONTROL_PLANE_SHA"');
    expect(workflow).toContain("Verify required checks are green");
    expect(workflow).toContain("Validate immutable preflight receipt");
    expect(workflow).toContain(
      '".github/workflows/content-release-revalidation-runtime-config.yml"',
    );
    expect(workflow).toContain(".runtime_fingerprint_sha256 == $runtime_sha");
    expect(workflow).toContain(".source_credential_bundle_sha256 == $credential_sha");
    expect(runner).toContain('[[ "$env_sha256" == "$EXPECTED_ENV_SHA256" ]]');
    expect(runner).toContain(
      '[[ "$runtime_fingerprint_sha256" == "$EXPECTED_RUNTIME_FINGERPRINT_SHA256" ]]',
    );
    expect(runner).toContain(
      '[[ "$source_bundle_sha256" == "$EXPECTED_CREDENTIAL_BUNDLE_SHA256" ]]',
    );
    expect(runner).toContain('[[ "$AUTHORIZATION_PHRASE" == "$expected_phrase" ]]');
  });

  it("uses protected production secrets without an Actions-variable or job-level routing fallback", () => {
    expect(workflow).toContain("environment:\n      name: production");
    for (const secret of [
      "WEB_NODE1_DEPLOY_HOST",
      "WEB_NODE1_DEPLOY_USER",
      "WEB_NODE1_DEPLOY_PORT",
      "CONTENT_RELEASE_REVALIDATE_SECRET",
      "CONTENT_RELEASE_REVALIDATE_REDIS_URL",
      "CONTENT_RELEASE_REVALIDATE_REDIS_TOKEN",
    ]) {
      expect(workflow).toContain(`secrets.${secret}`);
    }
    expect(workflow).not.toContain("vars.");
    const jobEnv = workflow.slice(
      workflow.indexOf("    env:"),
      workflow.indexOf("    steps:"),
    );
    expect(jobEnv).not.toContain("DEPLOY_HOST:");
    expect(jobEnv).not.toContain("DEPLOY_USER:");
    expect(jobEnv).not.toContain("DEPLOY_PORT:");
    expect(jobEnv).not.toContain("CONTENT_RELEASE_REVALIDATE_SECRET:");
  });

  it("keeps preflight read-only and makes the Redis probe use the runtime REST contract", () => {
    expect(runner).toContain("--request POST");
    expect(runner).toContain(
      '"${redis_url%/}/GET/fap%3Arevalidate%3Aconfig-preflight%3Anonexistent"',
    );
    expect(runner).toContain('"PASS_AUTHORIZATION_REQUIRED"');
    expect(runner).toContain('"PASS_PREFLIGHT_CONFIG_INPUT_REQUIRED"');
    expect(runner).toContain("production_write_execution: false");
    expect(runner).toContain("writes_committed: false");
    expect(runner).toContain("cache_revalidation: false");
  });

  it("executes a zero-write preflight and an exact-authorized three-setting apply", () => {
    const { root, bin } = fixture();
    try {
      const preflight = run(root, bin);
      expect(preflight).toMatchObject({
        ok: true,
        status: "PASS_AUTHORIZATION_REQUIRED",
        apply_ready: true,
        active_frontend_sha: FRONTEND_SHA,
        writes_committed: false,
      });
      expect(() => readFileSync(join(root, ".env.production.local"))).toThrow();

      const envSha = String(preflight.env_sha256);
      const runtimeFingerprint = String(preflight.runtime_fingerprint_sha256);
      const credentialBundle = String(preflight.source_credential_bundle_sha256);
      const runId = "123456";
      const attempt = "1";
      const phrase =
        `I explicitly approve fap-web content-release revalidation runtime config convergence from preflight run ${runId} attempt ${attempt} with control-plane SHA ${CONTROL_SHA} active frontend SHA ${FRONTEND_SHA} environment SHA256 ${envSha} runtime fingerprint ${runtimeFingerprint} credential bundle SHA256 ${credentialBundle}; write only the three revalidation runtime settings, rolling reload only fap-web PM2, persist PM2 state, no application deploy/cache revalidation/CMS/backend/database/PR23/automatic rollback.`;
      const applied = run(root, bin, {
        MODE: "apply",
        EXPECTED_ENV_SHA256: envSha,
        EXPECTED_RUNTIME_FINGERPRINT_SHA256: runtimeFingerprint,
        EXPECTED_CREDENTIAL_BUNDLE_SHA256: credentialBundle,
        PREFLIGHT_RUN_ID: runId,
        PREFLIGHT_RUN_ATTEMPT: attempt,
        AUTHORIZATION_PHRASE: phrase,
      });

      expect(applied).toMatchObject({
        ok: true,
        status: "PASS_RUNTIME_CONFIG_CONVERGED",
        writes_committed: true,
        runtime_setting_write_count: 3,
        pm2_reload_committed: true,
        pm2_state_persisted: true,
      });
      const envFile = readFileSync(join(root, ".env.production.local"), "utf8");
      expect(envFile).toContain(`CONTENT_RELEASE_REVALIDATE_SECRET=${SECRET}`);
      expect(envFile).toContain(`CONTENT_RELEASE_REVALIDATE_REDIS_URL=${REDIS_URL}`);
      expect(envFile).toContain(`CONTENT_RELEASE_REVALIDATE_REDIS_TOKEN=${REDIS_TOKEN}`);
      expect(readFileSync(join(root, "reload.marker"), "utf8")).toBe("reloaded\n");
      expect(JSON.stringify(applied)).not.toContain(SECRET);
      expect(JSON.stringify(applied)).not.toContain(REDIS_TOKEN);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("writes only the three runtime settings and reports partial apply failures truthfully", () => {
    for (const key of [
      "CONTENT_RELEASE_REVALIDATE_SECRET",
      "CONTENT_RELEASE_REVALIDATE_REDIS_URL",
      "CONTENT_RELEASE_REVALIDATE_REDIS_TOKEN",
    ]) {
      expect(runner).toContain(`"${key}"`);
    }
    expect(runner).toContain("WRITES_COMMITTED=true");
    expect(runner).toContain("RUNTIME_SETTING_WRITE_COUNT=3");
    expect(runner).toContain('"FAIL_CLOSED_PARTIAL_CONFIG_WRITE"');
    expect(runner).toContain("PM2_RELOAD_COMMITTED=true");
    expect(runner).toContain("PM2_STATE_PERSISTED=true");
    expect(runner).toContain('pm2 reload "$APP_NAME" --update-env');
    expect(runner).not.toContain("pm2 restart");
    expect(runner).not.toContain("pm2 delete");
    expect(runner).toContain("secret_values_output: false");
  });

  it("keeps preflight and apply fingerprints comparable while excluding only execution metadata", () => {
    expect(runner).toContain(
      "del(.mode, .runtime_fingerprint_sha256, .ok, .status, .apply_ready)",
    );
  });

  it("does not deploy application code, revalidate content, or automatically roll back", () => {
    const combined = `${workflow}\n${runner}`;
    for (const forbidden of [
      "git reset --hard",
      "git checkout",
      "deploy_web_pm2.sh",
      "/api/content-release/revalidate",
      "automatic_rollback: true",
    ]) {
      expect(combined).not.toContain(forbidden);
    }
    expect(runner).toContain('[[ "$APP_DIR" == "$MANAGED_APP_DIR" ]]');
    expect(runner).toContain('[[ "$APP_NAME" == "fap-web" ]]');
  });
});

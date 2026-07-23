import { execFileSync, spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";

const configPath = "deploy/openresty/fap-web-public.conf";
const validatorPath = "scripts/ops/validate-web-public-ingress-config.mjs";
const config = readFileSync(configPath, "utf8");
const control = readFileSync("scripts/ops/web-public-ingress.sh", "utf8");
const imageTest = readFileSync("scripts/ops/test-web-public-ingress-openresty.sh", "utf8");
const workflow = readFileSync(".github/workflows/web-public-ingress.yml", "utf8");
const configWorkflow = readFileSync(".github/workflows/web-public-ingress-config.yml", "utf8");
const probe = readFileSync("scripts/ops/probe-web-public-ingress.mjs", "utf8");
const repositoryRules = readFileSync("AGENTS.md", "utf8");
const temporaryDirectories: string[] = [];

function validate(candidate: string) {
  const directory = mkdtempSync(path.join(tmpdir(), "fap-web-ingress-"));
  temporaryDirectories.push(directory);
  const candidatePath = path.join(directory, "candidate.conf");
  writeFileSync(candidatePath, candidate, "utf8");
  return spawnSync(process.execPath, [validatorPath, "--config", candidatePath], {
    cwd: process.cwd(),
    encoding: "utf8",
  });
}

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) {
    rmSync(directory, { recursive: true, force: true });
  }
});

describe("versioned public ingress cache boundary", () => {
  it("accepts the canonical two-vhost, static-only cache candidate", () => {
    const result = validate(config);
    expect(result.status, result.stderr).toBe(0);
    expect(result.stdout).toContain("config valid");
  });

  it("fails closed on duplicate vhosts, HTML cache, or forced shared-cache headers", () => {
    expect(validate(`${config}\n${config}`).status).not.toBe(0);
    expect(validate(config.replace("listen 443 ssl;", "listen 443;")).status).not.toBe(0);
    expect(validate(config.replace("proxy_cache off;", "proxy_cache fermatmind_public;")).status).not.toBe(0);
    expect(validate(config.replace("add_header X-Proxy-Cache BYPASS always;", 'add_header Cache-Control "public, s-maxage=60" always;')).status).not.toBe(0);
  });

  it("recognizes IPv4 and IPv6 TLS listeners without treating plain port 443 as HTTPS", () => {
    expect(validate(config.replace("listen 443 ssl;", "listen [::]:443 ssl;")).status).toBe(0);
    expect(control).toContain("([^;[:space:]]*:)?443([^;]*[[:space:]])ssl([[:space:];])");
  });

  it("keeps live backups outside the include root and requires exact drift hashes", () => {
    expect(control).toContain('[[ "$OPENRESTY_BACKUP_DIR" != "$OPENRESTY_CONFIG_ROOT"/* ]]');
    expect(control).toContain('[[ "$OPENRESTY_BACKUP_DIR" != "$OPENRESTY_CONFIG_ROOT" ]]');
    expect(control).toContain('while [[ "$OPENRESTY_CONFIG_ROOT" == */ ]]');
    expect(control).toContain('while [[ "$OPENRESTY_BACKUP_DIR" == */ ]]');
    expect(control).toContain("live_backup_count");
    expect(control).toContain('[[ "$current_live_backups" == "0" ]]');
    expect(control).toContain('[[ "$current_set_sha" == "$EXPECTED_CONFIG_SET_SHA256" ]]');
    expect(control).toContain('[[ "$(matching_https_vhosts)" != "1" ]]');
    expect(control).toContain("trap restore_on_apply_error ERR");
    expect(control).toContain("restore_required=true");
    expect(control).toContain("Finish the complete backup set before mutating any live include file.");
    expect(control).not.toContain("openresty -s reload ||");
  });

  it("pins syntax validation to the observed production image digest", () => {
    expect(imageTest).toContain("1panel/openresty@sha256:ee8c5117c291c7384a381c32068e1d9a50adc8bf392f9157c42d14bedbbe018b");
    expect(imageTest).toContain("openresty -t -c /tmp/nginx.conf");
    expect(configWorkflow).toContain("Test with the production OpenResty image digest");
    expect(configWorkflow).toContain("bash scripts/ops/test-web-public-ingress-openresty.sh");
    expect(configWorkflow.match(/scripts\/ops\/web-public-ingress\.sh/g)).toHaveLength(3);
    expect(control).toContain("image inspect --format '{{range .RepoDigests}}{{println .}}{{end}}'");
    expect(control).toContain('grep -Fqx "$EXPECTED_IMAGE_REPO_DIGEST"');
  });

  it("preserves HSTS in every location that defines response headers", () => {
    expect(config.match(/add_header Strict-Transport-Security/g)).toHaveLength(5);
  });

  it("records the ingress authority in repository rules", () => {
    expect(repositoryRules).toContain("## Production ingress boundary");
    expect(repositoryRules).toContain("nonce-bearing HTML");
    expect(repositoryRules).toContain("Web Public Ingress Control");
  });

  it("requires separate exact apply and rollback authorization", () => {
    expect(workflow).toContain("environment:\n      name: production");
    expect(workflow).toContain("APPROVE_FAP_WEB_PUBLIC_INGRESS:${DEPLOY_SHA}:${candidate_sha}:${CURRENT_CONFIG_SET_SHA256}");
    expect(workflow).toContain("APPROVE_FAP_WEB_PUBLIC_INGRESS_ROLLBACK:${DEPLOY_SHA}:${ROLLBACK_RELEASE_ID}:${BACKUP_CONFIG_SET_SHA256}:${CURRENT_CONFIG_SET_SHA256}");
    expect(workflow).toContain("Run read-only ingress preflight");
    expect(workflow).not.toContain("--expected-revision");
    expect(workflow).not.toContain("pull_request:");
    expect(workflow).not.toContain("push:");
  });

  it("keeps ingress routing metadata masked as production environment secrets", () => {
    const secretBindings = [
      "DEPLOY_HOST: ${{ secrets.WEB_NODE1_DEPLOY_HOST }}",
      "DEPLOY_USER: ${{ secrets.WEB_NODE1_DEPLOY_USER }}",
      "DEPLOY_PORT: ${{ secrets.WEB_NODE1_DEPLOY_PORT }}",
      "PUBLIC_BASE_URL: ${{ secrets.WEB_PUBLIC_BASE_URL }}",
      "OPENRESTY_CONTAINER: ${{ secrets.WEB_NODE1_OPENRESTY_CONTAINER }}",
      "OPENRESTY_CONFIG_ROOT: ${{ secrets.WEB_NODE1_OPENRESTY_CONFIG_ROOT }}",
      "OPENRESTY_MANAGED_FILES: ${{ secrets.WEB_NODE1_OPENRESTY_MANAGED_FILES }}",
      "OPENRESTY_PRIMARY_FILE: ${{ secrets.WEB_NODE1_OPENRESTY_PRIMARY_FILE }}",
      "OPENRESTY_BACKUP_DIR: ${{ secrets.WEB_NODE1_OPENRESTY_BACKUP_DIR }}",
    ];

    for (const binding of secretBindings) {
      expect(workflow).toContain(binding);
    }
    expect(workflow).not.toContain("vars.WEB_NODE1_");
    expect(workflow).not.toContain("vars.WEB_PUBLIC_BASE_URL");
    expect(workflow).toContain('test -n "$DEPLOY_PORT"');
    expect(workflow).not.toContain('${DEPLOY_PORT:=22}');
    expect(workflow).toContain("Never add an Actions-variable fallback.");
    expect(repositoryRules).toContain("must be production environment secrets only");
  });

  it("probes nonce uniqueness, non-shared HTML, immutable static assets and direct revision", () => {
    expect(probe).toContain("independent_response_nonces");
    expect(probe).toContain("non_shared_html");
    expect(probe).toContain("static_asset_immutable_cache");
    expect(probe).toContain("html_private_no_store");
    expect(probe).toContain("html_proxy_cache_hit");
    expect(probe).toContain('redirect: "manual"');
    expect(probe).toContain("revision endpoint did not return direct 200");
    expect(probe).not.toContain("writeFile");
    expect(probe).not.toContain("nonce,");
  });

  it("keeps shell syntax valid", () => {
    expect(() => execFileSync("bash", ["-n", "scripts/ops/web-public-ingress.sh"])).not.toThrow();
    expect(() => execFileSync("bash", ["-n", "scripts/ops/test-web-public-ingress-openresty.sh"])).not.toThrow();
  });
});

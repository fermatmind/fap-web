import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import { classifyCertificate } from "../../scripts/ops/check-public-tls-certificates.mjs";

const workflow = readFileSync(".github/workflows/live-result-smoke.yml", "utf8");
const webIngress = readFileSync("deploy/openresty/fap-web-public.conf", "utf8");
const stagingAcme = readFileSync("deploy/nginx/fap-staging-acme-location.conf", "utf8");
const deployHook = readFileSync("deploy/tls/fermatmind-certbot-deploy-hook.sh", "utf8");

describe("Alibaba public TLS certificate renewal", () => {
  it("checks all four public hosts daily with 21/14/7 day thresholds", () => {
    expect(workflow).toContain("cron: \"17 20 * * *\"");
    expect(workflow).toContain("Public TLS certificate expiry");
    expect(workflow).toContain("fermatmind.com,api.fermatmind.com,staging.fermatmind.com,staging-api.fermatmind.com");
    expect(workflow).toContain("--alert-days 21,14,7");
  });

  it("classifies renewal headroom deterministically", () => {
    const now = new Date("2026-08-10T00:00:00.000Z");
    const expiresIn = (days: number) => new Date(now.getTime() + days * 86_400_000);

    expect(classifyCertificate(expiresIn(22), now).status).toBe("ok");
    expect(classifyCertificate(expiresIn(21), now).status).toBe("warning");
    expect(classifyCertificate(expiresIn(14), now).status).toBe("urgent");
    expect(classifyCertificate(expiresIn(7), now).status).toBe("critical");
    expect(classifyCertificate(expiresIn(-1), now).status).toBe("expired");
  });

  it("uses persistent ACME webroots for production Web and staging", () => {
    expect(webIngress).toContain("root /www/acme;");
    expect(stagingAcme).toContain("root /var/www/letsencrypt;");
  });

  it("reloads only the role-specific ingress after installing renewed files", () => {
    expect(deployHook).toContain('role="${FERMATMIND_TLS_ROLE:-}"');
    expect(deployHook).toContain("docker exec \"$container\" /usr/local/openresty/bin/openresty -t");
    expect(deployHook).toContain("docker exec \"$container\" /usr/local/openresty/bin/openresty -s reload");
    expect(deployHook).toContain("/usr/local/nginx/sbin/nginx -t");
    expect(deployHook).toContain("systemctl reload nginx.service");
    expect(deployHook).toContain("with_rollback");
    expect(deployHook).toContain("prior pair restored");
    expect(deployHook).toContain('readonly container_name="fermatmind-openresty"');
    expect(deployHook).toContain('reload_production_web "$container_name"');
    expect(deployHook).not.toContain('readonly container="fermatmind-openresty"');
    expect(deployHook).not.toContain("restart");
    expect(() => execFileSync("bash", ["-n", "deploy/tls/fermatmind-certbot-deploy-hook.sh"])).not.toThrow();
  });
});

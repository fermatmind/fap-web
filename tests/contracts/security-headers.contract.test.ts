import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();

function read(relPath: string): string {
  return fs.readFileSync(path.join(ROOT, relPath), "utf8");
}

describe("security headers baseline contract", () => {
  it("next config defines required security header keys", () => {
    const nextConfig = read("next.config.mjs");

    expect(nextConfig).toContain("X-Frame-Options");
    expect(nextConfig).toContain("X-Content-Type-Options");
    expect(nextConfig).toContain("Referrer-Policy");
    expect(nextConfig).toContain("Permissions-Policy");
    expect(nextConfig).toContain("Strict-Transport-Security");
    expect(nextConfig).toContain('source: "/:path*"');
  });

  it("nginx config defines required add_header fallback rules", () => {
    const nginxConf = read("deploy/nginx/fap-web.conf");

    expect(nginxConf).toContain("add_header X-Frame-Options");
    expect(nginxConf).toContain("add_header X-Content-Type-Options");
    expect(nginxConf).toContain("add_header Referrer-Policy");
    expect(nginxConf).toContain("add_header Permissions-Policy");
    expect(nginxConf).toContain("add_header Strict-Transport-Security");
    expect(nginxConf).toContain("Per-request nonce CSP");
  });

  it("csp stays report-only so browser annotation tooling is never blocked", () => {
    const csp = read("lib/security/contentSecurityPolicy.ts");
    const nginxConf = read("deploy/nginx/fap-web.conf");

    expect(csp).toContain("Content-Security-Policy-Report-Only");
    expect(csp).toContain('headers.delete("Content-Security-Policy")');
    expect(csp).not.toContain('headers.set("Content-Security-Policy",');
    expect(csp).toContain("'nonce-${nonce}'");
    expect(csp).toContain("'strict-dynamic'");
    expect(csp).not.toContain("'unsafe-inline'");
    expect(csp).not.toContain("'unsafe-eval'");
    expect(csp).not.toContain("report-uri");
    expect(csp).not.toContain("report-to");

    expect(nginxConf).not.toContain("add_header Content-Security-Policy");
    expect(nginxConf).not.toContain("'unsafe-eval'");
    expect(nginxConf).not.toContain("report-uri");
    expect(nginxConf).not.toContain("report-to");
  });

  it("allows consent-gated GA4 and Baidu Tongji script loaders only", () => {
    const csp = read("lib/security/contentSecurityPolicy.ts");

    for (const source of [csp]) {
      expect(source).toContain("https://www.googletagmanager.com");
      expect(source).toContain("https://hm.baidu.com");
      expect(source).not.toContain("https://www.google-analytics.com");
      expect(source).not.toContain("https://analytics.google.com");
      expect(source).not.toContain("https://tongji.baidu.com");
    }
  });

  it("keeps every environment report-only even when stale deployment config requests enforce", async () => {
    const { applyNonceCspHeaders, buildNonceCsp } = await import("@/lib/security/contentSecurityPolicy");
    const policy = buildNonceCsp("noncevalue1234567890");
    const reportOnlyHeaders = new Headers({ "Content-Security-Policy": "stale" });
    const staleEnforceHeaders = new Headers({ "Content-Security-Policy": "stale" });
    applyNonceCspHeaders(reportOnlyHeaders, "noncevalue1234567890");
    applyNonceCspHeaders(staleEnforceHeaders, "noncevalue1234567890");

    expect(policy).toContain("nonce-noncevalue1234567890");
    expect(policy).not.toContain("unsafe-inline");
    expect(reportOnlyHeaders.has("Content-Security-Policy")).toBe(false);
    expect(reportOnlyHeaders.get("Content-Security-Policy-Report-Only")).toBe(policy);
    expect(staleEnforceHeaders.has("Content-Security-Policy")).toBe(false);
    expect(staleEnforceHeaders.get("Content-Security-Policy-Report-Only")).toBe(policy);
  });
});

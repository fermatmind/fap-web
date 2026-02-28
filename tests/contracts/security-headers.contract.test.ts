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
    expect(nextConfig).toContain("Content-Security-Policy-Report-Only");
    expect(nextConfig).toContain('source: "/:path*"');
  });

  it("nginx config defines required add_header fallback rules", () => {
    const nginxConf = read("deploy/nginx/fap-web.conf");

    expect(nginxConf).toContain("add_header X-Frame-Options");
    expect(nginxConf).toContain("add_header X-Content-Type-Options");
    expect(nginxConf).toContain("add_header Referrer-Policy");
    expect(nginxConf).toContain("add_header Permissions-Policy");
    expect(nginxConf).toContain("add_header Strict-Transport-Security");
    expect(nginxConf).toContain("add_header Content-Security-Policy-Report-Only");
  });

  it("csp is report-only and does not include report-uri/report-to", () => {
    const nextConfig = read("next.config.mjs");
    const nginxConf = read("deploy/nginx/fap-web.conf");

    expect(nextConfig).toContain("Content-Security-Policy-Report-Only");
    expect(nextConfig).not.toContain("report-uri");
    expect(nextConfig).not.toContain("report-to");

    expect(nginxConf).toContain("Content-Security-Policy-Report-Only");
    expect(nginxConf).not.toContain("report-uri");
    expect(nginxConf).not.toContain("report-to");
  });
});

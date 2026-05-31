import fs from "node:fs";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { buildApiUrl } from "@/lib/api-base";

const ROOT = process.cwd();

function read(relPath: string): string {
  return fs.readFileSync(path.join(ROOT, relPath), "utf8");
}

describe("api proxy routing contract", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("routes browser-side API calls through same-origin /api", () => {
    vi.stubGlobal("window", {} as Window & typeof globalThis);

    expect(buildApiUrl("/v0.3/auth/guest")).toBe("/api/v0.3/auth/guest");
    expect(buildApiUrl("/api/v0.3/auth/guest")).toBe("/api/v0.3/auth/guest");
  });

  it("keeps server-side API calls on apex public API when production API env is absent", () => {
    vi.stubGlobal("window", undefined);
    vi.stubEnv("NEXT_PUBLIC_API_URL", "");

    expect(buildApiUrl("/v0.5/content-pages/brand?locale=en&org_id=0")).toBe(
      "https://fermatmind.com/api/v0.5/content-pages/brand?locale=en&org_id=0"
    );
  });

  it("honors an explicit server-side API origin for SSR fetches", () => {
    vi.stubGlobal("window", undefined);
    vi.stubEnv("NEXT_PUBLIC_API_URL", "https://api.fermatmind.com");

    expect(buildApiUrl("/v0.3/scales/lookup?slug=mbti&locale=zh")).toBe(
      "https://api.fermatmind.com/api/v0.3/scales/lookup?slug=mbti&locale=zh"
    );
  });

  it("defines a same-origin v0.3 rewrite in next config", () => {
    const nextConfig = read("next.config.mjs");

    expect(nextConfig).toContain('source: "/api/v0.3/:path*"');
    expect(nextConfig).toContain('destination: `${apiOrigin}/api/v0.3/:path*`');
  });

  it("narrows the same-origin v0.5 proxy to public route families", () => {
    const nextConfig = read("next.config.mjs");

    expect(nextConfig).toContain("publicV05ApiProxySources");
    expect(nextConfig).toContain('"/api/v0.5/articles/:slug"');
    expect(nextConfig).toContain('"/api/v0.5/career/recommendations/mbti/:type"');
    expect(nextConfig).toContain('"/api/v0.5/career/recommendations/mbti/:type/explainability"');
    expect(nextConfig).toContain('"/api/v0.5/personality/:slug"');
    expect(nextConfig).toContain('"/api/v0.5/career/shortlist/state"');
    expect(nextConfig).not.toContain('source: "/api/v0.5/:path*"');
    expect(nextConfig).not.toContain('"/api/v0.5/career/recommendations/mbti/:path*"');
    expect(nextConfig).not.toContain('"/api/v0.5/career/shortlist/:path*"');
    expect(nextConfig).not.toContain('"/api/v0.5/career/recommendations/mbti/:type/feedback"');
    expect(nextConfig).not.toContain('"/api/v0.5/internal/:path*"');
    expect(nextConfig).not.toContain('"/api/v0.5/internal/career/crosswalk/:path*"');
  });

  it("proxies public Foundation Daily Giving API paths through same-origin rewrites", () => {
    const nextConfig = read("next.config.mjs");

    for (const source of [
      "/api/v0.5/foundation/giving-records",
      "/api/v0.5/foundation/giving-records/:recordCode",
      "/api/v0.5/foundation/giving-records/months",
      "/api/v0.5/foundation/giving-records/months/:yearMonth",
    ] as const) {
      expect(nextConfig).toContain(`"${source}"`);
    }

    expect(nextConfig).not.toContain('"/api/v0.5/foundation/:path*"');
  });

  it("keeps the careers content page separate from the career hub", () => {
    const nextConfig = read("next.config.mjs");

    expect(nextConfig).toContain('source: "/careers"');
    expect(nextConfig).toContain('destination: "/zh/careers"');
    expect(nextConfig).not.toContain('source: "/zh/careers"');
    expect(nextConfig).not.toContain('destination: "/zh/career"');
  });

  it("keeps public utility and trust aliases off bare 404 routes", () => {
    const nextConfig = read("next.config.mjs");

    for (const [source, destination] of [
      ["/en/help/method-boundaries", "/en/method-boundaries"],
      ["/zh/help/method-boundaries", "/zh/method-boundaries"],
      ["/en/results", "/en/results/lookup"],
      ["/zh/results", "/zh/results/lookup"],
      ["/en/order/lookup", "/en/orders/lookup"],
      ["/zh/order/lookup", "/zh/orders/lookup"],
    ] as const) {
      expect(nextConfig).toContain(`source: "${source}"`);
      expect(nextConfig).toContain(`destination: "${destination}"`);
    }
  });
});

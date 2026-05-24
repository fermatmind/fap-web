import path from "node:path";
import { pathToFileURL } from "node:url";
import { describe, expect, it } from "vitest";
import { shouldNoindex } from "@/lib/seo/indexingPolicy";

const ROOT = process.cwd();

type HeaderRule = {
  source: string;
  headers: Array<{ key: string; value: string }>;
};

async function loadHeaders(): Promise<HeaderRule[]> {
  const configUrl = pathToFileURL(path.join(ROOT, "next.config.mjs")).href;
  const { default: nextConfig } = (await import(`${configUrl}?headers=${Date.now()}`)) as {
    default: { headers: () => Promise<HeaderRule[]> };
  };

  return nextConfig.headers();
}

function noindexHeaderFor(rule: HeaderRule | undefined): string {
  return rule?.headers.find((header) => header.key.toLowerCase() === "x-robots-tag")?.value.toLowerCase() ?? "";
}

describe("private noindex boundary contract", () => {
  it("declares X-Robots-Tag noindex headers for private localized and root flows", async () => {
    const headers = await loadHeaders();

    for (const source of [
      "/result/:path*",
      "/en/result/:path*",
      "/zh/result/:path*",
      "/orders/:path*",
      "/en/orders/:path*",
      "/zh/orders/:path*",
      "/pay/:path*",
      "/en/pay/:path*",
      "/zh/pay/:path*",
      "/payment/:path*",
      "/en/payment/:path*",
      "/zh/payment/:path*",
      "/share/:path*",
      "/en/share/:path*",
      "/zh/share/:path*",
      "/tests/:slug/take",
      "/en/tests/:slug/take",
      "/zh/tests/:slug/take",
    ]) {
      expect(noindexHeaderFor(headers.find((rule) => rule.source === source))).toContain("noindex");
    }
  });

  it("keeps private paths excluded from indexability policy", () => {
    for (const pathName of [
      "/en/result/codex-scan",
      "/en/orders/codex-scan",
      "/pay/codex-scan",
      "/en/pay/codex-scan",
      "/zh/payment/codex-scan",
      "/en/share/codex-scan",
      "/share/codex-scan",
      "/en/tests/mbti-personality-test-16-personality-types/take",
    ]) {
      expect(shouldNoindex(pathName, null)).toBe(true);
    }
  });
});

import path from "node:path";
import { pathToFileURL } from "node:url";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();

type RedirectRule = {
  source: string;
  has?: Array<{ type: string; value: string }>;
  destination: string;
  permanent: boolean;
};

describe("canonical domain redirect contract", () => {
  it("declares www to apex as the first Next redirect", async () => {
    const configUrl = pathToFileURL(path.join(ROOT, "next.config.mjs")).href;
    const { default: nextConfig } = (await import(configUrl)) as {
      default: { redirects: () => Promise<RedirectRule[]> };
    };

    const redirects = await nextConfig.redirects();
    expect(redirects[0]).toEqual({
      source: "/:path*",
      has: [{ type: "host", value: "www.fermatmind.com" }],
      destination: "https://fermatmind.com/:path*",
      permanent: true,
    });
    expect(redirects[1]?.source).toBe("/tests");
  });
});

import { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  clearLlmsFullResponseCache: vi.fn(),
  revalidatePath: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: mocks.revalidatePath,
}));

vi.mock("@/lib/seo/llmsFullResponseCache", () => ({
  clearLlmsFullResponseCache: mocks.clearLlmsFullResponseCache,
}));

import { collectPathDecisions, POST } from "@/app/api/content-release/revalidate/route";

describe("PR-FDN-01 llms-full recheck or repair", () => {
  afterEach(() => {
    mocks.clearLlmsFullResponseCache.mockClear();
    mocks.revalidatePath.mockClear();
    delete process.env.CONTENT_RELEASE_REVALIDATE_TOKEN;
  });

  it("derives the localized content page path plus llms surfaces for foundation releases", () => {
    const decisions = collectPathDecisions(
      {
        content: {
          type: "content_page",
          slug: "foundation",
          locale: "en",
        },
      },
      "https://fermatmind.com"
    );

    expect(decisions.rejected).toEqual([]);
    expect(decisions.accepted).toEqual(["/en/foundation", "/llms.txt", "/llms-full.txt"]);
  });

  it("revalidates accepted content page and llms paths while clearing llms-full process cache", async () => {
    process.env.CONTENT_RELEASE_REVALIDATE_TOKEN = "release-token";

    const request = new NextRequest("https://fermatmind.com/api/content-release/revalidate", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-fm-content-release-token": "release-token",
      },
      body: JSON.stringify({
        content: {
          type: "content_page",
          slug: "foundation",
          locale: "en",
        },
      }),
    });

    const response = await POST(request);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.revalidated_paths).toEqual(["/en/foundation", "/llms.txt", "/llms-full.txt"]);
    expect(payload.rejected_paths).toEqual([]);
    expect(mocks.revalidatePath).toHaveBeenCalledTimes(3);
    expect(mocks.revalidatePath).toHaveBeenNthCalledWith(1, "/en/foundation");
    expect(mocks.revalidatePath).toHaveBeenNthCalledWith(2, "/llms.txt");
    expect(mocks.revalidatePath).toHaveBeenNthCalledWith(3, "/llms-full.txt");
    expect(mocks.clearLlmsFullResponseCache).toHaveBeenCalledTimes(1);
  });
});

import { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  invalidateLlmsFullResponseCache: vi.fn(async () => undefined),
  scheduleLlmsFullResponseCacheRebuild: vi.fn(),
  revalidatePath: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: mocks.revalidatePath,
}));

vi.mock("@/lib/seo/llmsFullResponseCache", () => ({
  invalidateLlmsFullResponseCache: mocks.invalidateLlmsFullResponseCache,
}));

vi.mock("@/lib/seo/llmsFullRoute", () => ({
  scheduleLlmsFullResponseCacheRebuild: mocks.scheduleLlmsFullResponseCacheRebuild,
}));

vi.mock("@/lib/security/contentReleaseRevalidationAuth", () => ({
  authenticateContentReleaseRevalidation: vi.fn(async () => ({ ok: true, nonceHash: "test-nonce-hash" })),
}));

import { collectPathDecisions, POST } from "@/lib/contentRelease/revalidateRoute";

describe("PR-FDN-01 llms-full recheck or repair", () => {
  afterEach(() => {
    mocks.invalidateLlmsFullResponseCache.mockClear();
    mocks.scheduleLlmsFullResponseCacheRebuild.mockClear();
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

  it("waits for llms-full invalidation before scheduling one background rebuild", async () => {
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
    expect(mocks.invalidateLlmsFullResponseCache).toHaveBeenCalledTimes(1);
    expect(mocks.scheduleLlmsFullResponseCacheRebuild).toHaveBeenCalledTimes(1);
    expect(mocks.invalidateLlmsFullResponseCache.mock.invocationCallOrder[0]).toBeLessThan(
      mocks.scheduleLlmsFullResponseCacheRebuild.mock.invocationCallOrder[0]
    );
  });

  it("derives personality profile paths plus llms surfaces for MBTI64 public content releases", async () => {
    process.env.CONTENT_RELEASE_REVALIDATE_TOKEN = "release-token";

    const request = new NextRequest("https://fermatmind.com/api/content-release/revalidate", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-fm-content-release-token": "release-token",
      },
      body: JSON.stringify({
        content: {
          type: "personality_profile_variant",
          slug: "intj-a",
          locale: "en",
        },
      }),
    });

    const response = await POST(request);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.revalidated_paths).toEqual([
      "/en/personality",
      "/en/personality/intj-a",
      "/llms.txt",
      "/llms-full.txt",
    ]);
    expect(payload.rejected_paths).toEqual([]);
    expect(mocks.revalidatePath).toHaveBeenCalledTimes(4);
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/en/personality");
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/en/personality/intj-a");
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/llms.txt");
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/llms-full.txt");
    expect(mocks.invalidateLlmsFullResponseCache).toHaveBeenCalledTimes(1);
    expect(mocks.scheduleLlmsFullResponseCacheRebuild).toHaveBeenCalledTimes(1);
  });
});

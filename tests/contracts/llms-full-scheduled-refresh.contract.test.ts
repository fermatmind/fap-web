import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  authenticate: vi.fn(), rebuild: vi.fn(), invalidate: vi.fn(), synchronize: vi.fn(),
}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn(), revalidateTag: vi.fn() }));
vi.mock("@/lib/security/contentReleaseRevalidationAuth", () => ({ authenticateContentReleaseRevalidation: mocks.authenticate }));
vi.mock("@/lib/seo/llmsFullRoute", () => ({ rebuildLlmsFullResponseCache: mocks.rebuild, scheduleLlmsFullResponseCacheRebuild: vi.fn() }));
vi.mock("@/lib/seo/llmsFullResponseCache", () => ({ invalidateLlmsFullResponseCache: mocks.invalidate, synchronizeLlmsFullAuthority: mocks.synchronize }));
vi.mock("@/lib/site", () => ({ getSiteUrlOrThrow: () => "https://fermatmind.com" }));
import { POST } from "@/lib/contentRelease/revalidateRoute";

const request = () => new NextRequest("https://fermatmind.com/api/content-release/revalidate", {
  method: "POST", body: JSON.stringify({ operation: "refresh_llms_full", source_fingerprint: "a".repeat(64) }),
});
beforeEach(() => {
  vi.clearAllMocks();
  mocks.authenticate.mockResolvedValue({ ok: true, nonceHash: "test" });
});
describe("scheduled full artifact refresh", () => {
  it("requires existing HMAC/replay authentication before starting a build", async () => {
    mocks.authenticate.mockResolvedValue({ ok: false, status: 401, errorCode: "UNAUTHORIZED" });
    expect((await POST(request())).status).toBe(401);
    expect(mocks.rebuild).not.toHaveBeenCalled();
  });
  it("waits for verified completion without invalidating valid content", async () => {
    mocks.rebuild.mockResolvedValue({ status: "complete", bytes: 1000, careerJobUrlCount: 2092 });
    const response = await POST(request());
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ ok: true, operation: "refresh_llms_full" });
    expect(mocks.invalidate).not.toHaveBeenCalled();
  });
  it.each(["deferred", "throw"])("reports %s as failure while preserving the previous copy", async (state) => {
    if (state === "throw") mocks.rebuild.mockRejectedValue(new Error("private error"));
    else mocks.rebuild.mockResolvedValue({ status: "deferred", bytes: 0, careerJobUrlCount: 0 });
    const response = await POST(request());
    expect(response.status).toBe(503);
    expect(await response.text()).not.toContain("private error");
    expect(mocks.invalidate).not.toHaveBeenCalled();
  });
});

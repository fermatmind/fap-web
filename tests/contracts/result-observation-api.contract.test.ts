import { beforeEach, expect, it, vi } from "vitest";
import { observeAttemptResult } from "@/lib/api/v0_3";
const mocks = vi.hoisted(() => ({ post: vi.fn(), token: "fm_owner" }));
vi.mock("@/lib/api-client", () => ({ apiClient: { post: mocks.post }, ApiError: class extends Error {} }));
vi.mock("@/lib/auth/fmToken", () => ({ getFmToken: () => mocks.token }));
beforeEach(() => { mocks.token = "fm_owner"; mocks.post.mockReset().mockResolvedValue({ ok: true, persisted: true }); });
it("uses private native path and only an opaque receipt plus consent", async () => {
  await observeAttemptResult({ attemptId: "private-owned-attempt", anonId: "owner", receipt: "opaque" });
  expect(mocks.post).toHaveBeenCalledWith("/v0.3/attempts/private-owned-attempt/result-observation", { receipt: "opaque", consent_state: "granted" }, expect.any(Object));
  expect(JSON.stringify(mocks.post.mock.calls[0][1])).not.toMatch(/attempt|url|score|answer|timestamp/);
});
it("rejects missing owner token and a successful HTTP response without durability", async () => {
  mocks.token = "";
  await expect(observeAttemptResult({ attemptId: "private", receipt: "opaque" })).rejects.toThrow("Owner credential unavailable");
  expect(mocks.post).not.toHaveBeenCalled();
  mocks.token = "fm_owner"; mocks.post.mockResolvedValue({ ok: true, persisted: false });
  await expect(observeAttemptResult({ attemptId: "private", receipt: "opaque" })).rejects.toThrow("not persisted");
});

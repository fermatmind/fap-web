import { beforeEach, expect, it, vi } from "vitest";
import { requestCareer94Result } from "@/app/(localized)/[locale]/career/assessment/career94-api";
import { careerGuestHeaders } from "@/lib/commerce/guestOwnership";

beforeEach(() => window.localStorage.clear());
it("renews an expired guest session while retaining the private purchase credential", async () => {
  window.localStorage.setItem("fm_auth_token", "fm_expired_guest_fixture");
  const proof = careerGuestHeaders(true)["X-Career-Guest-Token"];
  const fetchMock = vi.fn()
    .mockResolvedValueOnce(new Response("{}", { status: 401 }))
    .mockResolvedValueOnce(new Response(JSON.stringify({ ok: true, fm_token: "fm_renewed_guest_fixture" })))
    .mockResolvedValueOnce(new Response(JSON.stringify({ attempt_id: "fixture", unlocked: true })));
  vi.stubGlobal("fetch", fetchMock);
  const result = await requestCareer94Result("/fixture");
  expect(result.unlocked).toBe(true);
  expect(fetchMock).toHaveBeenCalledTimes(3);
  expect(fetchMock.mock.calls[1][0]).toContain("/auth/guest");
  expect(fetchMock.mock.calls[0][1].headers["X-Career-Guest-Token"]).toBe(proof);
  expect(fetchMock.mock.calls[2][1].headers["X-Career-Guest-Token"]).toBe(proof);
  expect(fetchMock.mock.calls[2][1].headers.Authorization).toBe("Bearer fm_renewed_guest_fixture");
});

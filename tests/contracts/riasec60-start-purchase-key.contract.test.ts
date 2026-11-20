import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { startAttempt } from "@/lib/api/v0_3";
import { careerGuestHeaders } from "@/lib/commerce/guestOwnership";
const mock = vi.hoisted(() => ({post:vi.fn()}));
vi.mock("@/lib/api-client", async () => ({...await vi.importActual("@/lib/api-client"), apiClient:{post:mock.post}}));
beforeEach(() => { window.localStorage.clear(); window.sessionStorage.clear(); mock.post.mockReset(); });
afterEach(() => vi.unstubAllEnvs());
it.each(["legacy", "dual"])("binds a new guest's Holland purchase credential in %s scale mode", async mode => {
  vi.stubEnv("NEXT_PUBLIC_SCALE_CODE_MODE", mode);
  mock.post.mockResolvedValue({ok:true, attempt_id:"674254eb-6f6c-40d6-beea-2306f6abc9e3", scale_code:"RIASEC", resume_token:"fixture-owned-proof"});
  await startAttempt({scaleCode:"RIASEC", formCode:"riasec_60", anonId:"public-analytics-fixture", locale:"en"});
  expect(mock.post.mock.calls[0][1].scale_code).toBe(mode === "dual" ? "HOLLAND_CAREER_INTEREST_RIASEC" : "RIASEC");
  const init = mock.post.mock.calls[0][2];
  expect(init.headers["X-Career-Guest-Token"]).toMatch(/^[a-f0-9]{64}$/);
  expect(init.headers["X-Career-Guest-Token"]).toBe(careerGuestHeaders()["X-Career-Guest-Token"]);
  expect(mock.post.mock.calls[0][1].anon_id).toBe("public-analytics-fixture");
});

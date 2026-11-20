import { beforeEach, expect, it, vi } from "vitest";
import { startAttempt } from "@/lib/api/v0_3";
import { careerGuestHeaders } from "@/lib/commerce/guestOwnership";
const mock = vi.hoisted(() => ({ post: vi.fn() }));
vi.mock("@/lib/api-client", async () => ({ ...await vi.importActual("@/lib/api-client"), apiClient: { post: mock.post } }));
beforeEach(() => { window.localStorage.clear(); window.sessionStorage.clear(); mock.post.mockReset(); });
it.each(["MBTI", "BIG5_OCEAN", "ENNEAGRAM", "IQ_RAVEN", "EQ_60", "JUNG_ARCHETYPES", "JUNG_COGNITIVE_FUNCTIONS"])("binds a private guest credential for %s before enrollment", async scale => {
  mock.post.mockResolvedValue({ ok: true, attempt_id: "674254eb-6f6c-40d6-beea-2306f6abc9e3", scale_code: scale });
  await startAttempt({ scaleCode: scale, anonId: "public-analytics-fixture", locale: "en" });
  expect(mock.post.mock.calls[0][2].headers["X-Career-Guest-Token"]).toMatch(/^[a-f0-9]{64}$/);
  expect(mock.post.mock.calls[0][2].headers["X-Career-Guest-Token"]).toBe(careerGuestHeaders()["X-Career-Guest-Token"]);
  expect(mock.post.mock.calls[0][1].anon_id).toBe("public-analytics-fixture");
});

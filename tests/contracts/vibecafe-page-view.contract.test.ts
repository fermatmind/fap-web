// @vitest-environment-options {"url":"https://fermatmind.com/"}
import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { setAnalyticsConsent } from "@/lib/consent/store";

let track: typeof import("@/lib/tracking/vibeCafe").trackVibeCafePageView;
const fetchMock = vi.fn();
const storageKey = "vc:telemetry:visitor:cmvdd5x4o000002l1prsfmuoy";

beforeEach(async () => {
  vi.resetModules();
  vi.stubEnv("NEXT_PUBLIC_ANALYTICS_ENABLED", "true");
  vi.stubEnv("NEXT_PUBLIC_ANALYTICS_ENV", "production");
  window.history.replaceState({}, "", "/zh");
  window.localStorage.clear();
  fetchMock.mockReset().mockResolvedValue({ ok: true });
  vi.stubGlobal("fetch", fetchMock);
  track = (await import("@/lib/tracking/vibeCafe")).trackVibeCafePageView;
});

afterEach(() => {
  Reflect.deleteProperty(navigator, "doNotTrack");
  Reflect.deleteProperty(navigator, "globalPrivacyControl");
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("VibeCafe consented public page views", () => {
  it("waits for consent, deduplicates page views and sends only the official minimal payload", () => {
    track();
    expect(fetchMock).not.toHaveBeenCalled();
    expect(window.localStorage.getItem(storageKey)).toBeNull();

    setAnalyticsConsent("granted");
    track();
    track();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [endpoint, request] = fetchMock.mock.calls[0];
    const payload = JSON.parse(request.body);
    expect(endpoint).toBe("https://vibecafe.ai/api/products/cmvdd5x4o000002l1prsfmuoy/telemetry/events");
    expect(Object.keys(payload).sort()).toEqual(["event", "key", "visitorId"]);
    expect(payload.event).toBe("pageview");
    expect(payload.visitorId).toMatch(/^[a-f0-9-]{36}$/i);
    expect(request).toMatchObject({ credentials: "omit", referrerPolicy: "no-referrer", keepalive: true });

    window.history.pushState({}, "", "/en/career");
    track();
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(JSON.parse(fetchMock.mock.calls[1][1].body).visitorId).toBe(payload.visitorId);

    setAnalyticsConsent("denied");
    window.history.pushState({}, "", "/zh/articles");
    track();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it.each([
    "/zh/result/private", "/en/share/private", "/zh/orders/lookup", "/zh/history/mbti",
    "/zh/payment/stripe/success", "/zh/attempts/private/report", "/zh/results/lookup",
    "/zh/quiz/mbti", "/en/tests/mbti/take", "/zh/test/mbti/take", "/zh/dashboard",
    "/zh/cms-preview/articles/private", "/zh/tests/mbti?attemptId=private",
    "/zh/articles?token=private", "/zh/account", "/zh/login",
  ])("does not track private, assessment or unknown routes: %s", (path) => {
    setAnalyticsConsent("granted");
    window.history.replaceState({}, "", path);
    track();
    expect(fetchMock).not.toHaveBeenCalled();
    expect(window.localStorage.getItem(storageKey)).toBeNull();
  });

  it.each(["staging", "development"])("does not send non-production traffic: %s", async (env) => {
    setAnalyticsConsent("granted");
    vi.stubEnv("NEXT_PUBLIC_ANALYTICS_ENV", env);
    vi.resetModules();
    (await import("@/lib/tracking/vibeCafe")).trackVibeCafePageView();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it.each(["doNotTrack", "globalPrivacyControl"])("honors the browser privacy signal %s", (property) => {
    setAnalyticsConsent("granted");
    Object.defineProperty(navigator, property, { configurable: true, value: property === "doNotTrack" ? "1" : true });
    track();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("does not resume tracking on a client navigation into a private page", () => {
    setAnalyticsConsent("granted");
    track();
    window.history.pushState({}, "", "/zh/result/private");
    track();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("does not interrupt the application on network or storage failures", async () => {
    setAnalyticsConsent("granted");
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new Error("storage disabled"); });
    fetchMock.mockRejectedValue(new Error("offline"));
    expect(() => track()).not.toThrow();
    await Promise.resolve();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(window.localStorage.getItem(storageKey)).toBeNull();
  });
});

import { readFileSync } from "node:fs";
import { StrictMode, useEffect } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { recordEntertainmentActivity } from "@/lib/entertainment/activity";
import { useEntertainmentMetrics, useEntertainmentResultView } from "@/components/entertainment/useEntertainmentMetrics";
import { GET as catalogGET } from "@/app/api/entertainment-catalog/route";
import { POST, toSeoAttributionIngestEnvelope } from "@/app/api/track/route";
import { entertainmentActivityCatalog as activityCatalog } from "@/lib/entertainment/activityCatalog";
import questionnaires from "@/lib/questionnaires/catalog.json";
import legacy from "@/lib/entertainment/catalog.json";

vi.mock("@/lib/tracking/internalTraffic", () => ({ getAnalyticsDeploymentEnvironment: () => "production", shouldAllowFirstPartyAnalyticsRuntime: () => ({ allowed: true }) }));
vi.mock("@/lib/tracking/serverRuntime", () => ({ resolveTrackingRuntime: () => ({ token: "fixture_token_0123456789abcdefghijklmnop", origin: "https://api.fermatmind.com" }) }));

beforeEach(() => { window.localStorage.setItem("fm_consent_v1", JSON.stringify({ analytics: "granted" })); });
afterEach(() => { window.localStorage.clear(); vi.unstubAllGlobals(); vi.restoreAllMocks(); });

function PrivateActivity({ visible = false }: { visible?: boolean }) {
  const metrics = useEntertainmentMetrics("habit-patterns-test", "1.0.0", "en", true);
  useEntertainmentResultView(metrics.view, visible);
  return <>{metrics.consent}<button onClick={metrics.start}>Start</button><button onClick={metrics.complete}>Complete</button><button onClick={() => metrics.share()}>Copy done</button></>;
}

describe("anonymous entertainment activity", () => {
  it("covers every reachable native, legacy and friendship identity without answer assets", () => {
    const expected = new Set([...questionnaires, ...legacy, { slug: "friendship-quiz" }].map(x => x.slug));
    expect(new Set(activityCatalog.map(x => x.slug))).toEqual(expected);
    for (const definition of activityCatalog) {
      expect(Object.keys(definition).sort()).toEqual(["path", "privacy", "roles", "slug", "title"]);
      if (definition.slug === "friendship-quiz") continue;
      const native = questionnaires.find(item => item.slug === definition.slug);
      const source = native ?? legacy.find(item => item.slug === definition.slug)!;
      expect(definition.title).toEqual(source.title);
      expect(definition.path).toBe(native ? `/tests/${native.collection ?? "explore"}/${definition.slug}` : `/tests/play/${definition.slug}`);
      const body = JSON.parse(readFileSync(`lib/${native ? "questionnaires" : "entertainment"}/data/${definition.slug}.json`, "utf8"));
      expect(body.slug).toBe(definition.slug);
    }
    expect(activityCatalog.filter(x => x.privacy === "explicit_opt_in").length).toBeGreaterThanOrEqual(14);
    expect(activityCatalog.find(x => x.slug === "friendship-quiz")?.roles).toEqual(["creator", "friend", "solo"]);
  });

  it("publishes only the same bounded public registry, without questions or answers", async () => {
    const response = catalogGET();
    expect(response.status).toBe(200);
    expect(response.headers.get("X-Robots-Tag")).toBe("noindex");
    expect(await response.json()).toEqual({ schema: "entertainment.catalog.v1", items: activityCatalog });
  });

  it("respects denied analytics consent and private default without even reading storage", () => {
    const fetch = vi.fn(); vi.stubGlobal("fetch", fetch);
    const get = vi.spyOn(Storage.prototype, "getItem");
    recordEntertainmentActivity("habit-patterns-test", "1.0.0", "en", "start");
    expect(get).not.toHaveBeenCalled();
    window.localStorage.setItem("fm_consent_v1", JSON.stringify({ analytics: "denied" }));
    recordEntertainmentActivity("what-dog-breed-am-i", "1.0.0", "en", "start");
    expect(fetch).not.toHaveBeenCalled();
  });

  it("sends only bounded public dimensions and no cookies, referrer or participant identity", () => {
    const fetch = vi.fn().mockResolvedValue({ ok: true }); vi.stubGlobal("fetch", fetch);
    recordEntertainmentActivity("friendship-quiz", "friendship-v1", "zh", "share", "friend", "copy");
    expect(fetch).toHaveBeenCalledOnce();
    const init = fetch.mock.calls[0][1]; const body = JSON.parse(init.body);
    expect(init).toMatchObject({ credentials: "omit", referrerPolicy: "no-referrer" });
    expect(body.anonymousId).toBe("");
    expect(body.path).toBe("/zh/tests/play/friendship-quiz");
    expect(Object.keys(body.payload).sort()).toEqual(["consent_state", "entry_surface", "form_code", "locale", "slug", "target_action"]);
    expect(body.payload.entry_surface).toBe("friend");
  });

  it("requires per-page opt-in, revokes immediately, and never retroactively counts a visible result", () => {
    const fetch = vi.fn().mockResolvedValue({ ok: true }); vi.stubGlobal("fetch", fetch);
    const view = render(<StrictMode><PrivateActivity visible /></StrictMode>);
    fireEvent.click(screen.getByText("Start")); expect(fetch).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("checkbox")); expect(fetch).not.toHaveBeenCalled();
    fireEvent.click(screen.getByText("Start"));
    fireEvent.click(screen.getByText("Complete"));
    fireEvent.click(screen.getByText("Copy done"));
    expect(fetch).toHaveBeenCalledTimes(3);
    view.rerender(<StrictMode><PrivateActivity visible={false} /></StrictMode>);
    view.rerender(<StrictMode><PrivateActivity visible /></StrictMode>);
    expect(fetch).toHaveBeenCalledTimes(4);
    fireEvent.click(screen.getByRole("checkbox")); fireEvent.click(screen.getByText("Complete"));
    expect(fetch).toHaveBeenCalledTimes(4);
  });

  it("invalidates page permission before a delayed share callback after leaving", () => {
    const fetch = vi.fn().mockResolvedValue({ ok: true }); vi.stubGlobal("fetch", fetch);
    let delayedShare = () => {};
    function LateShare() {
      const metrics = useEntertainmentMetrics("habit-patterns-test", "1.0.0", "en", true);
      useEffect(() => { delayedShare = metrics.share; }, [metrics.share]);
      return metrics.consent;
    }
    const page = render(<LateShare />);
    fireEvent.click(screen.getByRole("checkbox"));
    page.unmount(); delayedShare();
    expect(fetch).not.toHaveBeenCalled();
  });

  it("rejects unknown identities and missing private opt-in before any upstream request", async () => {
    const fetch = vi.fn(); vi.stubGlobal("fetch", fetch);
    for (const slug of ["unknown-test", "habit-patterns-test"]) {
      const response = await POST(new NextRequest("https://fermatmind.com/api/track", { method: "POST", body: JSON.stringify({ eventName: "fun_start", path: "/en/tests", payload: { slug, form_code: "1.0.0", locale: "en", entry_surface: "single", target_action: "none", consent_state: "analytics_granted" } }) }));
      expect(response.status).toBe(400);
    }
    expect(fetch).not.toHaveBeenCalled();
  });

  it("does not forward private data or duplicate an activity into legacy or third-party sinks", async () => {
    const id = crypto.randomUUID();
    const fetch = vi.fn().mockResolvedValue({ ok: true }); vi.stubGlobal("fetch", fetch);
    const payload = { slug: "habit-patterns-test", form_code: "1.0.0", locale: "en", entry_surface: "single", target_action: "none", consent_state: "activity_opt_in", answers: ["private"], score: 91, nickname: "private", referrer: "private" };
    const sanitized = toSeoAttributionIngestEnvelope({ requestId: id, eventName: "fun_start", anonymousId: "must-not-forward", path: "/en/tests", timestamp: new Date().toISOString(), payload });
    expect(JSON.stringify(sanitized)).not.toContain("private");
    expect(sanitized.anonymousId).toBe("");
    const response = await POST(new NextRequest("https://fermatmind.com/api/track", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ requestId: id, eventName: "fun_start", anonymousId: "", path: "/en/tests", payload }) }));
    expect(response.status).toBe(200);
    expect(fetch).toHaveBeenCalledOnce();
    expect(fetch.mock.calls[0][0]).toBe("https://api.fermatmind.com/api/v0.5/seo/attribution/events");
    expect(JSON.parse(fetch.mock.calls[0][1].body).payload.consent_state).toBe("activity_opt_in");
    expect(fetch.mock.calls[0][1].headers).not.toHaveProperty("X-FermatMind-IP-Day-Hash");
  });
});

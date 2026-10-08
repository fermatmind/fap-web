// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, chmodSync, symlinkSync, unlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { NextRequest } from "next/server";
import { resolveTrackingRuntime } from "@/lib/tracking/serverRuntime";
import { HEAD, POST } from "@/app/api/track/route";

const token = "fixture_only_not_a_live_token_123456789";
const sha = "a".repeat(40);
const staging = "https://staging-api.fermatmind.com";
let root: string;
function managed(origin = staging, directory = root) {
  mkdirSync(directory, { recursive: true, mode: 0o755 });
  writeFileSync(path.join(directory, "REVISION"), sha);
  writeFileSync(path.join(directory, ".tracking-runtime.json"), JSON.stringify({ TRACK_INGEST_TOKEN: token, TRACK_INGEST_API_ORIGIN: origin }), { mode: 0o600 });
  writeFileSync(path.join(directory, ".tracking-runtime-managed.json"), JSON.stringify({ schema: "fermatmind.tracking-runtime.v1", revision: sha, origin }), { mode: 0o644 });
}
beforeEach(() => {
  root = mkdtempSync(path.join(tmpdir(), "tracking-systemd-"));
  vi.spyOn(process, "cwd").mockReturnValue(root);
  for (const name of ["TRACK_INGEST_TOKEN", "TRACK_INGEST_API_ORIGIN", "ANALYTICS_ENDPOINT", "EDM_ENDPOINT", "MBTI_ATTRIBUTION_INGEST_ENDPOINT", "CAREER_ATTRIBUTION_INGEST_ENDPOINT"]) vi.stubEnv(name, "");
});
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllEnvs(); vi.unstubAllGlobals(); rmSync(root, { recursive: true, force: true }); });
function request(host = "staging.fermatmind.com") {
  return new NextRequest(`https://${host}/api/track`, { method: "POST", body: JSON.stringify({ eventName: "article_to_test_click", path: "/en/articles/source", payload: { source_article: "source" } }) });
}
describe("systemd standalone private runtime", () => {
  it("forwards from the release file with an empty service environment and returns only public HEAD metadata", async () => {
    managed();
    const fetch = vi.fn().mockResolvedValue(new Response(null, { status: 202 })); vi.stubGlobal("fetch", fetch);
    const response = await POST(request()); expect(await response.json()).toMatchObject({ ok: true, forwarded: 1 });
    expect(fetch.mock.calls[0][0]).toBe(`${staging}/api/v0.5/seo/attribution/events`);
    expect(fetch.mock.calls[0][1].headers.Authorization).toBe(`Bearer ${token}`);
    const head = HEAD(); expect(head.status).toBe(200);
    expect(head.headers.get("X-FermatMind-Tracking-Configured")).toBe("1");
    expect(head.headers.get("X-FermatMind-Tracking-Revision")).toBe(sha);
    expect(head.headers.get("Cache-Control")).toBe("no-store");
    expect(await head.text()).toBe(""); expect(JSON.stringify([...head.headers])).not.toContain(token);
  });
  it("ignores stale inherited credentials and origins for a deployed release", () => {
    managed(); vi.stubEnv("TRACK_INGEST_TOKEN", "different_fixture_stale_token_123456789");
    vi.stubEnv("TRACK_INGEST_API_ORIGIN", "https://api.fermatmind.com");
    expect(resolveTrackingRuntime()).toEqual({ token, origin: staging, revision: sha });
  });
  it("keeps an old worker bound to its actual cwd after the active link changes", () => {
    const old = path.join(root, "old"), next = path.join(root, "next"), active = path.join(root, "active");
    managed(staging, old); managed("https://api.fermatmind.com", next);
    symlinkSync(old, active);
    vi.spyOn(process, "cwd").mockReturnValue(old);
    expect(resolveTrackingRuntime().origin).toBe(staging);
    unlinkSync(active); symlinkSync(next, active);
    expect(resolveTrackingRuntime().origin).toBe(staging);
  });
  it("keeps production credentials confined to production hosts", async () => {
    managed("https://api.fermatmind.com"); const fetch = vi.fn(); vi.stubGlobal("fetch", fetch);
    expect((await POST(request())).status).toBe(502); expect(fetch).not.toHaveBeenCalled();
  });
  it.each([".tracking-runtime.json", ".tracking-runtime-managed.json", "REVISION"])("fails closed when managed authority %s disappears", async name => {
    managed(); unlinkSync(path.join(root, name));
    const fetch = vi.fn(); vi.stubGlobal("fetch", fetch);
    expect(HEAD().status).toBe(503); expect((await POST(request())).status).toBe(502); expect(fetch).not.toHaveBeenCalled();
  });
  it.each(["private-permissions", "marker-permissions", "private-symlink", "marker-symlink", "revision-symlink", "wrong-sha", "wrong-origin", "malformed", "extra-key", "release-permissions"])("rejects %s without exposing values or falling back", async mode => {
    managed(); const file = path.join(root, ".tracking-runtime.json"), marker = path.join(root, ".tracking-runtime-managed.json");
    if (mode === "private-permissions") chmodSync(file, 0o644);
    if (mode === "marker-permissions") chmodSync(marker, 0o666);
    if (mode.endsWith("symlink")) {
      const target = mode === "private-symlink" ? file : mode === "marker-symlink" ? marker : path.join(root, "REVISION");
      const copy = path.join(root, "copy"); writeFileSync(copy, "fixture_only"); unlinkSync(target); symlinkSync(copy, target);
    }
    if (mode === "wrong-sha" || mode === "wrong-origin") writeFileSync(marker, JSON.stringify({ schema: "fermatmind.tracking-runtime.v1", revision: mode === "wrong-sha" ? "b".repeat(40) : sha, origin: mode === "wrong-origin" ? "https://api.fermatmind.com" : staging }));
    if (mode === "malformed") writeFileSync(file, `invalid ${token}`);
    if (mode === "extra-key") writeFileSync(file, JSON.stringify({ TRACK_INGEST_TOKEN: token, TRACK_INGEST_API_ORIGIN: staging, extra: true }));
    if (mode === "release-permissions") chmodSync(root, 0o777);
    vi.stubEnv("TRACK_INGEST_TOKEN", token); const fetch = vi.fn(); vi.stubGlobal("fetch", fetch);
    expect(() => resolveTrackingRuntime()).toThrow("TRACKING_RUNTIME_REJECTED");
    expect(HEAD().status).toBe(503); const response = await POST(request()); expect(response.status).toBe(502);
    expect(JSON.stringify(await response.json())).not.toContain(token); expect(fetch).not.toHaveBeenCalled();
  });
  it("reads the prior release authority on LKG and clears stale credentials for a disabled release", async () => {
    const newer = path.join(root, "newer"), older = path.join(root, "older"), disabled = path.join(root, "disabled");
    managed(staging, newer); managed("https://api.fermatmind.com", older);
    mkdirSync(disabled); writeFileSync(path.join(disabled, "REVISION"), "b".repeat(40));
    vi.spyOn(process, "cwd").mockReturnValue(older); expect(resolveTrackingRuntime().origin).toBe("https://api.fermatmind.com");
    vi.spyOn(process, "cwd").mockReturnValue(disabled); vi.stubEnv("TRACK_INGEST_TOKEN", token);
    expect(resolveTrackingRuntime()).toEqual({ revision: "b".repeat(40) });
    expect(HEAD().headers.get("X-FermatMind-Tracking-Configured")).toBe("0");
    const fetch = vi.fn(); vi.stubGlobal("fetch", fetch);
    expect(await (await POST(request())).json()).toMatchObject({ forwarded: 0 }); expect(fetch).not.toHaveBeenCalled();
  });
});

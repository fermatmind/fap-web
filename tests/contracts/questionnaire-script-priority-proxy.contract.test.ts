import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { scripts } = vi.hoisted(() => ({ scripts: vi.fn(() => ["/_next/static/chunks/current-tool.js"]) }));
vi.mock("@/lib/questionnaires/initialScripts", () => ({ initialQuestionnaireScripts: scripts }));
import { proxy } from "@/proxy";

beforeEach(() => { scripts.mockReset().mockReturnValue(["/_next/static/chunks/current-tool.js"]); });

describe("Focused questionnaire document priority", () => {
  it.each(["/en/tests/explore/disc", "/zh/tests/explore/disc", "/en/tests/explore/cognitive-functions-test", "/zh/tests/explore/cognitive-functions-test"])("hints installed scripts on the %s document without including query input", async path => {
    const response = await proxy(new NextRequest(`https://fermatmind.com${path}?input=PRIVATE_INPUT`, { headers: { accept: "text/html" } }));
    expect(response.status).toBe(200);
    expect(response.headers.get("Link")).toMatch(/^<\/_next\/static\/chunks\/current-tool\.js>; rel=preload; as=script; fetchpriority=high; nonce="[A-Za-z0-9+/=_-]+"$/);
    expect(response.headers.get("Link")).not.toContain("PRIVATE_INPUT");
    expect(scripts).toHaveBeenCalledWith(path.split("/").at(-1));
  });
  const excludedRequests: { path: string; method: string; headers: Record<string, string> }[] = [
    { path: "/en/tests/explore/disc", method: "GET", headers: { accept: "text/html", rsc: "1" } },
    { path: "/en/tests/explore/disc", method: "POST", headers: { accept: "text/html" } },
    { path: "/en/tests/explore/disc", method: "GET", headers: { accept: "application/json" } },
    { path: "/en/tests/explore/disc/results/single-d", method: "GET", headers: { accept: "text/html" } },
    { path: "/en/tests/explore/career-match", method: "GET", headers: { accept: "text/html" } },
  ];
  it.each(excludedRequests)("leaves non-target requests on their existing loader: $path $method", async ({ path, method, headers }) => {
    const response = await proxy(new NextRequest(`https://fermatmind.com${path}`, { method, headers }));
    expect(response.headers.get("Link")).toBeNull();
    expect(scripts).not.toHaveBeenCalled();
  });
  it("does not invent a script list when the installed manifest is unavailable", async () => {
    scripts.mockReturnValueOnce([]);
    const response = await proxy(new NextRequest("https://fermatmind.com/en/tests/explore/disc", { headers: { accept: "text/html" } }));
    expect(response.status).toBe(200);
    expect(response.headers.get("Link")).toBeNull();
  });
});

import { createServer } from "node:http";
import fixtures from "../../fixtures/public-content/marketing-public.json";

// Published public API responses captured on 2026-10-11. This fixture never
// supplies authentication, attempts, orders, or payment success responses.
export async function startPublicContentApiFixture(): Promise<() => Promise<void>> {
  const responses = fixtures as Record<string, unknown>;
  const server = createServer((req, res) => {
    const url = new URL(req.url ?? "/", "http://127.0.0.1:8000");
    const pathname = url.pathname.replace(/^\/api(?=\/)/, "");
    const locale = url.searchParams.get("locale")?.startsWith("zh") ? "zh-CN" : "en";
    const query = new URLSearchParams();
    if (pathname.endsWith("/lookup")) query.set("slug", url.searchParams.get("slug") ?? "");
    query.set("locale", locale);
    if (pathname.includes("/landing-surfaces/")) query.set("org_id", "0");
    if (pathname === "/v0.5/articles") {
      for (const name of ["page", "per_page", "org_id", "related_test_slug"]) {
        const value = url.searchParams.get(name);
        if (value) query.set(name, value);
      }
    }
    const key = pathname === "/v0.5/seo/sitemap-source" ? pathname : `${pathname}?${query}`;
    const body = req.method === "GET" ? responses[key] : undefined;
    res.setHeader("content-type", "application/json; charset=utf-8");
    res.setHeader("cache-control", "no-store");
    res.statusCode = body ? 200 : 404;
    res.end(JSON.stringify(body ?? { ok: false, error_code: "UNMOCKED_PUBLIC_REQUEST" }));
  });
  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(8000, "127.0.0.1", () => { server.off("error", reject); resolve(); });
  });
  return () => new Promise<void>((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
    server.closeIdleConnections();
  });
}

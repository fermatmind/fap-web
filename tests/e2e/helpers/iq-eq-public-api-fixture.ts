import { createServer } from "node:http";

// Browser page.route cannot intercept the take page's server-side catalog and
// rollout reads. Keep those reads local too; assessment/report behavior is still
// supplied and asserted by each test's browser routes.
const assessments = [
  { slug: "iq-test-intelligence-quotient-assessment", scale_code: "IQ_RAVEN", title: "IQ Test" },
  { slug: "eq-test-emotional-intelligence-assessment", scale_code: "EQ_60", title: "EQ Test" },
  { slug: "mbti-personality-test-16-personality-types", scale_code: "MBTI", title: "MBTI Test" },
  { slug: "depression-screening-test-standard-edition", scale_code: "SDS_20", title: "Depression Screening" },
];

export async function startIqEqPublicApiFixture(): Promise<() => Promise<void>> {
  const server = createServer((req, res) => {
    const url = new URL(req.url ?? "/", "http://127.0.0.1:8000");
    res.setHeader("content-type", "application/json; charset=utf-8");
    if (req.method === "GET" && url.pathname === "/api/v0.3/scales/catalog") {
      res.end(JSON.stringify({ ok: true, items: assessments }));
      return;
    }
    const assessment = assessments.find((item) => item.slug === url.searchParams.get("slug"));
    if (req.method === "GET" && url.pathname === "/api/v0.3/scales/lookup" && assessment) {
      res.end(JSON.stringify({
        ok: true,
        ...assessment,
        primary_slug: assessment.slug,
        capabilities: { enabled_in_prod: true, commerce_enabled: true, paywall_mode: "full" },
      }));
      return;
    }
    // Never make an unmocked auth, submission, or report request look successful.
    res.statusCode = 404;
    res.end(JSON.stringify({ ok: false, message: "Unmocked IQ/EQ fixture request" }));
  });
  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(8000, "127.0.0.1", () => {
      server.off("error", reject);
      resolve();
    });
  });
  return () => new Promise<void>((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
    server.closeIdleConnections();
  });
}

// @vitest-environment node

import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { readFileSync } from "node:fs";
import { afterEach, describe, expect, it } from "vitest";
import {
  runTestLandingSmoke,
} from "../../scripts/deploy/test-landing-runtime-smoke.mjs";

const MBTI_SLUG = "mbti-personality-test-16-personality-types";
const BIG5_SLUG = "big-five-personality-test-ocean-model";
const MBTI_ZH_PATH = `/zh/tests/${MBTI_SLUG}`;
const MBTI_EN_PATH = `/en/tests/${MBTI_SLUG}`;
const BIG5_ZH_PATH = `/zh/tests/${BIG5_SLUG}`;
const MBTI_TAKE_PATH = `/zh/tests/${MBTI_SLUG}/take`;
const QUESTION_PATH = "/v0.3/scales/MBTI/questions";
const EXACT_SHA = "a".repeat(40);

type FixtureReply = {
  status?: number;
  body: string | Record<string, unknown>;
  headers?: Record<string, string>;
};

type FixtureContext = {
  count: number;
  request: IncomingMessage;
  url: URL;
};

type FixtureHandler = (context: FixtureContext) => FixtureReply;

type FixtureOverrides = Partial<Record<
  | "zh_mbti_landing"
  | "en_mbti_landing"
  | "zh_big5_landing"
  | "zh_mbti_take"
  | "zh_mbti_lookup"
  | "en_mbti_lookup"
  | "zh_big5_lookup"
  | "mbti_questions",
  FixtureHandler
>>;

type SmokeReceipt = Awaited<ReturnType<typeof runTestLandingSmoke>>;

const servers = new Set<ReturnType<typeof createServer>>();

function lookupPayload({
  slug,
  scaleCode,
  formCode,
  locale,
}: {
  slug: string;
  scaleCode: string;
  formCode: string;
  locale: string;
}) {
  return {
    ok: true,
    primary_slug: slug,
    slug,
    requested_slug: slug,
    resolved_from_alias: false,
    scale_code: scaleCode,
    locale,
    is_public: true,
    is_indexable: true,
    forms: [{
      form_code: formCode,
      question_count: 2,
      is_public: true,
    }],
    content_i18n_json: {
      [locale]: {
        title: `${scaleCode} fixture`,
        description: "Fixture description",
      },
    },
    landing_surface_v1: {
      version: "landing.surface.v1",
      entry_surface: "test_detail",
      start_test_target: `/${locale}/tests/${slug}/take`,
      cta_bundle: [],
    },
  };
}

function landingHtml(ctaMarker: string) {
  return `<!doctype html>
<html>
  <body>
    <main data-test-landing-read-source="fresh">
      <h1><span>Authority</span> landing fixture</h1>
      <a data-testid="${ctaMarker}" href="/take">Start</a>
    </main>
  </body>
</html>`;
}

function questionPayload() {
  return {
    ok: true,
    scale_code: "MBTI",
    form_code: "mbti_144",
    questions: {
      schema: "fap.questions.v1",
      items: [
        {
          question_id: "q1",
          text_zh: "Fixture question one",
          options: [
            { code: "A", text_zh: "Option A" },
            { code: "B", text_zh: "Option B" },
          ],
        },
        {
          question_id: "q2",
          text_zh: "Fixture question two",
          options: [
            { code: "A", text_zh: "Option A" },
            { code: "B", text_zh: "Option B" },
          ],
        },
      ],
    },
  };
}

function send(response: ServerResponse, reply: FixtureReply) {
  const status = reply.status ?? 200;
  const body = typeof reply.body === "string"
    ? reply.body
    : JSON.stringify(reply.body);
  response.statusCode = status;
  response.setHeader(
    "Content-Type",
    typeof reply.body === "string"
      ? "text/html; charset=utf-8"
      : "application/json; charset=utf-8",
  );
  for (const [name, value] of Object.entries(reply.headers ?? {})) {
    response.setHeader(name, value);
  }
  response.end(body);
}

function defaultReply(key: keyof FixtureOverrides): FixtureReply {
  switch (key) {
    case "zh_mbti_landing":
    case "en_mbti_landing":
      return { body: landingHtml("mbti-landing-primary-cta") };
    case "zh_big5_landing":
      return { body: landingHtml("test-detail-landing-cta-big5_120") };
    case "zh_mbti_take":
      return { body: "<!doctype html><html><body><main>Take fixture</main></body></html>" };
    case "zh_mbti_lookup":
      return {
        body: lookupPayload({
          slug: MBTI_SLUG,
          scaleCode: "MBTI",
          formCode: "mbti_144",
          locale: "zh",
        }),
      };
    case "en_mbti_lookup":
      return {
        body: lookupPayload({
          slug: MBTI_SLUG,
          scaleCode: "MBTI",
          formCode: "mbti_144",
          locale: "en",
        }),
      };
    case "zh_big5_lookup":
      return {
        body: lookupPayload({
          slug: BIG5_SLUG,
          scaleCode: "BIG5_OCEAN",
          formCode: "big5_120",
          locale: "zh",
        }),
      };
    case "mbti_questions":
      return { body: questionPayload() };
  }
  throw new Error(`unsupported fixture key: ${key}`);
}

function routeKey(url: URL): keyof FixtureOverrides | null {
  if (url.pathname === MBTI_ZH_PATH) return "zh_mbti_landing";
  if (url.pathname === MBTI_EN_PATH) return "en_mbti_landing";
  if (url.pathname === BIG5_ZH_PATH) return "zh_big5_landing";
  if (url.pathname === MBTI_TAKE_PATH) return "zh_mbti_take";
  if (url.pathname === QUESTION_PATH) return "mbti_questions";
  if (url.pathname !== "/v0.3/scales/lookup") return null;

  const slug = url.searchParams.get("slug");
  const locale = url.searchParams.get("locale");
  if (slug === MBTI_SLUG && locale === "zh") return "zh_mbti_lookup";
  if (slug === MBTI_SLUG && locale === "en") return "en_mbti_lookup";
  if (slug === BIG5_SLUG && locale === "zh") return "zh_big5_lookup";
  return null;
}

async function runFixture(overrides: FixtureOverrides = {}): Promise<SmokeReceipt> {
  const counts = new Map<string, number>();
  const server = createServer((request, response) => {
    const url = new URL(request.url ?? "/", "http://127.0.0.1");
    const key = routeKey(url);
    if (!key) {
      send(response, { status: 404, body: "not found" });
      return;
    }
    const count = (counts.get(key) ?? 0) + 1;
    counts.set(key, count);
    const reply = overrides[key]?.({ count, request, url }) ?? defaultReply(key);
    send(response, reply);
  });
  servers.add(server);

  await new Promise<void>((resolve) => {
    server.listen(0, "127.0.0.1", resolve);
  });
  const address = server.address();
  if (!address || typeof address === "string") {
    throw new Error("fixture server did not expose a port");
  }
  const baseUrl = `http://127.0.0.1:${address.port}`;

  try {
    return await runTestLandingSmoke({
      baseUrl,
      apiBaseUrl: baseUrl,
      environment: "staging",
      exactSha: EXACT_SHA,
      workflowRunId: "12345",
      workflowRunAttempt: "1",
      retryDelayMs: 1,
      timeoutMs: 1_000,
    });
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
    servers.delete(server);
  }
}

function check(receipt: SmokeReceipt, name: string) {
  const found = receipt.checks.find((candidate) => candidate.check_name === name);
  if (!found) throw new Error(`missing check ${name}`);
  return found;
}

afterEach(async () => {
  await Promise.all(
    [...servers].map((server) => new Promise<void>((resolve) => {
      server.close(() => resolve());
    })),
  );
  servers.clear();
});

describe("test landing runtime smoke semantic gate", () => {
  it("passes zh MBTI, en MBTI, Big Five, take, and the read-only mbti_144 pack", async () => {
    const receipt = await runFixture();

    expect(receipt.result).toBe("pass");
    expect(check(receipt, "zh_mbti_landing")).toMatchObject({
      result: "pass",
      http_status: 200,
      authority_identity_result: "pass",
    });
    expect(check(receipt, "en_mbti_landing")).toMatchObject({
      result: "pass",
      authority_identity_result: "pass",
    });
    expect(check(receipt, "zh_big5_landing")).toMatchObject({
      result: "pass",
      authority_identity_result: "pass",
    });
    expect(check(receipt, "zh_mbti_take_route")).toMatchObject({
      result: "pass",
      http_status: 200,
    });
    expect(check(receipt, "mbti_144_question_pack")).toMatchObject({
      result: "pass",
      authority_identity_result: "pass",
      question_pack_semantic_result: "pass",
    });
  });

  it("fails an HTTP 500 without retrying it", async () => {
    const receipt = await runFixture({
      zh_mbti_landing: () => ({ status: 500, body: "failure" }),
    });

    expect(check(receipt, "zh_mbti_landing")).toMatchObject({
      result: "fail",
      http_status: 500,
      attempt_count: 1,
    });
  });

  it("fails HTTP 200 with Internal Server Error text", async () => {
    const receipt = await runFixture({
      zh_mbti_landing: () => ({ body: "<main>Internal Server Error</main>" }),
    });
    expect(check(receipt, "zh_mbti_landing").diagnostic_summary[0]?.category)
      .toBe("internal_server_error_body");
  });

  it("fails HTTP 200 with the test landing error shell", async () => {
    const receipt = await runFixture({
      zh_mbti_landing: () => ({
        body: '<main data-testid="test-landing-error-shell">Retry</main>',
      }),
    });
    expect(check(receipt, "zh_mbti_landing").diagnostic_summary[0]?.category)
      .toBe("test_landing_error_shell");
  });

  it("fails a landing that lacks authority CTA/title structure", async () => {
    const receipt = await runFixture({
      zh_mbti_landing: () => ({
        body: '<main data-test-landing-read-source="fresh"><h1>Title</h1></main>',
      }),
    });
    expect(check(receipt, "zh_mbti_landing").diagnostic_summary[0]?.category)
      .toBe("landing_cta_structure_missing");
  });

  it("fails lookup canonical slug or scale identity mismatch", async () => {
    const receipt = await runFixture({
      zh_mbti_lookup: () => ({
        body: lookupPayload({
          slug: BIG5_SLUG,
          scaleCode: "BIG5_OCEAN",
          formCode: "mbti_144",
          locale: "zh",
        }),
      }),
    });
    expect(check(receipt, "zh_mbti_landing")).toMatchObject({
      result: "fail",
      authority_identity_result: "fail",
      attempt_count: 1,
    });
  });

  it("fails an empty mbti_144 question pack", async () => {
    const empty = questionPayload();
    empty.questions.items = [];
    const receipt = await runFixture({
      mbti_questions: () => ({ body: empty }),
    });
    expect(check(receipt, "mbti_144_question_pack")).toMatchObject({
      result: "fail",
      question_pack_semantic_result: "fail",
      attempt_count: 1,
    });
  });

  it("fails malformed mbti_144 JSON", async () => {
    const receipt = await runFixture({
      mbti_questions: () => ({
        body: '{"ok":true,',
        headers: { "Content-Type": "application/json" },
      }),
    });
    expect(check(receipt, "mbti_144_question_pack").diagnostic_summary[0]?.category)
      .toBe("malformed_json");
  });

  it("fails when the first question lacks a stable id", async () => {
    const invalid = questionPayload();
    invalid.questions.items[0].question_id = "";
    const receipt = await runFixture({
      mbti_questions: () => ({ body: invalid }),
    });
    expect(check(receipt, "mbti_144_question_pack").question_pack_semantic_result)
      .toBe("fail");
  });

  it("fails when the first question lacks an answer structure", async () => {
    const invalid = questionPayload();
    invalid.questions.items[0].options = [];
    const receipt = await runFixture({
      mbti_questions: () => ({ body: invalid }),
    });
    expect(check(receipt, "mbti_144_question_pack").question_pack_semantic_result)
      .toBe("fail");
  });

  it("fails the non-MBTI Big Five spot check independently", async () => {
    const receipt = await runFixture({
      zh_big5_landing: () => ({
        body: '<main data-testid="test-landing-error-shell">Retry</main>',
      }),
    });
    expect(check(receipt, "zh_big5_landing")).toMatchObject({
      result: "fail",
      attempt_count: 1,
    });
  });

  it("bounded-retries a transient readiness response and preserves diagnostics", async () => {
    const receipt = await runFixture({
      zh_mbti_landing: ({ count }) => (
        count === 1
          ? { status: 503, body: "warming" }
          : { body: landingHtml("mbti-landing-primary-cta") }
      ),
    });
    const result = check(receipt, "zh_mbti_landing");

    expect(result).toMatchObject({ result: "pass", attempt_count: 2 });
    expect(result.diagnostic_summary).toEqual([
      expect.objectContaining({
        attempt: 1,
        category: "http_503",
        retryable: true,
      }),
      expect.objectContaining({
        attempt: 2,
        category: "semantic_assertions_passed",
      }),
    ]);
  });

  it("does not retry a semantic failure into a false green", async () => {
    const receipt = await runFixture({
      zh_mbti_landing: ({ count }) => (
        count === 1
          ? {
              body: '<main data-test-landing-read-source="fresh"><h1>Title</h1></main>',
            }
          : { body: landingHtml("mbti-landing-primary-cta") }
      ),
    });
    expect(check(receipt, "zh_mbti_landing")).toMatchObject({
      result: "fail",
      attempt_count: 1,
    });
  });

  it("keeps the receipt sanitized and excludes response bodies and secrets", async () => {
    const secretMarker = "SECRET_RESPONSE_BODY_DO_NOT_COPY";
    const receipt = await runFixture({
      zh_mbti_landing: () => ({
        body: `<main data-test-landing-read-source="fresh"><h1>${secretMarker}</h1></main>`,
      }),
    });
    const serialized = JSON.stringify(receipt);

    expect(serialized).not.toContain(secretMarker);
    expect(serialized).not.toMatch(/cookie|authorization|response_body|ssh_target/i);
    expect(receipt).toMatchObject({
      schema_version: "fermatmind.test-landing-runtime-smoke.v1",
      environment: "staging",
      exact_sha: EXACT_SHA,
      workflow_run_id: "12345",
      workflow_run_attempt: "1",
      base_url_hostname: "127.0.0.1",
    });
  });
});

describe("test landing smoke deployment wiring", () => {
  const staging = readFileSync(".github/workflows/deploy-staging.yml", "utf8");
  const production = readFileSync(".github/workflows/deploy-production.yml", "utf8");
  const smoke = readFileSync("scripts/deploy/test-landing-runtime-smoke.mjs", "utf8");
  const packageJson = JSON.parse(readFileSync("package.json", "utf8")) as {
    scripts?: Record<string, string>;
  };

  it("wires staging and production to the same runner-side smoke and fail-closed gate", () => {
    for (const workflow of [staging, production]) {
      expect(workflow).toContain("node scripts/deploy/test-landing-runtime-smoke.mjs");
      expect(workflow).toContain("id: test_landing_smoke");
      expect(workflow).toContain("continue-on-error: true");
      expect(workflow).toContain("steps.test_landing_smoke.outcome == 'failure'");
      expect(workflow).toContain("name: Upload sanitized test landing smoke receipt");
      expect(workflow).toContain("if-no-files-found: error");
      expect(workflow).toContain("--summary \"$GITHUB_STEP_SUMMARY\"");
    }
    expect(packageJson.scripts?.["deploy:test-landing-smoke"])
      .toBe("node scripts/deploy/test-landing-runtime-smoke.mjs");
  });

  it("preserves existing dispatch/approval topology and adds no deploy trigger", () => {
    expect(staging.match(/workflow_dispatch:/g)).toHaveLength(1);
    expect(production.match(/workflow_dispatch:/g)).toHaveLength(1);
    expect(smoke).not.toMatch(/workflow_dispatch|gh workflow run|repository_dispatch/);
    expect(production).toContain("environment:\n      name: production");
    expect(production).toContain("APPROVE_RISKY_FAP_WEB_PRODUCTION_DEPLOY:");
  });

  it("runs the pure GET smoke on the GitHub runner without server package/browser installs", () => {
    expect(smoke).toContain('method: "GET"');
    expect(smoke).not.toMatch(/\b(?:POST|PUT|PATCH|DELETE)\b/);
    expect(smoke).not.toMatch(/playwright|chromium|cookie|authorization/i);
    for (const workflow of [staging, production]) {
      const start = workflow.indexOf("Run read-only test landing regression smoke");
      const end = workflow.indexOf("Enforce test landing smoke result", start);
      const wiring = workflow.slice(start, end);
      expect(start).toBeGreaterThan(-1);
      expect(end).toBeGreaterThan(start);
      expect(wiring).not.toMatch(/\bssh\b|pnpm install|npm install|playwright|chromium/i);
    }
  });
});

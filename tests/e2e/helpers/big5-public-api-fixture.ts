import { createServer, type ServerResponse } from "node:http";

function writeJson(res: ServerResponse, statusCode: number, body: Record<string, unknown>) {
  res.statusCode = statusCode;
  res.setHeader("content-type", "application/json; charset=utf-8");
  res.end(JSON.stringify(body));
}

export async function startBig5PublicApiFixture(): Promise<() => Promise<void>> {
  const server = createServer((req, res) => {
    const requestUrl = new URL(req.url ?? "/", "http://127.0.0.1:8000");
    const pathname = requestUrl.pathname.startsWith("/api")
      ? requestUrl.pathname.slice(4)
      : requestUrl.pathname;

    if (pathname === "/v0.3/scales/catalog") {
      writeJson(res, 200, {
        ok: true,
        items: [
          {
            title: "Big Five Personality Test",
            title_i18n: {
              en: "Big Five Personality Test",
              "zh-CN": "大五人格测试",
            },
            slug: "big-five-personality-test-ocean-model",
            description: "Deterministic Big Five test fixture.",
            questions_count: 120,
            time_minutes: 12,
            scale_code: "BIG5_OCEAN",
            is_public: true,
            is_active: true,
            is_indexable: true,
          },
        ],
      });
      return;
    }

    if (pathname === "/v0.3/scales/lookup") {
      const locale = requestUrl.searchParams.get("locale") === "zh" ? "zh" : "en";
      writeJson(res, 200, {
        ok: true,
        primary_slug: "big-five-personality-test-ocean-model",
        slug: "big-five-personality-test-ocean-model",
        requested_slug: "big-five-personality-test-ocean-model",
        resolved_from_alias: false,
        scale_code: "BIG5_OCEAN",
        locale,
        is_public: true,
        is_indexable: true,
        seo_title: "Big Five Personality Test",
        seo_description: "Deterministic Big Five test fixture.",
        forms: [{ form_code: "big5_120", question_count: 120 }],
        capabilities: {
          default_form_code: "big5_120",
          enabled_in_prod: true,
          paywall_mode: "full",
        },
        content_i18n_json: {
          [locale]: {
            title: "Big Five Personality Test",
            description: "Deterministic Big Five test fixture.",
            catalog: {
              questions_count: 120,
              time_minutes: 12,
            },
          },
        },
        landing_surface_v1: {
          version: "landing.surface.v1",
          entry_surface: "test_detail",
          start_test_target: `/${locale}/tests/big-five-personality-test-ocean-model/take`,
          cta_bundle: [],
        },
      });
      return;
    }

    writeJson(res, 404, { ok: false, message: "not found" });
  });

  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(8000, "127.0.0.1", () => {
      server.off("error", reject);
      resolve();
    });
  });

  return async () => {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => {
        if (error) reject(error);
        else resolve();
      });
    });
  };
}

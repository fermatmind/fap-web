import { createServer, type ServerResponse } from "node:http";
import publicContent from "../../fixtures/public-content/marketing-public.json";

type JsonBody = Record<string, unknown>;

export type Big5AttemptApiFixture = {
  report?: JsonBody;
  reportAccess?: JsonBody;
  share?: JsonBody;
};

export type Big5PublicApiFixtureState = {
  attempts: Record<string, Big5AttemptApiFixture>;
  history?: JsonBody;
  lookup?: JsonBody;
  requests: URL[];
};

export function immutableBig5Authority(locale = "en") {
  return {
    schema_version: "fap.big5.private_result_authority.v1",
    mode: "immutable_legacy_snapshot",
    locale,
    source_hash: "",
    compiled_hash: "",
  };
}

function writeJson(res: ServerResponse, statusCode: number, body: Record<string, unknown>) {
  res.statusCode = statusCode;
  res.setHeader("content-type", "application/json; charset=utf-8");
  res.end(JSON.stringify(body));
}

export async function startBig5PublicApiFixture(
  state: Big5PublicApiFixtureState = { attempts: {}, requests: [] }
): Promise<() => Promise<void>> {
  const server = createServer((req, res) => {
    const requestUrl = new URL(req.url ?? "/", "http://127.0.0.1:8000");
    state.requests.push(requestUrl);
    res.setHeader("access-control-allow-origin", "http://127.0.0.1:3000");
    res.setHeader("access-control-allow-methods", "GET, POST, OPTIONS");
    res.setHeader("access-control-allow-headers", "authorization, content-type, x-fap-locale");
    if (req.method === "OPTIONS") {
      res.statusCode = 204;
      res.end();
      return;
    }
    const pathname = requestUrl.pathname.startsWith("/api")
      ? requestUrl.pathname.slice(4)
      : requestUrl.pathname;

    if (pathname === "/v0.3/auth/guest") {
      writeJson(res, 200, {
        ok: true,
        fm_token: "fm_e2e_big5_local_api_fixture",
      });
      return;
    }

    if (pathname === "/v0.3/scales/catalog") {
      const locale = requestUrl.searchParams.get("locale")?.startsWith("zh") ? "zh-CN" : "en";
      const responses = publicContent as Record<string, Record<string, unknown>>;
      writeJson(res, 200, responses[`/v0.3/scales/catalog?locale=${locale}`]);
      return;
    }

    if (pathname === "/v0.3/scales/lookup") {
      if (state.lookup) {
        writeJson(res, 200, state.lookup);
        return;
      }

      const locale = requestUrl.searchParams.get("locale")?.startsWith("zh") ? "zh-CN" : "en";
      const slug = requestUrl.searchParams.get("slug") ?? "big-five-personality-test-ocean-model";
      const responses = publicContent as Record<string, Record<string, unknown>>;
      const lookup = responses[`/v0.3/scales/lookup?slug=${slug}&locale=${locale}`];
      writeJson(res, lookup ? 200 : 404, lookup ?? { ok: false, error_code: "UNMOCKED_PUBLIC_REQUEST" });
      return;
    }

    if (pathname === "/v0.3/me/attempts" && state.history) {
      writeJson(res, 200, state.history);
      return;
    }

    const attemptMatch = pathname.match(/^\/v0\.3\/attempts\/([^/]+)\/(report-access|report|share)$/);
    if (attemptMatch) {
      const attemptId = decodeURIComponent(attemptMatch[1]);
      const resource = attemptMatch[2];
      const fixture = state.attempts[attemptId];
      const body = resource === "report-access"
        ? fixture?.reportAccess
        : resource === "report"
          ? fixture?.report
          : fixture?.share;

      if (body) {
        writeJson(res, 200, body);
        return;
      }
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

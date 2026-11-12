import { randomBytes } from "node:crypto";
import { isIP } from "node:net";
import { NextRequest, NextResponse } from "next/server";
import { resolveApiBaseUrl } from "@/lib/api-base";

const cookieName = "__Host-fm-friendship";
const tokenPattern = /^[a-f0-9]{64}$/;
const idPattern = /^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i;
const policy = {
  "Cache-Control": "private, no-store",
  "X-Robots-Tag": "noindex, nofollow",
  "Referrer-Policy": "no-referrer",
};
const methods: Record<string, readonly string[]> = {
  manage: ["GET", "PATCH", "DELETE"],
  progress: ["GET"],
  result: ["GET"],
  answers: ["POST"],
  entries: ["POST"],
  "browser-grant": ["POST"],
  backup: ["POST"],
};
const challengeFields = ["id", "nickname", "locale", "version", "questions", "closed", "expires_at", "answers", "entries", "question_stats"];
const progressFields = ["nickname", "guesses", "answers", "combo", "best_combo"];
const resultFields = ["id", "nickname", "correct", "total", "percent", "categories", "answers", "guesses", "preview", "entries", "question_stats"];
const responseFields: Record<string, readonly string[]> = {
  progress: progressFields, answers: progressFields,
  result: resultFields, entries: resultFields,
  "browser-grant": ["granted"],
};
type Context = { params: Promise<{ operation: string[] }> };

function response(status: number, payload: object = {}, upstream?: Headers) {
  const headers = new Headers(policy);
  for (const name of ["Retry-After", "X-RateLimit-Limit", "X-RateLimit-Remaining"]) {
    const value = upstream?.get(name);
    if (value && /^[0-9]+$/.test(value)) headers.set(name, value);
  }
  return NextResponse.json(payload, { status, headers });
}

function requestOrigin(request: NextRequest): string | undefined {
  const host = request.headers.get("host") ?? request.nextUrl.host;
  if (["fermatmind.com", "www.fermatmind.com", "staging.fermatmind.com"].includes(host)) return `https://${host}`;
  if (/^(?:localhost|127\.0\.0\.1)(?::[0-9]+)?$/.test(host)) return `http://${host}`;
}

async function boundedBody(request: NextRequest): Promise<string | undefined> {
  if (!request.body) return;
  const reader = request.body.getReader();
  const decoder = new TextDecoder();
  let body = "";
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) return body + decoder.decode();
    size += value.byteLength;
    if (size > 32_768) {
      await reader.cancel();
      throw new Error("body too large");
    }
    body += decoder.decode(value, { stream: true });
  }
}

async function handle(request: NextRequest, context: Context) {
  const parts = (await context.params).operation;
  if (request.nextUrl.search) return response(404);
  const [collection, id, action] = parts;
  const backup = parts.length === 3 && collection === "challenges" && action === "backup";
  const origin = requestOrigin(request);
  const suppliedOrigin = request.headers.get("origin");
  const nativeBackup = backup && request.headers.get("sec-fetch-site") === "same-origin"
    && request.headers.get("sec-fetch-mode") === "navigate"
    && request.headers.get("sec-fetch-dest") === "document"
    && request.headers.get("sec-fetch-user") === "?1";
  // The management page's no-referrer policy serializes a native form POST's Origin as null.
  if (request.method !== "GET" && (!origin || (suppliedOrigin !== origin && !(nativeBackup && suppliedOrigin === "null")))) {
    return response(403);
  }

  const stored = request.cookies.get(cookieName)?.value;
  const session = stored && tokenPattern.test(stored) ? stored : undefined;
  if (parts.length === 1 && parts[0] === "session" && request.method === "POST") {
    const result = response(200);
    result.cookies.set(cookieName, session ?? randomBytes(32).toString("hex"), {
      httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 90 * 86_400,
    });
    return result;
  }

  const create = parts.length === 1 && collection === "challenges" && request.method === "POST";
  if (!create && (parts.length !== 3 || collection !== "challenges" || !idPattern.test(id)
    || !Object.hasOwn(methods, action) || !methods[action].includes(request.method))) return response(404);
  if (!session) return response(401);
  if (backup && !nativeBackup) return response(403);

  const headers = new Headers({ Accept: "application/json", "X-Friendship-Browser-Session": session });
  // The public OpenResty ingress overwrites X-Real-IP before reaching the loopback server.
  const clientIp = request.headers.get("x-real-ip");
  if (clientIp && isIP(clientIp)) headers.set("X-Forwarded-For", clientIp);
  if (action === "entries" && request.headers.get("x-friendship-owner-preview") === "1") {
    headers.set("X-Friendship-Owner-Preview", "1");
  }
  let body: string | undefined;
  try {
    body = await boundedBody(request);
  } catch {
    return response(413);
  }
  const locale = action === "backup" ? new URLSearchParams(body).get("locale") : null;
  if (action === "backup" && locale !== "zh" && locale !== "zh-TW" && locale !== "en") return response(422);
  if (body && action !== "backup") headers.set("Content-Type", "application/json");
  try {
    const upstream = await fetch(`${resolveApiBaseUrl()}/v0.3/friendship/${parts.join("/")}`, {
      method: request.method, headers, body: action === "backup" ? undefined : body, redirect: "error", cache: "no-store", signal: AbortSignal.timeout(18_000),
    });
    if (!upstream.ok) return response(upstream.status >= 400 && upstream.status <= 599 ? upstream.status : 502, {}, upstream.headers);
    if (!upstream.headers.get("content-type")?.startsWith("application/json")) return response(502);
    const payload: unknown = await upstream.json();
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) return response(502);
    if (action === "backup") {
      const { key } = payload as { key?: unknown };
      if (typeof key !== "string" || !tokenPattern.test(key)) return response(502);
      const link = `${origin}/${locale}/share/friendship/${id}/manage#key=${key}`;
      const warning = locale === "en" ? "Private management link. Keep this file private." : "私人管理連結。請妥善保管此檔案。";
      return new NextResponse(`${warning}\n${link}\n`, {
        headers: {
          ...policy,
          "Content-Type": "text/plain; charset=utf-8",
          "Content-Disposition": 'attachment; filename="fermatmind-private-management.txt"',
          "X-Content-Type-Options": "nosniff",
        },
      });
    }
    const fields = request.method === "DELETE" ? ["deleted"] : (responseFields[action] ?? challengeFields);
    return response(upstream.status, Object.fromEntries(Object.entries(payload).filter(([key]) => fields.includes(key))), upstream.headers);
  } catch {
    return response(502);
  }
}

export { handle as GET, handle as POST, handle as PATCH, handle as DELETE };

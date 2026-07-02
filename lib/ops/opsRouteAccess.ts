import { timingSafeEqual } from "node:crypto";
import { cookies, headers } from "next/headers";
import { notFound } from "next/navigation";

const ENABLED_VALUES = new Set(["1", "true", "yes", "on"]);
const OPS_TOKEN_COOKIE = "fap_ops_access_token";
const OPS_TOKEN_HEADER = "x-fap-ops-token";

export function isInternalOpsRouteEnabled(env: Record<string, string | undefined> = process.env): boolean {
  const value = env.FAP_ENABLE_INTERNAL_OPS_ROUTES;
  return typeof value === "string" && ENABLED_VALUES.has(value.trim().toLowerCase());
}

function normalizeSecret(value: string | null | undefined): string {
  return String(value ?? "").trim();
}

export function isOpsRouteAccessAllowed({
  env = process.env,
  headerToken,
  cookieToken,
}: {
  env?: Record<string, string | undefined>;
  headerToken?: string | null;
  cookieToken?: string | null;
} = {}): boolean {
  if (!isInternalOpsRouteEnabled(env)) {
    return false;
  }

  const expected = normalizeSecret(env.FAP_INTERNAL_OPS_TOKEN);
  if (expected.length < 16) {
    return false;
  }

  const presented = normalizeSecret(headerToken) || normalizeSecret(cookieToken);
  if (!presented || presented.length !== expected.length) {
    return false;
  }

  return timingSafeEqual(Buffer.from(presented), Buffer.from(expected));
}

export async function requireOpsRouteAccess(): Promise<void> {
  const requestHeaders = await headers();
  const requestCookies = await cookies();
  const allowed = isOpsRouteAccessAllowed({
    headerToken: requestHeaders.get(OPS_TOKEN_HEADER),
    cookieToken: requestCookies.get(OPS_TOKEN_COOKIE)?.value,
  });

  if (!allowed) {
    notFound();
  }
}

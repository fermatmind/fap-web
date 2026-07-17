import { readFileSync } from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const EXACT_GIT_REVISION = /^[0-9a-f]{40}$/;
const RESPONSE_HEADERS = {
  "Cache-Control": "private, no-store, max-age=0, must-revalidate",
  "CDN-Cache-Control": "no-store",
  "Referrer-Policy": "no-referrer",
  "X-Content-Type-Options": "nosniff",
  "X-Robots-Tag": "noindex, nofollow, noarchive",
} as const;

export function readDeployedRevision(
  cwd = process.cwd(),
  configuredRevisionFile = process.env.FERMATMIND_DEPLOYED_REVISION_FILE?.trim(),
): string | null {
  try {
    const revisionFile = configuredRevisionFile
      ? path.isAbsolute(configuredRevisionFile)
        ? configuredRevisionFile
        : null
      : path.join(cwd, "REVISION");
    if (!revisionFile) {
      return null;
    }

    const revision = readFileSync(revisionFile, "utf8").trim();
    return EXACT_GIT_REVISION.test(revision) ? revision : null;
  } catch {
    return null;
  }
}

export function buildDeployedRevisionResponse(revision: string | null): NextResponse {
  if (!revision || !EXACT_GIT_REVISION.test(revision)) {
    return NextResponse.json(
      { ok: false, error: "revision_unavailable" },
      { status: 503, headers: RESPONSE_HEADERS },
    );
  }

  return NextResponse.json(
    { revision },
    {
      status: 200,
      headers: {
        ...RESPONSE_HEADERS,
        "X-Revision": revision,
      },
    },
  );
}

export function GET(): NextResponse {
  return buildDeployedRevisionResponse(readDeployedRevision());
}

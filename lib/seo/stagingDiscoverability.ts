import { NextResponse } from "next/server";

import { isConfiguredStagingSiteUrl, isStagingSiteUrl } from "@/lib/site";

export const STAGING_NOINDEX_HEADER_VALUE = "noindex, nofollow, noarchive";

const MACHINE_DISCOVERABILITY_PATHS = new Set([
  "/robots.txt",
  "/sitemap.xml",
  "/sitemap-en.xml",
  "/sitemap-zh.xml",
  "/llms.txt",
  "/llms-full.txt",
]);

export function isStagingRequestHost(host: string | null | undefined): boolean {
  const normalized = String(host ?? "").trim();
  if (!normalized) {
    return false;
  }

  return isStagingSiteUrl(`https://${normalized}`);
}

export function isConfiguredStagingDiscoverability(): boolean {
  return isConfiguredStagingSiteUrl();
}

export function isStagingMachineDiscoverabilityPath(pathname: string): boolean {
  return MACHINE_DISCOVERABILITY_PATHS.has(pathname);
}

export function withStagingNoindexHeader<T extends Response>(response: T): T {
  response.headers.set("X-Robots-Tag", STAGING_NOINDEX_HEADER_VALUE);

  return response;
}

export function createStagingRobotsResponse(): NextResponse {
  return withStagingNoindexHeader(
    new NextResponse("User-agent: *\nDisallow: /\n", {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store, max-age=0",
      },
    })
  );
}

export function createStagingDiscoverabilityGoneResponse(kind: "sitemap" | "llms" | "generic"): NextResponse {
  return withStagingNoindexHeader(
    new NextResponse(`${kind} is unavailable on staging.\n`, {
      status: 410,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store, max-age=0",
      },
    })
  );
}

export function createConfiguredStagingLlmsResponse(): NextResponse {
  return createStagingDiscoverabilityGoneResponse("llms");
}

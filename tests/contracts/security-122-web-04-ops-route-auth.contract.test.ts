import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { isOpsRouteAccessAllowed, isInternalOpsRouteEnabled } from "@/lib/ops/opsRouteAccess";
import { isSecurity122Web04AllowedFile } from "./helpers/currentPrScope";

const ROOT = process.cwd();

const ROUTES = [
  {
    path: "app/(localized)/[locale]/ops/seo-operations/page.tsx",
    loader: "loadSeoOperationsReadModel",
  },
  {
    path: "app/(localized)/[locale]/ops/content-pages/page.tsx",
    loader: "listContentPagesForOps",
  },
  {
    path: "app/(localized)/[locale]/ops/content-pages/[slug]/page.tsx",
    loader: "getContentPage",
  },
] as const;

function source(file: string): string {
  return readFileSync(`${ROOT}/${file}`, "utf8");
}

function changedFiles(): string[] {
  const committed = execFileSync("git", ["diff", "--name-only", "origin/main...HEAD"], {
    cwd: ROOT,
    encoding: "utf8",
  });
  const uncommitted = execFileSync("git", ["diff", "--name-only"], {
    cwd: ROOT,
    encoding: "utf8",
  });

  return Array.from(
    new Set(
      `${committed}\n${uncommitted}`
        .split("\n")
        .map((file) => file.trim())
        .filter(Boolean),
    ),
  ).sort();
}

describe("SECURITY-122-WEB-04 ops route authentication", () => {
  it("keeps internal ops routes disabled unless explicitly enabled", () => {
    expect(isInternalOpsRouteEnabled({})).toBe(false);
    expect(isInternalOpsRouteEnabled({ FAP_ENABLE_INTERNAL_OPS_ROUTES: "false" })).toBe(false);
    expect(isInternalOpsRouteEnabled({ FAP_ENABLE_INTERNAL_OPS_ROUTES: "0" })).toBe(false);
    expect(isInternalOpsRouteEnabled({ FAP_ENABLE_INTERNAL_OPS_ROUTES: "true" })).toBe(true);
    expect(isInternalOpsRouteEnabled({ FAP_ENABLE_INTERNAL_OPS_ROUTES: "1" })).toBe(true);
  });

  it("requires an enabled route flag and a long matching ops token", () => {
    const env = {
      FAP_ENABLE_INTERNAL_OPS_ROUTES: "true",
      FAP_INTERNAL_OPS_TOKEN: "ops-route-token-123456",
    };

    expect(isOpsRouteAccessAllowed({ env, headerToken: "ops-route-token-123456" })).toBe(true);
    expect(isOpsRouteAccessAllowed({ env, cookieToken: "ops-route-token-123456" })).toBe(true);
    expect(isOpsRouteAccessAllowed({ env, headerToken: "wrong-token-123456789" })).toBe(false);
    expect(isOpsRouteAccessAllowed({ env: { ...env, FAP_ENABLE_INTERNAL_OPS_ROUTES: "false" }, headerToken: env.FAP_INTERNAL_OPS_TOKEN })).toBe(
      false,
    );
    expect(isOpsRouteAccessAllowed({ env: { ...env, FAP_INTERNAL_OPS_TOKEN: "short" }, headerToken: "short" })).toBe(false);
  });

  it("guards each ops dashboard route before loading private read models", () => {
    for (const route of ROUTES) {
      const routeSource = source(route.path);
      const guardIndex = routeSource.indexOf("await requireOpsRouteAccess();");
      const loaderIndex = routeSource.indexOf(`${route.loader}(`);

      expect(routeSource).toContain('import { requireOpsRouteAccess } from "@/lib/ops/opsRouteAccess";');
      expect(routeSource).toContain('export const dynamic = "force-dynamic";');
      expect(guardIndex).toBeGreaterThanOrEqual(0);
      expect(loaderIndex).toBeGreaterThanOrEqual(0);
      expect(guardIndex).toBeLessThan(loaderIndex);
    }
  });

  it("keeps the WEB-04 diff inside the declared ops dashboard auth scope", () => {
    expect(changedFiles()).not.toHaveLength(0);
    expect(changedFiles().filter((file) => !isSecurity122Web04AllowedFile(file))).toEqual([]);
  });
});

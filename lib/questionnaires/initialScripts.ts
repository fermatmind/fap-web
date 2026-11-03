import { readFileSync } from "node:fs";
import { join } from "node:path";

type Tool = "disc" | "cognitive-functions-test";

/** Read the installed build, never a saved list of hashed asset names. */
export function initialQuestionnaireScripts(tool: Tool, root = process.cwd()): string[] {
  try {
    if (tool !== "disc" && tool !== "cognitive-functions-test") return [];
    const build = JSON.parse(readFileSync(join(root, ".next/build-manifest.json"), "utf8"));
    const source = readFileSync(join(root, `.next/server/app/(localized)/[locale]/tests/explore/${tool}/page_client-reference-manifest.js`), "utf8");
    const serialized = source.match(/globalThis\.__RSC_MANIFEST\[[^\n]+?\]\s*=\s*(\{[\s\S]*\})\s*;?\s*$/)?.[1];
    if (!serialized || !Array.isArray(build.rootMainFiles)) return [];
    const client = JSON.parse(serialized);
    if (!client.clientModules || typeof client.clientModules !== "object") return [];
    const chunks: unknown[] = [...build.rootMainFiles];
    for (const [name, module] of Object.entries(client.clientModules)) {
      // The global error document is not part of these pages' hydration tree.
      if (name.endsWith("/app/global-error.tsx")) continue;
      const entry = module as { chunks?: unknown } | null;
      if (!entry || !Array.isArray(entry.chunks)) return [];
      chunks.push(...entry.chunks);
    }
    const hrefs = [...new Set(chunks.map(chunk => typeof chunk === "string" && chunk.startsWith("/_next/") ? chunk : `/_next/${chunk}`))];
    if (hrefs.length > 32 || hrefs.some(href => !/^\/_next\/static\/chunks\/[A-Za-z0-9._~-]+\.js$/.test(href))) return [];
    return hrefs;
  } catch {
    // Dev or an unavailable manifest keeps Next's normal loader; no asset guess.
    return [];
  }
}

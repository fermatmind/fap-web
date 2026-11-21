import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { eqRedesignLibrarySchema, eqPreviewResultIds, resolveEqRedesignPreview } from "./redesignPreview";

/** Shared development-only source for the unlock and full-report previews. */
export async function loadEqRedesignPreview(result?: string) {
  if (process.env.NODE_ENV !== "development") throw new Error("EQ preview is development-only");
  if (result && !eqPreviewResultIds.some(id => id === result)) throw new Error("Unknown EQ preview result");
  const apiRoot = process.env.EQ_PREVIEW_API_ROOT ?? path.resolve(process.cwd(), "../eq-result-redesign-api");
  const bytes = await readFile(path.join(apiRoot, "backend/content_packs/EQ_60/v1/raw/report_assets/result_page_depth_modules.json"), "utf8");
  const library = eqRedesignLibrarySchema.parse((JSON.parse(bytes) as Record<string, unknown>).redesign_preview);
  return { library, candidate: resolveEqRedesignPreview(library, result ?? library.default_result) };
}

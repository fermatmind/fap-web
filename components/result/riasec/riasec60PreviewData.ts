import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { resolve } from "node:path";
import type { DisplayLocale } from "@/lib/i18n/locales";
import { assembleRiasecResultViewModel, type RiasecResultViewModel } from "@/lib/riasec/resultAssembler";
import type { Career94Premium } from "@/app/(localized)/[locale]/career/assessment/career94-api";
import type { UnlockDimensionReading } from "@/components/career/UnlockReportExperience";

const labels = [
  ["R", "现实型", "Realistic", 40], ["I", "研究型", "Investigative", 80],
  ["A", "艺术型", "Artistic", 70], ["S", "社会型", "Social", 60],
  ["E", "企业型", "Enterprising", 30], ["C", "常规型", "Conventional", 50],
] as const;
type AtlasRow = { reading: string; examples: string[]; next_step: string; next_steps?: string[] };
type DimensionAsset = { dimension_code: string; title: string; desktop_atlas_by_decile: AtlasRow[]; user_visible_boundary: string };
type ChainAsset = { unordered_top3_key: string; first_experiment: string; activity_chain: string };
type Compiled = { assets: Record<string, unknown>; source_hash: string; compiled_hash: string; localRoot?: string };

/** Local design data only. No scored attempt, report authority, order or entitlement is created. */
export function riasec60DesignModel(locale: DisplayLocale): RiasecResultViewModel {
  return {
    ...assembleRiasecResultViewModel({}, locale === "en" ? "en" : "zh"),
    topCode: "IAS", primaryType: "I", secondaryType: "A", tertiaryType: "S",
    formCode: "riasec_60", formKind: "standard", questionCount: 60, estimatedMinutes: 8,
    scoreKind: "dimension_scores_0_100",
    dimensions: labels.map(([code, zh, en, score]) => ({ code, label: locale === "en" ? en : zh, score, scoreAvailable: true })),
    moduleVisibilityPolicy: {
      schemaVersion: "riasec.module_visibility_policy.v1", policyId: "local-design-only", qualityState: "synthetic", profileShape: "synthetic", formCode: "riasec_60",
      modules: [{ key: "six_dimension_map", visibility: "visible", reason: "synthetic_design_preview" }],
      fallbackPolicy: { unknownModule: "hidden", missingBackendState: "hidden", frontendInferenceAllowed: false },
    },
  };
}

async function readLocalCompiledAssets(): Promise<Compiled> {
  if (process.env.NODE_ENV !== "development") throw new Error("LOCAL_PREVIEW_ONLY");
  // Support the ordinary sibling checkouts and this task's existing isolated web worktree.
  // Only the fixed RIASEC package is read; no user-supplied paths or runtime API are accepted.
  const candidates = process.env.FM_RIASEC_PREVIEW_API_ROOT ? [resolve(process.env.FM_RIASEC_PREVIEW_API_ROOT)] : [
    resolve(process.cwd(), "../riasec-trilingual-api"), resolve(process.cwd(), "../fap-api"), resolve(process.cwd(), "../../fap-api"),
  ];
  for (const root of candidates) {
    let manifestBytes: string;
    try { manifestBytes = await readFile(resolve(root, "backend/content_assets/riasec/compiled/manifest.json"), "utf8"); }
    catch (error) { if ((error as NodeJS.ErrnoException).code === "ENOENT") continue; throw new Error("PREVIEW_ASSETS_UNAVAILABLE"); }
    const manifest = JSON.parse(manifestBytes) as { artifacts: { path: string; sha256: string }[]; source_hash: string; compiled_hash: string };
    const artifact = manifest.artifacts.find(row => row.path === "private_result.compiled.json");
    const bytes = await readFile(resolve(root, "backend/content_assets/riasec/compiled/private_result.compiled.json"));
    if (!artifact || createHash("sha256").update(bytes).digest("hex") !== artifact.sha256) throw new Error("PREVIEW_ASSETS_UNAVAILABLE");
    const compiled = JSON.parse(bytes.toString()) as Compiled;
    if (compiled.source_hash !== manifest.source_hash || compiled.compiled_hash !== manifest.compiled_hash) throw new Error("PREVIEW_ASSETS_UNAVAILABLE");
    return { ...compiled, localRoot: root };
  }
  throw new Error("PREVIEW_ASSETS_UNAVAILABLE");
}

export async function loadRiasec60DesignReport(locale: DisplayLocale) {
  const pack = await readLocalCompiledAssets();
  const english = locale === "en";
  const sourceLocale = english ? "en" : locale === "zh-TW" ? "zh-TW" : "zh-CN";
  const model = riasec60DesignModel(locale);
  const dimensionAsset = pack.assets[sourceLocale === "zh-CN" ? "dimension_deep_copy_v1.zh-CN.r3.json" : `dimension_deep_copy_v1.${sourceLocale}.json`] as { dimensions: DimensionAsset[] };
  const chains = pack.assets[`top3_code_chain_strategy_v1.${sourceLocale}.jsonl`] as ChainAsset[];
  const chain = chains.find(row => row.unordered_top3_key === "I_A_S");
  if (!chain || !Array.isArray(dimensionAsset?.dimensions)) throw new Error("PREVIEW_ASSETS_UNAVAILABLE");
  const readings = model.dimensions.map(dimension => {
    const asset = dimensionAsset.dimensions.find(row => row.dimension_code === dimension.code);
    const panel = asset?.desktop_atlas_by_decile[Math.min(9, Math.floor(dimension.score / 10))];
    if (!panel?.reading || !panel.next_step || !asset?.user_visible_boundary || !asset.title) throw new Error("PREVIEW_ASSETS_UNAVAILABLE");
    return { ...dimension, label: asset.title, panel, boundary: asset.user_visible_boundary };
  });
  model.dimensions = readings.map(({ code, label, score, scoreAvailable }) => ({ code, label, score, scoreAvailable }));
  const premium: Career94Premium = {
    dimensions: readings.map(row => ({ label: row.label, score: row.score, detail: row.panel.reading })),
    preferences: [], condition_note: readings.find(row => row.code === "I")!.boundary,
    actions: [chain.first_experiment, ...["I", "A", "S"].map(code => readings.find(row => row.code === code)!.panel.next_step)],
    ai_prompt: english
      ? `Help me explore these activity interests: ${chain.activity_chain} Suggest three low-risk tasks and questions I could ask a practitioner. Do not infer ability or promise a career match.`
      : locale === "zh-TW"
        ? `請協助我探索這些興趣活動：${chain.activity_chain} 請提出三個低風險試做任務，以及可以向從業者了解的問題。不要推斷能力或承諾職業匹配。`
        : `请帮助我探索这些兴趣活动：${chain.activity_chain} 请提出三个低风险试做任务，以及可以向从业者了解的问题。不要推断能力或承诺职业匹配。`,
  };
  const detailReadings: UnlockDimensionReading[] = readings.map(row => ({
    code: row.code, label: row.label, score: row.score, reading: row.panel.reading, examples: row.panel.examples, nextStep: row.panel.next_step, nextSteps: row.panel.next_steps,
  }));
  return { model, premium, readings: detailReadings, chainReading: chain.activity_chain };
}

/** Uses backend-generated synthetic projections with the actual reading renderer. No persisted result is loaded. */
export async function loadRiasec60ReadingDesignModel(locale: DisplayLocale, requestedProfile = "IAR") {
  const pack = await readLocalCompiledAssets();
  const profile = ["IAR", "IAS", "LOW", "NEAR", "ECR"].includes(requestedProfile) ? requestedProfile : "IAR";
  const bytes = await readFile(resolve(pack.localRoot!, "backend/storage/app/local-previews/riasec-enriched-samples.json"), "utf8");
  const samples = JSON.parse(bytes) as { source_hash: string; compiled_hash: string; profiles: Record<string, Record<string, Record<string, unknown>>> };
  if (samples.source_hash !== pack.source_hash || samples.compiled_hash !== pack.compiled_hash) throw new Error("PREVIEW_ASSETS_UNAVAILABLE");
  const projection = samples.profiles[locale === "en" ? "en" : "zh-CN"]?.[profile];
  if (!projection) throw new Error("PREVIEW_ASSETS_UNAVAILABLE");
  const vm = assembleRiasecResultViewModel({ scale_code: "RIASEC", riasec_public_projection_v2: projection,
    riasec_private_result_authority: projection.private_result_authority } as Parameters<typeof assembleRiasecResultViewModel>[0], locale === "en" ? "en" : "zh");
  if (locale !== "zh-TW") return vm;
  // Only this synthetic preview applies native Taiwan reader copy. It does not register a new API locale.
  const readerText = new Map<string, string>();
  const collect = (source: unknown, target: unknown) => {
    if (typeof source === "string" && typeof target === "string" && /\p{Script=Han}/u.test(source)) readerText.set(source, target);
    else if (source && target && typeof source === "object" && typeof target === "object") {
      for (const key of Object.keys(source)) collect((source as Record<string, unknown>)[key], (target as Record<string, unknown>)[key]);
    }
  };
  for (const path of Object.keys(pack.assets).filter(path => path.includes(".zh-CN."))) {
    collect(pack.assets[path], pack.assets[path.replace(/\.zh-CN(?:\.r3)?\./, ".zh-TW.")]);
  }
  const display = (value: unknown): unknown => typeof value === "string" ? readerText.get(value) ?? value
    : Array.isArray(value) ? value.map(display)
      : value && typeof value === "object" ? Object.fromEntries(Object.entries(value).map(([key, child]) => [key, display(child)])) : value;
  return display(vm) as RiasecResultViewModel;
}

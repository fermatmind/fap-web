export const RIASEC_DIMENSIONS = ["R", "I", "A", "S", "E", "C"] as const;
export type RiasecCode = typeof RIASEC_DIMENSIONS[number];
export type ExposureTier = "broad_mainstream" | "specialized_track";
export type VerificationStatus = "已证实" | "待确认" | "冲突待查";

type Source = { id: string; url: string };
type Basis = { current_item_id: string; source_ids: string[] };
type Verification = { text: string; status: VerificationStatus; basis: Basis };

export type CuratedCareer = {
  slug: string;
  display_name_zh: string;
  onet_soc_code: string;
  major_categories: string[];
  primary_riasec: RiasecCode[];
  scene_cluster: string;
  exposure_tier: ExposureTier;
  publish_status: "published_current";
  evidence_meta: {
    region: "中国大陆";
    current_locale: "zh-CN";
    current_sha256: string;
    sources: Source[];
  };
  linked_comparison_slugs: string[];
  comparison_facets: {
    tasks: Verification[];
    work_style: Verification[];
    work_conditions: Verification[];
    unknown_fields: string[];
  };
} & (
  | { card_depth: "standard" }
  | {
      card_depth: "deep";
      free_task_card: {
        why_shown_template: string;
        typical_daily_task: string;
        first_verification_question: string;
      };
      micro_trial: { title: string; instruction: string; reflection_prompt: string };
      jd_check_questions: string[];
    }
);

type Header = { schema_version: "1.0.0"; locale_market: "zh-CN" };
type ExclusionLists = Record<"p0_titles" | "gambling" | "military" | "non_mainland" | "duplicate", string[]>;
export type CuratedPool = Header & {
  updated_at: string;
  baseline: {
    api_commit: string;
    manifest_sha256: string;
    t2_fix_commit: string;
    t2_slugs: string[];
    excluded_slugs: ExclusionLists;
  };
  entries: CuratedCareer[];
};
export type SceneClusters = Header & {
  recommendation_policy: { top_n: 5; max_per_scene: 1; max_specialized_in_top_5: 2 };
  clusters: Record<string, { max_per_top_5: 1; vertical_only: boolean }>;
};
type Route = { example_slugs: string[]; activity: "micro_trial" };
export type RoutePair = [Route, Route];
export type FlatRoutes = Header & {
  selection_policy: {
    max_sd_exclusive: 10;
    priority: ["top_two", "leading", "default_pair"];
    tie_break_order: RiasecCode[];
  };
  by_top_two: Partial<Record<string, RoutePair>>;
  by_leading: Partial<Record<RiasecCode, RoutePair>>;
  default_pair: RoutePair;
};
type VectorRelease = { careers: Record<string, { onet: string; interestVector: number[] }> };

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const scenePattern = /^[a-z0-9]+(?:_[a-z0-9]+)*$/;
const digest = /^[a-f0-9]{64}$/;
const shaPattern = /^[a-f0-9]{40}$/;
const prohibited = /高薪|少加班|必录|保过|绝对适合|唯一方向|铁饭碗|少见复合型|[3三]\s*个?月内耗崩溃|绝对干不长|赶紧辞职|低分淘汰|综合匹配度|三轴总分匹配率|三轴.{0,12}(合成|综合).{0,12}(分数|匹配|[%％])/u;
const undergraduate = "哲学 经济学 法学 教育学 文学 历史学 理学 工学 农学 医学 管理学 艺术学 交叉学科".split(" ");
const vocational = "农林牧渔 资源环境与安全 能源动力与材料 土木建筑 水利 装备制造 生物与化工 轻工纺织 食品药品与粮食 交通运输 电子与信息 医药卫生 财经商贸 旅游 文化艺术 新闻传播 教育与体育 公安与司法 公共管理与服务".split(" ");
const categoryKeys = new Set([
  ...undergraduate.map((name) => `本科·${name}`),
  ...vocational.map((name) => `高职·${name}大类`),
]);
const statuses = new Set<VerificationStatus>(["已证实", "待确认", "冲突待查"]);
const fixedPairKeys = RIASEC_DIMENSIONS.flatMap((code, index) =>
  RIASEC_DIMENSIONS.slice(index + 1).map((next) => code + next)
);

function check(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function object(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function nonblank(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function texts(value: unknown, min = 1): value is string[] {
  return Array.isArray(value) && value.length >= min && value.every(nonblank);
}

function unique(values: readonly unknown[]) {
  return new Set(values).size === values.length;
}

function same(left: unknown, right: unknown) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function header(value: unknown): value is Header & Record<string, unknown> {
  return object(value) && value.schema_version === "1.0.0" && value.locale_market === "zh-CN";
}

export function derivePrimaryRiasec(vector: readonly number[]): RiasecCode[] {
  check(vector.length === 6 && vector.every((value) => Number.isFinite(value)), "expected six finite RIASEC values");
  return RIASEC_DIMENSIONS.map((code, index) => ({ code, index }))
    .sort((a, b) => vector[b.index] - vector[a.index] || a.index - b.index)
    .slice(0, 3)
    .map(({ code }) => code);
}

function slugList(value: unknown, length: number) {
  return texts(value) && value.length === length && unique(value) && value.every((slug) => slugPattern.test(slug));
}

function validateBaseline(input: unknown): CuratedPool["baseline"] {
  check(object(input) && typeof input.api_commit === "string" &&
    input.api_commit === "9462047566f76e2cd2d8e1d307fcd3425b0ac904" &&
    typeof input.t2_fix_commit === "string" && shaPattern.test(input.t2_fix_commit) &&
    typeof input.manifest_sha256 === "string" && digest.test(input.manifest_sha256) &&
    slugList(input.t2_slugs, 43) && object(input.excluded_slugs), "invalid frozen production baseline");
  for (const [key, count] of Object.entries({ p0_titles: 7, gambling: 8, military: 16, non_mainland: 8, duplicate: 1 })) {
    check(slugList(input.excluded_slugs[key], count), `invalid signed exclusion list: ${key}`);
  }
  return input as CuratedPool["baseline"];
}

function validateEntry(raw: unknown, release: VectorRelease, blocked: Set<string>): CuratedCareer {
  check(object(raw) && nonblank(raw.slug) && slugPattern.test(raw.slug), "invalid career slug");
  const slug = raw.slug;
  check(!blocked.has(slug), `excluded career: ${slug}`);
  check(nonblank(raw.display_name_zh), `missing display name: ${slug}`);
  const vector = release.careers[slug];
  check(vector && /^\d{2}-\d{4}\.\d{2}$/.test(vector.onet) && raw.onet_soc_code === vector.onet &&
    same(raw.primary_riasec, derivePrimaryRiasec(vector.interestVector)), `vector or SOC mismatch: ${slug}`);
  check(texts(raw.major_categories) && unique(raw.major_categories) &&
    raw.major_categories.every((category) => categoryKeys.has(category)), `invalid majors: ${slug}`);
  check(nonblank(raw.scene_cluster) && scenePattern.test(raw.scene_cluster) &&
    (raw.exposure_tier === "broad_mainstream" || raw.exposure_tier === "specialized_track") &&
    raw.publish_status === "published_current" &&
    Array.isArray(raw.linked_comparison_slugs) && raw.linked_comparison_slugs.length === 0,
  `invalid eligibility or C1 fallback: ${slug}`);
  const evidence = raw.evidence_meta;
  check(object(evidence) && evidence.region === "中国大陆" && evidence.current_locale === "zh-CN" &&
    typeof evidence.current_sha256 === "string" && digest.test(evidence.current_sha256) &&
    Array.isArray(evidence.sources) && evidence.sources.length > 0, `missing source evidence: ${slug}`);
  const sourceIds = new Set<string>();
  for (const source of evidence.sources) {
    check(object(source) && nonblank(source.id) && nonblank(source.url) && /^https:\/\//.test(source.url),
      `invalid evidence source: ${slug}`);
    const url = new URL(source.url);
    check(url.hostname && !url.username && !url.password && !sourceIds.has(source.id), `invalid or duplicate source: ${slug}`);
    sourceIds.add(source.id);
  }
  const facets = raw.comparison_facets;
  check(object(facets) && texts(facets.unknown_fields) && unique(facets.unknown_fields),
    `missing uncertainty fields: ${slug}`);
  for (const key of ["tasks", "work_style", "work_conditions"] as const) {
    const column = facets[key];
    check(Array.isArray(column) && column.length > 0, `empty 94-question facet: ${slug}/${key}`);
    for (const item of column) {
      check(object(item) && nonblank(item.text) && statuses.has(item.status as VerificationStatus) &&
        object(item.basis) && nonblank(item.basis.current_item_id) &&
        texts(item.basis.source_ids, key === "tasks" ? 1 : 0) &&
        unique(item.basis.source_ids) && item.basis.source_ids.every((id) => sourceIds.has(id)),
      `invalid 94-question evidence: ${slug}/${key}`);
      check(key === "tasks" ? item.status === "已证实" : item.status !== "已证实",
        `occupational task and employer conditions have different evidence: ${slug}/${key}`);
    }
  }
  if (raw.card_depth === "deep") {
    const card = raw.free_task_card;
    const trial = raw.micro_trial;
    check(object(card) && nonblank(card.why_shown_template) && nonblank(card.typical_daily_task) &&
      nonblank(card.first_verification_question) && object(trial) && nonblank(trial.title) &&
      nonblank(trial.instruction) && nonblank(trial.reflection_prompt) &&
      texts(raw.jd_check_questions, 2) && unique(raw.jd_check_questions), `incomplete deep card: ${slug}`);
    check((facets.tasks as Verification[]).some((task) => task.text === card.typical_daily_task),
      `deep card task must cite an extracted task: ${slug}`);
  } else {
    check(raw.card_depth === "standard" && !("free_task_card" in raw) &&
      !("micro_trial" in raw) && !("jd_check_questions" in raw), `invalid standard depth: ${slug}`);
  }
  const publicText = [raw.display_name_zh, facets, raw.free_task_card, raw.micro_trial, raw.jd_check_questions];
  check(!prohibited.test(JSON.stringify(publicText).normalize("NFKC")), `prohibited claim: ${slug}`);
  return raw as CuratedCareer;
}

function validateScenes(input: unknown, entries: readonly CuratedCareer[]): SceneClusters {
  check(header(input) && object(input.clusters) && object(input.recommendation_policy), "invalid scene dictionary");
  const policy = input.recommendation_policy;
  check(policy.top_n === 5 && policy.max_per_scene === 1 && policy.max_specialized_in_top_5 === 2,
    "invalid Top 5 resource limits");
  const activeScenes = new Set(entries.map(({ scene_cluster }) => scene_cluster));
  check(Object.keys(input.clusters).length === 111 && activeScenes.size === 111, "expected 111 active scenes");
  for (const [scene, rule] of Object.entries(input.clusters)) {
    check(activeScenes.has(scene) && object(rule) && rule.max_per_top_5 === 1 &&
      rule.vertical_only === entries.filter((entry) => entry.scene_cluster === scene)
        .every((entry) => entry.exposure_tier === "specialized_track"), `invalid scene constraint: ${scene}`);
  }
  const funeral = input.clusters.funeral_memorial_services;
  check(object(funeral) && funeral.vertical_only === true, "funeral scene must remain vertical");
  return input as SceneClusters;
}

function validateRoutes(input: unknown, entries: readonly CuratedCareer[]): FlatRoutes {
  check(header(input) && object(input.by_top_two) && object(input.by_leading) &&
    object(input.selection_policy), "invalid flat route catalog");
  const policy = input.selection_policy;
  check(policy.max_sd_exclusive === 10 && same(policy.priority, ["top_two", "leading", "default_pair"]) &&
    same(policy.tie_break_order, RIASEC_DIMENSIONS), "invalid flat route policy");
  const deep = new Map(entries.filter((entry) => entry.card_depth === "deep").map((entry) => [entry.slug, entry]));
  const allSelectors = [...Object.keys(input.by_top_two), ...Object.keys(input.by_leading)];
  check(Object.keys(input.by_top_two).length >= 5 && allSelectors.every((key) =>
    fixedPairKeys.includes(key) || RIASEC_DIMENSIONS.some((code) => code === key)), "invalid flat route selector");
  check(Object.keys(input.by_top_two).every((key) => fixedPairKeys.includes(key)) &&
    Object.keys(input.by_leading).length === 6 && RIASEC_DIMENSIONS.every((code) => Object.hasOwn(input.by_leading as object, code)),
  "flat routes must cover six leading dimensions");
  for (const [key, pair] of [["default_pair", input.default_pair], ...Object.entries(input.by_top_two),
    ...Object.entries(input.by_leading)] as [string, unknown][]) {
    check(Array.isArray(pair) && pair.length === 2, `expected two nonempty routes: ${key}`);
    const routeScenes = pair.map((route) => {
      check(object(route) && route.activity === "micro_trial" && texts(route.example_slugs) &&
        unique(route.example_slugs), `invalid route: ${key}`);
      return route.example_slugs.map((slug) => {
        const career = deep.get(slug);
        check(career, `route must reference a deep career: ${key}/${slug}`);
        return career.scene_cluster;
      });
    });
    check(routeScenes[0].every((scene) => !routeScenes[1].includes(scene)), `routes share a scene: ${key}`);
  }
  return input as FlatRoutes;
}

export function validateCareerRecommendation(
  rawPool: unknown,
  rawScenes: unknown,
  rawRoutes: unknown,
  release: VectorRelease,
) {
  check(header(rawPool) && typeof rawPool.updated_at === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(rawPool.updated_at) &&
    Array.isArray(rawPool.entries) && rawPool.entries.length === 339 &&
    Object.keys(release.careers).length === 743, "expected zh-CN pool of 339 in release of 743");
  const baseline = validateBaseline(rawPool.baseline);
  const blocked = new Set(["software-developers", "architects",
    "secondary-school-teachers-except-special-and-career-technical-education", "clergy", "directors-religious-activities-and-education",
    ...baseline.t2_slugs, ...Object.values(baseline.excluded_slugs).flat()]);
  const entries = rawPool.entries.map((entry) => validateEntry(entry, release, blocked));
  check(unique(entries.map(({ slug }) => slug)) && unique(entries.map(({ display_name_zh }) =>
    display_name_zh.normalize("NFKC").replace(/[^\p{L}\p{N}]/gu, "").toLowerCase())),
  "duplicate career identity or display name");
  check(new Set(entries.flatMap(({ major_categories }) => major_categories)).size === categoryKeys.size,
    "expected coverage for all 32 education categories");
  const deep = entries.filter((entry) => entry.card_depth === "deep");
  check(deep.length === 30 && RIASEC_DIMENSIONS.every((code) =>
    deep.filter(({ primary_riasec }) => primary_riasec[0] === code).length >= 4), "invalid deep-card coverage");
  return {
    pool: { ...rawPool, baseline, entries } as CuratedPool,
    scenes: validateScenes(rawScenes, entries),
    routes: validateRoutes(rawRoutes, entries),
  };
}

function center(values: readonly number[]) {
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  return values.map((value) => value - mean);
}

export function profileStandardDeviation(values: readonly number[]) {
  return Math.hypot(...center(values)) / Math.sqrt(values.length);
}

function validProfile(values: readonly number[]) {
  check(values.length === 6 && values.every((value) => Number.isFinite(value) && value >= 0 && value <= 100),
    "expected six assessment scores in [0, 100]");
}

export function selectFlatRoutes(values: readonly number[], routes: FlatRoutes): RoutePair | null {
  validProfile(values);
  if (profileStandardDeviation(values) >= routes.selection_policy.max_sd_exclusive) return null;
  const [first, second] = derivePrimaryRiasec(values);
  const key = [first, second].sort((a, b) => RIASEC_DIMENSIONS.indexOf(a) - RIASEC_DIMENSIONS.indexOf(b)).join("");
  return routes.by_top_two[key] ?? routes.by_leading[first] ?? routes.default_pair;
}

export function simulateRankedPool(
  values: readonly number[],
  pool: CuratedPool,
  scenes: SceneClusters,
  release: VectorRelease,
) {
  validProfile(values);
  check(profileStandardDeviation(values) >= 10, "flat profile must stop ranking");
  const profile = center(values);
  const profileNorm = Math.hypot(...profile);
  const ranked = pool.entries.map((entry) => {
    const occupation = center(release.careers[entry.slug].interestVector);
    const norm = Math.hypot(...occupation);
    const dot = profile.reduce((sum, value, index) => sum + value * occupation[index], 0);
    return { entry, similarity: norm === 0 ? 0 : Math.round(dot / (profileNorm * norm) * 1e6) };
  }).filter(({ similarity }) => similarity > 0)
    .sort((a, b) => b.similarity - a.similarity || (a.entry.slug < b.entry.slug ? -1 : 1));
  const seen = new Set<string>();
  const representatives = ranked.filter(({ entry }) => {
    if (seen.has(entry.scene_cluster)) return false;
    seen.add(entry.scene_cluster);
    return true;
  });
  const chosen: CuratedCareer[] = [];
  let specialized = 0;
  for (const { entry } of representatives) {
    if (entry.exposure_tier === "specialized_track" && specialized === scenes.recommendation_policy.max_specialized_in_top_5) continue;
    chosen.push(entry);
    if (entry.exposure_tier === "specialized_track") specialized += 1;
    if (chosen.length === scenes.recommendation_policy.top_n) break;
  }
  const byScore = [...values].sort((a, b) => b - a);
  return { chosen, topTwoGap: byScore[0] - byScore[1] };
}

import fixedJungSample from "@/lib/reports/fixed-samples/zh-jung_archetypes_48.json";
import packs from "./assets/archetypes.json";
import careerData from "./assets/careers.json";
import common from "./assets/common.json";

export const archetypeAssets = packs;
export const commonAssets = common;
export type ArchetypeId = (typeof packs)[number]["id"];
export type JungPreviewDimension = {
  id: string;
  name: string;
  score: number;
  question: string;
  reading: string;
  strength: string;
  blindSpot: string;
  practice: string;
  scoreContext?: string;
};
export type PreviewPattern = keyof typeof common.states;
export type JungReportMode = "preview" | "sample" | "result";

// One public sample for everyone, independent of attempts, query strings and randomness.
export const jungSampleScores: Readonly<Record<string, number>> = Object.freeze(
  { ...fixedJungSample.report.jung.scores },
);

export function readJungArchetypeScores(
  payload: unknown,
): Record<string, number> | null {
  if (!payload || typeof payload !== "object" || Array.isArray(payload))
    return null;
  const value = payload as Record<string, unknown>;
  if (
    !value.scores ||
    typeof value.scores !== "object" ||
    Array.isArray(value.scores)
  )
    return null;
  const scores = value.scores as Record<string, number>;
  try {
    const result = interpretJungScores(scores);
    const fields = {
      primary: result.primary,
      secondary: result.secondary,
      near_leaders: result.nearLeaders,
    };
    for (const [key, expected] of Object.entries(fields)) {
      if (!Object.hasOwn(value, key)) continue;
      const actual = value[key];
      if (
        !Array.isArray(actual) ||
        actual.length !== expected.length ||
        new Set(actual).size !== actual.length ||
        !actual.every((id) => expected.includes(id))
      )
        return null;
    }
    if (
      Object.hasOwn(value, "pattern") &&
      value.pattern !== (result.state === "flat" ? "flat" : "differentiated")
    )
      return null;
    return { ...scores };
  } catch {
    return null;
  }
}

export const reportChapters = [
  ["profile", "结果总览"],
  ["dimensions", "完整分数"],
  ["reading", "原型解读"],
  ["careers", "职业匹配"],
  ["work", "工作与生活"],
  ["relationships", "人际关系"],
  ["actions", "行动计划"],
  ["method", "科学依据"],
  ["ai", "AI 继续探索"],
] as const;
export function getArchetype(id: string) {
  const asset = packs.find((asset) => asset.id === id);
  if (!asset) throw new Error(`Unknown archetype: ${id}`);
  return asset;
}
export function interpretJungScores(scores: Record<string, number>) {
  if (
    Object.keys(scores).length !== packs.length ||
    !packs.every(
      (asset) =>
        Number.isFinite(scores[asset.id]) &&
        scores[asset.id] >= 0 &&
        scores[asset.id] <= 100 &&
        Number.isInteger(scores[asset.id] / 6.25),
    )
  )
    throw new Error("Expected all twelve valid archetype scores");
  const ranked = packs
    .map((asset) => ({ id: asset.id, score: scores[asset.id] }))
    .sort((a, b) => b.score - a.score);
  const max = ranked[0].score;
  const flat = max - ranked[ranked.length - 1].score <= 6.25;
  const primary = flat
    ? []
    : ranked.filter((row) => row.score === max).map((row) => row.id);
  const nearLeaders = ranked
    .filter((row) => max - row.score <= 6.25)
    .map((row) => row.id);
  const secondScore = ranked.find((row) => row.score < max)?.score;
  const secondary =
    !flat && primary.length === 1
      ? ranked.filter((row) => row.score === secondScore).map((row) => row.id)
      : [];
  const state: PreviewPattern = flat
    ? "flat"
    : primary.length > 1
      ? "tied"
      : nearLeaders.length > 1
        ? "near"
        : "clear";
  // Include the whole score tier at the third position; ordering must not erase ties.
  const readingIds = flat
    ? ranked.map((row) => row.id)
    : ranked.filter((row) => row.score >= ranked[2].score).map((row) => row.id);
  return { state, primary, secondary, nearLeaders, readingIds, ranked };
}
export function dimensionScoreContext(
  scores: Record<string, number>,
  id: string,
) {
  const result = interpretJungScores(scores);
  getArchetype(id);
  if (result.state === "flat")
    return "本次十二项得分接近，这一项也不单独指定为主导。";
  if (result.primary.includes(id))
    return result.primary.length > 1
      ? "本次并列最高，可以和其他并列原型一起读。"
      : "本次得分最高，可以先从这种动机读起。";
  const gap = result.ranked[0].score - scores[id];
  if (result.nearLeaders.includes(id))
    return `与最高分相差 ${gap} 分，属于本次的接近高分。`;
  return `距本次最高分 ${gap} 分。`;
}
export function makePreviewScores(
  id: string,
  pattern: PreviewPattern,
): Record<string, number> {
  const index = packs.findIndex((asset) => asset.id === id);
  if (index < 0) throw new Error("Unknown preview archetype");
  return Object.fromEntries(
    packs.map((_, offset) => {
      const asset = packs[(index + offset) % packs.length];
      const score =
        pattern === "flat"
          ? offset === 2
            ? 56.25
            : 62.5
          : offset === 0
            ? 87.5
            : offset === 1
              ? pattern === "tied"
                ? 87.5
                : pattern === "near"
                  ? 81.25
                  : 75
              : Math.max(6.25, 75 - offset * 6.25);
      return [asset.id, score];
    }),
  );
}
export function buildReportView(
  scores: Record<string, number>,
  referenceId: string,
  mode: JungReportMode = "preview",
) {
  const result = interpretJungScores(scores),
    reference = getArchetype(referenceId),
    asset =
      result.primary.length === 1 ? getArchetype(result.primary[0]) : reference;
  const dimensions = result.ranked.map((row) => ({
    ...getArchetype(row.id).dimension,
    ...row,
    name: getArchetype(row.id).name,
    scoreContext: dimensionScoreContext(scores, row.id),
  }));
  const scopeIds = result.state === "flat" ? [referenceId] : result.primary;
  const references = scopeIds.map(getArchetype);
  const scopedCareers = new Map<
    string,
    {
      slug: string;
      name: string;
      task: string;
      connection: string;
      check: string;
      focus: string;
    }
  >();
  references.forEach((item) =>
    item.careerLinks.forEach((link) => {
      const career = careerData.careers.find(
        (career) => career.slug === link.slug,
      );
      if (!career) throw new Error(`Missing canonical career: ${link.slug}`);
      const existing = scopedCareers.get(link.slug);
      scopedCareers.set(link.slug, {
        slug: link.slug,
        name: career.name,
        task: career.summary,
        connection: existing
          ? existing.connection + `；${item.name}：${link.reason}`
          : `${item.name}关联：${link.reason}`,
        check: career.check,
        focus: existing ? existing.focus + " × " + item.name : item.name,
      });
    }),
  );
  const headings = [
    "工作中 · 做事与协作",
    "工作中 · 沟通与交接",
    "压力之下 · 留意变化",
    "压力之下 · 调整节奏",
    "金钱 · 投入的用途",
    "金钱 · 条件与边界",
  ];
  const sections = [
    {
      id: "work",
      number: "05",
      label: "工作与生活",
      title: asset.work.title,
      intro: asset.work.intro,
      paragraphs: asset.work.paragraphs.map((body, index) => ({
        heading: headings[index],
        body,
      })),
      strengths: asset.work.strengths,
      growth: asset.work.growth,
    },
    {
      id: "relationships",
      number: "06",
      label: "人际关系",
      title: asset.relationship.title,
      intro: asset.relationship.intro,
      paragraphs: asset.relationship.paragraphs.map((body, index) => ({
        heading: ["表达关心", "面对分歧", "亲近与个人空间"][index],
        body,
      })),
      strengths: asset.relationship.strengths,
      growth: asset.relationship.growth,
    },
  ];
  const deepReadings = result.readingIds.map((id) => {
    const item = getArchetype(id);
    return {
      id,
      role: item.deep.title,
      definition: item.deep.definition,
      narrative: "",
      pursuit: item.deep.pursuit,
      traits: item.deep.traits,
      sceneTitle: item.deep.sceneTitle,
      scene: item.deep.scene,
      balanced: item.deep.balance,
      growth: item.deep.growth,
    };
  });
  const profile = {
    primaryId: asset.id,
    name: asset.name,
    tagline: asset.profile.tagline,
    headline: asset.profile.headline,
    introduction: asset.profile.intro,
    motivation: asset.profile.story,
    traits: asset.profile.traits,
    signature: {
      title: asset.profile.signature[0],
      body: asset.profile.signature[1],
      nextStep: asset.profile.signature[2],
    },
    growth: {
      label: "成长方向",
      title: asset.profile.growth.title,
      body: asset.profile.growth.body,
      practice: asset.profile.growth.practice,
    },
  };
  return {
    result,
    asset,
    profile,
    dimensions,
    deepReadings,
    sections,
    careers: [...scopedCareers.values()],
    actions: asset.actions.map(([heading, body], index) => [
      common.actionStages[index],
      heading,
      body,
    ]),
    prompt: common.ai.template
      .replace(
        "{context}",
        mode === "result"
          ? "以下是我本次作答得到的十二原型分数："
          : mode === "sample"
            ? "以下分数来自所有人共用的固定示例，不能当作我的真实测评结果："
            : "以下数据来自本地虚构预览，不能当作我的真实测评结果：",
      )
      .replace(
        "{scores}",
        dimensions.map((row) => `${row.name} ${row.score}`).join("、"),
      )
      .replace("{state}", common.states[result.state].label),
  };
}

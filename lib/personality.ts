import {
  getCareerJobBySlug,
  getMbtiRecommendation,
  listMbtiRecommendationTypes,
  type LocalizedCareerRecommendationProfile,
} from "@/lib/content";
import type { Locale } from "@/lib/i18n/locales";

type PersonalityName = {
  en: string;
  zh: string;
};

type PersonalityProfile = {
  type: string;
  slug: string;
  name: string;
  summary: string;
  overview: string;
  strengths: string[];
  weaknesses: string[];
  careerMatch: string;
  relationships: string;
  recommendation: LocalizedCareerRecommendationProfile;
};

const PERSONALITY_NAMES: Record<string, PersonalityName> = {
  INTP: { en: "Logician", zh: "逻辑学家" },
  INTJ: { en: "Architect", zh: "建筑师" },
  ENTP: { en: "Debater", zh: "辩论家" },
  ENTJ: { en: "Commander", zh: "指挥官" },
  INFP: { en: "Mediator", zh: "调停者" },
  INFJ: { en: "Advocate", zh: "提倡者" },
  ENFP: { en: "Campaigner", zh: "竞选者" },
  ENFJ: { en: "Protagonist", zh: "主人公" },
  ISTP: { en: "Virtuoso", zh: "鉴赏家" },
  ISTJ: { en: "Logistician", zh: "物流师" },
  ESTP: { en: "Entrepreneur", zh: "企业家" },
  ESTJ: { en: "Executive", zh: "总经理" },
  ISFP: { en: "Adventurer", zh: "探险家" },
  ISFJ: { en: "Defender", zh: "守卫者" },
  ESFP: { en: "Entertainer", zh: "表演者" },
  ESFJ: { en: "Consul", zh: "执政官" },
};

function buildRelationships(type: string, locale: Locale): string {
  const code = type.toUpperCase();
  const [energy, information, decision, rhythm] = code.split("");

  if (locale === "zh") {
    const energyText =
      energy === "E"
        ? "你往往通过直接交流、共同经历和快速反馈来建立关系。"
        : "你更容易通过稳定的一对一沟通、留白和安静空间来建立信任。";
    const informationText =
      information === "N"
        ? "你倾向于和能讨论长期可能性、模式和意义的人建立更深连接。"
        : "你更看重现实可靠、说到做到和细节可落地的人际互动。";
    const decisionText =
      decision === "T"
        ? "在冲突里你通常优先讲逻辑和边界，因此需要主动补充情绪确认。"
        : "在冲突里你通常优先照顾感受和氛围，因此需要主动讲清原则和底线。";
    const rhythmText =
      rhythm === "J"
        ? "亲密关系与协作关系里，你通常更喜欢明确承诺、稳定节奏和可预期安排。"
        : "亲密关系与协作关系里，你通常更喜欢弹性空间、自然推进和保留选择余地。";

    return `${energyText}${informationText}${decisionText}${rhythmText}`;
  }

  const energyText =
    energy === "E"
      ? "You usually build trust through direct dialogue, shared activity, and fast feedback."
      : "You usually build trust through steady one-on-one conversations, reflection, and protected space.";
  const informationText =
    information === "N"
      ? "You tend to connect more deeply with people who enjoy discussing patterns, future possibilities, and meaning."
      : "You tend to value people who are reliable, concrete, and consistent in day-to-day follow-through.";
  const decisionText =
    decision === "T"
      ? "In conflict you often default to logic and boundaries, so it helps to add explicit emotional acknowledgment."
      : "In conflict you often default to harmony and emotional tone, so it helps to make your principles explicit.";
  const rhythmText =
    rhythm === "J"
      ? "In close relationships and teamwork, you usually prefer clarity, commitment, and predictable pace."
      : "In close relationships and teamwork, you usually prefer flexibility, openness, and room to adapt.";

  return `${energyText} ${informationText} ${decisionText} ${rhythmText}`;
}

function buildCareerMatch(
  recommendation: LocalizedCareerRecommendationProfile,
  locale: Locale
): string {
  const jobList = recommendation.recommended_jobs
    .slice(0, 3)
    .map((slug) => getCareerJobBySlug(slug, locale)?.title ?? slug)
    .join(", ");
  if (locale === "zh") {
    return `你通常更适合在${recommendation.work_env}中发挥优势。优先探索这些方向：${jobList}。`;
  }

  return `You usually perform best in ${recommendation.work_env.toLowerCase()}. Prioritize options like ${jobList}.`;
}

function buildOverview(
  recommendation: LocalizedCareerRecommendationProfile,
  locale: Locale
): string {
  if (locale === "zh") {
    return `${recommendation.summary} 这类人格通常在目标清晰、反馈可获得、能够持续迭代的环境里更容易稳定发挥。`;
  }

  return `${recommendation.summary} This profile tends to do best when goals are explicit, feedback is available, and growth loops stay visible.`;
}

export function listPersonalityTypes(): string[] {
  return listMbtiRecommendationTypes().map((type) => type.toLowerCase());
}

export function getPersonalityProfile(
  rawType: string,
  locale: Locale
): PersonalityProfile | null {
  const type = String(rawType ?? "").trim().toUpperCase();
  if (!type) return null;

  const recommendation = getMbtiRecommendation(type, locale);
  if (!recommendation) return null;

  const name = PERSONALITY_NAMES[type];
  const localizedName = locale === "zh" ? name?.zh ?? type : name?.en ?? type;

  return {
    type,
    slug: type.toLowerCase(),
    name: localizedName,
    summary: recommendation.summary,
    overview: buildOverview(recommendation, locale),
    strengths: recommendation.strengths,
    weaknesses: recommendation.risks,
    careerMatch: buildCareerMatch(recommendation, locale),
    relationships: buildRelationships(type, locale),
    recommendation,
  };
}

export function listPersonalityProfiles(locale: Locale): PersonalityProfile[] {
  return listMbtiRecommendationTypes()
    .map((type) => getPersonalityProfile(type, locale))
    .filter((item): item is PersonalityProfile => Boolean(item));
}

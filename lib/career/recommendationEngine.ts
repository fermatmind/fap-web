import type {
  Big5TraitKey,
  CareerProfileSnapshot,
  CareerRecommendationJobInput,
  CareerRecommendationResult,
  RIASECScoreVector,
} from "@/lib/career/types";
import { cosineSimilarity } from "@/lib/career/riasec";

const BIG5_TRAITS: Big5TraitKey[] = [
  "openness",
  "conscientiousness",
  "extraversion",
  "agreeableness",
  "neuroticism",
];

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function computeInterestScore(user: RIASECScoreVector | undefined, job: CareerRecommendationJobInput): number {
  if (!user) return 0;
  const sim = clamp(cosineSimilarity(user, job.riasecVector), 0, 1);
  return Number((sim * 45).toFixed(2));
}

function computeMbtiScore(mbtiType: string | undefined, job: CareerRecommendationJobInput): number {
  if (!mbtiType) return 0;
  const key = mbtiType.trim().toUpperCase();
  if (job.mbtiPrimary.map((item) => item.toUpperCase()).includes(key)) return 20;
  if (job.mbtiSecondary.map((item) => item.toUpperCase()).includes(key)) return 12;
  return 0;
}

function scoreAgainstRange(value: number, min: number, max: number): number {
  const normalizedMin = clamp(min, 0, 100);
  const normalizedMax = clamp(max, normalizedMin, 100);
  const v = clamp(value, 0, 100);

  if (v >= normalizedMin && v <= normalizedMax) return 1;

  if (v < normalizedMin) {
    const gap = normalizedMin - v;
    return clamp(1 - gap / 40, 0, 1);
  }

  const gap = v - normalizedMax;
  return clamp(1 - gap / 40, 0, 1);
}

function computeBig5Score(profile: CareerProfileSnapshot, job: CareerRecommendationJobInput): number {
  if (!profile.big5) return 0;

  const parts: number[] = [];
  for (const trait of BIG5_TRAITS) {
    const value = profile.big5[trait];
    const target = job.big5Targets[trait];
    if (typeof value !== "number" || !target) continue;
    parts.push(scoreAgainstRange(value, target.min, target.max));
  }

  if (parts.length === 0) return 0;
  const mean = parts.reduce((sum, item) => sum + item, 0) / parts.length;
  return Number((mean * 20).toFixed(2));
}

function computeIqEqScore(profile: CareerProfileSnapshot, job: CareerRecommendationJobInput): number {
  let total = 0;

  if (typeof profile.iqScore === "number") {
    total += scoreAgainstRange(profile.iqScore, job.iqRange.min, job.iqRange.max) * 5;
  }

  if (typeof profile.eqScore === "number") {
    total += scoreAgainstRange(profile.eqScore, job.eqRange.min, job.eqRange.max) * 5;
  }

  return Number(total.toFixed(2));
}

function computeMarketScore(job: CareerRecommendationJobInput): number {
  return Number((clamp(job.marketDemand, 0, 100) / 100 * 5).toFixed(2));
}

function reasonForInterest(score: number, locale: "en" | "zh"): string {
  if (score >= 35) {
    return locale === "zh" ? "你的兴趣结构与该职业任务类型高度匹配。" : "Your interest structure is highly aligned with this role.";
  }
  if (score >= 20) {
    return locale === "zh" ? "你的兴趣倾向与该职业有中等匹配，可通过项目实践提升确定性。" : "Your interests moderately match this role; practical projects can validate fit.";
  }
  return locale === "zh" ? "兴趣匹配较弱，建议先通过低成本体验验证。" : "Interest fit is weaker; validate through low-risk exploration first.";
}

function reasonForPersonality(mbti: number, big5: number, locale: "en" | "zh"): string {
  if (mbti + big5 >= 30) {
    return locale === "zh" ? "人格偏好与行为特质整体贴合岗位环境。" : "Your personality preferences align well with the role environment.";
  }
  if (mbti + big5 >= 18) {
    return locale === "zh" ? "人格匹配中等，建议关注协作方式与节奏管理。" : "Personality fit is moderate; focus on collaboration style and pace management.";
  }
  return locale === "zh" ? "人格匹配有限，可能需要更强的环境适配策略。" : "Personality fit is limited; stronger adaptation strategies may be required.";
}

function reasonForCapability(iqEq: number, locale: "en" | "zh"): string {
  if (iqEq >= 8) {
    return locale === "zh" ? "能力阈值匹配度高，可优先考虑进阶岗位。" : "Capability thresholds are strong; advanced role tracks are viable.";
  }
  if (iqEq >= 4) {
    return locale === "zh" ? "能力匹配中等，建议先补齐关键技能模块。" : "Capability fit is moderate; strengthen key skill modules first.";
  }
  return locale === "zh" ? "能力阈值偏低，建议先完成基础能力训练。" : "Capability threshold is lower; complete foundational upskilling first.";
}

function reasonForRisk(total: number, locale: "en" | "zh"): string {
  if (total >= 75) {
    return locale === "zh" ? "主要风险在于过早锁定路径，建议每季度复盘。" : "Main risk is locking in too early; run quarterly review cycles.";
  }
  if (total >= 55) {
    return locale === "zh" ? "主要风险在于目标过宽，建议缩小到2条候选路径。" : "Main risk is over-broad goals; narrow to two candidate tracks.";
  }
  return locale === "zh" ? "主要风险在于试错成本，建议先做短周期验证项目。" : "Main risk is exploration cost; start with short validation projects.";
}

export function rankCareerRecommendations({
  profile,
  jobs,
  locale,
  topN = 10,
}: {
  profile: CareerProfileSnapshot;
  jobs: CareerRecommendationJobInput[];
  locale: "en" | "zh";
  topN?: number;
}): CareerRecommendationResult[] {
  const scored: CareerRecommendationResult[] = jobs.map((job) => {
    const interest = computeInterestScore(profile.riasec, job);
    const mbti = computeMbtiScore(profile.mbtiType, job);
    const big5 = computeBig5Score(profile, job);
    const iqEq = computeIqEqScore(profile, job);
    const market = computeMarketScore(job);
    const total = Number((interest + mbti + big5 + iqEq + market).toFixed(2));

    return {
      jobSlug: job.slug,
      totalScore: total,
      factors: {
        interest,
        mbti,
        big5,
        iqEq,
        market,
      },
      why_interest: reasonForInterest(interest, locale),
      why_personality: reasonForPersonality(mbti, big5, locale),
      why_capability: reasonForCapability(iqEq, locale),
      risks: reasonForRisk(total, locale),
    };
  });

  return scored.sort((a, b) => b.totalScore - a.totalScore).slice(0, Math.max(1, topN));
}

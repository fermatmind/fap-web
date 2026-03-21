import type { Locale } from "@/lib/i18n/locales";
import type { MbtiContinuityViewModel } from "@/lib/mbti/publicProjection";

type SearchParamsRecord = Record<string, string | string[] | undefined>;

function normalizeText(...values: unknown[]): string {
  for (const value of values) {
    const normalized = String(value ?? "").trim();
    if (normalized) {
      return normalized;
    }
  }

  return "";
}

function normalizeStringArray(values: unknown): string[] {
  if (!Array.isArray(values)) {
    return [];
  }

  return values.map((value) => normalizeText(value)).filter(Boolean);
}

function readParam(source: URLSearchParams | SearchParamsRecord, key: string): string {
  if (source instanceof URLSearchParams) {
    return normalizeText(source.get(key));
  }

  const value = source[key];
  return Array.isArray(value) ? normalizeText(value[0]) : normalizeText(value);
}

function splitParam(value: string): string[] {
  return value
    .split("|")
    .map((item) => normalizeText(item))
    .filter(Boolean);
}

export function buildMbtiContinuityQuery(
  continuity?: MbtiContinuityViewModel | null
): Record<string, string> {
  if (!continuity) {
    return {};
  }

  const carryoverFocusKey = normalizeText(continuity.carryoverFocusKey);
  const carryoverReason = normalizeText(continuity.carryoverReason);
  const recommendedResumeKeys = normalizeStringArray(continuity.recommendedResumeKeys);
  const carryoverSceneKeys = normalizeStringArray(continuity.carryoverSceneKeys);
  const carryoverActionKeys = normalizeStringArray(continuity.carryoverActionKeys);
  const feedbackSentiment = normalizeText(continuity.feedbackSentiment);
  const feedbackCoverage = normalizeText(continuity.feedbackCoverage);
  const actionCompletionTendency = normalizeText(continuity.actionCompletionTendency);
  const lastDeepReadSection = normalizeText(continuity.lastDeepReadSection);
  const currentIntentCluster = normalizeText(continuity.currentIntentCluster);

  return {
    ...(carryoverFocusKey ? { carryover_focus_key: carryoverFocusKey } : {}),
    ...(carryoverReason ? { carryover_reason: carryoverReason } : {}),
    ...(recommendedResumeKeys.length > 0 ? { recommended_resume_keys: recommendedResumeKeys.join("|") } : {}),
    ...(carryoverSceneKeys.length > 0 ? { carryover_scene_keys: carryoverSceneKeys.join("|") } : {}),
    ...(carryoverActionKeys.length > 0 ? { carryover_action_keys: carryoverActionKeys.join("|") } : {}),
    ...(feedbackSentiment ? { feedback_sentiment: feedbackSentiment } : {}),
    ...(feedbackCoverage ? { feedback_coverage: feedbackCoverage } : {}),
    ...(actionCompletionTendency ? { action_completion_tendency: actionCompletionTendency } : {}),
    ...(lastDeepReadSection ? { last_deep_read_section: lastDeepReadSection } : {}),
    ...(currentIntentCluster ? { current_intent_cluster: currentIntentCluster } : {}),
  };
}

export function appendMbtiContinuityQuery(
  href: string,
  continuity?: MbtiContinuityViewModel | null,
  extra?: Record<string, string | number | boolean | null | undefined>
): string {
  const normalizedHref = normalizeText(href);
  if (!normalizedHref) {
    return "";
  }

  const url = new URL(normalizedHref, "https://fap.local");
  const query = {
    ...buildMbtiContinuityQuery(continuity),
    ...(extra ?? {}),
  };

  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === "") {
      continue;
    }

    url.searchParams.set(key, String(value));
  }

  return url.origin === "https://fap.local"
    ? `${url.pathname}${url.search}${url.hash}`
    : url.toString();
}

export function buildMbtiContinuityTelemetryFields(
  continuity?: MbtiContinuityViewModel | null
): {
  carryoverFocusKey: string;
  carryoverReason: string;
  recommendedResumeKeys: string;
  carryoverSceneKeys: string;
  carryoverActionKeys: string;
  feedbackSentiment: string;
  feedbackCoverage: string;
  actionCompletionTendency: string;
  lastDeepReadSection: string;
  currentIntentCluster: string;
} {
  const query = buildMbtiContinuityQuery(continuity);

  return {
    carryoverFocusKey: normalizeText(query.carryover_focus_key),
    carryoverReason: normalizeText(query.carryover_reason),
    recommendedResumeKeys: normalizeText(query.recommended_resume_keys),
    carryoverSceneKeys: normalizeText(query.carryover_scene_keys),
    carryoverActionKeys: normalizeText(query.carryover_action_keys),
    feedbackSentiment: normalizeText(query.feedback_sentiment),
    feedbackCoverage: normalizeText(query.feedback_coverage),
    actionCompletionTendency: normalizeText(query.action_completion_tendency),
    lastDeepReadSection: normalizeText(query.last_deep_read_section),
    currentIntentCluster: normalizeText(query.current_intent_cluster),
  };
}

export function isInternalMbtiCarryoverHref(href: string): boolean {
  const normalizedHref = normalizeText(href);
  if (!normalizedHref) {
    return false;
  }

  if (normalizedHref.startsWith("/")) {
    return true;
  }

  try {
    const url = new URL(normalizedHref);
    return ["localhost", "127.0.0.1", "example.com", "www.fermatmind.com", "fermatmind.com"].includes(url.hostname);
  } catch {
    return false;
  }
}

export function parseMbtiContinuityQuery(
  source?: URLSearchParams | SearchParamsRecord | null
): MbtiContinuityViewModel | null {
  if (!source) {
    return null;
  }

  const carryoverFocusKey = readParam(source, "carryover_focus_key");
  const carryoverReason = readParam(source, "carryover_reason");
  const recommendedResumeKeys = splitParam(readParam(source, "recommended_resume_keys"));
  const carryoverSceneKeys = splitParam(readParam(source, "carryover_scene_keys"));
  const carryoverActionKeys = splitParam(readParam(source, "carryover_action_keys"));
  const feedbackSentiment = readParam(source, "feedback_sentiment");
  const feedbackCoverage = readParam(source, "feedback_coverage");
  const actionCompletionTendency = readParam(source, "action_completion_tendency");
  const lastDeepReadSection = readParam(source, "last_deep_read_section");
  const currentIntentCluster = readParam(source, "current_intent_cluster");

  if (
    !carryoverFocusKey &&
    !carryoverReason &&
    recommendedResumeKeys.length === 0 &&
    carryoverSceneKeys.length === 0 &&
    carryoverActionKeys.length === 0 &&
    !feedbackSentiment &&
    !feedbackCoverage &&
    !actionCompletionTendency &&
    !lastDeepReadSection &&
    !currentIntentCluster
  ) {
    return null;
  }

  return {
    carryoverFocusKey,
    carryoverReason,
    recommendedResumeKeys,
    carryoverSceneKeys,
    carryoverActionKeys,
    feedbackSentiment,
    feedbackCoverage,
    actionCompletionTendency,
    lastDeepReadSection,
    currentIntentCluster,
  };
}

export function resolveMbtiCarryoverFocusLabel(focusKey: string, locale: Locale): string {
  switch (focusKey) {
    case "growth.next_actions":
      return locale === "zh" ? "下一步动作" : "Next actions";
    case "growth.weekly_experiments":
      return locale === "zh" ? "本周实验" : "Weekly experiments";
    case "growth.watchouts":
      return locale === "zh" ? "风险提醒" : "Watchouts";
    case "growth.stability_confidence":
      return locale === "zh" ? "稳定性解释" : "Stability explanation";
    case "career.next_step":
      return locale === "zh" ? "职业下一步" : "Career next step";
    case "career.work_experiments":
      return locale === "zh" ? "工作实验" : "Work experiments";
    case "traits.close_call_axes":
      return locale === "zh" ? "边界轴解释" : "Borderline axes";
    case "traits.adjacent_type_contrast":
      return locale === "zh" ? "相邻类型对照" : "Adjacent-type contrast";
    case "traits.why_this_type":
      return locale === "zh" ? "为什么是这个类型" : "Why this type";
    case "relationships.try_this_week":
      return locale === "zh" ? "本周关系练习" : "Relationship practice";
    default:
      return normalizeText(focusKey);
  }
}

export function resolveMbtiCarryoverReasonLabel(reason: string, locale: Locale): string {
  switch (reason) {
    case "unlock_to_continue_focus":
      return locale === "zh"
        ? "当前最值得延续的重点，适合直接带到下一页继续看。"
        : "The current focus is strong enough to carry directly into the next page.";
    case "resume_action_loop":
      return locale === "zh"
        ? "你已经开始和动作层互动，下一页应该延续这个动作主线。"
        : "You have already engaged with the action layer, so the next page should continue that thread.";
    case "return_from_share":
      return locale === "zh"
        ? "这次回流更适合直接回到你上次分享出去的重点。"
        : "This return is better served by resuming the focus you last shared.";
    case "refine_after_feedback":
      return locale === "zh"
        ? "你已经给过反馈，下一页优先延续当前最需要校正的重点。"
        : "You already gave feedback, so the next page should continue the area most worth refining.";
    case "continue_career_bridge":
      return locale === "zh"
        ? "当前重心已经进入职业桥接层，下一页先延续职业线索。"
        : "The current focus has already moved into the career bridge, so the next page should continue that track.";
    case "continue_relationship_practice":
      return locale === "zh"
        ? "当前更适合把关系动作继续带到下一个入口。"
        : "The next entry should keep carrying the relationship practice forward.";
    case "continue_explainability_focus":
      return locale === "zh"
        ? "当前更适合先把解释层继续看完，再决定下一步动作。"
        : "The best next step is to keep following the explainability thread before choosing the next move.";
    case "resume_previous_focus":
      return locale === "zh"
        ? "你这次是回访，适合直接接回上一次被强调的重点。"
        : "This is a revisit, so the best move is to pick back up from the last emphasized focus.";
    case "adaptive_next_best_action":
      return locale === "zh"
        ? "这次继续入口已经根据你最近的真实反馈和动作效果，切到了当前最值得推进的下一步。"
        : "This continue entry has been switched to the next step that looks most useful from your recent feedback and action results.";
    default:
      return locale === "zh"
        ? "把当前最重要的重点继续带到相关页面，不要每次都从头开始。"
        : "Carry the current focus into the next relevant page instead of restarting from scratch.";
  }
}

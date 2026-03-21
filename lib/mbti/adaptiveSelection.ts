import type { Locale } from "@/lib/i18n/locales";
import type { MbtiAdaptiveSelectionViewModel } from "@/lib/mbti/publicProjection";

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

function readParam(source: URLSearchParams | SearchParamsRecord, key: string): string {
  if (source instanceof URLSearchParams) {
    return normalizeText(source.get(key));
  }

  const value = source[key];
  return Array.isArray(value) ? normalizeText(value[0]) : normalizeText(value);
}

export type MbtiAdaptiveSelectionQueryViewModel = {
  adaptiveContractVersion: string;
  adaptiveFingerprint: string;
  selectionRewriteReason: string;
  nextBestActionKey: string;
  nextBestActionSection: string;
  nextBestActionReason: string;
};

export function buildMbtiAdaptiveSelectionQuery(
  adaptiveSelection?: MbtiAdaptiveSelectionViewModel | MbtiAdaptiveSelectionQueryViewModel | null
): Record<string, string> {
  if (!adaptiveSelection) {
    return {};
  }

  const adaptiveContractVersion = normalizeText(
    "adaptiveContractVersion" in adaptiveSelection ? adaptiveSelection.adaptiveContractVersion : "",
    "version" in adaptiveSelection ? adaptiveSelection.version : ""
  );
  const adaptiveFingerprint = normalizeText(
    "adaptiveFingerprint" in adaptiveSelection ? adaptiveSelection.adaptiveFingerprint : ""
  );
  const selectionRewriteReason = normalizeText(
    "selectionRewriteReason" in adaptiveSelection ? adaptiveSelection.selectionRewriteReason : ""
  );
  const nextBestActionKey = normalizeText(
    "nextBestActionKey" in adaptiveSelection
      ? adaptiveSelection.nextBestActionKey
      : adaptiveSelection.nextBestAction?.key
  );
  const nextBestActionSection = normalizeText(
    "nextBestActionSection" in adaptiveSelection
      ? adaptiveSelection.nextBestActionSection
      : adaptiveSelection.nextBestAction?.sectionKey
  );
  const nextBestActionReason = normalizeText(
    "nextBestActionReason" in adaptiveSelection
      ? adaptiveSelection.nextBestActionReason
      : adaptiveSelection.nextBestAction?.reason,
    selectionRewriteReason
  );

  return {
    ...(adaptiveContractVersion ? { adaptive_contract_version: adaptiveContractVersion } : {}),
    ...(adaptiveFingerprint ? { adaptive_fingerprint: adaptiveFingerprint } : {}),
    ...(selectionRewriteReason ? { selection_rewrite_reason: selectionRewriteReason } : {}),
    ...(nextBestActionKey ? { next_best_action_key: nextBestActionKey } : {}),
    ...(nextBestActionSection ? { next_best_action_section: nextBestActionSection } : {}),
    ...(nextBestActionReason ? { next_best_action_reason: nextBestActionReason } : {}),
  };
}

export function appendMbtiAdaptiveSelectionQuery(
  href: string,
  adaptiveSelection?: MbtiAdaptiveSelectionViewModel | MbtiAdaptiveSelectionQueryViewModel | null
): string {
  const normalizedHref = normalizeText(href);
  if (!normalizedHref) {
    return "";
  }

  const url = new URL(normalizedHref, "https://fap.local");
  const query = buildMbtiAdaptiveSelectionQuery(adaptiveSelection);

  for (const [key, value] of Object.entries(query)) {
    if (!value) {
      continue;
    }

    url.searchParams.set(key, value);
  }

  return url.origin === "https://fap.local"
    ? `${url.pathname}${url.search}${url.hash}`
    : url.toString();
}

export function parseMbtiAdaptiveSelectionQuery(
  source?: URLSearchParams | SearchParamsRecord | null
): MbtiAdaptiveSelectionQueryViewModel | null {
  if (!source) {
    return null;
  }

  const adaptiveContractVersion = readParam(source, "adaptive_contract_version");
  const adaptiveFingerprint = readParam(source, "adaptive_fingerprint");
  const selectionRewriteReason = readParam(source, "selection_rewrite_reason");
  const nextBestActionKey = readParam(source, "next_best_action_key");
  const nextBestActionSection = readParam(source, "next_best_action_section");
  const nextBestActionReason = readParam(source, "next_best_action_reason");

  if (
    !adaptiveContractVersion &&
    !adaptiveFingerprint &&
    !selectionRewriteReason &&
    !nextBestActionKey &&
    !nextBestActionSection &&
    !nextBestActionReason
  ) {
    return null;
  }

  return {
    adaptiveContractVersion,
    adaptiveFingerprint,
    selectionRewriteReason,
    nextBestActionKey,
    nextBestActionSection,
    nextBestActionReason,
  };
}

export function buildMbtiAdaptiveTelemetryFields(
  adaptiveSelection?: MbtiAdaptiveSelectionViewModel | MbtiAdaptiveSelectionQueryViewModel | null
): Record<string, string> {
  const query = buildMbtiAdaptiveSelectionQuery(adaptiveSelection);

  return {
    adaptiveContractVersion: normalizeText(query.adaptive_contract_version),
    adaptiveFingerprint: normalizeText(query.adaptive_fingerprint),
    selectionRewriteReason: normalizeText(query.selection_rewrite_reason),
    nextBestActionKey: normalizeText(query.next_best_action_key),
    nextBestActionSection: normalizeText(query.next_best_action_section),
    nextBestActionReason: normalizeText(query.next_best_action_reason, query.selection_rewrite_reason),
  };
}

export function resolveMbtiAdaptiveRewriteReasonLabel(reason: string, locale: Locale): string {
  switch (reason) {
    case "feedback_redirect_to_action":
      return locale === "zh"
        ? "这次结果页已经根据你之前给出的负反馈，把重点从无效解释转向更可执行的动作。"
        : "This result shifts away from low-value explanation and toward more usable actions based on your feedback.";
    case "career_followthrough_loop":
      return locale === "zh"
        ? "这次结果页优先续接你最近更愿意推进的职业动作。"
        : "This result now continues the career moves you were more willing to act on.";
    case "repeatable_action_reinforcement":
      return locale === "zh"
        ? "这次结果页会强化你已经证明自己能重复执行的动作路径。"
        : "This result reinforces the action path you already proved repeatable.";
    case "resume_bias_reinforcement":
      return locale === "zh"
        ? "这次结果页会优先接住你最近反复回来的重点。"
        : "This result prioritizes the threads you kept coming back to.";
    case "clarify_then_action":
      return locale === "zh"
        ? "这次结果页先帮你澄清，再把你推回可执行动作。"
        : "This result clarifies first, then redirects you back into action.";
    case "relationship_followthrough_loop":
      return locale === "zh"
        ? "这次结果页会继续推进你最近更在意的人际动作。"
        : "This result keeps pushing the relationship actions you recently prioritized.";
    default:
      return locale === "zh"
        ? "这次结果页已经开始根据你的真实互动效果自动修正。"
        : "This result is already being corrected from your observed interaction signals.";
  }
}

export function resolveMbtiAdaptiveNextBestActionLabel(key: string, locale: Locale): string {
  const normalized = normalizeText(key).toLowerCase();
  if (!normalized) {
    return "";
  }

  if (normalized.includes("work_experiment")) {
    return locale === "zh" ? "工作实验" : "Work experiment";
  }
  if (normalized.includes("career_next_step")) {
    return locale === "zh" ? "职业下一步" : "Career next step";
  }
  if (normalized.includes("relationship_action")) {
    return locale === "zh" ? "关系练习" : "Relationship practice";
  }
  if (normalized.includes("watchout")) {
    return locale === "zh" ? "风险修正动作" : "Watchout action";
  }
  if (normalized.includes("weekly_action")) {
    return locale === "zh" ? "成长动作" : "Growth action";
  }

  return locale === "zh" ? "下一步动作" : "Next action";
}

export function resolveMbtiAdaptiveContinueReasonLabel(reason: string, locale: Locale): string {
  switch (reason) {
    case "feedback_redirect_to_action":
      return locale === "zh" ? "继续把重点从无效解释拉回更可执行的动作。" : "Continue by pulling the focus back from low-value explanation into action.";
    case "career_followthrough_loop":
      return locale === "zh" ? "继续推进你最近更有回应的职业动作。" : "Continue the career move that recently showed stronger follow-through.";
    case "repeatable_action_reinforcement":
      return locale === "zh" ? "继续强化你已经证明能重复执行的动作。" : "Continue the action you already proved repeatable.";
    case "resume_bias_reinforcement":
      return locale === "zh" ? "继续接住你反复回来的重点。" : "Continue the thread you kept returning to.";
    case "clarify_then_action":
      return locale === "zh" ? "继续先澄清，再回到动作推进。" : "Continue by clarifying first, then returning to action.";
    default:
      return locale === "zh" ? "继续当前最值得推进的下一步动作。" : "Continue with the next action that currently looks most useful.";
  }
}

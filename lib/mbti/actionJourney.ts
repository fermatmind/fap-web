import type { Locale } from "@/lib/i18n/locales";
import type { MbtiActionJourneyViewModel, MbtiPulseCheckViewModel } from "@/lib/mbti/publicProjection";

function normalizeText(...values: unknown[]): string {
  for (const value of values) {
    const normalized = String(value ?? "").trim();
    if (normalized) {
      return normalized;
    }
  }

  return "";
}

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((entry) => normalizeText(entry)).filter(Boolean);
}

export type MbtiActionJourneyQueryViewModel = {
  journeyContractVersion: string;
  journeyFingerprint: string;
  journeyScope: string;
  journeyState: string;
  progressState: string;
  actionFocusKey: string;
  recommendedNextPulseKeys: string[];
  revisitReorderReason: string;
  pulseState: string;
  pulsePromptKeys: string[];
};

export function buildMbtiActionJourneyQuery(
  journey?: MbtiActionJourneyViewModel | MbtiActionJourneyQueryViewModel | null,
  pulseCheck?: MbtiPulseCheckViewModel | null
): Record<string, string> {
  if (!journey && !pulseCheck) {
    return {};
  }

  const query: Record<string, string> = {};
  const recommendedNextPulseKeys = normalizeStringArray(journey?.recommendedNextPulseKeys);
  const pulsePromptKeys = normalizeStringArray(
    pulseCheck?.pulsePromptKeys
    ?? (journey && "pulsePromptKeys" in journey ? journey.pulsePromptKeys : [])
  );

  if (normalizeText(journey?.journeyContractVersion)) {
    query.journey_contract_version = normalizeText(journey?.journeyContractVersion);
  }
  if (normalizeText(journey?.journeyFingerprint)) {
    query.journey_fingerprint = normalizeText(journey?.journeyFingerprint);
  }
  if (normalizeText(journey?.journeyScope)) {
    query.journey_scope = normalizeText(journey?.journeyScope);
  }
  if (normalizeText(journey?.journeyState)) {
    query.journey_state = normalizeText(journey?.journeyState);
  }
  if (normalizeText(journey?.progressState)) {
    query.progress_state = normalizeText(journey?.progressState);
  }
  if (normalizeText(journey?.actionFocusKey)) {
    query.journey_action_focus_key = normalizeText(journey?.actionFocusKey);
  }
  if (recommendedNextPulseKeys.length > 0) {
    query.recommended_next_pulse_keys = recommendedNextPulseKeys.join("|");
  }
  if (normalizeText(journey?.revisitReorderReason)) {
    query.revisit_reorder_reason = normalizeText(journey?.revisitReorderReason);
  }
  const pulseState = normalizeText(
    pulseCheck?.pulseState,
    journey && "pulseState" in journey ? journey.pulseState : ""
  );
  if (pulseState) {
    query.pulse_state = pulseState;
  }
  if (pulsePromptKeys.length > 0) {
    query.pulse_prompt_keys = pulsePromptKeys.join("|");
  }

  return query;
}

export function appendMbtiActionJourneyQuery(
  path: string,
  journey?: MbtiActionJourneyViewModel | null,
  pulseCheck?: MbtiPulseCheckViewModel | null
): string {
  const base = normalizeText(path);
  if (!base) {
    return "";
  }

  const query = buildMbtiActionJourneyQuery(journey, pulseCheck);
  if (Object.keys(query).length === 0) {
    return base;
  }

  const [pathname, hash = ""] = base.split("#", 2);
  const url = new URL(pathname, "https://fm.local");
  for (const [key, value] of Object.entries(query)) {
    url.searchParams.set(key, value);
  }

  return `${url.pathname}${url.search}${hash ? `#${hash}` : ""}`;
}

function readParam(source: URLSearchParams | ReadonlyURLSearchParamsLike | null | undefined, key: string): string {
  if (!source) {
    return "";
  }

  const value = source.get(key);
  return normalizeText(value);
}

function splitParam(value: string): string[] {
  if (!value) {
    return [];
  }

  return value
    .split("|")
    .map((entry) => normalizeText(entry))
    .filter(Boolean);
}

type ReadonlyURLSearchParamsLike = {
  get(name: string): string | null;
};

export function parseMbtiActionJourneyQuery(
  source: URLSearchParams | ReadonlyURLSearchParamsLike | null | undefined
): MbtiActionJourneyQueryViewModel | null {
  const journeyContractVersion = readParam(source, "journey_contract_version");
  const journeyFingerprint = readParam(source, "journey_fingerprint");
  const journeyScope = readParam(source, "journey_scope");
  const journeyState = readParam(source, "journey_state");
  const progressState = readParam(source, "progress_state");
  const actionFocusKey = readParam(source, "journey_action_focus_key");
  const recommendedNextPulseKeys = splitParam(readParam(source, "recommended_next_pulse_keys"));
  const revisitReorderReason = readParam(source, "revisit_reorder_reason");
  const pulseState = readParam(source, "pulse_state");
  const pulsePromptKeys = splitParam(readParam(source, "pulse_prompt_keys"));

  if (
    !journeyContractVersion &&
    !journeyFingerprint &&
    !journeyScope &&
    !journeyState &&
    !progressState &&
    !actionFocusKey &&
    recommendedNextPulseKeys.length === 0 &&
    !revisitReorderReason &&
    !pulseState &&
    pulsePromptKeys.length === 0
  ) {
    return null;
  }

  return {
    journeyContractVersion,
    journeyFingerprint,
    journeyScope,
    journeyState,
    progressState,
    actionFocusKey,
    recommendedNextPulseKeys,
    revisitReorderReason,
    pulseState,
    pulsePromptKeys,
  };
}

export function buildMbtiActionJourneyTelemetryFields(
  journey?: MbtiActionJourneyViewModel | MbtiActionJourneyQueryViewModel | null,
  pulseCheck?: MbtiPulseCheckViewModel | null
): Record<string, string> {
  const recommendedNextPulseKeys = normalizeStringArray(
    journey && "recommendedNextPulseKeys" in journey ? journey.recommendedNextPulseKeys : []
  ).join("|");
  const pulsePromptKeys = normalizeStringArray(
    journey && "pulsePromptKeys" in journey ? journey.pulsePromptKeys : pulseCheck?.pulsePromptKeys
  ).join("|");

  return {
    journeyContractVersion: normalizeText(journey?.journeyContractVersion),
    journeyFingerprint: normalizeText(journey?.journeyFingerprint),
    journeyScope: normalizeText(journey?.journeyScope),
    journeyState: normalizeText(journey?.journeyState),
    progressState: normalizeText(journey?.progressState),
    actionFocusKey: normalizeText(journey?.actionFocusKey),
    recommendedNextPulseKeys,
    revisitReorderReason: normalizeText(journey?.revisitReorderReason),
    pulseState: normalizeText(
      journey && "pulseState" in journey ? journey.pulseState : "",
      pulseCheck?.pulseState
    ),
    pulsePromptKeys,
  };
}

export function resolveMbtiJourneyStateLabel(state: string, locale: Locale): string {
  switch (state) {
    case "first_view_activation":
      return locale === "zh" ? "先把第一步动作激活" : "Activate the first action loop";
    case "refine_after_feedback":
      return locale === "zh" ? "先根据反馈校正当前重点" : "Refine the current focus after feedback";
    case "career_move":
      return locale === "zh" ? "当前更适合把动作放到职业主线" : "The current move belongs in the career track";
    case "relationship_tuning":
      return locale === "zh" ? "当前更适合把动作放到关系调节里" : "The next move belongs in relationship tuning";
    case "resume_action_loop":
      return locale === "zh" ? "继续上一次已经开始的动作回路" : "Resume the action loop you already started";
    default:
      return locale === "zh" ? "继续当前最值得延续的动作重点" : "Continue the most useful action focus";
  }
}

export function resolveMbtiProgressStateLabel(state: string, locale: Locale): string {
  switch (state) {
    case "warming_up":
      return locale === "zh" ? "已经开始预热" : "Warming up";
    case "repeatable":
      return locale === "zh" ? "已经形成可重复动作" : "Repeatable now";
    case "committed":
      return locale === "zh" ? "已经进入稳定推进" : "Stable momentum";
    default:
      return locale === "zh" ? "还在起步" : "Not started yet";
  }
}

export function resolveMbtiRevisitReorderReasonLabel(reason: string, locale: Locale): string {
  switch (reason) {
    case "reorder_after_feedback":
      return locale === "zh" ? "这次回访先按反馈信号重排" : "This revisit reorders around your feedback";
    case "reorder_for_career_move":
      return locale === "zh" ? "这次回访先按职业推进重排" : "This revisit reorders around career progress";
    case "reorder_for_relationship_tuning":
      return locale === "zh" ? "这次回访先按关系调节重排" : "This revisit reorders around relationship tuning";
    case "resume_action_loop":
      return locale === "zh" ? "这次回访先延续你已经开始的动作" : "This revisit continues the action you already started";
    default:
      return locale === "zh" ? "这次回访先延续当前最值得继续的重点" : "This revisit continues the most useful current focus";
  }
}

export function resolveMbtiPulsePromptLabel(key: string, locale: Locale): string {
  switch (key) {
    case "pulse.review_feedback_signal":
      return locale === "zh" ? "先看反馈信号" : "Review the feedback signal";
    case "pulse.refine_focus":
      return locale === "zh" ? "先缩小当前重点" : "Refine the current focus";
    case "pulse.repeat_winning_action":
      return locale === "zh" ? "把这条有效动作再重复一次" : "Repeat the action that is already working";
    case "pulse.expand_scope":
      return locale === "zh" ? "把动作从单点扩大到一条链" : "Expand the action into a fuller chain";
    case "pulse.raise_scope":
      return locale === "zh" ? "把当前动作升级成下一步计划" : "Raise the current action into the next plan";
    case "pulse.select_next_read":
      return locale === "zh" ? "带着现在的动作去看下一段阅读" : "Carry this action into the next reading";
    case "pulse.check_small_signal":
      return locale === "zh" ? "先确认最近有没有一点点推进" : "Check whether there has been even a small signal of progress";
    case "pulse.start_small":
      return locale === "zh" ? "先把动作缩成一个更小的起步" : "Start with a smaller first move";
    default:
      return normalizeText(key);
  }
}

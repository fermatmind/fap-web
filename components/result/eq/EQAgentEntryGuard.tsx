"use client";

import { useState } from "react";
import { MessageCircle, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fetchEqAgentContext, type EqAgentContextPayload } from "@/lib/api/v0_3";
import type {
  EqAgentContextAccess,
  EqAgentContextLoader,
  EqCommercialConversionActionAsset,
  EqV5ViewModel,
} from "./types";

const DEFAULT_INTENT = "understand_my_result";

type GuardState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ready"; context: EqAgentContextPayload }
  | { status: "unavailable"; reason: string };

export function EQAgentEntryGuard({
  viewModel,
  attemptId,
  access,
  loadAgentContext = defaultLoadAgentContext,
}: {
  viewModel: EqV5ViewModel;
  attemptId?: string;
  access?: EqAgentContextAccess;
  loadAgentContext?: EqAgentContextLoader;
}) {
  const entry = findAgentEntry(viewModel.assets.commercial_conversion_actions);
  const [state, setState] = useState<GuardState>({ status: "idle" });

  if (!entry) {
    return null;
  }

  const locale = viewModel.locale;
  const disabled = !attemptId || state.status === "loading";

  async function handleOpen() {
    if (!attemptId) {
      setState({ status: "unavailable", reason: locale === "zh" ? "当前结果缺少可读取的报告 ID。" : "This result is missing a readable report ID." });
      return;
    }

    setState({ status: "loading" });
    try {
      const context = await loadAgentContext({ attemptId, locale, intent: DEFAULT_INTENT, access });
      if (!isSafeReadOnlyContext(context)) {
        setState({
          status: "unavailable",
          reason:
            locale === "zh"
              ? "Agent 上下文暂不可用；报告权威仍以当前页面为准。"
              : "Agent context is unavailable. This report remains the authority.",
        });
        return;
      }
      setState({ status: "ready", context });
    } catch {
      setState({
        status: "unavailable",
        reason:
          locale === "zh"
            ? "暂时无法读取 Agent 上下文；请稍后再试。"
            : "Agent context could not be loaded. Try again later.",
      });
    }
  }

  return (
    <article data-testid="eq-agent-entry-guard" className="rounded-[8px] border border-slate-200 bg-slate-50 p-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-950">{entry.title || entry.cta_label || entry.id}</h3>
          {entry.body ? <p className="mt-1 text-sm leading-6 text-slate-700">{entry.body}</p> : null}
        </div>
        <Button type="button" variant="outline" disabled={disabled} onClick={handleOpen}>
          <MessageCircle className="mr-2 h-4 w-4" aria-hidden="true" />
          {entry.cta_label || (locale === "zh" ? "问 Agent" : "Ask the Agent")}
        </Button>
      </div>
      {!attemptId ? (
        <p className="mt-3 text-xs leading-5 text-slate-500">
          {locale === "zh" ? "保存后的报告可继续读取 Agent 上下文。" : "Saved reports can continue into Agent context."}
        </p>
      ) : null}
      {state.status === "loading" ? (
        <p className="mt-3 text-xs leading-5 text-slate-500">{locale === "zh" ? "正在读取只读上下文..." : "Loading read-only context..."}</p>
      ) : null}
      {state.status === "ready" ? <ReadyPanel context={state.context} locale={locale} /> : null}
      {state.status === "unavailable" ? (
        <p data-testid="eq-agent-entry-unavailable" className="mt-3 text-xs leading-5 text-slate-500">
          {state.reason}
        </p>
      ) : null}
    </article>
  );
}

function ReadyPanel({ context, locale }: { context: EqAgentContextPayload; locale: EqV5ViewModel["locale"] }) {
  const safeOpening = text(context.intent_context?.safe_opening);

  return (
    <div data-testid="eq-agent-entry-ready" className="mt-3 rounded-[8px] border border-emerald-200 bg-white p-3">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.08em] text-emerald-700">
        <ShieldCheck className="h-4 w-4" aria-hidden="true" />
        {locale === "zh" ? "只读上下文已就绪" : "Read-only context ready"}
      </div>
      {safeOpening ? <p className="mt-2 text-sm leading-6 text-slate-700">{safeOpening}</p> : null}
      <p className="mt-2 text-xs leading-5 text-slate-500">
        {locale === "zh"
          ? "Agent 只能解释当前报告资产，不能修改分数、报告或模块状态。"
          : "The Agent can explain this report context only; it cannot change scores, sections, or module status."}
      </p>
    </div>
  );
}

function findAgentEntry(actions: EqCommercialConversionActionAsset[]): EqCommercialConversionActionAsset | null {
  return actions.find((action) => action.id === "eq.conversion.agent_entry") ?? null;
}

export function isEqAgentConversionAction(action: EqCommercialConversionActionAsset): boolean {
  return action.id === "eq.conversion.agent_entry";
}

function isSafeReadOnlyContext(context: EqAgentContextPayload): boolean {
  const guardrails = context.guardrails ?? {};

  return Boolean(
    context.ready === true &&
      guardrails.read_only === true &&
      guardrails.can_mutate_report === false &&
      guardrails.can_mutate_scores === false &&
      guardrails.can_override_formulation === false &&
      guardrails.can_enable_sjt === false &&
      guardrails.can_create_paid_unlock_language === false &&
      guardrails.can_expose_raw_technical_tags === false
  );
}

function text(value: unknown): string {
  return String(value ?? "").trim();
}

async function defaultLoadAgentContext({
  attemptId,
  locale,
  intent,
  access,
}: Parameters<EqAgentContextLoader>[0]): Promise<EqAgentContextPayload> {
  return fetchEqAgentContext({
    attemptId,
    locale: locale === "zh" ? "zh-CN" : "en",
    intent,
    anonId: access?.anonId,
    accessToken: access?.accessToken,
    skipAuth: access?.skipAuth,
  });
}

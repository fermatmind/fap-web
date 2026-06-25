"use client";

import { useState, type FormEvent } from "react";
import { MessageCircle, Send, ShieldCheck, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  fetchEqAgentContext,
  sendEqAgentRuntimeMessage,
  type EqAgentContextPayload,
  type EqAgentRuntimeResponsePayload,
} from "@/lib/api/v0_3";
import type {
  EqAgentContextAccess,
  EqAgentContextLoader,
  EqAgentRuntimeMessageLoader,
  EqCommercialConversionActionAsset,
  EqV5ViewModel,
} from "./types";

const DEFAULT_INTENT = "understand_my_result";

type GuardState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ready"; context: EqAgentContextPayload }
  | { status: "unavailable"; reason: string };

type RuntimeState =
  | { status: "idle" }
  | { status: "sending" }
  | { status: "ready"; response: EqAgentRuntimeResponsePayload }
  | { status: "unavailable"; reason: string };

export function EQAgentEntryGuard({
  viewModel,
  attemptId,
  access,
  loadAgentContext = defaultLoadAgentContext,
  sendAgentRuntimeMessage = defaultSendAgentRuntimeMessage,
}: {
  viewModel: EqV5ViewModel;
  attemptId?: string;
  access?: EqAgentContextAccess;
  loadAgentContext?: EqAgentContextLoader;
  sendAgentRuntimeMessage?: EqAgentRuntimeMessageLoader;
}) {
  const entry = findAgentEntry(viewModel.assets.commercial_conversion_actions);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [state, setState] = useState<GuardState>({ status: "idle" });
  const [runtimeState, setRuntimeState] = useState<RuntimeState>({ status: "idle" });
  const [message, setMessage] = useState("");

  if (!entry) {
    return null;
  }

  const locale = viewModel.locale;
  const disabled = !attemptId || state.status === "loading";

  async function handleOpen() {
    setDrawerOpen(true);
    if (!attemptId) {
      setState({ status: "unavailable", reason: locale === "zh" ? "当前结果缺少可读取的报告 ID。" : "This result is missing a readable report ID." });
      return;
    }

    if (state.status === "ready") {
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

  async function handleSend(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!attemptId || state.status !== "ready") {
      setRuntimeState({
        status: "unavailable",
        reason:
          locale === "zh"
            ? "只读上下文尚未就绪，不能发送消息。"
            : "Read-only context is not ready, so the message was not sent.",
      });
      return;
    }

    const trimmed = message.trim();
    if (!trimmed) {
      setRuntimeState({
        status: "unavailable",
        reason: locale === "zh" ? "请输入一个问题。" : "Enter a question first.",
      });
      return;
    }

    setRuntimeState({ status: "sending" });
    try {
      const response = await sendAgentRuntimeMessage({
        attemptId,
        locale,
        intent: DEFAULT_INTENT,
        message: trimmed,
        access,
      });
      if (!isSafeRuntimeResponse(response)) {
        setRuntimeState({
          status: "unavailable",
          reason:
            locale === "zh"
              ? "Agent 回复未通过安全边界检查；当前报告仍是唯一权威。"
              : "The Agent response did not pass safety checks. This report remains the authority.",
        });
        return;
      }
      setRuntimeState({ status: "ready", response });
    } catch {
      setRuntimeState({
        status: "unavailable",
        reason: locale === "zh" ? "暂时无法获取 Agent 回复；请稍后再试。" : "The Agent response is unavailable. Try again later.",
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
      {state.status === "unavailable" ? (
        <p data-testid="eq-agent-entry-unavailable" className="mt-3 text-xs leading-5 text-slate-500">
          {state.reason}
        </p>
      ) : null}
      {drawerOpen ? (
        <div data-testid="eq-agent-runtime-drawer" className="mt-4 rounded-[8px] border border-slate-200 bg-white p-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                {locale === "zh" ? "只读 Agent" : "Read-only Agent"}
              </p>
              <h4 className="mt-1 text-sm font-semibold text-slate-950">
                {locale === "zh" ? "基于当前报告回答" : "Answer from this report"}
              </h4>
            </div>
            <Button type="button" variant="ghost" size="icon" onClick={() => setDrawerOpen(false)} aria-label={locale === "zh" ? "关闭" : "Close"}>
              <X className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
          {state.status === "ready" ? <ReadyPanel context={state.context} locale={locale} /> : null}
          {state.status === "ready" ? (
            <form className="mt-3 space-y-3" onSubmit={handleSend}>
              <label className="block text-xs font-semibold uppercase tracking-[0.08em] text-slate-500" htmlFor="eq-agent-message">
                {locale === "zh" ? "问题" : "Question"}
              </label>
              <textarea
                id="eq-agent-message"
                data-testid="eq-agent-runtime-message"
                className="min-h-[88px] w-full resize-y rounded-[8px] border border-slate-200 bg-white px-3 py-2 text-sm leading-6 text-slate-800 outline-none focus:border-slate-400"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder={locale === "zh" ? "问一个关于当前报告的问题" : "Ask a question about this report"}
              />
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs leading-5 text-slate-500">
                  {locale === "zh" ? "回复只能读取报告上下文。" : "Responses can only read report context."}
                </p>
                <Button type="submit" disabled={runtimeState.status === "sending" || !message.trim()}>
                  <Send className="mr-2 h-4 w-4" aria-hidden="true" />
                  {runtimeState.status === "sending" ? (locale === "zh" ? "发送中" : "Sending") : locale === "zh" ? "发送" : "Send"}
                </Button>
              </div>
            </form>
          ) : null}
          {runtimeState.status === "ready" ? <RuntimeResponsePanel response={runtimeState.response} locale={locale} /> : null}
          {runtimeState.status === "unavailable" ? (
            <p data-testid="eq-agent-runtime-unavailable" className="mt-3 text-xs leading-5 text-slate-500">
              {runtimeState.reason}
            </p>
          ) : null}
        </div>
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

function RuntimeResponsePanel({
  response,
  locale,
}: {
  response: EqAgentRuntimeResponsePayload;
  locale: EqV5ViewModel["locale"];
}) {
  const textValue = text(response.assistant_response?.text);
  const points = Array.isArray(response.assistant_response?.summary_points)
    ? response.assistant_response.summary_points.map(text).filter(Boolean).slice(0, 4)
    : [];
  const followUp = text(response.assistant_response?.follow_up_question);

  return (
    <div data-testid="eq-agent-runtime-response" className="mt-3 rounded-[8px] border border-slate-200 bg-slate-50 p-3">
      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
        {locale === "zh" ? "Agent 回复" : "Agent response"}
      </p>
      {textValue ? <p className="mt-2 text-sm leading-6 text-slate-800">{textValue}</p> : null}
      {points.length > 0 ? (
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-slate-700">
          {points.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>
      ) : null}
      {followUp ? <p className="mt-2 text-xs leading-5 text-slate-500">{followUp}</p> : null}
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

function isSafeRuntimeResponse(response: EqAgentRuntimeResponsePayload): boolean {
  const guardrails = response.guardrails ?? {};
  const safety = response.safety ?? {};

  return Boolean(
    response.ready === true &&
      response.mode === "deterministic_read_only" &&
      guardrails.read_only === true &&
      guardrails.can_mutate_report === false &&
      guardrails.can_mutate_scores === false &&
      guardrails.can_override_formulation === false &&
      guardrails.can_enable_sjt === false &&
      guardrails.can_use_paid_unlock_language === false &&
      safety.no_paywall_language === true &&
      safety.no_sjt_entry === true &&
      safety.no_raw_technical_tags === true &&
      response.next_module?.available !== true
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

async function defaultSendAgentRuntimeMessage({
  attemptId,
  locale,
  intent,
  message,
  access,
}: Parameters<EqAgentRuntimeMessageLoader>[0]): Promise<EqAgentRuntimeResponsePayload> {
  return sendEqAgentRuntimeMessage({
    attemptId,
    locale: locale === "zh" ? "zh-CN" : "en",
    intent,
    message,
    anonId: access?.anonId,
    accessToken: access?.accessToken,
    skipAuth: access?.skipAuth,
  });
}

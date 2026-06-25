import Link from "next/link";
import { RotateCcw, Share2 } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { localizedPath } from "@/lib/i18n/locales";
import { EQAgentEntryGuard, isEqAgentConversionAction } from "./EQAgentEntryGuard";
import type { EqAgentContextAccess, EqAgentContextLoader, EqAgentRuntimeMessageLoader, EqV5ViewModel } from "./types";

export function EQSaveShareRelated({
  viewModel,
  attemptId,
  agentContextAccess,
  loadAgentContext,
  sendAgentRuntimeMessage,
}: {
  viewModel: EqV5ViewModel;
  attemptId?: string;
  agentContextAccess?: EqAgentContextAccess;
  loadAgentContext?: EqAgentContextLoader;
  sendAgentRuntimeMessage?: EqAgentRuntimeMessageLoader;
}) {
  const { locale } = viewModel;
  const conversionActions = viewModel.assets.commercial_conversion_actions.filter(
    (action) => !isEqAgentConversionAction(action)
  );

  return (
    <section data-testid="eq-save-share-related" className="rounded-[8px] border border-slate-200 bg-white p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">
            {locale === "zh" ? "保存、分享与继续探索" : "Save, Share, and Continue"}
          </h2>
          {attemptId ? <p className="mt-1 text-xs text-slate-500">{attemptId}</p> : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" disabled>
            <Share2 className="mr-2 h-4 w-4" aria-hidden="true" />
            {locale === "zh" ? "分享" : "Share"}
          </Button>
          <Link
            href={localizedPath("/tests/eq-test-emotional-intelligence-assessment/take", locale)}
            className={buttonVariants({ variant: "outline" })}
          >
            <RotateCcw className="mr-2 h-4 w-4" aria-hidden="true" />
            {locale === "zh" ? "重新测试" : "Retake"}
          </Link>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2 text-sm">
        <RelatedLink href="/tests/big-five-personality-test-ocean-model" locale={locale} label="Big Five" />
        <RelatedLink href="/tests/holland-career-interest-test-riasec" locale={locale} label="RIASEC" />
        <RelatedLink href="/tests/mbti-personality-test-16-personality-types" locale={locale} label="MBTI" />
      </div>
      {conversionActions.length > 0 ? (
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {conversionActions.map((action) => (
            <article key={action.id ?? action.title} className="rounded-[8px] border border-slate-200 bg-slate-50 p-3">
              <h3 className="text-sm font-semibold text-slate-950">{action.title || action.cta_label || action.id}</h3>
              {action.body ? <p className="mt-1 text-sm leading-6 text-slate-700">{action.body}</p> : null}
              {action.cta_label ? (
                <p className="mt-2 text-xs font-medium uppercase tracking-[0.08em] text-slate-500">
                  {action.cta_label}
                </p>
              ) : null}
            </article>
          ))}
        </div>
      ) : null}
      <div className="mt-4">
        <EQAgentEntryGuard
          viewModel={viewModel}
          attemptId={attemptId}
          access={agentContextAccess}
          loadAgentContext={loadAgentContext}
          sendAgentRuntimeMessage={sendAgentRuntimeMessage}
        />
      </div>
    </section>
  );
}

function RelatedLink({ href, locale, label }: { href: string; locale: EqV5ViewModel["locale"]; label: string }) {
  return (
    <Link
      className="rounded-[8px] border border-slate-200 px-3 py-2 font-medium text-slate-700 hover:border-slate-300 hover:bg-slate-50"
      href={localizedPath(href, locale)}
    >
      {label}
    </Link>
  );
}

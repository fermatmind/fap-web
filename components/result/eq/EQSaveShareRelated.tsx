import Link from "next/link";
import { RotateCcw, Share2 } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { localizedPath } from "@/lib/i18n/locales";
import type { EqV5ViewModel } from "./types";

export function EQSaveShareRelated({ viewModel, attemptId }: { viewModel: EqV5ViewModel; attemptId?: string }) {
  const { locale } = viewModel;

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

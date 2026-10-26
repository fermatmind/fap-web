import type { Locale } from "@/lib/i18n/locales";

export function QuestionnaireSqlCode({ code, locale, number }: { code: string; locale: Locale; number: number }) {
  return <pre data-sql-code role="region" tabIndex={0} aria-label={locale === "zh" ? `第${number}题SQL代码` : `SQL code for question ${number}`}
    className="my-5 max-w-full overflow-x-auto whitespace-pre-wrap break-words rounded-lg border border-slate-200 bg-slate-950 p-4 font-mono text-sm leading-7 text-slate-100 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-700"><code>{code}</code></pre>;
}

import Link from "next/link";

export type DecisionPathCardProps = {
  eyebrow: string;
  title: string;
  summary: string;
  upside?: string;
  tradeoff?: string;
  ctaLabel: string;
  href: string;
  testId?: string;
};

export function DecisionPathCard({ eyebrow, title, summary, upside, tradeoff, ctaLabel, href, testId = "career-v1-decision-path-card" }: DecisionPathCardProps) {
  return (
    <article
      className="group rounded-3xl border border-slate-200 bg-white p-5 transition hover:border-slate-300 hover:shadow-sm md:p-6"
      data-testid={testId}
    >
      <p className="m-0 text-xs font-medium uppercase tracking-[0.18em] text-slate-400">{eyebrow}</p>
      <h3 className="m-0 mt-3 text-xl font-semibold tracking-tight text-slate-950">{title}</h3>
      <p className="m-0 mt-3 text-sm leading-6 text-slate-600">{summary}</p>
      {upside || tradeoff ? (
        <div className="mt-5 grid gap-3 border-t border-slate-100 pt-4 text-sm text-slate-600">
          {upside ? (
            <p className="m-0">
              <span className="font-medium text-slate-900">Upside: </span>
              {upside}
            </p>
          ) : null}
          {tradeoff ? (
            <p className="m-0">
              <span className="font-medium text-slate-900">Tradeoff: </span>
              {tradeoff}
            </p>
          ) : null}
        </div>
      ) : null}
      <Link
        href={href}
        className="mt-5 inline-flex min-h-[42px] items-center rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
      >
        {ctaLabel}
      </Link>
    </article>
  );
}

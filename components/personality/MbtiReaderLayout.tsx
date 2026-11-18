import type { ComponentPropsWithoutRef, ReactNode } from "react";

type ReaderKind = "detail" | "comparison";

export function MbtiReaderPage({
  kind,
  ...props
}: ComponentPropsWithoutRef<"main"> & { kind: ReaderKind }) {
  return (
    <main
      {...props}
      className={`mx-auto w-full max-w-[86rem] space-y-8 px-[var(--fm-container-gutter)] py-8 sm:py-10 [&_[id]]:scroll-mt-[calc(var(--fm-space-30)+var(--fm-space-10))] lg:[&_[id]]:scroll-mt-24 ${kind === "comparison" ? "[&_table]:min-w-[36rem]" : ""}`}
    />
  );
}

export function MbtiReaderHero({
  kind,
  id,
  title,
  children,
  visual,
  footer,
  quote,
}: {
  kind: ReaderKind;
  id: string;
  title: ReactNode;
  children?: ReactNode;
  visual?: ReactNode;
  footer?: ReactNode;
  quote?: ReactNode;
}) {
  const comparison = kind === "comparison";
  return (
    <section
      id={id}
      className="overflow-hidden rounded-[1.5rem] bg-[#77608d] text-white shadow-[0_24px_70px_rgba(15,23,42,0.10)]"
    >
      <div className={`relative grid min-h-[17rem] gap-8 p-7 sm:p-10 md:items-center lg:min-h-[18.5rem] lg:p-10 xl:p-12 ${visual ? (comparison ? "md:grid-cols-[minmax(0,1fr)_18rem]" : "md:grid-cols-[minmax(0,1fr)_16rem]") : ""}`}>
        <div className="min-w-0 max-w-3xl space-y-4">
          <h1 className={`m-0 break-words text-4xl font-semibold leading-[1.04] text-white sm:text-5xl ${comparison ? "max-w-4xl font-sans tracking-tight" : ""}`}>{title}</h1>
          {children}
        </div>
        {visual}
      </div>
      {footer}
      {quote}
    </section>
  );
}

export const mbtiReaderMobileLinkClass = "rounded-full border border-[rgba(16,24,40,0.10)] bg-[var(--fm-surface)] px-4 py-2 text-sm font-semibold text-[var(--fm-text)] transition hover:border-[var(--fm-accent)] hover:text-[var(--fm-accent)]";
export const mbtiReaderDesktopLinkClass = "group flex items-center justify-between gap-3 border-b border-[rgba(16,24,40,0.08)] px-3 py-3 text-sm font-semibold text-[#3d4652] transition hover:bg-[rgba(23,98,135,0.06)] hover:text-[var(--fm-accent)]";

export function MbtiReaderMobileNav({ children, ...props }: ComponentPropsWithoutRef<"nav">) {
  return (
    <nav
      {...props}
      className="sticky top-20 z-20 -mx-1 overflow-x-auto rounded-2xl border border-[rgba(16,24,40,0.10)] bg-[var(--fm-hub-sticky-bg)] p-2 shadow-[var(--fm-shadow-sm)] backdrop-blur lg:hidden"
    >
      <div className="flex min-w-max gap-2">{children}</div>
    </nav>
  );
}

export function MbtiReaderToc({
  title,
  label,
  children,
  ...props
}: ComponentPropsWithoutRef<"div"> & { title: string; label: string }) {
  return (
    <div {...props}>
      <p className="m-0 pb-3 text-base font-semibold text-[#2f3744]">{title}</p>
      <nav aria-label={label} className="mt-2">
        <ul className="m-0 list-none space-y-0 p-0">{children}</ul>
      </nav>
    </div>
  );
}

export function MbtiReaderColumns({ kind, children }: { kind: ReaderKind; children: ReactNode }) {
  const comparison = kind === "comparison";
  return (
    <div
      className={`grid gap-10 lg:grid-cols-[14rem_minmax(0,1fr)] xl:grid-cols-[14rem_minmax(0,48rem)_17rem] ${comparison ? "" : "xl:items-start"}`}
      data-testid={comparison ? "personality-comparison-reading-layout" : "personality-detail-v85-reading-layout"}
    >
      {children}
    </div>
  );
}

export function MbtiReaderAside(props: ComponentPropsWithoutRef<"aside">) {
  return <aside {...props} className="sticky top-24 hidden self-start lg:block" />;
}

export function MbtiReaderSections(props: ComponentPropsWithoutRef<"section">) {
  return <section {...props} className="w-full min-w-0 space-y-8" />;
}

export function MbtiComparisonFaq({
  id,
  title,
  items,
  ...props
}: ComponentPropsWithoutRef<"section"> & {
  id: string;
  title: string;
  items: ReadonlyArray<{ question: string; answer: string }>;
}) {
  if (items.length === 0) return null;

  return (
    <section
      {...props}
      id={id}
      className="rounded-[1.25rem] border border-[rgba(16,24,40,0.10)] bg-white p-5 shadow-[0_12px_35px_rgba(15,23,42,0.05)]"
      data-authority-source="comparison_public_projection_v1"
    >
      <h2 className="m-0 text-xl font-semibold text-[var(--fm-text)]">{title}</h2>
      <div className="mt-4 space-y-4">
        {items.map((item) => (
          <article key={item.question} className="border-t border-[var(--fm-border)] pt-4 first:border-t-0 first:pt-0">
            <h3 className="m-0 text-base font-semibold text-[var(--fm-text)]">{item.question}</h3>
            <p className="m-0 mt-2 text-sm leading-7 text-[var(--fm-text-muted)]">{item.answer}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

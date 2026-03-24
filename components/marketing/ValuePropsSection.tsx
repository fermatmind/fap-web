import { Container } from "@/components/layout/Container";
import type { ValuePropsContent } from "./homepageContent";

type ValuePropsSectionProps = {
  content: ValuePropsContent;
};

export function ValuePropsSection({ content }: ValuePropsSectionProps) {
  return (
    <section
      data-testid="home-value-props-section"
      className="py-[var(--fm-section-y-lg)]"
    >
      <Container className="grid gap-8 rounded-[1.6rem] border border-slate-200 bg-white p-6 md:grid-cols-[1fr_1fr] md:gap-10 md:p-10">
        <div className="space-y-3">
          <p className="fm-home-section-kicker">{content.eyebrow}</p>
          <h2 className="m-0 text-3xl font-semibold leading-tight text-[var(--fm-trust-blue-strong)] md:text-4xl">
            {content.title}
          </h2>
          <p className="m-0 text-sm leading-8 text-[var(--fm-text-muted)]">{content.supporting}</p>
        </div>

        <div className="grid gap-4 md:grid-cols-1">
          {content.cards.map((item) => (
            <article
              key={item.title}
              className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5"
            >
              <h3 className="m-0 text-xl font-semibold text-[var(--fm-text)]">{item.title}</h3>
              <p className="mt-2 text-sm leading-7 text-[var(--fm-text-muted)]">{item.body}</p>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}

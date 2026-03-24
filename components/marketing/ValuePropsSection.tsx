import { Container } from "@/components/layout/Container";
import type { ValuePropsContent } from "./homepageContent";

type ValuePropsSectionProps = {
  content: ValuePropsContent;
};

export function ValuePropsSection({ content }: ValuePropsSectionProps) {
  return (
    <section
      data-testid="home-value-props-section"
      className="fm-home-section-shell fm-home-trust-band"
    >
      <Container className="max-w-[1200px] grid gap-8 lg:grid-cols-[5fr_7fr] lg:items-start">
        <div className="space-y-3">
          <p className="fm-home-section-kicker">{content.eyebrow}</p>
          <h2 className="m-0 text-3xl font-semibold leading-tight text-[var(--fm-trust-blue-strong)] md:text-4xl">
            {content.title}
          </h2>
          <p className="m-0 text-sm leading-7 text-[var(--fm-text-muted)]">{content.supporting}</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {content.cards.map((item) => (
            <article key={item.title} className="fm-home-trust-card">
              <p className="fm-home-trust-card-label">{item.title}</p>
              <p className="m-0 text-sm leading-7 text-[var(--fm-text-muted)]">{item.body}</p>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}

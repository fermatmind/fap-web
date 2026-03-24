import { Container } from "@/components/layout/Container";
import type { ValuePropsContent } from "./homepageContent";

type ValuePropsSectionProps = {
  content: ValuePropsContent;
};

export function ValuePropsSection({ content }: ValuePropsSectionProps) {
  return (
    <section
      data-testid="home-value-props-section"
      className="fm-home-trust-banner py-[var(--fm-section-y-lg)]"
    >
      <Container className="grid gap-8 md:grid-cols-[1fr_1fr] md:gap-10">
        <div className="space-y-3">
          <p className="fm-home-section-kicker">{content.eyebrow}</p>
          <h2 className="m-0 text-3xl font-semibold leading-tight text-[var(--fm-trust-blue-strong)] md:text-4xl">
            {content.title}
          </h2>
          <p className="m-0 text-sm leading-8 text-[var(--fm-text-muted)]">{content.supporting}</p>
        </div>

        <div className="fm-home-trust-grid">
          {content.cards.map((item) => (
            <article key={item.title} className="fm-home-trust-card">
              <p className="fm-home-trust-card-label">{item.title}</p>
              <p className="m-0 text-sm leading-6 text-[var(--fm-text-muted)]">{item.body}</p>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}

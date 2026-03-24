import { Container } from "@/components/layout/Container";
import type { SiteDictionary } from "@/lib/i18n/types";

type IconProps = {
  className?: string;
};

function ReliableIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M32 10L49 16V30C49 38.9 43.1 47 32 52C20.9 47 15 38.9 15 30V16L32 10Z" fill="rgba(21,63,131,0.10)" />
      <path d="M22 10V14C22 16.4 23.8 18.4 26.2 18.8L32 20L37.8 18.8C40.2 18.4 42 16.4 42 14V10" stroke="currentColor" strokeWidth="3" />
      <circle cx="32" cy="31" r="8" stroke="currentColor" strokeWidth="2.8" />
      <path d="M32 39V47" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" />
      <path d="M16 46H48" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

function PrivacyIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M32 11L48 18V27C48 38.6 40.8 48.8 32 53C23.2 48.8 16 38.6 16 27V18L32 11Z" stroke="currentColor" strokeWidth="2.7" />
      <path d="M23.6 31C23.6 26.5 27.1 23 31.6 23C36.1 23 39.6 26.5 39.6 31V37.5H23.6V31Z" stroke="currentColor" strokeWidth="2.5" />
      <circle cx="31.6" cy="33.9" r="2.2" fill="currentColor" />
    </svg>
  );
}

function ScaleIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <circle cx="32" cy="32" r="20" stroke="currentColor" strokeWidth="2.7" />
      <path d="M32 12V52M12 32H52" stroke="currentColor" strokeWidth="2.4" />
      <path d="M32 48.5L26 26.5L31.6 33.6L38.5 25Z" stroke="currentColor" strokeWidth="2.5" />
    </svg>
  );
}

const ICONS = [ReliableIcon, PrivacyIcon, ScaleIcon] as const;

export function ValuePropsSection({ dict }: { dict: SiteDictionary }) {
  return (
    <section
      data-testid="home-value-props-section"
      className="relative border-y border-[rgba(170,192,223,0.55)] bg-white py-[var(--fm-space-8)] md:py-[var(--fm-section-y-sm)]"
    >
      <Container>
        <h2 className="sr-only">{dict.home.valueProps.title}</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {dict.home.valueProps.items.map((item, index) => {
            const Icon = ICONS[index] ?? ReliableIcon;
            return (
              <article
                key={item.title}
                className="fm-home-proof-card group flex h-full min-h-[17.2rem] flex-col p-6 outline-none focus-visible:outline-none"
                tabIndex={0}
              >
                <div className="flex h-full flex-col gap-4">
                  <span className="grid h-14 w-14 place-items-center rounded-xl bg-[linear-gradient(180deg,#f3f8ff_0%,#e2effe_100%)] text-[var(--fm-trust-blue)] shadow-[var(--fm-shadow-sm)]">
                    <Icon className="h-7 w-7" />
                  </span>
                  <h3 className="m-0 text-2xl font-semibold text-[var(--fm-text)]">{item.title}</h3>
                  <p className="m-0 text-sm leading-7 text-[var(--fm-text-muted)]">{item.description}</p>
                </div>
              </article>
            );
          })}
        </div>
      </Container>
    </section>
  );
}

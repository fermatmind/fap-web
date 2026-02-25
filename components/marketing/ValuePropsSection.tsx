import { Container } from "@/components/layout/Container";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import type { SiteDictionary } from "@/lib/i18n/types";

type IconProps = {
  className?: string;
};

function ReliableIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <rect x="10" y="20" width="44" height="30" rx="6" stroke="currentColor" strokeWidth="2.8" />
      <path d="M22 20V15C22 11.7 24.7 9 28 9H36C39.3 9 42 11.7 42 15V20" stroke="currentColor" strokeWidth="2.8" />
      <circle cx="32" cy="35" r="4.2" stroke="currentColor" strokeWidth="2.6" />
      <path d="M32 39V44" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
      <path d="M17 50H47" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}

function PrivacyIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M32 9L48 16V28C48 39.6 41.2 49.8 32 54C22.8 49.8 16 39.6 16 28V16L32 9Z" stroke="currentColor" strokeWidth="2.8" />
      <path d="M24.2 31.8C24.2 27.5 27.7 24 32 24C36.3 24 39.8 27.5 39.8 31.8V38.8H24.2V31.8Z" stroke="currentColor" strokeWidth="2.6" />
      <circle cx="32" cy="33.8" r="2.5" fill="currentColor" />
    </svg>
  );
}

function CommunityIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <circle cx="20" cy="22" r="5.8" stroke="currentColor" strokeWidth="2.6" />
      <circle cx="32" cy="19.5" r="7" stroke="currentColor" strokeWidth="2.8" />
      <circle cx="44" cy="22" r="5.8" stroke="currentColor" strokeWidth="2.6" />
      <path d="M12.5 43.5C12.5 38.3 16.8 34 22 34H25.5C30.7 34 35 38.3 35 43.5V48.5H12.5V43.5Z" stroke="currentColor" strokeWidth="2.6" />
      <path d="M24 46C24 39.5 29.2 34.3 35.7 34.3H40.3C46.8 34.3 52 39.5 52 46V51H24V46Z" stroke="currentColor" strokeWidth="2.6" />
    </svg>
  );
}

const ICONS = [ReliableIcon, PrivacyIcon, CommunityIcon] as const;

export function ValuePropsSection({ dict }: { dict: SiteDictionary }) {
  return (
    <section data-testid="home-value-props-section" className="relative z-20 -mt-12 md:-mt-16">
      <Container>
        <h2 className="sr-only">{dict.home.valueProps.title}</h2>
        <div className="grid gap-4 md:grid-cols-3 md:gap-5">
          {dict.home.valueProps.items.map((item, index) => {
            const Icon = ICONS[index] ?? ReliableIcon;
            const iconOpticalShiftClass =
              index === 1
                ? "translate-y-px"
                : index === 2
                  ? "translate-x-px translate-y-px"
                  : "";
            return (
              <Card
                key={item.title}
                className="h-full border-[var(--fm-border)] bg-white/95 shadow-[var(--fm-shadow-md)] transition hover:-translate-y-0.5 hover:shadow-[var(--fm-shadow-lg)]"
              >
                <CardContent className="flex h-full flex-col items-center gap-4 pt-6 text-center">
                  <span className="relative mx-auto grid h-[4.6rem] w-[4.6rem] place-items-center rounded-full">
                    <span
                      aria-hidden
                      className="absolute inset-0 rounded-full border-2 border-[#2aa3d9]/35 bg-white/80 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.7)]"
                    />
                    <span
                      aria-hidden
                      className="absolute inset-[0.34rem] rounded-full bg-gradient-to-b from-[#edf8ff] to-[#dceefd]"
                    />
                    <Icon className={`relative block h-9 w-9 text-[#0f8fc8] ${iconOpticalShiftClass}`} />
                  </span>
                  <CardTitle className="text-[1.55rem] leading-tight">{item.title}</CardTitle>
                  <p className="m-0 text-sm leading-7 text-[var(--fm-text-muted)]">{item.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </Container>
    </section>
  );
}

import { LockKeyhole, ShieldCheck, UsersRound } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import type { SiteDictionary } from "@/lib/i18n/types";

const ICONS = [ShieldCheck, LockKeyhole, UsersRound] as const;

export function ValuePropsSection({ dict }: { dict: SiteDictionary }) {
  return (
    <section className="relative z-20 -mt-12 md:-mt-16">
      <Container>
        <h2 className="sr-only">{dict.home.valueProps.title}</h2>
        <div className="grid gap-4 md:grid-cols-3 md:gap-5">
          {dict.home.valueProps.items.map((item, index) => {
            const Icon = ICONS[index] ?? ShieldCheck;
            return (
              <Card
                key={item.title}
                className="h-full border-[var(--fm-border)] bg-white/95 shadow-[var(--fm-shadow-md)] transition hover:-translate-y-0.5 hover:shadow-[var(--fm-shadow-lg)]"
              >
                <CardContent className="flex h-full flex-col gap-3 pt-6">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[var(--fm-surface-muted)] text-[var(--fm-trust-blue)]">
                    <Icon className="h-5 w-5" />
                  </span>
                  <CardTitle className="text-lg">{item.title}</CardTitle>
                  <p className="m-0 text-sm leading-6 text-[var(--fm-text-muted)]">{item.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </Container>
    </section>
  );
}

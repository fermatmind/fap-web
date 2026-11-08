import Image from "next/image";
import type { DisplayLocale } from "@/lib/i18n/locales";
import copy from "@/lib/i18n/zh-TW/about-team.source.json";
import generated from "@/lib/i18n/zh-TW/chiikawa.generated.json";

function text(value: { zh: string; en: string }, context: string, locale: DisplayLocale): string {
  if (locale !== "zh-TW") return value[locale];
  const unit = (generated.units as Record<string, { text: string }>)[`lib/i18n/zh-TW/about-team.source.json${context}`];
  if (!unit) throw new Error(`Missing Traditional team text: ${context}`);
  return unit.text;
}

export function AboutTeamSection({ locale }: { locale: DisplayLocale }) {
  const roles = copy.roles.map((value, index) => text(value, `/roles/${index}`, locale));
  const names = copy.names.map((value, index) => text(value, `/names/${index}`, locale));
  const backgrounds = copy.backgrounds.map((value, index) => text(value, `/backgrounds/${index}`, locale));

  return (
    <section aria-labelledby="team" className="pt-7" data-testid="about-team-section">
      <h2 id="team" className="m-0 scroll-mt-24 font-serif text-2xl font-semibold text-[var(--fm-text)] md:text-3xl">
        {text(copy.heading, "/heading", locale)}
      </h2>
      <div className="mt-6 grid gap-5 md:grid-cols-2">
        {roles.map((role, index) => (
          <article
            key={`${role}-${index}`}
            className={`flex flex-col gap-6 rounded-xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-6 ${index === 0 ? "sm:flex-row sm:items-center md:col-span-2" : ""}`}
          >
            {index === 0 && (
              <Image
                src="/images/team/liu-fuwei.jpg"
                alt={text(copy.portraitAlt, "/portraitAlt", locale)}
                width={689}
                height={886}
                sizes="112px"
                className="h-36 w-28 shrink-0 rounded-xl object-cover"
              />
            )}
            <div className="flex min-w-0 flex-col gap-3">
              <div className="flex flex-col gap-2">
                <h3 className="m-0 text-xl font-semibold text-[var(--fm-text)]">
                  {names[index]}
                </h3>
                <p className="m-0 text-sm font-medium text-[#008aa3]">{role}</p>
              </div>
              <p className="m-0 text-sm leading-7 text-[var(--fm-text-muted)]">
                {backgrounds[index]}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

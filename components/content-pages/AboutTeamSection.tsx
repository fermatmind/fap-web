import { UserRound } from "lucide-react";
import type { Locale } from "@/lib/i18n/locales";

export function AboutTeamSection({ locale }: { locale: Locale }) {
  const isZh = locale === "zh";
  const roles = isZh ? ["创始人", "博士顾问", "博士顾问"] : ["Founder", "Doctoral advisor", "Doctoral advisor"];
  const names = isZh ? ["刘福威", "贾睿璇", "姓名待补充"] : ["Liu Fuwei", "Jia Ruixuan", "Name to follow"];

  return (
    <section aria-labelledby="team" className="pt-7" data-testid="about-team-section">
      <h2 id="team" className="m-0 scroll-mt-28 font-serif text-2xl font-semibold text-[var(--fm-text)] md:text-3xl">
        {isZh ? "创始人与博士顾问团队" : "Founder and doctoral advisors"}
      </h2>
      <div className="mt-6 grid gap-5 md:grid-cols-2">
        {roles.map((role, index) => (
          <article
            key={`${role}-${index}`}
            className={`flex gap-5 rounded-xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-6 ${index === 0 ? "flex-col sm:flex-row md:col-span-2" : "flex-col"}`}
          >
            <div className="grid h-20 w-20 shrink-0 place-items-center rounded-full bg-[var(--fm-bg-soft)] text-[var(--fm-text-muted)]" aria-hidden>
              <UserRound className="h-9 w-9" strokeWidth={1.5} />
            </div>
            <div className="flex flex-col gap-3">
              <p className="m-0 text-sm font-medium text-[#008aa3]">{role}</p>
              <h3 className="m-0 text-xl font-semibold text-[var(--fm-text)]">
                {names[index]}
              </h3>
              <p className="m-0 text-sm leading-7 text-[var(--fm-text-muted)]">
                {isZh ? "个人背景与参与工作介绍待补充。" : "Background and contributions to follow."}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

import Image from "next/image";
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
            className={`flex flex-col gap-6 rounded-xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-6 ${index === 0 ? "sm:flex-row sm:items-center md:col-span-2" : ""}`}
          >
            {index === 0 && (
              <Image
                src="/images/team/liu-fuwei.jpg"
                alt={isZh ? "刘福威，费马测试创始人" : "Liu Fuwei, founder of FermatMind"}
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
                {isZh ? "个人背景与参与工作介绍待补充。" : "Background and contributions to follow."}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

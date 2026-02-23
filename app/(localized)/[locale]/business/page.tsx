import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { resolveLocale } from "@/lib/i18n/getDict";
import { localizedPath } from "@/lib/i18n/locales";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: localeParam } = await params;
  const locale = resolveLocale(localeParam);
  const isZh = locale === "zh";

  return {
    title: isZh ? "企业服务" : "Business",
    description: isZh
      ? "面向组织的人才测评与团队画像解决方案。"
      : "Assessment and team profile solutions for organizations.",
    alternates: {
      canonical: localizedPath("/business", locale),
    },
  };
}

export default async function BusinessPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  const locale = resolveLocale(localeParam);
  const isZh = locale === "zh";

  const pillars = [
    {
      title: isZh ? "招聘测评" : "Hiring Assessments",
      body: isZh
        ? "为候选人提供结构化人格与行为测评，辅助岗位匹配。"
        : "Run structured personality and behavior assessments to improve role fit.",
    },
    {
      title: isZh ? "团队画像" : "Team Mapping",
      body: isZh
        ? "将团队成员偏好映射为协作画像，优化沟通与分工。"
        : "Map team preference profiles to improve collaboration and role design.",
    },
    {
      title: isZh ? "发展建议" : "Growth Insights",
      body: isZh
        ? "提供可执行的发展建议与周期性对比追踪。"
        : "Provide actionable growth insights with periodic comparison snapshots.",
    },
  ];

  return (
    <Container as="main" className="space-y-6 py-10">
      <section className="space-y-3 rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-6 shadow-[var(--fm-shadow-md)]">
        <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fm-accent)]">
          {isZh ? "企业入口" : "Business Entry"}
        </p>
        <h1 className="m-0 font-serif text-4xl font-semibold text-[var(--fm-text)]">
          {isZh ? "企业测评解决方案" : "Assessment Solutions for Teams"}
        </h1>
        <p className="m-0 max-w-3xl text-[var(--fm-text-muted)]">
          {isZh
            ? "费马心理为企业与组织提供数据化测评流程，覆盖招聘筛选、团队协作和发展追踪。"
            : "FermatMind provides code-driven assessment workflows for hiring, collaboration, and talent development."}
        </p>
        <div className="pt-1">
          <Link href={localizedPath("/help", locale)}>
            <Button type="button">{isZh ? "联系商务支持" : "Contact Business Support"}</Button>
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {pillars.map((item) => (
          <Card key={item.title} className="h-full border-[var(--fm-border)] bg-[var(--fm-surface)]">
            <CardHeader>
              <CardTitle className="font-serif text-xl text-[var(--fm-text)]">{item.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="m-0 text-sm leading-6 text-[var(--fm-text-muted)]">{item.body}</p>
            </CardContent>
          </Card>
        ))}
      </section>
    </Container>
  );
}

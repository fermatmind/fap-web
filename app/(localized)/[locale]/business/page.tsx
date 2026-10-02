import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { resolveLocale } from "@/lib/i18n/getDict";
import { localizedPath } from "@/lib/i18n/locales";
import { buildPageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: localeParam } = await params;
  const locale = resolveLocale(localeParam);
  const isZh = locale === "zh";
  const pathname = isZh ? "/zh/business" : "/en/business";

  return buildPageMetadata({
    locale,
    pathname,
    title: isZh ? "企业服务" : "Business",
    description: isZh
      ? "面向组织的人才测评与团队画像解决方案。"
      : "Assessment and team profile solutions for organizations.",
    alternatesByLocale: {
      en: "/en/business",
      zh: "/zh/business",
      xDefault: "/",
    },
  });
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
      title: isZh ? "组织使用边界" : "Organizational Use Boundaries",
      body: isZh
        ? "人格与兴趣结果不能替代能力、工作样本和实际岗位证据，也不能作为筛选依据。"
        : "Personality and interest results cannot replace ability, work samples or actual job evidence, and must not be used for selection.",
    },
    {
      title: isZh ? "团队画像" : "Team Mapping",
      body: isZh
        ? "可围绕成员自愿分享的沟通偏好讨论具体协作问题，不由类型或分数决定分工。"
        : "Discuss specific collaboration questions using preferences that people choose to share; types and scores do not determine roles.",
    },
    {
      title: isZh ? "发展建议" : "Growth Insights",
      body: isZh
        ? "围绕个人选择的目标记录具体行动与反馈，不把跨次分数变化解释为能力提升或干预成效。"
        : "Record actions and feedback around a personally chosen goal; score changes across assessments do not establish ability gains or intervention effects.",
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
            ? "了解组织中的自我观察与沟通探索需求。测评内容不用于招聘筛选、录用、晋升或岗位适配判断；具体可提供的服务范围请联系支持确认。"
            : "Explore needs for voluntary self-reflection and workplace conversations. Assessment content is not used for hiring selection, promotion or role-fit judgments; contact support to confirm available services."}
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

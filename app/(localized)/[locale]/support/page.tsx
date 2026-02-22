import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDictSync, resolveLocale } from "@/lib/i18n/getDict";
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
    title: isZh ? "支持" : "Support",
    description: isZh ? "订单、交付和政策相关帮助。" : "Get help for orders, delivery, and policy questions.",
    alternates: {
      canonical: localizedPath("/support", locale),
    },
  };
}

export default async function SupportPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  const locale = resolveLocale(localeParam);
  const dict = getDictSync(locale);
  const isZh = locale === "zh";
  const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@fermatmind.com";
  const withLocale = (path: string) => localizedPath(path, locale);

  return (
    <Container as="main" className="max-w-4xl space-y-6 py-10">
      <section className="space-y-3 rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-5 shadow-[var(--fm-shadow-sm)]">
        <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fm-accent)]">
          {isZh ? "支持中心" : "Support Center"}
        </p>
        <h1 className="m-0 font-serif text-3xl font-semibold text-[var(--fm-text)]">{dict.support.title}</h1>
        <p className="m-0 text-[var(--fm-text-muted)]">
          {dict.support.emailHint}
        </p>
      </section>

      <Card className="border-[var(--fm-border)] bg-[var(--fm-surface)]">
        <CardHeader className="space-y-2">
          <CardTitle className="font-serif text-[var(--fm-text)]">{dict.support.quickActions}</CardTitle>
          <p className="m-0 text-sm text-[var(--fm-text-muted)]">
            {isZh ? "优先使用以下入口自助处理常见问题。" : "Use these shortcuts first for common support tasks."}
          </p>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Link href={withLocale("/orders/lookup")}>
            <Button type="button">{dict.support.lookup}</Button>
          </Link>
          <Link href={withLocale("/refund")}>
            <Button type="button" variant="outline">
              {isZh ? "退款政策" : "Refund policy"}
            </Button>
          </Link>
          <Link href={withLocale("/privacy")}>
            <Button type="button" variant="secondary">
              {isZh ? "隐私政策" : "Privacy policy"}
            </Button>
          </Link>
        </CardContent>
      </Card>

      <Card className="border-[var(--fm-border)] bg-[var(--fm-surface)]">
        <CardHeader className="space-y-2">
          <CardTitle className="font-serif text-[var(--fm-text)]">{dict.support.contact}</CardTitle>
          <p className="m-0 text-sm text-[var(--fm-text-muted)]">
            {isZh ? "如需人工处理，请发送邮件并附上订单号。" : "If you need manual support, include your order number in email."}
          </p>
        </CardHeader>
        <CardContent>
          <p className="m-0 text-sm text-[var(--fm-text-muted)]">
            {isZh ? "请附上订单号发送邮件至 " : "Email us with your order number at "}
            <a className="font-semibold text-[var(--fm-accent)] hover:text-[var(--fm-accent-strong)]" href={`mailto:${supportEmail}`}>
              {supportEmail}
            </a>.
          </p>
        </CardContent>
      </Card>
    </Container>
  );
}

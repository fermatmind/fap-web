import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDictSync, resolveLocale } from "@/lib/i18n/getDict";
import { localizedPath } from "@/lib/i18n/locales";

export const metadata: Metadata = {
  title: "Support",
  description: "Get help for orders, delivery, and policy questions.",
  alternates: {
    canonical: "/support",
  },
};

export default async function SupportPage() {
  const localeHeaders = await headers();
  const locale = resolveLocale(localeHeaders.get("x-locale"));
  const dict = getDictSync(locale);
  const isZh = locale === "zh";
  const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@fermatmind.com";
  const withLocale = (path: string) => localizedPath(path, locale);

  return (
    <Container as="main" className="max-w-3xl space-y-6 py-10">
      <section className="space-y-2">
        <h1 className="m-0 text-3xl font-bold text-slate-900">{dict.support.title}</h1>
        <p className="m-0 text-slate-600">
          {dict.support.emailHint}
        </p>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>{dict.support.quickActions}</CardTitle>
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

      <Card>
        <CardHeader>
          <CardTitle>{dict.support.contact}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="m-0 text-sm text-slate-700">
            {isZh ? "请附上订单号发送邮件至 " : "Email us with your order number at "}
            <a href={`mailto:${supportEmail}`}>{supportEmail}</a>.
          </p>
        </CardContent>
      </Card>
    </Container>
  );
}

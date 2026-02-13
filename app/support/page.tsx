import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDictionarySync, resolveLocale } from "@/lib/i18n/getDictionary";
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
  const dict = getDictionarySync(locale);
  const withLocale = (path: string) => localizedPath(path, locale);

  return (
    <Container as="main" className="max-w-3xl space-y-6 py-10">
      <section className="space-y-2">
        <h1 className="m-0 text-3xl font-bold text-slate-900">{dict.support.title}</h1>
        <p className="m-0 text-slate-600">
          Need help with your order or report delivery? Start with self-service options below.
        </p>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Quick actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Link href={withLocale("/orders/lookup")}>
            <Button type="button">{dict.support.lookup}</Button>
          </Link>
          <Link href={withLocale("/refund")}>
            <Button type="button" variant="outline">
              Refund policy
            </Button>
          </Link>
          <Link href={withLocale("/privacy")}>
            <Button type="button" variant="secondary">
              Privacy policy
            </Button>
          </Link>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contact</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="m-0 text-sm text-slate-700">
            Email us at <a href="mailto:support@example.com">support@example.com</a> with your order number.
          </p>
        </CardContent>
      </Card>
    </Container>
  );
}

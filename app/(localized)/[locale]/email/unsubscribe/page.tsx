import type { Metadata } from "next";
import { EmailUnsubscribeClient } from "@/components/email/EmailUnsubscribeClient";
import { Container } from "@/components/layout/Container";
import { getDictSync, resolveLocale } from "@/lib/i18n/getDict";
import { localizedPath } from "@/lib/i18n/locales";
import { buildPageMetadata } from "@/lib/seo/metadata";

function firstValue(value: string | string[] | undefined): string {
  if (!value) {
    return "";
  }

  return Array.isArray(value) ? String(value[0] ?? "") : String(value);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: localeParam } = await params;
  const locale = resolveLocale(localeParam);
  const dict = getDictSync(locale);
  const pathname = localizedPath("/email/unsubscribe", locale);

  return buildPageMetadata({
    locale,
    pathname,
    title: dict.email.unsubscribe.metadataTitle,
    description: dict.email.unsubscribe.metadataDescription,
    noindex: true,
    alternatesByLocale: {
      en: "/en/email/unsubscribe",
      zh: "/zh/email/unsubscribe",
      xDefault: "/",
    },
  });
}

export default async function EmailUnsubscribePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale: localeParam } = await params;
  const query = await searchParams;
  const locale = resolveLocale(localeParam);
  const dict = getDictSync(locale);
  const token = firstValue(query.token).trim();

  return (
    <Container as="main" className="max-w-3xl py-10">
      <EmailUnsubscribeClient locale={locale} token={token} dict={dict} />
    </Container>
  );
}

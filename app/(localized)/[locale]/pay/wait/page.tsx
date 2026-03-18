import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getDictSync, resolveLocale } from "@/lib/i18n/getDict";
import { localizedPath } from "@/lib/i18n/locales";
import { NOINDEX_ROBOTS } from "@/lib/seo/noindex";
import OrdersClient from "../../orders/[orderNo]/OrdersClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function firstValue(value: string | string[] | undefined): string {
  if (!value) return "";
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

  return {
    title: dict.orders.title,
    robots: NOINDEX_ROBOTS,
    alternates: {
      canonical: localizedPath("/pay/wait", locale),
    },
  };
}

export default async function PayWaitPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale: localeParam } = await params;
  const locale = resolveLocale(localeParam);
  const query = await searchParams;
  const orderNo = firstValue(query.order_no) || firstValue(query.orderNo);
  const paymentRecoveryToken =
    firstValue(query.payment_recovery_token) || firstValue(query.paymentRecoveryToken) || null;

  if (!orderNo) {
    redirect(localizedPath("/orders/lookup", locale));
  }

  return <OrdersClient orderNo={orderNo} paymentRecoveryToken={paymentRecoveryToken} />;
}

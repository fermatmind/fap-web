import type { Metadata } from "next";
import { getDictSync, resolveLocale } from "@/lib/i18n/getDict";
import { localizedPath } from "@/lib/i18n/locales";
import { NOINDEX_ROBOTS } from "@/lib/seo/noindex";
import OrdersClient from "./OrdersClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; orderNo: string }>;
}): Promise<Metadata> {
  const { locale: localeParam, orderNo } = await params;
  const locale = resolveLocale(localeParam);
  const dict = getDictSync(locale);

  return {
    title: dict.orders.title,
    robots: NOINDEX_ROBOTS,
    alternates: {
      canonical: localizedPath(`/orders/${orderNo}`, locale),
    },
  };
}

export default async function OrderPage({
  params,
}: {
  params: Promise<{ locale: string; orderNo: string }>;
}) {
  const { orderNo } = await params;
  return <OrdersClient orderNo={orderNo} />;
}

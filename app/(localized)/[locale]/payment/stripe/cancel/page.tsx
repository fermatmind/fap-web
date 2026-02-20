import { redirect } from "next/navigation";
import { resolveLocale } from "@/lib/i18n/getDict";
import { localizedPath } from "@/lib/i18n/locales";

function firstValue(value: string | string[] | undefined): string {
  if (!value) return "";
  return Array.isArray(value) ? String(value[0] ?? "") : String(value);
}

export default async function StripeCancelPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale: localeParam } = await params;
  const query = await searchParams;
  const orderNo = firstValue(query.order_no) || firstValue(query.orderNo);
  const locale = resolveLocale(localeParam);

  if (orderNo) {
    redirect(localizedPath(`/orders/${orderNo}`, locale));
  }

  redirect(localizedPath("/orders/lookup", locale));
}

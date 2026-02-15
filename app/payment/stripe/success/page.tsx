import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { resolveLocale } from "@/lib/i18n/getDict";
import { localizedPath } from "@/lib/i18n/locales";

function firstValue(value: string | string[] | undefined): string {
  if (!value) return "";
  return Array.isArray(value) ? String(value[0] ?? "") : String(value);
}

export default async function StripeSuccessPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const orderNo = firstValue(params.order_no) || firstValue(params.orderNo);
  const requestHeaders = await headers();
  const locale = resolveLocale(requestHeaders.get("x-locale"));

  if (orderNo) {
    redirect(localizedPath(`/orders/${orderNo}`, locale));
  }

  redirect(localizedPath("/orders/lookup", locale));
}

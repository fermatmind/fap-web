import Link from "next/link";
import { redirect } from "next/navigation";
import { resolveLocale } from "@/lib/i18n/getDict";
import { localizedPath } from "@/lib/i18n/locales";

function firstValue(value: string | string[] | undefined): string {
  if (!value) return "";
  return Array.isArray(value) ? String(value[0] ?? "") : String(value);
}

export default async function StripeSuccessPage({
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

  const ordersLookupHref = localizedPath("/orders/lookup", locale);
  const isZh = locale === "zh";

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10">
      <h1 className="m-0 text-2xl font-bold text-slate-900">{isZh ? "支付已完成" : "Payment Completed"}</h1>
      <p className="mt-3 text-slate-600">
        {isZh ? "我们正在同步订单状态。你可以前往订单查询页查看最新结果。" : "We're syncing your order status. You can check the latest status on the order lookup page."}
      </p>
      <Link
        href={ordersLookupHref}
        className="mt-5 inline-flex rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-500"
      >
        {isZh ? "前往订单查询" : "Go to order lookup"}
      </Link>
    </main>
  );
}

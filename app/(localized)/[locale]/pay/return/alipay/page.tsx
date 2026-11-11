import type { Metadata } from "next";
import Link from "next/link";
import { OrderReturnFallbackClient } from "@/components/commerce/OrderReturnFallbackClient";
import { resolveLocale } from "@/lib/i18n/getDict";
import { localizedPath } from "@/lib/i18n/locales";
import { NOINDEX_ROBOTS } from "@/lib/seo/noindex";

export const metadata: Metadata = {
  robots: NOINDEX_ROBOTS,
};

function firstValue(value: string | string[] | undefined): string {
  if (!value) return "";
  return Array.isArray(value) ? String(value[0] ?? "") : String(value);
}

export default async function AlipayReturnPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale: localeParam } = await params;
  const query = await searchParams;
  const locale = resolveLocale(localeParam);
  const orderNo = firstValue(query.order_no) || firstValue(query.orderNo) || null;
  const outTradeNo = firstValue(query.out_trade_no) || firstValue(query.outTradeNo) || null;
  const paymentRecoveryToken =
    firstValue(query.payment_recovery_token) || firstValue(query.paymentRecoveryToken) || null;
  const waitUrl = firstValue(query.wait_url) || firstValue(query.waitUrl) || null;
  const returnParams = Object.fromEntries(
    Object.entries(query).map(([key, value]) => [key, firstValue(value) || null])
  );
  const ordersLookupHref = localeParam === "zh-TW" ? "/zh-TW/orders/lookup" : localizedPath("/orders/lookup", locale);
  const isZh = locale === "zh";
  const isTraditional = localeParam === "zh-TW";

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10">
      <OrderReturnFallbackClient
        locale={isTraditional ? "zh-TW" : locale}
        orderNo={orderNo}
        outTradeNo={outTradeNo}
        paymentRecoveryToken={paymentRecoveryToken}
        waitUrl={waitUrl}
        returnParams={returnParams}
      />
      <h1 className="m-0 text-2xl font-bold text-slate-900">{isTraditional ? "正在恢復付款狀態" : isZh ? "正在恢复支付状态" : "Restoring your payment"}</h1>
      <p className="mt-3 text-slate-600">
        {isTraditional ? "即將返回站內付款確認頁，繼續同步訂單狀態。" : isZh
          ? "我们会将你带回站内支付等待页，继续同步订单状态。"
          : "We'll take you back to the in-app payment wait flow and continue syncing your order."}
      </p>
      <Link
        href={ordersLookupHref}
        className="mt-5 inline-flex rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-500"
      >
        {isTraditional ? "前往訂單查詢" : isZh ? "前往订单查询" : "Go to order lookup"}
      </Link>
    </main>
  );
}

import type { Metadata } from "next";
import { headers } from "next/headers";
import { Container } from "@/components/layout/Container";
import { OrderLookupForm } from "@/components/support/OrderLookupForm";
import { getDictSync, resolveLocale } from "@/lib/i18n/getDict";
import { localizedPath } from "@/lib/i18n/locales";
import { NOINDEX_ROBOTS } from "@/lib/seo/noindex";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const locale = resolveLocale(requestHeaders.get("x-locale"));

  return {
    title: locale === "zh" ? "订单查询" : "Order Lookup",
    description:
      locale === "zh"
        ? "查询订单并继续查看支付状态。"
        : "Find your order and continue to payment status.",
    robots: NOINDEX_ROBOTS,
    alternates: {
      canonical: localizedPath("/orders/lookup", locale),
    },
  };
}

export default async function OrderLookupPage() {
  const requestHeaders = await headers();
  const locale = resolveLocale(requestHeaders.get("x-locale"));
  const dict = getDictSync(locale);
  const isZh = locale === "zh";

  return (
    <Container as="main" className="max-w-2xl py-10">
      <div className="space-y-2 pb-4">
        <h1 className="m-0 text-2xl font-bold text-slate-900">
          {isZh ? "查询订单" : "Find your order"}
        </h1>
        <p className="m-0 text-sm text-slate-600">
          {isZh ? "输入订单号和购买邮箱继续查询。" : "Enter your order number and purchase email to continue."}
        </p>
      </div>
      <OrderLookupForm locale={locale} dict={dict} />
    </Container>
  );
}

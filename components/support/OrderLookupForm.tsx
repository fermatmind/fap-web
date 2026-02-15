"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { lookupOrder } from "@/lib/api/v0_3";
import type { Locale } from "@/lib/i18n/locales";
import { localizedPath } from "@/lib/i18n/locales";
import { captureError } from "@/lib/observability/sentry";
import type { SiteDictionary } from "@/lib/i18n/types";

const COOLDOWN_MS = 4000;

export function OrderLookupForm({
  locale,
  dict,
}: {
  locale: Locale;
  dict: SiteDictionary;
}) {
  const router = useRouter();
  const [orderNo, setOrderNo] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSubmitAt, setLastSubmitAt] = useState(0);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const now = Date.now();
    if (now - lastSubmitAt < COOLDOWN_MS) {
      setError(locale === "zh" ? "请稍后再试。" : "Please wait a moment before trying again.");
      return;
    }

    setSubmitting(true);
    setError(null);
    setLastSubmitAt(now);

    try {
      const response = await lookupOrder({ orderNo: orderNo.trim(), email: email.trim() });
      const resolvedOrderNo = response.order_no || orderNo.trim();

      if (!resolvedOrderNo) {
        throw new Error(locale === "zh" ? "订单查询失败。" : "Order lookup failed.");
      }

      router.push(localizedPath(`/orders/${resolvedOrderNo}`, locale));
    } catch (cause) {
      setError(
        locale === "zh"
          ? "无法完成订单校验，请检查信息或联系客服。"
          : "We could not verify that request. Please check details or contact support."
      );
      captureError(cause, {
        route: "/orders/lookup",
        orderNo,
        stage: "lookup_order",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{dict.support.lookup}</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-3" onSubmit={onSubmit}>
          <label className="block space-y-1 text-sm text-slate-700">
            <span>{locale === "zh" ? "订单号" : "Order number"}</span>
            <input
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              value={orderNo}
              onChange={(event) => setOrderNo(event.target.value)}
              required
            />
          </label>

          <label className="block space-y-1 text-sm text-slate-700">
            <span>{locale === "zh" ? "购买邮箱" : "Purchase email"}</span>
            <input
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              value={email}
              type="email"
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>

          {error ? <Alert>{error}</Alert> : null}

          <Button type="submit" disabled={submitting}>
            {submitting ? (locale === "zh" ? "查询中..." : "Checking...") : locale === "zh" ? "查询订单" : "Find order"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

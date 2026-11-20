"use client";

import Link from "next/link";
import { CareerRefundPanel } from "@/components/commerce/CareerRefundPanel";
import { useCallback, useEffect, useState } from "react";
import { assembleRiasecResultViewModel } from "@/lib/riasec/resultAssembler";
import { CareerAssessmentResult } from "./CareerAssessmentResult";
import { Career94ReportView } from "./Career94FreeReport";
import { Career94Checkout } from "./Career94Purchase";
import { requestCareer94Result, type Career94Result } from "./career94-api";
import type { Locale } from "./CareerAssessmentForm";

export function Career94SavedResult({ locale, attemptId, reading = false }: { locale: Locale; attemptId: string; reading?: boolean }) {
  const zh = locale === "zh";
  const [result, setResult] = useState<Career94Result>();
  const [error, setError] = useState<"login" | "unavailable">();
  const [retry, setRetry] = useState(0);

  const refreshAfterRefund = useCallback(() => {
    setResult(current => current && current.payment_state !== "refunded" ? { ...current, unlocked: false, premium: undefined, payment_state: "refunded", offers: [] } : current);
  }, []);

  useEffect(() => {
    const abort = new AbortController();
    void requestCareer94Result(`/${attemptId}`, undefined, AbortSignal.any([abort.signal, AbortSignal.timeout(15000)]))
      .then(setResult)
      .catch(err => {
        if (!abort.signal.aborted) setError(err instanceof Error && err.message === "ACCOUNT_REQUIRED" ? "login" : "unavailable");
      });
    return () => abort.abort();
  }, [attemptId, retry]);

  if (!result) {
    if (!error) return <p className="mx-auto max-w-xl p-8" role="status">{zh ? "正在加载职业报告…" : "Loading your career report…"}</p>;
    return <div className="mx-auto max-w-xl space-y-3 p-8">
      <p role="alert">{error === "login" ? (zh ? "请使用购买时的浏览器记录，或登录保存这份结果的账户。" : "Use the browser that saved this result, or sign in to the account that saved it.")
        : (zh ? "这份报告暂时无法读取。请核对登录账户。" : "This report is unavailable. Check which account is signed in.")}</p>
      <Link className="underline" href={`/${locale}/account`} target="_blank" rel="noopener">{zh ? "打开我的账户" : "Open my account"}</Link>
      {" · "}
      <button className="underline" type="button" onClick={() => { setError(undefined); setRetry(retry + 1); }}>{zh ? "重新加载" : "Reload report"}</button>
    </div>;
  }

  if (reading) return <Career94ReportView model={assembleRiasecResultViewModel(result.result, locale)} locale={locale} backHref={`/${locale}/career/assessment/result/${attemptId}`} />;

  return <>
    {result.order_no && <CareerRefundPanel orderNo={result.order_no} locale={locale} onRefunded={refreshAfterRefund} />}
    <CareerAssessmentResult
    model={assembleRiasecResultViewModel(result.result, locale)}
    locale={locale}
    premium={result.unlocked ? result.premium : undefined}
    purchase={result.order_no && !result.unlocked && result.payment_state !== "canceled" ? (
      <p role="status">{result.payment_state === "refunded" ? (zh ? "此订单已退款。" : "This order was refunded.")
        : (zh ? "此报告已有订单。" : "There is an existing order for this report.")}{" "}
        <Link className="underline" href={`/${locale}/pay/wait?order_no=${encodeURIComponent(result.order_no)}`}>{zh ? "查看订单" : "View order"}</Link>
      </p>
    ) : result.offers.length > 0 && <Career94Checkout locale={locale} attemptId={attemptId} offers={result.offers} />}
  />
  </>;
}

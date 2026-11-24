"use client";

import Link from "next/link";
import { type ReactNode, useRef } from "react";
import type { ResultResponse, ReportResponse, RiasecPurchase } from "@/lib/api/v0_3";
import type { DisplayLocale } from "@/lib/i18n/locales";
import { assembleRiasecResultViewModel } from "@/lib/riasec/resultAssembler";
import { UnlockReportExperience } from "@/components/career/UnlockReportExperience";
import { Career94Checkout } from "@/app/(localized)/[locale]/career/assessment/Career94Purchase";
import { MobileReportPurchaseEntry, selectReportPurchaseOffer } from "@/components/commerce/MobileReportPurchaseEntry";
import { useReportPurchaseObservation } from "@/hooks/useReportPurchaseObservation";
import { RiasecReadingReport } from "./RiasecReadingReport";

export function RiasecPaidResult({ data, purchase, locale, pdfAction }: { data: ResultResponse | ReportResponse; purchase: RiasecPurchase; locale: DisplayLocale; pdfAction?: ReactNode }) {
  const sourceLocale = locale === "en" ? "en" : "zh";
  const t = (zh: string, tw: string, en: string) => locale === "en" ? en : locale === "zh-TW" ? tw : zh;
  const model = assembleRiasecResultViewModel(data, sourceLocale);
  const unlocked = purchase.unlocked;
  const existing = purchase.order_no && purchase.payment_state !== "canceled";
  const root = useRef<HTMLDivElement>(null);
  const offer = selectReportPurchaseOffer(purchase.offers, locale);
  const canPurchase = !unlocked && !existing && Boolean(offer);
  const observe = useReportPurchaseObservation(root, purchase.attempt_id, canPurchase ? data.result_visibility_receipt : null);
  return <div data-result-visible-root ref={root}>
    {unlocked ? <div className="mx-auto max-w-7xl px-4 pb-12"><RiasecReadingReport viewModel={model} locale={sourceLocale} displayLocale={locale}
      actions={pdfAction ?? <button type="button" onClick={() => window.print()}>{t("打印或保存 PDF", "列印或儲存 PDF", "Print or save PDF")}</button>} /></div>
      : <UnlockReportExperience model={model} locale={locale}
        mobilePurchase={canPurchase && offer ? <MobileReportPurchaseEntry offer={offer} locale={locale} onClick={() => observe("entry_clicked")} /> : undefined}
        sampleHref={`/${locale}/reports/samples/holland`}
        purchase={existing ? <p role="status">{purchase.payment_state === "refunded" ? t("此订单已退款。", "此訂單已退款。", "This order was refunded.") : t("此报告已有订单。", "此報告已有訂單。", "This report has an existing order.")}{" "}<Link className="underline" href={`/${locale}/pay/wait?order_no=${encodeURIComponent(purchase.order_no!)}`}>{t("查看订单", "查看訂單", "View order")}</Link></p>
          : <Career94Checkout locale={sourceLocale} displayLocale={locale} attemptId={purchase.attempt_id} offers={purchase.offers} onPaymentClick={() => observe("payment_clicked")} />} />}
  </div>;
}

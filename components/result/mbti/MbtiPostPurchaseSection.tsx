"use client";

import Link from "next/link";
import { AttemptPdfDownloadButton } from "@/components/commerce/AttemptPdfDownloadButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { trackEvent } from "@/lib/analytics";
import type { Locale } from "@/lib/i18n/locales";

export function MbtiPostPurchaseSection({
  locale,
  attemptId,
  historyHref,
  orderLookupHref,
}: {
  locale: Locale;
  attemptId: string;
  historyHref: string;
  orderLookupHref: string;
}) {
  const isZh = locale === "zh";

  return (
    <Card
      data-testid="mbti-post-purchase-section"
      className="border-emerald-200 bg-gradient-to-br from-white via-emerald-50/75 to-sky-50 shadow-[0_20px_48px_rgba(15,23,42,0.08)]"
    >
      <CardHeader className="space-y-2 pb-4">
        <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">
          {isZh ? "正式留存入口" : "Post-purchase access"}
        </p>
        <CardTitle className="text-2xl text-slate-950">{isZh ? "已解锁完整报告" : "Full report unlocked"}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="m-0 text-sm leading-7 text-slate-600">
          {isZh
            ? "你的完整报告已可再次查看与下载。后续进入、PDF 交付与订单找回都从这里处理。"
            : "Your full report is ready to revisit and download. Use this section for re-entry, PDF delivery, and order recovery."}
        </p>
        <div className="grid gap-3 md:grid-cols-3">
          <AttemptPdfDownloadButton
            attemptId={attemptId}
            locale={locale}
            label={isZh ? "下载 PDF" : "Download PDF"}
            loadingLabel={isZh ? "正在下载 PDF..." : "Downloading PDF..."}
            errorMessage={isZh ? "PDF 下载失败，请稍后重试。" : "Failed to download the PDF. Please try again."}
            filenamePrefix="mbti-report"
            pdfVariant="mbti_result_post_purchase"
            buttonClassName="w-full"
            testId="mbti-post-purchase-download"
          />
          <Link
            href={historyHref}
            className={buttonVariants({ className: "w-full" })}
            data-testid="mbti-post-purchase-history"
            onClick={() => {
              trackEvent("ui_card_interaction", {
                slug: "mbti-result-shell",
                scale_code: "MBTI",
                visual_kind: "post_purchase_history_entry",
                interaction: "click",
                locale,
              });
            }}
          >
            {isZh ? "我的 MBTI 报告" : "My MBTI reports"}
          </Link>
          <Link
            href={orderLookupHref}
            className={buttonVariants({ variant: "outline", className: "w-full" })}
            data-testid="mbti-post-purchase-order-lookup"
          >
            {isZh ? "订单找回" : "Order lookup"}
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

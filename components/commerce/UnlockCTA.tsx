"use client";

import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { getDictSync } from "@/lib/i18n/getDict";
import { getLocaleFromPathname } from "@/lib/i18n/locales";
import { cn } from "@/lib/utils";

type UnlockCTAProps = {
  attemptId?: string;
  sku?: string;
  orderNo?: string;
  amount?: number | string;
  currency?: string;
  formattedPrice?: string;
  buttonLabel?: string;
  loading?: boolean;
  error?: string | null;
  onPay: () => void | Promise<void>;
  className?: string;
};

function formatPrice({ amount, currency, formattedPrice }: Pick<UnlockCTAProps, "amount" | "currency" | "formattedPrice">) {
  if (formattedPrice) return formattedPrice;
  if (amount === undefined || amount === null) return "Price unavailable";

  if (currency) {
    return `${String(amount)} ${currency}`;
  }

  return String(amount);
}

export function UnlockCTA({
  attemptId,
  sku,
  orderNo,
  amount,
  currency,
  formattedPrice,
  buttonLabel,
  loading = false,
  error,
  onPay,
  className,
}: UnlockCTAProps) {
  const pathname = usePathname() ?? "/";
  const locale = getLocaleFromPathname(pathname);
  const dict = getDictSync(locale);

  return (
    <Card className={cn("w-full max-w-md border-slate-300 shadow-lg", className)}>
      <CardHeader className="space-y-2 pb-4">
        <CardTitle className="text-xl text-slate-900">{dict.commerce.unlock_title}</CardTitle>
        <p className="m-0 text-sm text-slate-600">
          {dict.commerce.unlock_subtitle}
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
          <p className="m-0 text-xs uppercase tracking-wide text-slate-500">{dict.commerce.price}</p>
          <p className="m-0 mt-1 text-2xl font-bold text-slate-900">
            {formatPrice({ amount, currency, formattedPrice })}
          </p>
        </div>

        <Button type="button" onClick={onPay} disabled={loading} className="w-full">
          {loading ? (
            <span className="inline-flex items-center gap-2">
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              {dict.commerce.processing}
            </span>
          ) : (
            buttonLabel ?? dict.commerce.unlock_button
          )}
        </Button>

        {error ? <Alert>{error}</Alert> : null}

        <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-600">
          {dict.commerce.trust_badges.map((badge) => (
            <span
              key={badge}
              className="inline-flex items-center gap-1 rounded-full border border-[var(--fm-border)] bg-[var(--fm-surface-muted)] px-2 py-1"
            >
              <svg aria-hidden viewBox="0 0 20 20" className="h-3.5 w-3.5 text-[var(--fm-accent)]" fill="currentColor">
                <path d="M10 2 4 4.5V9c0 4.1 2.6 7.7 6 9 3.4-1.3 6-4.9 6-9V4.5L10 2Zm2.7 6.2-3.1 3.1a1 1 0 0 1-1.4 0L7 10.1a1 1 0 1 1 1.4-1.4l.5.5 2.4-2.4a1 1 0 0 1 1.4 1.4Z" />
              </svg>
              {badge}
            </span>
          ))}
        </div>

        {sku || orderNo || attemptId ? (
          <p className="m-0 text-[11px] text-slate-500">
            {sku ? `SKU: ${sku}` : null}
            {sku && orderNo ? " · " : null}
            {orderNo ? `Order: ${orderNo}` : null}
            {(sku || orderNo) && attemptId ? " · " : null}
            {attemptId ? `Attempt: ${attemptId}` : null}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}

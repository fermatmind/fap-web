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

        <div className="space-y-1 text-xs text-slate-600">
          <p className="m-0">{dict.commerce.secure_payment}</p>
          <p className="m-0">{dict.commerce.guarantee}</p>
          <p className="m-0">{dict.commerce.privacy_first}</p>
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

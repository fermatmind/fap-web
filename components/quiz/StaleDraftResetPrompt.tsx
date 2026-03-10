"use client";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import type { SupportedTakeLocale } from "@/lib/attempt/staleAttempt";

export function StaleDraftResetPrompt({
  locale,
  message,
  onReset,
}: {
  locale: SupportedTakeLocale;
  message: string;
  onReset: () => void;
}) {
  return (
    <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" data-testid="stale-draft-reset-prompt">
      <Alert>{message}</Alert>
      <Button type="button" variant="outline" onClick={onReset}>
        {locale === "zh" ? "清空草稿并重新开始" : "Clear draft and start again"}
      </Button>
    </div>
  );
}

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
      <div className="space-y-1">
        <h2 className="m-0 text-base font-semibold text-slate-900">
          {locale === "zh" ? "草稿已失效" : "Draft expired"}
        </h2>
        <p className="m-0 text-sm text-slate-600">
          {locale === "zh"
            ? "当前本地草稿对应的测评会话已失效，需要清空旧会话后重新开始。"
            : "The active assessment session for this local draft is no longer valid. Clear the stale session and start again."}
        </p>
      </div>
      <Alert>{message}</Alert>
      <Button type="button" variant="outline" onClick={onReset}>
        {locale === "zh" ? "清空草稿并重新开始" : "Clear draft and start again"}
      </Button>
    </div>
  );
}

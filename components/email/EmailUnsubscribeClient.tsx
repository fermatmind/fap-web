"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Alert } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { unsubscribeEmail } from "@/lib/api/v0_3";
import { ApiError } from "@/lib/api-client";
import { localizedPath, type Locale } from "@/lib/i18n/locales";
import type { SiteDictionary } from "@/lib/i18n/types";
import { captureError } from "@/lib/observability/sentry";

type ViewState = "missing" | "confirm" | "success" | "invalid";

function isInvalidTokenError(error: unknown): boolean {
  if (error instanceof ApiError) {
    if ([400, 401, 403, 404, 410, 422].includes(error.status)) {
      return true;
    }

    const text = `${error.errorCode} ${error.message}`.toLowerCase();
    return /token|expired|invalid/.test(text);
  }

  return /token|expired|invalid/.test(String(error).toLowerCase());
}

function normalizeToken(token?: string): string {
  return token?.trim() ?? "";
}

export function EmailUnsubscribeClient({
  locale,
  token,
  dict,
}: {
  locale: Locale;
  token?: string;
  dict: SiteDictionary;
}) {
  const copy = dict.email.unsubscribe;
  const normalizedToken = normalizeToken(token);
  const [viewState, setViewState] = useState<ViewState>(normalizedToken ? "confirm" : "missing");
  const [unsubscribeStatus, setUnsubscribeStatus] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const orderLookupHref = localizedPath("/orders/lookup", locale);
  const helpHref = localizedPath("/help", locale);
  const preferencesHref = useMemo(() => {
    const base = localizedPath("/email/preferences", locale);
    return normalizedToken ? `${base}?token=${encodeURIComponent(normalizedToken)}` : base;
  }, [locale, normalizedToken]);

  useEffect(() => {
    setViewState(normalizedToken ? "confirm" : "missing");
    setUnsubscribeStatus(null);
    setError(null);
  }, [normalizedToken]);

  async function handleConfirm() {
    if (!normalizedToken) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await unsubscribeEmail({
        token: normalizedToken,
        reason: "user_request",
      });
      setUnsubscribeStatus(response.status);
      setViewState("success");
    } catch (cause) {
      captureError(cause, {
        route: "/email/unsubscribe",
        stage: "unsubscribe_email",
      });

      if (isInvalidTokenError(cause)) {
        setViewState("invalid");
      } else {
        setError(copy.submitError);
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (viewState === "missing") {
    return (
      <Card data-testid="email-unsubscribe-missing">
        <CardHeader>
          <CardTitle>{copy.title}</CardTitle>
          <CardDescription>{copy.missingDescription}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <Link href={preferencesHref} className={buttonVariants({ variant: "default" })}>
            {copy.ctas.preferences}
          </Link>
          <Link href={orderLookupHref} className={buttonVariants({ variant: "outline" })}>
            {copy.ctas.orderLookup}
          </Link>
          <Link href={helpHref} className={buttonVariants({ variant: "outline" })}>
            {copy.ctas.help}
          </Link>
        </CardContent>
      </Card>
    );
  }

  if (viewState === "invalid") {
    return (
      <Card data-testid="email-unsubscribe-invalid">
        <CardHeader>
          <CardTitle>{copy.invalidTitle}</CardTitle>
          <CardDescription>{copy.invalidDescription}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <Link href={preferencesHref} className={buttonVariants({ variant: "default" })}>
            {copy.ctas.preferences}
          </Link>
          <Link href={orderLookupHref} className={buttonVariants({ variant: "default" })}>
            {copy.ctas.orderLookup}
          </Link>
          <Link href={helpHref} className={buttonVariants({ variant: "outline" })}>
            {copy.ctas.help}
          </Link>
        </CardContent>
      </Card>
    );
  }

  if (viewState === "success") {
    return (
      <Card data-testid="email-unsubscribe-success">
        <CardHeader>
          <CardTitle>{copy.successTitle}</CardTitle>
          <CardDescription>{copy.successDescription}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface-muted)] px-4 py-3">
            <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--fm-text-muted)]">
              {copy.statusLabel}
            </p>
            <p className="m-0 mt-1 text-sm font-medium text-[var(--fm-text)]" data-testid="email-unsubscribe-status">
              {unsubscribeStatus === "unsubscribed"
                ? copy.statusValues.unsubscribed
                : unsubscribeStatus ?? copy.statusValues.unsubscribed}
            </p>
          </div>
          <ul
            className="m-0 list-disc space-y-1 pl-5 text-sm text-[var(--fm-text-muted)]"
            data-testid="email-unsubscribe-success-next-steps"
          >
            {copy.successNextSteps.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <Link href={preferencesHref} className={buttonVariants({ variant: "outline" })}>
              {copy.backToPreferences}
            </Link>
            <Link href={orderLookupHref} className={buttonVariants({ variant: "default" })}>
              {copy.ctas.orderLookup}
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-testid="email-unsubscribe-confirm">
      <CardHeader>
        <CardTitle>{copy.confirmTitle}</CardTitle>
        <CardDescription>{copy.confirmDescription}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ul
          className="m-0 list-disc space-y-1 pl-5 text-sm text-[var(--fm-text-muted)]"
          data-testid="email-unsubscribe-confirm-effects"
        >
          {copy.confirmEffects.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        {error ? <Alert data-testid="email-unsubscribe-error">{error}</Alert> : null}
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            type="button"
            onClick={() => void handleConfirm()}
            disabled={submitting}
            data-testid="email-unsubscribe-confirm-button"
          >
            {submitting ? copy.confirming : copy.confirm}
          </Button>
          <Link href={preferencesHref} className={buttonVariants({ variant: "outline" })}>
            {copy.backToPreferences}
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

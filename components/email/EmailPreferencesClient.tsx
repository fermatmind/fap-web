"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { Alert } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getEmailPreferences,
  updateEmailPreferences,
  type EmailPreferences,
} from "@/lib/api/v0_3";
import { ApiError } from "@/lib/api-client";
import { localizedPath, type Locale } from "@/lib/i18n/locales";
import type { SiteDictionary } from "@/lib/i18n/types";
import { captureError } from "@/lib/observability/sentry";

type ViewState = "missing" | "loading" | "ready" | "invalid";

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

export function EmailPreferencesClient({
  locale,
  token,
  dict,
}: {
  locale: Locale;
  token?: string;
  dict: SiteDictionary;
}) {
  const copy = dict.email.preferences;
  const normalizedToken = normalizeToken(token);
  const [viewState, setViewState] = useState<ViewState>(normalizedToken ? "loading" : "missing");
  const [emailMasked, setEmailMasked] = useState("");
  const [preferences, setPreferences] = useState<EmailPreferences | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{
    tone: "success" | "error";
    message: string;
  } | null>(null);
  const orderLookupHref = localizedPath("/orders/lookup", locale);
  const helpHref = localizedPath("/help", locale);
  const unsubscribeHref = useMemo(() => {
    const base = localizedPath("/email/unsubscribe", locale);
    return normalizedToken ? `${base}?token=${encodeURIComponent(normalizedToken)}` : base;
  }, [locale, normalizedToken]);

  useEffect(() => {
    if (!normalizedToken) {
      setViewState("missing");
      setEmailMasked("");
      setPreferences(null);
      setFeedback(null);
      return;
    }

    let active = true;
    setViewState("loading");
    setFeedback(null);

    void getEmailPreferences(normalizedToken)
      .then((response) => {
        if (!active) {
          return;
        }

        setEmailMasked(response.email_masked);
        setPreferences(response.preferences);
        setViewState("ready");
      })
      .catch((cause) => {
        if (!active) {
          return;
        }

        captureError(cause, {
          route: "/email/preferences",
          stage: "load_email_preferences",
        });
        setViewState("invalid");
      });

    return () => {
      active = false;
    };
  }, [normalizedToken]);

  function updatePreference(key: keyof EmailPreferences, value: boolean) {
    setPreferences((current) => (current ? { ...current, [key]: value } : current));
    setFeedback(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!preferences || !normalizedToken) {
      return;
    }

    setSubmitting(true);
    setFeedback(null);

    try {
      const response = await updateEmailPreferences({
        token: normalizedToken,
        marketing_updates: preferences.marketing_updates,
        report_recovery: preferences.report_recovery,
        product_updates: preferences.product_updates,
      });

      setPreferences(response.preferences);
      setFeedback({
        tone: "success",
        message: copy.successMessage,
      });
    } catch (cause) {
      captureError(cause, {
        route: "/email/preferences",
        stage: "update_email_preferences",
      });

      if (isInvalidTokenError(cause)) {
        setViewState("invalid");
      } else {
        setFeedback({
          tone: "error",
          message: copy.saveError,
        });
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (viewState === "missing") {
    return (
      <Card data-testid="email-preferences-missing">
        <CardHeader>
          <CardTitle>{copy.title}</CardTitle>
          <CardDescription>{copy.missingDescription}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="m-0 text-sm text-[var(--fm-text-muted)]">{copy.missingRecoveryHint}</p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Link href={orderLookupHref} className={buttonVariants({ variant: "default" })}>
              {copy.ctas.orderLookup}
            </Link>
            <Link href={helpHref} className={buttonVariants({ variant: "outline" })}>
              {copy.ctas.help}
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (viewState === "loading") {
    return (
      <Card data-testid="email-preferences-loading">
        <CardHeader>
          <CardTitle>{copy.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="m-0 text-sm text-[var(--fm-text-muted)]">{copy.loading}</p>
        </CardContent>
      </Card>
    );
  }

  if (viewState === "invalid") {
    return (
      <Card data-testid="email-preferences-invalid">
        <CardHeader>
          <CardTitle>{copy.invalidTitle}</CardTitle>
          <CardDescription>{copy.invalidDescription}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 sm:flex-row">
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

  if (!preferences) {
    return null;
  }

  return (
    <Card data-testid="email-preferences-form">
      <CardHeader>
        <CardTitle>{copy.title}</CardTitle>
        <CardDescription>{copy.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface-muted)] px-4 py-3">
          <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--fm-text-muted)]">
            {copy.emailLabel}
          </p>
          <p className="m-0 mt-1 text-sm font-medium text-[var(--fm-text)]" data-testid="email-preferences-email">
            {emailMasked}
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <fieldset className="space-y-3" disabled={submitting}>
            <label className="flex items-start gap-3 rounded-2xl border border-[var(--fm-border)] px-4 py-3">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4"
                aria-label={copy.fields.marketing_updates.title}
                checked={preferences.marketing_updates}
                data-testid="email-preferences-marketing-updates"
                onChange={(event) => updatePreference("marketing_updates", event.target.checked)}
              />
              <span className="space-y-1">
                <span className="block text-sm font-semibold text-[var(--fm-text)]">
                  {copy.fields.marketing_updates.title}
                </span>
                <span className="block text-sm text-[var(--fm-text-muted)]">
                  {copy.fields.marketing_updates.description}
                </span>
              </span>
            </label>

            <label className="flex items-start gap-3 rounded-2xl border border-[var(--fm-border)] px-4 py-3">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4"
                aria-label={copy.fields.report_recovery.title}
                checked={preferences.report_recovery}
                data-testid="email-preferences-report-recovery"
                onChange={(event) => updatePreference("report_recovery", event.target.checked)}
              />
              <span className="space-y-1">
                <span className="block text-sm font-semibold text-[var(--fm-text)]">
                  {copy.fields.report_recovery.title}
                </span>
                <span className="block text-sm text-[var(--fm-text-muted)]">
                  {copy.fields.report_recovery.description}
                </span>
              </span>
            </label>

            <label className="flex items-start gap-3 rounded-2xl border border-[var(--fm-border)] px-4 py-3">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4"
                aria-label={copy.fields.product_updates.title}
                checked={preferences.product_updates}
                data-testid="email-preferences-product-updates"
                onChange={(event) => updatePreference("product_updates", event.target.checked)}
              />
              <span className="space-y-1">
                <span className="block text-sm font-semibold text-[var(--fm-text)]">
                  {copy.fields.product_updates.title}
                </span>
                <span className="block text-sm text-[var(--fm-text-muted)]">
                  {copy.fields.product_updates.description}
                </span>
              </span>
            </label>
          </fieldset>

          {feedback ? (
            <Alert
              data-testid="email-preferences-feedback"
              className={feedback.tone === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-800" : undefined}
            >
              {feedback.message}
            </Alert>
          ) : null}

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button type="submit" disabled={submitting} data-testid="email-preferences-save">
              {submitting ? copy.saving : copy.save}
            </Button>
            <Link
              href={unsubscribeHref}
              className={buttonVariants({ variant: "outline" })}
              data-testid="email-preferences-unsubscribe-link"
            >
              {copy.unsubscribeCta}
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

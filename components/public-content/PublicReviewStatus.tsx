import type { Locale } from "@/lib/i18n/locales";
import { isHumanReviewCompleted, type PublicReview } from "@/lib/public-content/publicReview";

function formatReviewDate(value: string, locale: Locale | "zh-TW"): string {
  return new Intl.DateTimeFormat(locale === "zh" ? "zh-CN" : locale === "zh-TW" ? locale : "en-US", {
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(new Date(value));
}

export function PublicReviewStatus({
  review,
  locale,
  testId,
}: {
  review: PublicReview | null | undefined;
  locale: Locale | "zh-TW";
  testId?: string;
}) {
  if (!isHumanReviewCompleted(review)) {
    return null;
  }

  return (
    <span data-testid={testId}>
      {locale === "zh-TW" ? "內容審查完成" : locale === "zh" ? "内容审核完成" : "Content review completed"}
      {review?.lastReviewedAt ? ` · ${formatReviewDate(review.lastReviewedAt, locale)}` : null}
    </span>
  );
}

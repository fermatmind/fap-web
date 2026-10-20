import Link from "next/link";
import { localizedPath, type Locale } from "@/lib/i18n/locales";
import { MBTI_ENTRY_TEST_SLUG } from "@/lib/mbti/entryTracking";
import { DEFAULT_MBTI_FORM_CODE, resolveMbtiFormMeta } from "@/lib/mbti/forms";

export function MbtiTestVersionNote({ locale }: { locale: Locale }) {
  const form = resolveMbtiFormMeta(DEFAULT_MBTI_FORM_CODE);

  return (
    <p className="mt-3 text-sm leading-6 text-white/90" data-testid="mbti-personality-version-note">
      {locale === "zh"
        ? `${form.questionCount} 题 · 约 ${form.estimatedMinutes} 分钟。`
        : `${form.questionCount} questions · About ${form.estimatedMinutes} minutes.`}{" "}
      <Link
        href={localizedPath(`/tests/${MBTI_ENTRY_TEST_SLUG}#choose-version`, locale)}
        className="underline underline-offset-4 hover:text-white"
      >
        {locale === "zh" ? "比较 93 题与 144 题版本" : "Compare 93- and 144-question versions"}
      </Link>
    </p>
  );
}

import Link from "next/link";
import { MBTI_ENTRY_TEST_SLUG } from "@/lib/mbti/entryTracking";
import { DEFAULT_MBTI_FORM_CODE, resolveMbtiFormMeta } from "@/lib/mbti/forms";

export function MbtiTestVersionNote() {
  const form = resolveMbtiFormMeta(DEFAULT_MBTI_FORM_CODE);

  return (
    <p className="mt-3 text-sm leading-6 text-white/90" data-testid="mbti-personality-version-note">
      {form.questionCount} questions · About {form.estimatedMinutes} minutes.{' '}
      <Link
        href={`/en/tests/${MBTI_ENTRY_TEST_SLUG}#choose-version`}
        className="underline underline-offset-4 hover:text-white"
      >
        Compare 93- and 144-question versions
      </Link>
    </p>
  );
}

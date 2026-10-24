import { ApiError } from "@/lib/api-client";
import { fetchAttemptSubmission } from "@/lib/api/v0_3";

export function isAmbiguousSubmissionError(error: unknown): boolean {
  return error instanceof TypeError
    || (error instanceof ApiError && (
      error.status === 408 || error.status >= 500
      || error.errorCode === "SUBMISSION_DURABILITY_NOT_CONFIRMED"
    ));
}

export function unconfirmedSubmissionMessage(locale: "en" | "zh"): string {
  return locale === "zh"
    ? "暂未确认提交成功。答案仍保留在当前页面，请重新提交。"
    : "Submission could not be confirmed. Your answers are still on this page. Retry submission.";
}

/** Read back an ambiguous submission without creating or resubmitting an attempt. */
export async function recoverAcceptedSubmission({ error, attemptId, anonId }: {
  error: unknown;
  attemptId: string;
  anonId?: string;
}): Promise<boolean> {
  if (!isAmbiguousSubmissionError(error)) return false;

  try {
    const response = await fetchAttemptSubmission({ attemptId, anonId });
    if (!response.ok || (response.attempt_id && response.attempt_id !== attemptId)) return false;
    return ["pending", "running", "succeeded"].includes(response.submission?.state?.toLowerCase() ?? "");
  } catch {
    // Leave the draft and original error intact when readback cannot confirm receipt.
    return false;
  }
}

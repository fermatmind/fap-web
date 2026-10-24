import { ApiError } from "@/lib/api-client";
import { fetchAttemptSubmission } from "@/lib/api/v0_3";

/** Read back an ambiguous submission without creating or resubmitting an attempt. */
export async function recoverAcceptedSubmission({ error, attemptId, anonId }: {
  error: unknown;
  attemptId: string;
  anonId?: string;
}): Promise<boolean> {
  const ambiguous = error instanceof TypeError
    || (error instanceof ApiError && (
      error.status === 408 || error.status >= 500
      || error.errorCode === "SUBMISSION_DURABILITY_NOT_CONFIRMED"
    ));
  if (!ambiguous) return false;

  try {
    const response = await fetchAttemptSubmission({ attemptId, anonId });
    if (!response.ok || (response.attempt_id && response.attempt_id !== attemptId)) return false;
    return ["pending", "running", "succeeded"].includes(response.submission?.state?.toLowerCase() ?? "");
  } catch {
    // Leave the draft and original error intact when readback cannot confirm receipt.
    return false;
  }
}

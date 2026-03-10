import { afterEach, describe, expect, it } from "vitest";
import { useBig5AttemptStore } from "@/lib/big5/attemptStore";
import { useClinicalAttemptStore } from "@/lib/clinical/attemptStore";
import { createQuizStore } from "@/lib/quiz/store";

afterEach(() => {
  useBig5AttemptStore.getState().resetAll();
  useClinicalAttemptStore.getState().resetAll();
  window.localStorage.clear();
});

describe("take attempt stores", () => {
  it("quiz clearAttemptMeta preserves answers while dropping stale attempt metadata", () => {
    const store = createQuizStore({ slug: "mbti-personality-test-16-personality-types", anonId: "anon-quiz-1" });

    store.getState().setAnswer("q1", "A");
    store.getState().setAnswer("q2", "B");
    store.getState().jump(1, 4);
    store.getState().setAttemptMeta("attempt-stale-quiz", "MBTI");
    store.getState().clearAttemptMeta();

    const state = store.getState().state;
    expect(state.answers).toEqual({ q1: "A", q2: "B" });
    expect(state.currentIndex).toBe(1);
    expect(state.attemptId).toBeNull();
    expect(state.scaleCode).toBeNull();
  });

  it("big5 clearAttemptMeta preserves answers while dropping stale attempt metadata", () => {
    const store = useBig5AttemptStore.getState();

    store.setAnswer("bq1", "1");
    store.setAnswer("bq2", "5");
    store.setCurrentIndex(8);
    store.setAttemptMeta({
      attemptId: "attempt-stale-big5",
      resumeToken: "resume-stale-big5",
      disclaimerVersion: "v1",
      disclaimerHash: "hash-v1",
    });
    store.clearAttemptMeta();

    const next = useBig5AttemptStore.getState();
    expect(next.answers).toEqual({ bq1: "1", bq2: "5" });
    expect(next.currentIndex).toBe(8);
    expect(next.attemptId).toBeNull();
    expect(next.resumeToken).toBeNull();
  });

  it("clinical clearAttemptMeta preserves answers while dropping stale attempt metadata", () => {
    const store = useClinicalAttemptStore.getState();

    store.initSession({
      slug: "sds-self-rating-depression-scale",
      scaleCode: "SDS_20",
      questionIds: ["cq1", "cq2", "cq3"],
    });
    store.setAnswer("cq1", "A");
    store.setAnswer("cq2", "B");
    store.setCurrentIndex(2);
    store.setAttemptId("attempt-stale-clinical");
    store.clearAttemptMeta();

    const next = useClinicalAttemptStore.getState();
    expect(next.answers).toEqual({ cq1: "A", cq2: "B" });
    expect(next.currentIndex).toBe(2);
    expect(next.attemptId).toBeNull();
  });
});

import { afterEach, describe, expect, it, vi } from "vitest";
import { useBig5AttemptStore } from "@/lib/big5/attemptStore";
import { useClinicalAttemptStore } from "@/lib/clinical/attemptStore";
import { createQuizStore, QUIZ_DRAFT_TTL_MS } from "@/lib/quiz/store";

afterEach(() => {
  vi.useRealTimers();
  useBig5AttemptStore.getState().resetAll();
  useClinicalAttemptStore.getState().resetAll();
  window.localStorage.clear();
});

describe("take attempt stores", () => {
  it("quiz clearAttemptMeta preserves answers while dropping stale attempt metadata", () => {
    const store = createQuizStore({
      slug: "mbti-personality-test-16-personality-types",
      anonId: "anon-quiz-1",
      formCode: "mbti_144",
    });

    store.getState().setAnswer("q1", "A");
    store.getState().setAnswer("q2", "B");
    store.getState().jump(1, 4);
    store.getState().setAttemptMeta("attempt-stale-quiz", "MBTI", "mbti_144");
    store.getState().clearAttemptMeta();

    const state = store.getState().state;
    expect(state.answers).toEqual({ q1: "A", q2: "B" });
    expect(state.currentIndex).toBe(1);
    expect(state.attemptId).toBeNull();
    expect(state.scaleCode).toBeNull();
    expect(state.formCode).toBe("mbti_144");
    expect(state.submittedAt).toBeNull();
  });

  it("quiz persistence keeps mbti_93 and mbti_144 drafts isolated", () => {
    const slug = "mbti-personality-test-16-personality-types";
    const anonId = "anon-quiz-2";

    const store144 = createQuizStore({ slug, anonId, formCode: "mbti_144" });
    store144.getState().setAnswer("q1", "A");
    store144.getState().setAttemptMeta("attempt-144", "MBTI", "mbti_144");

    const store93 = createQuizStore({ slug, anonId, formCode: "mbti_93" });
    const state93 = store93.getState().state;
    expect(state93.answers).toEqual({});
    expect(state93.attemptId).toBeNull();
    expect(state93.formCode).toBe("mbti_93");

    const store144Reloaded = createQuizStore({ slug, anonId, formCode: "mbti_144" });
    const state144 = store144Reloaded.getState().state;
    expect(state144.answers).toEqual({ q1: "A" });
    expect(state144.attemptId).toBe("attempt-144");
    expect(state144.formCode).toBe("mbti_144");
  });

  it("quiz store adopts legacy mbti drafts into mbti_144 instead of resetting them", () => {
    const now = Date.now();
    window.localStorage.setItem(
      "fm_quiz_v3_mbti-personality-test-16-personality-types_anon-quiz-legacy",
      JSON.stringify({
        version: 3,
        state: {
          version: 3,
          state: {
            slug: "mbti-personality-test-16-personality-types",
            anonId: "anon-quiz-legacy",
            currentIndex: 1,
            answers: { q1: "A" },
            startedAt: now,
            attemptId: "attempt-legacy",
            scaleCode: "MBTI",
            submittedAt: null,
            lastSavedAt: now,
          },
        },
      })
    );

    const store = createQuizStore({
      slug: "mbti-personality-test-16-personality-types",
      anonId: "anon-quiz-legacy",
      formCode: "mbti_144",
    });
    store.getState().init(
      "mbti-personality-test-16-personality-types",
      ["q1", "q2"],
      "anon-quiz-legacy",
      "mbti_144"
    );

    const state = store.getState().state;
    expect(state.answers).toEqual({ q1: "A" });
    expect(state.attemptId).toBe("attempt-legacy");
    expect(state.formCode).toBe("mbti_144");
  });

  it("quiz draft persistence keeps active drafts within the resume window", () => {
    const now = new Date("2026-01-01T00:00:00.000Z");
    vi.useFakeTimers();
    vi.setSystemTime(now);

    const store = createQuizStore({
      slug: "mbti-personality-test-16-personality-types",
      anonId: "anon-quiz-active",
      formCode: "mbti_144",
    });
    store.getState().setAnswer("q1", "A");
    store.getState().jump(1, 4);

    vi.setSystemTime(now.getTime() + QUIZ_DRAFT_TTL_MS - 1_000);

    const reloaded = createQuizStore({
      slug: "mbti-personality-test-16-personality-types",
      anonId: "anon-quiz-active",
      formCode: "mbti_144",
    });

    expect(reloaded.getState().state.answers).toEqual({ q1: "A" });
    expect(reloaded.getState().state.currentIndex).toBe(1);
  });

  it("quiz draft persistence ignores expired local drafts", () => {
    const now = new Date("2026-01-01T00:00:00.000Z");
    vi.useFakeTimers();
    vi.setSystemTime(now);

    const store = createQuizStore({
      slug: "mbti-personality-test-16-personality-types",
      anonId: "anon-quiz-expired",
      formCode: "mbti_144",
    });
    store.getState().setAnswer("q1", "A");

    vi.setSystemTime(now.getTime() + QUIZ_DRAFT_TTL_MS + 1);

    const reloaded = createQuizStore({
      slug: "mbti-personality-test-16-personality-types",
      anonId: "anon-quiz-expired",
      formCode: "mbti_144",
    });

    expect(reloaded.getState().state.answers).toEqual({});
    expect(reloaded.getState().state.currentIndex).toBe(0);
  });

  it("quiz submission clears sensitive answers from persisted drafts", () => {
    const slug = "mbti-personality-test-16-personality-types";
    const anonId = "anon-quiz-submitted";
    const formCode = "mbti_144";
    const storageKey = `fm_quiz_v4_${slug}_${anonId}_${formCode}`;
    const store = createQuizStore({ slug, anonId, formCode });

    store.getState().setAnswer("q1", "A");
    store.getState().setAttemptMeta("attempt-submitted", "MBTI", formCode);
    store.getState().markSubmitted();

    const persisted = JSON.parse(window.localStorage.getItem(storageKey) ?? "{}") as {
      state?: { state?: Partial<{ answers: Record<string, string>; attemptId: string | null; scaleCode: string | null }> };
    };

    expect(persisted.state?.state?.answers).toEqual({});
    expect(persisted.state?.state?.attemptId).toBeNull();
    expect(persisted.state?.state?.scaleCode).toBeNull();

    const reloaded = createQuizStore({ slug, anonId, formCode });
    expect(reloaded.getState().state.answers).toEqual({});
    expect(reloaded.getState().state.attemptId).toBeNull();
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
    expect(next.disclaimerVersion).toBe("v1");
    expect(next.disclaimerHash).toBe("hash-v1");
  });

  it("big5 persistence keeps big5_120 and big5_90 drafts isolated", () => {
    const slug = "big-five-personality-test-ocean-model";
    const anonId = "anon-big5-isolated";

    useBig5AttemptStore.getState().setSessionContext({
      slug,
      formCode: "big5_120",
      anonId,
    });
    useBig5AttemptStore.getState().setAnswer("q1", "1");
    useBig5AttemptStore.getState().setAttemptMeta({
      attemptId: "attempt-big5-120",
      resumeToken: "resume-big5-120",
    });

    useBig5AttemptStore.getState().setSessionContext({
      slug,
      formCode: "big5_90",
      anonId,
    });
    const state90 = useBig5AttemptStore.getState();
    expect(state90.formCode).toBe("big5_90");
    expect(state90.answers).toEqual({});
    expect(state90.attemptId).toBeNull();

    useBig5AttemptStore.getState().setSessionContext({
      slug,
      formCode: "big5_120",
      anonId,
    });
    const state120 = useBig5AttemptStore.getState();
    expect(state120.formCode).toBe("big5_120");
    expect(state120.answers).toEqual({ q1: "1" });
    expect(state120.attemptId).toBe("attempt-big5-120");
  });

  it("big5 legacy draft only migrates to big5_120 context", () => {
    window.localStorage.setItem(
      "fm_big5_attempt_v1",
      JSON.stringify({
        state: {
          attemptId: "attempt-big5-legacy",
          answers: { q1: "2" },
          currentIndex: 1,
        },
        version: 1,
      })
    );

    const slug = "big-five-personality-test-ocean-model";
    const anonId = "anon-big5-legacy";

    useBig5AttemptStore.getState().setSessionContext({
      slug,
      formCode: "big5_120",
      anonId,
    });
    const adopted120 = useBig5AttemptStore.getState();
    expect(adopted120.formCode).toBe("big5_120");
    expect(adopted120.attemptId).toBe("attempt-big5-legacy");
    expect(adopted120.answers).toEqual({ q1: "2" });

    useBig5AttemptStore.getState().setSessionContext({
      slug,
      formCode: "big5_90",
      anonId,
    });
    const state90 = useBig5AttemptStore.getState();
    expect(state90.formCode).toBe("big5_90");
    expect(state90.attemptId).toBeNull();
    expect(state90.answers).toEqual({});
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
    expect(next.scaleCode).toBe("SDS_20");
    expect(next.slug).toBe("sds-self-rating-depression-scale");
  });
});

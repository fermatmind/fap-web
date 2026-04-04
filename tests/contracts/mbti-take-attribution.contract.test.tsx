import type { ReactNode } from "react";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import QuizTakeClient from "@/app/(localized)/[locale]/tests/[slug]/take/QuizTakeClient";

type ChildrenProps = {
  children?: ReactNode;
};

const hoisted = vi.hoisted(() => ({
  pathname: "/en/tests/mbti-personality-test-16-personality-types/take",
  search: "share_id=share-123&compare_invite_id=invite-456&invite_code=iul_test_001&share_click_id=click-123&entrypoint=share_compare_invite&referrer=https%3A%2F%2Fexample.com%2Fen%2Fshare%2Fshare-123&landing_path=%2Fen%2Fshare%2Fshare-123&utm_source=wechat&utm_medium=organic&utm_campaign=pr07b&utm_term=friends&utm_content=hero&compare_intent=true",
  routerPush: vi.fn(),
  fetchScaleQuestions: vi.fn(),
  startAttempt: vi.fn(),
  submitAttempt: vi.fn(),
  recoverStaleAttemptSubmit: vi.fn(),
  trackEvent: vi.fn(),
  captureError: vi.fn(),
  classifyApiError: vi.fn(() => ({
    statusGroup: "5xx",
    statusCode: 500,
    errorCode: "TEST_ERROR",
  })),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => hoisted.pathname,
  useSearchParams: () => new URLSearchParams(hoisted.search),
  useRouter: () => ({
    push: hoisted.routerPush,
  }),
}));

vi.mock("@/components/quiz/QuizShell", () => ({
  QuizShell: ({ children }: ChildrenProps) => <div>{children}</div>,
}));

vi.mock("@/components/quiz/QuizTakeHeaderV2", () => ({
  QuizTakeHeaderV2: () => <div data-testid="quiz-header">header</div>,
}));

vi.mock("@/components/quiz/iq/IqOptionBoard", () => ({
  IqOptionBoard: () => <div>iq-board</div>,
}));

vi.mock("@/components/quiz/iq/IqStemSvg", () => ({
  IqStemSvg: () => null,
}));

vi.mock("@/components/quiz/immersive/AdaptiveOptionGroup", () => ({
  AdaptiveOptionGroup: ({ onChange }: { onChange: (code: string) => void }) => (
    <button type="button" onClick={() => onChange("OPT_A")}>
      Choose option
    </button>
  ),
}));

vi.mock("@/components/quiz/immersive/ImmersiveTakeLayout", () => ({
  ImmersiveTakeLayout: ({ children, footerSlot, headerSlot }: { children?: ReactNode; footerSlot?: ReactNode; headerSlot?: ReactNode }) => (
    <div>
      {headerSlot}
      {children}
      {footerSlot}
    </div>
  ),
}));

vi.mock("@/components/quiz/immersive/SubmitPhaseOverlay", () => ({
  SubmitPhaseOverlay: () => null,
}));

vi.mock("@/components/quiz/immersive/V2LikertScale", () => ({
  V2LikertScale: ({ onChange }: { onChange: (code: string) => void }) => (
    <button type="button" onClick={() => onChange("OPT_A")}>
      Choose option
    </button>
  ),
}));

vi.mock("@/components/quiz/immersive/useAutoAdvanceFlow", () => ({
  useAutoAdvanceFlow: ({ onLast }: { onLast: (context?: { questionId: string; code: string }) => Promise<string | null> | void }) => ({
    transitionDirection: "forward",
    isTransitioning: false,
    selectAndAdvance: (
      applySelection: () => void,
      context?: { questionId: string; code: string }
    ) => {
      applySelection();
      void onLast(context);
    },
    goPrevious: () => undefined,
    goNext: () => undefined,
    cancelPending: () => undefined,
  }),
}));

vi.mock("@/components/quiz/StaleDraftResetPrompt", () => ({
  StaleDraftResetPrompt: ({ message }: { message: string }) => <div>{message}</div>,
}));

vi.mock("@/lib/anon", () => ({
  getOrCreateAnonId: () => "anon_take_test",
  readPendingAnonLinkAttempts: () => [],
  queuePendingAnonLinkAttempt: () => undefined,
}));

vi.mock("@/lib/auth/authRetry", () => ({
  ensureFmTokenReady: async () => undefined,
  runWithGuestTokenRetry: async ({ runner }: { runner: () => Promise<unknown> }) => runner(),
}));

vi.mock("@/lib/auth/fmToken", () => ({
  isGuestTokenEndpointMissingError: () => false,
  isGuestTokenRequestError: () => false,
  setFmToken: () => undefined,
}));

vi.mock("@/lib/api/v0_3", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api/v0_3")>("@/lib/api/v0_3");

  return {
    ...actual,
    fetchScaleQuestions: hoisted.fetchScaleQuestions,
    startAttempt: hoisted.startAttempt,
    submitAttempt: hoisted.submitAttempt,
    linkAnonAttemptsOnceOnLoginSuccess: vi.fn(),
    shouldLinkAnonAttemptsOnLoginSuccess: vi.fn(() => false),
  };
});

vi.mock("@/lib/analytics", () => ({
  trackEvent: hoisted.trackEvent,
}));

vi.mock("@/lib/i18n/getDict", () => ({
  getDictSync: () => ({
    header: {
      brand: "FAP",
      completedPrefix: "Completed",
      completedSuffix: "",
    },
    common: {
      minutes_unit: "min",
    },
    quiz: {
      estimatedTimeLabel: "Estimated time",
      answerTip: "Pick the option that fits best.",
      milestoneHints: [],
      immersive: {
        backToDetails: "Back to details",
        previous: "Previous",
        submitRetry: "Retry submit",
        noOptions: "No options",
        submitPhases: ["Saving", "Analyzing", "Generating"],
      },
      iq: {
        pickPrompt: "Pick one",
        submit: "Submit",
        next: "Next",
        selectHint: "Select one",
      },
    },
  }),
}));

vi.mock("@/lib/observability/httpError", () => ({
  classifyApiError: hoisted.classifyApiError,
}));

vi.mock("@/lib/observability/sentry", () => ({
  captureError: hoisted.captureError,
}));

vi.mock("@/lib/quiz/normalizeQuestions", () => ({
  normalizeQuizQuestions: () => [
    {
      id: "q1",
      title: "Question 1",
      options: [
        { id: "OPT_A", text: "Option A" },
      ],
    },
  ],
}));

vi.mock("@/lib/quiz/uxFlags", () => ({
  isImmersiveSingleFlowEnabled: () => false,
}));

vi.mock("@/lib/attempt/resolveResultAttemptId", () => ({
  resolveResultAttemptId: (
    response: { attempt_id?: string },
    fallbackAttemptId: string
  ) => response.attempt_id ?? fallbackAttemptId,
}));

vi.mock("@/lib/attempt/staleAttempt", () => ({
  createTakeFlowController: () => ({
    beginRun: () => 1,
    isActive: () => true,
    cancelCurrentRun: () => undefined,
    schedule: (callback: () => void) => {
      callback();
      return 0;
    },
    wait: async () => true,
    dispose: () => undefined,
  }),
  recoverStaleAttemptSubmit: hoisted.recoverStaleAttemptSubmit,
  resolveStaleDraftResetMessage: () => "Draft reset required.",
  shouldBlockInvalidDraftOnTakePage: () => false,
}));

function buildQuestionResponse() {
  return {
    ok: true,
    scale_code: "MBTI",
    questions: {
      items: [
        {
          question_id: "q1",
          order: 1,
          text: "Question 1",
          options: [{ code: "OPT_A", text: "Option A" }],
        },
      ],
    },
  };
}

function renderClient(formCode?: string) {
  return render(
    <QuizTakeClient
      slug="mbti-personality-test-16-personality-types"
      testTitle="MBTI"
      scaleCode="MBTI"
      formCode={formCode}
      estimatedMinutes={8}
      questionCount={1}
    />
  );
}

async function waitForQuestion() {
  await waitFor(() => {
    expect(screen.getByText("Question 1")).toBeInTheDocument();
  });
}

async function submitSingleQuestion() {
  await waitForQuestion();
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "Choose option" }));
  });
}

describe("MBTI take attribution contract", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    hoisted.pathname = "/en/tests/mbti-personality-test-16-personality-types/take";
    hoisted.search = "share_id=share-123&compare_invite_id=invite-456&invite_code=iul_test_001&share_click_id=click-123&entrypoint=share_compare_invite&referrer=https%3A%2F%2Fexample.com%2Fen%2Fshare%2Fshare-123&landing_path=%2Fen%2Fshare%2Fshare-123&utm_source=wechat&utm_medium=organic&utm_campaign=pr07b&utm_term=friends&utm_content=hero&compare_intent=true";
    hoisted.fetchScaleQuestions.mockResolvedValue(buildQuestionResponse());
    hoisted.startAttempt.mockResolvedValue({
      ok: true,
      attempt_id: "attempt-start-123",
      scale_code: "MBTI",
    });
    hoisted.submitAttempt.mockResolvedValue({
      ok: true,
      attempt_id: "attempt-result-123",
    });
    hoisted.recoverStaleAttemptSubmit.mockResolvedValue({
      kind: "not_recoverable",
    });
  });

  it("reads attribution from query and attaches it to startAttempt", async () => {
    renderClient();

    await waitFor(() => {
      expect(hoisted.fetchScaleQuestions).toHaveBeenCalledWith({
        scaleCode: "MBTI",
        formCode: "mbti_144",
        anonId: "anon_take_test",
      });
    });

    await waitFor(() => {
      expect(hoisted.startAttempt).toHaveBeenCalledWith({
        scaleCode: "MBTI",
        formCode: "mbti_144",
        anonId: "anon_take_test",
        share_id: "share-123",
        compare_invite_id: "invite-456",
        invite_unlock_code: "iul_test_001",
        share_click_id: "click-123",
        entrypoint: "share_compare_invite",
        referrer: "https://example.com/en/share/share-123",
        landing_path: "/en/share/share-123",
        utm: {
          source: "wechat",
          medium: "organic",
          campaign: "pr07b",
          term: "friends",
          content: "hero",
        },
      });
    });
  });

  it("uses the explicit mbti_93 form when loading questions and starting the attempt", async () => {
    renderClient("mbti_93");

    await waitFor(() => {
      expect(hoisted.fetchScaleQuestions).toHaveBeenCalledWith({
        scaleCode: "MBTI",
        formCode: "mbti_93",
        anonId: "anon_take_test",
      });
    });

    await waitFor(() => {
      expect(hoisted.startAttempt).toHaveBeenCalledWith(expect.objectContaining({
        scaleCode: "MBTI",
        formCode: "mbti_93",
        anonId: "anon_take_test",
      }));
    });
  });

  it("attaches attribution to submitAttempt and redirects MBTI compare submissions to the compare page", async () => {
    renderClient();

    await submitSingleQuestion();

    await waitFor(() => {
      expect(hoisted.submitAttempt).toHaveBeenCalledWith({
        attemptId: "attempt-start-123",
        answers: [
          {
            question_id: "q1",
            code: "OPT_A",
          },
        ],
        durationMs: expect.any(Number),
        anonId: "anon_take_test",
        share_id: "share-123",
        compare_invite_id: "invite-456",
        invite_unlock_code: "iul_test_001",
        share_click_id: "click-123",
        entrypoint: "share_compare_invite",
        referrer: "https://example.com/en/share/share-123",
        landing_path: "/en/share/share-123",
        utm: {
          source: "wechat",
          medium: "organic",
          campaign: "pr07b",
          term: "friends",
          content: "hero",
        },
      });
    });

    await waitFor(() => {
      expect(hoisted.routerPush).toHaveBeenCalledWith("/en/compare/mbti/invite-456");
    });
  });

  it("restarts stale recovery attempts with the same attribution and resubmits with the recovered attempt id", async () => {
    hoisted.startAttempt
      .mockResolvedValueOnce({
        ok: true,
        attempt_id: "attempt-start-123",
        scale_code: "MBTI",
      })
      .mockResolvedValueOnce({
        ok: true,
        attempt_id: "attempt-start-recovered",
        scale_code: "MBTI",
      });
    hoisted.submitAttempt
      .mockRejectedValueOnce(new Error("stale attempt"))
      .mockResolvedValueOnce({
        ok: true,
        attempt_id: "attempt-result-recovered",
      });
    hoisted.recoverStaleAttemptSubmit.mockImplementationOnce(async ({
      startFreshAttempt,
      submitFreshAttempt,
    }: {
      startFreshAttempt: () => Promise<string | null>;
      submitFreshAttempt: (attemptId: string) => Promise<string>;
    }) => {
      const nextAttemptId = await startFreshAttempt();
      const recoveredValue = await submitFreshAttempt(nextAttemptId ?? "");
      return {
        kind: "recovered",
        value: recoveredValue,
      };
    });

    renderClient();
    await submitSingleQuestion();

    await waitFor(() => {
      expect(hoisted.startAttempt).toHaveBeenCalledTimes(2);
    });
    expect(hoisted.startAttempt.mock.calls[1]?.[0]).toMatchObject({
      scaleCode: "MBTI",
      formCode: "mbti_144",
      anonId: "anon_take_test",
      share_id: "share-123",
      compare_invite_id: "invite-456",
      invite_unlock_code: "iul_test_001",
      share_click_id: "click-123",
      entrypoint: "share_compare_invite",
      referrer: "https://example.com/en/share/share-123",
      landing_path: "/en/share/share-123",
    });

    await waitFor(() => {
      expect(hoisted.submitAttempt).toHaveBeenCalledTimes(2);
    });
    expect(hoisted.submitAttempt.mock.calls[1]?.[0]).toMatchObject({
      share_id: "share-123",
      compare_invite_id: "invite-456",
      invite_unlock_code: "iul_test_001",
      share_click_id: "click-123",
      entrypoint: "share_compare_invite",
      referrer: "https://example.com/en/share/share-123",
      landing_path: "/en/share/share-123",
    });
  });

  it("keeps the legacy result redirect when compare_invite_id is absent", async () => {
    hoisted.search = "share_id=share-123&share_click_id=click-123&entrypoint=share_page&landing_path=%2Fen%2Fshare%2Fshare-123&utm_source=wechat&utm_medium=organic&utm_campaign=pr07b";

    renderClient();
    await submitSingleQuestion();

    await waitFor(() => {
      expect(hoisted.routerPush).toHaveBeenCalledWith("/en/result/attempt-result-123");
    });

    const startPayload = hoisted.startAttempt.mock.calls[0]?.[0] as Record<string, unknown>;
    const submitPayload = hoisted.submitAttempt.mock.calls[0]?.[0] as Record<string, unknown>;
    expect(startPayload).not.toHaveProperty("invite_unlock_code");
    expect(submitPayload).not.toHaveProperty("invite_unlock_code");
  });
});

import type { ReactNode } from "react";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import EnneagramTakeClient from "@/app/(localized)/[locale]/tests/[slug]/take/EnneagramTakeClient";

type ChildrenProps = {
  children?: ReactNode;
};

const hoisted = vi.hoisted(() => ({
  pathname: "/en/tests/enneagram-personality-test-nine-types/take",
  search: "",
  routerPush: vi.fn(),
  routerReplace: vi.fn(),
  fetchEnneagramQuestions: vi.fn(),
  startEnneagramAttempt: vi.fn(),
  submitEnneagramAttempt: vi.fn(),
  buildEnneagramSubmitAnswers: vi.fn(({ questionIds, answers }: { questionIds: string[]; answers: Record<string, string> }) =>
    questionIds.map((questionId, index) => ({
      question_id: questionId,
      code: answers[questionId] ?? "",
      question_index: index,
    }))
  ),
  ensureFmTokenReady: vi.fn(async () => "existing" as const),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => hoisted.pathname,
  useSearchParams: () => new URLSearchParams(hoisted.search),
  useRouter: () => ({
    push: hoisted.routerPush,
    replace: hoisted.routerReplace,
  }),
}));

vi.mock("@/components/quiz/QuizShell", () => ({
  QuizShell: ({ children }: ChildrenProps) => <div>{children}</div>,
}));

vi.mock("@/components/quiz/QuizTakeHeaderV2", () => ({
  QuizTakeHeaderV2: ({ showCompletedCount = true }: { showCompletedCount?: boolean }) => (
    <div data-testid="quiz-header" data-show-completed-count={String(showCompletedCount)}>
      header
      {showCompletedCount ? <span>Completed</span> : null}
    </div>
  ),
}));

vi.mock("@/components/quiz/immersive/AdaptiveOptionGroup", () => ({
  AdaptiveOptionGroup: ({ onChange }: { onChange: (code: string) => void }) => (
    <button type="button" onClick={() => onChange("A")}>
      Adaptive option
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
    <button type="button" onClick={() => onChange("2")}>
      Likert option
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
  getOrCreateAnonId: () => "anon_enneagram_take",
  queuePendingAnonLinkAttempt: () => undefined,
}));

vi.mock("@/lib/auth/authRetry", () => ({
  ensureFmTokenReady: hoisted.ensureFmTokenReady,
}));

vi.mock("@/lib/auth/fmToken", () => ({
  isGuestTokenEndpointMissingError: () => false,
  setFmToken: () => undefined,
}));

vi.mock("@/lib/enneagram/api", async () => {
  const actual = await vi.importActual<typeof import("@/lib/enneagram/api")>("@/lib/enneagram/api");

  return {
    ...actual,
    fetchEnneagramQuestions: hoisted.fetchEnneagramQuestions,
    startEnneagramAttempt: hoisted.startEnneagramAttempt,
    submitEnneagramAttempt: hoisted.submitEnneagramAttempt,
    buildEnneagramSubmitAnswers: hoisted.buildEnneagramSubmitAnswers,
  };
});

vi.mock("@/lib/analytics", () => ({
  trackEvent: vi.fn(),
}));

vi.mock("@/lib/i18n/getDict", () => ({
  getDictSync: () => ({
    header: {
      completedPrefix: "Completed",
      completedSuffix: "",
    },
    common: {
      minutes_unit: "min",
    },
    quiz: {
      estimatedTimeLabel: "Estimated time",
      immersive: {
        backToDetails: "Back",
        previous: "Previous",
        submitRetry: "Retry submit",
        noOptions: "No options",
        submitPhases: ["Saving", "Analyzing", "Generating"],
      },
    },
  }),
}));

vi.mock("@/lib/observability/httpError", () => ({
  classifyApiError: vi.fn(() => ({
    statusGroup: "5xx",
    statusCode: 500,
    errorCode: "TEST_ERROR",
  })),
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
  resolveStaleDraftResetMessage: () => "Draft reset required.",
  shouldBlockInvalidDraftOnTakePage: () => false,
}));

function likertResponse() {
  return {
    ok: true,
    scale_code: "ENNEAGRAM",
    form_code: "enneagram_likert_105",
    questions: {
      items: [
        {
          question_id: "1",
          order: 1,
          text: "I pursue high standards.",
          scoring_mode: "likert_weighted",
          options: [
            { code: "-2", text: "Strongly disagree" },
            { code: "-1", text: "Disagree" },
            { code: "0", text: "Neutral" },
            { code: "1", text: "Agree" },
            { code: "2", text: "Strongly agree" },
          ],
        },
      ],
    },
  };
}

function forcedChoiceResponse() {
  return {
    ok: true,
    scale_code: "ENNEAGRAM",
    form_code: "enneagram_forced_choice_144",
    questions: {
      items: [
        {
          question_id: "1",
          order: 1,
          text: "",
          scoring_mode: "forced_choice_pair",
          options: [
            { code: "A", text: "I notice what can be improved." },
            { code: "B", text: "I consider what could go wrong." },
          ],
        },
      ],
    },
  };
}

async function waitForQuestion(text: string) {
  await waitFor(() => {
    expect(screen.getByText(text)).toBeInTheDocument();
  });
}

describe("enneagram take flow contract", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();
    hoisted.search = "";
    hoisted.pathname = "/en/tests/enneagram-personality-test-nine-types/take";
    hoisted.routerPush.mockClear();
    hoisted.routerReplace.mockClear();
    hoisted.startEnneagramAttempt.mockResolvedValue({
      ok: true,
      attempt_id: "attempt_enneagram_take",
      scale_code: "ENNEAGRAM",
      form_code: "enneagram_likert_105",
    });
    hoisted.submitEnneagramAttempt.mockResolvedValue({
      ok: true,
      attempt_id: "attempt_enneagram_take",
    });
  });

  it("runs the 105 Likert form through question load, start, submit, and result redirect", async () => {
    hoisted.fetchEnneagramQuestions.mockResolvedValue(likertResponse());

    render(
      <EnneagramTakeClient
        slug="enneagram-personality-test-nine-types"
        formCode="enneagram_likert_105"
        estimatedMinutes={12}
      />
    );

    await waitForQuestion("I pursue high standards.");
    expect(screen.getByTestId("enneagram-likert-options")).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Likert option" }));
    });

    await waitFor(() => {
      expect(hoisted.fetchEnneagramQuestions).toHaveBeenCalledWith(expect.objectContaining({
        formCode: "enneagram_likert_105",
      }));
      expect(hoisted.startEnneagramAttempt).toHaveBeenCalledWith(expect.objectContaining({
        formCode: "enneagram_likert_105",
      }));
      expect(hoisted.submitEnneagramAttempt).toHaveBeenCalledWith(expect.objectContaining({
        attemptId: "attempt_enneagram_take",
        answers: [{ question_id: "1", code: "2", question_index: 0 }],
      }));
      expect(hoisted.routerPush).toHaveBeenCalledWith("/en/result/attempt_enneagram_take");
    });
  });

  it("runs the 144 forced-choice form as a two-option pair, not a Likert scale", async () => {
    hoisted.search = "form=enneagram_forced_choice_144";
    hoisted.fetchEnneagramQuestions.mockResolvedValue(forcedChoiceResponse());
    hoisted.startEnneagramAttempt.mockResolvedValue({
      ok: true,
      attempt_id: "attempt_enneagram_forced",
      scale_code: "ENNEAGRAM",
      form_code: "enneagram_forced_choice_144",
    });
    hoisted.submitEnneagramAttempt.mockResolvedValue({
      ok: true,
      attempt_id: "attempt_enneagram_forced",
    });

    render(
      <EnneagramTakeClient
        slug="enneagram-personality-test-nine-types"
        formCode="enneagram_forced_choice_144"
        estimatedMinutes={18}
      />
    );

    await waitForQuestion("I notice what can be improved.");
    expect(screen.getByTestId("quiz-header")).toHaveAttribute("data-show-completed-count", "true");
    expect(screen.getByText("Completed")).toBeInTheDocument();
    expect(screen.queryByText(/Forced choice/i)).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Question 1" })).not.toBeInTheDocument();
    expect(screen.getByTestId("enneagram-forced-choice-pair")).toBeInTheDocument();
    expect(screen.queryByTestId("enneagram-likert-options")).not.toBeInTheDocument();

    await act(async () => {
      fireEvent.click(screen.getByRole("radio", { name: "I notice what can be improved." }));
    });

    await waitFor(() => {
      expect(hoisted.fetchEnneagramQuestions).toHaveBeenCalledWith(expect.objectContaining({
        formCode: "enneagram_forced_choice_144",
      }));
      expect(hoisted.startEnneagramAttempt).toHaveBeenCalledWith(expect.objectContaining({
        formCode: "enneagram_forced_choice_144",
      }));
      expect(hoisted.submitEnneagramAttempt).toHaveBeenCalledWith(expect.objectContaining({
        attemptId: "attempt_enneagram_forced",
        answers: [{ question_id: "1", code: "A", question_index: 0 }],
      }));
      expect(hoisted.routerPush).toHaveBeenCalledWith("/en/result/attempt_enneagram_forced");
    });
  });

  it.each([
    ["en", "enneagram_likert_105"],
    ["zh", "enneagram_likert_105"],
    ["en", "enneagram_forced_choice_144"],
    ["zh", "enneagram_forced_choice_144"],
  ])("carries bounded article context into the real take request (%s/%s)", async (locale, formCode) => {
    hoisted.pathname = `/${locale}/tests/enneagram-personality-test-nine-types/take`;
    hoisted.search = new URLSearchParams({
      form: formCode,
      utm_source: "article",
      utm_medium: "content",
      utm_campaign: "enneagram-guide",
      entry_surface: "article_detail_seo_cta",
      source_page_type: "article_detail",
      source_route_family: "article",
      source_slug: "enneagram-workplace-friction-core-motivations",
      content_id: "69",
      target_action: "seo_cta_start_test",
      cta_id: "article_start_test",
      test_slug: "enneagram-personality-test-nine-types",
      target_test_slug: "enneagram-personality-test-nine-types",
      landing_path: `/${locale}/articles/enneagram-workplace-friction-core-motivations`,
      token: "untrusted-query-token",
      subject_key: "private-subject",
    }).toString();
    const forced = formCode === "enneagram_forced_choice_144";
    hoisted.fetchEnneagramQuestions.mockResolvedValue(forced ? forcedChoiceResponse() : likertResponse());
    render(<EnneagramTakeClient slug="enneagram-personality-test-nine-types" formCode={formCode} />);
    await waitForQuestion(forced ? "I notice what can be improved." : "I pursue high standards.");
    await act(async () => {
      fireEvent.click(forced
        ? screen.getByRole("radio", { name: "I notice what can be improved." })
        : screen.getByRole("button", { name: "Likert option" }));
    });
    await waitFor(() => expect(hoisted.startEnneagramAttempt).toHaveBeenCalledTimes(1));
    const request = hoisted.startEnneagramAttempt.mock.calls[0][0];
    expect(request.formCode).toBe(formCode);
    expect(request.meta).toMatchObject({
      slug: "enneagram-personality-test-nine-types",
      form_code: formCode,
      question_mode: forced ? "forced_choice_144" : "likert_105",
      entry_surface: "article_detail_seo_cta",
      source_page_type: "article_detail",
      source_route_family: "article",
      source_slug: "enneagram-workplace-friction-core-motivations",
      content_id: "69",
      target_action: "seo_cta_start_test",
      cta_id: "article_start_test",
      utm_source: "article",
      utm_medium: "content",
      utm_campaign: "enneagram-guide",
      landing_path: `/${locale}/articles/enneagram-workplace-friction-core-motivations`,
    });
    expect(request.attribution).toMatchObject({
      utm: { source: "article", medium: "content", campaign: "enneagram-guide" },
      landing_path: `/${locale}/articles/enneagram-workplace-friction-core-motivations`,
    });
    for (const key of ["token", "subject_key"]) {
      expect(request.meta).not.toHaveProperty(key);
      expect(request.attribution).not.toHaveProperty(key);
    }
  });

  it("starts a direct visit with safe existing fallbacks", async () => {
    hoisted.fetchEnneagramQuestions.mockResolvedValue(likertResponse());
    render(<EnneagramTakeClient slug="enneagram-personality-test-nine-types" formCode="enneagram_likert_105" />);
    await waitForQuestion("I pursue high standards.");
    await act(async () => fireEvent.click(screen.getByRole("button", { name: "Likert option" })));
    await waitFor(() => expect(hoisted.startEnneagramAttempt).toHaveBeenCalledTimes(1));
    const request = hoisted.startEnneagramAttempt.mock.calls[0][0];
    expect(request.meta).toMatchObject({ source_page_type: "tests_take_page", target_action: "start_enneagram_test", test_slug: "enneagram-personality-test-nine-types" });
    expect(request.meta).not.toHaveProperty("source_slug");
    expect(request.meta).not.toHaveProperty("entry_surface");
  });

  it("clears URL auth parameters without using them for Enneagram guest auth", async () => {
    hoisted.search = "form=enneagram_likert_105&token=fm_query_token&fm_token=fm_query_other&auth=Bearer%20query&utm_source=organic";
    hoisted.fetchEnneagramQuestions.mockResolvedValue(likertResponse());

    render(
      <EnneagramTakeClient
        slug="enneagram-personality-test-nine-types"
        formCode="enneagram_likert_105"
        estimatedMinutes={12}
      />
    );

    await waitForQuestion("I pursue high standards.");

    await waitFor(() => {
      expect(hoisted.routerReplace).toHaveBeenCalledWith(
        "/en/tests/enneagram-personality-test-nine-types/take?form=enneagram_likert_105&utm_source=organic",
        { scroll: false }
      );
    });
    expect(hoisted.ensureFmTokenReady).toHaveBeenCalledWith({
      anonId: "anon_enneagram_take",
      locale: "en",
    });
    expect(hoisted.fetchEnneagramQuestions).toHaveBeenCalledWith(expect.objectContaining({
      anonId: "anon_enneagram_take",
      formCode: "enneagram_likert_105",
    }));
  });
});

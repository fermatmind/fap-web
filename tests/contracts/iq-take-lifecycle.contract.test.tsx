import type { ReactNode } from "react";
import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import QuizTakeClient from "@/app/(localized)/[locale]/tests/[slug]/take/QuizTakeClient";
import { IQ_OWNER_ORIGINAL_30_BANK_ID } from "@/lib/iq/constants";

const hoisted = vi.hoisted(() => ({
  pathname: "/en/tests/iq-test-intelligence-quotient-assessment/take",
  search: "",
  routerPush: vi.fn(),
  routerReplace: vi.fn(),
  getIqAttemptQuestion: vi.fn(),
  getIqQuestions: vi.fn(),
  startIqAttempt: vi.fn(),
  submitIqAttempt: vi.fn(),
  fetchScaleQuestions: vi.fn(),
  startAttempt: vi.fn(),
  submitAttempt: vi.fn(),
  trackEvent: vi.fn(),
  captureError: vi.fn(),
  classifyApiError: vi.fn(() => ({
    statusGroup: "5xx",
    statusCode: 500,
    errorCode: "TEST_ERROR",
  })),
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
  QuizShell: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/components/quiz/QuizTakeHeaderV2", () => ({
  QuizTakeHeaderV2: () => <div data-testid="quiz-header">header</div>,
}));

vi.mock("@/components/quiz/immersive/AdaptiveOptionGroup", () => ({
  AdaptiveOptionGroup: () => null,
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
  V2LikertScale: () => null,
}));

vi.mock("@/components/quiz/StaleDraftResetPrompt", () => ({
  StaleDraftResetPrompt: ({ message }: { message: string }) => <div>{message}</div>,
}));

vi.mock("@/lib/anon", () => ({
  getOrCreateAnonId: () => "anon_iq_take_test",
  readPendingAnonLinkAttempts: () => [],
  queuePendingAnonLinkAttempt: () => undefined,
}));

vi.mock("@/lib/auth/authRetry", () => ({
  ensureFmTokenReady: hoisted.ensureFmTokenReady,
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

vi.mock("@/lib/iq/api", async () => {
  const actual = await vi.importActual<typeof import("@/lib/iq/api")>("@/lib/iq/api");
  return {
    ...actual,
    getIqAttemptQuestion: hoisted.getIqAttemptQuestion,
    getIqQuestions: hoisted.getIqQuestions,
    startIqAttempt: hoisted.startIqAttempt,
    submitIqAttempt: hoisted.submitIqAttempt,
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

vi.mock("@/lib/quiz/urlTokenGuard", () => ({
  useConstrainQuizUrlTokens: () => undefined,
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
  recoverStaleAttemptSubmit: vi.fn(async () => ({ kind: "not_recoverable" })),
  resolveStaleDraftResetMessage: () => "Draft reset required.",
  shouldBlockInvalidDraftOnTakePage: () => false,
}));

function buildIqQuestionResponse() {
  return {
    ok: true,
    scale_code: "IQ_INTELLIGENCE_QUOTIENT",
    bank_id: "IQ_SHOWCASE_12_BETA",
    questions: {
      items: [
        {
          item_id: "IQ_ITEM_01",
          order: 1,
          stem: {
            prompt_en: "Find the missing matrix tile.",
            svg: {
              view_box: "0 0 120 80",
              paths: [{ d: "M 5 5 L 115 5 L 115 75 L 5 75 Z", fill: "#f8fafc" }],
            },
          },
          options: ["A", "B", "C", "D", "E", "F"].map((code) => ({
            option_code: code,
            label: code,
            svg: {
              view_box: "0 0 20 20",
              paths: [{ d: "M 2 2 L 18 2 L 18 18 L 2 18 Z", stroke: "#0f172a", stroke_width: 2 }],
            },
          })),
        },
        {
          question_id: "IQ_Q_02",
          order: 2,
          text: "Choose the best continuation.",
          options: ["A", "B", "C", "D", "E"].map((code) => ({
            code,
            text: `Option ${code}`,
            svg: {
              view_box: "0 0 20 20",
              paths: [{ d: "M 2 10 L 18 10", stroke: "#0f172a", stroke_width: 2 }],
            },
          })),
        },
      ],
    },
  };
}

function buildIqAttemptQuestionResponse(index: number) {
  const items = buildIqQuestionResponse().questions.items;

  return {
    ok: true,
    schema_version: "fm.iq.question_delivery.v1",
    attempt_id: "iq-attempt-start-001",
    scale_code: "IQ_INTELLIGENCE_QUOTIENT",
    scale_code_legacy: "IQ_RAVEN",
    bank_id: IQ_OWNER_ORIGINAL_30_BANK_ID,
    form_code: IQ_OWNER_ORIGINAL_30_BANK_ID,
    question_count: items.length,
    delivery: {
      mode: "current_question",
      index,
      window_size: 1,
      has_previous: index > 0,
      has_next: index < items.length - 1,
    },
    questions: {
      items: [items[index]],
    },
    meta: {
      source: "attempt_bound_owner_bank",
      public_payload: true,
    },
  };
}

function renderClient({ formCode }: { formCode?: string } = {}) {
  return render(
    <QuizTakeClient
      slug="iq-test-intelligence-quotient-assessment"
      testTitle="IQ Test"
      scaleCode="IQ_INTELLIGENCE_QUOTIENT"
      formCode={formCode}
      estimatedMinutes={12}
      questionCount={2}
    />
  );
}

function deferredPromise<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return { promise, resolve, reject };
}

describe("IQ take lifecycle contract", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();
    hoisted.pathname = "/en/tests/iq-test-intelligence-quotient-assessment/take";
    hoisted.search = "";
    hoisted.getIqQuestions.mockResolvedValue(buildIqQuestionResponse());
    hoisted.getIqAttemptQuestion.mockImplementation(({ index }: { index: number }) =>
      Promise.resolve(buildIqAttemptQuestionResponse(index))
    );
    hoisted.startIqAttempt.mockResolvedValue({
      ok: true,
      attempt_id: "iq-attempt-start-001",
      scale_code: "IQ_INTELLIGENCE_QUOTIENT",
      question_count: 2,
    });
    hoisted.submitIqAttempt.mockResolvedValue({
      ok: true,
      attempt_id: "iq-result-002",
    });
    hoisted.ensureFmTokenReady.mockResolvedValue("existing");
  });

  it("loads canonical IQ questions and renders the first stem plus options without exposing legacy alias text", async () => {
    renderClient();

    await waitFor(() => {
      expect(hoisted.getIqQuestions).toHaveBeenCalledWith({
        locale: "en",
        anonId: "anon_iq_take_test",
        formCode: undefined,
        bankId: undefined,
      });
    });

    expect(hoisted.fetchScaleQuestions).not.toHaveBeenCalled();
    expect(await screen.findByText("Find the missing matrix tile.")).toBeInTheDocument();
    expect(screen.getByTestId("iq-stem-svg")).toBeInTheDocument();
    expect(screen.getByTestId("iq-option-board-desktop")).toBeInTheDocument();
    expect(screen.queryByText("IQ_RAVEN")).not.toBeInTheDocument();
    expect(screen.queryByText(/¥1\.99|¥5|unlock/i)).not.toBeInTheDocument();
  });

  it("starts the owner-original IQ attempt before fetching the current question", async () => {
    renderClient({ formCode: IQ_OWNER_ORIGINAL_30_BANK_ID });

    await waitFor(() => {
      expect(hoisted.startIqAttempt).toHaveBeenCalledWith(expect.objectContaining({
        scale_code: "IQ_INTELLIGENCE_QUOTIENT",
        anon_id: "anon_iq_take_test",
        locale: "en",
        form_code: IQ_OWNER_ORIGINAL_30_BANK_ID,
        bank_id: IQ_OWNER_ORIGINAL_30_BANK_ID,
      }));
    });

    await waitFor(() => {
      expect(hoisted.getIqAttemptQuestion).toHaveBeenCalledWith({
        attemptId: "iq-attempt-start-001",
        index: 0,
        anonId: "anon_iq_take_test",
        locale: "en",
      });
    });
    expect(hoisted.getIqQuestions).not.toHaveBeenCalled();

    await act(async () => {
      fireEvent.click(
        within(await screen.findByTestId("iq-option-board-desktop")).getByRole("radio", { name: "Option A" })
      );
    });

    expect(hoisted.startIqAttempt).toHaveBeenCalledTimes(1);
  });

  it("renders a loading state while IQ questions are still in flight", async () => {
    const pending = deferredPromise<ReturnType<typeof buildIqQuestionResponse>>();
    hoisted.getIqQuestions.mockReturnValueOnce(pending.promise);

    renderClient();

    expect(screen.getByTestId("iq-take-loading-state")).toHaveTextContent("Loading IQ questions...");
    expect(screen.queryByText("IQ_RAVEN")).not.toBeInTheDocument();

    pending.resolve(buildIqQuestionResponse());

    expect(await screen.findByText("Find the missing matrix tile.")).toBeInTheDocument();
  });

  it("locks rapid selections, fetches the next owner question automatically, and preserves answers when going back", async () => {
    renderClient({ formCode: IQ_OWNER_ORIGINAL_30_BANK_ID });
    const board = within(await screen.findByTestId("iq-option-board-desktop"));
    const optionA = board.getByRole("radio", { name: "Option A" });
    fireEvent.click(optionA);
    fireEvent.click(optionA);
    fireEvent.click(board.getByRole("radio", { name: "Option B" }));
    expect(optionA).toBeDisabled();
    expect(optionA).toHaveAttribute("aria-checked", "true");
    expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();
    await screen.findByText("Choose the best continuation.");
    const deliveredIndexes = hoisted.getIqAttemptQuestion.mock.calls.map(([args]) => args.index);
    expect([...new Set(deliveredIndexes)]).toEqual([0, 1]);
    expect(deliveredIndexes.filter((index) => index === 1)).toHaveLength(1);
    fireEvent.click(screen.getByRole("button", { name: "Previous" }));
    await screen.findByText("Find the missing matrix tile.");
    const returned = within(screen.getByTestId("iq-option-board-desktop"));
    expect(returned.getByRole("radio", { name: "Option A" })).toHaveAttribute("aria-checked", "true");
    fireEvent.click(returned.getByRole("radio", { name: "Option C" }));
    await screen.findByText("Choose the best continuation.");
    fireEvent.click(within(screen.getByTestId("iq-option-board-desktop")).getByRole("radio", { name: "Option B" }));
    await waitFor(() => expect(hoisted.submitIqAttempt).toHaveBeenCalledTimes(1));
    expect(hoisted.submitIqAttempt.mock.calls[0]?.[0]?.answers.map((answer: { option_code: string }) => answer.option_code)).toEqual(["C", "B"]);
  });

  it("keeps a failed automatic submission retryable without losing the final answer", async () => {
    hoisted.submitIqAttempt.mockRejectedValueOnce(new Error("Service unavailable"));
    renderClient();
    fireEvent.click(within(await screen.findByTestId("iq-option-board-desktop")).getByRole("radio", { name: "Option A" }));
    await screen.findByText("Choose the best continuation.");
    fireEvent.click(within(screen.getByTestId("iq-option-board-desktop")).getByRole("radio", { name: "Option B" }));
    await screen.findByTestId("iq-submit-error");
    const retryButton = await screen.findByRole("button", { name: "Retry submit" });
    await waitFor(() => expect(retryButton).toBeEnabled());
    fireEvent.click(retryButton);
    await waitFor(() => expect(hoisted.submitIqAttempt).toHaveBeenCalledTimes(2));
    expect(hoisted.submitIqAttempt.mock.calls[1]?.[0]?.answers).toEqual(hoisted.submitIqAttempt.mock.calls[0]?.[0]?.answers);
  });

  it("prefetches one question ahead and keeps the answered card visible while a slow delivery is pending", async () => {
    const nextQuestion = deferredPromise<ReturnType<typeof buildIqAttemptQuestionResponse>>();
    hoisted.getIqAttemptQuestion.mockImplementation(({ index }: { index: number }) =>
      index === 1 ? nextQuestion.promise : Promise.resolve(buildIqAttemptQuestionResponse(index))
    );
    renderClient({ formCode: IQ_OWNER_ORIGINAL_30_BANK_ID });
    await screen.findByText("Find the missing matrix tile.");
    await waitFor(() => expect(hoisted.getIqAttemptQuestion).toHaveBeenCalledWith(expect.objectContaining({ index: 1 })));
    fireEvent.click(within(screen.getByTestId("iq-option-board-desktop")).getByRole("radio", { name: "Option A" }));
    await act(async () => { await new Promise((resolve) => setTimeout(resolve, 250)); });
    expect(screen.getByText("Find the missing matrix tile.")).toBeInTheDocument();
    expect(screen.queryByTestId("iq-take-loading-state")).not.toBeInTheDocument();
    expect(within(screen.getByTestId("iq-option-board-desktop")).getByRole("radio", { name: "Option A" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();
    expect(hoisted.getIqAttemptQuestion.mock.calls.filter(([args]) => args.index === 1)).toHaveLength(1);
    await act(async () => { nextQuestion.resolve(buildIqAttemptQuestionResponse(1)); });
    await screen.findByText("Choose the best continuation.");
    expect(within(screen.getByTestId("iq-option-board-desktop")).getByRole("radio", { name: "Option B" })).toBeEnabled();
  });

  it("preserves the current answer when next-question delivery fails and retries without a full-page reset", async () => {
    const nextQuestion = deferredPromise<ReturnType<typeof buildIqAttemptQuestionResponse>>();
    hoisted.getIqAttemptQuestion.mockImplementation(({ index }: { index: number }) =>
      index === 1 ? nextQuestion.promise : Promise.resolve(buildIqAttemptQuestionResponse(index))
    );
    renderClient({ formCode: IQ_OWNER_ORIGINAL_30_BANK_ID });
    fireEvent.click(within(await screen.findByTestId("iq-option-board-desktop")).getByRole("radio", { name: "Option A" }));
    await act(async () => { await new Promise((resolve) => setTimeout(resolve, 250)); });
    await act(async () => { nextQuestion.reject(new Error("Delivery unavailable")); });
    expect(await screen.findByTestId("iq-attempt-error")).toHaveTextContent("Delivery unavailable");
    expect(screen.getByText("Find the missing matrix tile.")).toBeInTheDocument();
    expect(within(screen.getByTestId("iq-option-board-desktop")).getByRole("radio", { name: "Option A" })).toHaveAttribute("aria-checked", "true");
    expect(screen.queryByTestId("iq-take-loading-state")).not.toBeInTheDocument();
    hoisted.getIqAttemptQuestion.mockImplementation(({ index }: { index: number }) => Promise.resolve(buildIqAttemptQuestionResponse(index)));
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    await screen.findByText("Choose the best continuation.");
  });

  it("primes attempt on first selection, advances questions, submits safe IQ answers, and redirects to the localized result path", async () => {
    renderClient();

    const nextButton = await screen.findByRole("button", { name: "Next" });
    expect(nextButton).toBeDisabled();

    fireEvent.click(
      within(screen.getByTestId("iq-option-board-desktop")).getByRole("radio", { name: "Option A" })
    );

    await waitFor(() => {
      expect(hoisted.startIqAttempt).toHaveBeenCalledWith(expect.objectContaining({
        scale_code: "IQ_INTELLIGENCE_QUOTIENT",
        anon_id: "anon_iq_take_test",
        locale: "en",
        source: "take_page",
      }));
    });

    expect(hoisted.startAttempt).not.toHaveBeenCalled();
    expect(await screen.findByText("Choose the best continuation.")).toBeInTheDocument();

    const submitButton = screen.getByRole("button", { name: "Submit" });
    expect(submitButton).toBeDisabled();

    fireEvent.click(
      within(screen.getByTestId("iq-option-board-desktop")).getByRole("radio", { name: "Option B" })
    );

    // Selecting the final answer automatically submits with that answer included.

    await waitFor(() => {
      expect(hoisted.submitIqAttempt).toHaveBeenCalledTimes(1);
    });

    expect(hoisted.submitAttempt).not.toHaveBeenCalled();

    const submitPayload = hoisted.submitIqAttempt.mock.calls[0]?.[0] as {
      attempt_id: string;
      answers: Array<Record<string, unknown>>;
      duration_ms: number;
    };

    expect(submitPayload.attempt_id).toBe("iq-attempt-start-001");
    expect(submitPayload.duration_ms).toEqual(expect.any(Number));
    expect(submitPayload.answers).toEqual([
      {
        item_id: "IQ_ITEM_01",
        option_code: "A",
        question_index: 0,
      },
      {
        question_id: "IQ_Q_02",
        option_code: "B",
        question_index: 1,
      },
    ]);
    expect(JSON.stringify(submitPayload)).not.toContain("correct_answer");
    expect(JSON.stringify(submitPayload)).not.toContain("\"score\"");

    await waitFor(() => {
      expect(hoisted.routerPush).toHaveBeenCalledWith("/en/result/iq-result-002");
    });
  });

  it("shows a safe empty state when no IQ questions are returned", async () => {
    hoisted.getIqQuestions.mockResolvedValueOnce({
      ok: true,
      scale_code: "IQ_INTELLIGENCE_QUOTIENT",
      questions: {
        items: [],
      },
    });

    renderClient();

    expect(await screen.findByTestId("iq-take-empty-state")).toHaveTextContent(
      "No questions are available for this IQ test yet."
    );
  });

  it("shows a submit loading state without exposing any score", async () => {
    const pendingSubmit = deferredPromise<{
      ok: true;
      attempt_id: string;
    }>();
    hoisted.submitIqAttempt.mockReturnValueOnce(pendingSubmit.promise);

    renderClient();

    expect(await screen.findByText("Find the missing matrix tile.")).toBeInTheDocument();

    fireEvent.click(
      within(screen.getByTestId("iq-option-board-desktop")).getByRole("radio", { name: "Option A" })
    );

    await screen.findByText("Choose the best continuation.");

    fireEvent.click(
      within(screen.getByTestId("iq-option-board-desktop")).getByRole("radio", { name: "Option B" })
    );



    expect(await screen.findByRole("button", { name: "Submitting..." })).toBeDisabled();
    expect(screen.queryByText(/score|raw score|iq estimate/i)).not.toBeInTheDocument();

    pendingSubmit.resolve({
      ok: true,
      attempt_id: "iq-result-002",
    });

    await waitFor(() => {
      expect(hoisted.routerPush).toHaveBeenCalledWith("/en/result/iq-result-002");
    });
  });
});

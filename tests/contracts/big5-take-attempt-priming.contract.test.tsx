import fs from "node:fs";
import path from "node:path";
import type { ReactNode } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Big5TakeClient from "@/app/(localized)/[locale]/tests/[slug]/take/Big5TakeClient";
import { useBig5AttemptStore } from "@/lib/big5/attemptStore";

type ChildrenProps = {
  children?: ReactNode;
};

const CONTRACT_RENDER_TIMEOUT_MS = 5_000;

const hoisted = vi.hoisted(() => {
  let cachedSearch = "";
  let cachedSearchParams = new URLSearchParams();
  const state = {
    pathname: "/en/tests/big-five-personality-test-ocean-model/take",
    search: "form=big5_90",
    routerPush: vi.fn(),
    routerReplace: vi.fn(),
    fetchBig5Lookup: vi.fn(),
    fetchBig5Questions: vi.fn(),
    startBig5Attempt: vi.fn(),
    submitBig5Attempt: vi.fn(),
    recoverStaleAttemptSubmit: vi.fn(),
    trackEvent: vi.fn(),
    trackBig5Event: vi.fn(),
    classifyApiError: vi.fn(() => ({
      statusGroup: "5xx",
      statusCode: 500,
      errorCode: "TEST_ERROR",
    })),
    ensureFmTokenReady: vi.fn(async () => "existing" as const),
    getSearchParams: () => {
      if (cachedSearch !== state.search) {
        cachedSearch = state.search;
        cachedSearchParams = new URLSearchParams(state.search);
      }

      return cachedSearchParams;
    },
  };

  return state;
});

vi.mock("next/navigation", () => ({
  usePathname: () => hoisted.pathname,
  useSearchParams: () => hoisted.getSearchParams(),
  useRouter: () => ({
    push: hoisted.routerPush,
    replace: hoisted.routerReplace,
  }),
}));

vi.mock("@/components/big5/quiz/QuestionCard", () => ({
  QuestionCard: ({
    question,
    onSelect,
  }: {
    question: { question_id: string; text: string };
    onSelect: (questionId: string, code: string) => void;
  }) => (
    <section>
      <h2>{question.text}</h2>
      <button type="button" onClick={() => onSelect(question.question_id, "5")}>
        Answer current
      </button>
    </section>
  ),
}));

vi.mock("@/components/big5/quiz/QuestionNavigator", () => ({
  QuestionNavigator: () => <div data-testid="question-navigator" />,
}));

vi.mock("@/components/quiz/immersive/AdaptiveOptionGroup", () => ({
  AdaptiveOptionGroup: () => <div data-testid="adaptive-option-group" />,
}));

vi.mock("@/components/quiz/immersive/ImmersiveTakeLayout", () => ({
  ImmersiveTakeLayout: ({ children, footerSlot }: ChildrenProps & { footerSlot?: ReactNode }) => (
    <div>
      {children}
      {footerSlot}
    </div>
  ),
}));

vi.mock("@/components/quiz/immersive/SubmitPhaseOverlay", () => ({
  SubmitPhaseOverlay: () => null,
}));

vi.mock("@/components/quiz/immersive/useAutoAdvanceFlow", () => ({
  useAutoAdvanceFlow: () => ({
    transitionDirection: "forward",
    isTransitioning: false,
    selectAndAdvance: (applySelection: () => void) => applySelection(),
    goPrevious: () => undefined,
    cancelPending: () => undefined,
  }),
}));

vi.mock("@/components/quiz/matrix/MatrixProgressHeader", () => ({
  MatrixProgressHeader: ({ status }: { status: string }) => <div>{status}</div>,
}));

vi.mock("@/components/quiz/StaleDraftResetPrompt", () => ({
  StaleDraftResetPrompt: ({ message }: { message: string }) => <div data-testid="stale-reset">{message}</div>,
}));

vi.mock("@/lib/anon", () => ({
  getOrCreateAnonId: () => "anon_big5_take",
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

vi.mock("@/lib/big5/api", () => ({
  fetchBig5Lookup: hoisted.fetchBig5Lookup,
  fetchBig5Questions: hoisted.fetchBig5Questions,
  resolveBig5RolloutState: () => ({
    enabledInProd: true,
    paywallMode: "full",
  }),
  startBig5Attempt: hoisted.startBig5Attempt,
  submitBig5Attempt: hoisted.submitBig5Attempt,
}));

vi.mock("@/lib/big5/analytics", () => ({
  buildBig5TrackingContext: async () => ({
    scale_code: "BIG5_OCEAN",
    pack_version: "v1",
    manifest_hash: "manifest_v1",
    norms_version: "2026Q1",
    quality_level: "A",
    locked: true,
    variant: "free",
    sku_id: "",
    locale: "en",
  }),
  trackBig5Event: hoisted.trackBig5Event,
}));

vi.mock("@/lib/analytics", () => ({
  trackEvent: hoisted.trackEvent,
}));

vi.mock("@/lib/i18n/getDict", () => ({
  getDictSync: () => ({
    header: {
      brand: "FAP",
    },
    quiz: {
      milestoneHints: [],
      immersive: {
        backToLanding: "Back",
        previous: "Previous",
        submitRetry: "Retry submit",
        noOptions: "No options",
        submitPhases: ["Saving", "Analyzing", "Generating"],
      },
      big5Retake: {
        forms: {
          big5_120: "Big Five 120-question Full Edition",
          big5_90: "Big Five 90-question Standard Edition",
        },
      },
    },
  }),
}));

vi.mock("@/lib/observability/httpError", () => ({
  classifyApiError: hoisted.classifyApiError,
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

vi.mock("@/lib/attempt/staleAttempt", async () => {
  const actual = await vi.importActual<typeof import("@/lib/attempt/staleAttempt")>("@/lib/attempt/staleAttempt");

  return {
    ...actual,
    createTakeFlowController: () => ({
      beginRun: () => 1,
      isActive: () => true,
      cancelCurrentRun: () => undefined,
      schedule: () => 0,
      wait: async () => true,
      dispose: () => undefined,
    }),
    recoverStaleAttemptSubmit: hoisted.recoverStaleAttemptSubmit,
    resolveStaleDraftResetMessage: () => "Draft reset required.",
  };
});

function buildQuestions(count: number) {
  return Array.from({ length: count }, (_, index) => ({
    question_id: `bq${index + 1}`,
    order: index + 1,
    text: `Big Five question ${index + 1}`,
    options: [
      { code: "1", text: "Strongly disagree" },
      { code: "2", text: "Disagree" },
      { code: "3", text: "Neutral" },
      { code: "4", text: "Agree" },
      { code: "5", text: "Strongly agree" },
    ],
  }));
}

function buildQuestionResponse(count = 3) {
  return {
    ok: true,
    scale_code: "BIG5_OCEAN",
    pack_id: "BIG5_OCEAN",
    dir_version: "v1",
    content_package_version: "v1",
    manifest_hash: "manifest_v1",
    questions: {
      schema: "fap.questions.v1",
      items: buildQuestions(count),
    },
    meta: {
      disclaimer_version: "BIG5_OCEAN_v1",
      disclaimer_hash: "hash_v1",
      manifest_hash: "manifest_v1",
      norms_version: "2026Q1",
      quality_level: "A",
    },
  };
}

function renderClient(formCode = "big5_90", search = `form=${formCode}`) {
  hoisted.search = search;

  return render(
    <Big5TakeClient
      slug="big-five-personality-test-ocean-model"
      formCode={formCode}
      estimatedMinutes={15}
    />
  );
}

function readBig5TakeClientSource(): string {
  return fs.readFileSync(
    path.join(process.cwd(), "app/(localized)/[locale]/tests/[slug]/take/Big5TakeClient.tsx"),
    "utf8"
  );
}

async function waitForFirstQuestion() {
  await waitFor(() => {
    expect(screen.getByText("Big Five question 1")).toBeInTheDocument();
  }, {
    timeout: CONTRACT_RENDER_TIMEOUT_MS,
  });
  await waitFor(() => {
    expect(screen.getByRole("button", { name: "Answer current" })).toBeInTheDocument();
  }, {
    timeout: CONTRACT_RENDER_TIMEOUT_MS,
  });
}

async function waitForBig5ConsentGate() {
  await waitFor(() => {
    expect(screen.getByRole("button", { name: "Agree and start" })).toBeInTheDocument();
  });
  expect(screen.getByLabelText("I have read and agree to the disclaimer.")).toBeInTheDocument();
}

async function acceptBig5DisclaimerGate() {
  await waitForBig5ConsentGate();
  fireEvent.click(screen.getByLabelText("I have read and agree to the disclaimer."));
  let clicked = false;
  await waitFor(() => {
    const startButton = screen.getByRole("button", { name: "Agree and start" });
    expect(startButton).not.toBeDisabled();
    if (!clicked) {
      clicked = true;
      fireEvent.click(startButton);
    }
  });
  await waitForFirstQuestion();
}

describe("Big Five take attempt priming", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();
    useBig5AttemptStore.getState().resetAll();
    hoisted.pathname = "/en/tests/big-five-personality-test-ocean-model/take";
    hoisted.search = "form=big5_90";
    hoisted.fetchBig5Lookup.mockResolvedValue({
      ok: true,
      capabilities: {
        enabled_in_prod: true,
        paywall_mode: "full",
      },
    });
    hoisted.fetchBig5Questions.mockResolvedValue(buildQuestionResponse());
    hoisted.startBig5Attempt.mockResolvedValue({
      ok: true,
      attempt_id: "attempt-big5-start-001",
      resume_token: "resume-big5-start-001",
    });
    hoisted.submitBig5Attempt.mockResolvedValue({
      ok: true,
      attempt_id: "attempt-big5-start-001",
    });
    hoisted.recoverStaleAttemptSubmit.mockResolvedValue({
      kind: "ignored",
    });
  });

  afterEach(() => {
    useBig5AttemptStore.getState().resetAll();
    window.localStorage.clear();
  });

  it("primes a Big Five server attempt on the first answer using the active 90Q form", async () => {
    renderClient("big5_90");

    await waitForBig5ConsentGate();
    expect(screen.queryByText("Big Five question 1")).toBeNull();
    expect(hoisted.startBig5Attempt).not.toHaveBeenCalled();

    await acceptBig5DisclaimerGate();

    expect(hoisted.startBig5Attempt).not.toHaveBeenCalled();

    fireEvent.click(await screen.findByRole("button", { name: "Answer current" }));

    await waitFor(() => {
      expect(hoisted.startBig5Attempt).toHaveBeenCalledTimes(1);
    });
    expect(hoisted.startBig5Attempt).toHaveBeenCalledWith(expect.objectContaining({
      anonId: "anon_big5_take",
      formCode: "big5_90",
      region: "GLOBAL",
      clientVersion: "fe-big5-2",
    }));
    expect(useBig5AttemptStore.getState().attemptId).toBe("attempt-big5-start-001");
    expect(useBig5AttemptStore.getState().resumeToken).toBe("resume-big5-start-001");
    expect(useBig5AttemptStore.getState().formCode).toBe("big5_90");
  });

  it("clears URL auth parameters without using them for Big Five guest auth", async () => {
    const { unmount } = renderClient(
      "big5_90",
      "form=big5_90&token=fm_query_token&fm_token=fm_query_other&authorization=Bearer%20query&utm_source=organic"
    );

    await waitForBig5ConsentGate();

    await waitFor(() => {
      expect(hoisted.routerReplace).toHaveBeenCalledWith(
        "/en/tests/big-five-personality-test-ocean-model/take?form=big5_90&utm_source=organic",
        { scroll: false }
      );
    });
    expect(hoisted.ensureFmTokenReady).toHaveBeenCalledWith({
      anonId: "anon_big5_take",
      locale: "en",
    });
    expect(hoisted.fetchBig5Questions).toHaveBeenCalledWith(expect.objectContaining({
      anonId: "anon_big5_take",
      formCode: "big5_90",
    }));
    expect(useBig5AttemptStore.getState().authToken).toBeNull();
    unmount();
  });

  it("does not show stale reset for a near-complete local-only 90Q draft on entry", async () => {
    hoisted.fetchBig5Questions.mockResolvedValue(buildQuestionResponse(90));
    useBig5AttemptStore.getState().setSessionContext({
      slug: "big-five-personality-test-ocean-model",
      formCode: "big5_90",
      anonId: "anon_big5_take",
    });
    buildQuestions(81).forEach((question) => {
      useBig5AttemptStore.getState().setAnswer(question.question_id, "4");
    });

    renderClient("big5_90");

    await waitForBig5ConsentGate();

    expect(screen.queryByTestId("stale-reset")).toBeNull();
    expect(screen.queryByText("Draft reset required.")).toBeNull();
  });

  it("keeps stale reset driven by submit recovery instead of take-page entry heuristics", () => {
    const source = readBig5TakeClientSource();

    expect(source).not.toContain("shouldBlockInvalidDraftOnTakePage");
    expect(source).toContain('if (recovery.kind === "failed")');
    expect(source).toContain("setStaleDraftError(message)");
  });
});

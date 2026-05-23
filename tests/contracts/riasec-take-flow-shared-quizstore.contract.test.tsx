import type { ReactNode } from "react";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import QuizTakeClient from "@/app/(localized)/[locale]/tests/[slug]/take/QuizTakeClient";
import { createQuizStore } from "@/lib/quiz/store";

const hoisted = vi.hoisted(() => ({
  pathname: "/zh/tests/holland-career-interest-test-riasec/take",
  search: "form=riasec_140&utm_source=seo&source_page_type=article_detail&target_action=seo_cta_start_test&target_test_slug=holland-career-interest-test-riasec&landing_path=%2Fzh%2Fresearch%2Friasec-careers%3Futm_source%3Dseo%26utm_campaign%3Driasec%26email%3Dperson%2540example.com%26phone%3D13800138000%26name%3DRainie%2520Li&email=person%40example.com",
  routerPush: vi.fn(),
  routerReplace: vi.fn(),
  fetchScaleQuestions: vi.fn(),
  startAttempt: vi.fn(),
  submitAttempt: vi.fn(),
  trackEvent: vi.fn(),
  trackObservableFunnelEvent: vi.fn(),
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
  QuizTakeHeaderV2: ({ brand, answered, total }: { brand: string; answered: number; total: number }) => (
    <div data-testid="quiz-header" data-answered={answered} data-total={total}>
      {brand}
    </div>
  ),
}));

vi.mock("@/components/quiz/iq/IqOptionBoard", () => ({
  IqOptionBoard: () => <div>iq-board</div>,
}));

vi.mock("@/components/quiz/iq/IqStemSvg", () => ({
  IqStemSvg: () => null,
}));

vi.mock("@/components/quiz/immersive/AdaptiveOptionGroup", () => ({
  AdaptiveOptionGroup: ({ questionId, onChange }: { questionId: string; onChange: (code: string) => void }) => (
    <button type="button" onClick={() => onChange("5")}>
      Choose {questionId}
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
  V2LikertScale: ({ questionId, onChange }: { questionId: string; onChange: (code: string) => void }) => (
    <button type="button" onClick={() => onChange("5")}>
      Choose {questionId}
    </button>
  ),
}));

vi.mock("@/components/quiz/immersive/useAutoAdvanceFlow", () => ({
  useAutoAdvanceFlow: ({
    currentIndex,
    total,
    onMove,
    onLast,
  }: {
    currentIndex: number;
    total: number;
    onMove: (index: number) => void;
    onLast: (context?: { questionId: string; code: string }) => Promise<string | null> | void;
  }) => ({
    transitionDirection: "forward",
    isTransitioning: false,
    selectAndAdvance: (
      applySelection: () => void,
      context?: { questionId: string; code: string }
    ) => {
      applySelection();
      if (currentIndex >= total - 1) {
        void onLast(context);
      } else {
        onMove(currentIndex + 1);
      }
    },
    goPrevious: () => {
      onMove(Math.max(currentIndex - 1, 0));
    },
    goNext: () => {
      onMove(Math.min(currentIndex + 1, Math.max(total - 1, 0)));
    },
    cancelPending: () => undefined,
  }),
}));

vi.mock("@/components/quiz/StaleDraftResetPrompt", () => ({
  StaleDraftResetPrompt: ({ message }: { message: string }) => <div>{message}</div>,
}));

vi.mock("@/lib/anon", () => ({
  getOrCreateAnonId: () => "anon_riasec_take_test",
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

vi.mock("@/lib/analytics", () => ({
  trackEvent: hoisted.trackEvent,
  trackObservableFunnelEvent: hoisted.trackObservableFunnelEvent,
}));

vi.mock("@/lib/i18n/getDict", () => ({
  getDictSync: () => ({
    header: {
      brand: "FAP",
      completedPrefix: "已有",
      completedSuffix: "人完成测评",
    },
    common: {
      minutes_unit: "分钟",
    },
    quiz: {
      estimatedTimeLabel: "预计用时",
      answerTip: "选择最符合你的选项。",
      milestoneHints: [],
      immersive: {
        backToDetails: "返回详情",
        previous: "上一题",
        submitRetry: "重试提交",
        noOptions: "暂无选项",
        submitPhases: ["保存中", "分析中", "生成中"],
      },
      iq: {
        pickPrompt: "请选择",
        submit: "提交",
        next: "下一题",
        selectHint: "请选择一项",
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

function buildRiasecQuestionResponse() {
  return {
    ok: true,
    scale_code: "RIASEC",
    questions: {
      items: [
        {
          question_id: "riasec-q1",
          order: 1,
          text_en: "RIASEC Q1",
          text_zh: "RIASEC 第 1 题",
          options: ["1", "2", "3", "4", "5"].map((code) => ({
            code,
            text_en: `Option ${code}`,
            text_zh: `选项 ${code}`,
          })),
        },
        {
          question_id: "riasec-q2",
          order: 2,
          text_en: "RIASEC Q2",
          text_zh: "RIASEC 第 2 题",
          options: ["1", "2", "3", "4", "5"].map((code) => ({
            code,
            text_en: `Option ${code}`,
            text_zh: `选项 ${code}`,
          })),
        },
      ],
    },
  };
}

function renderClient(formCode = "riasec_140") {
  return render(
    <QuizTakeClient
      slug="holland-career-interest-test-riasec"
      testTitle="霍兰德职业兴趣测试"
      scaleCode="RIASEC"
      formCode={formCode}
      estimatedMinutes={18}
      questionCount={formCode === "riasec_140" ? 140 : 60}
    />
  );
}

async function answerCurrent(questionId: string) {
  const button = await screen.findByRole("button", { name: `Choose ${questionId}` });
  await act(async () => {
    fireEvent.click(button);
  });
}

describe("RIASEC shared QuizStore take flow contract", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();
    hoisted.pathname = "/zh/tests/holland-career-interest-test-riasec/take";
    hoisted.search = "form=riasec_140&utm_source=seo&source_page_type=article_detail&target_action=seo_cta_start_test&target_test_slug=holland-career-interest-test-riasec&landing_path=%2Fzh%2Fresearch%2Friasec-careers%3Futm_source%3Dseo%26utm_campaign%3Driasec%26email%3Dperson%2540example.com%26phone%3D13800138000%26name%3DRainie%2520Li&email=person%40example.com";
    hoisted.fetchScaleQuestions.mockResolvedValue(buildRiasecQuestionResponse());
    hoisted.startAttempt.mockResolvedValue({
      ok: true,
      attempt_id: "attempt-start-riasec-140",
      scale_code: "RIASEC",
      form_code: "riasec_140",
    });
    hoisted.submitAttempt.mockResolvedValue({
      ok: true,
      attempt_id: "attempt-result-riasec-140",
    });
    hoisted.ensureFmTokenReady.mockResolvedValue("existing");
  });

  afterEach(() => {
    cleanup();
  });

  it("loads and submits RIASEC through shared QuizStore without losing riasec_140", async () => {
    renderClient("riasec_140");

    expect(await screen.findByText("RIASEC 第 1 题")).toBeInTheDocument();
    expect(screen.getByTestId("quiz-header")).toHaveTextContent("霍兰德职业兴趣测试");

    await answerCurrent("riasec-q1");
    expect(await screen.findByText("RIASEC 第 2 题")).toBeInTheDocument();
    await answerCurrent("riasec-q2");

    await waitFor(() => {
      expect(hoisted.fetchScaleQuestions).toHaveBeenCalledWith({
        scaleCode: "RIASEC",
        formCode: "riasec_140",
        anonId: "anon_riasec_take_test",
        locale: "zh-CN",
      });
      expect(hoisted.startAttempt).toHaveBeenCalledWith(expect.objectContaining({
        scaleCode: "RIASEC",
        formCode: "riasec_140",
        anonId: "anon_riasec_take_test",
        locale: "zh-CN",
        clientPlatform: "web",
        channel: "web",
      }));
      expect(hoisted.submitAttempt).toHaveBeenCalledWith(expect.objectContaining({
        attemptId: "attempt-start-riasec-140",
        anonId: "anon_riasec_take_test",
        answers: [
          { question_id: "riasec-q1", code: "5", question_index: 0 },
          { question_id: "riasec-q2", code: "5", question_index: 1 },
        ],
      }));
    });

    await waitFor(() => {
      expect(hoisted.routerPush).toHaveBeenCalledWith("/zh/result/attempt-result-riasec-140");
    });
  });

  it("recovers a RIASEC draft after reload using the form-specific QuizStore key", async () => {
    const draftStore = createQuizStore({
      slug: "holland-career-interest-test-riasec",
      anonId: "anon_riasec_take_test",
      formCode: "riasec_60",
    });
    draftStore.getState().setAnswer("riasec-q1", "5");
    draftStore.getState().jump(1, 2);
    draftStore.getState().setAttemptMeta("attempt-draft-riasec-60", "RIASEC", "riasec_60");

    renderClient("riasec_60");

    expect(await screen.findByText("RIASEC 第 2 题")).toBeInTheDocument();
    expect(screen.getByTestId("quiz-header")).toHaveAttribute("data-answered", "1");
    const storageKeys = Object.keys(window.localStorage);
    expect(storageKeys.some((key) => key.includes("holland-career-interest-test-riasec") && key.includes("riasec_60"))).toBe(true);
  });

  it("emits safe observable RIASEC start and submit tracking with SEO attribution only", async () => {
    const safeLandingPath = "/zh/research/riasec-careers?utm_source=seo&utm_campaign=riasec";

    renderClient("riasec_140");

    await answerCurrent("riasec-q1");
    await answerCurrent("riasec-q2");

    await waitFor(() => {
      expect(hoisted.trackObservableFunnelEvent).toHaveBeenCalledWith(
        "start_attempt",
        expect.objectContaining({
          slug: "holland-career-interest-test-riasec",
          test_slug: "holland-career-interest-test-riasec",
          scale_code: "RIASEC",
          form_code: "riasec_140",
          attempt_id: "attempt-start-riasec-140",
          source_page_type: "article_detail",
          target_action: "seo_cta_start_test",
          target_test_slug: "holland-career-interest-test-riasec",
          landing_path: safeLandingPath,
          locale: "zh",
        })
      );
      expect(hoisted.trackObservableFunnelEvent).toHaveBeenCalledWith(
        "submit_attempt",
        expect.objectContaining({
          scale_code: "RIASEC",
          form_code: "riasec_140",
          attempt_id: "attempt-result-riasec-140",
          answered_count: 2,
          landing_path: safeLandingPath,
          locale: "zh",
        })
      );
    });

    expect(hoisted.startAttempt).toHaveBeenCalledWith(expect.objectContaining({
      landing_path: safeLandingPath,
      meta: expect.objectContaining({
        landing_path: safeLandingPath,
      }),
    }));
    expect(hoisted.submitAttempt).toHaveBeenCalledWith(expect.objectContaining({
      landing_path: safeLandingPath,
    }));

    const serializedPayloads = JSON.stringify([
      hoisted.startAttempt.mock.calls,
      hoisted.submitAttempt.mock.calls,
      hoisted.trackObservableFunnelEvent.mock.calls,
    ]);
    expect(serializedPayloads).not.toContain("person@example.com");
    expect(serializedPayloads).not.toContain("person%40example.com");
    expect(serializedPayloads).not.toContain("13800138000");
    expect(serializedPayloads).not.toContain("Rainie");
    expect(serializedPayloads).not.toContain("raw_score");
  });
});
